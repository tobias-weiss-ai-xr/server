//! DOCX rendering pipeline.
//!
//! Provides the high-level API for converting DOCX documents
//! to rendered output. The pipeline stages are:
//!
//! 1. Parse DOCX (via wo-ooxml)
//! 2. Layout engine: compute text flow, page breaks, columns
//! 3. Render: draw to canvas using wo-renderer backend
//! 4. Export: output to PDF/PNG/SVG

use std::time::Instant;

use crate::layout::{LayoutElement, LayoutEngine, LayoutLine};
use crate::model::*;
use wo_common::{CoreError, Result};
use wo_ooxml::model::{DocxBody, OoxmlFormat};
use wo_ooxml::parser::OoxmlParser;
use wo_renderer::{Canvas, Color, Paint};

/// DOCX rendering pipeline.
pub struct DocxRenderPipeline {
    config: RenderConfig,
}

impl DocxRenderPipeline {
    pub fn new(config: RenderConfig) -> Self {
        Self { config }
    }

    /// Render a DOCX document from raw bytes.
    pub fn render(&self, docx_data: &[u8]) -> Result<RenderResult> {
        let start = Instant::now();

        // Stage 1: Parse
        let parser = OoxmlParser::new();
        let ooxml = parser.parse(docx_data).map_err(|e| CoreError::Parse {
            format: "docx".into(),
            message: format!("Failed to parse DOCX: {}", e),
        })?;

        if ooxml.format != OoxmlFormat::Docx {
            return Err(CoreError::Parse {
                format: "docx".into(),
                message: format!("Expected DOCX format, got {}", ooxml.format),
            });
        }

        let body = ooxml.body.unwrap_or_else(DocxBody::default);

        // Stage 2: Layout
        let layout_engine = LayoutEngine::new(&self.config);
        let pages = layout_engine.layout(&body);

        // Stage 3: Render each page to a canvas
        let scale = self.config.dpi as f32 / 72.0;
        let canvas_width = (self.config.page_width * scale) as u32;
        let canvas_height = (self.config.page_height * scale) as u32;

        let mut warnings = Vec::new();
        let page_bytes: Vec<Vec<u8>> = pages
            .iter()
            .map(|page| {
                let mut canvas = Canvas::new(canvas_width, canvas_height);
                canvas.scale(scale, scale);
                render_layout_page(&mut canvas, page, &mut warnings);
                canvas.to_rgba_bytes()
            })
            .collect();

        // Stage 4: Export
        let page_count = pages.len() as u32;
        let output = match self.config.output_format {
            OutputFormat::Pdf => RenderOutput::Pdf(
                // For now, concatenate all pages' RGBA bytes.
                // Real PDF generation would need a PDF writer library.
                page_bytes.into_iter().flatten().collect(),
            ),
            OutputFormat::Png => RenderOutput::Png(page_bytes),
            OutputFormat::Svg => RenderOutput::Svg(Vec::new()),
        };

        let duration_ms = start.elapsed().as_millis() as u64;

        Ok(RenderResult {
            page_count,
            output,
            warnings,
            duration_ms,
        })
    }

    /// Render a single page by page number (1-based).
    pub fn render_page(&self, docx_data: &[u8], page_num: u32) -> Result<RenderOutput> {
        if page_num == 0 {
            return Err(CoreError::InvalidInput {
                message: "Page number must be 1-based".into(),
            });
        }

        // Delegate to full render, then extract the requested page
        let full_result = self.render(docx_data)?;
        let page_count = full_result.page_count;
        let page_idx = (page_num - 1) as usize;

        if page_num > page_count {
            return Err(CoreError::InvalidInput {
                message: format!(
                    "Page {} out of range ({} pages total)",
                    page_num, page_count
                ),
            });
        }

        match &full_result.output {
            RenderOutput::Pdf(_bytes) => {
                // Since PDF output is flattened bytes from all pages,
                // we cannot extract a single page. Return an error.
                Err(CoreError::InvalidInput {
                    message: "Single page extraction from PDF output is not supported".into(),
                })
            }
            RenderOutput::Png(pages) => {
                if page_idx < pages.len() {
                    Ok(RenderOutput::Png(vec![pages[page_idx].clone()]))
                } else {
                    Err(CoreError::InvalidInput {
                        message: format!(
                            "Page {} out of range ({} pages total)",
                            page_num,
                            pages.len()
                        ),
                    })
                }
            }
            RenderOutput::Svg(pages) => {
                if page_idx < pages.len() {
                    Ok(RenderOutput::Svg(vec![pages[page_idx].clone()]))
                } else {
                    Err(CoreError::InvalidInput {
                        message: format!(
                            "Page {} out of range ({} pages total)",
                            page_num,
                            pages.len()
                        ),
                    })
                }
            }
        }
    }

    /// Get the rendering configuration.
    pub fn config(&self) -> &RenderConfig {
        &self.config
    }

