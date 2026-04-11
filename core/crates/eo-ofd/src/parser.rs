//! OFD format parser.
//!
//! Parses OFD (Open Fixed-layout Document) ZIP archives into the OfdDocument model.

use roxmltree::Document as XmlDoc;

use eo_common::{CoreError, Document, DocumentMetadata, Result};
use eo_office_utils::ArchiveReader;

use crate::model::*;

/// OFD format parser.
pub struct OfdParser;

impl OfdParser {
    /// Create a new parser.
    pub fn new() -> Self {
        Self
    }

    /// Parse raw OFD data (ZIP bytes) into an OfdDocument.
    pub fn parse(&self, data: &[u8]) -> Result<OfdDocument> {
        let archive = ArchiveReader::from_bytes(data).map_err(|e| CoreError::Parse {
            format: "ofd".into(),
            message: format!("Invalid ZIP archive: {}", e),
        })?;

        // 1. Parse OFD.xml (root document)
        let ofd_entry = archive
            .get("OFD.xml")
            .or_else(|| archive.get_case_insensitive("OFD.xml"))
            .ok_or_else(|| CoreError::Parse {
                format: "ofd".into(),
                message: "OFD.xml not found".into(),
            })?;

        let (doc_root, version) = self.parse_ofd_xml(&ofd_entry.data)?;

        // 2. Parse Document.xml (metadata and page references)
        // doc_root from FileLoc is the full path to the document file
        let doc_body = if let Some(ref doc_path) = doc_root {
            if let Some(entry) = archive
                .get(doc_path)
                .or_else(|| archive.get_case_insensitive(doc_path))
            {
                self.parse_document_xml(&entry.data)?
            } else {
                None
            }
        } else {
            None
        };

        // 3. Find and parse pages
        let page_entries: Vec<_> = archive
            .find_by_prefix("Doc_0/Pages/")
            .into_iter()
            .filter(|e| e.name.ends_with(".xml"))
            .collect();

        let mut pages = Vec::new();
        for (i, entry) in page_entries.iter().enumerate() {
            match self.parse_page_xml(&entry.data, i as u32) {
                Ok(page) => pages.push(page),
                Err(_) => {
                    // Skip unparseable pages
                    pages.push(OfdPage {
                        id: None,
                        index: i as u32,
                        width: 210.0,
                        height: 297.0,
                        base_loc: None,
                        text_content: Vec::new(),
                        image_refs: Vec::new(),
                    });
                }
            }
        }

        // 4. Collect resources
        let resources = self.collect_resources(&archive);

        Ok(OfdDocument {
            version,
            doc_body,
            page_count: pages.len() as u32,
            pages,
            resources,
        })
    }

    /// Parse OFD.xml root document.
    fn parse_ofd_xml(&self, data: &[u8]) -> Result<(Option<String>, Option<String>)> {
        let text = std::str::from_utf8(data).map_err(|e| CoreError::Parse {
            format: "ofd".into(),
            message: format!("Invalid UTF-8 in OFD.xml: {}", e),
        })?;

        let xml = XmlDoc::parse(text).map_err(|e| CoreError::Parse {
            format: "ofd".into(),
            message: format!("XML parse error in OFD.xml: {}", e),
        })?;

        let root = xml.root_element();
        let version = root.attribute("Version").map(|s| s.to_string());

        // Find DocBody element
        let doc_root = root
            .children()
            .find(|c| c.has_tag_name("DocBody"))
            .and_then(|body| {
                body.children()
                    .find(|c| c.has_tag_name("DocRoot"))
                    .and_then(|dr| dr.attribute("FileLoc").map(|s| s.to_string()))
            });

        Ok((doc_root, version))
    }

