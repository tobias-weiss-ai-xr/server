//! Roundtrip implementation for FB2 format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize cycles using JSON as the serialization target.
//!
//! Since FB2 has no format-specific serializer yet, we serialize
//! the parsed model to JSON to verify that the parser produces a
//! complete, serializable model.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::model::Fb2Document;
use crate::parser::Fb2Parser;

/// Roundtrip handler for FB2 format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct Fb2Roundtrip {
    doc: RefCell<Option<Fb2Document>>,
}

impl Fb2Roundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for Fb2Roundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for Fb2Roundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = Fb2Parser::new();
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

    #[test]
    fn test_roundtrip_minimal() {
        let rt = Fb2Roundtrip::new();
        // Use minimal valid FB2 input
        let input = r#"<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
  <description>
    <title-info>
      <genre>fiction</genre>
      <author>
        <first-name>Test</first-name>
        <last-name>Author</last-name>
      </author>
      <book-title>Test Book</book-title>
      <lang>en</lang>
    </title-info>
  </description>
  <body>
    <section>
      <p>Test content</p>
    </section>
  </body>
</FictionBook>"#;
        // Verify parse succeeds and serialization works
        rt.parse(input.as_bytes()).expect("parse should succeed");
        let output = rt.serialize().expect("serialize should succeed");
        // Output should be valid JSON
        let _json: serde_json::Value =
            serde_json::from_slice(&output).expect("output should be valid JSON");
    }
}
