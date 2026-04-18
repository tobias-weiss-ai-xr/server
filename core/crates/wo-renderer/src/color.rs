//! Color and paint model.
//!
//! Defines colors, paint styles (fill/stroke), gradients, and stroke properties.

use serde::{Deserialize, Serialize};

/// RGBA color with f32 components (0.0–1.0).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

impl Color {
    pub const TRANSPARENT: Self = Self {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0,
    };
    pub const WHITE: Self = Self {
        r: 1.0,
        g: 1.0,
        b: 1.0,
        a: 1.0,
    };
    pub const BLACK: Self = Self {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 1.0,
    };
    pub const RED: Self = Self {
        r: 1.0,
        g: 0.0,
        b: 0.0,
        a: 1.0,
    };
    pub const GREEN: Self = Self {
        r: 0.0,
        g: 1.0,
        b: 0.0,
        a: 1.0,
    };
    pub const BLUE: Self = Self {
        r: 0.0,
        g: 0.0,
        b: 1.0,
        a: 1.0,
    };

    /// Create from RGBA (0.0–1.0).
    pub const fn new(r: f32, g: f32, b: f32, a: f32) -> Self {
        Self { r, g, b, a }
    }

    /// Create from RGB (alpha = 1.0).
    pub const fn rgb(r: f32, g: f32, b: f32) -> Self {
        Self { r, g, b, a: 1.0 }
    }

    /// Create from 8-bit RGBA values.
    pub fn from_u8(r: u8, g: u8, b: u8, a: u8) -> Self {
        Self {
            r: r as f32 / 255.0,
            g: g as f32 / 255.0,
            b: b as f32 / 255.0,
            a: a as f32 / 255.0,
        }
    }

    /// Convert to 8-bit RGBA.
    pub fn to_u8(&self) -> (u8, u8, u8, u8) {
        (
            (self.r.clamp(0.0, 1.0) * 255.0) as u8,
            (self.g.clamp(0.0, 1.0) * 255.0) as u8,
            (self.b.clamp(0.0, 1.0) * 255.0) as u8,
            (self.a.clamp(0.0, 1.0) * 255.0) as u8,
        )
    }

    /// Parse a CSS hex color string (e.g., "#FF0000", "#F00", "#FF000080").
    pub fn from_hex(hex: &str) -> Option<Self> {
        let hex = hex.trim_start_matches('#');
        let (r, g, b, a) = match hex.len() {
            3 => {
                let r = u8::from_str_radix(&hex[0..1].repeat(2), 16).ok()?;
                let g = u8::from_str_radix(&hex[1..2].repeat(2), 16).ok()?;
                let b = u8::from_str_radix(&hex[2..3].repeat(2), 16).ok()?;
                (r, g, b, 255)
            }
            6 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
                (r, g, b, 255)
            }
            8 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
                let a = u8::from_str_radix(&hex[6..8], 16).ok()?;
                (r, g, b, a)
            }
            _ => return None,
        };
        Some(Self::from_u8(r, g, b, a))
    }

    /// Blend two colors (simple alpha compositing).
    pub fn blend_over(&self, background: &Color) -> Color {
        if self.a <= 0.0 {
            return *background;
        }
        if self.a >= 1.0 {
            return *self;
        }
        let inv = 1.0 - self.a;
        Color {
            r: self.r * self.a + background.r * inv,
            g: self.g * self.a + background.g * inv,
            b: self.b * self.a + background.b * inv,
            a: 1.0,
        }
    }

    /// Get perceived luminance (0.0–1.0).
    pub fn luminance(&self) -> f32 {
        self.r * 0.299 + self.g * 0.587 + self.b * 0.114
    }
}

impl Default for Color {
    fn default() -> Self {
        Self::BLACK
    }
}

impl std::fmt::Display for Color {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let (r, g, b, a) = self.to_u8();
        if a == 255 {
            write!(f, "#{:02X}{:02X}{:02X}", r, g, b)
        } else {
            write!(f, "#{:02X}{:02X}{:02X}{:02X}", r, g, b, a)
        }
    }
}

/// Stroke style properties.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrokeStyle {
    pub line_width: f32,
    pub line_cap: LineCap,
    pub line_join: LineJoin,
    pub miter_limit: f32,
    pub dash_array: Vec<f32>,
    pub dash_offset: f32,
}

impl Default for StrokeStyle {
    fn default() -> Self {
        Self {
            line_width: 1.0,
            line_cap: LineCap::Butt,
            line_join: LineJoin::Miter,
            miter_limit: 10.0,
            dash_array: Vec::new(),
            dash_offset: 0.0,
        }
    }
}

/// Line cap style.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum LineCap {
    #[default]
    Butt,
    Round,
    Square,
}

