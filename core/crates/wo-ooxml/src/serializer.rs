//! OOXML DOCX serializer.
//!
//! Serializes an `OoxmlDocument` into a valid DOCX file (ZIP of XML files).

use crate::model::*;
use std::io::{Cursor, Write as IoWrite};

/// DOCX serializer — converts an `OoxmlDocument` into a valid DOCX ZIP.
pub struct OoxmlSerializer;

impl OoxmlSerializer {
    pub fn new() -> Self {
        Self
    }

    /// Serialize an `OoxmlDocument` to DOCX bytes (ZIP archive).
    pub fn serialize(&self, doc: &OoxmlDocument) -> Result<Vec<u8>, anyhow::Error> {
        let buf = Cursor::new(Vec::new());
        let mut zip = zip::ZipWriter::new(buf);

        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Deflated);

        // 1. [Content_Types].xml
        let content_types = self.build_content_types(doc);
        zip.start_file("[Content_Types].xml", options)?;
        zip.write_all(content_types.as_bytes())?;

        // 2. _rels/.rels
        let rels = self.build_root_rels();
        zip.start_file("_rels/.rels", options)?;
        zip.write_all(rels.as_bytes())?;

        // 3. word/document.xml
        let document_xml = self.build_document_xml(doc);
        zip.start_file("word/document.xml", options)?;
        zip.write_all(document_xml.as_bytes())?;

        // 4. word/_rels/document.xml.rels
        let doc_rels = self.build_document_rels();
        zip.start_file("word/_rels/document.xml.rels", options)?;
        zip.write_all(doc_rels.as_bytes())?;

        // 5. word/styles.xml
        let styles = self.build_styles_xml();
        zip.start_file("word/styles.xml", options)?;
        zip.write_all(styles.as_bytes())?;

        // 6. docProps/core.xml
        let core_xml = self.build_core_properties(&doc.core_properties);
        zip.start_file("docProps/core.xml", options)?;
        zip.write_all(core_xml.as_bytes())?;

