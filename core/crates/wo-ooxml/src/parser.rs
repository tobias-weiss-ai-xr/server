//! OOXML format parser.
//!
//! Parses OOXML ZIP archives (DOCX, XLSX, PPTX) by reading:
//! - `[Content_Types].xml` — content type registry
//! - `_rels/.rels` — relationships
//! - `docProps/core.xml` — metadata
//! - Main document part

use std::io::{Cursor, Read};

use roxmltree::Document as XmlDoc;
use wo_common::{CoreError, Document, DocumentMetadata, Result};

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

        // Parse DOCX body if available
        let body = match format {
            OoxmlFormat::Docx => self.parse_docx_body(&mut archive)?,
            _ => None,
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
            body,
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

    // --- DOCX body parsing ---

    const W_NS: &str = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

    /// Parse DOCX body from word/document.xml.
    pub fn parse_docx_body(
        &self,
        archive: &mut zip::ZipArchive<Cursor<&[u8]>>,
    ) -> Result<Option<DocxBody>> {
        if archive.by_name("word/document.xml").is_err() {
            return Ok(None);
        }
        let xml = self.read_zip_entry(archive, "word/document.xml")?;
        let doc = XmlDoc::parse(&xml).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Invalid document.xml: {}", e),
        })?;

        // Find w:body
        let body_node = doc
            .descendants()
            .find(|n| n.has_tag_name("body") && n.tag_name().namespace() == Some(Self::W_NS));

        let body = match body_node {
            Some(node) => self.parse_body_node(&node),
            None => DocxBody {
                paragraphs: Vec::new(),
                tables: Vec::new(),
            },
        };

        Ok(Some(body))
    }

    fn parse_body_node(&self, body: &roxmltree::Node) -> DocxBody {
        let mut paragraphs = Vec::new();
        let mut tables = Vec::new();

        for child in body.children() {
            if !child.is_element() {
                continue;
            }
            let local_name = child.tag_name().name();
            let ns = child.tag_name().namespace();

            match (ns, local_name) {
                (Some(Self::W_NS), "p") => {
                    paragraphs.push(self.parse_paragraph(&child));
                }
                (Some(Self::W_NS), "tbl") => {
                    if let Some(table) = self.parse_table(&child) {
                        tables.push(table);
                    }
                }
                (Some(Self::W_NS), "sdt") => {
                    // Structured document tag — try to parse its content
                    for inner in child.descendants() {
                        if inner.has_tag_name("p")
                            && inner.tag_name().namespace() == Some(Self::W_NS)
                        {
                            paragraphs.push(self.parse_paragraph(&inner));
                        }
                    }
                }
                _ => {}
            }
        }

        DocxBody { paragraphs, tables }
    }

    fn parse_paragraph(&self, p_node: &roxmltree::Node) -> DocxParagraph {
        let mut style_id = None;
        let mut properties = DocxParagraphProperties::default();
        let mut runs = Vec::new();

        for child in p_node.children() {
            if !child.is_element() {
                continue;
            }
            let local = child.tag_name().name();
            let ns = child.tag_name().namespace();

            match (ns, local) {
                (Some(Self::W_NS), "pPr") => {
                    // pStyle is a child element with val attribute, not an attribute on pPr
                    if let Some(pstyle) = child
                        .children()
                        .find(|n| n.is_element() && n.tag_name().name() == "pStyle")
                    {
                        style_id = pstyle.attribute("val").map(|s| s.to_string());
                    }
                    properties = self.parse_paragraph_properties(&child);
                }
                (Some(Self::W_NS), "r") => {
                    runs.push(self.parse_run(&child));
                }
                (Some(Self::W_NS), "hyperlink") => {
                    // Hyperlinks contain runs
                    for r in child.children() {
                        if r.is_element()
                            && r.tag_name().name() == "r"
                            && r.tag_name().namespace() == Some(Self::W_NS)
                        {
                            runs.push(self.parse_run(&r));
                        }
                    }
                }
                (Some(Self::W_NS), "sdt") => {
                    for r in child.descendants() {
                        if r.has_tag_name("r") && r.tag_name().namespace() == Some(Self::W_NS) {
                            runs.push(self.parse_run(&r));
                        }
                    }
                }
                _ => {}
            }
        }

        DocxParagraph {
            style_id,
            properties,
            runs,
        }
    }

    fn parse_paragraph_properties(&self, ppr: &roxmltree::Node) -> DocxParagraphProperties {
        let mut props = DocxParagraphProperties::default();

        // Look for jc (justification)
        for child in ppr.children() {
            if !child.is_element() {
                continue;
            }
            match child.tag_name().name() {
                "jc" => {
                    props.alignment = match child.attribute("val") {
                        Some("center") => Some(TextAlignment::Center),
                        Some("right") => Some(TextAlignment::Right),
                        Some("both") => Some(TextAlignment::Both),
                        _ => Some(TextAlignment::Left),
                    };
                }
                "ind" => {
                    props.indent_left = child.attribute("left").and_then(|v| v.parse().ok());
                    props.indent_right = child.attribute("right").and_then(|v| v.parse().ok());
                    props.indent_first_line =
                        child.attribute("firstLine").and_then(|v| v.parse().ok());
                    props.indent_hanging = child.attribute("hanging").and_then(|v| v.parse().ok());
                }
                "spacing" => {
                    props.spacing_before = child.attribute("before").and_then(|v| v.parse().ok());
                    props.spacing_after = child.attribute("after").and_then(|v| v.parse().ok());
                    props.spacing_line = child.attribute("line").and_then(|v| v.parse().ok());
                    props.spacing_line_rule = match child.attribute("lineRule") {
                        Some("exact") => Some(LineSpacingRule::Exact),
                        Some("atLeast") => Some(LineSpacingRule::AtLeast),
                        _ => Some(LineSpacingRule::Auto),
                    };
                }
                "keepLines" => {
                    props.keep_lines = child.attribute("val") != Some("false");
                }
                "keepNext" => {
                    props.keep_next = child.attribute("val") != Some("false");
                }
                "pageBreakBefore" => {
                    props.page_break_before = child.attribute("val") != Some("false");
                }
                "outlineLvl" => {
                    props.outline_level = child.attribute("val").and_then(|v| v.parse().ok());
                }
                _ => {}
            }
        }

        props
    }

    fn parse_run(&self, r_node: &roxmltree::Node) -> DocxRun {
        let mut run = DocxRun {
            text: String::new(),
            bold: false,
            italic: false,
            underline: None,
            strikethrough: false,
            double_strikethrough: false,
            font: None,
            font_size: None,
            font_size_cs: None,
            color: None,
            highlight: None,
            vertical_alignment: None,
            small_caps: false,
            all_caps: false,
        };

        for child in r_node.children() {
            if !child.is_element() {
                continue;
            }
            let local = child.tag_name().name();
            let ns = child.tag_name().namespace();

            match (ns, local) {
                (Some(Self::W_NS), "t") => {
                    // Preserve whitespace: check xml:space="preserve"
                    if let Some(text) = child.text() {
                        run.text.push_str(text);
                    }
                }
                (Some(Self::W_NS), "rPr") => {
                    self.apply_run_properties(&child, &mut run);
                }
                (Some(Self::W_NS), "br") => {
                    let br_type = child.attribute("type").unwrap_or("line");
                    if br_type == "page" {
                        run.text.push('\x0C'); // form feed for page break
                    } else {
                        run.text.push('\n');
                    }
                }
                (Some(Self::W_NS), "tab") => {
                    run.text.push('\t');
                }
                (Some(Self::W_NS), "cr") => {
                    run.text.push('\r');
                }
                _ => {}
            }
        }

        run
    }

    fn apply_run_properties(&self, rpr: &roxmltree::Node, run: &mut DocxRun) {
        for child in rpr.children() {
            if !child.is_element() {
                continue;
            }
            match child.tag_name().name() {
                "b" => {
                    run.bold = child.attribute("val") != Some("false");
                    if child.attribute("val").is_none() && !child.children().count() > 0 {
                        run.bold = true;
                    }
                }
                "i" => {
                    run.italic = child.attribute("val") != Some("false");
                    if child.attribute("val").is_none() && !child.children().count() > 0 {
                        run.italic = true;
                    }
                }
                "u" => {
                    run.underline = match child.attribute("val") {
                        Some("double") => Some(UnderlineType::Double),
                        Some("thick") => Some(UnderlineType::Thick),
                        Some("dotted") => Some(UnderlineType::Dotted),
                        Some("dashed") => Some(UnderlineType::Dashed),
                        Some("dashDot") => Some(UnderlineType::DashDot),
                        Some("wave") => Some(UnderlineType::Wave),
                        Some("none") => Some(UnderlineType::None),
                        Some("false") => None,
                        _ => Some(UnderlineType::Single),
                    };
                }
                "strike" => {
                    run.strikethrough = child.attribute("val") != Some("false");
                }
                "dstrike" => {
                    run.double_strikethrough = child.attribute("val") != Some("false");
                }
                "rFonts" => {
                    // Try ascii, hAnsi, then eastAsia, then cs
                    run.font = child
                        .attribute("ascii")
                        .or_else(|| child.attribute("hAnsi"))
                        .or_else(|| child.attribute("eastAsia"))
                        .map(|s| s.to_string());
                }
                "sz" => {
                    run.font_size = child.attribute("val").and_then(|v| v.parse().ok());
                }
                "szCs" => {
                    run.font_size_cs = child.attribute("val").and_then(|v| v.parse().ok());
                }
                "color" => {
                    run.color = child.attribute("val").map(|s| s.to_string());
                }
                "highlight" => {
                    run.highlight = child.attribute("val").map(|s| s.to_string());
                }
                "vertAlign" => {
                    run.vertical_alignment = match child.attribute("val") {
                        Some("superscript") => Some(VerticalAlignment::Superscript),
                        Some("subscript") => Some(VerticalAlignment::Subscript),
                        _ => None,
                    };
                }
                "smallCaps" => {
                    run.small_caps = child.attribute("val") != Some("false");
                }
                "caps" => {
                    run.all_caps = child.attribute("val") != Some("false");
                }
                _ => {}
            }
        }
    }

    fn parse_table(&self, tbl_node: &roxmltree::Node) -> Option<DocxTable> {
        let mut rows = Vec::new();
        let mut properties = DocxTableProperties::default();

        for child in tbl_node.children() {
            if !child.is_element() {
                continue;
            }
            let local = child.tag_name().name();

            match local {
                "tblPr" => {
                    properties = self.parse_table_properties(&child);
                }
                "tr" => {
                    rows.push(self.parse_table_row(&child));
                }
                _ => {}
            }
        }

        Some(DocxTable { rows, properties })
    }

    fn parse_table_properties(&self, tbl_pr: &roxmltree::Node) -> DocxTableProperties {
        let mut props = DocxTableProperties::default();

        for child in tbl_pr.children() {
            if !child.is_element() {
                continue;
            }
            match child.tag_name().name() {
                "tblW" => {
                    props.width = child.attribute("w").and_then(|v| v.parse().ok());
                }
                "tblInd" => {
                    props.indent = child.attribute("w").and_then(|v| v.parse().ok());
                }
                "jc" => {
                    props.alignment = match child.attribute("val") {
                        Some("center") => Some(TextAlignment::Center),
                        Some("right") => Some(TextAlignment::Right),
                        _ => Some(TextAlignment::Left),
                    };
                }
                _ => {}
            }
        }

        props
    }

    fn parse_table_row(&self, tr_node: &roxmltree::Node) -> DocxTableRow {
        let mut cells = Vec::new();
        let mut height = None;
        let mut is_header = false;

        for child in tr_node.children() {
            if !child.is_element() {
                continue;
            }
            match child.tag_name().name() {
                "trPr" => {
                    height = child.attribute("trHeight").and_then(|v| v.parse().ok());
                    // Check for tblHeader
                    for inner in child.children() {
                        if inner.has_tag_name("tblHeader") {
                            is_header = true;
                        }
                    }
                }
                "tc" => {
                    cells.push(self.parse_table_cell(&child));
                }
                _ => {}
            }
        }

        DocxTableRow {
            cells,
            height,
            is_header,
        }
    }

    fn parse_table_cell(&self, tc_node: &roxmltree::Node) -> DocxTableCell {
        let mut paragraphs = Vec::new();
        let mut column_span = 1u32;
        let mut row_span = 1u32;
        let mut width = None;
        let mut shading = None;

        for child in tc_node.children() {
            if !child.is_element() {
                continue;
            }
            match child.tag_name().name() {
                "tcPr" => {
                    column_span = child
                        .attribute("gridSpan")
                        .and_then(|v| v.parse().ok())
                        .unwrap_or(1);
                    row_span = child
                        .attribute("vMerge")
                        .and_then(|v| v.parse().ok())
                        .unwrap_or(1);
                    width = child.attribute("tcW").and_then(|v| v.parse().ok());
                    for inner in child.children() {
                        if inner.has_tag_name("shd") {
                            shading = inner.attribute("fill").map(|s| s.to_string());
                        }
                    }
                }
                "p" => {
                    paragraphs.push(self.parse_paragraph(&child));
                }
                _ => {}
            }
        }

        DocxTableCell {
            paragraphs,
            column_span,
            row_span,
            width,
            shading,
        }
    }

    /// Parse styles from word/styles.xml.
    pub fn parse_styles(
        &self,
        archive: &mut zip::ZipArchive<Cursor<&[u8]>>,
    ) -> Result<Option<DocxStyles>> {
        if archive.by_name("word/styles.xml").is_err() {
            return Ok(None);
        }
        let xml = self.read_zip_entry(archive, "word/styles.xml")?;
        let doc = XmlDoc::parse(&xml).map_err(|e| CoreError::Parse {
            format: "ooxml".into(),
            message: format!("Invalid styles.xml: {}", e),
        })?;

        let mut paragraph_styles = Vec::new();
        let mut character_styles = Vec::new();
        let mut table_styles = Vec::new();

        for node in doc.descendants() {
            if !node.is_element() {
                continue;
            }
            let style_type = node.attribute("type").unwrap_or("");
            let style_id = node.attribute("styleId").unwrap_or("");

            if style_id.is_empty() {
                continue;
            }

            let name = node.attribute("name").map(|s| s.to_string());
            let based_on = node.attribute("basedOn").map(|s| s.to_string());

            match style_type {
                "paragraph" => {
                    let (properties, run_properties) = self.parse_style_properties(&node);
                    paragraph_styles.push(DocxParagraphStyle {
                        style_id: style_id.to_string(),
                        name,
                        based_on,
                        properties,
                        run_properties,
                    });
                }
                "character" => {
                    let run_properties = self.parse_style_run_properties(&node);
                    character_styles.push(DocxCharacterStyle {
                        style_id: style_id.to_string(),
                        name,
                        based_on,
                        properties: run_properties,
                    });
                }
                "table" => {
                    table_styles.push(DocxTableStyle {
                        style_id: style_id.to_string(),
                        name,
                    });
                }
                _ => {}
            }
        }

        Ok(Some(DocxStyles {
            paragraph_styles,
            character_styles,
            table_styles,
        }))
    }

    fn parse_style_properties(
        &self,
        style_node: &roxmltree::Node,
    ) -> (DocxParagraphProperties, DocxRunProperties) {
        let mut p_props = DocxParagraphProperties::default();
        let mut r_props = DocxRunProperties::default();

        for child in style_node.children() {
            if !child.is_element() {
                continue;
            }
            match child.tag_name().name() {
                "pPr" => {
                    p_props = self.parse_paragraph_properties(&child);
                }
                "rPr" => {
                    r_props = self.parse_style_run_properties_node(&child);
                }
                _ => {}
            }
        }

        (p_props, r_props)
    }

    fn parse_style_run_properties(&self, style_node: &roxmltree::Node) -> DocxRunProperties {
        let mut r_props = DocxRunProperties::default();

        for child in style_node.children() {
            if child.is_element() && child.has_tag_name("rPr") {
                r_props = self.parse_style_run_properties_node(&child);
                break;
            }
        }

        r_props
    }

    fn parse_style_run_properties_node(&self, rpr: &roxmltree::Node) -> DocxRunProperties {
        let mut props = DocxRunProperties::default();

        for child in rpr.children() {
            if !child.is_element() {
                continue;
            }
            match child.tag_name().name() {
                "b" => {
                    props.bold = Some(child.attribute("val") != Some("false"));
                }
                "i" => {
                    props.italic = Some(child.attribute("val") != Some("false"));
                }
                "rFonts" => {
                    props.font = child
                        .attribute("ascii")
                        .or_else(|| child.attribute("hAnsi"))
                        .map(|s| s.to_string());
                }
                "sz" => {
                    props.font_size = child.attribute("val").and_then(|v| v.parse().ok());
                }
                "color" => {
                    props.color = child.attribute("val").map(|s| s.to_string());
                }
                _ => {}
            }
        }

        props
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

    fn make_docx_with_body(document_xml: &str) -> Vec<u8> {
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

            zip.start_file(
                "word/document.xml",
                zip::write::SimpleFileOptions::default(),
            )
            .unwrap();
            zip.write_all(document_xml.as_bytes()).unwrap();

            zip.finish().unwrap();
        }
        buf
    }

    #[test]
    fn test_parse_body_paragraphs() {
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>First paragraph</w:t></w:r></w:p>
    <w:p><w:r><w:t>Second paragraph</w:t></w:r></w:p>
  </w:body>
</w:document>"#,
        );
        let parser = OoxmlParser::new();
        let doc = parser.parse(&docx).unwrap();
        let body = doc.body.unwrap();
        assert_eq!(body.paragraphs.len(), 2);
        assert_eq!(body.paragraphs[0].runs[0].text, "First paragraph");
        assert_eq!(body.paragraphs[1].runs[0].text, "Second paragraph");
    }

    #[test]
    fn test_parse_run_formatting() {
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:i/><w:sz val="28"/><w:rFonts ascii="Arial"/></w:rPr>
        <w:t>Bold Italic</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:u val="dotted"/><w:color val="FF0000"/></w:rPr>
        <w:t>Red Underline</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>"#,
        );
        let parser = OoxmlParser::new();
        let doc = parser.parse(&docx).unwrap();
        let body = doc.body.unwrap();
        assert_eq!(body.paragraphs.len(), 1);

        let r1 = &body.paragraphs[0].runs[0];
        assert!(r1.bold);
        assert!(r1.italic);
        assert_eq!(r1.font_size, Some(28));
        assert_eq!(r1.font.as_deref(), Some("Arial"));

        let r2 = &body.paragraphs[0].runs[1];
        assert_eq!(r2.underline, Some(UnderlineType::Dotted));
        assert_eq!(r2.color.as_deref(), Some("FF0000"));
    }

    #[test]
    fn test_parse_paragraph_properties() {
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc val="center"/><w:spacing after="200" before="100"/></w:pPr>
      <w:r><w:t>Centered text</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc val="right"/><w:ind left="720" firstLine="360"/></w:pPr>
      <w:r><w:t>Indented right</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"#,
        );
        let parser = OoxmlParser::new();
        let doc = parser.parse(&docx).unwrap();
        let body = doc.body.unwrap();

        assert_eq!(
            body.paragraphs[0].properties.alignment,
            Some(TextAlignment::Center)
        );
        assert_eq!(body.paragraphs[0].properties.spacing_after, Some(200));
        assert_eq!(body.paragraphs[0].properties.spacing_before, Some(100));

        assert_eq!(
            body.paragraphs[1].properties.alignment,
            Some(TextAlignment::Right)
        );
        assert_eq!(body.paragraphs[1].properties.indent_left, Some(720));
        assert_eq!(body.paragraphs[1].properties.indent_first_line, Some(360));
    }

    #[test]
    fn test_parse_table() {
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:tbl>
      <w:tblPr><w:tblW w="5000"/></w:tblPr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Cell 1</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Cell 2</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Cell 3</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Cell 4</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>"#,
        );
        let parser = OoxmlParser::new();
        let doc = parser.parse(&docx).unwrap();
        let body = doc.body.unwrap();

        assert_eq!(body.tables.len(), 1);
        assert_eq!(body.tables[0].rows.len(), 2);
        assert_eq!(body.tables[0].rows[0].cells.len(), 2);
        assert_eq!(
            body.tables[0].rows[0].cells[0].paragraphs[0].runs[0].text,
            "Cell 1"
        );
        assert_eq!(
            body.tables[0].rows[1].cells[1].paragraphs[0].runs[0].text,
            "Cell 4"
        );
        assert_eq!(body.tables[0].properties.width, Some(5000));
    }

    #[test]
    fn test_parse_empty_paragraphs() {
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p/>
    <w:p><w:r><w:t>Not empty</w:t></w:r></w:p>
    <w:p/>
  </w:body>
</w:document>"#,
        );
        let parser = OoxmlParser::new();
        let doc = parser.parse(&docx).unwrap();
        let body = doc.body.unwrap();
        assert_eq!(body.paragraphs.len(), 3);
        assert!(body.paragraphs[0].runs.is_empty());
        assert_eq!(body.paragraphs[1].runs[0].text, "Not empty");
        assert!(body.paragraphs[2].runs.is_empty());
    }

    #[test]
    fn test_parse_superscript_subscript() {
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>E=mc</w:t></w:r>
      <w:r><w:rPr><w:vertAlign val="superscript"/></w:rPr><w:t>2</w:t></w:r>
      <w:r><w:t>H</w:t></w:r>
      <w:r><w:rPr><w:vertAlign val="subscript"/></w:rPr><w:t>2</w:t></w:r>
      <w:r><w:t>O</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"#,
        );
        let parser = OoxmlParser::new();
        let doc = parser.parse(&docx).unwrap();
        let body = doc.body.unwrap();
        let runs = &body.paragraphs[0].runs;
        assert_eq!(runs.len(), 5);
        assert_eq!(
            runs[1].vertical_alignment,
            Some(VerticalAlignment::Superscript)
        );
        assert_eq!(
            runs[3].vertical_alignment,
            Some(VerticalAlignment::Subscript)
        );
    }

    #[test]
    fn test_parse_style_id() {
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle val="Heading1"/></w:pPr>
      <w:r><w:t>Heading text</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"#,
        );
        let parser = OoxmlParser::new();
        let doc = parser.parse(&docx).unwrap();
        let body = doc.body.unwrap();
        assert_eq!(body.paragraphs[0].style_id.as_deref(), Some("Heading1"));
    }
}
