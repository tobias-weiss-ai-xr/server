//! Font metrics calculation.
//!
//! Provides scaled font metrics for layout engines:
//! ascent, descent, line height, character width estimation.

use crate::model::{FontInfo, FontStyle, FontWeight};

/// Scaled font metrics for a specific font size.
#[derive(Debug, Clone)]
pub struct FontMetrics {
    /// Font size in points (1/72 inch).
    pub font_size: f32,
    /// Scaled ascent in pixels (positive, distance from baseline to top).
    pub ascent: f32,
    /// Scaled descent in pixels (positive, distance from baseline to bottom).
    pub descent: f32,
    /// Line gap between lines in pixels.
    pub line_gap: f32,
    /// Total line height in pixels (ascent + descent + line_gap).
    pub line_height: f32,
    /// Scale factor from font units to pixels.
    pub scale: f32,
    /// Average character width estimate in pixels.
    pub avg_char_width: f32,
    /// Maximum character width in pixels.
    pub max_char_width: f32,
    /// X-height estimate in pixels.
    pub x_height: f32,
    /// Cap height estimate in pixels.
    pub cap_height: f32,
}

impl FontMetrics {
    /// Compute scaled metrics from font info and desired size.
    pub fn from_font_info(info: &FontInfo, font_size: f32) -> Self {
        let scale = font_size / info.units_per_em as f32;

        let ascent = info.ascender as f32 * scale;
        let descent = (-info.descender as f32) * scale; // descender is negative
        let line_gap = info.line_gap as f32 * scale;
        let line_height = ascent + descent + line_gap;

        // Estimate x-height as ~52% of em
        let x_height = font_size * 0.52;
        // Estimate cap height as ~72% of em
        let cap_height = font_size * 0.72;
        // Average char width estimate: ~50% of em for proportional, ~60% for monospace
        let avg_char_width = if info.is_monospace {
            font_size * 0.60
        } else {
            font_size * 0.50
        };
        // Max char width: em square
        let max_char_width = font_size;

        Self {
            font_size,
            ascent,
            descent,
            line_gap,
            line_height,
            scale,
            avg_char_width,
            max_char_width,
            x_height,
            cap_height,
        }
    }

    /// Convert font units to pixels.
    pub fn font_units_to_pixels(&self, units: i16) -> f32 {
        units as f32 * self.scale
    }

    /// Convert font units to pixels (unsigned).
    pub fn font_units_to_pixels_u(&self, units: u16) -> f32 {
        units as f32 * self.scale
    }

    /// Get the baseline offset (ascent) in pixels.
    pub fn baseline(&self) -> f32 {
        self.ascent
    }

    /// Get the strikethrough position relative to baseline.
    pub fn strikethrough_position(&self) -> f32 {
        self.x_height * 0.3
    }

    /// Get the underline position relative to baseline (negative = below).
    pub fn underline_position(&self) -> f32 {
        -(self.descent * 0.2)
    }

    /// Get the underline thickness in pixels.
    pub fn underline_thickness(&self) -> f32 {
        self.font_size * 0.05
    }

    /// Estimate text width for a string of characters.
    pub fn estimate_text_width(&self, char_count: usize) -> f32 {
        self.avg_char_width * char_count as f32
    }
}

/// Compute the CSS-compatible font-stretch keyword from weight.
pub fn weight_to_css(weight: &FontWeight) -> &'static str {
    match weight.0 {
        100 => "normal",
        200 => "extra-light",
        300 => "light",
        400 => "normal",
        500 => "medium",
        600 => "semi-bold",
        700 => "bold",
        800 => "extra-bold",
        900 => "black",
        _ => "normal",
    }
}

/// Compute the CSS font-style keyword.
pub fn style_to_css(style: FontStyle) -> &'static str {
    match style {
        FontStyle::Normal => "normal",
        FontStyle::Italic => "italic",
        FontStyle::Oblique => "oblique",
    }
}

