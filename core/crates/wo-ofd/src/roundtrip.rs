//! Roundtrip implementation for OFD format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize-parse cycles using JSON serialization.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::model::OfdDocument;
use crate::parser::OfdParser;

/// Roundtrip handler for OFD format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct OfdRoundtrip {
    doc: RefCell<Option<OfdDocument>>,
}

impl OfdRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for OfdRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for OfdRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = OfdParser::new();
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

    fn create_test_ofd() -> Vec<u8> {
        let mut writer = ArchiveWriter::new().unwrap();
        writer.add_file("OFD.xml", OFD_XML.as_bytes()).unwrap();
        writer
            .add_file("Doc_0/Document.xml", DOCUMENT_XML.as_bytes())
            .unwrap();
        writer
            .add_file("Doc_0/Pages/Page_0.xml", PAGE_XML.as_bytes())
            .unwrap();
        writer.finish().unwrap()
    }

    const OFD_XML: &str = r##"<?xml version="1.0" encoding="UTF-8"?>
<OFD Version="1.0">
  <DocBody>
    <DocRoot FileLoc="Doc_0/Document.xml"/>
  </DocBody>
</OFD>"##;

    const DOCUMENT_XML: &str = r##"<?xml version="1.0" encoding="UTF-8"?>
<Document>
  <CommonData>
    <MaxUnitID>100</MaxUnitID>
    <PageArea>
      <PhysicalBox>0 0 210 297</PhysicalBox>
    </PageArea>
  </CommonData>
  <Pages>
    <Page ID="1" BaseLoc="Pages/Page_0.xml"/>
  </Pages>
  <DocInfo>
    <DocID>test-ofd-001</DocID>
    <Title>Test OFD Document</Title>
    <Author>World Office</Author>
    <CreationDate>2026-01-01</CreationDate>
    <ModDate>2026-01-01</ModDate>
  </DocInfo>
</Document>"##;

    const PAGE_XML: &str = r##"<?xml version="1.0" encoding="UTF-8"?>
<Page ID="1">
  <Content>
    <Layer>
      <TextObject Boundary="30 50 150 20" Font="1" Size="12">
        <TextCode>X=30 Y=50</TextCode>
      </TextObject>
    </Layer>
  </Content>
  <PageArea>
    <PhysicalBox>0 0 210 297</PhysicalBox>
  </PageArea>
</Page>"##;

    #[test]
    fn test_roundtrip_minimal() {
        let rt = OfdRoundtrip::new();
        let input = create_test_ofd();
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        // Output should be valid JSON
        let json_str = String::from_utf8(output).unwrap();
        assert!(json_str.contains("\"version\""));
        assert!(json_str.contains("\"page_count\""));
        assert!(json_str.contains("\"pages\""));
    }

    #[test]
    fn test_roundtrip_with_metadata() {
        let rt = OfdRoundtrip::new();
        let input = create_test_ofd();
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        let json_str = String::from_utf8(output).unwrap();
        assert!(json_str.contains("\"doc_body\""));
        assert!(json_str.contains("\"title\""));
        assert!(json_str.contains("\"Test OFD Document\""));
        assert!(json_str.contains("\"World Office\""));
    }

    #[test]
    fn test_roundtrip_with_pages() {
        let rt = OfdRoundtrip::new();
        let input = create_test_ofd();
        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        let json_str = String::from_utf8(output).unwrap();
        assert!(json_str.contains("\"pages\""));
        assert!(json_str.contains("\"width\""));
        assert!(json_str.contains("\"height\""));
    }
}
