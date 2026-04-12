//! Roundtrip implementation for XPS format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize-parse cycles using JSON serialization.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::model::XpsDocument;
use crate::parser::XpsParser;

/// Roundtrip handler for XPS format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct XpsRoundtrip {
    doc: RefCell<Option<XpsDocument>>,
}

impl XpsRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for XpsRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for XpsRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = XpsParser::new();
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
    use wo_office_utils::ArchiveWriter;

    fn make_xps_zip(entries: &[(&str, &[u8])]) -> Vec<u8> {
        let mut writer = ArchiveWriter::new().unwrap();
        for &(name, data) in entries {
            writer.add_file(name, data).unwrap();
        }
        writer.finish().unwrap()
    }

    const MINIMAL_REL: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/Documents/1/FixedDocSeq.fdseq" Type="http://schemas.microsoft.com/xps/2005/06/fixed-document-sequence"/>
</Relationships>"#;

    const CONTENT_TYPES: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".fpage" ContentType="application/vnd.ms-package.xps-fixedpage+xml"/>
  <Default Extension=".rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
</Types>"#;

    const EMPTY_FPAGE: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<FixedPage Width="816" Height="1056" xmlns="http://schemas.microsoft.com/xps/2005/06" xml:lang="en-US">
</FixedPage>"#;

    const FPAGE_WITH_GLYPHS: &[u8] = br##"<?xml version="1.0" encoding="UTF-8"?>
<FixedPage Width="612" Height="792" xmlns="http://schemas.microsoft.com/xps/2005/06" xml:lang="en-US">
  <Glyphs UnicodeString="Hello World" FontUri="/Documents/1/Resources/Fonts/Arial.ttf"
           FontRenderingEmSize="24" OriginX="72" OriginY="120" Fill="#FF000000"/>
</FixedPage>"##;

    const CORE_METADATA: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<coreProperties xmlns="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:title>Test Document</dc:title>
  <dc:creator>Test Author</dc:creator>
  <dc:subject>XPS Parsing Test</dc:subject>
  <dcterms:created>2025-01-01T00:00:00Z</dcterms:created>
</coreProperties>"#;

    #[test]
    fn test_roundtrip_minimal() {
        let rt = XpsRoundtrip::new();
        let input = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Pages/1.fpage", EMPTY_FPAGE),
        ]);
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        // Output should be valid JSON
        let json_str = String::from_utf8(output).unwrap();
        assert!(json_str.contains("\"page_count\""));
        assert!(json_str.contains("\"pages\""));
        assert!(json_str.contains("\"relationships\""));
    }

    #[test]
    fn test_roundtrip_with_glyphs() {
        let rt = XpsRoundtrip::new();
        let input = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Pages/1.fpage", FPAGE_WITH_GLYPHS),
        ]);
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        let json_str = String::from_utf8(output).unwrap();
        assert!(json_str.contains("\"glyphs\""));
        assert!(json_str.contains("\"Hello World\""));
    }

    #[test]
    fn test_roundtrip_with_metadata() {
        let rt = XpsRoundtrip::new();
        let input = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Pages/1.fpage", EMPTY_FPAGE),
            ("Documents/1/Metadata/Core.xml", CORE_METADATA),
        ]);
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        let json_str = String::from_utf8(output).unwrap();
        assert!(json_str.contains("\"metadata\""));
        assert!(json_str.contains("\"title\""));
        assert!(json_str.contains("\"Test Document\""));
    }
}
