// wo-fb2 -- World-Office FictionBook 2.0 format engine
//!
//! Pure Rust implementation of FB2 (FictionBook 2.0) parsing.
//! FB2 is an XML-based e-book format popular in Russian literature.
//!
//! Rewritten from the C++ Fb2File class (core/Fb2File/Fb2File.h).

pub mod model;
pub mod parser;
pub mod roundtrip;
pub mod serializer;

pub use model::Fb2Document;
pub use parser::Fb2Parser;
pub use serializer::Fb2Serializer;

/// The format identifier for this crate.
pub const FORMAT_NAME: &str = "fb2";

/// Check if data looks like an FB2 file (XML with FictionBook root element).
pub fn is_fb2_file(data: &[u8]) -> bool {
    if data.len() < 20 {
        return false;
    }
    let head = String::from_utf8_lossy(&data[..data.len().min(4096)]);
    let lower = head.to_lowercase();
    lower.contains("<fictionbook") || lower.contains("xmlns:fictionbook")
}
