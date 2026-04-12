//! Roundtrip implementation for DOCX renderer.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-render cycles. For a renderer, the roundtrip is:
//! parse DOCX → render to PDF → serialize returns PDF bytes.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::model::RenderConfig;
use crate::pipeline::DocxRenderPipeline;

/// Roundtrip handler for DOCX renderer.
///
/// Stores rendered PDF output internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct DocxRendererRoundtrip {
    config: RenderConfig,
    output: RefCell<Option<Vec<u8>>>,
}

impl DocxRendererRoundtrip {
    /// Create a new roundtrip handler with default configuration.
    pub fn new() -> Self {
        Self {
            config: RenderConfig::default(),
            output: RefCell::new(None),
        }
    }

    /// Create a new roundtrip handler with custom configuration.
    pub fn with_config(config: RenderConfig) -> Self {
        Self {
            config,
            output: RefCell::new(None),
        }
    }
}

impl Default for DocxRendererRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for DocxRendererRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let pipeline = DocxRenderPipeline::new(self.config.clone());
        let result = pipeline
            .render(data)
            .map_err(|e| format!("Render failed: {}", e))?;

        // Extract PDF bytes from the render result
        let pdf_bytes = match result.output {
            crate::model::RenderOutput::Pdf(bytes) => bytes,
            _ => return Err("Expected PDF output".to_string()),
        };

        *self.output.borrow_mut() = Some(pdf_bytes);
        Ok(())
    }

    fn serialize(&self) -> Result<Vec<u8>, String> {
        let output = self.output.borrow();
        let output = output.as_ref().ok_or("No document rendered")?;
        Ok(output.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    /// Create a minimal valid DOCX ZIP file for testing.
    fn create_minimal_docx() -> Vec<u8> {
        let mut buf = Vec::new();
        {
            let mut zip = zip::ZipWriter::new(std::io::Cursor::new(&mut buf));

            // [Content_Types].xml
            zip.start_file(
                "[Content_Types].xml",
                zip::write::SimpleFileOptions::default(),
            )
            .unwrap();
            zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"#)
            .unwrap();

            // _rels/.rels
            zip.start_file("_rels/.rels", zip::write::SimpleFileOptions::default())
                .unwrap();
            zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"#)
            .unwrap();

            // word/document.xml
            zip.start_file(
                "word/document.xml",
                zip::write::SimpleFileOptions::default(),
            )
            .unwrap();
            zip.write_all(
                br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>Hello World</w:t></w:r></w:p></w:body>
</w:document>"#,
            )
            .unwrap();

            zip.finish().unwrap();
        }
        buf
    }

    #[test]
    fn test_roundtrip_minimal() {
        let rt = DocxRendererRoundtrip::new();
        let input = create_minimal_docx();

        // Parse (render DOCX to PDF)
        rt.parse(&input).expect("parse should succeed");

        // Serialize (return PDF bytes)
        let output = rt.serialize().expect("serialize should succeed");

        // Verify output is non-empty
        assert!(!output.is_empty(), "PDF output should not be empty");
        assert!(output.len() > 100, "PDF should have some content");
    }

    #[test]
    fn test_roundtrip_default() {
        let rt = DocxRendererRoundtrip::default();
        let input = create_minimal_docx();

        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        assert!(!output.is_empty());
    }

    #[test]
    fn test_roundtrip_serialize_before_parse() {
        let rt = DocxRendererRoundtrip::new();
        let result = rt.serialize();

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "No document rendered");
    }

    #[test]
    fn test_roundtrip_with_config() {
        let config = RenderConfig::default();
        let rt = DocxRendererRoundtrip::with_config(config);
        let input = create_minimal_docx();

        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        assert!(!output.is_empty());
    }
}
