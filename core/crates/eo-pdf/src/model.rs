use serde::{Deserialize, Serialize};

/// Parsed PDF document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfDocument {
    /// PDF version (e.g., "1.4", "1.7", "2.0").
    pub version: String,
    /// Number of pages.
    pub page_count: u32,
    /// Document metadata.
    pub metadata: PdfMetadata,
    /// Extracted text per page (may be empty for scanned PDFs).
    pub pages: Vec<PdfPage>,
    /// All indirect objects found in the file.
    pub objects: Vec<PdfObject>,
    /// Whether the file is linearized (optimized for web delivery).
    pub linearized: bool,
}

/// PDF document metadata from the Info dictionary.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PdfMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub creator: Option<String>,
    pub producer: Option<String>,
    pub creation_date: Option<String>,
    pub modification_date: Option<String>,
}

/// A single PDF page with extracted text.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfPage {
    /// 1-based page number.
    pub number: u32,
    /// Width in points (1/72 inch).
    pub width: Option<f32>,
    /// Height in points.
    pub height: Option<f32>,
    /// Extracted text content.
    pub text: Option<String>,
    /// Rotation angle (0, 90, 180, 270).
    pub rotation: u32,
}

/// A PDF indirect object.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfObject {
    /// Object number.
    pub obj_num: u32,
    /// Generation number (usually 0).
    pub gen_num: u32,
    /// The object's dictionary entries.
    pub entries: Vec<(String, PdfValue)>,
    /// Raw stream data (for streams).
    pub stream_data: Option<Vec<u8>>,
}

/// PDF value types.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PdfValue {
    Null,
    Boolean(bool),
    Integer(i64),
    Real(f64),
    String(String),
    Name(String),
    Array(Vec<PdfValue>),
    Dictionary(Vec<(String, PdfValue)>),
    Reference {
        obj_num: u32,
        gen_num: u32,
    },
    Stream {
        dict: Vec<(String, PdfValue)>,
        data: Vec<u8>,
    },
}
