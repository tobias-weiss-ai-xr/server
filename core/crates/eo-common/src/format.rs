/// Document format registry and identification.
use serde::{Deserialize, Serialize};
use std::str::FromStr;

/// All supported document formats.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DocumentFormat {
    // Plain text
    Txt,

    // E-book formats
    Fb2, // FictionBook 2.0
    Epub,

    // Web formats
    Html,

    // Open Document Format
    Odt,
    Ods,
    Odp,

    // Microsoft Office Open XML
    Docx,
    Xlsx,
    Pptx,

    // Rich Text Format
    Rtf,

    // PDF
    Pdf,

    // Fixed-layout formats
    Xps,
    Ofd, // Open Fixed-layout Document (Chinese standard)
    Djvu,

    // Spreadsheet
    Hwp, // Hangul Word Processor
    Csv,

    // Legacy binary
    Doc,
    Xls,
    Ppt,
}

impl DocumentFormat {
    /// Get the canonical file extension (without dot).
    pub fn extension(&self) -> &'static str {
        match self {
            DocumentFormat::Txt => "txt",
            DocumentFormat::Fb2 => "fb2",
            DocumentFormat::Epub => "epub",
            DocumentFormat::Html => "html",
            DocumentFormat::Odt => "odt",
            DocumentFormat::Ods => "ods",
            DocumentFormat::Odp => "odp",
            DocumentFormat::Docx => "docx",
            DocumentFormat::Xlsx => "xlsx",
            DocumentFormat::Pptx => "pptx",
            DocumentFormat::Rtf => "rtf",
            DocumentFormat::Pdf => "pdf",
            DocumentFormat::Xps => "xps",
            DocumentFormat::Ofd => "ofd",
            DocumentFormat::Djvu => "djvu",
            DocumentFormat::Hwp => "hwp",
            DocumentFormat::Csv => "csv",
            DocumentFormat::Doc => "doc",
            DocumentFormat::Xls => "xls",
            DocumentFormat::Ppt => "ppt",
        }
    }

    /// Get the MIME type for this format.
    pub fn mime_type(&self) -> &'static str {
        match self {
            DocumentFormat::Txt => "text/plain",
            DocumentFormat::Fb2 => "application/x-fictionbook",
            DocumentFormat::Epub => "application/epub+zip",
            DocumentFormat::Html => "text/html",
            DocumentFormat::Odt => "application/vnd.oasis.opendocument.text",
            DocumentFormat::Ods => "application/vnd.oasis.opendocument.spreadsheet",
            DocumentFormat::Odp => "application/vnd.oasis.opendocument.presentation",
            DocumentFormat::Docx => {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            }
            DocumentFormat::Xlsx => {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
            DocumentFormat::Pptx => {
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            }
            DocumentFormat::Rtf => "application/rtf",
            DocumentFormat::Pdf => "application/pdf",
            DocumentFormat::Xps => "application/vnd.ms-xpsdocument",
            DocumentFormat::Ofd => "application/ofd",
            DocumentFormat::Djvu => "image/vnd.djvu",
            DocumentFormat::Hwp => "application/x-hwp",
            DocumentFormat::Csv => "text/csv",
            DocumentFormat::Doc => "application/msword",
            DocumentFormat::Xls => "application/vnd.ms-excel",
            DocumentFormat::Ppt => "application/vnd.ms-powerpoint",
        }
    }

    /// Detect format from a file extension (case-insensitive, without dot).
    pub fn from_extension(ext: &str) -> Option<DocumentFormat> {
        match ext.to_lowercase().as_str() {
            "txt" => Some(DocumentFormat::Txt),
            "fb2" => Some(DocumentFormat::Fb2),
            "epub" => Some(DocumentFormat::Epub),
            "html" | "htm" => Some(DocumentFormat::Html),
            "odt" => Some(DocumentFormat::Odt),
            "ods" => Some(DocumentFormat::Ods),
            "odp" => Some(DocumentFormat::Odp),
            "docx" => Some(DocumentFormat::Docx),
            "xlsx" => Some(DocumentFormat::Xlsx),
            "pptx" => Some(DocumentFormat::Pptx),
            "rtf" => Some(DocumentFormat::Rtf),
            "pdf" => Some(DocumentFormat::Pdf),
            "xps" => Some(DocumentFormat::Xps),
            "ofd" => Some(DocumentFormat::Ofd),
            "djvu" | "djv" => Some(DocumentFormat::Djvu),
            "hwp" => Some(DocumentFormat::Hwp),
            "csv" => Some(DocumentFormat::Csv),
            "doc" => Some(DocumentFormat::Doc),
            "xls" => Some(DocumentFormat::Xls),
            "ppt" => Some(DocumentFormat::Ppt),
            _ => None,
        }
    }

    /// Detect format from a file path (extracts extension first).
    pub fn from_path(path: &std::path::Path) -> Option<DocumentFormat> {
        path.extension()
            .and_then(|ext| ext.to_str())
            .and_then(DocumentFormat::from_extension)
    }

    /// Magic bytes for quick format identification.
    /// Returns Some(format) if the bytes match a known signature.
    pub fn from_magic_bytes(data: &[u8]) -> Option<DocumentFormat> {
        if data.len() < 4 {
            return None;
        }

        // PDF: %PDF
        if data.starts_with(b"%PDF") {
            return Some(DocumentFormat::Pdf);
        }

        // ZIP-based formats (DOCX, XLSX, PPTX, ODT, EPUB, FB2/ZIP)
        if data.starts_with(b"PK\x03\x04") {
            // Check for specific markers inside the ZIP
            if data.len() > 30 {
                // OOXML: look for [Content_Types].xml marker
                let content = &data[30..data.len().min(8192)];
                if contains_utf8(content, "[Content_Types].xml") {
                    return Some(DocumentFormat::Docx); // Default OOXML
                }
                // ODF: look for META-INF/manifest.xml
                if contains_utf8(content, "META-INF/manifest.xml") {
                    return Some(DocumentFormat::Odt); // Default ODF
                }
                // EPUB: look for mimetype entry
                if contains_utf8(content, "mimetype") {
                    return Some(DocumentFormat::Epub);
                }
            }
            return None;
        }

        // HTML: look for <html or <!DOCTYPE html
        if data.len() > 5 {
            let head = &data[..data.len().min(1024)];
            let head_str = String::from_utf8_lossy(head).to_lowercase();
            if head_str.contains("<html") || head_str.contains("<!doctype html") {
                return Some(DocumentFormat::Html);
            }
        }

        // RTF: {\rtf
        if data.starts_with(b"{\\rtf") || data.starts_with(b"{\\RTF") {
            return Some(DocumentFormat::Rtf);
        }

        None
    }

    /// Whether this is a plain text format (no binary parsing needed).
    pub fn is_text(&self) -> bool {
        matches!(self, DocumentFormat::Txt | DocumentFormat::Csv)
    }

    /// Whether this is a ZIP-based format.
    pub fn is_zip_based(&self) -> bool {
        matches!(
            self,
            DocumentFormat::Docx
                | DocumentFormat::Xlsx
                | DocumentFormat::Pptx
                | DocumentFormat::Odt
                | DocumentFormat::Ods
                | DocumentFormat::Odp
                | DocumentFormat::Epub
        )
    }

    /// Whether this format is in Phase 2 (small formats).
    pub fn is_phase2(&self) -> bool {
        matches!(
            self,
            DocumentFormat::Txt
                | DocumentFormat::Fb2
                | DocumentFormat::Html
                | DocumentFormat::Xps
                | DocumentFormat::Ofd
                | DocumentFormat::Djvu
                | DocumentFormat::Epub
        )
    }
}

