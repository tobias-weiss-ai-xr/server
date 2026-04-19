use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct UpdateInfo {
    pub current_version: String,
    pub latest_version: String,
    pub release_notes: String,
    pub download_url: String,
    pub available: bool,
    pub check_url: String,
}

#[tauri::command]
pub async fn check_for_updates() -> Result<UpdateInfo, String> {
    let current_version = env!("CARGO_PKG_VERSION").to_string();
    Ok(UpdateInfo {
        current_version: current_version.clone(),
        latest_version: current_version,
        release_notes: "You are running the latest version of World Office.\n\n\
            Automatic updates are not yet configured. Check the project website \
            for new releases: https://world-office.org"
            .to_string(),
        download_url: String::new(),
        available: false,
        check_url: "https://github.com/nicekid1/World-Office/releases".to_string(),
    })
}

#[tauri::command]
pub async fn install_update() -> Result<(), String> {
    Err("Automatic updates are not yet configured. \
         Please download the latest version from the project website.".to_string())
}

#[tauri::command]
pub async fn get_current_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
