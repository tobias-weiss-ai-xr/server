use roxmltree::Document as XmlDoc;

use wo_common::{CoreError, Document, DocumentMetadata, Result};
use wo_office_utils::ArchiveReader;

use crate::model::*;

fn node_text(node: &roxmltree::Node) -> String {
    let mut result = String::new();
    for descendant in node.descendants() {
        if descendant.is_text() {
            if let Some(text) = descendant.text() {
                result.push_str(text);
            }
        }
    }
    result.trim().to_string()
}

fn child<'a, 'input>(
    node: &roxmltree::Node<'a, 'input>,
    tag: &str,
) -> Option<roxmltree::Node<'a, 'input>> {
    node.children().find(|c| c.has_tag_name(tag))
}

fn children_with_tag<'a, 'input>(
    node: &roxmltree::Node<'a, 'input>,
    tag: &str,
) -> Vec<roxmltree::Node<'a, 'input>> {
    node.children().filter(|c| c.has_tag_name(tag)).collect()
}

fn attr(node: &roxmltree::Node, name: &str) -> Option<String> {
    node.attribute(name).map(|s| s.to_string())
}

fn resolve_path(base_path: &str, relative: &str) -> String {
    let base_dir = if let Some(pos) = base_path.rfind('/') {
        &base_path[..pos + 1]
    } else {
        ""
    };
    let joined = format!("{base_dir}{relative}");
    let mut parts: Vec<&str> = Vec::new();
    for segment in joined.split('/') {
        match segment {
            "" | "." => {}
            ".." => {
                parts.pop();
            }
            _ => parts.push(segment),
        }
    }
    parts.join("/")
}

pub struct EpubParser;

impl EpubParser {
    pub fn new() -> Self {
        Self
    }

    pub fn parse(&self, data: &[u8]) -> Result<EpubDocument> {
        let archive = ArchiveReader::from_bytes(data)?;

        let container_data = archive
            .get("META-INF/container.xml")
            .or_else(|| archive.get_case_insensitive("META-INF/container.xml"))
            .ok_or_else(|| CoreError::Parse {
                format: "epub".into(),
                message: "META-INF/container.xml not found".into(),
            })?;
        let opf_path = self.parse_container(&container_data.data)?;

        let opf_data = archive
            .get(&opf_path)
            .or_else(|| archive.get_case_insensitive(&opf_path))
            .ok_or_else(|| CoreError::Parse {
                format: "epub".into(),
                message: format!("OPF file not found: {}", opf_path),
            })?;
        let (metadata, manifest, spine, version, toc_href) =
            self.parse_opf(&opf_data.data, &opf_path)?;

        let toc = if let Some(ref toc_href) = toc_href {
            let resolved = resolve_path(&opf_path, toc_href);
            self.parse_toc(&archive, &resolved)?
        } else {
            Vec::new()
        };

        let chapters = self.read_chapters(&archive, &manifest, &spine, &opf_path)?;

        let (cover_image, cover_image_type) = self.find_cover_image(&archive, &manifest, &opf_path);

        Ok(EpubDocument {
            version,
            metadata,
            manifest,
            spine,
            toc,
            chapters,
            cover_image,
            cover_image_type,
        })
    }

    fn parse_container(&self, data: &[u8]) -> Result<String> {
        let text = std::str::from_utf8(data).map_err(|e| CoreError::Parse {
            format: "epub".into(),
            message: format!("Invalid UTF-8 in container.xml: {}", e),
        })?;
        let xml = XmlDoc::parse(text).map_err(|e| CoreError::Parse {
            format: "epub".into(),
            message: format!("XML parse error in container.xml: {}", e),
        })?;

        let root = xml.root_element();
        for rfile in root.descendants().filter(|n| n.has_tag_name("rootfile")) {
            if let Some(path) = attr(&rfile, "full-path") {
                return Ok(path);
            }
        }

        Err(CoreError::Parse {
            format: "epub".into(),
            message: "No rootfile element found in container.xml".into(),
        })
    }

