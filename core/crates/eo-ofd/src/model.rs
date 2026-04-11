//! OFD document model.
//!
//! Represents the structure of an Open Fixed-layout Document.

use serde::{Deserialize, Serialize};

/// A parsed OFD document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfdDocument {
    /// OFD version string.
    pub version: Option<String>,
    /// Document body with metadata.
    pub doc_body: Option<OfdDocBody>,
    /// Total page count.
    pub page_count: u32,
    /// Parsed pages.
    pub pages: Vec<OfdPage>,
    /// Referenced resources.
    pub resources: Vec<OfdResource>,
}

/// Document body metadata (from DocBody element).
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct OfdDocBody {
    pub doc_id: Option<String>,
    pub title: Option<String>,
    pub author: Option<String>,
    pub creation_date: Option<String>,
    pub mod_date: Option<String>,
    pub doc_root: Option<String>,
}

/// A single page in the OFD document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfdPage {
    /// Page ID.
    pub id: Option<String>,
    /// Page index (0-based).
    pub index: u32,
    /// Page width in millimeters.
    pub width: f64,
    /// Page height in millimeters.
    pub height: f64,
    /// Base URI for the page content file.
    pub base_loc: Option<String>,
    /// Extracted text content from the page.
    pub text_content: Vec<OfdTextObject>,
    /// Image references on the page.
    pub image_refs: Vec<OfdImageObject>,
}

/// A text object extracted from a page.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfdTextObject {
    /// Boundary rectangle (x, y, width, height) in millimeters.
    pub boundary: Option<(f64, f64, f64, f64)>,
    /// Text content.
    pub text: String,
    /// Font ID reference.
    pub font_id: Option<String>,
    /// Font size in points.
    pub font_size: Option<f64>,
    /// Whether text is bold.
    pub bold: bool,
    /// Whether text is italic.
    pub italic: bool,
}

/// An image object reference from a page.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfdImageObject {
    /// Boundary rectangle (x, y, width, height) in millimeters.
    pub boundary: Option<(f64, f64, f64, f64)>,
    /// Resource ID reference.
    pub resource_id: Option<String>,
    /// Image format (PNG, JPEG, etc.).
    pub format: Option<String>,
    /// Optional alternative text.
    pub alt_text: Option<String>,
}

/// A resource reference.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfdResource {
    /// Resource URI/path.
    pub uri: String,
    /// Resource type (font, image, multimedia, etc.).
    pub resource_type: String,
}
