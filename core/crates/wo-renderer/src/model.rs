//! Render model types.
//!
//! Defines page layout, render results, and blend modes.

use serde::{Deserialize, Serialize};

/// Blend mode for compositing operations.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum BlendMode {
    #[default]
    SourceOver,
    Multiply,
    Screen,
    Overlay,
    Darken,
    Lighten,
    ColorDodge,
    ColorBurn,
    HardLight,
    SoftLight,
    Difference,
    Exclusion,
    Hue,
    Saturation,
    Color,
    Luminosity,
}

/// A renderable page with dimensions and content.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Page {
    /// Page width in points (1/72 inch).
    pub width: f32,
    /// Page height in points.
    pub height: f32,
    /// Page number (1-indexed).
    pub number: u32,
    /// Optional page label.
    pub label: Option<String>,
}

impl Page {
    /// Create a new page with dimensions in points.
    pub fn new(width: f32, height: f32) -> Self {
        Self {
            width,
            height,
            number: 1,
            label: None,
        }
    }

    /// A4 page size (595.28 × 841.89 points).
    pub fn a4() -> Self {
        Self::new(595.28, 841.89)
    }

    /// Letter page size (612 × 792 points).
    pub fn letter() -> Self {
        Self::new(612.0, 792.0)
    }

    /// US Legal page size (612 × 1008 points).
    pub fn legal() -> Self {
        Self::new(612.0, 1008.0)
    }

    /// Get dimensions in pixels at a given DPI.
    pub fn pixel_size(&self, dpi: f32) -> (u32, u32) {
        let scale = dpi / 72.0;
        (
            (self.width * scale).round() as u32,
            (self.height * scale).round() as u32,
        )
    }
}

/// Result of a rendering operation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderResult {
    /// Number of pages rendered.
    pub page_count: u32,
    /// Total render time in milliseconds.
    pub duration_ms: u64,
    /// Warnings encountered during rendering.
    pub warnings: Vec<String>,
    /// Whether the render was fully successful.
    pub success: bool,
}

impl Default for RenderResult {
    fn default() -> Self {
        Self {
            page_count: 0,
            duration_ms: 0,
            warnings: Vec::new(),
            success: false,
        }
    }
}

impl RenderResult {
    /// Create a successful result.
    pub fn ok(page_count: u32, duration_ms: u64) -> Self {
        Self {
            page_count,
            duration_ms,
            warnings: Vec::new(),
            success: true,
        }
    }

    /// Create a failure result.
    pub fn fail(message: &str) -> Self {
        Self {
            warnings: vec![message.to_string()],
            success: false,
            ..Default::default()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_page_a4() {
        let a4 = Page::a4();
        assert!((a4.width - 595.28).abs() < 0.01);
        assert!((a4.height - 841.89).abs() < 0.01);
    }

    #[test]
    fn test_page_letter() {
        let letter = Page::letter();
        assert!((letter.width - 612.0).abs() < 0.01);
        assert!((letter.height - 792.0).abs() < 0.01);
    }

    #[test]
    fn test_page_pixel_size() {
        let page = Page::a4();
        let (w, h) = page.pixel_size(72.0);
        assert_eq!(w, 595);
        assert_eq!(h, 842);

        let (w2, h2) = page.pixel_size(144.0);
        assert_eq!(w2, 1191);
        assert_eq!(h2, 1684);
    }

    #[test]
    fn test_render_result_ok() {
        let result = RenderResult::ok(5, 100);
        assert!(result.success);
        assert_eq!(result.page_count, 5);
        assert!(result.warnings.is_empty());
    }

    #[test]
    fn test_render_result_fail() {
        let result = RenderResult::fail("test error");
        assert!(!result.success);
        assert_eq!(result.warnings.len(), 1);
    }
}
