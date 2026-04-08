// eo-txt — World-Office plain text format engine
//!
//! Pure Rust implementation of TXT parsing and serialization.
//! Supports UTF-8, UTF-16 LE/BE with BOM detection, and line ending normalization.
//!
//! Rewritten from the C++ TxtFile class (core/TxtFile/Source/TxtFormat/TxtFile.h).

pub mod parser;
pub mod serializer;

// Re-exports
pub use parser::TxtParser;
pub use serializer::TxtSerializer;

use eo_common::DocumentFormat;

/// The format identifier for this crate.
pub const FORMAT_NAME: &str = "txt";

/// Check if data looks like a plain text file.
pub fn is_txt_file(data: &[u8]) -> bool {
    // If format detection identifies it as something else, it's not plain text
    if DocumentFormat::from_magic_bytes(data).is_some() {
        return false;
    }
    // Plain text files contain primarily printable ASCII/UTF-8 bytes
    // A simple heuristic: no NULL bytes in first 1024 bytes
    let check_len = data.len().min(1024);
    !data[..check_len].contains(&0x00)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_txt_simple() {
        assert!(is_txt_file(b"Hello, world!\nThis is text."));
    }

    #[test]
    fn test_is_txt_not_pdf() {
        assert!(!is_txt_file(b"%PDF-1.4"));
    }

    #[test]
    fn test_is_txt_not_rtf() {
        assert!(!is_txt_file(b"{\\rtf1"));
    }

    #[test]
    fn test_is_txt_not_null() {
        assert!(!is_txt_file(b"\x00\x00\xFF\xFE"));
    }
}
