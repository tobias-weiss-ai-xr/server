use std::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    pub recent_files: Mutex<Vec<String>>,
    pub window_count: Mutex<u32>,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_recent_file(&self, path: String) {
        let mut recent = self.recent_files.lock().unwrap();
        // Remove if already exists
        recent.retain(|p| p != &path);
        // Add to front
        recent.insert(0, path);
        // Keep only last 10
        if recent.len() > 10 {
            recent.truncate(10);
        }
    }

    pub fn get_recent_files(&self) -> Vec<String> {
        self.recent_files.lock().unwrap().clone()
    }
}
