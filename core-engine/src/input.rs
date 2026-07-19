use windows::{
    core::*,
    Win32::Foundation::*,
    Win32::Graphics::Direct3D::*,
    Win32::Graphics::Direct3D11::*,
    Win32::Graphics::Dxgi::*,
    Win32::Graphics::Dxgi::Common::*,
    Win32::System::Com::*,
};
use enigo::{Enigo, Mouse, Coordinate, Button, Direction};
use std::error::Error;

pub struct ScreenCapturer {
    device: ID3D11Device,
    context: ID3D11DeviceContext,
    duplication: IDXGIOutputDuplication,
    staging_texture: Option<ID3D11Texture2D>,
    pub width: u32,
    pub height: u32,
}

impl ScreenCapturer {
    pub fn new() -> std::result::Result<Self, Box<dyn Error>> {
        unsafe {
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
            let feature_levels = [D3D_FEATURE_LEVEL_11_1, D3D_FEATURE_LEVEL_11_0];
            let mut device: Option<ID3D11Device> = None;
            let mut context: Option<ID3D11DeviceContext> = None;
            let mut feature_level = D3D_FEATURE_LEVEL_11_1;
            
            D3D11CreateDevice(
                None,
                D3D_DRIVER_TYPE_HARDWARE,
                HMODULE::default(),
                D3D11_CREATE_DEVICE_BGRA_SUPPORT,
                Some(&feature_levels),
                D3D11_SDK_VERSION,
                Some(&mut device),
                Some(&mut feature_level),
                Some(&mut context),
            )?;
            
            let device = device.ok_or("Failed to create D3D11 Device")?;
            let context = context.ok_or("Failed to create D3D11 Context")?;
            
            let dxgi_device: IDXGIDevice = device.cast()?;
            let adapter = dxgi_device.GetAdapter()?;
            let output = adapter.EnumOutputs(0)?;
            let output1: IDXGIOutput1 = output.cast()?;
            
            let desc = output.GetDesc()?;
            let width = (desc.DesktopCoordinates.right - desc.DesktopCoordinates.left) as u32;
            let height = (desc.DesktopCoordinates.bottom - desc.DesktopCoordinates.top) as u32;

            let duplication = output1.DuplicateOutput(&device)?;
            
            println!("Successfully initialized DXGI Desktop Duplication on primary monitor ({}x{})!", width, height);
            
            Ok(Self {
                device,
                context,
                duplication,
                staging_texture: None,
                width,
                height,
            })
        }
    }

    pub fn capture_frame(&mut self) -> std::result::Result<Vec<u8>, Box<dyn Error>> {
        unsafe {
            let mut frame_info = DXGI_OUTDUPL_FRAME_INFO::default();
            let mut resource: Option<IDXGIResource> = None;
            
            // Wait up to 10ms for a new frame
            let hr = self.duplication.AcquireNextFrame(10, &mut frame_info, &mut resource);
            
            if hr.is_err() {
                let err = hr.unwrap_err();
                // DXGI_ERROR_WAIT_TIMEOUT is 0x887A0027
                if err.code() == windows::core::HRESULT(0x887A0027u32 as i32) {
                    return Ok(Vec::new()); // No new frame yet, this is normal
                }
                return Err(err.into());
            }

            let resource = resource.ok_or("Failed to acquire DXGI resource")?;
            let texture: ID3D11Texture2D = resource.cast()?;
            
            // Ensure staging texture exists
            if self.staging_texture.is_none() {
                let mut desc = D3D11_TEXTURE2D_DESC::default();
                texture.GetDesc(&mut desc);
                
                desc.Usage = D3D11_USAGE_STAGING;
                desc.BindFlags = 0;
                desc.CPUAccessFlags = D3D11_CPU_ACCESS_READ.0 as u32;
                desc.MiscFlags = 0;
                
                let mut staging_texture: Option<ID3D11Texture2D> = None;
                self.device.CreateTexture2D(&desc, None, Some(&mut staging_texture))?;
                self.staging_texture = staging_texture;
            }
            
            let staging = self.staging_texture.as_ref().unwrap();
            
            // Copy GPU texture to CPU-accessible staging texture
            self.context.CopyResource(staging, &texture);
            
            // Map the staging texture
            let mut mapped = D3D11_MAPPED_SUBRESOURCE::default();
            self.context.Map(staging, 0, D3D11_MAP_READ, 0, Some(&mut mapped))?;
            
            let mut bgra_data = vec![0u8; (self.width * self.height * 4) as usize];
            let src_ptr = mapped.pData as *const u8;
            let src_pitch = mapped.RowPitch as usize;
            let dst_pitch = (self.width * 4) as usize;
            
            for y in 0..self.height as usize {
                std::ptr::copy_nonoverlapping(
                    src_ptr.add(y * src_pitch),
                    bgra_data.as_mut_ptr().add(y * dst_pitch),
                    dst_pitch
                );
            }
            
            self.context.Unmap(staging, 0);
            self.duplication.ReleaseFrame()?;
            
            Ok(bgra_data)
        }
    }
}

pub fn create_enigo() -> std::result::Result<Enigo, Box<dyn Error>> {
    Enigo::new(&enigo::Settings::default()).map_err(|e| Box::new(e) as Box<dyn Error>)
}