    fn parse_opf(
        &self,
        data: &[u8],
        _opf_path: &str,
    ) -> Result<(
        EpubMetadata,
        Vec<EpubManifestItem>,
        Vec<String>,
        String,
        Option<String>,
    )> {
        let text = std::str::from_utf8(data).map_err(|e| CoreError::Parse {
            format: "epub".into(),
            message: format!("Invalid UTF-8 in OPF: {}", e),
        })?;
        let xml = XmlDoc::parse(text).map_err(|e| CoreError::Parse {
            format: "epub".into(),
            message: format!("XML parse error in OPF: {}", e),
        })?;

        let root = xml.root_element();
        let version = attr(&root, "version").unwrap_or_else(|| "2.0".into());

        let unique_identifier = attr(&root, "unique-identifier");

        let mut metadata = EpubMetadata::default();
        metadata.unique_identifier = unique_identifier.clone();

        if let Some(meta_node) = child(&root, "metadata") {
            self.parse_metadata_node(&meta_node, &mut metadata, &unique_identifier);
        }

        let mut manifest = Vec::new();
        if let Some(man_node) = child(&root, "manifest") {
            for item in children_with_tag(&man_node, "item") {
                manifest.push(EpubManifestItem {
                    id: attr(&item, "id").unwrap_or_default(),
                    href: attr(&item, "href").unwrap_or_default(),
                    media_type: attr(&item, "media-type").unwrap_or_default(),
                    properties: attr(&item, "properties")
                        .map(|p| p.split_whitespace().map(String::from).collect())
                        .unwrap_or_default(),
                });
            }
        }

        let mut spine = Vec::new();
        if let Some(spine_node) = child(&root, "spine") {
            for itemref in children_with_tag(&spine_node, "itemref") {
                if let Some(idref) = attr(&itemref, "idref") {
                    spine.push(idref);
                }
            }
        }

        let toc_href = self.find_toc_href(&root, &manifest);

        Ok((metadata, manifest, spine, version, toc_href))
    }