/// Match a CSS font-weight string to the nearest FontWeight.
pub fn css_to_weight(s: &str) -> FontWeight {
    match s {
        "100" | "thin" => FontWeight::THIN,
        "200" | "extra-light" | "extralight" => FontWeight::EXTRA_LIGHT,
        "300" | "light" => FontWeight::LIGHT,
        "400" | "normal" | "regular" => FontWeight::NORMAL,
        "500" | "medium" => FontWeight::MEDIUM,
        "600" | "semi-bold" | "semibold" | "demibold" => FontWeight::SEMI_BOLD,
        "700" | "bold" => FontWeight::BOLD,
        "800" | "extra-bold" | "extrabold" => FontWeight::EXTRA_BOLD,
        "900" | "black" | "heavy" => FontWeight::BLACK,
        _ => FontWeight::NORMAL,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_font_info() -> FontInfo {
        FontInfo {
            family: "TestFont".into(),
            face_name: "Regular".into(),
            style: FontStyle::Normal,
            weight: FontWeight::NORMAL,
            units_per_em: 1000,
            ascender: 800,
            descender: -200,
            line_gap: 0,
            num_glyphs: 256,
            is_monospace: false,
            has_vertical_metrics: false,
            format: "TrueType".into(),
        }
    }

    #[test]
    fn test_metrics_from_font_info() {
        let info = test_font_info();
        let metrics = FontMetrics::from_font_info(&info, 12.0);

        assert_eq!(metrics.font_size, 12.0);
        assert!((metrics.ascent - 9.6).abs() < 0.01); // 800/1000 * 12
        assert!((metrics.descent - 2.4).abs() < 0.01); // 200/1000 * 12
        assert!((metrics.line_height - 12.0).abs() < 0.01); // 9.6 + 2.4 + 0
    }

    #[test]
    fn test_font_units_to_pixels() {
        let info = test_font_info();
        let metrics = FontMetrics::from_font_info(&info, 10.0);

        // scale = 10/1000 = 0.01
        assert!((metrics.font_units_to_pixels(500) - 5.0).abs() < 0.001);
        assert!((metrics.font_units_to_pixels_u(1000) - 10.0).abs() < 0.001);
    }

    #[test]
    fn test_estimate_text_width() {
        let info = test_font_info();
        let metrics = FontMetrics::from_font_info(&info, 12.0);

        let width = metrics.estimate_text_width(100);
        assert!(width > 0.0);
        assert!(width < 1200.0); // reasonable upper bound
    }

    #[test]
    fn test_monospace_metrics() {
        let info = FontInfo {
            is_monospace: true,
            units_per_em: 1000,
            ascender: 800,
            descender: -200,
            line_gap: 0,
            ..test_font_info()
        };
        let metrics = FontMetrics::from_font_info(&info, 12.0);
        assert!(metrics.avg_char_width > 0.0);
    }

    #[test]
    fn test_weight_to_css() {
        assert_eq!(weight_to_css(&FontWeight::NORMAL), "normal");
        assert_eq!(weight_to_css(&FontWeight::BOLD), "bold");
        assert_eq!(weight_to_css(&FontWeight::BLACK), "black");
    }

    #[test]
    fn test_style_to_css() {
        assert_eq!(style_to_css(FontStyle::Normal), "normal");
        assert_eq!(style_to_css(FontStyle::Italic), "italic");
        assert_eq!(style_to_css(FontStyle::Oblique), "oblique");
    }

    #[test]
    fn test_css_to_weight() {
        assert_eq!(css_to_weight("bold").0, 700);
        assert_eq!(css_to_weight("400").0, 400);
        assert_eq!(css_to_weight("normal").0, 400);
        assert_eq!(css_to_weight("unknown").0, 400); // default
    }

    #[test]
    fn test_underline_metrics() {
        let info = test_font_info();
        let metrics = FontMetrics::from_font_info(&info, 12.0);

        assert!(metrics.underline_position() < 0.0); // below baseline
        assert!(metrics.underline_thickness() > 0.0);
    }
}
