//! scim-service -- World-Office enterprise SCIM provisioning microservice
//!
//! Implements SCIM 2.0 protocol for automated user/group provisioning
//! and deprovisioning with external identity providers (Azure AD, Okta, etc.).
//! Enterprise-only.

fn main() {
    tracing_subscriber::fmt::init();
    println!("scim-service v{}", env!("CARGO_PKG_VERSION"));
}
