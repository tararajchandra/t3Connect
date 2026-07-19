use std::error::Error;
use tokio::sync::mpsc;

#[path = "../signaling.rs"]
mod signaling;
#[path = "../webrtc.rs"]
mod webrtc;
#[path = "../input.rs"]
mod input;
#[path = "../encoder.rs"]
mod encoder;
#[path = "../color.rs"]
mod color;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let (tx, _rx) = mpsc::channel(32);
    
    println!("Init 1...");
    let ctx1 = webrtc::init_webrtc(tx.clone()).await;
    println!("Ctx1 result: {:?}", ctx1.is_ok());
    
    if let Ok(ctx) = ctx1 {
        println!("Aborting ctx1...");
        ctx.video_task.abort();
        let _ = ctx.pc.close().await;
    }
    
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    
    println!("Init 2...");
    let ctx2 = webrtc::init_webrtc(tx.clone()).await;
    println!("Ctx2 result: {:?}", ctx2.is_ok());
    
    if let Err(e) = ctx2 {
        println!("Error 2: {:?}", e);
    }

    Ok(())
}