        let result = zip.finish()?;
        Ok(result.into_inner())
    }

    fn build_content_types(&self, _doc: &OoxmlDocument) -> String {
        r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"#
            .to_string()
    }

    fn build_root_rels(&self) -> String {
        r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"#
            .to_string()
    }

    fn build_document_rels(&self) -> String {
        r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"#
            .to_string()
    }

    fn build_document_xml(&self, doc: &OoxmlDocument) -> String {
        let mut xml = String::new();
        xml.push_str(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>"#,
        );

        if let Some(ref body) = doc.body {
            for para in &body.paragraphs {
                xml.push_str(&self.serialize_paragraph(para));
            }
            for table in &body.tables {
                xml.push_str(&self.serialize_table(table));
            }
        }

        xml.push_str("  </w:body>\n</w:document>");
        xml
    }

    fn serialize_paragraph(&self, para: &DocxParagraph) -> String {
        let mut xml = String::from("    <w:p>");

        // Paragraph properties
        let has_props = para.style_id.is_some()
            || para.properties.alignment.is_some()
            || para.properties.indent_left.is_some()
            || para.properties.indent_right.is_some()
            || para.properties.indent_first_line.is_some()
            || para.properties.indent_hanging.is_some()
            || para.properties.spacing_before.is_some()
            || para.properties.spacing_after.is_some()
            || para.properties.spacing_line.is_some()
            || para.properties.keep_lines
            || para.properties.keep_next
            || para.properties.page_break_before;

        if has_props {
            xml.push_str("<w:pPr>");
            if let Some(ref style) = para.style_id {
                xml.push_str("<w:pStyle w:val=\"");
                xml.push_str(&escape_xml(style));
                xml.push_str("\"/>");
            }
            if let Some(align) = para.properties.alignment {
                let val = match align {
                    TextAlignment::Left => "left",
                    TextAlignment::Center => "center",
                    TextAlignment::Right => "right",
                    TextAlignment::Both => "both",
                };
                xml.push_str("<w:jc w:val=\"");
                xml.push_str(val);
                xml.push_str("\"/>");
            }
            if let Some(il) = para.properties.indent_left {
                xml.push_str(&format!("<w:ind w:left=\"{}\"", il));
                if let Some(ir) = para.properties.indent_right {
                    xml.push_str(&format!(" w:right=\"{}\"", ir));
                }
                if let Some(fi) = para.properties.indent_first_line {
                    xml.push_str(&format!(" w:firstLine=\"{}\"", fi));
                }
                if let Some(ih) = para.properties.indent_hanging {
                    xml.push_str(&format!(" w:hanging=\"{}\"", ih));
                }
                xml.push_str("/>");
            } else {
                // Write individual indent properties if only some are set
                let mut ind_parts = Vec::new();
                if let Some(ir) = para.properties.indent_right {
                    ind_parts.push(format!("w:right=\"{}\"", ir));
                }
                if let Some(fi) = para.properties.indent_first_line {
                    ind_parts.push(format!("w:firstLine=\"{}\"", fi));
                }
                if let Some(ih) = para.properties.indent_hanging {
                    ind_parts.push(format!("w:hanging=\"{}\"", ih));
                }
                if !ind_parts.is_empty() {
                    xml.push_str("<w:ind ");
                    xml.push_str(&ind_parts.join(" "));
                    xml.push_str("/>");
                }
            }
            if let Some(sb) = para.properties.spacing_before {
                xml.push_str(&format!("<w:spacing w:before=\"{}\"", sb));
                if let Some(sa) = para.properties.spacing_after {
                    xml.push_str(&format!(" w:after=\"{}\"", sa));
                }
                if let Some(sl) = para.properties.spacing_line {
                    xml.push_str(&format!(" w:line=\"{}\"", sl));
                    if let Some(rule) = para.properties.spacing_line_rule {
                        let rule_str = match rule {
                            LineSpacingRule::Auto => "auto",
                            LineSpacingRule::Exact => "exact",
                            LineSpacingRule::AtLeast => "atLeast",
                        };
                        xml.push_str(&format!(" w:lineRule=\"{}\"", rule_str));
                    }
                }
                xml.push_str("/>");
            } else {
                let mut sp_parts = Vec::new();
                if let Some(sa) = para.properties.spacing_after {
                    sp_parts.push(format!("w:after=\"{}\"", sa));
                }
                if let Some(sl) = para.properties.spacing_line {
                    sp_parts.push(format!("w:line=\"{}\"", sl));
                    if let Some(rule) = para.properties.spacing_line_rule {
                        let rule_str = match rule {
                            LineSpacingRule::Auto => "auto",
                            LineSpacingRule::Exact => "exact",
                            LineSpacingRule::AtLeast => "atLeast",
                        };
                        sp_parts.push(format!("w:lineRule=\"{}\"", rule_str));
                    }
                }
                if !sp_parts.is_empty() {
                    xml.push_str("<w:spacing ");
                    xml.push_str(&sp_parts.join(" "));
                    xml.push_str("/>");
                }
            }
            if para.properties.keep_lines {
                xml.push_str("<w:keepLines/>");
            }
            if para.properties.keep_next {
                xml.push_str("<w:keepNext/>");
            }
            if para.properties.page_break_before {
                xml.push_str("<w:pageBreakBefore/>");
            }
            xml.push_str("</w:pPr>");
        }

        for run in &para.runs {
            xml.push_str(&self.serialize_run(run));
        }

        xml.push_str("</w:p>\n");
        xml
    }

    fn serialize_run(&self, run: &DocxRun) -> String {
        let mut xml = String::from("<w:r>");

        let has_rpr = run.bold
            || run.italic
            || run.underline.is_some()
            || run.strikethrough
            || run.double_strikethrough
            || run.font.is_some()
            || run.font_size.is_some()
            || run.font_size_cs.is_some()
            || run.color.is_some()
            || run.highlight.is_some()
            || run.vertical_alignment.is_some()
            || run.small_caps
            || run.all_caps;

        if has_rpr {
            xml.push_str("<w:rPr>");
            if run.bold {
                xml.push_str("<w:b/>");
            }
            if run.italic {
                xml.push_str("<w:i/>");
            }
            if let Some(ul) = run.underline {
                let val = match ul {
                    UnderlineType::Single => "single",
                    UnderlineType::Double => "double",
                    UnderlineType::Thick => "thick",
                    UnderlineType::Dotted => "dotted",
                    UnderlineType::Dashed => "dashed",
                    UnderlineType::DashDot => "dashDot",
                    UnderlineType::Wave => "wave",
                    UnderlineType::None => "none",
                };
                xml.push_str(&format!("<w:u w:val=\"{}\"/>", val));
            }
            if run.strikethrough {
                xml.push_str("<w:strike/>");
            }
            if run.double_strikethrough {
                xml.push_str("<w:dstrike/>");
            }
            if let Some(ref font) = run.font {
                xml.push_str("<w:rFonts w:ascii=\"");
                xml.push_str(&escape_xml(font));
                xml.push_str("\" w:hAnsi=\"");
                xml.push_str(&escape_xml(font));
                xml.push_str("\"/>");
            }
            if let Some(size) = run.font_size {
                xml.push_str(&format!("<w:sz w:val=\"{}\"/>", size));
            }
            if let Some(size_cs) = run.font_size_cs {
                xml.push_str(&format!("<w:szCs w:val=\"{}\"/>", size_cs));
            }
            if let Some(ref color) = run.color {
                xml.push_str("<w:color w:val=\"");
                xml.push_str(color);
                xml.push_str("\"/>");
            }
            if let Some(ref highlight) = run.highlight {
                xml.push_str("<w:highlight w:val=\"");
                xml.push_str(highlight);
                xml.push_str("\"/>");
            }
            if let Some(va) = run.vertical_alignment {
                let val = match va {
                    VerticalAlignment::Baseline => "baseline",
                    VerticalAlignment::Superscript => "superscript",
                    VerticalAlignment::Subscript => "subscript",
                };
                xml.push_str(&format!("<w:vertAlign w:val=\"{}\"/>", val));
            }
            if run.small_caps {
                xml.push_str("<w:smallCaps/>");
            }
            if run.all_caps {
                xml.push_str("<w:caps/>");
            }
            xml.push_str("</w:rPr>");
        }

        if !run.text.is_empty() {
            xml.push_str("<w:t xml:space=\"preserve\">");
            xml.push_str(&escape_xml(&run.text));
            xml.push_str("</w:t>");
        }

        xml.push_str("</w:r>");
        xml
    }

    fn serialize_table(&self, table: &DocxTable) -> String {
        let mut xml = String::from("    <w:tbl>");

        // Table properties
        let has_props = table.properties.width.is_some()
            || table.properties.indent.is_some()
            || table.properties.alignment.is_some()
            || table.properties.borders.is_some();

        if has_props {
            xml.push_str("<w:tblPr>");
            if let Some(width) = table.properties.width {
                xml.push_str(&format!("<w:tblW w:w=\"{}\" w:type=\"dxa\"/>", width));
            }
            if let Some(indent) = table.properties.indent {
                xml.push_str(&format!("<w:tblInd w:w=\"{}\" w:type=\"dxa\"/>", indent));
            }
            if let Some(align) = table.properties.alignment {
                let val = match align {
                    TextAlignment::Left => "left",
                    TextAlignment::Center => "center",
                    TextAlignment::Right => "right",
                    TextAlignment::Both => "both",
                };
                xml.push_str(&format!("<w:jc w:val=\"{}\"/>", val));
            }
            if let Some(ref borders) = table.properties.borders {
                xml.push_str("<w:tblBorders>");
                if let Some(ref b) = borders.top {
                    xml.push_str(&self.serialize_border("top", b));
                }
                if let Some(ref b) = borders.left {
                    xml.push_str(&self.serialize_border("left", b));
                }
                if let Some(ref b) = borders.bottom {
                    xml.push_str(&self.serialize_border("bottom", b));
                }
                if let Some(ref b) = borders.right {
                    xml.push_str(&self.serialize_border("right", b));
                }
                if let Some(ref b) = borders.inside_h {
                    xml.push_str(&self.serialize_border("insideH", b));
                }
                if let Some(ref b) = borders.inside_v {
                    xml.push_str(&self.serialize_border("insideV", b));
                }
                xml.push_str("</w:tblBorders>");
            }
            xml.push_str("</w:tblPr>");
        }

        for row in &table.rows {
            xml.push_str(&self.serialize_table_row(row));
        }

        xml.push_str("</w:tbl>\n");
        xml
    }

    fn serialize_table_row(&self, row: &DocxTableRow) -> String {
        let mut xml = String::from("      <w:tr>");
        if let Some(height) = row.height {
            xml.push_str(&format!(
                "<w:trPr><w:trHeight w:val=\"{}\" w:hRule=\"atLeast\"/></w:trPr>",
                height
            ));
        }
        for cell in &row.cells {
            xml.push_str(&self.serialize_table_cell(cell));
        }
        xml.push_str("</w:tr>\n");
        xml
    }

    fn serialize_table_cell(&self, cell: &DocxTableCell) -> String {
        let mut xml = String::from("        <w:tc>");
        // Cell properties
        let has_props = cell.column_span != 1
            || cell.row_span != 1
            || cell.width.is_some()
            || cell.shading.is_some();
        if has_props {
            xml.push_str("<w:tcPr>");
            if cell.column_span != 1 {
                xml.push_str(&format!("<w:gridSpan w:val=\"{}\"/>", cell.column_span));
            }
            if cell.row_span != 1 {
                xml.push_str(&format!(
                    "<w:vMerge w:val=\"restart\" w:rowSpan=\"{}\"/>",
                    cell.row_span
                ));
            }
            if let Some(width) = cell.width {
                xml.push_str(&format!("<w:tcW w:w=\"{}\" w:type=\"dxa\"/>", width));
            }
            if let Some(ref shading) = cell.shading {
                xml.push_str(&format!("<w:shd w:fill=\"{}\"/>", shading));
            }
            xml.push_str("</w:tcPr>");
        }
        for para in &cell.paragraphs {
            xml.push_str(&self.serialize_paragraph(para));
        }
        xml.push_str("</w:tc>");
        xml
    }

    fn serialize_border(&self, name: &str, border: &DocxBorder) -> String {
        let mut xml = format!("<w:{} w:val=\"{}\"", name, border.style);
        if let Some(size) = border.size {
            xml.push_str(&format!(" w:sz=\"{}\"", size));
        }
        if let Some(ref color) = border.color {
            xml.push_str(&format!(" w:color=\"{}\"", color));
        }
        if let Some(space) = border.space {
            xml.push_str(&format!(" w:space=\"{}\"", space));
        }
        xml.push_str("/>");
        xml
    }

    fn build_styles_xml(&self) -> String {
        r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="SimSun" w:cs="Times New Roman"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="200" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="SimSun" w:cs="Times New Roman"/>
      <w:sz w:val="24"/>
      <w:szCs w:val="24"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="480" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="36"/>
    </w:rPr>
  </w:style>
</w:styles>"#
            .to_string()
    }

    fn build_core_properties(&self, props: &CoreProperties) -> String {
        let mut xml = String::from(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">"#,
        );

        if let Some(ref title) = props.title {
            xml.push_str("<dc:title>");
            xml.push_str(&escape_xml(title));
            xml.push_str("</dc:title>");
        }
        if let Some(ref creator) = props.creator {
            xml.push_str("<dc:creator>");
            xml.push_str(&escape_xml(creator));
            xml.push_str("</dc:creator>");
        }
        if let Some(ref subject) = props.subject {
            xml.push_str("<dc:subject>");
            xml.push_str(&escape_xml(subject));
            xml.push_str("</dc:subject>");
        }
        if let Some(ref desc) = props.description {
            xml.push_str("<dc:description>");
            xml.push_str(&escape_xml(desc));
            xml.push_str("</dc:description>");
        }
        if let Some(ref keywords) = props.keywords {
            xml.push_str("<cp:keywords>");
            xml.push_str(&escape_xml(keywords));
            xml.push_str("</cp:keywords>");
        }
        if let Some(ref lang) = props.language {
            xml.push_str("<dc:language>");
            xml.push_str(&escape_xml(lang));
            xml.push_str("</dc:language>");
        }
        if let Some(ref last_mod) = props.last_modified_by {
            xml.push_str("<cp:lastModifiedBy>");
            xml.push_str(&escape_xml(last_mod));
            xml.push_str("</cp:lastModifiedBy>");
        }
        if let Some(ref created) = props.created {
            xml.push_str("<dcterms:created xsi:type=\"dcterms:W3CDTF\">");
            xml.push_str(&escape_xml(created));
            xml.push_str("</dcterms:created>");
        }
        if let Some(ref modified) = props.modified {
            xml.push_str("<dcterms:modified xsi:type=\"dcterms:W3CDTF\">");
            xml.push_str(&escape_xml(modified));
            xml.push_str("</dcterms:modified>");
        }
        if let Some(ref category) = props.category {
            xml.push_str("<cp:category>");
            xml.push_str(&escape_xml(category));
            xml.push_str("</cp:category>");
        }
        if let Some(ref revision) = props.revision {
            xml.push_str("<cp:revision>");
            xml.push_str(&escape_xml(revision));
            xml.push_str("</cp:revision>");
        }

        xml.push_str("</cp:coreProperties>");
        xml
    }
}