    fn parse_metadata_node(
        &self,
        node: &roxmltree::Node,
        metadata: &mut EpubMetadata,
        unique_identifier: &Option<String>,
    ) {
        for child_node in node.children() {
            let tag = child_node.tag_name().name();
            let ns = child_node.tag_name().namespace();

            match tag {
                "title" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        metadata.title = Some(node_text(&child_node));
                    }
                }
                "creator" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        let text = node_text(&child_node);
                        if !text.is_empty() {
                            metadata.creator.push(text);
                        }
                    }
                }
                "language" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        metadata.language = Some(node_text(&child_node));
                    }
                }
                "identifier" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        let id = attr(&child_node, "id");
                        if id.is_some() && id.as_deref() == unique_identifier.as_deref() {
                            metadata.identifier = Some(node_text(&child_node));
                        } else if metadata.identifier.is_none() {
                            metadata.identifier = Some(node_text(&child_node));
                        }
                    }
                }
                "publisher" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        metadata.publisher = Some(node_text(&child_node));
                    }
                }
                "date" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        metadata.date = Some(node_text(&child_node));
                    }
                }
                "description" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        metadata.description = Some(node_text(&child_node));
                    }
                }
                "subject" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        let text = node_text(&child_node);
                        if !text.is_empty() {
                            metadata.subject.push(text);
                        }
                    }
                }
                "rights" => {
                    if ns.is_none() || ns == Some("http://purl.org/dc/elements/1.1/") {
                        metadata.rights = Some(node_text(&child_node));
                    }
                }
                "meta" => {
                    if ns == Some("http://www.idpf.org/2007/opf") {
                        let name = attr(&child_node, "name").unwrap_or_default();
                        let content = attr(&child_node, "content").unwrap_or_default();
                        if name == "cover" && !content.is_empty() {
                            if metadata.title.is_none() {
                                metadata.title = Some(content.clone());
                            }
                        }
                    }
                }
                _ => {}
            }
        }
    }

    fn find_toc_href(
        &self,
        root: &roxmltree::Node,
        manifest: &[EpubManifestItem],
    ) -> Option<String> {
        if let Some(spine_node) = child(root, "spine") {
            if let Some(toc_attr) = attr(&spine_node, "toc") {
                if let Some(item) = manifest.iter().find(|i| i.id == toc_attr) {
                    return Some(item.href.clone());
                }
            }
        }

        if let Some(item) = manifest.iter().find(|i| {
            i.properties.iter().any(|p| p == "nav")
                && (i.media_type == "application/xhtml+xml" || i.media_type == "text/html")
        }) {
            return Some(item.href.clone());
        }

        None
    }

    fn parse_toc(&self, archive: &ArchiveReader, toc_path: &str) -> Result<Vec<TocEntry>> {
        let entry = archive
            .get(toc_path)
            .or_else(|| archive.get_case_insensitive(toc_path))
            .ok_or_else(|| CoreError::Parse {
                format: "epub".into(),
                message: format!("TOC file not found: {}", toc_path),
            })?;

        let text = std::str::from_utf8(&entry.data).map_err(|e| CoreError::Parse {
            format: "epub".into(),
            message: format!("Invalid UTF-8 in TOC: {}", e),
        })?;

        let is_ncx = toc_path.ends_with(".ncx");

        if is_ncx {
            self.parse_ncx_toc(text)
        } else {
            self.parse_nav_toc(text)
        }
    }

    fn parse_ncx_toc(&self, text: &str) -> Result<Vec<TocEntry>> {
        let xml = XmlDoc::parse(text).map_err(|e| CoreError::Parse {
            format: "epub".into(),
            message: format!("XML parse error in NCX: {}", e),
        })?;

        let root = xml.root_element();
        let mut entries = Vec::new();

        if let Some(nav_map) = root.descendants().find(|n| n.has_tag_name("navMap")) {
            for point in children_with_tag(&nav_map, "navPoint") {
                if let Some(entry) = self.parse_ncx_point(&point, 1) {
                    entries.push(entry);
                }
            }
        }

        Ok(entries)
    }

    fn parse_ncx_point(&self, node: &roxmltree::Node, level: u32) -> Option<TocEntry> {
        let nav_label = child(node, "navLabel")?;
        let text_node = child(&nav_label, "text")?;
        let title = node_text(&text_node);
        if title.is_empty() {
            return None;
        }

        let content = child(node, "content")?;
        let href = attr(&content, "src").map(|h| h.split('#').next().unwrap_or(&h).to_string());

        let play_order = attr(&node, "playOrder").and_then(|po| po.parse().ok());

        let children: Vec<TocEntry> = children_with_tag(node, "navPoint")
            .into_iter()
            .filter_map(|np| self.parse_ncx_point(&np, level + 1))
            .collect();

        Some(TocEntry {
            title,
            href,
            level,
            children,
            play_order,
        })
    }

    fn parse_nav_toc(&self, text: &str) -> Result<Vec<TocEntry>> {
        let xml = XmlDoc::parse(text).map_err(|e| CoreError::Parse {
            format: "epub".into(),
            message: format!("XML parse error in NAV: {}", e),
        })?;

        let root = xml.root_element();
        let mut entries = Vec::new();

        let nav = root.descendants().find(|n| {
            n.has_tag_name("nav")
                && n.attribute(("http://www.idpf.org/2007/ops", "type"))
                    .map(|t| t == "toc")
                    .unwrap_or(false)
        });

        if let Some(nav) = nav {
            if let Some(ol) = nav.descendants().find(|n| n.has_tag_name("ol")) {
                self.parse_nav_ol(&ol, &mut entries, 1);
            }
        }

        Ok(entries)
    }

    fn parse_nav_ol(&self, ol: &roxmltree::Node, entries: &mut Vec<TocEntry>, level: u32) {
        for li in children_with_tag(ol, "li") {
            if let Some(a) = li.children().find(|n| n.has_tag_name("a")) {
                let title = node_text(&a);
                if title.is_empty() {
                    continue;
                }
                let href = attr(&a, "href").map(|h| h.split('#').next().unwrap_or(&h).to_string());

                let mut children = Vec::new();
                if let Some(sub_ol) = li.children().find(|n| n.has_tag_name("ol")) {
                    self.parse_nav_ol(&sub_ol, &mut children, level + 1);
                }

                entries.push(TocEntry {
                    title,
                    href,
                    level,
                    children,
                    play_order: None,
                });
            }
        }
    }

    fn read_chapters(
        &self,
        archive: &ArchiveReader,
        manifest: &[EpubManifestItem],
        spine: &[String],
        opf_path: &str,
    ) -> Result<Vec<Chapter>> {
        let mut chapters = Vec::new();

        for idref in spine {
            let item = match manifest.iter().find(|i| i.id == *idref) {
                Some(i) => i,
                None => continue,
            };

            let href = &item.href;
            let resolved = resolve_path(opf_path, href);

            let entry = match archive
                .get(&resolved)
                .or_else(|| archive.get_case_insensitive(&resolved))
            {
                Some(e) => e,
                None => continue,
            };

            let content = String::from_utf8(entry.data.clone()).unwrap_or_default();

            let title = Self::extract_chapter_title(&content)
                .unwrap_or_else(|| href.rsplit('/').next().unwrap_or(href).to_string());

            chapters.push(Chapter {
                title,
                content,
                href: href.clone(),
            });
        }

        Ok(chapters)
    }

    fn extract_chapter_title(xhtml: &str) -> Option<String> {
        let xml = XmlDoc::parse(xhtml).ok()?;
        let root = xml.root_element();

        let title_node = root
            .descendants()
            .find(|n| n.has_tag_name("title"))
            .or_else(|| {
                for tag in &["h1", "h2", "h3"] {
                    if let Some(h) = root.descendants().find(|n| n.has_tag_name(*tag)) {
                        return Some(h);
                    }
                }
                None
            })?;

        let text = node_text(&title_node);
        if text.is_empty() {
            None
        } else {
            Some(text)
        }
    }

    fn find_cover_image(
        &self,
        archive: &ArchiveReader,
        manifest: &[EpubManifestItem],
        opf_path: &str,
    ) -> (Option<Vec<u8>>, Option<String>) {
        let cover_item = manifest
            .iter()
            .find(|i| {
                i.properties.iter().any(|p| p == "cover-image")
                    || (i.id == "cover" && i.media_type.starts_with("image/"))
                    || i.id == "cover-image"
            })
            .or_else(|| {
                manifest
                    .iter()
                    .find(|i| i.id == "cover" && i.media_type.starts_with("image/"))
            });

        if let Some(item) = cover_item {
            let resolved = resolve_path(opf_path, &item.href);
            if let Some(entry) = archive
                .get(&resolved)
                .or_else(|| archive.get_case_insensitive(&resolved))
            {
                return (Some(entry.data.clone()), Some(item.media_type.clone()));
            }
        }

        (None, None)
    }

    pub fn parse_to_document(&self, data: &[u8]) -> Result<Document> {
        let epub = self.parse(data)?;

        let title = epub.metadata.title.unwrap_or_default();
        let author = epub.metadata.creator.first().cloned().unwrap_or_default();
        let word_count: u32 = epub
            .chapters
            .iter()
            .map(|c| c.content.split_whitespace().count() as u32)
            .sum();

        Ok(Document {
            content: data.to_vec(),
            format: "epub".into(),
            metadata: DocumentMetadata {
                title: Some(title),
                author: Some(author),
                word_count: Some(word_count),
                ..Default::default()
            },
        })
    }
}

