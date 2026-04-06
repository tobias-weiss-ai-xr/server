//! storage-service -- World-Office document storage microservice
//!
//! Manages document persistence, versioning, and retrieval
//! backed by PostgreSQL + S3-compatible object storage.

fn main() {
    tracing_subscriber::fmt::init();
    println!("storage-service v{}", env!("CARGO_PKG_VERSION"));
}
