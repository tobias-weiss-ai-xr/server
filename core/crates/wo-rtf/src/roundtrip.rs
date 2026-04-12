//! Roundtrip implementation for RTF format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize-parse cycles.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::parser::RtfParser;
use crate::serializer::RtfSerializer;

/// Roundtrip handler for RTF format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct RtfRoundtrip {
    doc: RefCell<Option<crate::model::RtfDocument>>,
}

impl RtfRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for RtfRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for RtfRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = RtfParser::new();
        let doc = parser.parse(data).map_err(|e| format!("{e}"))?;
        *self.doc.borrow_mut() = Some(doc);
        Ok(())
    }

    fn serialize(&self) -> Result<Vec<u8>, String> {
        let doc = self.doc.borrow();
        let doc = doc.as_ref().ok_or("No document parsed")?;
        let serializer = RtfSerializer::new();
        let output = serializer.serialize(doc);
        Ok(output.into_bytes())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roundtrip_simple() {
        let rt = RtfRoundtrip::new();
        let input = br#"{\rtf1\ansi\f0\fs24 Hello World\par}"#;
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        // Output should be valid RTF
        assert!(String::from_utf8_lossy(&output).contains("\\rtf1"));
        assert!(String::from_utf8_lossy(&output).contains("Hello World"));
    }

    #[test]
    fn test_roundtrip_with_formatting() {
        let rt = RtfRoundtrip::new();
        let input = br#"{\rtf1\ansi\f0\fs24 \b Bold\b0  text\par}"#;
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        assert!(String::from_utf8_lossy(&output).contains("\\b "));
        assert!(String::from_utf8_lossy(&output).contains("Bold"));
    }

    #[test]
    fn test_roundtrip_with_italic() {
        let rt = RtfRoundtrip::new();
        let input = br#"{\rtf1\ansi\f0\fs24 \i Italic\i0  text\par}"#;
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        assert!(String::from_utf8_lossy(&output).contains("\\i "));
        assert!(String::from_utf8_lossy(&output).contains("Italic"));
    }
}
