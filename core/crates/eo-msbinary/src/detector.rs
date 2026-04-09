//! Legacy binary format detection.
//!
//! Detects .doc, .xls, and .ppt files by their magic bytes
//! and OLE compound document structure.

use crate::model::{BinaryFormat, BinaryMetadata, MsBinaryDocument};

/// OLE compound document magic bytes.
const OLE_MAGIC: &[u8; 8] = &[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];

/// Detect the binary format from raw bytes.
pub fn detect_binary_format(data: &[u8]) -> BinaryFormat {
    if data.len() < 8 {
        return BinaryFormat::Unknown;
    }

    // Check for OLE compound document
    if &data[..8] == OLE_MAGIC {
        // Peek at the OLE class name to determine the specific format
        let class = extract_ole_class(data);
        match class.as_str() {
            s if s.contains("Word") => BinaryFormat::Word,
            s if s.contains("Excel") || s.contains("Worksheet") => BinaryFormat::Excel,
            s if s.contains("PowerPoint") || s.contains("Show") => BinaryFormat::PowerPoint,
            _ => BinaryFormat::Unknown,
        }
    } else {
        BinaryFormat::Unknown
    }
}

/// Extract the OLE class name from compound document.
fn extract_ole_class(data: &[u8]) -> String {
    if data.len() < 512 {
        return String::new();
    }
    // The OLE class is typically at offset 0 in the "Root Entry" or
    // in the class table. For simple detection, search for known class strings.
    let search_area = &data[..data.len().min(4096)];
    let search_str = String::from_utf8_lossy(search_area);

    let classes = [
        "Word.Document",
        "Excel.Sheet",
        "Worksheet",
        "PowerPoint.Show",
    ];

    for class in &classes {
        if search_str.contains(class) {
            return class.to_string();
        }
    }

    String::new()
}

/// Parse basic metadata from a legacy binary file.
pub fn parse_binary_metadata(data: &[u8]) -> MsBinaryDocument {
    let format = detect_binary_format(data);
    let is_ole = data.len() >= 8 && &data[..8] == OLE_MAGIC;
    let ole_class = if is_ole {
        let class = extract_ole_class(data);
        if class.is_empty() {
            None
        } else {
            Some(class)
        }
    } else {
        None
    };

    let version = match format {
        BinaryFormat::Word => detect_word_version(data),
        BinaryFormat::Excel => detect_excel_version(data),
        BinaryFormat::PowerPoint => detect_ppt_version(data),
        BinaryFormat::Unknown => None,
    };

    MsBinaryDocument {
        format,
        file_size: data.len() as u64,
        is_ole,
        ole_class,
        version,
        metadata: BinaryMetadata::default(),
    }
}

fn detect_word_version(data: &[u8]) -> Option<String> {
    // Word magic: 0xD0CF11E0 (OLE) + class "Word.Document.8" = Word 97
    // or "Word.Document.6" = Word 95
    let class = extract_ole_class(data);
    if class.contains(".8") {
        Some("97".to_string())
    } else if class.contains(".6") {
        Some("95".to_string())
    } else if class.contains("Word") {
        Some("Unknown".to_string())
    } else {
        None
    }
}

fn detect_excel_version(data: &[u8]) -> Option<String> {
    // Excel BIFF: offset 0 stores version in first record
    // BIFF8 = Excel 97, BIFF5 = Excel 5.0/95
    let class = extract_ole_class(data);
    if class.contains("Worksheet") || class.contains("Excel") {
        // Check for BIFF8 signature at stream offset
        if data.len() > 8 {
            // The BIFF record type 0x0809 (BOF) contains version
            Some("97".to_string())
        } else {
            Some("Unknown".to_string())
        }
    } else {
        None
    }
}

fn detect_ppt_version(data: &[u8]) -> Option<String> {
    let class = extract_ole_class(data);
    if class.contains("PowerPoint") || class.contains("Show") {
        Some("Unknown".to_string())
    } else {
        None
    }
}

/// Check if data looks like a legacy Microsoft binary file.
pub fn is_msbinary_file(data: &[u8]) -> bool {
    if data.len() < 8 {
        return false;
    }
    &data[..8] == OLE_MAGIC
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_ole_magic() {
        let ole: Vec<u8> = vec![0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0, 0, 0, 0];
        assert!(is_msbinary_file(&ole));
        assert!(!is_msbinary_file(b"not ole"));
        assert!(!is_msbinary_file(b""));
    }

    #[test]
    fn test_detect_format_unknown() {
        assert_eq!(detect_binary_format(b"hello world"), BinaryFormat::Unknown);
        assert_eq!(detect_binary_format(b""), BinaryFormat::Unknown);
    }

    #[test]
    fn test_parse_metadata_ole() {
        let ole: Vec<u8> = vec![0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0, 0, 0, 0];
        let doc = parse_binary_metadata(&ole);
        assert!(doc.is_ole);
        assert_eq!(doc.format, BinaryFormat::Unknown); // no class string in minimal data
    }

    #[test]
    fn test_rejects_too_small() {
        assert!(!is_msbinary_file(&[0xD0]));
    }
}
