use tauri::{
    menu::{MenuBuilder, SubmenuBuilder},
    AppHandle, Manager,
};

pub fn create_app_menu(app: &AppHandle) -> Result<tauri::menu::Menu, Box<dyn std::error::Error>> {
    // File menu: New, Open, Save, Save As, Close, separator, Recent Files (submenu), separator, Exit
    let file_menu = SubmenuBuilder::new(app, "File")
        .text("new", "New")
        .text("open", "Open")
        .text("save", "Save")
        .text("save-as", "Save As...")
        .text("close", "Close")
        .separator()
        .item(
            &SubmenuBuilder::new(app, "Recent Files")
                .text("recent-1", "No recent files")
                .text("recent-2", "")
                .text("recent-3", "")
                .text("recent-4", "")
                .text("recent-5", "")
                .text("recent-6", "")
                .text("recent-7", "")
                .text("recent-8", "")
                .text("recent-9", "")
                .text("recent-10", "")
                .build()?,
        )
        .separator()
        .text("exit", "Exit")
        .build()?;

    // Edit menu: Undo, Redo, separator, Cut, Copy, Paste, Select All
    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .text("undo", "Undo")
        .text("redo", "Redo")
        .separator()
        .text("cut", "Cut")
        .text("copy", "Copy")
        .text("paste", "Paste")
        .text("select-all", "Select All")
        .build()?;

    // View menu: Zoom In, Zoom Out, Reset Zoom, separator, Full Screen, separator, Toggle Sidebar
    let view_menu = SubmenuBuilder::new(app, "View")
        .text("zoom-in", "Zoom In")
        .text("zoom-out", "Zoom Out")
        .text("reset-zoom", "Reset Zoom")
        .separator()
        .text("fullscreen", "Full Screen")
        .separator()
        .text("toggle-sidebar", "Toggle Sidebar")
        .build()?;

    // Help menu: About, Check for Updates, separator, Documentation
    let help_menu = SubmenuBuilder::new(app, "Help")
        .text("about", "About")
        .text("check-updates", "Check for Updates")
        .separator()
        .text("documentation", "Documentation")
        .build()?;

    // Build the complete menu
    let menu = MenuBuilder::new(app)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&help_menu)
        .build()?;

    Ok(menu)
}
