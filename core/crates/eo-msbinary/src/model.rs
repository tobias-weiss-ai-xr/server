use serde::{Deserialize, Serialize};

/// Legacy Microsoft binary format types.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BinaryFormat {
    /// Microsoft Word Binary (.doc)
    Word,
    /// Microsoft Excel Binary (.xls / BIFF)
    Excel,
    /// Microsoft PowerPoint (.ppt / OLE compound)
    PowerPoint,
    /// Unknown binary format
    Unknown,
}

/// Parsed legacy binary document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MsBinaryDocument {
    /// Detected format type.
    pub format: BinaryFormat,
    /// File size in bytes.
    pub file_size: u64,
    /// Whether the file is an OLE compound document.
    pub is_ole: bool,
    /// OLE class name (e.g., "Word.Document.8").
    pub ole_class: Option<String>,
    /// Version detected from magic bytes.
    pub version: Option<String>,
    /// Raw metadata extracted from binary headers.
    pub metadata: BinaryMetadata,
}

/// Metadata extracted from binary file headers.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BinaryMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub creation_time: Option<String>,
    pub modification_time: Option<String>,
    pub application: Option<String>,
}
