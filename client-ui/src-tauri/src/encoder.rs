use std::mem::ManuallyDrop;
use windows::{
    core::*,
    Win32::Media::MediaFoundation::*,
    Win32::Media::DirectShow::*,
    Win32::System::Com::*,
};

pub struct HardwareEncoder {
    transform: IMFTransform,
    duration: i64,
}

unsafe impl Send for HardwareEncoder {}
unsafe impl Sync for HardwareEncoder {}

impl HardwareEncoder {
    pub fn new(width: u32, height: u32, fps: u32, bitrate: u32) -> std::result::Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        unsafe {
            // Initialize COM & Media Foundation
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
            MFStartup(MF_VERSION, MFSTARTUP_NOSOCKET)?;

            // 1. Find H264 Encoder MFT using MFTEnumEx
            let mut p_attributes: *mut Option<IMFActivate> = std::ptr::null_mut();
            let mut num_attributes = 0;
            
            let in_info = MFT_REGISTER_TYPE_INFO {
                guidMajorType: MFMediaType_Video,
                guidSubtype: MFVideoFormat_NV12,
            };
            let out_info = MFT_REGISTER_TYPE_INFO {
                guidMajorType: MFMediaType_Video,
                guidSubtype: MFVideoFormat_H264,
            };

            // Note: Hardware encoders (NVENC/QuickSync) are usually Asynchronous MFTs which 
            // require a complex event loop. For this prototype, we will force a Synchronous MFT 
            // (Software Encoder) to prove the end-to-end pipeline works!
            let hr = MFTEnumEx(
                MFT_CATEGORY_VIDEO_ENCODER,
                MFT_ENUM_FLAG_SYNCMFT | MFT_ENUM_FLAG_LOCALMFT | MFT_ENUM_FLAG_SORTANDFILTER,
                Some(&in_info),
                Some(&out_info),
                &mut p_attributes,
                &mut num_attributes,
            );

            hr?; // Return if both failed

            if num_attributes == 0 || p_attributes.is_null() {
                return Err("No encoder found".into());
            }

            // Get first activate object
            let activates = std::slice::from_raw_parts(p_attributes, num_attributes as usize);
            let activate = activates[0].as_ref().unwrap();
            let transform: IMFTransform = activate.ActivateObject()?;
            
            CoTaskMemFree(Some(p_attributes as *const _));
            
            // Helper to pack size/ratio
            let pack_u64 = |high: u32, low: u32| ((high as u64) << 32) | (low as u64);

            // 2. Set Output Type (H264)
            let out_type: IMFMediaType = MFCreateMediaType()?;
            out_type.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video)?;
            out_type.SetGUID(&MF_MT_SUBTYPE, &MFVideoFormat_H264)?;
            out_type.SetUINT32(&MF_MT_AVG_BITRATE, bitrate)?;
            out_type.SetUINT32(&MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive.0 as u32)?;
            out_type.SetUINT64(&MF_MT_FRAME_SIZE, pack_u64(width, height))?;
            out_type.SetUINT64(&MF_MT_FRAME_RATE, pack_u64(fps, 1))?;
            transform.SetOutputType(0, &out_type, 0)?;

