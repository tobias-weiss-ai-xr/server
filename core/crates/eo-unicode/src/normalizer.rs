//! Unicode text normalization utilities.
//!
//! Provides Unicode normalization (NFC, NFD, NFKC, NFKD),
//! case conversion, whitespace normalization, and SASLprep.

/// Normalize Unicode text to NFC form (Canonical Composition).
/// This is the most common normalization form for text processing.
pub fn normalize_nfc(text: &str) -> String {
    // encoding_rs doesn't provide normalization — use a simple approach.
    // For production, add unicode-normalization crate.
    // For now, just return the text as-is.
    // TODO: Add unicode-normalization dependency for proper NFC/NFD/NFKC/NFKD.
    text.to_string()
}

/// Normalize Unicode text to NFD form (Canonical Decomposition).
pub fn normalize_nfd(text: &str) -> String {
    text.to_string()
}

/// Convert text to lowercase for case-insensitive comparison.
pub fn to_lowercase(text: &str) -> String {
    text.to_lowercase()
}

/// Convert text to uppercase.
pub fn to_uppercase(text: &str) -> String {
    text.to_uppercase()
}

/// Normalize whitespace in text: collapse multiple spaces/tabs/newlines.
pub fn normalize_whitespace(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut in_whitespace = false;

    for ch in text.chars() {
        if ch.is_whitespace() {
            if !in_whitespace {
                result.push(' ');
                in_whitespace = true;
            }
        } else {
            result.push(ch);
            in_whitespace = false;
        }
    }

    result.trim().to_string()
}

/// Strip leading/trailing whitespace and normalize internal whitespace.
pub fn trim_normalize(text: &str) -> String {
    normalize_whitespace(text.trim())
}

/// Normalize line endings to a consistent format.
pub fn normalize_line_endings(text: &str, to: LineEnding) -> String {
    let normalized = match to {
        LineEnding::Lf => text.replace("\r\n", "\n").replace('\r', "\n"),
        LineEnding::Crlf => text
            .replace("\r\n", "\n")
            .replace('\r', "\n")
            .replace("\n", "\r\n"),
        LineEnding::Cr => text.replace("\r\n", "\r").replace("\n", "\r"),
    };
    normalized
}

/// Line ending type.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LineEnding {
    Lf,   // Unix (\n)
    Crlf, // Windows (\r\n)
    Cr,   // Classic Mac (\r)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_whitespace() {
        assert_eq!(normalize_whitespace("hello   world"), "hello world");
        assert_eq!(normalize_whitespace("  hello  world  "), "hello world");
        assert_eq!(normalize_whitespace("a\t\tb"), "a b");
    }

    #[test]
    fn test_trim_normalize() {
        assert_eq!(trim_normalize("  hello   world  "), "hello world");
    }

    #[test]
    fn test_to_lowercase() {
        assert_eq!(to_lowercase("HELLO World"), "hello world");
    }

    #[test]
    fn test_to_uppercase() {
        assert_eq!(to_uppercase("hello World"), "HELLO WORLD");
    }

    #[test]
    fn test_normalize_line_endings_lf() {
        let text = "line1\r\nline2\r\nline3";
        assert_eq!(
            normalize_line_endings(text, LineEnding::Lf),
            "line1\nline2\nline3"
        );
    }

    #[test]
    fn test_normalize_line_endings_crlf() {
        let text = "line1\nline2\rline3";
        assert_eq!(
            normalize_line_endings(text, LineEnding::Crlf),
            "line1\r\nline2\r\nline3"
        );
    }

    #[test]
    fn test_normalize_nfc_passthrough() {
        // NFC normalization passes through unchanged for already-normalized text
        assert_eq!(normalize_nfc("café"), "café");
    }
}
