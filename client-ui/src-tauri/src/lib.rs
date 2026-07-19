mod color;
mod encoder;
mod input;
mod signaling;
mod webrtc;

use rand::RngExt;
use std::sync::Mutex;
use tauri::State;

struct AppState {
    host_session_id: Mutex<Option<u32>>,
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

    // Start host signaling connection via VPS
    let ws_url = format!("ws://192.99.167.217:8080/ws/{}", session_id);
    tauri::async_runtime::spawn(async move {
        if let Err(e) = signaling::start_signaling(ws_url).await {
            println!("Host engine error: {}", e);
        }
    });

    Ok(session_id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            host_session_id: Mutex::new(None),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_host])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
