//! Format converter trait and registry.

use std::collections::HashMap;
use std::sync::Arc;

use crate::error::ConversionError;
use crate::model::{ConversionOutput, ConversionResult, ConversionStatus};

pub trait FormatConverter: Send + Sync {
    fn source_format(&self) -> &str;
    fn target_format(&self) -> &str;
    fn convert(&self, data: &[u8]) -> Result<Vec<u8>, ConversionError>;
}

pub fn success_result(data: Vec<u8>, format: &str, duration_ms: u64) -> ConversionResult {
    ConversionResult {
        status: ConversionStatus::Success,
        output: Some(ConversionOutput {
            data,
            format: format.to_string(),
            page_count: None,
            warnings: Vec::new(),
        }),
        error: None,
        duration_ms,
    }
}

pub fn error_result(message: String, duration_ms: u64) -> ConversionResult {
    ConversionResult {
        status: ConversionStatus::Failed,
        output: None,
        error: Some(message),
        duration_ms,
    }
}

pub fn unsupported_result(source: &str, target: &str) -> ConversionResult {
    ConversionResult {
        status: ConversionStatus::UnsupportedFormat,
        output: None,
        error: Some(format!(
            "Conversion from {} to {} is not supported",
            source, target
        )),
        duration_ms: 0,
    }
}

/// Registry of format converters, keyed by (source_format, target_format).
pub struct ConverterRegistry {
    converters: HashMap<(String, String), Arc<dyn FormatConverter>>,
}

impl ConverterRegistry {
    /// Create an empty registry.
    pub fn new() -> Self {
        Self {
            converters: HashMap::new(),
        }
    }

    /// Register a converter.
    pub fn register<C: FormatConverter + 'static>(&mut self, converter: C) {
        let key = (
            converter.source_format().to_string(),
            converter.target_format().to_string(),
        );
        self.converters.insert(key, Arc::new(converter));
    }

    /// Look up a converter by source and target format.
    pub fn get(&self, source: &str, target: &str) -> Option<&Arc<dyn FormatConverter>> {
        self.converters
            .get(&(source.to_string(), target.to_string()))
    }

    /// Check whether a converter exists for the given pair.
    pub fn has_converter(&self, source: &str, target: &str) -> bool {
        self.converters
            .contains_key(&(source.to_string(), target.to_string()))
    }

    /// Convert data using the registered converter, or return NoConverter error.
    pub fn convert(
        &self,
        source: &str,
        target: &str,
        data: &[u8],
    ) -> Result<Vec<u8>, ConversionError> {
        match self.get(source, target) {
            Some(converter) => converter.convert(data),
            None => Err(ConversionError::NoConverter {
                src: source.to_string(),
                dst: target.to_string(),
            }),
        }
    }

    /// Return all registered (source, target) pairs.
    pub fn registered_pairs(&self) -> Vec<(&str, &str)> {
        self.converters
            .keys()
            .map(|(s, t)| (s.as_str(), t.as_str()))
            .collect()
    }
}

impl Default for ConverterRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_success_result() {
        let result = success_result(vec![1, 2, 3], "txt", 10);
        assert_eq!(result.status, ConversionStatus::Success);
        assert!(result.output.is_some());
        assert_eq!(result.output.unwrap().format, "txt");
    }

    #[test]
    fn test_error_result() {
        let result = error_result("something failed".to_string(), 5);
        assert_eq!(result.status, ConversionStatus::Failed);
        assert_eq!(result.error.as_deref(), Some("something failed"));
    }

    #[test]
    fn test_unsupported_result() {
        let result = unsupported_result("pdf", "docx");
        assert_eq!(result.status, ConversionStatus::UnsupportedFormat);
        assert!(result.error.unwrap().contains("pdf"));
    }

    // ── ConverterRegistry tests ─────────────────────────────────────────

    struct StubConverter {
        src: &'static str,
        tgt: &'static str,
    }

    impl FormatConverter for StubConverter {
        fn source_format(&self) -> &str {
            self.src
        }
        fn target_format(&self) -> &str {
            self.tgt
        }
        fn convert(&self, data: &[u8]) -> Result<Vec<u8>, ConversionError> {
            // Reverse the bytes as a trivial transformation
            Ok(data.iter().rev().copied().collect())
        }
    }

    #[test]
    fn test_register_and_get() {
        let mut registry = ConverterRegistry::new();
        registry.register(StubConverter {
            src: "foo",
            tgt: "bar",
        });

        let converter = registry.get("foo", "bar");
        assert!(converter.is_some());
        assert_eq!(converter.unwrap().source_format(), "foo");
        assert_eq!(converter.unwrap().target_format(), "bar");
    }

    #[test]
    fn test_get_nonexistent_pair() {
        let registry = ConverterRegistry::new();
        assert!(registry.get("nope", "nope").is_none());
    }

    #[test]
    fn test_has_converter() {
        let mut registry = ConverterRegistry::new();
        registry.register(StubConverter { src: "a", tgt: "b" });

        assert!(registry.has_converter("a", "b"));
        assert!(!registry.has_converter("b", "a"));
        assert!(!registry.has_converter("a", "a"));
    }

    #[test]
    fn test_convert_success() {
        use crate::converters::TxtToHtmlConverter;

        let mut registry = ConverterRegistry::new();
        registry.register(TxtToHtmlConverter);

        let result = registry.convert("txt", "html", b"Hello").unwrap();
        let html = String::from_utf8(result).unwrap();
        assert!(html.contains("Hello"));
    }

    #[test]
    fn test_convert_no_converter() {
        let registry = ConverterRegistry::new();
        let result = registry.convert("missing", "format", b"data");

        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("no converter registered"));
    }
}
