//! coauthoring-service -- World-Office real-time collaboration microservice
//!
//! Manages WebSocket connections, operational transforms, and
//! document lock/sync for multi-user editing sessions.

fn main() {
    tracing_subscriber::fmt::init();
    println!("coauthoring-service v{}", env!("CARGO_PKG_VERSION"));
}