    /// Update the rendering configuration.
    pub fn set_config(&mut self, config: RenderConfig) {
        self.config = config;
    }
}

impl Default for DocxRenderPipeline {
    fn default() -> Self {
        Self::new(RenderConfig::default())
    }
}

/// Render a single layout page to a canvas.
fn render_layout_page(
    canvas: &mut Canvas,
    page: &crate::layout::LayoutPage,
    warnings: &mut Vec<String>,
) {
    for element in &page.elements {
        match element {
            LayoutElement::Paragraph {
                lines,
                alignment: _,
            } => {
                for line in lines {
                    render_line(canvas, line);
                }
            }
            LayoutElement::Table {
                cells,
                row_heights: _,
                x: _,
                y: _,
                width: _,
            } => {
                for cell in cells {
                    render_table_cell(canvas, cell, warnings);
                }
            }
            LayoutElement::PageBreak => {
                // Nothing to render for page breaks in pixel output;
                // page breaks are handled by layout engine producing new pages.
            }
        }
    }
}

/// Render a single text line to the canvas.
fn render_line(canvas: &mut Canvas, line: &LayoutLine) {
    if line.text.is_empty() {
        return;
    }

    // Set text color: interpret hex color string
    let r = parse_hex_color_part(&line.color, 0);
    let g = parse_hex_color_part(&line.color, 1);
    let b = parse_hex_color_part(&line.color, 2);
    canvas.set_fill(Paint::Color(Color::rgb(
        r as f32 / 255.0,
        g as f32 / 255.0,
        b as f32 / 255.0,
    )));

    // Draw text as rectangles (approximation since canvas has no true text rendering yet)
    // Each character is roughly 0.5 * font_size wide and font_size tall
    let char_w = line.font_size * 0.5;
    let text_height = line.font_size;
    let baseline_offset = text_height * 0.8; // approximate baseline
    let text_y = line.y + baseline_offset;

    for (i, ch) in line.text.char_indices() {
        if ch == ' ' || ch == '\t' {
            continue; // Skip whitespace rendering
        }
        let char_x = line.x + i as f32 * char_w;
        // Draw a small filled rectangle as glyph placeholder
        canvas.fill_rect(char_x, text_y - text_height, char_w.max(1.0), text_height);
    }
}

/// Render a table cell: draw borders and text content.
fn render_table_cell(
    canvas: &mut Canvas,
    cell: &crate::layout::LayoutCell,
    warnings: &mut Vec<String>,
) {
    // Draw cell border
    canvas.save();
    canvas.set_stroke(Paint::Color(Color::rgb(0.3, 0.3, 0.3)));
    canvas.set_stroke_style(wo_renderer::StrokeStyle::default());
    canvas.stroke_rect(cell.x, cell.y, cell.width, cell.height);
    canvas.restore();

    // Render cell paragraphs as simple text blocks
    let mut text_y = cell.y + 4.0; // small padding
    for para in &cell.paragraphs {
        for run in &para.runs {
            if run.text.is_empty() {
                continue;
            }

            let font_size = run.font_size.unwrap_or(24) as f32 / 2.0;
            let r = run
                .color
                .as_ref()
                .map(|c| parse_hex_color_part(c, 0) as f32 / 255.0)
                .unwrap_or(0.0);
            let g = run
                .color
                .as_ref()
                .map(|c| parse_hex_color_part(c, 1) as f32 / 255.0)
                .unwrap_or(0.0);
            let b = run
                .color
                .as_ref()
                .map(|c| parse_hex_color_part(c, 2) as f32 / 255.0)
                .unwrap_or(0.0);

            canvas.set_fill(Paint::Color(Color::rgb(r, g, b)));

            let char_w = font_size * 0.5;
            for (i, ch) in run.text.char_indices() {
                if ch == ' ' || ch == '\t' {
                    continue;
                }
                let char_x = cell.x + 4.0 + i as f32 * char_w;
                if char_x + char_w > cell.x + cell.width - 4.0 {
                    if i < 20 {
                        warnings.push("Truncated cell text".to_string());
                    }
                    break;
                }
                canvas.fill_rect(char_x, text_y - font_size, char_w.max(1.0), font_size);
            }
            text_y += font_size * 1.2;
        }
    }
}

