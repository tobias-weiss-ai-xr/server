// wo-ofd -- World-Office OFD (Open Fixed-layout Document) format engine
//!
//! OFD is a Chinese national standard electronic document format (GB/T 33190-2016).
//! It uses ZIP packaging with XML content, similar to XPS.

pub mod model;
pub mod parser;
pub mod roundtrip;

pub use model::OfdDocument;
pub use parser::OfdParser;

pub const FORMAT_NAME: &str = "ofd";

/// Check if data looks like an OFD file (ZIP with OFD.xml root).
pub fn is_ofd_file(data: &[u8]) -> bool {
    if data.len() < 4 {
        return false;
    }
    // ZIP magic bytes
    if data[0] != 0x50 || data[1] != 0x4B {
        return false;
    }
    let head = String::from_utf8_lossy(&data[..data.len().min(8192)]);
    let lower = head.to_lowercase();
    lower.contains("ofd.xml") || lower.contains("doc_0/document.xml")
}
