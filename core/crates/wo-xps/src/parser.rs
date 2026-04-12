use crate::model::*;
use wo_common::{CoreError, Document, DocumentMetadata, Result};
use wo_office_utils::{ArchiveEntry, ArchiveReader};
use roxmltree::Document as XmlDoc;

pub struct XpsParser;

impl XpsParser {
    pub fn new() -> Self {
        Self
    }

    pub fn parse(&self, data: &[u8]) -> Result<XpsDocument> {
        let archive = ArchiveReader::from_bytes(data)?;

        let rels = self.parse_rels(&archive)?;

        let page_entries = archive.find_by_prefix("Documents/1/Pages/");
        let mut pages = Vec::new();
        let mut page_index = 0u32;

        for entry in &page_entries {
            if entry.name.ends_with(".fpage") {
                match self.parse_page(entry, page_index) {
                    Ok(page) => {
                        page_index += 1;
                        pages.push(page);
                    }
                    Err(_) => continue,
                }
            }
        }

        let fonts = self.collect_resources(&archive, "Documents/1/Resources/Fonts/");
        let images = self.collect_resources(&archive, "Documents/1/Resources/Images/");

        let metadata = self.parse_metadata(&archive);

        Ok(XpsDocument {
            page_count: pages.len() as u32,
            pages,
            fonts,
            images,
            relationships: rels,
            metadata,
        })
    }

    fn parse_rels(&self, archive: &ArchiveReader) -> Result<Vec<XpsRelationship>> {
        let mut rels = Vec::new();

        if let Some(entry) = archive.get("_rels/.rels") {
            let text = String::from_utf8_lossy(&entry.data);
            if let Ok(doc) = XmlDoc::parse(&text) {
                for node in doc.descendants() {
                    if node.tag_name().name() == "Relationship" {
                        let target = node.attribute("Target").unwrap_or_default().to_owned();
                        let rel_type = node.attribute("Type").unwrap_or_default().to_owned();
                        rels.push(XpsRelationship { target, rel_type });
                    }
                }
            }
        }

        Ok(rels)
    }

    fn parse_page(&self, entry: &ArchiveEntry, index: u32) -> Result<XpsPage> {
        let text = String::from_utf8_lossy(&entry.data);
        let doc = XmlDoc::parse(&text).map_err(|e| CoreError::Parse {
            format: "XPS".into(),
            message: format!("Failed to parse page XML '{}': {}", entry.name, e),
        })?;

        let root = doc.root_element();
        let width = parse_attr_f64(&root, "Width").unwrap_or(816.0);
        let height = parse_attr_f64(&root, "Height").unwrap_or(1056.0);

        let mut glyphs = Vec::new();
        let mut paths = Vec::new();

        for node in doc.descendants() {
            let tag = node.tag_name().name();
            if tag == "Glyphs" {
                let text = node
                    .attribute("UnicodeString")
                    .unwrap_or_default()
                    .to_owned();
                let font_uri = node.attribute("FontUri").unwrap_or_default().to_owned();
                let font_size = parse_attr_f64(&node, "FontRenderingEmSize").unwrap_or(12.0);
                let origin_x = parse_attr_f64(&node, "OriginX").unwrap_or(0.0);
                let origin_y = parse_attr_f64(&node, "OriginY").unwrap_or(0.0);
                let fill = node.attribute("Fill").map(|s| s.to_owned());
                let is_unicode = node.attribute("UnicodeString").is_some();
                glyphs.push(XpsGlyphs {
                    text,
                    font_uri,
                    font_size,
                    origin_x,
                    origin_y,
                    fill,
                    is_unicode,
                });
            } else if tag == "Path" {
                let data = node.attribute("Data").map(|s| s.to_owned());
                let fill = node.attribute("Fill").map(|s| s.to_owned());
                let stroke = node.attribute("Stroke").map(|s| s.to_owned());
                let transform = node.attribute("RenderTransform").map(|s| s.to_owned());
                paths.push(XpsPath {
                    data,
                    fill,
                    stroke,
                    transform,
                });
            }
        }

        Ok(XpsPage {
            index,
            width,
            height,
            content: XpsPageContent { glyphs, paths },
        })
    }

