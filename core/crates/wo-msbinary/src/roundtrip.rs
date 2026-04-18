//! Roundtrip implementation for MS Binary format.
//!
//! Provides FormatRoundtrip trait implementation for testing
//! parse-serialize-parse cycles.

use std::cell::RefCell;

use wo_common::test_harness::FormatRoundtrip;

use crate::detector::parse_binary_metadata;
use crate::model::MsBinaryDocument;
use crate::ole::OleCompoundDoc;

/// Roundtrip handler for MS Binary format.
///
/// Stores parsed document internally for serialization.
/// Uses interior mutability (RefCell) because FormatRoundtrip::parse takes &self.
pub struct MsbinaryRoundtrip {
    doc: RefCell<Option<MsBinaryDocument>>,
}

impl MsbinaryRoundtrip {
    /// Create a new roundtrip handler.
    pub fn new() -> Self {
        Self {
            doc: RefCell::new(None),
        }
    }
}

impl Default for MsbinaryRoundtrip {
    fn default() -> Self {
        Self::new()
    }
}

impl FormatRoundtrip for MsbinaryRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        // Parse as OLE compound document if it has the OLE magic bytes
        if data.len() >= 8 && data[..8] == [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] {
            // Parse as OLE to extract structure information
            let _ole_doc = OleCompoundDoc::parse(data)
                .map_err(|e| format!("Failed to parse OLE document: {}", e))?;

            // Parse metadata and basic structure
            let doc = parse_binary_metadata(data);
            *self.doc.borrow_mut() = Some(doc);
            Ok(())
        } else {
            // Not an OLE file, parse as regular binary
            let doc = parse_binary_metadata(data);
            *self.doc.borrow_mut() = Some(doc);
            Ok(())
        }
    }

    fn serialize(&self) -> Result<Vec<u8>, String> {
        let doc = self.doc.borrow();
        let doc = doc.as_ref().ok_or("No document parsed")?;

        // Serialize the MsBinaryDocument to JSON (like wo-fb2 pattern)
        // This is simpler than reconstructing a valid OLE compound document
        serde_json::to_vec_pretty(doc).map_err(|e| format!("Failed to serialize document: {}", e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Create a minimal valid OLE compound document.
    /// Based on the structure in ole.rs tests.
    fn create_minimal_ole() -> Vec<u8> {
        let sector_size: usize = 512;
        let header_size: usize = 512;
        let total_size = header_size + 3 * sector_size;
        let mut buf = vec![0u8; total_size];

        // OLE magic signature
        let ole_sig: [u8; 8] = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];
        buf[0..8].copy_from_slice(&ole_sig);

        // Minor version (0x003E)
        buf[24] = 0x3E;
        buf[25] = 0x00;

        // Major version (0x0003 = v3)
        buf[26] = 0x03;
        buf[27] = 0x00;

        // Byte order (0xFFFE = little-endian)
        buf[28] = 0xFE;
        buf[29] = 0xFF;

        // Sector size power (9 = 512 bytes)
        buf[30] = 0x09;
        buf[31] = 0x00;

        // Mini sector size power (6 = 64 bytes)
        buf[32] = 0x06;
        buf[33] = 0x00;

        // Total FAT sectors = 1
        buf[44] = 0x01;

        // First directory sector FAT = 1
        buf[48] = 0x01;

        // Mini stream cutoff = 4096
        buf[56] = 0x00;
        buf[57] = 0x10;

        // First mini FAT sector = ENDOFCHAIN
        buf[60..64].copy_from_slice(&0xFFFFFFFEu32.to_le_bytes());

        // First DIFAT sector = ENDOFCHAIN
        buf[68..72].copy_from_slice(&0xFFFFFFFEu32.to_le_bytes());

        // DIFAT[0] = sector 0
        buf[76..80].copy_from_slice(&0u32.to_le_bytes());

        // FAT sector (sector 0)
        let fat_offset = header_size;
        // Sector 0 (FAT): ENDOFCHAIN
        buf[fat_offset..fat_offset + 4].copy_from_slice(&0xFFFFFFFEu32.to_le_bytes());
        // Sector 1 (Directory): ENDOFCHAIN
        buf[fat_offset + 4..fat_offset + 8].copy_from_slice(&0xFFFFFFFEu32.to_le_bytes());
        // Sector 2 (Stream data): ENDOFCHAIN
        buf[fat_offset + 8..fat_offset + 12].copy_from_slice(&0xFFFFFFFEu32.to_le_bytes());

        // Directory sector (sector 1)
        let dir_offset = header_size + sector_size;

        // Entry 0: Root Storage
        let root_name = encode_utf16le("Root Entry");
        buf[dir_offset..dir_offset + root_name.len()].copy_from_slice(&root_name);
        let name_len_bytes = (root_name.len() + 2) as u16;
        buf[dir_offset + 64..dir_offset + 66].copy_from_slice(&name_len_bytes.to_le_bytes());
        buf[dir_offset + 66] = 0x05; // RootStorage
        buf[dir_offset + 67] = 0x01; // Black
        buf[dir_offset + 76] = 0x01; // child = entry 1
        buf[dir_offset + 116..dir_offset + 120].copy_from_slice(&0xFFFFFFFEu32.to_le_bytes());

        // Entry 1: Stream
        let stream_entry_offset = dir_offset + 128;
        let stream_name = encode_utf16le("TestStream");
        let copy_len = stream_name.len().min(64);
        buf[stream_entry_offset..stream_entry_offset + copy_len]
            .copy_from_slice(&stream_name[..copy_len]);
        let sname_len = (stream_name.len() + 2) as u16;
        buf[stream_entry_offset + 64..stream_entry_offset + 66]
            .copy_from_slice(&sname_len.to_le_bytes());
        buf[stream_entry_offset + 66] = 0x02; // Stream
        buf[stream_entry_offset + 67] = 0x01; // Black
        buf[stream_entry_offset + 116] = 0x02; // starting sector
        buf[stream_entry_offset + 120..stream_entry_offset + 128]
            .copy_from_slice(&(18u64).to_le_bytes()); // stream size

        // Stream data sector (sector 2)
        let data_offset = header_size + 2 * sector_size;
        let stream_data = b"Hello MS Binary!";
        buf[data_offset..data_offset + stream_data.len()].copy_from_slice(stream_data);

        buf
    }

    fn encode_utf16le(s: &str) -> Vec<u8> {
        let mut buf = Vec::with_capacity(s.len() * 2);
        for ch in s.chars() {
            let code = ch as u16;
            buf.push((code & 0xFF) as u8);
            buf.push((code >> 8) as u8);
        }
        buf
    }

    #[test]
    fn test_roundtrip_simple() {
        let rt = MsbinaryRoundtrip::new();
        let input = create_minimal_ole();

        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();

        // Output should be valid JSON
        let json_str = std::str::from_utf8(&output).unwrap();
        assert!(json_str.contains("format"));
        assert!(json_str.contains("file_size"));
        assert!(json_str.contains("is_ole"));
    }

    #[test]
    fn test_roundtrip_ole_detection() {
        let rt = MsbinaryRoundtrip::new();
        let input = create_minimal_ole();

        rt.parse(&input).unwrap();
        let output = rt.serialize().unwrap();
        let doc: MsBinaryDocument = serde_json::from_slice(&output).unwrap();

        // Should detect it as an OLE document
        assert!(doc.is_ole);
        assert!(doc.file_size > 0);
    }

    #[test]
    fn test_roundtrip_non_ole() {
        let rt = MsbinaryRoundtrip::new();
        let input = b"random binary data that is not OLE";

        rt.parse(input).unwrap();
        let output = rt.serialize().unwrap();

        // Output should be valid JSON
        let json_str = std::str::from_utf8(&output).unwrap();
        assert!(json_str.contains("format"));
    }

    #[test]
    fn test_serialize_without_parse() {
        let rt = MsbinaryRoundtrip::new();
        let result = rt.serialize();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("No document parsed"));
    }
}
