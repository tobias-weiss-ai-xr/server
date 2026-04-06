//! webhook-service -- World-Office enterprise webhook dispatch microservice
//!
//! Manages outgoing webhook registrations and delivery for document
//! lifecycle events (created, edited, shared, deleted, etc.).
//! Enterprise-only.

fn main() {
    tracing_subscriber::fmt::init();
    println!("webhook-service v{}", env!("CARGO_PKG_VERSION"));
}
