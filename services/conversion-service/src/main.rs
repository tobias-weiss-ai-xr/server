//! conversion-service -- World-Office document conversion microservice
//!
//! Handles format-to-format conversion requests (DOCX↔PDF↔ODT, etc.)
//! via the eo-x2t core engine.

fn main() {
    tracing_subscriber::fmt::init();
    println!("conversion-service v{}", env!("CARGO_PKG_VERSION"));
}
