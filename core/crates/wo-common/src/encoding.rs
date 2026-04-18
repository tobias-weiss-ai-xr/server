/// Text encoding types used across format parsers.
/// BOM (Byte Order Mark) detection result.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Bom {
    /// UTF-8 BOM: EF BB BF
    Utf8,
    /// UTF-16 Little Endian BOM: FF FE
    Utf16Le,
    /// UTF-16 Big Endian BOM: FE FF
    Utf16Be,
    /// No BOM detected.
    None,
}

impl Bom {
    /// Detect BOM from the start of a byte slice.
    /// Returns the BOM type and the number of BOM bytes to skip.
    pub fn detect(data: &[u8]) -> (Bom, usize) {
        if data.len() >= 3 && data[0] == 0xEF && data[1] == 0xBB && data[2] == 0xBF {
            return (Bom::Utf8, 3);
        }
        if data.len() >= 2 && data[0] == 0xFF && data[1] == 0xFE {
            return (Bom::Utf16Le, 2);
        }
        if data.len() >= 2 && data[0] == 0xFE && data[1] == 0xFF {
            return (Bom::Utf16Be, 2);
        }
        (Bom::None, 0)
    }
}

/// Supported text encodings.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Encoding {
    Utf8,
    Utf16Le,
    Utf16Be,
    /// Windows-1252 (Western European)
    Windows1252,
    /// ISO-8859-1 (Latin-1)
    Iso8859_1,
    /// System default / unknown — attempt auto-detection
    Auto,
}

impl Encoding {
    /// Detect encoding from BOM bytes. Falls back to `Auto` if no BOM.
    pub fn from_bom(data: &[u8]) -> Encoding {
        match Bom::detect(data).0 {
            Bom::Utf8 => Encoding::Utf8,
            Bom::Utf16Le => Encoding::Utf16Le,
            Bom::Utf16Be => Encoding::Utf16Be,
            Bom::None => Encoding::Auto,
        }
    }
}

/// Line ending normalization.
#[derive(Default, Debug, Clone, Copy, PartialEq, Eq)]
pub enum LineEnding {
    /// Unix-style: LF (\n)
    Lf,
    /// Windows-style: CRLF (\r\n)
    #[default]
    Crlf,
    /// Classic Mac-style: CR (\r)
    Cr,
}

