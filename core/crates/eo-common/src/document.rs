use serde::{Deserialize, Serialize};

/// A parsed document in memory.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    /// Raw document content as bytes.
    pub content: Vec<u8>,
    /// Format identifier (e.g., "txt", "docx").
    pub format: String,
    /// Document metadata.
    pub metadata: DocumentMetadata,
}

/// Document metadata.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub page_count: Option<u32>,
    pub word_count: Option<u32>,
    /// Character encoding detected during parsing.
    pub encoding: Option<String>,
    /// Line count (for text formats).
    pub line_count: Option<u32>,
}
