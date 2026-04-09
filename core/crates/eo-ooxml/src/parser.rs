//! OOXML format parser.
//!
//! Parses OOXML ZIP archives (DOCX, XLSX, PPTX) by reading:
//! - `[Content_Types].xml` — content type registry
//! - `_rels/.rels` — relationships
//! - `docProps/core.xml` — metadata
//! - Main document part

use std::io::{Cursor, Read};

use eo_common::{CoreError, Document, DocumentMetadata, Result};
use roxmltree::Document as XmlDoc;

use crate::detector::detect_ooxml_format;
use crate::model::*;

/// OOXML parser.
pub struct OoxmlParser;

impl OoxmlParser {
    pub fn new() -> Self {
        Self
    }

    /// Parse OOXML data (ZIP bytes) into an OoxmlDocument.
    pub fn parse(&self, data: &[u8]) -> Result<OoxmlDocument> {
        let cursor = Cursor::new(data);
        let mut archive = zip::ZipArchive::new(cursor).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Invalid ZIP: {}", e),
        })?;

        // Read [Content_Types].xml
        let ct_xml = self.read_zip_entry(&mut archive, "[Content_Types].xml")?;
        let ct_doc = XmlDoc::parse(&ct_xml).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Invalid [Content_Types].xml: {}", e),
        })?;

        let format = detect_ooxml_format(&ct_xml);

        // Parse content types
        let content_types = self.parse_content_types(&ct_doc);

        // Detect main part
        let main_part = match format {
            OoxmlFormat::Docx => Some("word/document.xml".to_string()),
            OoxmlFormat::Xlsx => Some("xl/workbook.xml".to_string()),
            OoxmlFormat::Pptx => Some("ppt/presentation.xml".to_string()),
            OoxmlFormat::Unknown => None,
        };

        // Read core properties
        let core_properties = if archive.by_name("docProps/core.xml").is_ok() {
            let core_xml = self.read_zip_entry(&mut archive, "docProps/core.xml")?;
            self.parse_core_properties(&core_xml)?
        } else {
            CoreProperties::default()
        };

        // Count parts
        let (part_count, shared_strings) = match format {
            OoxmlFormat::Xlsx => {
                let count = self.count_worksheets(&mut archive)?;
                let strings = self.extract_shared_strings(&mut archive)?;
                (count, strings)
            }
            OoxmlFormat::Pptx => {
                let count = self.count_slides(&mut archive)?;
                (count, Vec::new())
            }
            _ => (1, Vec::new()),
        };

        // Read relationships
        let relationships = if archive.by_name("_rels/.rels").is_ok() {
            let rels_xml = self.read_zip_entry(&mut archive, "_rels/.rels")?;
            self.parse_relationships(&rels_xml)?
        } else {
            Vec::new()
        };

        Ok(OoxmlDocument {
            format,
            version: "1.0".to_string(),
            content_types,
            main_part,
            shared_strings,
            part_count,
            core_properties,
            relationships,
        })
    }

    /// Parse OOXML and convert to a generic Document.
    pub fn parse_to_document(&self, data: &[u8]) -> Result<Document> {
        let ooxml = self.parse(data)?;

        let word_count = match ooxml.format {
            OoxmlFormat::Docx => {
                // Rough estimate: shared strings + 1 word per 6 chars
                let total_chars: usize = ooxml.shared_strings.iter().map(|s| s.len()).sum();
                total_chars / 6
            }
            _ => 0,
        };

        Ok(Document {
            content: data.to_vec(),
            format: ooxml.format.to_string(),
            metadata: DocumentMetadata {
                title: ooxml.core_properties.title.clone(),
                author: ooxml.core_properties.creator.clone(),
                word_count: Some(word_count as u32),
                ..Default::default()
            },
        })
    }

    fn read_zip_entry(
        &self,
        archive: &mut zip::ZipArchive<Cursor<&[u8]>>,
        path: &str,
    ) -> Result<String> {
        let mut file = archive.by_name(path).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Missing {}: {}", path, e),
        })?;
        let mut buf = String::new();
        Read::read_to_string(&mut file, &mut buf).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Cannot read {}: {}", path, e),
        })?;
        Ok(buf)
    }

    fn parse_content_types(&self, doc: &XmlDoc) -> Vec<ContentTypeEntry> {
        let mut entries = Vec::new();
        for node in doc.descendants() {
            if node.has_tag_name("Override") {
                let part_name = node.attribute("PartName").unwrap_or("").to_string();
                let ct = node.attribute("ContentType").unwrap_or("").to_string();
                if !ct.is_empty() {
                    entries.push(ContentTypeEntry {
                        extension: part_name,
                        content_type: ct,
                    });
                }
            } else if node.has_tag_name("Default") {
                let ext = node.attribute("Extension").unwrap_or("").to_string();
                let ct = node.attribute("ContentType").unwrap_or("").to_string();
                if !ext.is_empty() && !ct.is_empty() {
                    entries.push(ContentTypeEntry {
                        extension: ext,
                        content_type: ct,
                    });
                }
            }
        }
        entries
    }

    fn parse_core_properties(&self, xml: &str) -> Result<CoreProperties> {
        let doc = XmlDoc::parse(xml).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Invalid core.xml: {}", e),
        })?;

        let mut props = CoreProperties::default();
        for node in doc.descendants() {
            if !node.is_element() {
                continue;
            }
            let tag = node.tag_name().name();
            if let Some(text) = node.text() {
                let val = text.trim().to_string();
                if val.is_empty() {
                    continue;
                }
                match tag {
                    "title" => props.title = Some(val),
                    "creator" => props.creator = Some(val),
                    "subject" => props.subject = Some(val),
                    "description" => props.description = Some(val),
                    "keywords" => props.keywords = Some(val),
                    "language" => props.language = Some(val),
                    "lastModifiedBy" => props.last_modified_by = Some(val),
                    "created" => props.created = Some(val),
                    "modified" => props.modified = Some(val),
                    "category" => props.category = Some(val),
                    "revision" => props.revision = Some(val),
                    _ => {}
                }
            }
        }
        Ok(props)
    }

    fn parse_relationships(&self, xml: &str) -> Result<Vec<Relationship>> {
        let doc = XmlDoc::parse(xml).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Invalid .rels: {}", e),
        })?;

        let mut rels = Vec::new();
        for node in doc.descendants() {
            if node.has_tag_name("Relationship") {
                let id = node.attribute("Id").unwrap_or("").to_string();
                let rel_type = node.attribute("Type").unwrap_or("").to_string();
                let target = node.attribute("Target").unwrap_or("").to_string();
                let target_mode = node.attribute("TargetMode").map(|s| s.to_string());
                if !id.is_empty() && !rel_type.is_empty() {
                    rels.push(Relationship {
                        id,
                        rel_type,
                        target,
                        target_mode,
                    });
                }
            }
        }
        Ok(rels)
    }

    fn count_worksheets(&self, archive: &mut zip::ZipArchive<Cursor<&[u8]>>) -> Result<u32> {
        let mut count = 0u32;
        for i in 0..archive.len() {
            if let Ok(name) = archive.by_index(i).map(|f| f.name().to_string()) {
                if name.starts_with("xl/worksheets/sheet") && name.ends_with(".xml") {
                    count += 1;
                }
            }
        }
        Ok(count)
    }

    fn count_slides(&self, archive: &mut zip::ZipArchive<Cursor<&[u8]>>) -> Result<u32> {
        let mut count = 0u32;
        for i in 0..archive.len() {
            if let Ok(name) = archive.by_index(i).map(|f| f.name().to_string()) {
                if name.starts_with("ppt/slides/slide") && name.ends_with(".xml") {
                    count += 1;
                }
            }
        }
        Ok(count)
    }

    fn extract_shared_strings(
        &self,
        archive: &mut zip::ZipArchive<Cursor<&[u8]>>,
    ) -> Result<Vec<String>> {
        if archive.by_name("xl/sharedStrings.xml").is_err() {
            return Ok(Vec::new());
        }
        let xml = self.read_zip_entry(archive, "xl/sharedStrings.xml")?;
        let doc = XmlDoc::parse(&xml).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Invalid sharedStrings.xml: {}", e),
        })?;

        let mut strings = Vec::new();
        for node in doc.descendants() {
            if node.has_tag_name("si") || node.has_tag_name("t") {
                if let Some(text) = node.text() {
                    let val = text.trim().to_string();
                    if !val.is_empty() {
                        strings.push(val);
                    }
                }
            }
        }
        Ok(strings)
    }
}