    fn collect_resources(&self, archive: &ArchiveReader, prefix: &str) -> Vec<XpsResource> {
        archive
            .find_by_prefix(prefix)
            .iter()
            .map(|entry| {
                let content_type = guess_content_type(&entry.name);
                XpsResource {
                    uri: entry.name.clone(),
                    content_type,
                    data: entry.data.clone(),
                }
            })
            .collect()
    }

    fn parse_metadata(&self, archive: &ArchiveReader) -> XpsMetadata {
        let mut metadata = XpsMetadata::default();

        if let Some(entry) = archive
            .get("Documents/1/Metadata/Core.xml")
            .or_else(|| archive.get_case_insensitive("Documents/1/Metadata/Core.xml"))
        {
            let text = String::from_utf8_lossy(&entry.data);
            if let Ok(doc) = XmlDoc::parse(&text) {
                for node in doc.descendants() {
                    let tag = node.tag_name().name();
                    if let Some(text_node) = node.first_child() {
                        if !text_node.is_text() {
                            continue;
                        }
                        let value = text_node.text().unwrap_or_default().trim().to_owned();
                        if value.is_empty() {
                            continue;
                        }
                        match tag {
                            "title" => metadata.title = Some(value),
                            "creator" => metadata.author = Some(value),
                            "subject" => metadata.subject = Some(value),
                            "keywords" => metadata.keywords = Some(value),
                            "created" => metadata.created = Some(value),
                            "modified" => metadata.modified = Some(value),
                            _ => {}
                        }
                    }
                }
            }
        }

        metadata
    }

    pub fn parse_to_document(&self, data: &[u8]) -> Result<Document> {
        let xps = self.parse(data)?;
        Ok(Document {
            content: data.to_vec(),
            format: crate::FORMAT_NAME.to_owned(),
            metadata: DocumentMetadata {
                title: xps.metadata.title,
                author: xps.metadata.author,
                page_count: if xps.page_count > 0 {
                    Some(xps.page_count)
                } else {
                    None
                },
                word_count: None,
                encoding: None,
                line_count: None,
            },
        })
    }
}

impl Default for XpsParser {
    fn default() -> Self {
        Self::new()
    }
}

fn parse_attr_f64(node: &roxmltree::Node, attr: &str) -> Option<f64> {
    node.attribute(attr).and_then(|v| v.parse::<f64>().ok())
}

