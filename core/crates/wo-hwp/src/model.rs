//! HWP document model.

use serde::{Deserialize, Serialize};

/// HWP file version.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HwpVersion {
    /// HWP 3.x (legacy binary format)
    V3,
    /// HWP 5.x (modern format with sections)
    V5,
    /// Unknown version
    Unknown,
}

/// A parsed HWP document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HwpDocument {
    /// Detected HWP version.
    pub version: HwpVersion,
    /// File signature type.
    pub signature_type: HwpSignatureType,
    /// Document metadata.
    pub metadata: HwpMetadata,
    /// Parsed file header.
    pub header: Option<HwpHeader>,
    /// Document info section.
    pub doc_info: Option<HwpDocInfo>,
    /// Extracted paragraphs.
    pub paragraphs: Vec<HwpParagraph>,
    /// Page count.
    pub page_count: u32,
    /// Paragraph count.
    pub paragraph_count: u32,
    /// Whether the file is compressed.
    pub compressed: bool,
    /// Whether the file uses encryption.
    pub encrypted: bool,
}

/// File signature type detected.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HwpSignatureType {
    /// HWP 5.x signature (EUC-KR encoded "HWPDO")
    Signature5X,
    /// HWP 3.x magic bytes
    Signature3X,
    /// OLE compound document (MS CDF)
    OleCompound,
    /// Unknown format
    Unknown,
}

/// HWP document metadata.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HwpMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub description: Option<String>,
    pub keywords: Vec<String>,
    pub creation_date: Option<String>,
    pub last_modified: Option<String>,
    pub application: Option<String>,
}

/// HWP 5.x file header structure.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HwpHeader {
    /// File signature bytes.
    pub signature: Vec<u8>,
    /// HWP version (major.minor).
    pub version: HwpVersion,
    /// Platform flags.
    pub platform: HwpPlatform,
    /// Compression type.
    pub compression: HwpCompression,
    /// Encryption type.
    pub encryption: HwpEncryption,
    /// Whether password is set.
    pub has_password: bool,
    /// Whether the file has a document summary.
    pub has_summary: bool,
    /// Whether the file has additional streams.
    pub has_extra_streams: bool,
    /// Whether the file uses DRM.
    pub has_drm: bool,
    /// Whether the file has XML template info.
    pub has_template: bool,
}

/// Platform the HWP file was created on.
#[derive(Default, Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HwpPlatform {
    Windows,
    Mac,
    Linux,
    #[default]
    Unknown,
}

/// Compression method used in the HWP file.
#[derive(Default, Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HwpCompression {
    #[default]
    None,
    Hwp5,
    Zip,
    Unknown,
}

/// Encryption method used in the HWP file.
#[derive(Default, Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HwpEncryption {
    #[default]
    None,
    Hwp,
    Unknown,
}

/// A paragraph in HWP document.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HwpParagraph {
    /// Paragraph text content.
    pub text: String,
    /// Paragraph style (justification, indentation, etc.).
    pub justification: Option<String>,
    /// Font name for this paragraph.
    pub font_name: Option<String>,
    /// Font size in points.
    pub font_size: Option<f32>,
    /// Whether text is bold.
    pub bold: bool,
    /// Whether text is italic.
    pub italic: bool,
    /// Whether text is underlined.
    pub underline: bool,
    /// Character spacing.
    pub char_spacing: Option<i32>,
    /// Line spacing.
    pub line_spacing: Option<i32>,
    /// Tab stops.
    pub tab_stops: Vec<HwpTabStop>,
}

/// A tab stop definition within a paragraph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HwpTabStop {
    /// Tab stop position in twips.
    pub position: u32,
    /// Tab stop kind (e.g. "left", "right", "center", "decimal").
    pub kind: String,
    /// Tab leader character (e.g. "dot", "dash", "none").
    pub leader: Option<String>,
}

/// Document info section from HWP 5.x file.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HwpDocInfo {
    /// Title.
    pub title: Option<String>,
    /// Author.
    pub author: Option<String>,
    /// Subject/description.
    pub description: Option<String>,
    /// Keywords.
    pub keywords: Vec<String>,
    /// Creation date.
    pub creation_date: Option<String>,
    /// Modification date.
    pub modification_date: Option<String>,
    /// Application name.
    pub application: Option<String>,
}
