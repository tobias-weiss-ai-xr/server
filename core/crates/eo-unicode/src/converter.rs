//! Unicode text converter.
//!
//! Converts between various character encodings and UTF-8/UTF-16,
//! using encoding_rs for high-performance encoding conversion.

use encoding_rs::CoderResult;

/// Result of a conversion operation.
#[derive(Debug, Clone)]
pub struct ConversionResult {
    /// Converted output bytes.
    pub output: Vec<u8>,
    /// Whether the input had unreplaceable characters.
    pub had_replacements: bool,
    /// Number of bytes of input consumed.
    pub bytes_read: usize,
}

/// Unicode text converter.
///
/// Replaces the C++ CUnicodeConverter class which wraps ICU.
/// Uses encoding_rs (used by Firefox) for all encoding operations.
pub struct UnicodeConverter {
    source_encoding: &'static encoding_rs::Encoding,
}

impl UnicodeConverter {
    /// Create a converter for the given encoding label.
    ///
    /// # Examples
    /// ```
    /// use eo_unicode::UnicodeConverter;
    /// let converter = UnicodeConverter::for_label("windows-1252").unwrap();
    /// ```
    pub fn for_label(label: &str) -> Option<Self> {
        let encoding = encoding_rs::Encoding::for_label(label.as_bytes())?;
        Some(Self {
            source_encoding: encoding,
        })
    }

    /// Create a converter for the given Windows code page.
    pub fn for_code_page(code_page: u16) -> Option<Self> {
        let label = match code_page {
            1252 => "windows-1252",
            1251 => "windows-1251",
            1250 => "windows-1250",
            1253 => "windows-1253",
            1254 => "windows-1254",
            1255 => "windows-1255",
            1256 => "windows-1256",
            1257 => "windows-1257",
            1258 => "windows-1258",
            874 => "windows-874",
            932 => "shift_jis",
            936 => "gbk",
            949 => "euc-kr",
            950 => "big5",
            65001 => "utf-8",
            1200 => "utf-16le",
            1201 => "utf-16be",
            _ => return None,
        };
        Self::for_label(label)
    }

    /// Convert bytes from the source encoding to UTF-8.
    pub fn to_utf8(&self, input: &[u8]) -> ConversionResult {
        let mut decoder = self.source_encoding.new_decoder();
        let mut output = vec![0; input.len() * 4]; // worst case: 4 bytes per input byte
        let mut total_read = 0;
        let mut total_written = 0;
        let mut had_replacements = false;
        let remaining = input;

        loop {
            let (result, bytes_read, bytes_written, replaced) =
                decoder.decode_to_utf8(remaining, &mut output[total_written..], true);
            total_read += bytes_read;
            total_written += bytes_written;
            had_replacements = had_replacements || replaced;
            match result {
                CoderResult::InputEmpty => break,
                CoderResult::OutputFull => {
                    // Grow output buffer
                    output.resize(output.len() * 2, 0);
                }
            }
        }

        output.truncate(total_written);
        ConversionResult {
            output,
            had_replacements,
            bytes_read: total_read,
        }
    }

    /// Convert bytes from the source encoding to UTF-16.
    pub fn to_utf16(&self, input: &[u8]) -> ConversionResult {
        let mut decoder = self.source_encoding.new_decoder();
        let mut output = vec![0u16; input.len() * 2]; // worst case: 2 u16 per input byte
        let mut total_read = 0;
        let mut total_written = 0;
        let mut had_replacements = false;
        let remaining = input;

        loop {
            let (result, bytes_read, bytes_written, replaced) =
                decoder.decode_to_utf16(remaining, &mut output[total_written..], true);
            total_read += bytes_read;
            total_written += bytes_written;
            had_replacements = had_replacements || replaced;
            match result {
                CoderResult::InputEmpty => break,
                CoderResult::OutputFull => {
                    output.resize(output.len() * 2, 0);
                }
            }
        }

        // Convert u16 slice to bytes
        let bytes: Vec<u8> = output[..total_written]
            .iter()
            .flat_map(|&w| w.to_le_bytes())
            .collect();

        ConversionResult {
            output: bytes,
            had_replacements,
            bytes_read: total_read,
        }
    }

    /// Convert UTF-8 bytes to the source encoding.
    pub fn from_utf8(&self, input: &str) -> ConversionResult {
        let mut encoder = self.source_encoding.new_encoder();
        let mut output = vec![0; input.len() * 4];
        let mut total_read = 0;
        let mut total_written = 0;
        let mut had_replacements = false;
        let remaining = &*input;

        loop {
            let (result, bytes_read, bytes_written, replaced) =
                encoder.encode_from_utf8(remaining, &mut output[total_written..], true);
            total_read += bytes_read;
            total_written += bytes_written;
            had_replacements = had_replacements || replaced;
            match result {
                CoderResult::InputEmpty => break,
                CoderResult::OutputFull => {
                    output.resize(output.len() * 2, 0);
                }
            }
        }

        output.truncate(total_written);
        ConversionResult {
            output,
            had_replacements,
            bytes_read: total_read,
        }
    }

