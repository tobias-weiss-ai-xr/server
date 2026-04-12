//! Roundtrip implementation for HTML format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize-parse cycles.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::parser::HtmlParser;
use crate::serializer::HtmlSerializer;

/// Roundtrip handler for HTML format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct HtmlRoundtrip {
    doc: RefCell<Option<crate::model::HtmlDocument>>,
}

impl HtmlRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for HtmlRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for HtmlRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = HtmlParser::new();
        let doc = parser.parse(data).map_err(|e| format!("{e}"))?;
        *self.doc.borrow_mut() = Some(doc);
        Ok(())
    }

    fn serialize(&self) -> Result<Vec<u8>, String> {
        let doc = self.doc.borrow();
        let doc = doc.as_ref().ok_or("No document parsed")?;
        let serializer = HtmlSerializer::new();
        let output = serializer.serialize(doc);
        Ok(output.into_bytes())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roundtrip_simple() {
        let rt = HtmlRoundtrip::new();
        let input = b"<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello</p></body></html>";
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        // Output should be valid HTML
        assert!(String::from_utf8_lossy(&output).contains("<html>"));
        assert!(String::from_utf8_lossy(&output).contains("Hello"));
    }

    #[test]
    fn test_roundtrip_with_formatting() {
        let rt = HtmlRoundtrip::new();
        let input = b"<!DOCTYPE html><html><head><title>Test</title></head><body><p><strong>Bold</strong> text</p></body></html>";
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        assert!(String::from_utf8_lossy(&output).contains("<strong>Bold</strong>"));
    }

    #[test]
    fn test_roundtrip_with_table() {
        let rt = HtmlRoundtrip::new();
        let input = b"<!DOCTYPE html><html><head><title>Test</title></head><body><table><tr><td>A</td><td>B</td></tr></table></body></html>";
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        assert!(String::from_utf8_lossy(&output).contains("<table>"));
    }
}
