//! audit-service -- World-Office enterprise audit logging microservice
//!
//! Records and queries audit trails for document access, edits,
//! sharing events, and administrative actions. Enterprise-only.

fn main() {
    tracing_subscriber::fmt::init();
    println!("audit-service v{}", env!("CARGO_PKG_VERSION"));
}