/// Split a byte slice into lines, handling all three line ending styles.
/// Normalizes CRLF and CR to LF in the output line boundaries.
pub fn split_lines(data: &[u8]) -> Vec<&[u8]> {
    let mut lines = Vec::new();
    let mut start = 0usize;
    let mut i = 0;

    while i < data.len() {
        if data[i] == b'\r' {
            // CR or CRLF
            lines.push(&data[start..i]);
            if i + 1 < data.len() && data[i + 1] == b'\n' {
                i += 2;
            } else {
                i += 1;
            }
            start = i;
        } else if data[i] == b'\n' {
            // LF
            lines.push(&data[start..i]);
            i += 1;
            start = i;
        } else {
            i += 1;
        }
    }

    // If the last element pushed was an empty line caused by a trailing newline, remove it.
    // This ensures split_lines(b"\n") -> [] instead of [b""]
    if !lines.is_empty() && start == data.len() && lines.last().is_some_and(|l| l.is_empty()) {
        lines.pop();
    }

    // Trailing content without a line ending
    if start < data.len() {
        lines.push(&data[start..]);
    }

    // If data is non-empty but nothing was pushed (no newlines, no content), return data as-is
    if lines.is_empty() && !data.is_empty() && start < data.len() {
        lines.push(data);
    }

    lines
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bom_detection() {
        assert_eq!(Bom::detect(&[0xEF, 0xBB, 0xBF, 0x48]), (Bom::Utf8, 3));
        assert_eq!(Bom::detect(&[0xFF, 0xFE, 0x48]), (Bom::Utf16Le, 2));
        assert_eq!(Bom::detect(&[0xFE, 0xFF, 0x48]), (Bom::Utf16Be, 2));
        assert_eq!(Bom::detect(&[0x48, 0x65]), (Bom::None, 0));
        assert_eq!(Bom::detect(&[]), (Bom::None, 0));
        assert_eq!(Bom::detect(&[0xFF]), (Bom::None, 0));
    }

    #[test]
    fn test_split_lines_lf() {
        let lines = split_lines(b"hello\nworld\n");
        assert_eq!(lines, vec![b"hello" as &[u8], b"world" as &[u8]]);
    }

    #[test]
    fn test_split_lines_crlf() {
        let lines = split_lines(b"hello\r\nworld\r\n");
        assert_eq!(lines, vec![b"hello" as &[u8], b"world" as &[u8]]);
    }

    #[test]
    fn test_split_lines_cr() {
        let lines = split_lines(b"hello\rworld\r");
        assert_eq!(lines, vec![b"hello" as &[u8], b"world" as &[u8]]);
    }

    #[test]
    fn test_split_lines_mixed() {
        let lines = split_lines(b"a\nb\r\nc\rd");
        assert_eq!(lines.len(), 4);
        assert_eq!(lines[0], b"a");
        assert_eq!(lines[1], b"b");
        assert_eq!(lines[2], b"c");
        assert_eq!(lines[3], b"d");
    }

    #[test]
    fn test_split_lines_trailing() {
        let lines = split_lines(b"hello\nworld");
        assert_eq!(lines.len(), 2);
        assert_eq!(lines[0], b"hello");
        assert_eq!(lines[1], b"world");
    }

    #[test]
    fn test_split_lines_empty() {
        let lines = split_lines(b"");
        assert!(lines.is_empty());
    }

    #[test]
    fn test_encoding_from_bom() {
        assert_eq!(Encoding::from_bom(&[0xEF, 0xBB, 0xBF]), Encoding::Utf8);
        assert_eq!(Encoding::from_bom(&[0xFF, 0xFE]), Encoding::Utf16Le);
        assert_eq!(Encoding::from_bom(&[0x48]), Encoding::Auto);
    }

    #[test]
    fn test_split_lines_single_line_no_ending() {
        let lines = split_lines(b"hello");
        assert_eq!(lines.len(), 1);
        assert_eq!(lines[0], b"hello");
    }

    #[test]
    fn test_split_lines_only_crlf() {
        let lines = split_lines(b"\r\n");
        assert!(lines.is_empty());
    }

    #[test]
    fn test_split_lines_only_lf() {
        let lines = split_lines(b"\n");
        assert!(lines.is_empty());
    }

    #[test]
    fn test_split_lines_consecutive_endlines() {
        let lines = split_lines(b"a\n\nb");
        assert_eq!(lines.len(), 3);
        assert_eq!(lines[0], b"a");
        assert_eq!(lines[1], b"");
        assert_eq!(lines[2], b"b");
    }

    #[test]
    fn test_split_lines_utf8_multibyte() {
        // "café" in UTF-8 with LF
        let data = "caf\u{e9}\nhello".as_bytes();
        let lines = split_lines(data);
        assert_eq!(lines.len(), 2);
        assert_eq!(lines[0], "caf\u{e9}".as_bytes());
        assert_eq!(lines[1], b"hello");
    }

    #[test]
    fn test_bom_detect_utf16le_minimum() {
        assert_eq!(Bom::detect(&[0xFF, 0xFE]), (Bom::Utf16Le, 2));
    }

    #[test]
    fn test_bom_detect_single_byte() {
        // Only one byte — can't match any BOM
        assert_eq!(Bom::detect(&[0xFF]), (Bom::None, 0));
        assert_eq!(Bom::detect(&[0xEF]), (Bom::None, 0));
    }

    #[test]
    fn test_bom_detect_partial_utf8() {
        // Only first 2 bytes of UTF-8 BOM
        assert_eq!(Bom::detect(&[0xEF, 0xBB]), (Bom::None, 0));
    }
}
