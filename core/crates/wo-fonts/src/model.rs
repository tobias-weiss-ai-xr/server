//! Font data model.
//!
//! Core types representing font metadata, styles, weights,
//! and glyph-level information.

use serde::{Deserialize, Serialize};

/// Font style (italic, oblique, normal).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum FontStyle {
    #[default]
    Normal,
    Italic,
    Oblique,
}

/// Font weight (100–900, matching CSS font-weight).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct FontWeight(pub u16);

impl FontWeight {
    pub const THIN: Self = Self(100);
    pub const EXTRA_LIGHT: Self = Self(200);
    pub const LIGHT: Self = Self(300);
    pub const NORMAL: Self = Self(400);
    pub const MEDIUM: Self = Self(500);
    pub const SEMI_BOLD: Self = Self(600);
    pub const BOLD: Self = Self(700);
    pub const EXTRA_BOLD: Self = Self(800);
    pub const BLACK: Self = Self(900);

    /// Get the numeric weight value.
    pub fn value(&self) -> u16 {
        self.0
    }

    /// Check if this weight is bold (>= 700).
    pub fn is_bold(&self) -> bool {
        self.0 >= 700
    }
}

impl Default for FontWeight {
    fn default() -> Self {
        Self::NORMAL
    }
}

impl std::fmt::Display for FontWeight {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Information about a loaded font face.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FontInfo {
    /// PostScript or full font name.
    pub family: String,
    /// Specific face name (e.g., "Regular", "Bold Italic").
    pub face_name: String,
    /// Font style.
    pub style: FontStyle,
    /// Font weight.
    pub weight: FontWeight,
    /// Units per em (typical: 1000 or 2048).
    pub units_per_em: u16,
    /// Ascender in font units.
    pub ascender: i16,
    /// Descender in font units (negative).
    pub descender: i16,
    /// Line gap in font units.
    pub line_gap: i16,
    /// Number of glyphs in the font.
    pub num_glyphs: u16,
    /// Whether the font is monospaced.
    pub is_monospace: bool,
    /// Whether the font has vertical metrics.
    pub has_vertical_metrics: bool,
    /// Format: "TrueType", "OpenType/CFF", "WOFF", "WOFF2".
    pub format: String,
}

/// Metrics for a single glyph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlyphMetrics {
    /// Glyph index.
    pub glyph_id: u16,
    /// Horizontal advance width in font units.
    pub advance_width: u16,
    /// Left side bearing in font units.
    pub lsb: i16,
    /// Glyph bounding box: x_min.
    pub bbox_x_min: i16,
    /// Glyph bounding box: y_min.
    pub bbox_y_min: i16,
    /// Glyph bounding box: x_max.
    pub bbox_x_max: i16,
    /// Glyph bounding box: y_max.
    pub bbox_y_max: i16,
    /// Whether the glyph has a defined outline.
    pub has_outline: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_font_weight_defaults() {
        assert_eq!(FontWeight::NORMAL.0, 400);
        assert_eq!(FontWeight::BOLD.0, 700);
        assert!(FontWeight::BOLD.is_bold());
        assert!(!FontWeight::NORMAL.is_bold());
    }

    #[test]
    fn test_font_weight_display() {
        assert_eq!(FontWeight::BOLD.to_string(), "700");
    }

    #[test]
    fn test_font_style_default() {
        assert_eq!(FontStyle::default(), FontStyle::Normal);
    }

    #[test]
    fn test_font_info_creation() {
        let info = FontInfo {
            family: "Test".into(),
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
        };
        assert_eq!(info.family, "Test");
        assert!(!info.weight.is_bold());
    }

    #[test]
    fn test_glyph_metrics() {
        let gm = GlyphMetrics {
            glyph_id: 0,
            advance_width: 500,
            lsb: 10,
            bbox_x_min: 10,
            bbox_y_min: -50,
            bbox_x_max: 490,
            bbox_y_max: 750,
            has_outline: true,
        };
        assert_eq!(gm.advance_width, 500);
        assert!(gm.has_outline);
    }
}
