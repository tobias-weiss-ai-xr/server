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

// ============================================================================
// OLE Compound Document Types
// ============================================================================

/// OLE Compound Document header (512 bytes).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OleHeader {
    pub magic: [u8; 8],
    pub minor_version: u16,
    pub major_version: u16,
    pub byte_order: u16,        // 0xFFFE = little-endian
    pub sector_size_power: u16, // typically 9 (512 bytes) or 12 (4096)
    pub mini_sector_size_power: u16,
    pub total_dir_sectors: u32,
    pub total_fat_sectors: u32,
    pub first_dir_sector_fat: u32,
    pub mini_stream_cutoff: u32,
    pub first_mini_fat_sector: u32,
    pub total_mini_fat_sectors: u32,
    pub first_difat_sector: u32,
    pub total_difat_sectors: u32,
}

/// A directory entry in the OLE compound document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OleDirectoryEntry {
    pub name: String,
    pub entry_type: OleEntryType,
    pub color: OleColor,      // Red or Black (tree balancing)
    pub left_sibling_id: u32, // DIFAT index, ENDOFCHAIN = 0xFFFFFFFF
    pub right_sibling_id: u32,
    pub child_id: u32,
    pub clsid: [u8; 16],
    pub state_bits: u32,
    pub creation_time: u64,
    pub modification_time: u64,
    pub starting_sector: u32,
    pub stream_size: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OleEntryType {
    Empty,
    Storage,
    Stream,
    RootStorage,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OleColor {
    Red,
    Black,
}

/// Special sector IDs.
pub const ENDOFCHAIN: u32 = 0xFFFFFFFE;
pub const FREESECT: u32 = 0xFFFFFFFF;
pub const NOSTREAM: u32 = 0xFFFFFFFF;
pub const MAXREGSECT: u32 = 0xFFFFFFFA;
