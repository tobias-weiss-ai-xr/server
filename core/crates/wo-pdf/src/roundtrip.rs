//! Roundtrip implementation for PDF format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize-parse cycles using JSON serialization.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::model::PdfDocument;
use crate::parser::PdfParser;

/// Roundtrip handler for PDF format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
/// PDF uses JSON roundtrip since there is no native PDF serializer.
pub struct PdfRoundtrip {
    doc: RefCell<Option<PdfDocument>>,
}

impl PdfRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for PdfRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for PdfRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = PdfParser::new();
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
    fn test_roundtrip_minimal_pdf() {
        let rt = PdfRoundtrip::new();
        // Minimal valid PDF: header + single empty page
        let input = b"%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>
3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>
trailer<</Size 3/Root 1 0 R>>
startxref
4
%%EOF
";
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        assert!(!output.is_empty());
        assert!(output.starts_with(b"{"));
    }

    #[test]
    fn test_roundtrip_with_metadata() {
        let rt = PdfRoundtrip::new();
        // Minimal PDF with metadata
        let input = b"%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
trailer
<< /Size 4 /Root 1 0 R /Info 4 0 R >>
4 0 obj
<< /Title (Test PDF) /Author (World Office) /Creator (wo-pdf) >>
endobj
startxref
190
%%EOF
";
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        let output_str = std::str::from_utf8(&output).unwrap();
        assert!(output_str.contains("Test PDF"));
        assert!(output_str.contains("World Office"));
    }

    #[test]
    fn test_roundtrip_with_text() {
        let rt = PdfRoundtrip::new();
        // Minimal PDF with text content
        let input = b"%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj
trailer
<< /Size 5 /Root 1 0 R >>
startxref
235
%%EOF
";
        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();
        let output_str = std::str::from_utf8(&output).unwrap();
        // Check that the text was extracted and included in JSON
        assert!(output_str.contains("Hello World"));
    }
}
