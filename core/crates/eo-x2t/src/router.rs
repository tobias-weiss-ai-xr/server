//! Conversion router.
//!
//! Determines the conversion path between formats and
//! selects the appropriate format parser/converter.

use crate::model::{ConversionResult, ConversionStatus};

/// Format conversion router.
pub struct ConversionRouter;

/// Known conversion pairs and their support status.
#[derive(Clone, Copy)]
struct ConversionPair {
    source: &'static str,
    target: &'static str,
    supported: bool,
}

impl ConversionRouter {
    pub fn new() -> Self {
        Self
    }

    /// Check if a conversion path is supported.
    pub fn is_supported(&self, source: &str, target: &str) -> bool {
        if source == target {
            return true; // Same format = no-op
        }
        Self::get_pair(source, target)
            .map(|p| p.supported)
            .unwrap_or(false)
    }

    /// Get the conversion path (number of intermediate steps).
    pub fn conversion_path(&self, source: &str, target: &str) -> Vec<String> {
        if source == target {
            return vec![source.to_string()];
        }

        // Direct conversion
        if self.is_supported(source, target) {
            return vec![source.to_string(), target.to_string()];
        }

        // Try intermediate formats
        let intermediates = ["pdf", "odt", "docx"];
        for intermediate in &intermediates {
            if self.is_supported(source, intermediate) && self.is_supported(intermediate, target) {
                return vec![
                    source.to_string(),
                    intermediate.to_string(),
                    target.to_string(),
                ];
            }
        }

        vec![]
    }

    /// Create a "not supported" result.
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

    fn get_pair(source: &str, target: &str) -> Option<ConversionPair> {
        // All supported conversion pairs
        let pairs: &[ConversionPair] = &[
            // DOCX conversions
            ConversionPair {
                source: "docx",
                target: "pdf",
                supported: true,
            },
            ConversionPair {
                source: "docx",
                target: "odt",
                supported: true,
            },
            ConversionPair {
                source: "docx",
                target: "rtf",
                supported: true,
            },
            ConversionPair {
                source: "docx",
                target: "txt",
                supported: true,
            },
            ConversionPair {
                source: "docx",
                target: "html",
                supported: true,
            },
            ConversionPair {
                source: "docx",
                target: "png",
                supported: false,
            },
            // XLSX conversions
            ConversionPair {
                source: "xlsx",
                target: "pdf",
                supported: true,
            },
            ConversionPair {
                source: "xlsx",
                target: "ods",
                supported: true,
            },
            ConversionPair {
                source: "xlsx",
                target: "csv",
                supported: true,
            },
            // PPTX conversions
            ConversionPair {
                source: "pptx",
                target: "pdf",
                supported: true,
            },
            ConversionPair {
                source: "pptx",
                target: "odp",
                supported: false,
            },
            // ODF conversions
            ConversionPair {
                source: "odt",
                target: "pdf",
                supported: true,
            },
            ConversionPair {
                source: "odt",
                target: "docx",
                supported: true,
            },
            ConversionPair {
                source: "odt",
                target: "rtf",
                supported: true,
            },
            ConversionPair {
                source: "odt",
                target: "txt",
                supported: true,
            },
            ConversionPair {
                source: "odt",
                target: "html",
                supported: true,
            },
            // PDF conversions
            ConversionPair {
                source: "pdf",
                target: "docx",
                supported: false,
            },
            ConversionPair {
                source: "pdf",
                target: "txt",
                supported: true,
            },
            // RTF conversions
            ConversionPair {
                source: "rtf",
                target: "docx",
                supported: false,
            },
            ConversionPair {
                source: "rtf",
                target: "odt",
                supported: false,
            },
            ConversionPair {
                source: "rtf",
                target: "txt",
                supported: true,
            },
            ConversionPair {
                source: "rtf",
                target: "pdf",
                supported: true,
            },
            // Text conversions
            ConversionPair {
                source: "txt",
                target: "docx",
                supported: false,
            },
            ConversionPair {
                source: "txt",
                target: "pdf",
                supported: true,
            },
            ConversionPair {
                source: "txt",
                target: "odt",
                supported: false,
            },
            // HTML conversions
            ConversionPair {
                source: "html",
                target: "docx",
                supported: false,
            },
            ConversionPair {
                source: "html",
                target: "pdf",
                supported: true,
            },
            // EPUB conversions
            ConversionPair {
                source: "epub",
                target: "pdf",
                supported: true,
            },
            ConversionPair {
                source: "epub",
                target: "odt",
                supported: false,
            },
        ];

        pairs
            .iter()
            .find(|p| p.source == source && p.target == target)
            .cloned()
    }
}

impl Default for ConversionRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_supported_docx_to_pdf() {
        let router = ConversionRouter::new();
        assert!(router.is_supported("docx", "pdf"));
        assert!(router.is_supported("xlsx", "pdf"));
        assert!(router.is_supported("odt", "pdf"));
        assert!(router.is_supported("pptx", "pdf"));
        assert!(router.is_supported("epub", "pdf"));
        assert!(router.is_supported("rtf", "pdf"));
    }

    #[test]
    fn test_same_format() {
        let router = ConversionRouter::new();
        assert!(router.is_supported("docx", "docx"));
    }

    #[test]
    fn test_unsupported() {
        let router = ConversionRouter::new();
        assert!(!router.is_supported("pdf", "docx"));
    }

    #[test]
    fn test_conversion_path_direct() {
        let router = ConversionRouter::new();
        let path = router.conversion_path("docx", "pdf");
        assert_eq!(path, vec!["docx", "pdf"]);
    }

    #[test]
    fn test_conversion_path_indirect() {
        let router = ConversionRouter::new();
        // pptx → pdf is supported, pptx → odp is not
        // But xlsx → ods is supported, ods → pdf is supported
        assert_eq!(router.conversion_path("xlsx", "ods"), vec!["xlsx", "ods"]);
    }

    #[test]
    fn test_unsupported_result() {
        let result = ConversionRouter::unsupported_result("pdf", "docx");
        assert_eq!(result.status, ConversionStatus::UnsupportedFormat);
        assert!(result.error.is_some());
    }
}
