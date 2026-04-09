//! DOCX rendering pipeline.
//!
//! Provides the high-level API for converting DOCX documents
//! to rendered output. The pipeline stages are:
//!
//! 1. Parse DOCX (via eo-ooxml, not yet implemented)
//! 2. Layout engine: compute text flow, page breaks, columns
//! 3. Render: draw to canvas using eo-renderer backend
//! 4. Export: output to PDF/PNG/SVG

use std::time::Instant;

use eo_common::{CoreError, Result};

use crate::model::*;

/// DOCX rendering pipeline.
pub struct DocxRenderPipeline {
    config: RenderConfig,
}

impl DocxRenderPipeline {
    pub fn new(config: RenderConfig) -> Self {
        Self { config }
    }

    /// Render a DOCX document from raw bytes.
    ///
    /// Currently returns a placeholder result. Full implementation
    /// requires eo-ooxml (DOCX parser) and eo-renderer (canvas backend)
    /// crates which are planned for Phase 4+.
    pub fn render(&self, _docx_data: &[u8]) -> Result<RenderResult> {
        let start = Instant::now();

        // Placeholder: validate that input looks like a ZIP (DOCX is ZIP-based)
        if _docx_data.len() < 4 || _docx_data[0] != 0x50 || _docx_data[1] != 0x4B {
            return Err(CoreError::Parse {
                format: "docx".into(),
                message: "Not a valid DOCX file (expected ZIP archive)".into(),
            });
        }

        let duration_ms = start.elapsed().as_millis() as u64;
        let warnings = vec![
            "Full DOCX rendering requires eo-ooxml and eo-renderer crates (Phase 4+)".to_string(),
        ];

        Ok(RenderResult {
            page_count: 0,
            output: RenderOutput::Pdf(Vec::new()),
            warnings,
            duration_ms,
        })
    }

    /// Render a single page by page number (1-based).
    pub fn render_page(&self, _docx_data: &[u8], _page_num: u32) -> Result<RenderOutput> {
        Ok(RenderOutput::Pdf(Vec::new()))
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

#[cfg(test)]
mod tests {
    use super::*;

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
        // Minimal ZIP header
        let data = b"PK\x03\x04\x14\x00\x00\x00\x00\x00\x00\x00!";
        let result = pipeline.render(data).unwrap();
        assert_eq!(result.page_count, 0);
        assert!(!result.warnings.is_empty());
        assert!(!result.warnings.is_empty());
    }

    #[test]
    fn test_render_page_placeholder() {
        let pipeline = DocxRenderPipeline::default();
        let data = b"PK\x03\x04";
        let result = pipeline.render_page(data, 1).unwrap();
        assert!(matches!(result, RenderOutput::Pdf(_)));
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
}