impl Default for EpubParser {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::is_epub_file;
    use wo_office_utils::ArchiveWriter;
    use zip::CompressionMethod;

    const CONTAINER_XML: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>"#;

    const MINIMAL_OPF: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:test-123</dc:identifier>
    <dc:title>Test Book</dc:title>
    <dc:creator>Test Author</dc:creator>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  </manifest>
  <spine>
    <itemref idref="chapter1"/>
  </spine>
</package>"#;

    const CHAPTER1_XHTML: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Chapter 1</title></head>
<body>
  <h1>Hello World</h1>
  <p>This is the content of chapter one.</p>
</body>
</html>"#;

    const NAV_XHTML: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>TOC</title></head>
<body>
  <nav epub:type="toc">
    <ol>
      <li><a href="chapter1.xhtml">Chapter 1</a></li>
    </ol>
  </nav>
</body>
</html>"#;

    fn create_test_epub() -> Vec<u8> {
        let mut writer = ArchiveWriter::new().unwrap();
        writer
            .add_file_with_compression(
                "mimetype",
                b"application/epub+zip",
                CompressionMethod::Stored,
            )
            .unwrap();
        writer
            .add_file("META-INF/container.xml", CONTAINER_XML.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/content.opf", MINIMAL_OPF.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/chapter1.xhtml", CHAPTER1_XHTML.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/nav.xhtml", NAV_XHTML.as_bytes())
            .unwrap();
        writer.finish().unwrap()
    }

    #[test]
    fn test_parse_minimal_epub() {
        let data = create_test_epub();
        let parser = EpubParser::new();
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.version, "3.0");
        assert_eq!(doc.metadata.title.as_deref(), Some("Test Book"));
        assert_eq!(doc.chapters.len(), 1);
        assert_eq!(doc.chapters[0].href, "chapter1.xhtml");
    }