    /// Parse Document.xml for metadata.
    fn parse_document_xml(&self, data: &[u8]) -> Result<Option<OfdDocBody>> {
        let text = std::str::from_utf8(data).map_err(|e| CoreError::Parse {
            format: "ofd".into(),
            message: format!("Invalid UTF-8 in Document.xml: {}", e),
        })?;

        let xml = XmlDoc::parse(text).map_err(|e| CoreError::Parse {
            format: "ofd".into(),
            message: format!("XML parse error in Document.xml: {}", e),
        })?;

        let root = xml.root_element();

        // Find DocInfo element
        let doc_info = root.children().find(|c| c.has_tag_name("DocInfo"));

        if let Some(info) = doc_info {
            let mut body = OfdDocBody::default();
            body.doc_id = self.child_text(&info, "DocID");
            body.title = self.child_text(&info, "Title");
            body.author = self.child_text(&info, "Author");
            body.creation_date = self.child_text(&info, "CreationDate");
            body.mod_date = self.child_text(&info, "ModDate");
            Ok(Some(body))
        } else {
            Ok(None)
        }
    }

    /// Parse a page XML file.
    fn parse_page_xml(&self, data: &[u8], index: u32) -> Result<OfdPage> {
        let text = std::str::from_utf8(data).map_err(|e| CoreError::Parse {
            format: "ofd".into(),
            message: format!("Invalid UTF-8 in page XML: {}", e),
        })?;

        let xml = XmlDoc::parse(text).map_err(|e| CoreError::Parse {
            format: "ofd".into(),
            message: format!("XML parse error in page: {}", e),
        })?;

        let root = xml.root_element();
        let page_area = root.children().find(|c| c.has_tag_name("PageArea"));

        let (width, height) = if let Some(area) = page_area {
            let phys_box = area.attribute("PhysicalBox");
            if let Some(box_str) = phys_box {
                let parts: Vec<f64> = box_str
                    .split_whitespace()
                    .filter_map(|s| s.parse().ok())
                    .collect();
                if parts.len() >= 4 {
                    (parts[2] - parts[0], parts[3] - parts[1])
                } else {
                    (210.0, 297.0) // A4 default
                }
            } else {
                (210.0, 297.0)
            }
        } else {
            (210.0, 297.0)
        };

        // Extract text content from TextObject elements
        let text_content = self.extract_text_objects(&root);

        // Extract image references from ImageObject elements
        let image_refs = self.extract_image_objects(&root);

        Ok(OfdPage {
            id: root.attribute("ID").map(|s| s.to_string()),
            index,
            width,
            height,
            base_loc: None,
            text_content,
            image_refs,
        })
    }

    /// Extract TextObject elements from a page's Content/Layer.
    fn extract_text_objects(&self, root: &roxmltree::Node) -> Vec<OfdTextObject> {
        let mut objects = Vec::new();

        for node in root.descendants() {
            if !node.has_tag_name("TextObject") {
                continue;
            }

            let boundary = node.attribute("Boundary").and_then(|b| {
                let parts: Vec<f64> = b
                    .split_whitespace()
                    .filter_map(|s| s.parse().ok())
                    .collect();
                if parts.len() == 4 {
                    Some((parts[0], parts[1], parts[2], parts[3]))
                } else {
                    None
                }
            });

            let font_id = node.attribute("Font").map(|s| s.to_string());
            let font_size = node.attribute("Size").and_then(|s| s.parse::<f64>().ok());
            let bold = node.attribute("Bold").map(|s| s == "true").unwrap_or(false);
            let italic = node
                .attribute("Italic")
                .map(|s| s == "true")
                .unwrap_or(false);

            // Extract text from TextCode children
            let text = node
                .descendants()
                .filter(|n| n.has_tag_name("TextCode"))
                .filter_map(|tc| tc.text().map(|t| t.to_string()))
                .collect::<Vec<_>>()
                .join("");

            objects.push(OfdTextObject {
                boundary,
                text,
                font_id,
                font_size,
                bold,
                italic,
            });
        }

        objects
    }

