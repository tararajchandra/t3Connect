use std::error::Error;
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::connect_async;
use tokio::sync::mpsc;
use serde_json::Value;

pub async fn start_signaling(ws_url: String) -> Result<(), Box<dyn Error>> {
    println!("Connecting to signaling server at {}", ws_url);
    
    let (ws_stream, _) = connect_async(&ws_url).await?;
    println!("WebSocket connected!");

    let (mut write, mut read) = ws_stream.split();
    
    // Channel for WebRTC to send messages back to the signaling server
    let (tx, mut rx) = mpsc::channel::<String>(32);
    
    // Spawn a task to forward messages from WebRTC to WebSocket
    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if write.send(tokio_tungstenite::tungstenite::Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    // We will dynamically create WebRTC contexts per connection offer
    let mut current_ctx: Option<crate::webrtc::WebRTCContext> = None;
    let tx_for_webrtc = tx.clone();
    
    // Listen for incoming WebSocket messages
    while let Some(msg) = read.next().await {
        if let Ok(tokio_tungstenite::tungstenite::Message::Text(text)) = msg {
            let parsed: Result<Value, _> = serde_json::from_str(&text);
            if let Ok(json) = parsed {
                // If it has "sdp", it's an offer or answer
                if json.get("sdp").is_some() {
                    let sdp = json["sdp"].as_str().unwrap_or("");
                    let type_str = json["type"].as_str().unwrap_or("");
                    if type_str == "offer" {
                        println!("Received new SDP Offer. Re-initializing WebRTC Context...");
                        
                        // Close existing context if any
                        if let Some(mut ctx) = current_ctx.take() {
                            println!("Aborting old video loop & closing previous PeerConnection...");
                            ctx.video_task.abort();
                            let _ = ctx.pc.close().await;
                            let _ = ctx.video_task.await; // Wait for it to fully exit and drop DXGI duplication
                        }
                        
                        // Initialize new WebRTC connection
                        match crate::webrtc::init_webrtc(tx_for_webrtc.clone()).await {
                            Ok(new_ctx) => {
                                crate::webrtc::handle_offer(&new_ctx, sdp).await;
                                current_ctx = Some(new_ctx);
                            }
                            Err(e) => {
                                println!("Failed to initialize WebRTC context! Error: {:?}", e);
                            }
                        }
                    }
                } else if json.get("candidate").is_some() {
                    // It's an ICE candidate
                    if let Some(ctx) = &current_ctx {
                        println!("Received ICE Candidate");
                        crate::webrtc::handle_ice_candidate(ctx, &text).await;
                    }
                }
            }
        }
    }

    Ok(())
}
