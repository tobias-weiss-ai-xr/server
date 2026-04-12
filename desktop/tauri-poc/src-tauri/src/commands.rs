use crate::state::AppState;
use crate::window;
use tauri::{AppHandle, Manager, State, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub fn new_doc(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    window::create_new_document_window(&app).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_doc(app: AppHandle, state: State<'_, AppState>, path: String) -> Result<(), String> {
    // In a real app, you would read the file and pass content to frontend
    state.add_recent_file(path.clone());

    let filename = std::path::Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Document");

    let _ = WebviewWindowBuilder::new(&app, &path, WebviewUrl::App("index.html".into()))
        .title(filename)
        .inner_size(800.0, 600.0)
        .min_inner_size(400.0, 300.0)
        .center()
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_doc(
    app: AppHandle,
    state: State<'_, AppState>,
    path: Option<String>,
    content: String,
) -> Result<(), String> {
    // In a real app, you would write the content to disk
    if let Some(path) = path {
        state.add_recent_file(path);
    }
    Ok(())
}

#[tauri::command]
pub fn close_doc(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    window::close_window(&app).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn about(app: AppHandle) -> Result<(), String> {
    // In a real app, you would show an about dialog
    // For now, we'll use the built-in message dialog if available
    #[cfg(debug_assertions)]
    println!("World Office Desktop v0.1.0 - About Dialog");
    Ok(())
}

#[tauri::command]
pub fn get_recent_files(state: State<'_, AppState>) -> Vec<String> {
    state.get_recent_files()
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to World Office.", name)
}

#[tauri::command]
pub fn zoom_in(app: AppHandle) -> Result<(), String> {
    if let Some(window) = window::get_focused_window(&app) {
        // Implement zoom in logic
        window
            .set_zoom(window.zoom().unwrap_or(1.0) + 0.1)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn zoom_out(app: AppHandle) -> Result<(), String> {
    if let Some(window) = window::get_focused_window(&app) {
        // Implement zoom out logic
        let current_zoom = window.zoom().unwrap_or(1.0);
        if current_zoom > 0.2 {
            window
                .set_zoom(current_zoom - 0.1)
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn reset_zoom(app: AppHandle) -> Result<(), String> {
    if let Some(window) = window::get_focused_window(&app) {
        window.set_zoom(1.0).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn toggle_fullscreen(app: AppHandle) -> Result<(), String> {
    if let Some(window) = window::get_focused_window(&app) {
        window
            .set_fullscreen(!window.is_fullscreen().unwrap_or(false))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