impl Default for OoxmlParser {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::is_ooxml_file;
    use std::io::Write;

    fn make_minimal_docx() -> Vec<u8> {
        let mut buf = Vec::new();
        {
            let mut zip = zip::ZipWriter::new(std::io::Cursor::new(&mut buf));
            zip.start_file(
                "[Content_Types].xml",
                zip::write::SimpleFileOptions::default(),
            )
            .unwrap();
            zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"#)
                .unwrap();

            zip.start_file("_rels/.rels", zip::write::SimpleFileOptions::default())
                .unwrap();
            zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"#)
                .unwrap();

            zip.start_file(
                "docProps/core.xml",
                zip::write::SimpleFileOptions::default(),
            )
            .unwrap();
            zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>Test Document</dc:title>
  <dc:creator>World Office</dc:creator>
  <dc:subject>OOXML Parser Test</dc:subject>
</cp:coreProperties>"#)
                .unwrap();

            zip.start_file(
                "word/document.xml",
                zip::write::SimpleFileOptions::default(),
            )
            .unwrap();
            zip.write_all(
                br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>Hello World</w:t></w:r></w:p></w:body>
</w:document>"#,
            )
            .unwrap();

            zip.finish().unwrap();
        }
        buf
    }

    #[test]
    fn test_is_ooxml_file() {
        let docx = make_minimal_docx();
        assert!(is_ooxml_file(&docx));
        assert!(!is_ooxml_file(b"<html>not ooxml</html>"));
        assert!(!is_ooxml_file(b""));
    }

