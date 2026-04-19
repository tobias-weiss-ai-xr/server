use crate::state::AppState;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    App, Manager,
};

pub fn create_app_menu<R: tauri::Runtime>(
    app: &App<R>,
) -> Result<tauri::menu::Menu<R>, Box<dyn std::error::Error>> {
    let state = app.state::<AppState>();
    let recent_files = state.get_recent_files();

    let mut recent_submenu = SubmenuBuilder::new(app, "Recent Files");

    if recent_files.is_empty() {
        let disabled_item = MenuItemBuilder::with_id("recent-empty", "No recent files")
            .enabled(false)
            .build(app)?;
        recent_submenu = recent_submenu.item(&disabled_item);
    } else {
        for (i, path) in recent_files.iter().enumerate() {
            let id = format!("recent-{}", i);
            let display_name = path
                .split('/')
                .last()
                .or_else(|| path.split('\\').last())
                .unwrap_or(path);
            let caption = if display_name.len() > 40 {
                format!("{}...", &display_name[..37])
            } else {
                display_name.to_string()
            };
            let item = MenuItemBuilder::with_id(&id, &caption).build(app)?;
            recent_submenu = recent_submenu.item(&item);
        }
    }

    let recent_menu = recent_submenu.build()?;

    let file_menu = SubmenuBuilder::new(app, "File")
        .text("new", "New")
        .text("open", "Open")
        .text("save", "Save")
        .text("save-as", "Save As...")
        .text("close", "Close")
        .separator()
        .item(&recent_menu)
        .separator()
        .text("exit", "Exit")
        .build()?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .text("undo", "Undo")
        .text("redo", "Redo")
        .separator()
        .text("cut", "Cut")
        .text("copy", "Copy")
        .text("paste", "Paste")
        .text("select-all", "Select All")
        .build()?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .text("zoom-in", "Zoom In")
        .text("zoom-out", "Zoom Out")
        .text("reset-zoom", "Reset Zoom")
        .separator()
        .text("fullscreen", "Full Screen")
        .separator()
        .text("toggle-sidebar", "Toggle Sidebar")
        .build()?;

    let help_menu = SubmenuBuilder::new(app, "Help")
        .text("about", "About")
        .text("check-updates", "Check for Updates")
        .separator()
        .text("documentation", "Documentation")
        .build()?;

    let menu = MenuBuilder::new(app)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&help_menu)
        .build()?;

    Ok(menu)
}
