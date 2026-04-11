/// Core error type.
#[derive(Debug, thiserror::Error)]
pub enum CoreError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Parse error in {format}: {message}")]
    Parse { format: String, message: String },

    #[error("Serialization error: {0}")]
    Serialization(String),

    #[error("Unsupported format: {0}")]
    UnsupportedFormat(String),

    #[error("Invalid input: {message}")]
    InvalidInput { message: String },
}
