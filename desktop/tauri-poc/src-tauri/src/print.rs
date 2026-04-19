use serde::Serialize;
use tauri::Emitter;

#[derive(Debug, Clone, Serialize)]
pub struct PrinterInfo {
    pub name: String,
    pub is_default: bool,
    pub status: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct PageSize {
    pub name: String,
    pub width_mm: f32,
    pub height_mm: f32,
}

#[tauri::command]
pub async fn print_document(app: tauri::AppHandle) -> Result<(), String> {
    let _ = app.emit("print-requested", ());
    Ok(())
}

#[tauri::command]
pub async fn print_preview(app: tauri::AppHandle) -> Result<(), String> {
    let _ = app.emit("print-preview-requested", ());
    Ok(())
}

#[tauri::command]
pub async fn get_printers() -> Result<Vec<PrinterInfo>, String> {
    Ok(vec![PrinterInfo {
        name: "System Default".to_string(),
        is_default: true,
        status: "Ready".to_string(),
    }])
}

#[tauri::command]
pub async fn get_page_sizes() -> Vec<PageSize> {
    vec![
        PageSize { name: "A4".to_string(), width_mm: 210.0, height_mm: 297.0 },
        PageSize { name: "Letter".to_string(), width_mm: 215.9, height_mm: 279.4 },
        PageSize { name: "Legal".to_string(), width_mm: 215.9, height_mm: 355.6 },
        PageSize { name: "Tabloid".to_string(), width_mm: 279.4, height_mm: 431.8 },
    ]
}
