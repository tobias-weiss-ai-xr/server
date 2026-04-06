//! identity-service -- World-Office identity and auth microservice
//!
//! Manages user accounts, authentication (JWT/OIDC), RBAC,
//! and integration with external identity providers.

fn main() {
    tracing_subscriber::fmt::init();
    println!("identity-service v{}", env!("CARGO_PKG_VERSION"));
}