fn guess_content_type(name: &str) -> Option<String> {
    let lower = name.to_lowercase();
    if lower.ends_with(".odttf") {
        Some("application/x-font-odttf".to_owned())
    } else if lower.ends_with(".ttf") {
        Some("font/ttf".to_owned())
    } else if lower.ends_with(".otf") {
        Some("font/otf".to_owned())
    } else if lower.ends_with(".png") {
        Some("image/png".to_owned())
    } else if lower.ends_with(".jpg") || lower.ends_with(".jpeg") {
        Some("image/jpeg".to_owned())
    } else if lower.ends_with(".tif") || lower.ends_with(".tiff") {
        Some("image/tiff".to_owned())
    } else if lower.ends_with(".wdp") {
        Some("image/vnd.ms-photo".to_owned())
    } else if lower.ends_with(".gif") {
        Some("image/gif".to_owned())
    } else if lower.ends_with(".bmp") {
        Some("image/bmp".to_owned())
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::is_xps_file;
    use wo_office_utils::ArchiveWriter;

    fn make_xps_zip(entries: &[(&str, &[u8])]) -> Vec<u8> {
        let mut writer = ArchiveWriter::new().unwrap();
        for &(name, data) in entries {
            writer.add_file(name, data).unwrap();
        }
        writer.finish().unwrap()
    }

    const MINIMAL_REL: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/Documents/1/FixedDocSeq.fdseq" Type="http://schemas.microsoft.com/xps/2005/06/fixed-document-sequence"/>
</Relationships>"#;

    const CONTENT_TYPES: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".fpage" ContentType="application/vnd.ms-package.xps-fixedpage+xml"/>
  <Default Extension=".rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
</Types>"#;

    const EMPTY_FPAGE: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<FixedPage Width="816" Height="1056" xmlns="http://schemas.microsoft.com/xps/2005/06" xml:lang="en-US">
</FixedPage>"#;

    const FPAGE_WITH_GLYPHS: &[u8] = br##"<?xml version="1.0" encoding="UTF-8"?>
<FixedPage Width="612" Height="792" xmlns="http://schemas.microsoft.com/xps/2005/06" xml:lang="en-US">
  <Glyphs UnicodeString="Hello World" FontUri="/Documents/1/Resources/Fonts/Arial.ttf"
           FontRenderingEmSize="24" OriginX="72" OriginY="120" Fill="#FF000000"/>
  <Glyphs UnicodeString="Second line" FontUri="/Documents/1/Resources/Fonts/Arial.ttf"
           FontRenderingEmSize="18" OriginX="72" OriginY="160" Fill="#FF000000"/>
</FixedPage>"##;

    const FPAGE_WITH_PATHS: &[u8] = br##"<?xml version="1.0" encoding="UTF-8"?>
<FixedPage Width="612" Height="792" xmlns="http://schemas.microsoft.com/xps/2005/06" xml:lang="en-US">
  <Path Data="M 20,20 L 200,20 L 200,100 L 20,100 Z" Fill="#FF0000FF" Stroke="#FF000000"/>
  <Path Data="M 50,50 L 150,150" Stroke="#FF000000" RenderTransform="1,0,0,1,10,10"/>
</FixedPage>"##;

    const CORE_METADATA: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<coreProperties xmlns="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:title>Test Document</dc:title>
  <dc:creator>Test Author</dc:creator>
  <dc:subject>XPS Parsing Test</dc:subject>
  <dcterms:created>2025-01-01T00:00:00Z</dcterms:created>
</coreProperties>"#;

    #[test]
    fn test_parse_minimal_xps() {
        let zip = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Pages/1.fpage", EMPTY_FPAGE),
        ]);

        let parser = XpsParser::new();
        let doc = parser.parse(&zip).unwrap();

        assert_eq!(doc.page_count, 1);
        assert_eq!(doc.pages[0].width, 816.0);
        assert_eq!(doc.pages[0].height, 1056.0);
        assert!(doc.pages[0].content.glyphs.is_empty());
        assert!(doc.pages[0].content.paths.is_empty());
    }

    #[test]
    fn test_parse_empty_xps() {
        let zip = make_xps_zip(&[("_rels/.rels", MINIMAL_REL)]);

        let parser = XpsParser::new();
        let doc = parser.parse(&zip).unwrap();

        assert_eq!(doc.page_count, 0);
        assert!(doc.pages.is_empty());
    }

    #[test]
    fn test_parse_xps_with_glyphs() {
        let zip = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Pages/1.fpage", FPAGE_WITH_GLYPHS),
        ]);

        let parser = XpsParser::new();
        let doc = parser.parse(&zip).unwrap();

        assert_eq!(doc.page_count, 1);
        let page = &doc.pages[0];
        assert_eq!(page.content.glyphs.len(), 2);

        let g = &page.content.glyphs[0];
        assert_eq!(g.text, "Hello World");
        assert_eq!(g.font_size, 24.0);
        assert_eq!(g.origin_x, 72.0);
        assert_eq!(g.origin_y, 120.0);
        assert_eq!(g.fill.as_deref(), Some("#FF000000"));
        assert!(g.is_unicode);

        let g2 = &page.content.glyphs[1];
        assert_eq!(g2.text, "Second line");
        assert_eq!(g2.font_size, 18.0);
    }

    #[test]
    fn test_parse_xps_with_paths() {
        let zip = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Pages/1.fpage", FPAGE_WITH_PATHS),
        ]);

        let parser = XpsParser::new();
        let doc = parser.parse(&zip).unwrap();

        let page = &doc.pages[0];
        assert_eq!(page.content.paths.len(), 2);

        let p = &page.content.paths[0];
        assert!(p.data.is_some());
        assert_eq!(p.fill.as_deref(), Some("#FF0000FF"));
        assert_eq!(p.stroke.as_deref(), Some("#FF000000"));

        let p2 = &page.content.paths[1];
        assert!(p2.transform.is_some());
        assert!(p2.stroke.is_some());
    }

    #[test]
    fn test_parse_xps_resources() {
        let font_data = b"\x00\x01\x00\x00FONTDATA";
        let image_data = b"\x89PNG\r\n\x1a\nfake-png-data";

        let zip = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Pages/1.fpage", EMPTY_FPAGE),
            (
                "Documents/1/Resources/Fonts/Arial.odttf",
                font_data.as_slice(),
            ),
            (
                "Documents/1/Resources/Images/photo.png",
                image_data.as_slice(),
            ),
            ("Documents/1/Resources/Images/bg.jpg", b"fake-jpeg"),
        ]);

        let parser = XpsParser::new();
        let doc = parser.parse(&zip).unwrap();

        assert_eq!(doc.fonts.len(), 1);
        assert_eq!(doc.fonts[0].uri, "Documents/1/Resources/Fonts/Arial.odttf");
        assert_eq!(
            doc.fonts[0].content_type.as_deref(),
            Some("application/x-font-odttf")
        );
        assert_eq!(doc.fonts[0].data, font_data.as_slice());

        assert_eq!(doc.images.len(), 2);
        assert_eq!(doc.images[0].content_type.as_deref(), Some("image/png"));
        assert_eq!(doc.images[1].content_type.as_deref(), Some("image/jpeg"));
    }

    #[test]
    fn test_parse_relationships() {
        let zip = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
        ]);

        let parser = XpsParser::new();
        let doc = parser.parse(&zip).unwrap();

        assert_eq!(doc.relationships.len(), 1);
        assert!(doc.relationships[0].target.contains("FixedDocSeq.fdseq"));
        assert!(doc.relationships[0]
            .rel_type
            .contains("fixed-document-sequence"));
    }

    #[test]
    fn test_parse_metadata() {
        let zip = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Metadata/Core.xml", CORE_METADATA),
        ]);

        let parser = XpsParser::new();
        let doc = parser.parse(&zip).unwrap();

        assert_eq!(doc.metadata.title.as_deref(), Some("Test Document"));
        assert_eq!(doc.metadata.author.as_deref(), Some("Test Author"));
        assert_eq!(doc.metadata.subject.as_deref(), Some("XPS Parsing Test"));
        assert_eq!(
            doc.metadata.created.as_deref(),
            Some("2025-01-01T00:00:00Z")
        );
        assert!(doc.metadata.modified.is_none());
    }

    #[test]
    fn test_parse_to_document() {
        let zip = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("[Content_Types].xml", CONTENT_TYPES),
            ("Documents/1/Pages/1.fpage", EMPTY_FPAGE),
            ("Documents/1/Metadata/Core.xml", CORE_METADATA),
        ]);

        let parser = XpsParser::new();
        let doc = parser.parse_to_document(&zip).unwrap();

        assert_eq!(doc.format, "xps");
        assert_eq!(doc.metadata.page_count, Some(1));
        assert_eq!(doc.metadata.title.as_deref(), Some("Test Document"));
        assert_eq!(doc.metadata.author.as_deref(), Some("Test Author"));
    }

    #[test]
    fn test_is_xps_file() {
        let zip_with_rels = make_xps_zip(&[("_rels/.rels", MINIMAL_REL)]);
        assert!(is_xps_file(&zip_with_rels));

        let zip_with_content_types = make_xps_zip(&[("[Content_Types].xml", CONTENT_TYPES)]);
        assert!(is_xps_file(&zip_with_content_types));

        let zip_with_fpage = make_xps_zip(&[("Documents/1/Pages/1.fpage", EMPTY_FPAGE)]);
        assert!(is_xps_file(&zip_with_fpage));
    }

    #[test]
    fn test_rejects_non_zip() {
        assert!(!is_xps_file(b"this is not a zip file"));
        assert!(!is_xps_file(b""));
        assert!(!is_xps_file(&[0x50, 0x4B])); // PK but too short
    }

    #[test]
    fn test_page_default_dimensions() {
        let fpage_no_dims = br#"<?xml version="1.0" encoding="UTF-8"?>
<FixedPage xmlns="http://schemas.microsoft.com/xps/2005/06" xml:lang="en-US">
</FixedPage>"#;
        let zip = make_xps_zip(&[
            ("_rels/.rels", MINIMAL_REL),
            ("Documents/1/Pages/1.fpage", fpage_no_dims),
        ]);

        let parser = XpsParser::new();
        let doc = parser.parse(&zip).unwrap();

        assert_eq!(doc.pages[0].width, 816.0);
        assert_eq!(doc.pages[0].height, 1056.0);
    }
}
