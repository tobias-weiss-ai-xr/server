//! storage-service — World-Office document storage microservice.
//!
//! Manages document persistence and retrieval backed by local filesystem.
//! Provides CRUD endpoints for file storage.

use axum::{
    body::Bytes,
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::Mutex;
use uuid::Uuid;

/// Stored file metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredFile {
    pub id: String,
    pub name: String,
    pub content_type: String,
    pub size: usize,
    pub created_at: String,
    pub storage_path: String,
}

/// Application state.
#[derive(Clone)]
pub struct AppState {
    pub files: Arc<Mutex<HashMap<String, StoredFile>>>,
    pub storage_dir: PathBuf,
}

/// Health check response.
#[derive(Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub service: &'static str,
    pub version: &'static str,
}

/// Upload file request.
#[derive(Deserialize)]
pub struct UploadRequest {
    pub name: String,
    #[serde(default = "default_content_type")]
    pub content_type: String,
    pub data: String, // base64-encoded
}

fn default_content_type() -> String {
    "application/octet-stream".into()
}

/// Upload response.
#[derive(Serialize)]
pub struct UploadResponse {
    pub file: StoredFile,
}

/// Error response.
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: u16,
}

/// File list response.
#[derive(Serialize)]
pub struct FileListResponse {
    pub files: Vec<StoredFile>,
    pub count: usize,
}

/// Create a fresh AppState for testing with a temp directory.
pub fn create_test_state() -> Arc<AppState> {
    let dir = std::env::temp_dir().join(format!("wo-storage-test-{}", Uuid::new_v4()));
    Arc::new(AppState {
        files: Arc::new(Mutex::new(HashMap::new())),
        storage_dir: dir,
    })
}

/// GET /health — liveness check.
pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "storage-service",
        version: env!("CARGO_PKG_VERSION"),
    })
}

/// POST /files — upload a file (base64-encoded body).
pub async fn upload_file(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UploadRequest>,
) -> Result<(StatusCode, Json<UploadResponse>), (StatusCode, Json<ErrorResponse>)> {
    if payload.name.is_empty() || payload.data.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "name and data are required".into(),
                code: 400,
            }),
        ));
    }

    // Decode base64 data
    let file_data = match base64::Engine::decode(
        &base64::engine::general_purpose::STANDARD,
        &payload.data,
    ) {
        Ok(data) => data,
        Err(e) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid base64 data: {}", e),
                    code: 400,
                }),
            ));
        }
    };

    let file_id = Uuid::new_v4().to_string();
    let storage_path = state.storage_dir.join(&file_id);

    // Ensure storage directory exists
    if let Err(e) = fs::create_dir_all(&state.storage_dir).await {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to create storage directory: {}", e),
                code: 500,
            }),
        ));
    }

    // Write file to disk
    if let Err(e) = fs::write(&storage_path, &file_data).await {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to write file: {}", e),
                code: 500,
            }),
        ));
    }

    let stored_file = StoredFile {
        id: file_id.clone(),
        name: payload.name,
        content_type: payload.content_type,
        size: file_data.len(),
        created_at: chrono::Utc::now().to_rfc3339(),
        storage_path: storage_path.to_string_lossy().to_string(),
    };

    {
        let mut files = state.files.lock().await;
        files.insert(file_id.clone(), stored_file.clone());
    }

    tracing::info!(file_id = %file_id, name = %stored_file.name, size = stored_file.size, "file uploaded");

    Ok((StatusCode::CREATED, Json(UploadResponse { file: stored_file })))
}

/// GET /files — list all files.
pub async fn list_files(
    State(state): State<Arc<AppState>>,
) -> Json<FileListResponse> {
    let files = state.files.lock().await;
    let all: Vec<StoredFile> = files.values().cloned().collect();
    let count = all.len();
    Json(FileListResponse { files: all, count })
}

/// GET /files/{id} — get file metadata.
pub async fn get_file(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
) -> Result<Json<StoredFile>, (StatusCode, Json<ErrorResponse>)> {
    let files = state.files.lock().await;
    match files.get(&file_id) {
        Some(file) => Ok(Json(file.clone())),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: format!("File {} not found", file_id),
                code: 404,
            }),
        )),
    }
}

/// GET /files/{id}/content — get raw file bytes.
pub async fn get_file_content(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
) -> Result<(StatusCode, HeaderMap, Bytes), (StatusCode, Json<ErrorResponse>)> {
    let files = state.files.lock().await;
    let file = match files.get(&file_id) {
        Some(f) => f.clone(),
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: format!("File {} not found", file_id),
                    code: 404,
                }),
            ));
        }
    };
    drop(files);

    let data = match fs::read(&file.storage_path).await {
        Ok(d) => d,
        Err(e) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Failed to read file: {}", e),
                    code: 500,
                }),
            ));
        }
    };

    let mut headers = HeaderMap::new();
    headers.insert("content-type", file.content_type.parse().unwrap_or_else(|_| "application/octet-stream".parse().unwrap()));
    headers.insert("content-length", data.len().to_string().parse().unwrap());

    Ok((StatusCode::OK, headers, Bytes::from(data)))
}

/// DELETE /files/{id} — delete a file.
pub async fn delete_file(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    let (storage_path, name) = {
        let mut files = state.files.lock().await;
        match files.remove(&file_id) {
            Some(f) => (f.storage_path, f.name),
            None => {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: format!("File {} not found", file_id),
                        code: 404,
                    }),
                ));
            }
        }
    };

    // Best-effort file deletion from disk
    if let Err(e) = fs::remove_file(&storage_path).await {
        tracing::warn!(path = %storage_path, error = %e, "failed to delete file from disk");
    }

    tracing::info!(file_id = %file_id, name = %name, "file deleted");

    Ok(Json(serde_json::json!({
        "deleted": true,
        "id": file_id,
    })))
}

/// Build the full application router.
pub fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/files", post(upload_file).get(list_files))
        .route("/files/{id}", get(get_file).delete(delete_file))
        .route("/files/{id}/content", get(get_file_content))
        .with_state(state)
}
