// eo-rtf -- World-Office RTF (Rich Text Format) format engine
//!
//! RTF parser and serializer. RTF is a well-documented text format
//! using control words, groups, and inline content.

pub mod model;
pub mod parser;
pub mod serializer;

pub use model::RtfDocument;
pub use parser::RtfParser;
pub use serializer::RtfSerializer;

pub const FORMAT_NAME: &str = "rtf";

/// Check if data looks like an RTF file.
pub fn is_rtf_file(data: &[u8]) -> bool {
    if data.len() < 5 {
        return false;
    }
    let head = String::from_utf8_lossy(&data[..data.len().min(100)]);
    let trimmed = head.trim_start();
    trimmed.starts_with("{\\rtf")
}
