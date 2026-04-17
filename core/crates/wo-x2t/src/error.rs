//! Conversion error types for wo-x2t.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConversionError {
    #[error("parse error: {0}")]
    Parse(String),
    #[error("serialization error: {0}")]
    Serialize(String),
    #[error("unsupported conversion: {src} -> {dst}")]
    UnsupportedConversion { src: String, dst: String },
    #[error("no converter registered for {src} -> {dst}")]
    NoConverter { src: String, dst: String },
}
