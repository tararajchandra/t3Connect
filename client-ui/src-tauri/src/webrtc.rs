use std::sync::Arc;
use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};
use webrtc::{
    api::{APIBuilder, media_engine::MediaEngine},
    data_channel::data_channel_message::DataChannelMessage,
    peer_connection::{
        configuration::RTCConfiguration,
        sdp::session_description::RTCSessionDescription,
        RTCPeerConnection,
    },
    track::track_local::{track_local_static_sample::TrackLocalStaticSample, TrackLocal},
    ice_transport::{ice_server::RTCIceServer, ice_candidate::RTCIceCandidateInit},
    media::Sample,
};
use serde_json::Value;
use enigo::{Enigo, Mouse, Keyboard, Coordinate, Button, Direction, Key};

fn map_key(k: &str) -> Key {
    match k {
        "Enter" => Key::Return,
        "Backspace" => Key::Backspace,
        "Tab" => Key::Tab,
        "Shift" => Key::Shift,
        "Control" => Key::Control,
        "Alt" => Key::Alt,
        "Escape" => Key::Escape,
        "ArrowUp" => Key::UpArrow,
        "ArrowDown" => Key::DownArrow,
        "ArrowLeft" => Key::LeftArrow,
        "ArrowRight" => Key::RightArrow,
        "Meta" => Key::Meta,
        "Delete" => Key::Delete,
        " " => Key::Space,
        _ => {
            if k.chars().count() == 1 {
                Key::Unicode(k.chars().next().unwrap())
            } else {
                // Fallback for unknown multi-char keys (e.g. F1-F12)
                Key::Unicode('?') // Can't easily map everything in MVP
            }
        }
    }
}

pub struct WebRTCContext {
    pub pc: Arc<RTCPeerConnection>,
    pub tx: mpsc::Sender<String>,
    pub video_task: tokio::task::JoinHandle<()>,
}