    /// Extract ImageObject elements from a page's Content/Layer.
    fn extract_image_objects(&self, root: &roxmltree::Node) -> Vec<OfdImageObject> {
        let mut images = Vec::new();

        for node in root.descendants() {
            if !node.has_tag_name("ImageObject") {
                continue;
            }

            let boundary = node.attribute("Boundary").and_then(|b| {
                let parts: Vec<f64> = b
                    .split_whitespace()
                    .filter_map(|s| s.parse().ok())
                    .collect();
                if parts.len() == 4 {
                    Some((parts[0], parts[1], parts[2], parts[3]))
                } else {
                    None
                }
            });

            let resource_id = node.attribute("ResourceID").map(|s| s.to_string());
            let format = node
                .attribute("Format")
                .or(node.attribute("Subtype"))
                .map(|s| s.to_string());
            let alt_text = node.attribute("AltText").map(|s| s.to_string());

            images.push(OfdImageObject {
                boundary,
                resource_id,
                format,
                alt_text,
            });
        }

        images
    }

    /// Collect resources from the archive.
    fn collect_resources(&self, archive: &ArchiveReader) -> Vec<OfdResource> {
        let mut resources = Vec::new();

        for entry in archive.find_by_prefix("Doc_0/Res/") {
            let resource_type = if entry.name.contains("Font") {
                "font".to_string()
            } else if entry.name.ends_with(".png")
                || entry.name.ends_with(".jpg")
                || entry.name.ends_with(".jpeg")
                || entry.name.ends_with(".tif")
                || entry.name.ends_with(".tiff")
                || entry.name.ends_with(".bmp")
            {
                "image".to_string()
            } else {
                "other".to_string()
            };
            resources.push(OfdResource {
                uri: entry.name.clone(),
                resource_type,
            });
        }

        resources
    }

    /// Get text content of a child element by tag name.
    fn child_text(&self, node: &roxmltree::Node, tag: &str) -> Option<String> {
        node.children()
            .find(|c| c.has_tag_name(tag))
            .and_then(|child| {
                let mut text = String::new();
                for desc in child.descendants() {
                    if desc.is_text() {
                        if let Some(t) = desc.text() {
                            text.push_str(t);
                        }
                    }
                }
                let trimmed = text.trim().to_string();
                if trimmed.is_empty() {
                    None
                } else {
                    Some(trimmed)
                }
            })
    }

    /// Parse OFD data and convert to a generic Document.
    pub fn parse_to_document(&self, data: &[u8]) -> Result<Document> {
        let ofd = self.parse(data)?;

        let title = ofd
            .doc_body
            .as_ref()
            .and_then(|b| b.title.clone())
            .unwrap_or_default();

        let author = ofd
            .doc_body
            .as_ref()
            .and_then(|b| b.author.clone())
            .unwrap_or_default();

        Ok(Document {
            content: data.to_vec(),
            format: "ofd".into(),
            metadata: DocumentMetadata {
                title: Some(title),
                author: Some(author),
                page_count: Some(ofd.page_count),
                ..Default::default()
            },
        })
    }
}

impl Default for OfdParser {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::is_ofd_file;
    use eo_office_utils::ArchiveWriter;

    fn create_test_ofd() -> Vec<u8> {
        let mut writer = ArchiveWriter::new().unwrap();
        writer.add_file("OFD.xml", OFD_XML.as_bytes()).unwrap();
        writer
            .add_file("Doc_0/Document.xml", DOCUMENT_XML.as_bytes())
            .unwrap();
        writer
            .add_file("Doc_0/Pages/Page_0.xml", PAGE_XML.as_bytes())
            .unwrap();
        writer
            .add_file("Doc_0/Pages/Page_1.xml", PAGE_XML.as_bytes())
            .unwrap();
        writer.finish().unwrap()
    }

    const OFD_XML: &str = r##"<?xml version="1.0" encoding="UTF-8"?>
<OFD Version="1.0">
  <DocBody>
    <DocRoot FileLoc="Doc_0/Document.xml"/>
  </DocBody>
</OFD>"##;

