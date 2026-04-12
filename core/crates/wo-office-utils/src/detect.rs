use serde::{Deserialize, Serialize};

use wo_common::Result;

use crate::ArchiveReader;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OfficeFormat {
    Ooxml,
    Odf,
    Epub,
    Xps,
    OoxmlStrict,
    Unknown,
}

pub fn detect_office_format(data: &[u8]) -> Result<OfficeFormat> {
    let reader = ArchiveReader::from_bytes(data)?;

    if let Some(entry) = reader.get("mimetype") {
        let mime = String::from_utf8_lossy(&entry.data);
        if mime.starts_with("application/epub+zip") {
            return Ok(OfficeFormat::Epub);
        }
        if mime.starts_with("application/vnd.oasis.opendocument") {
            return Ok(OfficeFormat::Odf);
        }
    }

    if reader.get("[Content_Types].xml").is_some() {
        if reader.get("FixedDocumentSequence.fdseq").is_some() {
            return Ok(OfficeFormat::Xps);
        }
        return Ok(OfficeFormat::Ooxml);
    }

    if reader.get("FixedDocumentSequence.fdseq").is_some() {
        return Ok(OfficeFormat::Xps);
    }

    Ok(OfficeFormat::Unknown)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_zip(entries: &[(&str, &[u8])]) -> Vec<u8> {
        let mut writer = crate::ArchiveWriter::new().unwrap();
        for (name, data) in entries {
            writer.add_file(name, data).unwrap();
        }
        writer.finish().unwrap()
    }

    fn make_zip_with_stored_first(entries: &[(&str, &[u8], bool)]) -> Vec<u8> {
        let mut writer = crate::ArchiveWriter::new().unwrap();
        for (name, data, stored) in entries {
            let method = if *stored {
                zip::CompressionMethod::Stored
            } else {
                zip::CompressionMethod::Deflated
            };
            writer
                .add_file_with_compression(name, data, method)
                .unwrap();
        }
        writer.finish().unwrap()
    }

    #[test]
    fn test_detect_ooxml() {
        let zip = make_zip(&[("[Content_Types].xml", b"<Types></Types>")]);
        assert_eq!(detect_office_format(&zip).unwrap(), OfficeFormat::Ooxml);
    }

    #[test]
    fn test_detect_odf() {
        let zip = make_zip_with_stored_first(&[
            ("mimetype", b"application/vnd.oasis.opendocument.text", true),
            ("content.xml", b"<doc/>", false),
        ]);
        assert_eq!(detect_office_format(&zip).unwrap(), OfficeFormat::Odf);
    }

    #[test]
    fn test_detect_epub() {
        let zip = make_zip_with_stored_first(&[
            ("mimetype", b"application/epub+zip", true),
            ("META-INF/container.xml", b"<container/>", false),
        ]);
        assert_eq!(detect_office_format(&zip).unwrap(), OfficeFormat::Epub);
    }

    #[test]
    fn test_detect_xps() {
        let zip = make_zip(&[(
            "FixedDocumentSequence.fdseq",
            b"<Sequence><DocumentReference Source='doc.fdoc'/></Sequence>",
        )]);
        assert_eq!(detect_office_format(&zip).unwrap(), OfficeFormat::Xps);
    }

    #[test]
    fn test_detect_xps_with_content_types() {
        let zip = make_zip(&[
            ("[Content_Types].xml", b"<Types></Types>"),
            ("FixedDocumentSequence.fdseq", b"<Sequence></Sequence>"),
        ]);
        assert_eq!(detect_office_format(&zip).unwrap(), OfficeFormat::Xps);
    }

    #[test]
    fn test_detect_unknown() {
        let zip = make_zip(&[("somefile.txt", b"hello")]);
        assert_eq!(detect_office_format(&zip).unwrap(), OfficeFormat::Unknown);
    }

    #[test]
    fn test_detect_unknown_invalid_zip() {
        let result = detect_office_format(b"not a zip");
        assert!(result.is_err());
    }
}
