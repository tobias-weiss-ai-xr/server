//! Roundtrip implementation for DjVu format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize-parse cycles using JSON serialization.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::model::DjvuDocument;
use crate::parser::DjvuParser;

/// Roundtrip handler for DjVu format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct DjvuRoundtrip {
    doc: RefCell<Option<DjvuDocument>>,
}

impl DjvuRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for DjvuRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for DjvuRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = DjvuParser::new();
        let doc = parser.parse(data).map_err(|e| format!("{e}"))?;
        *self.doc.borrow_mut() = Some(doc);
        Ok(())
    }

    fn serialize(&self) -> Result<Vec<u8>, String> {
        let doc = self.doc.borrow();
        let doc = doc.as_ref().ok_or("No document parsed")?;
        serde_json::to_vec_pretty(doc).map_err(|e| format!("JSON serialize failed: {e}"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper to build a minimal valid DjVu file for testing
    fn build_test_djvu(width: u16, height: u16, title: &str) -> Vec<u8> {
        let mut out = Vec::new();

        // Magic + subtype
        out.extend_from_slice(b"AT&TFORMDJVU");

        // INFO chunk
        let mut info_data = Vec::new();
        info_data.extend_from_slice(&width.to_be_bytes());
        info_data.extend_from_slice(&height.to_be_bytes());
        info_data.push(25); // minor version
        info_data.push(0); // major version
        info_data.push(72); // dpi
        info_data.push(22); // gamma
        info_data.extend_from_slice(title.as_bytes());
        info_data.push(0); // null terminator

        out.extend_from_slice(b"INFO");
        out.extend_from_slice(&(info_data.len() as u32).to_be_bytes());
        out.extend_from_slice(&info_data);

        out
    }

    #[test]
    fn test_roundtrip_minimal() {
        let rt = DjvuRoundtrip::new();
        let input = build_test_djvu(800, 600, "Test Document");
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        // Output should be valid JSON
        let json_str = String::from_utf8(output).unwrap();
        assert!(json_str.contains("\"subtype\""));
        assert!(json_str.contains("\"DJVU\""));
        assert!(json_str.contains("\"title\""));
        assert!(json_str.contains("\"Test Document\""));
    }

    #[test]
    fn test_roundtrip_no_title() {
        let rt = DjvuRoundtrip::new();
        let input = build_test_djvu(1024, 768, "");
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        let json_str = String::from_utf8(output).unwrap();
        // Pretty-printed JSON may have spaces after colon
        assert!(json_str.contains("1024") && json_str.contains("768"));
    }

    #[test]
    fn test_roundtrip_unicode_title() {
        let rt = DjvuRoundtrip::new();
        let input = build_test_djvu(800, 600, "文档测试");
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        let json_str = String::from_utf8(output).unwrap();
        assert!(json_str.contains("\"title\""));
        assert!(json_str.contains("\"文档测试\""));
    }
}
