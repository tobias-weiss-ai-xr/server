//! DjVu format parser.
//!
//! Parses DjVu files by reading the IFF (Interchange File Format) container
//! and extracting metadata from INFO chunks.

use wo_common::{CoreError, Document, DocumentMetadata, Result};

use crate::model::*;

/// DjVu format parser.
pub struct DjvuParser;

impl DjvuParser {
    /// Create a new parser.
    pub fn new() -> Self {
        Self
    }

    /// Parse raw DjVu data into a DjvuDocument.
    pub fn parse(&self, data: &[u8]) -> Result<DjvuDocument> {
        // 1. Verify magic bytes
        if data.len() < 12 {
            return Err(CoreError::Parse {
                format: "djvu".into(),
                message: "File too small to be DjVu".into(),
            });
        }

        if &data[..8] != b"AT&TFORM" {
            return Err(CoreError::Parse {
                format: "djvu".into(),
                message: "Invalid DjVu magic bytes (expected AT&TFORM)".into(),
            });
        }

        // 2. Read subtype (4 bytes after magic)
        let subtype = String::from_utf8_lossy(&data[8..12]).to_string();

        // 3. Walk IFF chunks starting at offset 12
        let chunks = self.read_chunks(data, 12)?;

        // 4. Find INFO chunk for metadata
        let mut page_count = 1u32;
        let mut title = None;
        let mut width = 0u32;
        let mut height = 0u32;
        let mut version_major = 0u8;
        let mut version_minor = 0u8;

        for chunk in &chunks {
            if chunk.chunk_type == "INFO" {
                let chunk_data = &data[chunk.offset as usize..(chunk.offset + chunk.size) as usize];
                if let Ok(info) = self.parse_info_chunk(chunk_data) {
                    width = info.0;
                    height = info.1;
                    version_minor = info.2;
                    version_major = info.3;
                    title = info.4;
                }
            }
        }

        // Check for DJVM (multipage) — page count from FORM:DJVM
        if subtype == "DJVM" {
            // DJVM documents contain DIRM chunk with page count
            for chunk in &chunks {
                if chunk.chunk_type == "DIRM" {
                    // DIRM format: first 4 bytes = number of included files
                    if chunk.size >= 4 {
                        let chunk_data =
                            &data[chunk.offset as usize..(chunk.offset + chunk.size) as usize];
                        page_count = u32::from_be_bytes([
                            chunk_data[0],
                            chunk_data[1],
                            chunk_data[2],
                            chunk_data[3],
                        ]);
                    }
                }
            }
        }

        Ok(DjvuDocument {
            subtype,
            page_count,
            title,
            width,
            height,
            version: format!("{}.{}", version_major, version_minor),
            chunks,
        })
    }

    /// Walk IFF chunks starting at a given offset.
    fn read_chunks(&self, data: &[u8], start: usize) -> Result<Vec<DjvuChunk>> {
        let mut chunks = Vec::new();
        let mut offset = start;

        while offset + 8 <= data.len() {
            // Read 4-byte chunk type
            let chunk_type = String::from_utf8_lossy(&data[offset..offset + 4]).to_string();
            offset += 4;

            // Read 4-byte chunk size (big-endian)
            if offset + 4 > data.len() {
                break;
            }
            let size = u32::from_be_bytes([
                data[offset],
                data[offset + 1],
                data[offset + 2],
                data[offset + 3],
            ]) as u64;
            offset += 4;

            // FORM chunks are containers (size includes the 4-byte subtype)
            let data_offset = offset;
            let data_size = if chunk_type == "FORM" || chunk_type == "PROP" {
                size.saturating_sub(4)
            } else {
                size
            };

            chunks.push(DjvuChunk {
                chunk_type,
                offset: data_offset as u64,
                size: data_size,
            });

            // Advance past chunk data (IFF chunks are padded to even boundaries)
            offset += size as usize;
            if offset % 2 != 0 {
                offset += 1;
            }
        }

        Ok(chunks)
    }

    /// Parse an INFO chunk to extract metadata.
    /// Returns: (width, height, minor_version, major_version, title)
    fn parse_info_chunk(&self, data: &[u8]) -> Result<(u32, u32, u8, u8, Option<String>)> {
        if data.len() < 8 {
            return Err(CoreError::Parse {
                format: "djvu".into(),
                message: "INFO chunk too small".into(),
            });
        }

        let width = u16::from_be_bytes([data[0], data[1]]) as u32;
        let height = u16::from_be_bytes([data[2], data[3]]) as u32;
        let minor_version = data[4];
        let major_version = data[5];
        // data[6] = resolution (dpi), data[7] = gamma
        // Remaining bytes: title string (null-terminated, but may be absent)

        let title = if data.len() > 8 {
            let title_bytes = &data[8..];
            let null_pos = title_bytes.iter().position(|&b| b == 0);
            let title_data = match null_pos {
                Some(pos) => &title_bytes[..pos],
                None => title_bytes,
            };
            let decoded = String::from_utf8_lossy(title_data).to_string();
            let trimmed = decoded.trim().to_string();
            if trimmed.is_empty() {
                None
            } else {
                Some(trimmed)
            }
        } else {
            None
        };

        Ok((width, height, minor_version, major_version, title))
    }