/// Line join style.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum LineJoin {
    #[default]
    Miter,
    Round,
    Bevel,
}

/// Paint — describes how a shape is filled or stroked.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Paint {
    /// Solid color fill.
    Color(Color),
    /// No fill/stroke.
    None,
}

impl Default for Paint {
    fn default() -> Self {
        Paint::Color(Color::BLACK)
    }
}

impl From<Color> for Paint {
    fn from(c: Color) -> Self {
        Paint::Color(c)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_color_from_hex() {
        assert_eq!(Color::from_hex("#FF0000"), Some(Color::rgb(1.0, 0.0, 0.0)));
        assert_eq!(Color::from_hex("#F00"), Some(Color::rgb(1.0, 0.0, 0.0)));
        assert_eq!(
            Color::from_hex("#FF000080"),
            Some(Color::new(1.0, 0.0, 0.0, 128.0 / 255.0))
        );
        assert_eq!(Color::from_hex(""), None);
        assert_eq!(Color::from_hex("#GGG"), None);
    }

    #[test]
    fn test_color_display() {
        assert_eq!(Color::rgb(1.0, 0.0, 0.0).to_string(), "#FF0000");
        assert_eq!(Color::new(1.0, 0.0, 0.0, 0.5).to_string(), "#FF00007F");
    }

    #[test]
    fn test_color_u8_roundtrip() {
        let c = Color::from_u8(255, 128, 0, 200);
        let (r, g, b, a) = c.to_u8();
        assert_eq!(r, 255);
        assert_eq!(g, 128);
        assert_eq!(b, 0);
        assert_eq!(a, 200);
    }

    #[test]
    fn test_color_luminance() {
        assert!((Color::WHITE.luminance() - 1.0).abs() < 0.001);
        assert!((Color::BLACK.luminance()).abs() < 0.001);
    }

    #[test]
    fn test_color_blend() {
        let bg = Color::rgb(1.0, 1.0, 1.0);
        let fg = Color::new(1.0, 0.0, 0.0, 0.5);
        let blended = fg.blend_over(&bg);
        assert!((blended.r - 1.0).abs() < 0.01);
        assert!((blended.g - 0.5).abs() < 0.01);
        assert!((blended.b - 0.5).abs() < 0.01);
    }

    #[test]
    fn test_stroke_style_default() {
        let ss = StrokeStyle::default();
        assert!((ss.line_width - 1.0).abs() < 0.001);
        assert_eq!(ss.line_cap, LineCap::Butt);
        assert!(ss.dash_array.is_empty());
    }

    #[test]
    fn test_color_constants() {
        assert_eq!(Color::BLACK, Color::new(0.0, 0.0, 0.0, 1.0));
        assert_eq!(Color::WHITE, Color::new(1.0, 1.0, 1.0, 1.0));
        assert_eq!(Color::RED, Color::new(1.0, 0.0, 0.0, 1.0));
        assert_eq!(Color::GREEN, Color::new(0.0, 1.0, 0.0, 1.0));
        assert_eq!(Color::BLUE, Color::new(0.0, 0.0, 1.0, 1.0));
        assert_eq!(Color::TRANSPARENT, Color::new(0.0, 0.0, 0.0, 0.0));
    }

    #[test]
    fn test_color_blend_fully_transparent() {
        let bg = Color::rgb(0.5, 0.5, 0.5);
        let fg = Color::new(1.0, 0.0, 0.0, 0.0);
        let blended = fg.blend_over(&bg);
        assert_eq!(blended, bg);
    }

    #[test]
    fn test_color_blend_fully_opaque() {
        let bg = Color::rgb(0.5, 0.5, 0.5);
        let fg = Color::rgb(1.0, 0.0, 0.0);
        let blended = fg.blend_over(&bg);
        assert_eq!(blended, fg);
    }

    #[test]
    fn test_color_from_hex_invalid_lengths() {
        assert_eq!(Color::from_hex("#12"), None); // 2 chars
        assert_eq!(Color::from_hex("#12345"), None); // 5 chars
        assert_eq!(Color::from_hex("#1234567"), None); // 7 chars
        assert_eq!(Color::from_hex("#123456789"), None); // 9 chars
    }

    #[test]
    fn test_color_u8_clamping() {
        // Values out of 0-255 range are clamped
        let c = Color::from_u8(255, 255, 255, 255);
        assert_eq!(c.to_u8(), (255, 255, 255, 255));
    }

    #[test]
    fn test_paint_default() {
        let paint = Paint::default();
        assert_eq!(paint, Paint::Color(Color::BLACK));
    }

    #[test]
    fn test_paint_from_color() {
        let paint = Paint::from(Color::RED);
        assert_eq!(paint, Paint::Color(Color::RED));
    }
}
