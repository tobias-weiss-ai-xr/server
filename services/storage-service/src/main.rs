//! storage-service — World-Office document storage microservice binary.

use storage_service::{app, AppState};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let storage_dir: std::path::PathBuf = std::env::var("STORAGE_DIR")
        .unwrap_or_else(|_| "./data".into())
        .into();

    let state = Arc::new(AppState {
        files: Arc::new(Mutex::new(HashMap::new())),
        storage_dir,
    });

    let app = app(state);

    let addr = std::env::var("SERVICE_HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port: u16 = std::env::var("SERVICE_PORT")
        .unwrap_or_else(|_| "8002".into())
        .parse()
        .unwrap_or(8002);

    tracing::info!("storage-service v{} starting on {}:{}", env!("CARGO_PKG_VERSION"), addr, port);

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", addr, port))
        .await
        .expect("failed to bind");
    axum::serve(listener, app).await.expect("server error");
}
