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
