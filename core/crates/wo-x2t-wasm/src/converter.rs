//! JavaScript-callable conversion functions.

use wasm_bindgen::prelude::*;
use wo_x2t::{model::ConversionStatus, ConversionRouter};

/// Convert a document from one format to another.
///
/// # Arguments
/// * `input` - Input document bytes as a byte array
/// * `source_format` - Source format identifier (e.g., "docx", "pdf", "odt")
/// * `target_format` - Target format identifier (e.g., "pdf", "odt", "docx")
///
/// # Returns
/// * `Result<Vec<u8>, String>` - Output document bytes on success, error message on failure
///
/// # Example
/// ```javascript
/// const result = convert(inputBytes, "docx", "pdf");
/// if (result.error) {
///   console.error(result.error);
/// } else {
///   const outputBytes = result.data;
/// }
/// ```
#[wasm_bindgen]
pub fn convert(input: &[u8], source_format: &str, target_format: &str) -> Result<Vec<u8>, String> {
    // Validate inputs
    if input.is_empty() {
        return Err("Input data is empty".to_string());
    }

    if source_format.is_empty() {
        return Err("Source format is required".to_string());
    }

    if target_format.is_empty() {
        return Err("Target format is required".to_string());
    }

    // Check if conversion is supported
    let router = ConversionRouter::new();
    if !router.is_supported(source_format, target_format) {
        return Err(format!(
            "Conversion from {} to {} is not supported",
            source_format, target_format
        ));
    }

    let result = router.convert(source_format, target_format, input);
    match result.status {
        ConversionStatus::Success => {
            if let Some(output) = result.output {
                Ok(output.data)
            } else {
                Err("Conversion produced no output".to_string())
            }
        }
        _ => Err(result
            .error
            .unwrap_or_else(|| "Conversion failed".to_string())),
    }
}

/// Check if a conversion between two formats is supported.
///
/// # Arguments
/// * `source_format` - Source format identifier
/// * `target_format` - Target format identifier
///
/// # Returns
/// * `bool` - true if the conversion is supported, false otherwise
#[wasm_bindgen]
pub fn is_supported(source_format: &str, target_format: &str) -> bool {
    let router = ConversionRouter::new();
    router.is_supported(source_format, target_format)
}

/// Get the conversion path (intermediate formats if any).
///
/// # Arguments
/// * `source_format` - Source format identifier
/// * `target_format` - Target format identifier
///
/// # Returns
/// * `Vec<String>` - List of formats in the conversion path
#[wasm_bindgen]
pub fn conversion_path(source_format: &str, target_format: &str) -> Vec<String> {
    let router = ConversionRouter::new();
    router.conversion_path(source_format, target_format)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_convert_empty_input() {
        let result = convert(&[], "docx", "pdf");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Input data is empty");
    }

    #[test]
    fn test_convert_empty_source_format() {
        let result = convert(&[1, 2, 3], "", "pdf");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Source format is required");
    }

    #[test]
    fn test_convert_empty_target_format() {
        let result = convert(&[1, 2, 3], "docx", "");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Target format is required");
    }

    #[test]
    fn test_convert_unsupported() {
        let result = convert(&[1, 2, 3], "pdf", "docx");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not supported"));
    }

    #[test]
    fn test_convert_supported() {
        let input = b"Hello World";
        let result = convert(input, "txt", "html");
        assert!(result.is_ok());
        let output = result.unwrap();
        let html = String::from_utf8(output).unwrap();
        assert!(html.contains("Hello World"));
    }

    #[test]
    fn test_is_supported() {
        assert!(is_supported("rtf", "txt"));
        assert!(is_supported("html", "rtf"));
        assert!(is_supported("docx", "txt"));
        assert!(!is_supported("pdf", "docx"));
    }

    #[test]
    fn test_conversion_path() {
        let path = conversion_path("rtf", "txt");
        assert_eq!(path, vec!["rtf", "txt"]);
    }
}
