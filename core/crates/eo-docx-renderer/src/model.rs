use serde::{Deserialize, Serialize};

/// Rendering configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderConfig {
    /// Output format.
    pub output_format: OutputFormat,
    /// Page width in points (default: A4 = 595.28).
    pub page_width: f32,
    /// Page height in points (default: A4 = 841.89).
    pub page_height: f32,
    /// Margins in points (top, right, bottom, left).
    pub margins: Margins,
    /// DPI for raster output (default: 150).
    pub dpi: u32,
    /// Whether to render comments.
    pub render_comments: bool,
    /// Whether to render tracked changes.
    pub render_changes: bool,
    /// Font substitution map (font name → fallback font name).
    pub font_substitutions: Vec<(String, String)>,
}

/// Output format for rendering.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OutputFormat {
    Pdf,
    Png,
    Svg,
}

/// Page margins in points.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Margins {
    pub top: f32,
    pub right: f32,
    pub bottom: f32,
    pub left: f32,
}

impl Default for Margins {
    fn default() -> Self {
        Self {
            top: 72.0, // 1 inch
            right: 72.0,
            bottom: 72.0,
            left: 72.0,
        }
    }
}

impl Default for RenderConfig {
    fn default() -> Self {
        Self {
            output_format: OutputFormat::Pdf,
            page_width: 595.28,  // A4
            page_height: 841.89, // A4
            margins: Margins::default(),
            dpi: 150,
            render_comments: false,
            render_changes: false,
            font_substitutions: Vec::new(),
        }
    }
}

/// Rendering result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderResult {
    /// Number of pages rendered.
    pub page_count: u32,
    /// Rendered output data (PDF bytes, PNG image data, SVG text).
    pub output: RenderOutput,
    /// Warnings encountered during rendering.
    pub warnings: Vec<String>,
    /// Rendering duration in milliseconds.
    pub duration_ms: u64,
}

/// Rendered output.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RenderOutput {
    /// PDF bytes.
    Pdf(Vec<u8>),
    /// PNG image data (one per page).
    Png(Vec<Vec<u8>>),
    /// SVG text (one per page).
    Svg(Vec<String>),
}
