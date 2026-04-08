//! DjVu document model.
//!
//! Represents the structure of a DjVu document.

use serde::{Deserialize, Serialize};

/// A parsed DjVu document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DjvuDocument {
    /// Document subtype (DJVU, DJVM, PM44, etc.).
    pub subtype: String,
    /// Total page count.
    pub page_count: u32,
    /// Document title.
    pub title: Option<String>,
    /// Page width in pixels.
    pub width: u32,
    /// Page height in pixels.
    pub height: u32,
    /// DjVu version string.
    pub version: String,
    /// All IFF chunks found in the file.
    pub chunks: Vec<DjvuChunk>,
}

/// An IFF chunk in the DjVu file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DjvuChunk {
    /// 4-byte chunk type identifier (e.g., "INFO", "Sjbz", "BG44").
    pub chunk_type: String,
    /// Offset within the file where the chunk data starts.
    pub offset: u64,
    /// Size of the chunk data (excluding type and size fields).
    pub size: u64,
}
