use std::io::{Cursor, Read, Write};
use std::path::Path;

use zip::read::ZipArchive;
use zip::write::SimpleFileOptions;
use zip::CompressionMethod;
use zip::ZipWriter;

use wo_common::{CoreError, Result};

#[derive(Debug, Clone)]
pub struct ArchiveEntry {
    pub name: String,
    pub data: Vec<u8>,
    pub compressed_size: u64,
    pub uncompressed_size: u64,
}

pub struct ArchiveReader {
    entries: Vec<ArchiveEntry>,
}

impl ArchiveReader {
    pub fn from_bytes(data: &[u8]) -> Result<Self> {
        let cursor = Cursor::new(data);
        let mut archive = ZipArchive::new(cursor).map_err(|e| CoreError::Parse {
            format: "ZIP".into(),
            message: e.to_string(),
        })?;

        let mut entries = Vec::with_capacity(archive.len());
        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| CoreError::Parse {
                format: "ZIP".into(),
                message: e.to_string(),
            })?;

            let name = file.name().to_owned();
            let compressed_size = file.compressed_size();
            let uncompressed_size = file.size();

            let mut data = Vec::with_capacity(uncompressed_size as usize);
            file.read_to_end(&mut data).map_err(CoreError::Io)?;

            entries.push(ArchiveEntry {
                name,
                data,
                compressed_size,
                uncompressed_size,
            });
        }

        Ok(Self { entries })
    }

    pub fn from_file(path: &Path) -> Result<Self> {
        let data = std::fs::read(path).map_err(CoreError::Io)?;
        Self::from_bytes(&data)
    }

    pub fn entry_names(&self) -> Vec<&str> {
        self.entries.iter().map(|e| e.name.as_str()).collect()
    }

    pub fn get(&self, name: &str) -> Option<&ArchiveEntry> {
        self.entries.iter().find(|e| e.name == name)
    }

    pub fn get_case_insensitive(&self, name: &str) -> Option<&ArchiveEntry> {
        self.entries
            .iter()
            .find(|e| e.name.eq_ignore_ascii_case(name))
    }

    pub fn find_by_prefix(&self, prefix: &str) -> Vec<&ArchiveEntry> {
        self.entries
            .iter()
            .filter(|e| e.name.starts_with(prefix))
            .collect()
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    pub fn entries(&self) -> &[ArchiveEntry] {
        &self.entries
    }
}

pub struct ArchiveWriter {
    writer: ZipWriter<Cursor<Vec<u8>>>,
}

impl ArchiveWriter {
    pub fn new() -> Result<Self> {
        let writer = ZipWriter::new(Cursor::new(Vec::new()));
        Ok(Self { writer })
    }

    pub fn add_file(&mut self, name: &str, data: &[u8]) -> Result<()> {
        self.add_file_with_compression(name, data, CompressionMethod::Deflated)
    }

    pub fn add_file_with_compression(
        &mut self,
        name: &str,
        data: &[u8],
        method: CompressionMethod,
    ) -> Result<()> {
        let options = SimpleFileOptions::default().compression_method(method);
        self.writer
            .start_file(name, options)
            .map_err(|e| CoreError::Parse {
                format: "ZIP".into(),
                message: e.to_string(),
            })?;
        self.writer.write_all(data).map_err(CoreError::Io)?;
        Ok(())
    }

    pub fn add_directory(&mut self, name: &str) -> Result<()> {
        let dir_name = if name.ends_with('/') {
            name.to_owned()
        } else {
            format!("{name}/")
        };
        let options = SimpleFileOptions::default().compression_method(CompressionMethod::Stored);
        self.writer
            .add_directory(&dir_name, options)
            .map_err(|e| CoreError::Parse {
                format: "ZIP".into(),
                message: e.to_string(),
            })?;
        Ok(())
    }

    pub fn finish(self) -> Result<Vec<u8>> {
        let cursor = self.writer.finish().map_err(|e| CoreError::Parse {
            format: "ZIP".into(),
            message: e.to_string(),
        })?;
        Ok(cursor.into_inner())
    }
}

