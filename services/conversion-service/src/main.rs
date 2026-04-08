//! conversion-service — World-Office document conversion microservice
//!
//! Handles format-to-format conversion requests (DOCX↔PDF↔ODT, etc.)
//! via the eo-x2t core engine. Jobs are queued and processed asynchronously.

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

/// Conversion job status.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
enum JobStatus {
    Queued,
    Processing,
    Completed,
    Failed,
}

/// A conversion job tracked in memory (TODO: persist to PostgreSQL).
#[derive(Debug, Clone, Serialize)]
struct ConversionJob {
    id: String,
    input_format: String,
    output_format: String,
    status: JobStatus,
    created_at: String,
    completed_at: Option<String>,
    error: Option<String>,
}

/// Application state shared across handlers.
#[derive(Clone)]
struct AppState {
    jobs: Arc<Mutex<HashMap<String, ConversionJob>>>,
}

/// Health check response.
#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    version: &'static str,
}

/// Conversion request.
#[derive(Deserialize)]
struct ConvertRequest {
    input_format: String,
    output_format: String,
    /// TODO: file content will come from storage-service reference
    source_url: Option<String>,
}

/// Conversion response.
#[derive(Serialize)]
struct ConvertResponse {
    job_id: String,
    status: JobStatus,
    message: String,
}

/// Job status response.
#[derive(Serialize)]
struct JobStatusResponse {
    job: ConversionJob,
}

/// Error response.
#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    code: u16,
}

/// POST /convert — submit a new conversion job.
async fn submit_conversion(
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

    if payload.input_format == payload.output_format {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "input and output formats must differ".into(),
                code: 400,
            }),
        ));
    }

    let job_id = Uuid::new_v4().to_string();
    let job = ConversionJob {
        id: job_id.clone(),
        input_format: payload.input_format.clone(),
        output_format: payload.output_format.clone(),
        status: JobStatus::Queued,
        created_at: Utc::now().to_rfc3339(),
        completed_at: None,
        error: None,
    };

    {
        let mut jobs = state.jobs.lock().await;
        jobs.insert(job_id.clone(), job);
    }

    // TODO: enqueue actual conversion via eo-x2t core engine
    tracing::info!(
        job_id = %job_id,
        from = %payload.input_format,
        to = %payload.output_format,
        "conversion job queued"
    );

    Ok(Json(ConvertResponse {
        job_id,
        status: JobStatus::Queued,
        message: "Conversion job submitted. Poll /jobs/{id} for status.".into(),
    }))
}

/// GET /jobs/{id} — get the status of a conversion job.
async fn get_job_status(
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
async fn list_jobs(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<ConversionJob>> {
    let jobs = state.jobs.lock().await;
    let all: Vec<ConversionJob> = jobs.values().cloned().collect();
    Json(all)
}

/// GET /health — liveness check.
async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "conversion-service",
        version: env!("CARGO_PKG_VERSION"),
    })
}

/// Supported format list for discovery.
async fn supported_formats() -> Json<Vec<String>> {
    // TODO: read from eo-x2t registry
    Json(vec![
        "docx".into(),
        "pdf".into(),
        "odt".into(),
        "txt".into(),
        "rtf".into(),
        "html".into(),
        "xlsx".into(),
        "pptx".into(),
        "epub".into(),
        "fb2".into(),
    ])
}

fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/convert", post(submit_conversion))
        .route("/jobs", get(list_jobs))
        .route("/jobs/{id}", get(get_job_status))
        .route("/formats", get(supported_formats))
        .with_state(state)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = Arc::new(AppState {
        jobs: Arc::new(Mutex::new(HashMap::new())),
    });
    let app = app(state);

    let addr = std::env::var("SERVICE_HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port: u16 = std::env::var("SERVICE_PORT")
        .unwrap_or_else(|_| "8003".into())
        .parse()
        .unwrap_or(8003);

    tracing::info!("conversion-service v{} starting on {}:{}", env!("CARGO_PKG_VERSION"), addr, port);

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", addr, port))
        .await
        .expect("failed to bind");
    axum::serve(listener, app).await.expect("server error");
}
