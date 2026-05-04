use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

const MAX_RECENT_FILES: usize = 10;
const RECENT_FILES_KEY: &str = "recent_files.json";

#[derive(Default)]
pub struct AppState {
    pub recent_files: Mutex<Vec<String>>,
    pub window_count: Mutex<u32>,
}

impl AppState {
    pub fn new() -> Self {
        let state = Self::default();
        state.load_recent_files();
        state
    }

    pub fn add_recent_file(&self, path: String) {
        let mut recent = self.recent_files.lock().unwrap();
        recent.retain(|p| p != &path);
        recent.insert(0, path);
        if recent.len() > MAX_RECENT_FILES {
            recent.truncate(MAX_RECENT_FILES);
        }
        drop(recent);
        self.save_recent_files();
    }

    pub fn get_recent_files(&self) -> Vec<String> {
        self.recent_files.lock().unwrap().clone()
    }

    fn get_storage_path() -> Option<PathBuf> {
        dirs::data_local_dir().map(|dir| dir.join("WorldOffice").join(RECENT_FILES_KEY))
    }

    fn load_recent_files(&self) {
        if let Some(path) = Self::get_storage_path() {
            if path.exists() {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(files) = serde_json::from_str::<Vec<String>>(&content) {
                        *self.recent_files.lock().unwrap() = files;
                    }
                }
            }
        }
    }

    fn save_recent_files(&self) {
        if let Some(path) = Self::get_storage_path() {
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let files = self.recent_files.lock().unwrap().clone();
            let _ = fs::write(&path, serde_json::to_string(&files).unwrap_or_default());
        }
    }
}