    const DOCUMENT_XML: &str = r##"<?xml version="1.0" encoding="UTF-8"?>
<Document>
  <CommonData>
    <MaxUnitID>100</MaxUnitID>
    <PageArea>
      <PhysicalBox>0 0 210 297</PhysicalBox>
    </PageArea>
  </CommonData>
  <Pages>
    <Page ID="1" BaseLoc="Pages/Page_0.xml"/>
    <Page ID="2" BaseLoc="Pages/Page_1.xml"/>
  </Pages>
  <DocInfo>
    <DocID>test-ofd-001</DocID>
    <Title>Test OFD Document</Title>
    <Author>World Office</Author>
    <CreationDate>2026-01-01</CreationDate>
    <ModDate>2026-01-01</ModDate>
  </DocInfo>
</Document>"##;

    const PAGE_XML: &str = r##"<?xml version="1.0" encoding="UTF-8"?>
<Page ID="1">
  <Content>
    <Layer>
      <TextObject Boundary="30 50 150 20" Font="1" Size="12">
        <TextCode>X=30 Y=50</TextCode>
      </TextObject>
    </Layer>
  </Content>
  <PageArea>
    <PhysicalBox>0 0 210 297</PhysicalBox>
  </PageArea>
</Page>"##;

    #[test]
    fn test_parse_minimal_ofd() {
        let parser = OfdParser::new();
        let data = create_test_ofd();
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.version.as_deref(), Some("1.0"));
        assert_eq!(doc.page_count, 2);
        assert_eq!(doc.pages.len(), 2);
    }

    #[test]
    fn test_parse_ofd_metadata() {
        let parser = OfdParser::new();
        let data = create_test_ofd();
        let doc = parser.parse(&data).unwrap();

        assert!(doc.doc_body.is_some());
        let body = doc.doc_body.unwrap();
        assert_eq!(body.doc_id.as_deref(), Some("test-ofd-001"));
        assert_eq!(body.title.as_deref(), Some("Test OFD Document"));
        assert_eq!(body.author.as_deref(), Some("World Office"));
        assert_eq!(body.creation_date.as_deref(), Some("2026-01-01"));
    }

    #[test]
    fn test_parse_ofd_pages() {
        let parser = OfdParser::new();
        let data = create_test_ofd();
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.pages[0].index, 0);
        assert_eq!(doc.pages[1].index, 1);
        // A4 dimensions
        assert!((doc.pages[0].width - 210.0).abs() < 0.1);
        assert!((doc.pages[0].height - 297.0).abs() < 0.1);
    }

    #[test]
    fn test_parse_to_document() {
        let parser = OfdParser::new();
        let data = create_test_ofd();
        let doc = parser.parse_to_document(&data).unwrap();

        assert_eq!(doc.format, "ofd");
        assert_eq!(doc.metadata.title.as_deref(), Some("Test OFD Document"));
        assert_eq!(doc.metadata.author.as_deref(), Some("World Office"));
        assert_eq!(doc.metadata.page_count, Some(2));
    }

    #[test]
    fn test_is_ofd_file() {
        let data = create_test_ofd();
        assert!(is_ofd_file(&data));
        assert!(!is_ofd_file(b"<html>not ofd</html>"));
        assert!(!is_ofd_file(b"plain text"));
        assert!(!is_ofd_file(b""));
    }

    #[test]
    fn test_rejects_non_zip() {
        let parser = OfdParser::new();
        let result = parser.parse(b"not a zip file");
        assert!(result.is_err());
    }

    #[test]
    fn test_rejects_missing_ofd_xml() {
        let mut writer = ArchiveWriter::new().unwrap();
        writer.add_file("random.txt", b"some content").unwrap();
        let data = writer.finish().unwrap();

        let parser = OfdParser::new();
        let result = parser.parse(&data);
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("OFD.xml not found"));
    }
}