impl FromStr for DocumentFormat {
    type Err = String;

    fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
        DocumentFormat::from_extension(s)
            .or_else(|| match s.to_lowercase().as_str() {
                "text" => Some(DocumentFormat::Txt),
                _ => None,
            })
            .ok_or_else(|| format!("Unknown format: {}", s))
    }
}

impl std::fmt::Display for DocumentFormat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.extension())
    }
}

/// Check if a byte slice contains a UTF-8 string (case-insensitive).
fn contains_utf8(data: &[u8], needle: &str) -> bool {
    let lower_data = String::from_utf8_lossy(data).to_lowercase();
    lower_data.contains(&needle.to_lowercase())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extension_roundtrip() {
        for format in &[
            DocumentFormat::Txt,
            DocumentFormat::Fb2,
            DocumentFormat::Html,
            DocumentFormat::Docx,
            DocumentFormat::Pdf,
        ] {
            let ext = format.extension();
            let parsed = DocumentFormat::from_extension(ext);
            assert_eq!(parsed, Some(*format), "Failed roundtrip for {:?}", format);
        }
    }

    #[test]
    fn test_from_path() {
        assert_eq!(
            DocumentFormat::from_path(std::path::Path::new("test.txt")),
            Some(DocumentFormat::Txt)
        );
        assert_eq!(
            DocumentFormat::from_path(std::path::Path::new("document.DOCX")),
            Some(DocumentFormat::Docx)
        );
        assert_eq!(
            DocumentFormat::from_path(std::path::Path::new("noext")),
            None
        );
    }

    #[test]
    fn test_magic_pdf() {
        assert_eq!(
            DocumentFormat::from_magic_bytes(b"%PDF-1.4"),
            Some(DocumentFormat::Pdf)
        );
    }

    #[test]
    fn test_magic_rtf() {
        assert_eq!(
            DocumentFormat::from_magic_bytes(b"{\\rtf1\\ansi"),
            Some(DocumentFormat::Rtf)
        );
    }

    #[test]
    fn test_magic_html() {
        let html = b"<!DOCTYPE html><html><head></head></html>";
        assert_eq!(
            DocumentFormat::from_magic_bytes(html),
            Some(DocumentFormat::Html)
        );
    }

    #[test]
    fn test_magic_too_short() {
        assert_eq!(DocumentFormat::from_magic_bytes(b"abc"), None);
    }

    #[test]
    fn test_is_text() {
        assert!(DocumentFormat::Txt.is_text());
        assert!(DocumentFormat::Csv.is_text());
        assert!(!DocumentFormat::Docx.is_text());
    }

    #[test]
    fn test_is_zip_based() {
        assert!(DocumentFormat::Docx.is_zip_based());
        assert!(DocumentFormat::Epub.is_zip_based());
        assert!(!DocumentFormat::Txt.is_zip_based());
    }
}
