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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_parse_display() {
        let err = CoreError::Parse {
            format: "docx".into(),
            message: "missing root element".into(),
        };
        let msg = format!("{}", err);
        assert!(msg.contains("docx"));
        assert!(msg.contains("missing root element"));
    }

    #[test]
    fn test_error_serialization_display() {
        let err = CoreError::Serialization("failed to write".into());
        let msg = format!("{}", err);
        assert!(msg.contains("failed to write"));
    }

    #[test]
    fn test_error_unsupported_format_display() {
        let err = CoreError::UnsupportedFormat("bmp".into());
        let msg = format!("{}", err);
        assert!(msg.contains("bmp"));
    }

    #[test]
    fn test_error_invalid_input_display() {
        let err = CoreError::InvalidInput {
            message: "file is empty".into(),
        };
        let msg = format!("{}", err);
        assert!(msg.contains("file is empty"));
    }

    #[test]
    fn test_error_io_from() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let core_err: CoreError = io_err.into();
        let msg = format!("{}", core_err);
        assert!(msg.contains("file not found"));
    }
}
