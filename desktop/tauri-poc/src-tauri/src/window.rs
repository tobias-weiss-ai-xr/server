use crate::state::AppState;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

pub fn create_new_document_window(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let state = app.state::<AppState>();
    let mut window_count = state.window_count.lock().unwrap();
    *window_count += 1;
    let count = *window_count;
    drop(window_count);

    let label = format!("document-{}", count);
    let title = format!("Untitled Document {}", count);

    let _ = WebviewWindowBuilder::new(app, &label, WebviewUrl::App("index.html".into()))
        .title(&title)
        .inner_size(800.0, 600.0)
        .min_inner_size(400.0, 300.0)
        .center()
        .build()?;

    Ok(())
}

pub fn get_focused_window(app: &AppHandle) -> Option<tauri::WebviewWindow> {
    app.get_webview_window(app.get_focused_window()?.label())
}

pub fn close_window(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(window) = get_focused_window(app) {
        window.close()?;
    }
    Ok(())
}

pub fn get_document_title(app: &AppHandle, label: &str) -> String {
    if let Some(window) = app.get_webview_window(label) {
        window
            .title()
            .unwrap_or_else(|_| "World Office".to_string())
    } else {
        "World Office".to_string()
    }
}