    #[test]
    fn test_parse_docx() {
        let parser = OoxmlParser::new();
        let doc = parser.parse(&make_minimal_docx()).unwrap();
        assert_eq!(doc.format, OoxmlFormat::Docx);
        assert_eq!(doc.main_part.as_deref(), Some("word/document.xml"));
        assert_eq!(doc.core_properties.title.as_deref(), Some("Test Document"));
        assert_eq!(doc.core_properties.creator.as_deref(), Some("World Office"));
    }

    #[test]
    fn test_detect_format() {
        let docx_ct = r#"<Types><Override PartName='/word/document.xml' ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'/></Types>"#;
        assert_eq!(detect_ooxml_format(docx_ct), OoxmlFormat::Docx);

        let xlsx_ct = r#"<Types><Override PartName='/xl/workbook.xml' ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'/></Types>"#;
        assert_eq!(detect_ooxml_format(xlsx_ct), OoxmlFormat::Xlsx);

        let pptx_ct = r#"<Types><Override PartName='/ppt/presentation.xml' ContentType='application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml'/></Types>"#;
        assert_eq!(detect_ooxml_format(pptx_ct), OoxmlFormat::Pptx);
    }

    #[test]
    fn test_rejects_non_ooxml() {
        let parser = OoxmlParser::new();
        let result = parser.parse(b"not a zip file");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_to_document() {
        let parser = OoxmlParser::new();
        let doc = parser.parse_to_document(&make_minimal_docx()).unwrap();
        assert_eq!(doc.format, "docx");
        assert_eq!(doc.metadata.title.as_deref(), Some("Test Document"));
    }

    #[test]
    fn test_format_display() {
        assert_eq!(OoxmlFormat::Docx.to_string(), "docx");
        assert_eq!(OoxmlFormat::Xlsx.to_string(), "xlsx");
        assert_eq!(OoxmlFormat::Pptx.to_string(), "pptx");
    }
}
