mod commands;
mod filesystem;
mod keychain;
mod menu;
mod print;
mod state;
mod tray;
mod updater;
mod window;

use menu::create_app_menu;
use state::AppState;
use tauri::Manager;
use tray::create_system_tray;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::new_doc,
            commands::open_doc,
            commands::save_doc,
            commands::close_doc,
            commands::about,
            commands::get_recent_files,
            commands::greet,
            commands::zoom_in,
            commands::zoom_out,
            commands::reset_zoom,
            commands::toggle_fullscreen,
            filesystem::read_file,
            filesystem::read_file_binary,
            filesystem::write_file,
            filesystem::write_file_binary,
            filesystem::delete_file,
            filesystem::rename_file,
            filesystem::copy_file,
            filesystem::list_directory,
            filesystem::create_directory,
            filesystem::get_file_info,
            filesystem::detect_document_type,
            filesystem::get_home_directory,
            filesystem::get_documents_directory,
            keychain::store_credential,
            keychain::get_credential,
            keychain::delete_credential,
            keychain::list_credentials,
            print::print_document,
            print::print_preview,
            print::get_printers,
            print::get_page_sizes,
            updater::check_for_updates,
            updater::install_update,
            updater::get_current_version,
        ])
        .manage(AppState::new())
        .setup(|app| {
            // Set application menu
            let menu = create_app_menu(app.handle())?;
            app.set_menu(menu)?;

            // Create system tray
            let _tray = create_system_tray(app.handle())?;

            // Set main window title
            let window = app.get_webview_window("main").unwrap();
            window.set_title("World Office - Untitled Document")?;

            // Register menu event handler
            app.on_menu_event(move |app, event| {
                handle_menu_event(app, event.id().as_ref());
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn handle_menu_event(app: &tauri::AppHandle, id: &str) {
    match id {
        "new" => {
            let _ = window::create_new_document_window(app);
        }
        "open" => {
            // In a real app, you would open a file dialog here
            #[cfg(debug_assertions)]
            println!("Open menu item clicked");
        }
        "save" => {
            // In a real app, you would save the current document here
            #[cfg(debug_assertions)]
            println!("Save menu item clicked");
        }
        "save-as" => {
            // In a real app, you would open a save-as dialog here
            #[cfg(debug_assertions)]
            println!("Save As menu item clicked");
        }
        "close" => {
            let _ = window::close_window(app);
        }
        "exit" => {
            app.exit(0);
        }
        "zoom-in" => {
            let _ = commands::zoom_in(app.clone());
        }
        "zoom-out" => {
            let _ = commands::zoom_out(app.clone());
        }
        "reset-zoom" => {
            let _ = commands::reset_zoom(app.clone());
        }
        "fullscreen" => {
            let _ = commands::toggle_fullscreen(app.clone());
        }
        "about" => {
            let _ = commands::about(app.clone());
        }
        _ => {
            #[cfg(debug_assertions)]
            println!("Menu item '{}' not handled", id);
        }
    }
}
