//! session-service -- World-Office session management microservice
//!
//! Handles user sessions, authentication tokens, and
//! connection lifecycle for editor instances.

fn main() {
    tracing_subscriber::fmt::init();
    println!("session-service v{}", env!("CARGO_PKG_VERSION"));
}
