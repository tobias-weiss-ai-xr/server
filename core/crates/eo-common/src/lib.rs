// eo-common -- World-Office core engine crate

// Part of the World-Office document engine.

#[cfg(test)]
pub mod test_harness;

pub mod document;
pub mod error;

/// A parsed document in memory.
#[derive(Debug, Clone)]
pub struct Document {
    pub content: Vec<u8>,
    pub format: String,
    pub metadata: DocumentMetadata,
}

/// Document metadata.
#[derive(Debug, Clone, Default)]
pub struct DocumentMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub page_count: Option<u32>,
    pub word_count: Option<u32>,
}

/// Result type for core operations.
pub type Result<T> = std::result::Result<T, error::CoreError>;