impl Default for ArchiveWriter {
    fn default() -> Self {
        Self::new().expect("in-memory ZipWriter creation should not fail")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_zip(entries: &[(&str, &[u8])]) -> Vec<u8> {
        let mut writer = ArchiveWriter::new().unwrap();
        for (name, data) in entries {
            writer.add_file(name, data).unwrap();
        }
        writer.finish().unwrap()
    }

    #[test]
    fn test_create_and_read_zip() {
        let data = b"Hello, World!";
        let zip_bytes = make_zip(&[("hello.txt", data.as_slice())]);

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        assert_eq!(reader.len(), 1);
        assert_eq!(reader.get("hello.txt").unwrap().data, data);
    }

    #[test]
    fn test_multiple_entries() {
        let zip_bytes = make_zip(&[("a.txt", b"AAA"), ("b.txt", b"BBB"), ("c.txt", b"CCC")]);

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        assert_eq!(reader.len(), 3);
        assert_eq!(reader.get("a.txt").unwrap().data, b"AAA");
        assert_eq!(reader.get("b.txt").unwrap().data, b"BBB");
        assert_eq!(reader.get("c.txt").unwrap().data, b"CCC");
    }

    #[test]
    fn test_directory_entry() {
        let mut writer = ArchiveWriter::new().unwrap();
        writer.add_directory("mydir").unwrap();
        writer.add_file("mydir/file.txt", b"data").unwrap();
        let zip_bytes = writer.finish().unwrap();

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        let names = reader.entry_names();
        assert!(names.contains(&"mydir/"));
        assert!(names.contains(&"mydir/file.txt"));
    }

    #[test]
    fn test_get_case_insensitive() {
        let zip_bytes = make_zip(&[("Content.xml", b"<root/>")]);

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        assert!(reader.get("content.xml").is_none());
        assert!(reader.get_case_insensitive("content.xml").is_some());
        assert_eq!(
            reader.get_case_insensitive("CONTENT.XML").unwrap().data,
            b"<root/>"
        );
    }

    #[test]
    fn test_find_by_prefix() {
        let zip_bytes = make_zip(&[
            ("word/document.xml", b"<doc/>"),
            ("word/styles.xml", b"<styles/>"),
            ("META-INF/manifest.xml", b"<manifest/>"),
        ]);

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        let word_entries = reader.find_by_prefix("word/");
        assert_eq!(word_entries.len(), 2);
    }

    #[test]
    fn test_empty_archive() {
        let writer = ArchiveWriter::new().unwrap();
        let zip_bytes = writer.finish().unwrap();

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        assert!(reader.is_empty());
        assert_eq!(reader.len(), 0);
    }

    #[test]
    fn test_from_bytes_invalid() {
        let result = ArchiveReader::from_bytes(b"this is not a zip file");
        assert!(result.is_err());
    }

    #[test]
    fn test_entry_sizes() {
        let data = b"Some content here";
        let zip_bytes = make_zip(&[("test.txt", data.as_slice())]);

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        let entry = reader.get("test.txt").unwrap();
        assert_eq!(entry.uncompressed_size, data.len() as u64);
        assert!(entry.compressed_size > 0);
    }

    #[test]
    fn test_detect_ooxml() {
        let zip_bytes = make_zip(&[("[Content_Types].xml", b"<Types></Types>")]);

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        assert!(reader.get("[Content_Types].xml").is_some());
    }

    #[test]
    fn test_detect_odf() {
        let mut writer = ArchiveWriter::new().unwrap();
        writer
            .add_file_with_compression(
                "mimetype",
                b"application/vnd.oasis.opendocument.text",
                CompressionMethod::Stored,
            )
            .unwrap();
        writer.add_file("content.xml", b"<doc/>").unwrap();
        let zip_bytes = writer.finish().unwrap();

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        assert!(reader.get("mimetype").is_some());
        assert_eq!(
            reader.get("mimetype").unwrap().data,
            b"application/vnd.oasis.opendocument.text"
        );
    }

    #[test]
    fn test_detect_epub() {
        let mut writer = ArchiveWriter::new().unwrap();
        writer
            .add_file_with_compression(
                "mimetype",
                b"application/epub+zip",
                CompressionMethod::Stored,
            )
            .unwrap();
        let zip_bytes = writer.finish().unwrap();

        let reader = ArchiveReader::from_bytes(&zip_bytes).unwrap();
        assert!(reader.get("mimetype").is_some());
        assert_eq!(
            reader.get("mimetype").unwrap().data,
            b"application/epub+zip"
        );
    }
}
