use base64::{engine::general_purpose::STANDARD, Engine};
use mime_guess::Mime;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub is_dir: bool,
    pub is_file: bool,
    pub modified: String,
    pub created: String,
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err(format!("File not found: {}", path.display()));
    }

    fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub fn read_file_binary(path: String) -> Result<String, String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err(format!("File not found: {}", path.display()));
    }

    let bytes = fs::read(path).map_err(|e| format!("Failed to read binary file: {}", e))?;
    Ok(STANDARD.encode(&bytes))
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    let path = Path::new(&path);

    // Create parent directories if they don't exist
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directories: {}", e))?;
        }
    }

    fs::write(path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub fn write_file_binary(path: String, content_base64: String) -> Result<(), String> {
    let path = Path::new(&path);

    // Create parent directories if they don't exist
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directories: {}", e))?;
        }
    }

    let bytes = STANDARD
        .decode(&content_base64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    fs::write(path, bytes).map_err(|e| format!("Failed to write binary file: {}", e))
}

#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err(format!("File not found: {}", path.display()));
    }

    if path.is_dir() {
        fs::remove_dir_all(path).map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(path).map_err(|e| format!("Failed to delete file: {}", e))
    }
}

#[tauri::command]
pub fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    let old_path = Path::new(&old_path);
    let new_path = Path::new(&new_path);

    if !old_path.exists() {
        return Err(format!("Source file not found: {}", old_path.display()));
    }

    // Create parent directories if they don't exist
    if let Some(parent) = new_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directories: {}", e))?;
        }
    }

    fs::rename(old_path, new_path).map_err(|e| format!("Failed to rename file: {}", e))
}

#[tauri::command]
pub fn copy_file(src: String, dst: String) -> Result<(), String> {
    let src_path = Path::new(&src);
    let dst_path = Path::new(&dst);

    if !src_path.exists() {
        return Err(format!("Source file not found: {}", src_path.display()));
    }

    // Create parent directories if they don't exist
    if let Some(parent) = dst_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directories: {}", e))?;
        }
    }

    if src_path.is_dir() {
        // For directories, we need to recursively copy
        copy_dir_recursive(src_path, dst_path)
    } else {
        fs::copy(src_path, dst_path).map_err(|e| format!("Failed to copy file: {}", e))?;
        Ok(())
    }
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), String> {
    if !dst.exists() {
        fs::create_dir_all(dst).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    for entry in fs::read_dir(src).map_err(|e| format!("Failed to read directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let file_type = entry
            .file_type()
            .map_err(|e| format!("Failed to get file type: {}", e))?;

        let src_child = entry.path();
        let dst_child = dst.join(entry.file_name());

        if file_type.is_dir() {
            copy_dir_recursive(&src_child, &dst_child)?;
        } else {
            fs::copy(&src_child, &dst_child).map_err(|e| format!("Failed to copy file: {}", e))?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err(format!("Directory not found: {}", path.display()));
    }

    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", path.display()));
    }

    let mut entries = Vec::new();

    for entry in fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let metadata = entry
            .metadata()
            .map_err(|e| format!("Failed to get metadata: {}", e))?;

        let modified = metadata
            .modified()
            .map_err(|e| format!("Failed to get modified time: {}", e))?;

        let file_entry = FileEntry {
            name: entry.file_name().to_string_lossy().into_owned(),
            path: entry.path().to_string_lossy().into_owned(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
            modified: format!("{:?}", modified),
        };

        entries.push(file_entry);
    }

    // Sort: directories first, then files, alphabetically
    entries.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.cmp(&b.name),
    });

    Ok(entries)
}

#[tauri::command]
pub fn create_directory(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if path.exists() {
        return Err(format!("Path already exists: {}", path.display()));
    }

    fs::create_dir_all(path).map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
pub fn get_file_info(path: String) -> Result<FileInfo, String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err(format!("File not found: {}", path.display()));
    }

    let metadata = fs::metadata(path).map_err(|e| format!("Failed to get metadata: {}", e))?;

    let modified = metadata
        .modified()
        .map_err(|e| format!("Failed to get modified time: {}", e))?;

    let created = metadata
        .created()
        .map_err(|e| format!("Failed to get created time: {}", e));

    let created_str = match created {
        Ok(time) => format!("{:?}", time),
        Err(_) => String::from("Unknown"),
    };

    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();

    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_string();

    let file_info = FileInfo {
        path: path.to_string_lossy().into_owned(),
        name,
        extension,
        size: metadata.len(),
        is_dir: metadata.is_dir(),
        is_file: metadata.is_file(),
        modified: format!("{:?}", modified),
        created: created_str,
    };

    Ok(file_info)
}

#[tauri::command]
pub fn detect_document_type(path: String) -> Result<String, String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err(format!("File not found: {}", path.display()));
    }

    let extension = path.extension().and_then(|e| e.to_str()).unwrap_or("");

    // Common document types based on extension
    let doc_type: String = match extension.to_lowercase().as_str() {
        "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document".into(),
        "doc" => "application/msword".into(),
        "pdf" => "application/pdf".into(),
        "odt" => "application/vnd.oasis.opendocument.text".into(),
        "ods" => "application/vnd.oasis.opendocument.spreadsheet".into(),
        "odp" => "application/vnd.oasis.opendocument.presentation".into(),
        "txt" => "text/plain".into(),
        "rtf" => "application/rtf".into(),
        "html" => "text/html".into(),
        "htm" => "text/html".into(),
        "md" => "text/markdown".into(),
        "json" => "application/json".into(),
        "xml" => "application/xml".into(),
        "csv" => "text/csv".into(),
        "xls" => "application/vnd.ms-excel".into(),
        "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".into(),
        "ppt" => "application/vnd.ms-powerpoint".into(),
        "pptx" => {
            "application/vnd.openxmlformats-officedocument.presentationml.presentation".into()
        }
        _ => {
            // Fall back to mime_guess for unknown types
            let mime: Mime = mime_guess::from_path(path).first_or_octet_stream();
            mime.to_string()
        }
    };

    Ok(doc_type)
}

#[tauri::command]
pub fn get_home_directory() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().into_owned())
        .ok_or_else(|| "Failed to get home directory".to_string())
}

#[tauri::command]
pub fn get_documents_directory() -> Result<String, String> {
    dirs::document_dir()
        .map(|p| p.to_string_lossy().into_owned())
        .ok_or_else(|| "Failed to get documents directory".to_string())
}
