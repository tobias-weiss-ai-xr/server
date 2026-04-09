use serde::{Deserialize, Serialize};

/// Conversion input specification.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionInput {
    /// Source format (e.g., "docx", "pdf", "odt").
    pub source_format: String,
    /// Target format (e.g., "pdf", "odt", "docx").
    pub target_format: String,
    /// Input document bytes.
    pub data: Vec<u8>,
    /// Conversion options.
    pub options: ConversionOptions,
}

/// Conversion output.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionOutput {
    /// Output document bytes.
    pub data: Vec<u8>,
    /// Output format.
    pub format: String,
    /// Number of pages in the output.
    pub page_count: Option<u32>,
    /// Warnings encountered during conversion.
    pub warnings: Vec<String>,
}

/// Conversion result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionResult {
    pub status: ConversionStatus,
    pub output: Option<ConversionOutput>,
    pub error: Option<String>,
    pub duration_ms: u64,
}

/// Conversion status.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConversionStatus {
    Success,
    PartialSuccess,
    Failed,
    UnsupportedFormat,
    Timeout,
}

/// Conversion options.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ConversionOptions {
    pub page_range: Option<(u32, u32)>,
    pub quality: Option<u8>,
    pub password: Option<String>,
    pub embed_fonts: bool,
    pub pdfa_compliant: bool,
}
