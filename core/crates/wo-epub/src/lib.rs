// wo-epub -- World-Office EPUB format engine
//!
//! Pure Rust implementation of EPUB 2.0 and 3.0 parsing.
//! EPUB is a ZIP-based e-book format containing XHTML content,
//! packaging metadata (OPF), and navigation (NCX/NAV).

pub mod model;
pub mod parser;
pub mod roundtrip;

pub use model::EpubDocument;
pub use parser::EpubParser;

pub const FORMAT_NAME: &str = "epub";

pub fn is_epub_file(data: &[u8]) -> bool {
    if data.len() < 58 {
        return false;
    }
    if data[0] != 0x50 || data[1] != 0x4B {
        return false;
    }
    let head = String::from_utf8_lossy(&data[..data.len().min(200)]);
    head.contains("mimetype") && head.contains("application/epub+zip")
}