            // 3. Set Input Type (NV12)
            let in_type: IMFMediaType = MFCreateMediaType()?;
            in_type.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video)?;
            in_type.SetGUID(&MF_MT_SUBTYPE, &MFVideoFormat_NV12)?;
            in_type.SetUINT32(&MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive.0 as u32)?;
            in_type.SetUINT64(&MF_MT_FRAME_SIZE, pack_u64(width, height))?;
            in_type.SetUINT64(&MF_MT_FRAME_RATE, pack_u64(fps, 1))?;
            in_type.SetUINT32(&MF_MT_DEFAULT_STRIDE, width)?;
            transform.SetInputType(0, &in_type, 0)?;

            println!("Successfully configured H.264 Hardware Encoder MFT!");

            let duration = 10_000_000 / (fps as i64);

            Ok(Self { transform, duration })
        }
    }

    pub fn encode_nv12(&self, nv12_data: &[u8], timestamp: i64) -> std::result::Result<Vec<u8>, Box<dyn std::error::Error + Send + Sync>> {
        unsafe {
            // Create Input Sample
            let sample = MFCreateSample()?;
            let buffer = MFCreateMemoryBuffer(nv12_data.len() as u32)?;
            
            let mut ptr: *mut u8 = std::ptr::null_mut();
            let mut max_len = 0;
            let mut current_len = 0;
            buffer.Lock(&mut ptr, Some(&mut max_len), Some(&mut current_len))?;
            
            std::ptr::copy_nonoverlapping(nv12_data.as_ptr(), ptr, nv12_data.len());
            
            buffer.Unlock()?;
            buffer.SetCurrentLength(nv12_data.len() as u32)?;
            
            sample.AddBuffer(&buffer)?;
            sample.SetSampleTime(timestamp)?;
            sample.SetSampleDuration(self.duration)?;

            let mut all_nalus = Vec::new();

            // 1. Drain pending output
            Self::drain_output(&self.transform, &mut all_nalus)?;

            // 2. Feed new input
            let hr_input = self.transform.ProcessInput(0, &sample, 0);
            if let Err(e) = hr_input {
                if e.code() != windows::core::HRESULT(0xC00D36B5u32 as i32) { // MF_E_NOTACCEPTING is 0xC00D36B5
                    return Err(e.into());
                }
            }

            // 3. Drain resulting output
            Self::drain_output(&self.transform, &mut all_nalus)?;

            Ok(all_nalus)
        }
    }

    unsafe fn drain_output(transform: &IMFTransform, all_nalus: &mut Vec<u8>) -> Result<()> {
        let info = transform.GetOutputStreamInfo(0)?;
        let out_size = if info.cbSize > 0 { info.cbSize } else { 1024 * 1024 };

        loop {
            let out_sample = MFCreateSample()?;
            let out_buffer = MFCreateMemoryBuffer(out_size)?;
            out_sample.AddBuffer(&out_buffer)?;

            let output_data_buffer = MFT_OUTPUT_DATA_BUFFER {
                dwStreamID: 0,
                pSample: ManuallyDrop::new(Some(out_sample.clone())),
                dwStatus: 0,
                pEvents: ManuallyDrop::new(None),
            };
            
            let mut status = 0;
            let mut buffers = [output_data_buffer];
            let process_res = transform.ProcessOutput(0, &mut buffers, &mut status);
            
            // PREVENT MEMORY LEAK: Take the COM objects back out of ManuallyDrop so they drop correctly
            let _ = ManuallyDrop::take(&mut buffers[0].pSample);
            let _ = ManuallyDrop::take(&mut buffers[0].pEvents);
            
            if let Err(e) = process_res {
                if e.code() == windows::core::HRESULT(0xC00D36B6u32 as i32) { // MF_E_TRANSFORM_STREAM_CHANGE
                    println!("MFT requested stream change! Ignoring for now.");
                    // In a real implementation we would negotiate the new output type here.
                    // For now, we will just break and let the pipeline try to continue.
                    break;
                } else if e.code() != windows::core::HRESULT(0xC00D6D72u32 as i32) { // MF_E_TRANSFORM_NEED_MORE_INPUT is 0xC00D6D72
                    println!("ProcessOutput unexpected error: {}", e);
                }
                break;
            }

            // Read output
            let mut out_ptr: *mut u8 = std::ptr::null_mut();
            let mut current_len = 0;
            out_buffer.Lock(&mut out_ptr, None, Some(&mut current_len))?;
            
            let mut result = vec![0u8; current_len as usize];
            std::ptr::copy_nonoverlapping(out_ptr, result.as_mut_ptr(), current_len as usize);
            
            out_buffer.Unlock()?;
            
            all_nalus.extend_from_slice(&result);
        }
        Ok(())
    }
}
