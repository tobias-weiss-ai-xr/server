// wo-djvu -- World-Office DjVu format engine
//!
//! DjVu is a binary document format optimized for scanned documents.
//! Uses IFF (Interchange File Format) container with specialized chunks.

pub mod model;
pub mod parser;

pub use model::DjvuDocument;
pub use parser::DjvuParser;

pub const FORMAT_NAME: &str = "djvu";

/// DjVu magic bytes: AT&TFORM
const DJVU_MAGIC: &[u8] = b"AT&TFORM";

/// Check if data looks like a DjVu file.
pub fn is_djvu_file(data: &[u8]) -> bool {
    if data.len() < 12 {
        return false;
    }
    &data[..8] == DJVU_MAGIC
}
