mod color;
mod encoder;
mod input;
mod signaling;
mod webrtc;

use rand::RngExt;
use std::sync::Mutex;
use std::sync::Arc;
use tauri::State;

struct AppState {
    host_session_id: Mutex<Option<u32>>,
    file_dc: Arc<tokio::sync::Mutex<Option<Arc<::webrtc::data_channel::RTCDataChannel>>>>,
}

#[tauri::command]
async fn start_host(state: State<'_, AppState>) -> Result<u32, String> {
    let session_id = {
        let mut session = state.host_session_id.lock().unwrap();
        if let Some(id) = *session {
            return Ok(id); // Already hosting
        }
        let id: u32 = rand::rng().random_range(100000..999999);
        *session = Some(id);
        id
    };

    let file_dc = state.file_dc.clone();

    // Start host signaling connection via VPS
    let ws_url = format!(
        "ws://qkwcwksoc88cckoks84o44ks.192.99.167.217.sslip.io/ws/{}",
        session_id
    );
    tauri::async_runtime::spawn(async move {
        if let Err(e) = signaling::start_signaling(ws_url, file_dc).await {
            println!("Host engine error: {}", e);
        }
    });

    Ok(session_id)
}

#[tauri::command]
async fn send_file_to_client(path: String, state: State<'_, AppState>) -> Result<(), String> {
    let file_dc_lock = state.file_dc.lock().await;
    let dc = match &*file_dc_lock {
        Some(dc) => dc.clone(),
        None => return Err("No client connected or data channel not open".into()),
    };
    drop(file_dc_lock);

    // Read the file and send it
    let path = std::path::PathBuf::from(path);
    let filename = path.file_name().unwrap_or_default().to_string_lossy().to_string();
    
    let file_size = std::fs::metadata(&path)
        .map_err(|e| e.to_string())?
        .len();

    println!("Sending file: {} ({} bytes) to client", filename, file_size);

    // Send metadata
    let metadata = serde_json::json!({
        "type": "file-start",
        "name": filename,
        "size": file_size,
        "type": "application/octet-stream"
    });
    
    dc.send_text(metadata.to_string()).await.map_err(|e| e.to_string())?;

    // Send chunks
    let mut file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
    let mut buffer = vec![0; 65536]; // 64KB chunks
    use std::io::Read;

    loop {
        let bytes_read = file.read(&mut buffer).map_err(|e| e.to_string())?;
        if bytes_read == 0 {
            break;
        }

        // Backpressure check
        while dc.buffered_amount().await > 1024 * 1024 * 5 { // wait if buffer > 5MB
            tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        }

        let chunk = bytes::Bytes::copy_from_slice(&buffer[..bytes_read]);
        dc.send(&chunk).await.map_err(|e| e.to_string())?;
    }

    // Send end signal
    let end_signal = serde_json::json!({ "type": "file-end" });
    dc.send_text(end_signal.to_string()).await.map_err(|e| e.to_string())?;
    println!("Finished sending file!");

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            host_session_id: Mutex::new(None),
            file_dc: Arc::new(tokio::sync::Mutex::new(None)),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_host, send_file_to_client])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
