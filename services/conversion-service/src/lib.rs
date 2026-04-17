//! conversion-service — World-Office document conversion microservice.
//!
//! Handles format-to-format conversion requests via the wo-x2t core engine.
//! Accepts file content as base64, performs real conversion, returns result.

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
pub use wo_x2t::ConversionRouter;

/// Conversion job status.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum JobStatus {
    Completed,
    Failed,
}

/// A conversion job tracked in memory.
#[derive(Debug, Clone, Serialize)]
pub struct ConversionJob {
    pub id: String,
    pub input_format: String,
    pub output_format: String,
    pub status: JobStatus,
    pub created_at: String,
    pub completed_at: String,
    pub error: Option<String>,
    /// Base64-encoded converted output data.
    pub output_data: Option<String>,
    pub output_size: Option<usize>,
    pub duration_ms: Option<u64>,
}

/// Application state shared across handlers.
#[derive(Clone)]
pub struct AppState {
    pub jobs: Arc<Mutex<HashMap<String, ConversionJob>>>,
    pub router: Arc<ConversionRouter>,
}

/// Health check response.
#[derive(Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub service: &'static str,
    pub version: &'static str,
}

/// Conversion request.
#[derive(Deserialize)]
pub struct ConvertRequest {
    pub input_format: String,
    pub output_format: String,
    /// Base64-encoded file content.
    pub data: String,
}

/// Conversion response.
#[derive(Serialize)]
pub struct ConvertResponse {
    pub job: ConversionJob,
}

/// Job status response.
#[derive(Serialize)]
pub struct JobStatusResponse {
    pub job: ConversionJob,
}

/// Error response.
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: u16,
}

/// Supported format pair.
#[derive(Serialize)]
pub struct FormatPair {
    pub source: String,
    pub target: String,
}

/// Create a fresh AppState for testing.
pub fn create_test_state() -> Arc<AppState> {
    Arc::new(AppState {
        jobs: Arc::new(Mutex::new(HashMap::new())),
        router: Arc::new(ConversionRouter::new()),
    })
}

/// POST /convert — submit a conversion and get result synchronously.
pub async fn submit_conversion(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ConvertRequest>,
) -> Result<Json<ConvertResponse>, (StatusCode, Json<ErrorResponse>)> {
    if payload.input_format.is_empty() || payload.output_format.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "input_format and output_format are required".into(),
                code: 400,
            }),
        ));
    }

    if payload.data.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "data (base64-encoded file content) is required".into(),
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

    let job_id = Uuid::new_v4().to_string();
    let created_at = Utc::now().to_rfc3339();

    // Perform actual conversion via wo-x2t
    let result = state.router.convert(
        &payload.input_format,
        &payload.output_format,
        &file_data,
    );

    let job = match result.status {
        wo_x2t::ConversionStatus::Success | wo_x2t::ConversionStatus::PartialSuccess => {
            let output = result.output.unwrap();
            let output_b64 = base64::Engine::encode(
                &base64::engine::general_purpose::STANDARD,
                &output.data,
            );
            ConversionJob {
                id: job_id.clone(),
                input_format: payload.input_format,
                output_format: payload.output_format,
                status: JobStatus::Completed,
                created_at,
                completed_at: Utc::now().to_rfc3339(),
                error: None,
                output_data: Some(output_b64),
                output_size: Some(output.data.len()),
                duration_ms: Some(result.duration_ms),
            }
        }
        wo_x2t::ConversionStatus::UnsupportedFormat => ConversionJob {
            id: job_id.clone(),
            input_format: payload.input_format,
            output_format: payload.output_format,
            status: JobStatus::Failed,
            created_at,
            completed_at: Utc::now().to_rfc3339(),
            error: result.error,
            output_data: None,
            output_size: None,
            duration_ms: Some(result.duration_ms),
        },
        _ => ConversionJob {
            id: job_id.clone(),
            input_format: payload.input_format,
            output_format: payload.output_format,
            status: JobStatus::Failed,
            created_at,
            completed_at: Utc::now().to_rfc3339(),
            error: result.error,
            output_data: None,
            output_size: None,
            duration_ms: Some(result.duration_ms),
        },
    };

    {
        let mut jobs = state.jobs.lock().await;
        jobs.insert(job_id.clone(), job.clone());
    }

    tracing::info!(
        job_id = %job_id,
        from = %job.input_format,
        to = %job.output_format,
        status = ?job.status,
        duration_ms = job.duration_ms,
        "conversion completed"
    );

    Ok(Json(ConvertResponse { job }))
}

/// GET /jobs/{id} — get the status and result of a conversion job.
pub async fn get_job_status(
    State(state): State<Arc<AppState>>,
    Path(job_id): Path<String>,
) -> Result<Json<JobStatusResponse>, (StatusCode, Json<ErrorResponse>)> {
    let jobs = state.jobs.lock().await;

    match jobs.get(&job_id) {
        Some(job) => Ok(Json(JobStatusResponse { job: job.clone() })),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: format!("Job {} not found", job_id),
                code: 404,
            }),
        )),
    }
}

/// GET /jobs — list all conversion jobs.
pub async fn list_jobs(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<ConversionJob>> {
    let jobs = state.jobs.lock().await;
    let all: Vec<ConversionJob> = jobs.values().cloned().collect();
    Json(all)
}

/// GET /health — liveness check.
pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "conversion-service",
        version: env!("CARGO_PKG_VERSION"),
    })
}

/// GET /formats — list supported conversion format pairs.
pub async fn supported_formats(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<FormatPair>> {
    let pairs = state
        .router
        .registry()
        .registered_pairs()
        .into_iter()
        .map(|(src, tgt)| FormatPair {
            source: src.to_string(),
            target: tgt.to_string(),
        })
        .collect();
    Json(pairs)
}

/// Build the full application router.
pub fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/convert", post(submit_conversion))
        .route("/jobs", get(list_jobs))
        .route("/jobs/{id}", get(get_job_status))
        .route("/formats", get(supported_formats))
        .with_state(state)
}
