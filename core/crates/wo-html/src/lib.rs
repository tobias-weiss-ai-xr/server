// wo-html -- World-Office HTML format engine
//!
//! Pure Rust implementation of HTML import/export.
//! Rewritten from the C++ CHtmlFile class which used an external subprocess.

pub mod model;
pub mod parser;
pub mod serializer;

pub use model::HtmlDocument;
pub use parser::HtmlParser;
pub use serializer::HtmlSerializer;

/// The format identifier for this crate.
pub const FORMAT_NAME: &str = "html";

/// Check if data looks like an HTML file.
pub fn is_html_file(data: &[u8]) -> bool {
    if data.len() < 10 {
        return false;
    }
    let head = String::from_utf8_lossy(&data[..data.len().min(4096)]);
    let lower = head.to_lowercase();
    lower.contains("<!doctype html")
        || lower.contains("<html")
        || lower.contains("<head")
        || lower.contains("<body")
        || lower.contains("<div")
        || lower.contains("<p>")
        || lower.contains("<table")
}
