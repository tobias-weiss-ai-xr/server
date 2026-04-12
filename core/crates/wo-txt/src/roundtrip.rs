//! Roundtrip implementation for TXT format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize-parse cycles.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::parser::{TxtDocument, TxtParser};
use crate::serializer::{SerializeOptions, TxtSerializer};

/// Roundtrip handler for TXT format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct TxtRoundtrip {
    doc: RefCell<Option<TxtDocument>>,
}

impl TxtRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for TxtRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for TxtRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = TxtParser::new();
        let doc = parser.parse(data).map_err(|e| format!("{e}"))?;
        *self.doc.borrow_mut() = Some(doc);
        Ok(())
    }

    fn serialize(&self) -> Result<Vec<u8>, String> {
        let doc = self.doc.borrow();
        let doc = doc.as_ref().ok_or("No document parsed")?;
        // Use Unix options (LF, no BOM) for identity roundtrip
        let serializer = TxtSerializer::with_options(SerializeOptions::unix());
        serializer.serialize(doc).map_err(|e| format!("{e}"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roundtrip_ascii() {
        let rt = TxtRoundtrip::new();
        let input = b"Hello World\nLine 2\nLine 3";
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        assert_eq!(output, input);
    }

    #[test]
    fn test_roundtrip_utf8_bom() {
        let rt = TxtRoundtrip::new();
        let input = &[0xEF, 0xBB, 0xBF, 0x68, 0xC3, 0xA9, 0x6C, 0x6C, 0x6F, 0x0A]; // BOM + "Héllo\n"
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        // Should serialize without BOM (Unix options)
        assert!(!output.starts_with(&[0xEF, 0xBB, 0xBF]));
        // Note: parser strips trailing newline from single line, serializer doesn't add trailing newline
        assert_eq!(output, b"h\xc3\xa9llo");
    }

    #[test]
    fn test_roundtrip_crlf() {
        let rt = TxtRoundtrip::new();
        let input = b"Line 1\r\nLine 2\r\nLine 3";
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        // Should serialize with LF (Unix options)
        assert!(!output.contains(&b'\r'));
        assert_eq!(output, b"Line 1\nLine 2\nLine 3");
    }
}
