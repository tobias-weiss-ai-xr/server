use serde::Serialize;

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
pub async fn print_document(
    _html_content: String,
    printer_name: Option<String>,
    _app: tauri::AppHandle,
) -> Result<(), String> {
    // This is a bridge command - actual printing happens in the webview via window.print()
    // The frontend should handle calling window.print() with the HTML content
    if let Some(printer) = printer_name {
        eprintln!("Print document command called with printer: {}", printer);
    } else {
        eprintln!("Print document command called (system default printer)");
    }
    // In a real implementation, we would emit an event to the frontend
    // For now, this is a placeholder
    Ok(())
}

#[tauri::command]
pub async fn print_preview(html_content: String) -> Result<(), String> {
    // Show print preview - this triggers window.print() in the webview
    eprintln!("Print preview command called with {} bytes of HTML", html_content.len());
    // The frontend should handle showing the print preview dialog
    Ok(())
}

#[tauri::command]
pub async fn get_printers() -> Result<Vec<PrinterInfo>, String> {
    // Return a mock list of printers
    // In a real implementation, this would query the system for available printers
    let printers = vec![
        PrinterInfo {
            name: "Microsoft Print to PDF".to_string(),
            is_default: true,
            status: "Ready".to_string(),
        },
        PrinterInfo {
            name: "Microsoft XPS Document Writer".to_string(),
            is_default: false,
            status: "Ready".to_string(),
        },
    ];
    Ok(printers)
}

#[tauri::command]
pub async fn get_page_sizes() -> Vec<PageSize> {
    vec![
        PageSize {
            name: "A4".to_string(),
            width_mm: 210.0,
            height_mm: 297.0,
        },
        PageSize {
            name: "Letter".to_string(),
            width_mm: 215.9,
            height_mm: 279.4,
        },
        PageSize {
            name: "Legal".to_string(),
            width_mm: 215.9,
            height_mm: 355.6,
        },
        PageSize {
            name: "Tabloid".to_string(),
            width_mm: 279.4,
            height_mm: 431.8,
        },
    ]
}