    /// Get the name of the source encoding.
    pub fn encoding_name(&self) -> &'static str {
        self.source_encoding.name()
    }

    /// Check if the source encoding is ASCII-compatible.
    pub fn is_ascii_compatible(&self) -> bool {
        self.source_encoding == encoding_rs::UTF_8
            || self.source_encoding == encoding_rs::WINDOWS_1252
    }

    /// Detect BOM (Byte Order Mark) and return the corresponding encoding.
    pub fn detect_bom_encoding(data: &[u8]) -> Option<&'static encoding_rs::Encoding> {
        match data {
            [0xEF, 0xBB, 0xBF, ..] => Some(encoding_rs::UTF_8),
            [0xFE, 0xFF, ..] => Some(encoding_rs::UTF_16BE),
            [0xFF, 0xFE, ..] => Some(encoding_rs::UTF_16LE),
            // UTF-32 BOMs: treat as UTF-16 (encoding_rs doesn't have UTF-32)
            [0x00, 0x00, 0xFE, 0xFF, ..] => Some(encoding_rs::UTF_16BE),
            _ => None,
        }
    }

    /// Detect the likely encoding of input data using BOM and heuristics.
    pub fn detect_encoding(data: &[u8]) -> &'static encoding_rs::Encoding {
        // 1. Check for BOM
        if let Some(enc) = Self::detect_bom_encoding(data) {
            return enc;
        }

        // 2. Check for null bytes (suggests UTF-16)
        if data.len() >= 4 {
            let null_count = data.iter().take(1024).filter(|&&b| b == 0).count();
            let sample_len = data.len().min(1024);
            if null_count > sample_len / 4 {
                // Many nulls → likely UTF-16
                if data.len() >= 2 && data[1] == 0 {
                    return encoding_rs::UTF_16LE;
                } else {
                    return encoding_rs::UTF_16BE;
                }
            }
        }

        // 3. Check if valid UTF-8
        if std::str::from_utf8(data).is_ok() {
            return encoding_rs::UTF_8;
        }

        // 4. Default to windows-1252 (Western European)
        encoding_rs::WINDOWS_1252
    }
}

impl Default for UnicodeConverter {
    fn default() -> Self {
        Self {
            source_encoding: encoding_rs::UTF_8,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_utf8_roundtrip() {
        let converter = UnicodeConverter::for_label("utf-8").unwrap();
        let input = "Hello, World! 🌍";
        let result = converter.to_utf8(input.as_bytes());
        assert_eq!(String::from_utf8_lossy(&result.output), input);
        assert!(!result.had_replacements);
    }

    #[test]
    fn test_windows1252_to_utf8() {
        let converter = UnicodeConverter::for_label("windows-1252").unwrap();
        // Windows-1252: € = 0x80, ü = 0xFC
        let input: &[u8] = &[0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x80, 0xFC];
        let result = converter.to_utf8(input);
        let text = String::from_utf8_lossy(&result.output);
        assert!(text.contains("Hello"));
        assert!(text.contains('€'));
        assert!(text.contains('ü'));
    }

    #[test]
    fn test_utf8_to_windows1252() {
        let converter = UnicodeConverter::for_label("windows-1252").unwrap();
        let input = "Hello";
        let result = converter.from_utf8(input);
        assert!(!result.had_replacements);
        assert_eq!(result.output, b"Hello");
    }

    #[test]
    fn test_code_page_lookup() {
        let converter = UnicodeConverter::for_code_page(1252).unwrap();
        assert_eq!(converter.encoding_name(), "windows-1252");

        let converter = UnicodeConverter::for_code_page(932).unwrap();
        assert_eq!(converter.encoding_name(), "Shift_JIS");

        let converter = UnicodeConverter::for_code_page(65001).unwrap();
        assert_eq!(converter.encoding_name(), "UTF-8");
    }

    #[test]
    fn test_invalid_code_page() {
        assert!(UnicodeConverter::for_code_page(9999).is_none());
    }

    #[test]
    fn test_detect_bom_utf8() {
        let data = [0xEF, 0xBB, 0xBF, 0x48, 0x69];
        let enc = UnicodeConverter::detect_bom_encoding(&data);
        assert_eq!(enc.unwrap().name(), "UTF-8");
    }

    #[test]
    fn test_detect_bom_utf16le() {
        let data = [0xFF, 0xFE, 0x48, 0x00, 0x69, 0x00];
        let enc = UnicodeConverter::detect_bom_encoding(&data);
        assert_eq!(enc.unwrap().name(), "UTF-16LE");
    }

    #[test]
    fn test_detect_encoding_no_bom() {
        let data = b"Hello, World!";
        let enc = UnicodeConverter::detect_encoding(data);
        assert_eq!(enc.name(), "UTF-8");
    }

    #[test]
    fn test_to_utf16() {
        let converter = UnicodeConverter::for_label("utf-8").unwrap();
        let input = "ABC";
        let result = converter.to_utf16(input.as_bytes());
        // UTF-16LE: 'A' = 0x41 0x00
        assert_eq!(result.output, vec![0x41, 0x00, 0x42, 0x00, 0x43, 0x00]);
    }

    #[test]
    fn test_is_ascii_compatible() {
        let utf8 = UnicodeConverter::for_label("utf-8").unwrap();
        assert!(utf8.is_ascii_compatible());

        let latin1 = UnicodeConverter::for_label("windows-1252").unwrap();
        assert!(latin1.is_ascii_compatible());

        let sjis = UnicodeConverter::for_label("shift_jis").unwrap();
        assert!(!sjis.is_ascii_compatible());
    }

    #[test]
    fn test_encoding_name() {
        let converter = UnicodeConverter::for_label("windows-1252").unwrap();
        assert_eq!(converter.encoding_name(), "windows-1252");
    }
}