    #[test]
    fn test_parse_epub_metadata() {
        let opf = r#"<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:meta-test</dc:identifier>
    <dc:title>Advanced Metadata</dc:title>
    <dc:creator>Author One</dc:creator>
    <dc:creator>Author Two</dc:creator>
    <dc:language>fr</dc:language>
    <dc:publisher>Test Publisher</dc:publisher>
    <dc:date>2025-06-15</dc:date>
    <dc:description>A test description</dc:description>
    <dc:subject>Fiction</dc:subject>
    <dc:subject>Adventure</dc:subject>
    <dc:rights>Public Domain</dc:rights>
  </metadata>
  <manifest>
    <item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="c1"/>
  </spine>
</package>"#;

        let mut writer = ArchiveWriter::new().unwrap();
        writer
            .add_file_with_compression(
                "mimetype",
                b"application/epub+zip",
                CompressionMethod::Stored,
            )
            .unwrap();
        writer
            .add_file("META-INF/container.xml", CONTAINER_XML.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/content.opf", opf.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/c1.xhtml", CHAPTER1_XHTML.as_bytes())
            .unwrap();
        let data = writer.finish().unwrap();

        let parser = EpubParser::new();
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.metadata.title.as_deref(), Some("Advanced Metadata"));
        assert_eq!(doc.metadata.creator, vec!["Author One", "Author Two"]);
        assert_eq!(doc.metadata.language.as_deref(), Some("fr"));
        assert_eq!(
            doc.metadata.identifier.as_deref(),
            Some("urn:uuid:meta-test")
        );
        assert_eq!(doc.metadata.publisher.as_deref(), Some("Test Publisher"));
        assert_eq!(doc.metadata.date.as_deref(), Some("2025-06-15"));
        assert_eq!(
            doc.metadata.description.as_deref(),
            Some("A test description")
        );
        assert_eq!(doc.metadata.subject, vec!["Fiction", "Adventure"]);
        assert_eq!(doc.metadata.rights.as_deref(), Some("Public Domain"));
    }

    #[test]
    fn test_parse_epub_manifest_and_spine() {
        let opf = r#"<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">test</dc:identifier>
    <dc:title>Multi Chapter</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="style" href="style.css" media-type="text/css"/>
    <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="c2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
    <item id="c3" href="chapter3.xhtml" media-type="application/xhtml+xml"/>
    <item id="image1" href="images/cover.jpg" media-type="image/jpeg"/>
  </manifest>
  <spine>
    <itemref idref="c2"/>
    <itemref idref="c1"/>
    <itemref idref="c3"/>
  </spine>
</package>"#;

        let ch1 = r#"<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch1</title></head><body><p>One</p></body></html>"#;
        let ch2 = r#"<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch2</title></head><body><p>Two</p></body></html>"#;
        let ch3 = r#"<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch3</title></head><body><p>Three</p></body></html>"#;

        let mut writer = ArchiveWriter::new().unwrap();
        writer
            .add_file_with_compression(
                "mimetype",
                b"application/epub+zip",
                CompressionMethod::Stored,
            )
            .unwrap();
        writer
            .add_file("META-INF/container.xml", CONTAINER_XML.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/content.opf", opf.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/chapter1.xhtml", ch1.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/chapter2.xhtml", ch2.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/chapter3.xhtml", ch3.as_bytes())
            .unwrap();
        let data = writer.finish().unwrap();

        let parser = EpubParser::new();
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.manifest.len(), 5);
        assert_eq!(doc.spine, vec!["c2", "c1", "c3"]);
        assert_eq!(doc.chapters.len(), 3);
        assert_eq!(doc.chapters[0].href, "chapter2.xhtml");
        assert_eq!(doc.chapters[1].href, "chapter1.xhtml");
        assert_eq!(doc.chapters[2].href, "chapter3.xhtml");
    }

    #[test]
    fn test_parse_epub_cover_image() {
        let opf = r#"<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">cover-test</dc:identifier>
    <dc:title>Cover Test</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>
    <item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="c1"/>
  </spine>
</package>"#;

        let fake_jpeg = b"\xff\xd8\xff\xe0JFIF";

        let mut writer = ArchiveWriter::new().unwrap();
        writer
            .add_file_with_compression(
                "mimetype",
                b"application/epub+zip",
                CompressionMethod::Stored,
            )
            .unwrap();
        writer
            .add_file("META-INF/container.xml", CONTAINER_XML.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/content.opf", opf.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/c1.xhtml", CHAPTER1_XHTML.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/images/cover.jpg", fake_jpeg.as_slice())
            .unwrap();
        let data = writer.finish().unwrap();

        let parser = EpubParser::new();
        let doc = parser.parse(&data).unwrap();

        assert!(doc.cover_image.is_some());
        assert_eq!(doc.cover_image.unwrap(), fake_jpeg.as_slice());
        assert_eq!(doc.cover_image_type.as_deref(), Some("image/jpeg"));
    }

    #[test]
    fn test_parse_epub_toc_ncx() {
        let ncx = r#"<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="ncx-test"/>
  </head>
  <docTitle><text>NCX Test Book</text></docTitle>
  <navMap>
    <navPoint id="nav1" playOrder="1">
      <navLabel><text>Part 1</text></navLabel>
      <content src="chapter1.xhtml"/>
      <navPoint id="nav1-1" playOrder="2">
        <navLabel><text>Chapter 1</text></navLabel>
        <content src="chapter1.xhtml"/>
      </navPoint>
      <navPoint id="nav1-2" playOrder="3">
        <navLabel><text>Chapter 2</text></navLabel>
        <content src="chapter2.xhtml"/>
      </navPoint>
    </navPoint>
    <navPoint id="nav2" playOrder="4">
      <navLabel><text>Part 2</text></navLabel>
      <content src="chapter3.xhtml"/>
    </navPoint>
  </navMap>
</ncx>"#;

        let opf = r#"<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">ncx-test</dc:identifier>
    <dc:title>NCX TOC Test</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="c2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
    <item id="c3" href="chapter3.xhtml" media-type="application/xhtml+xml"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="c1"/>
    <itemref idref="c2"/>
    <itemref idref="c3"/>
  </spine>
</package>"#;

        let ch = r#"<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch</title></head><body><p>Content</p></body></html>"#;

        let mut writer = ArchiveWriter::new().unwrap();
        writer
            .add_file_with_compression(
                "mimetype",
                b"application/epub+zip",
                CompressionMethod::Stored,
            )
            .unwrap();
        writer
            .add_file("META-INF/container.xml", CONTAINER_XML.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/content.opf", opf.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/chapter1.xhtml", ch.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/chapter2.xhtml", ch.as_bytes())
            .unwrap();
        writer
            .add_file("OEBPS/chapter3.xhtml", ch.as_bytes())
            .unwrap();
        writer.add_file("OEBPS/toc.ncx", ncx.as_bytes()).unwrap();
        let data = writer.finish().unwrap();

        let parser = EpubParser::new();
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.version, "2.0");
        assert_eq!(doc.toc.len(), 2);
        assert_eq!(doc.toc[0].title, "Part 1");
        assert_eq!(doc.toc[0].level, 1);
        assert_eq!(doc.toc[0].play_order, Some(1));
        assert_eq!(doc.toc[0].children.len(), 2);
        assert_eq!(doc.toc[0].children[0].title, "Chapter 1");
        assert_eq!(doc.toc[0].children[0].level, 2);
        assert_eq!(doc.toc[0].children[0].play_order, Some(2));
        assert_eq!(doc.toc[1].title, "Part 2");
        assert_eq!(doc.toc[1].href.as_deref(), Some("chapter3.xhtml"));
    }

    #[test]
    fn test_is_epub_file() {
        let epub_data = create_test_epub();
        assert!(is_epub_file(&epub_data));

        assert!(!is_epub_file(b""));
        assert!(!is_epub_file(b"not a zip file at all"));
        assert!(!is_epub_file(&[0x50, 0x4B, 0x03, 0x04]));
    }

    #[test]
    fn test_parse_to_document() {
        let data = create_test_epub();
        let parser = EpubParser::new();
        let doc = parser.parse_to_document(&data).unwrap();

        assert_eq!(doc.format, "epub");
        assert_eq!(doc.metadata.title.as_deref(), Some("Test Book"));
        assert_eq!(doc.metadata.author.as_deref(), Some("Test Author"));
        assert!(doc.metadata.word_count.is_some());
        assert!(doc.metadata.word_count.unwrap() > 0);
        assert!(!doc.content.is_empty());
    }

    #[test]
    fn test_rejects_non_zip() {
        let parser = EpubParser::new();
        let result = parser.parse(b"this is not a zip file");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_epub_with_nav_toc() {
        let data = create_test_epub();
        let parser = EpubParser::new();
        let doc = parser.parse(&data).unwrap();

        assert_eq!(doc.toc.len(), 1);
        assert_eq!(doc.toc[0].title, "Chapter 1");
        assert_eq!(doc.toc[0].href.as_deref(), Some("chapter1.xhtml"));
    }

    #[test]
    fn test_parse_epub_missing_container() {
        let mut writer = ArchiveWriter::new().unwrap();
        writer
            .add_file_with_compression(
                "mimetype",
                b"application/epub+zip",
                CompressionMethod::Stored,
            )
            .unwrap();
        let data = writer.finish().unwrap();

        let parser = EpubParser::new();
        let result = parser.parse(&data);
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("container.xml not found"));
    }
}
