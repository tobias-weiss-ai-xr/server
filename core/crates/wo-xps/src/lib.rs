// wo-xps -- World-Office XPS format engine
//!
//! XPS (XML Paper Specification) format parser.
//! XPS is a ZIP-based fixed-layout document format.

pub mod model;
pub mod parser;
pub mod roundtrip;
pub mod serializer;

pub use model::XpsDocument;
pub use parser::XpsParser;
pub use serializer::XpsSerializer;

pub const FORMAT_NAME: &str = "xps";

pub fn is_xps_file(data: &[u8]) -> bool {
    if data.len() < 4 {
        return false;
    }
    if data[0] != 0x50 || data[1] != 0x4B {
        return false;
    }
    let head = String::from_utf8_lossy(&data[..data.len().min(8192)]);
    let lower = head.to_lowercase();
    lower.contains("_rels/.rels")
        || lower.contains("[content_types].xml")
        || lower.contains(".fpage")
        || lower.contains("documents/1/pages")
}