    /// Parse DjVu data and convert to a generic Document.
    pub fn parse_to_document(&self, data: &[u8]) -> Result<Document> {
        let djvu = self.parse(data)?;

        Ok(Document {
            content: data.to_vec(),
            format: "djvu".into(),
            metadata: DocumentMetadata {
                title: djvu.title.clone(),
                page_count: Some(djvu.page_count),
                ..Default::default()
            },
        })
    }
}

impl Default for DjvuParser {
    fn default() -> Self {
        Self::new()
    }
}

/// Build a minimal DjVu file for testing.
#[cfg(test)]
fn build_test_djvu(width: u16, height: u16, title: &str) -> Vec<u8> {
    let mut out = Vec::new();

    // Magic + subtype
    out.extend_from_slice(b"AT&TFORMDJVU");

    // INFO chunk: type(4) + size(4) + width(2) + height(2) + minor(1) + major(1) + dpi(1) + gamma(1) + title(null-term)
    let mut info_data = Vec::new();
    info_data.extend_from_slice(&width.to_be_bytes());
    info_data.extend_from_slice(&height.to_be_bytes());
    info_data.push(25); // minor version
    info_data.push(0); // major version
    info_data.push(72); // dpi
    info_data.push(22); // gamma
    info_data.extend_from_slice(title.as_bytes());
    info_data.push(0); // null terminator

    out.extend_from_slice(b"INFO");
    out.extend_from_slice(&(info_data.len() as u32).to_be_bytes());
    out.extend_from_slice(&info_data);

    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::is_djvu_file;

    #[test]
    fn test_parse_minimal_djvu() {
        let parser = DjvuParser::new();
        let data = build_test_djvu(800, 600, "Test Document");
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.subtype, "DJVU");
        assert_eq!(doc.width, 800);
        assert_eq!(doc.height, 600);
        assert_eq!(doc.title.as_deref(), Some("Test Document"));
        assert_eq!(doc.version, "0.25");
    }

    #[test]
    fn test_parse_djvu_no_title() {
        let parser = DjvuParser::new();
        let data = build_test_djvu(1024, 768, "");
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.width, 1024);
        assert_eq!(doc.height, 768);
        assert!(doc.title.is_none());
    }

    #[test]
    fn test_parse_djvu_chunks() {
        let parser = DjvuParser::new();
        let data = build_test_djvu(640, 480, "Chunks");
        let doc = parser.parse(&data).unwrap();

        assert!(!doc.chunks.is_empty());
        assert_eq!(doc.chunks[0].chunk_type, "INFO");
    }

    #[test]
    fn test_parse_to_document() {
        let parser = DjvuParser::new();
        let data = build_test_djvu(800, 600, "My DjVu");
        let doc = parser.parse_to_document(&data).unwrap();

        assert_eq!(doc.format, "djvu");
        assert_eq!(doc.metadata.title.as_deref(), Some("My DjVu"));
        assert_eq!(doc.metadata.page_count, Some(1));
    }

    #[test]
    fn test_is_djvu_file() {
        let data = build_test_djvu(800, 600, "Test");
        assert!(is_djvu_file(&data));
        assert!(!is_djvu_file(b"not djvu at all"));
        assert!(!is_djvu_file(b""));
        assert!(!is_djvu_file(&[0x41, 0x54, 0x26])); // truncated magic
    }

    #[test]
    fn test_rejects_non_djvu() {
        let parser = DjvuParser::new();
        let result = parser.parse(b"this is not a djvu file");
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("Invalid DjVu magic bytes"));
    }

    #[test]
    fn test_rejects_too_small() {
        let parser = DjvuParser::new();
        let result = parser.parse(b"AT&T");
        assert!(result.is_err());
    }

    #[test]
    fn test_unicode_title() {
        let parser = DjvuParser::new();
        let data = build_test_djvu(800, 600, "文档测试");
        let doc = parser.parse(&data).unwrap();
        assert_eq!(doc.title.as_deref(), Some("文档测试"));
    }
}
