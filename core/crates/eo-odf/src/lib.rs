// eo-odf -- World-Office ODF format engine
//!
//! Pure Rust implementation of ODF (OpenDocument Format) parsing.
//! Supports ODT (text), ODS (spreadsheet), ODP (presentation).
//! ODF is a ZIP-based format using XML defined by OASIS/ISO 26300.

pub mod model;
pub mod parser;

pub use model::OdfDocument;
pub use parser::OdfParser;

pub const FORMAT_NAME: &str = "odf";

/// Check if data is a ZIP containing ODF markers.
pub fn is_odf_file(data: &[u8]) -> bool {
    if data.len() < 4 {
        return false;
    }
    if data[0] != 0x50 || data[1] != 0x4B {
        return false;
    }
    // ODF files contain META-INF/manifest.xml with specific MIME types
    let cursor = std::io::Cursor::new(data);
    if let Ok(mut archive) = zip::ZipArchive::new(cursor) {
        // Check for mimetype file (first entry, uncompressed in ODF spec)
        if let Ok(mut mimetype) = archive.by_name("mimetype") {
            let mut buf = String::new();
            if std::io::Read::read_to_string(&mut mimetype, &mut buf).is_ok() {
                return buf.trim().starts_with("application/vnd.oasis.opendocument");
            }
        }
        // Fallback: check for META-INF/manifest.xml
        if archive.by_name("META-INF/manifest.xml").is_ok() {
            return true;
        }
    }
    false
}