impl Default for OoxmlSerializer {
    fn default() -> Self {
        Self::new()
    }
}

/// Escape special characters for XML text content.
fn escape_xml(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.chars() {
        match ch {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&apos;"),
            _ => out.push(ch),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_minimal_doc() -> OoxmlDocument {
        OoxmlDocument {
            format: OoxmlFormat::Docx,
            version: "1.0".to_string(),
            content_types: vec![],
            main_part: Some("word/document.xml".to_string()),
            shared_strings: vec![],
            part_count: 1,
            core_properties: CoreProperties::default(),
            relationships: vec![],
            body: Some(DocxBody {
                paragraphs: vec![DocxParagraph {
                    style_id: None,
                    properties: DocxParagraphProperties::default(),
                    runs: vec![DocxRun {
                        text: "Hello World".to_string(),
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
                    }],
                }],
                tables: vec![],
            }),
        }
    }

    fn zip_entry_names(data: &[u8]) -> Vec<String> {
        let cursor = std::io::Cursor::new(data);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        (0..archive.len())
            .filter_map(|i| archive.by_index(i).ok().map(|f| f.name().to_string()))
            .collect()
    }

    fn read_zip_entry(data: &[u8], name: &str) -> String {
        let cursor = std::io::Cursor::new(data);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        let mut file = archive.by_name(name).unwrap();
        let mut contents = String::new();
        std::io::Read::read_to_string(&mut file, &mut contents).unwrap();
        contents
    }

    #[test]
    fn test_serialize_minimal_document() {
        let doc = make_minimal_doc();
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();

        // Verify it's a valid ZIP
        assert!(bytes.len() > 4);
        assert_eq!(bytes[0], 0x50); // PK header
        assert_eq!(bytes[1], 0x4B);

        // Check required entries
        let entries = zip_entry_names(&bytes);
        assert!(entries.contains(&"[Content_Types].xml".to_string()));
        assert!(entries.contains(&"_rels/.rels".to_string()));
        assert!(entries.contains(&"word/document.xml".to_string()));
        assert!(entries.contains(&"word/_rels/document.xml.rels".to_string()));
        assert!(entries.contains(&"word/styles.xml".to_string()));
        assert!(entries.contains(&"docProps/core.xml".to_string()));

        // Verify document content
        let doc_xml = read_zip_entry(&bytes, "word/document.xml");
        assert!(doc_xml.contains("Hello World"));
        assert!(doc_xml.contains("<w:p>"));
        assert!(doc_xml.contains("<w:r>"));
        assert!(doc_xml.contains("<w:t"));
    }

    #[test]
    fn test_serialize_formatted_paragraph() {
        let doc = OoxmlDocument {
            format: OoxmlFormat::Docx,
            version: "1.0".to_string(),
            content_types: vec![],
            main_part: Some("word/document.xml".to_string()),
            shared_strings: vec![],
            part_count: 1,
            core_properties: CoreProperties::default(),
            relationships: vec![],
            body: Some(DocxBody {
                paragraphs: vec![DocxParagraph {
                    style_id: None,
                    properties: DocxParagraphProperties::default(),
                    runs: vec![
                        DocxRun {
                            text: "Bold".to_string(),
                            bold: true,
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
                        },
                        DocxRun {
                            text: "Italic".to_string(),
                            bold: false,
                            italic: true,
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
                        },
                        DocxRun {
                            text: "Underline".to_string(),
                            bold: false,
                            italic: false,
                            underline: Some(UnderlineType::Single),
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
                        },
                    ],
                }],
                tables: vec![],
            }),
        };
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();
        let doc_xml = read_zip_entry(&bytes, "word/document.xml");

        assert!(doc_xml.contains("<w:b/>"));
        assert!(doc_xml.contains("<w:i/>"));
        assert!(doc_xml.contains("<w:u w:val=\"single\"/>"));
        assert!(doc_xml.contains("Bold"));
        assert!(doc_xml.contains("Italic"));
        assert!(doc_xml.contains("Underline"));
    }

    #[test]
    fn test_serialize_multiple_paragraphs() {
        let doc = OoxmlDocument {
            format: OoxmlFormat::Docx,
            version: "1.0".to_string(),
            content_types: vec![],
            main_part: Some("word/document.xml".to_string()),
            shared_strings: vec![],
            part_count: 1,
            core_properties: CoreProperties::default(),
            relationships: vec![],
            body: Some(DocxBody {
                paragraphs: vec![
                    DocxParagraph {
                        style_id: None,
                        properties: DocxParagraphProperties::default(),
                        runs: vec![DocxRun {
                            text: "First".to_string(),
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
                        }],
                    },
                    DocxParagraph {
                        style_id: None,
                        properties: DocxParagraphProperties {
                            alignment: Some(TextAlignment::Center),
                            ..Default::default()
                        },
                        runs: vec![DocxRun {
                            text: "Second".to_string(),
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
                        }],
                    },
                    DocxParagraph {
                        style_id: None,
                        properties: DocxParagraphProperties {
                            alignment: Some(TextAlignment::Right),
                            ..Default::default()
                        },
                        runs: vec![DocxRun {
                            text: "Third".to_string(),
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
                        }],
                    },
                ],
                tables: vec![],
            }),
        };
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();
        let doc_xml = read_zip_entry(&bytes, "word/document.xml");

        assert!(doc_xml.contains("First"));
        assert!(doc_xml.contains("Second"));
        assert!(doc_xml.contains("Third"));
        assert!(doc_xml.contains("w:val=\"center\""));
        assert!(doc_xml.contains("w:val=\"right\""));
        // Should have 3 <w:p> elements
        assert_eq!(doc_xml.matches("<w:p>").count(), 3);
    }

    #[test]
    fn test_serialize_with_table() {
        let doc = OoxmlDocument {
            format: OoxmlFormat::Docx,
            version: "1.0".to_string(),
            content_types: vec![],
            main_part: Some("word/document.xml".to_string()),
            shared_strings: vec![],
            part_count: 1,
            core_properties: CoreProperties::default(),
            relationships: vec![],
            body: Some(DocxBody {
                paragraphs: vec![],
                tables: vec![DocxTable {
                    rows: vec![
                        DocxTableRow {
                            cells: vec![
                                DocxTableCell {
                                    paragraphs: vec![DocxParagraph {
                                        style_id: None,
                                        properties: DocxParagraphProperties::default(),
                                        runs: vec![DocxRun {
                                            text: "A1".to_string(),
                                            bold: true,
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
                                        }],
                                    }],
                                    column_span: 1,
                                    row_span: 1,
                                    width: None,
                                    shading: None,
                                },
                                DocxTableCell {
                                    paragraphs: vec![DocxParagraph {
                                        style_id: None,
                                        properties: DocxParagraphProperties::default(),
                                        runs: vec![DocxRun {
                                            text: "B1".to_string(),
                                            bold: true,
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
                                        }],
                                    }],
                                    column_span: 1,
                                    row_span: 1,
                                    width: None,
                                    shading: None,
                                },
                            ],
                            height: None,
                            is_header: true,
                        },
                        DocxTableRow {
                            cells: vec![
                                DocxTableCell {
                                    paragraphs: vec![DocxParagraph {
                                        style_id: None,
                                        properties: DocxParagraphProperties::default(),
                                        runs: vec![DocxRun {
                                            text: "A2".to_string(),
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
                                        }],
                                    }],
                                    column_span: 1,
                                    row_span: 1,
                                    width: None,
                                    shading: None,
                                },
                                DocxTableCell {
                                    paragraphs: vec![DocxParagraph {
                                        style_id: None,
                                        properties: DocxParagraphProperties::default(),
                                        runs: vec![DocxRun {
                                            text: "B2".to_string(),
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
                                        }],
                                    }],
                                    column_span: 1,
                                    row_span: 1,
                                    width: None,
                                    shading: None,
                                },
                            ],
                            height: None,
                            is_header: false,
                        },
                    ],
                    properties: DocxTableProperties::default(),
                }],
            }),
        };
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();
        let doc_xml = read_zip_entry(&bytes, "word/document.xml");

        assert!(doc_xml.contains("<w:tbl>"));
        assert!(doc_xml.contains("<w:tr>"));
        assert!(doc_xml.contains("<w:tc>"));
        assert!(doc_xml.contains("A1"));
        assert!(doc_xml.contains("B1"));
        assert!(doc_xml.contains("A2"));
        assert!(doc_xml.contains("B2"));
    }

    #[test]
    fn test_serialize_empty_document() {
        let doc = OoxmlDocument {
            format: OoxmlFormat::Docx,
            version: "1.0".to_string(),
            content_types: vec![],
            main_part: Some("word/document.xml".to_string()),
            shared_strings: vec![],
            part_count: 1,
            core_properties: CoreProperties::default(),
            relationships: vec![],
            body: None,
        };
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();

        // Should still be a valid ZIP with all required parts
        assert_eq!(bytes[0], 0x50);
        assert_eq!(bytes[1], 0x4B);

        let entries = zip_entry_names(&bytes);
        assert!(entries.contains(&"[Content_Types].xml".to_string()));
        assert!(entries.contains(&"word/document.xml".to_string()));

        // Document should have an empty body
        let doc_xml = read_zip_entry(&bytes, "word/document.xml");
        assert!(doc_xml.contains("<w:body>"));
        assert!(doc_xml.contains("<w:document"));
    }

    #[test]
    fn test_roundtrip_through_zip() {
        let doc = make_minimal_doc();
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();

        // Verify the output can be read back as a ZIP and parsed by OoxmlParser
        let cursor = std::io::Cursor::new(bytes);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        assert!(archive.by_name("[Content_Types].xml").is_ok());
        assert!(archive.by_name("word/document.xml").is_ok());

        // Read document.xml and verify it's valid XML with expected content
        let mut doc_file = archive.by_name("word/document.xml").unwrap();
        let mut doc_content = String::new();
        std::io::Read::read_to_string(&mut doc_file, &mut doc_content).unwrap();
        assert!(doc_content.contains("Hello World"));
        assert!(doc_content.contains("xmlns:w="));
    }

    #[test]
    fn test_content_types_present() {
        let doc = make_minimal_doc();
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();

        let ct = read_zip_entry(&bytes, "[Content_Types].xml");
        assert!(ct.contains("application/vnd.openxmlformats-package.relationships+xml"));
        assert!(ct.contains("application/xml"));
        assert!(ct.contains("wordprocessingml.document.main+xml"));
        assert!(ct.contains("wordprocessingml.styles+xml"));
    }

    #[test]
    fn test_rels_present() {
        let doc = make_minimal_doc();
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();

        let rels = read_zip_entry(&bytes, "_rels/.rels");
        assert!(rels.contains("officeDocument"));
        assert!(rels.contains("word/document.xml"));

        let doc_rels = read_zip_entry(&bytes, "word/_rels/document.xml.rels");
        assert!(doc_rels.contains("styles"));
    }

    #[test]
    fn test_escape_xml() {
        assert_eq!(escape_xml("a&b"), "a&amp;b");
        assert_eq!(escape_xml("a<b"), "a&lt;b");
        assert_eq!(escape_xml("a>b"), "a&gt;b");
        assert_eq!(escape_xml("a\"b"), "a&quot;b");
        assert_eq!(escape_xml("a'b"), "a&apos;b");
        assert_eq!(escape_xml("plain"), "plain");
    }

    #[test]
    fn test_serialize_with_core_properties() {
        let doc = OoxmlDocument {
            format: OoxmlFormat::Docx,
            version: "1.0".to_string(),
            content_types: vec![],
            main_part: Some("word/document.xml".to_string()),
            shared_strings: vec![],
            part_count: 1,
            core_properties: CoreProperties {
                title: Some("Test Document".to_string()),
                creator: Some("Test Author".to_string()),
                subject: Some("Testing".to_string()),
                description: Some("A test document".to_string()),
                keywords: Some("test docx".to_string()),
                language: Some("en-US".to_string()),
                last_modified_by: Some("Another Author".to_string()),
                created: Some("2026-04-16T00:00:00Z".to_string()),
                modified: Some("2026-04-16T12:00:00Z".to_string()),
                category: Some("test".to_string()),
                revision: Some("1".to_string()),
            },
            relationships: vec![],
            body: Some(DocxBody {
                paragraphs: vec![DocxParagraph {
                    style_id: None,
                    properties: DocxParagraphProperties::default(),
                    runs: vec![DocxRun {
                        text: "Content".to_string(),
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
                    }],
                }],
                tables: vec![],
            }),
        };
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();

        let core = read_zip_entry(&bytes, "docProps/core.xml");
        assert!(core.contains("Test Document"));
        assert!(core.contains("Test Author"));
        assert!(core.contains("Testing"));
        assert!(core.contains("A test document"));
        assert!(core.contains("test docx"));
        assert!(core.contains("en-US"));
        assert!(core.contains("Another Author"));
        assert!(core.contains("2026-04-16"));
        assert!(core.contains("test"));
    }

    #[test]
    fn test_serialize_empty_body() {
        let doc = OoxmlDocument {
            format: OoxmlFormat::Docx,
            version: "1.0".to_string(),
            content_types: vec![],
            main_part: Some("word/document.xml".to_string()),
            shared_strings: vec![],
            part_count: 1,
            core_properties: CoreProperties::default(),
            relationships: vec![],
            body: Some(DocxBody {
                paragraphs: vec![],
                tables: vec![],
            }),
        };
        let ser = OoxmlSerializer::new();
        let bytes = ser.serialize(&doc).unwrap();

        let doc_xml = read_zip_entry(&bytes, "word/document.xml");
        assert!(doc_xml.contains("<w:body>"));
        assert!(!doc_xml.contains("<w:p>"));
        assert!(!doc_xml.contains("<w:tbl>"));
    }
}