pub async fn init_webrtc(tx: mpsc::Sender<String>) -> Result<WebRTCContext, Box<dyn std::error::Error + Send + Sync>> {
    let mut m = MediaEngine::default();
    m.register_default_codecs()?;
    let api = APIBuilder::new().with_media_engine(m).build();

    let config = RTCConfiguration {
        ice_servers: vec![RTCIceServer {
            urls: vec!["stun:stun.l.google.com:19302".to_owned()],
            ..Default::default()
        }],
        ..Default::default()
    };

    let pc = Arc::new(api.new_peer_connection(config).await?);

    // ICE Candidate handler
    let tx_clone = tx.clone();
    pc.on_ice_candidate(Box::new(move |c| {
        let tx = tx_clone.clone();
        Box::pin(async move {
            if let Some(candidate) = c {
                if let Ok(json) = candidate.to_json() {
                    let msg = serde_json::json!({
                        "candidate": json
                    });
                    let _ = tx.send(msg.to_string()).await;
                }
            }
        })
    }));

    // Initialize Enigo and wrap in Arc<Mutex>
    let enigo_mutex = Arc::new(tokio::sync::Mutex::new(crate::input::create_enigo()?));

    // Data Channel (input)
    let enigo_for_dc = enigo_mutex.clone();
    pc.on_data_channel(Box::new(move |d| {
        println!("New DataChannel {} {}", d.label(), d.id());
        
        let d2 = Arc::clone(&d);
        let enigo_for_msg = enigo_for_dc.clone();
        
        Box::pin(async move {
            d2.on_message(Box::new(move |msg: DataChannelMessage| {
                let msg_str = String::from_utf8(msg.data.to_vec()).unwrap_or_default();
                let enigo_mutex = enigo_for_msg.clone();
                
                Box::pin(async move {
                    if let Ok(json) = serde_json::from_str::<Value>(&msg_str) {
                        let mut enigo = enigo_mutex.lock().await;
                        
                        match json["type"].as_str().unwrap_or("") {
                            "mousemove" => {
                                if let (Some(nx), Some(ny)) = (json["x"].as_f64(), json["y"].as_f64()) {
                                    let (w, h) = enigo.main_display().unwrap_or((1920, 1080));
                                    let abs_x = (nx * w as f64) as i32;
                                    let abs_y = (ny * h as f64) as i32;
                                    let _ = enigo.move_mouse(abs_x, abs_y, Coordinate::Abs);
                                }
                            }
                            "mousedown" => {
                                let btn = match json["button"].as_str().unwrap_or("left") {
                                    "right" => Button::Right,
                                    "middle" => Button::Middle,
                                    _ => Button::Left,
                                };
                                let _ = enigo.button(btn, Direction::Press);
                            }
                            "mouseup" => {
                                let btn = match json["button"].as_str().unwrap_or("left") {
                                    "right" => Button::Right,
                                    "middle" => Button::Middle,
                                    _ => Button::Left,
                                };
                                let _ = enigo.button(btn, Direction::Release);
                            }
                            "keydown" => {
                                if let Some(k) = json["key"].as_str() {
                                    let _ = enigo.key(map_key(k), Direction::Press);
                                }
                            }
                            "keyup" => {
                                if let Some(k) = json["key"].as_str() {
                                    let _ = enigo.key(map_key(k), Direction::Release);
                                }
                            }
                            _ => {}
                        }
                    }
                })
            }));
        })
    }));

    // Dummy Video Track
    let video_track = Arc::new(TrackLocalStaticSample::new(
        webrtc::rtp_transceiver::rtp_codec::RTCRtpCodecCapability {
            mime_type: "video/h264".to_owned(),
            ..Default::default()
        },
        "video".to_owned(),
        "webrtc-rs".to_owned(),
    ));

    pc.add_track(Arc::clone(&video_track) as Arc<dyn TrackLocal + Send + Sync>).await?;

    // Spawn task to send real desktop frames
    let video_task = tokio::spawn(async move {
        println!("Initializing DXGI Desktop Capturer...");
        let capturer_res = crate::input::ScreenCapturer::new();
        if let Err(e) = capturer_res {
            println!("Failed to initialize DXGI Capturer: {}", e);
            return;
        }
        let mut capturer = capturer_res.unwrap();
        let width = capturer.width;
        let height = capturer.height;
        let fps = 15;
        
        println!("Started sending desktop frames ({}x{}) via Media Foundation H.264 Encoder...", width, height);
        
        // Initialize Encoder (Lower bitrate to 2.5 Mbps for lower latency)
        let encoder_res = crate::encoder::HardwareEncoder::new(width, height, fps, 2_500_000);
        if let Err(e) = encoder_res {
            println!("Failed to initialize Hardware Encoder: {}", e);
            return;
        }
        let encoder = encoder_res.unwrap();
        
        let mut timestamp: i64 = 0;
        
        loop {
            let start = tokio::time::Instant::now();

            let bgra = match capturer.capture_frame().map_err(|e| e.to_string()) {
                Ok(data) => data,
                Err(err_msg) => {
                    println!("DXGI capture error: {}", err_msg);
                    sleep(Duration::from_millis(33)).await;
                    continue;
                }
            };
            
            if bgra.is_empty() {
                // Timeout means no screen update (DXGI_ERROR_WAIT_TIMEOUT). We can skip encoding.
                sleep(Duration::from_millis(5)).await;
                continue;
            }
            
            // Convert to NV12
            let nv12 = crate::color::bgra_to_nv12(&bgra, width as usize, height as usize);
            
            // Encode to H.264 NALUs
            if let Ok(h264_nalus) = encoder.encode_nv12(&nv12, timestamp) {
                if !h264_nalus.is_empty() {
                    let sample = Sample {
                        data: bytes::Bytes::from(h264_nalus),
                        duration: Duration::from_millis(66),
                        ..Default::default()
                    };
                    if let Err(e) = video_track.write_sample(&sample).await {
                        println!("Video track error or closed: {}", e);
                        break;
                    }
                }
            } else if let Err(e) = encoder.encode_nv12(&nv12, timestamp) {
                println!("Encoding failed for frame: {}", e);
            }
            
            timestamp += 660000;
            
            // Pace the frame loop to roughly 15 FPS
            let elapsed = start.elapsed();
            if elapsed < Duration::from_millis(66) {
                sleep(Duration::from_millis(66) - elapsed).await;
            }
        }
    });

    Ok(WebRTCContext { pc, tx, video_task })
}

pub async fn handle_offer(ctx: &WebRTCContext, sdp: &str) {
    let desc = RTCSessionDescription::offer(sdp.to_owned()).unwrap();
    ctx.pc.set_remote_description(desc).await.unwrap();
    
    let answer = ctx.pc.create_answer(None).await.unwrap();
    ctx.pc.set_local_description(answer.clone()).await.unwrap();
    
    let payload = serde_json::json!({
        "type": "answer",
        "sdp": answer.sdp
    });
    let _ = ctx.tx.send(payload.to_string()).await;
}

pub async fn handle_ice_candidate(ctx: &WebRTCContext, candidate_str: &str) {
    if let Ok(json) = serde_json::from_str::<Value>(candidate_str) {
        if let Some(cand_obj) = json.get("candidate") {
            let candidate_str = cand_obj.to_string();
            let init = serde_json::from_str::<RTCIceCandidateInit>(&candidate_str);
            if let Ok(init) = init {
                let _ = ctx.pc.add_ice_candidate(init).await;
            }
        }
    }
}
