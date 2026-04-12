//! Roundtrip implementation for HWP format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize cycles using JSON as the serialization target.
//!
//! Since HWP has no format-specific serializer yet, we serialize
//! the parsed model to JSON to verify that the parser produces a
//! complete, serializable model.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::model::HwpDocument;
use crate::parser::HwpParser;

/// Roundtrip handler for HWP format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct HwpRoundtrip {
    doc: RefCell<Option<HwpDocument>>,
}

impl HwpRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for HwpRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for HwpRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = HwpParser::new();
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

    /// Build a minimal HWP 5.x file for testing.
    fn build_test_hwp5x() -> Vec<u8> {
        let mut data = Vec::new();
        // Signature: "HWPDO" in EUC-KR encoding
        data.extend_from_slice(&[0xC7, 0xD1, 0xD6, 0xB8, 0xB4]);
        // Reserved padding (23 bytes)
        data.extend_from_slice(&[0u8; 23]);
        // Version flags (2 bytes at offset 28-29) — no compression, no encryption
        data.extend_from_slice(&[0x00, 0x00]);
        // Version (2 bytes at offset 30-31)
        data.extend_from_slice(&[0x05, 0x00]);
        // Padding to reach 256 bytes
        data.extend_from_slice(&[0u8; 224]);

        // Add doc info section (record ID 0x0001)
        data.extend_from_slice(&[0x01, 0x00, 0x00, 0x00]); // record ID
        data.extend_from_slice(&[0x0C, 0x00, 0x00, 0x00]); // record size (12 bytes)

        // Title field: tag=1, len=8, UTF-16LE "Test" (8 bytes)
        data.extend_from_slice(&[0x01, 0x00]); // tag
        data.extend_from_slice(&[0x08, 0x00]); // length (8 bytes = 4 UTF-16LE chars)
                                               // "Test" in UTF-16LE
        data.extend_from_slice(&[0x54, 0x00, 0x65, 0x00, 0x73, 0x00, 0x74, 0x00]);

        data
    }

    #[test]
    fn test_roundtrip_minimal() {
        let rt = HwpRoundtrip::new();
        // Build a minimal valid HWP 5.x file
        let input = build_test_hwp5x();
        // Verify parse succeeds and serialization works
        rt.parse(&input).expect("parse should succeed");
        let output = rt.serialize().expect("serialize should succeed");
        // Output should be valid JSON
        let _json: serde_json::Value =
            serde_json::from_slice(&output).expect("output should be valid JSON");
        // Verify the document structure is captured
        let doc_json: serde_json::Value = serde_json::from_slice(&output).unwrap();
        assert!(doc_json["version"].is_string());
        assert!(doc_json["signature_type"].is_string());
    }
}
