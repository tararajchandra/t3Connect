use std::error::Error;
use rand::RngExt;
use tokio;

mod signaling;
mod webrtc;
mod input;
mod encoder;
mod color;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let session_id: u32 = rand::rng().random_range(100000..999999);
    println!("Starting t3 Connect Host Engine.");
    println!("Session ID: {}", session_id);
    println!("Waiting for client connection...");

    // Connect to signaling server
    let ws_url = format!("ws://localhost:8080/ws/{}", session_id);
    
    // Pass control to signaling and webrtc
    signaling::start_signaling(ws_url).await?;

    Ok(())
}