/// Parse a hex color like "FF0000" and return the byte value for component 0=R, 1=G, 2=B.
fn parse_hex_color_part(hex: &str, component: usize) -> u8 {
    let start = component * 2;
    if hex.len() >= start + 2 {
        u8::from_str_radix(&hex[start..start + 2], 16).unwrap_or(0)
    } else {
        0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
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

            zip.start_file("_rels/.rels", zip::write::SimpleFileOptions::default())
                .unwrap();
            zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"#)
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
    fn test_default_config() {
        let config = RenderConfig::default();
        assert_eq!(config.output_format, OutputFormat::Pdf);
        assert!((config.page_width - 595.28).abs() < 0.01);
        assert!((config.page_height - 841.89).abs() < 0.01);
        assert_eq!(config.dpi, 150);
        assert!(!config.render_comments);
        assert!(!config.render_changes);
    }

    #[test]
    fn test_default_margins() {
        let margins = Margins::default();
        assert!((margins.top - 72.0).abs() < 0.01);
        assert!((margins.left - 72.0).abs() < 0.01);
    }

    #[test]
    fn test_pipeline_rejects_non_zip() {
        let pipeline = DocxRenderPipeline::default();
        let result = pipeline.render(b"not a zip");
        assert!(result.is_err());
    }

    #[test]
    fn test_pipeline_accepts_zip() {
        let pipeline = DocxRenderPipeline::default();
        let data = make_minimal_docx();
        let result = pipeline.render(&data).unwrap();
        assert!(result.page_count >= 1);
    }

    #[test]
    fn test_render_page_placeholder() {
        let pipeline = DocxRenderPipeline::default();
        let data = make_minimal_docx();
        // PDF output doesn't support single-page extraction (flattened bytes)
        let result = pipeline.render_page(&data, 1);
        assert!(result.is_err());
    }

    #[test]
    fn test_config_getter() {
        let config = RenderConfig::default();
        let pipeline = DocxRenderPipeline::new(config);
        assert_eq!(pipeline.config().dpi, 150);
    }

    #[test]
    fn test_set_config() {
        let mut pipeline = DocxRenderPipeline::default();
        let mut config = RenderConfig::default();
        config.dpi = 300;
        pipeline.set_config(config);
        assert_eq!(pipeline.config().dpi, 300);
    }

    #[test]
    fn test_render_minimal_docx() {
        let pipeline = DocxRenderPipeline::default();
        let data = make_minimal_docx();
        let result = pipeline.render(&data).unwrap();
        assert!(result.page_count >= 1, "Should have at least 1 page");
        match &result.output {
            RenderOutput::Pdf(bytes) => {
                assert!(!bytes.is_empty(), "Output should not be empty");
            }
            RenderOutput::Png(pages) => {
                assert!(!pages.is_empty());
                assert!(!pages[0].is_empty());
            }
            RenderOutput::Svg(_) => {}
        }
    }

    #[test]
    fn test_render_text_wrapping() {
        let pipeline = DocxRenderPipeline::default();
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDD</w:t></w:r></w:p>
  </w:body>
</w:document>"#,
        );
        let result = pipeline.render(&docx).unwrap();
        assert!(result.page_count >= 1);
    }

    #[test]
    fn test_render_page_breaks() {
        let pipeline = DocxRenderPipeline::default();
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Page 1</w:t></w:r></w:p>
    <w:p>
      <w:pPr><w:pageBreakBefore/></w:pPr>
      <w:r><w:t>Page 2</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"#,
        );
        let result = pipeline.render(&docx).unwrap();
        assert!(
            result.page_count >= 2,
            "page_break_before should create new page"
        );
    }

    #[test]
    fn test_render_table() {
        let pipeline = DocxRenderPipeline::default();
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:tbl>
      <w:tblPr><w:tblW w="5000"/></w:tblPr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>A</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>B</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>"#,
        );
        let result = pipeline.render(&docx).unwrap();
        assert!(result.page_count >= 1);
        match &result.output {
            RenderOutput::Pdf(bytes) => assert!(!bytes.is_empty()),
            RenderOutput::Png(pages) => {
                assert!(!pages.is_empty());
                assert!(!pages[0].is_empty());
            }
            RenderOutput::Svg(_) => {}
        }
    }

    #[test]
    fn test_render_page_out_of_range() {
        let pipeline = DocxRenderPipeline::default();
        let data = make_minimal_docx();
        let result = pipeline.render_page(&data, 99);
        assert!(result.is_err());
    }

    #[test]
    fn test_render_page_zero() {
        let pipeline = DocxRenderPipeline::default();
        let data = make_minimal_docx();
        let result = pipeline.render_page(&data, 0);
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_hex_color() {
        assert_eq!(parse_hex_color_part("FF0000", 0), 0xFF);
        assert_eq!(parse_hex_color_part("FF0000", 1), 0x00);
        assert_eq!(parse_hex_color_part("FF0000", 2), 0x00);
        assert_eq!(parse_hex_color_part("00FF00", 0), 0x00);
        assert_eq!(parse_hex_color_part("00FF00", 1), 0xFF);
        assert_eq!(parse_hex_color_part("", 0), 0);
    }

    #[test]
    fn test_render_multiple_paragraphs() {
        let pipeline = DocxRenderPipeline::default();
        let docx = make_docx_with_body(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>First</w:t></w:r></w:p>
    <w:p><w:r><w:t>Second</w:t></w:r></w:p>
    <w:p><w:r><w:t>Third</w:t></w:r></w:p>
  </w:body>
</w:document>"#,
        );
        let result = pipeline.render(&docx).unwrap();
        assert!(result.page_count >= 1);
    }
}
