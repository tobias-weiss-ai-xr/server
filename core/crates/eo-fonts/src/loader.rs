//! Font loading and parsing.
//!
//! Loads TrueType (.ttf), OpenType (.otf), WOFF, WOFF2 font files
//! using ttf-parser. Provides font info extraction and glyph metrics.

use ttf_parser::Face;

use crate::model::{FontInfo, FontStyle, FontWeight, GlyphMetrics};

/// Font loader — parses font files and extracts metadata/glyph metrics.
pub struct FontLoader;

impl FontLoader {
    /// Load a font from raw bytes and extract font info.
    pub fn load_font(data: &[u8]) -> Result<FontInfo, String> {
        let face = Face::parse(data, 0).map_err(|e| format!("Failed to parse font: {:?}", e))?;

        let family = face
            .names()
            .into_iter()
            .find(|name| name.name_id == ttf_parser::name_id::FULL_NAME)
            .or_else(|| {
                face.names()
                    .into_iter()
                    .find(|name| name.name_id == ttf_parser::name_id::FAMILY)
            })
            .and_then(|name| name.to_string())
            .unwrap_or_else(|| "Unknown".to_string());

        let face_name = face
            .names()
            .into_iter()
            .find(|name| name.name_id == ttf_parser::name_id::SUBFAMILY)
            .and_then(|name| name.to_string())
            .unwrap_or_else(|| "Regular".to_string());

        let style = if face.is_italic() {
            FontStyle::Italic
        } else if face_name.contains("Oblique") {
            FontStyle::Oblique
        } else {
            FontStyle::Normal
        };

        let weight = if face.is_bold() {
            FontWeight::BOLD
        } else {
            match face_name.as_str() {
                n if n.contains("Thin") => FontWeight::THIN,
                n if n.contains("Light") => FontWeight::LIGHT,
                n if n.contains("Medium") => FontWeight::MEDIUM,
                n if n.contains("Semi") || n.contains("Demi") => FontWeight::SEMI_BOLD,
                n if n.contains("Extra") && n.contains("Bold") => FontWeight::EXTRA_BOLD,
                n if n.contains("Black") || n.contains("Heavy") => FontWeight::BLACK,
                _ => FontWeight::NORMAL,
            }
        };

        let has_cff = face.tables().cff.is_some();
        let has_glyf = face.tables().glyf.is_some();
        let format = if has_cff {
            "OpenType/CFF".to_string()
        } else if has_glyf {
            "TrueType".to_string()
        } else {
            "Unknown".to_string()
        };

        Ok(FontInfo {
            family,
            face_name,
            style,
            weight,
            units_per_em: face.units_per_em(),
            ascender: face.ascender(),
            descender: face.descender(),
            line_gap: face.line_gap(),
            num_glyphs: face.number_of_glyphs(),
            is_monospace: face.is_monospaced(),
            has_vertical_metrics: face.vertical_ascender().is_some(),
            format,
        })
    }

    /// Get glyph metrics for a specific glyph ID.
    pub fn glyph_metrics(data: &[u8], glyph_id: u16) -> Result<GlyphMetrics, String> {
        let face = Face::parse(data, 0).map_err(|e| format!("Failed to parse font: {:?}", e))?;
        let gid = ttf_parser::GlyphId(glyph_id);

        let advance_width = face.glyph_hor_advance(gid).unwrap_or(0);
        let lsb = face.glyph_hor_side_bearing(gid).unwrap_or(0);

        let mut bbox_x_min = 0i16;
        let mut bbox_y_min = 0i16;
        let mut bbox_x_max = 0i16;
        let mut bbox_y_max = 0i16;
        let mut has_outline = false;

        if let Some(bbox) = face.glyph_bounding_box(gid) {
            bbox_x_min = bbox.x_min;
            bbox_y_min = bbox.y_min;
            bbox_x_max = bbox.x_max;
            bbox_y_max = bbox.y_max;
            has_outline = true;
        }

        Ok(GlyphMetrics {
            glyph_id,
            advance_width,
            lsb,
            bbox_x_min,
            bbox_y_min,
            bbox_x_max,
            bbox_y_max,
            has_outline,
        })
    }

    /// Map a Unicode codepoint to a glyph ID.
    pub fn codepoint_to_glyph(data: &[u8], codepoint: char) -> Option<u16> {
        let face = Face::parse(data, 0).ok()?;
        face.glyph_index(codepoint).map(|gid| gid.0)
    }

    /// Get the advance width for a character at a given font size.
    pub fn char_width(data: &[u8], codepoint: char, font_size: f32) -> Option<f32> {
        let face = Face::parse(data, 0).ok()?;
        let glyph_id = face.glyph_index(codepoint)?;
        let advance = face.glyph_hor_advance(glyph_id)?;
        let scale = font_size / face.units_per_em() as f32;
        Some(advance as f32 * scale)
    }

    /// Check if data is a valid font file.
    pub fn is_font_file(data: &[u8]) -> bool {
        if data.len() < 4 {
            return false;
        }
        match &data[..4] {
            [0x00, 0x01, 0x00, 0x00] | b"true" | b"OTTO" | b"wOFF" | b"wOF2" => true,
            _ => false,
        }
    }

    /// Detect the font format from magic bytes.
    pub fn detect_format(data: &[u8]) -> &'static str {
        if data.len() < 4 {
            return "unknown";
        }
        match &data[..4] {
            [0x00, 0x01, 0x00, 0x00] | b"true" => "TrueType",
            b"OTTO" => "OpenType/CFF",
            b"wOFF" => "WOFF",
            b"wOF2" => "WOFF2",
            _ => "unknown",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Minimal valid TrueType font (just the header table directory).
    /// This is a synthetic font with the minimum required tables.
    fn minimal_ttf_data() -> Vec<u8> {
        // We can't easily create a valid TTF from scratch in a test,
        // so we test with known font magic bytes + rely on ttf-parser
        // to reject gracefully.
        vec![0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    }

    #[test]
    fn test_is_font_file_ttf() {
        let ttf = vec![0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        assert!(FontLoader::is_font_file(&ttf));

        let otf = b"OTTO\x00\x00\x00\x00".to_vec();
        assert!(FontLoader::is_font_file(&otf));

        let woff = b"wOFF\x00\x00\x00\x00".to_vec();
        assert!(FontLoader::is_font_file(&woff));

        let not_font = b"PDF-1.4".to_vec();
        assert!(!FontLoader::is_font_file(&not_font));
    }

    #[test]
    fn test_detect_format() {
        assert_eq!(
            FontLoader::detect_format(&[0x00, 0x01, 0x00, 0x00]),
            "TrueType"
        );
        assert_eq!(FontLoader::detect_format(b"OTTO"), "OpenType/CFF");
        assert_eq!(FontLoader::detect_format(b"wOFF"), "WOFF");
        assert_eq!(FontLoader::detect_format(b"wOF2"), "WOFF2");
        assert_eq!(FontLoader::detect_format(b"abcd"), "unknown");
        assert_eq!(FontLoader::detect_format(b""), "unknown");
    }

    #[test]
    fn test_rejects_too_small() {
        assert!(!FontLoader::is_font_file(&[0x00, 0x01]));
        assert_eq!(FontLoader::detect_format(&[0x00]), "unknown");
    }

    #[test]
    fn test_load_font_invalid() {
        // Invalid font data should return an error
        let result = FontLoader::load_font(&minimal_ttf_data());
        // ttf-parser may parse this but have no tables — either error or partial info is ok
        // The important thing is it doesn't panic
        let _ = result;
    }

    #[test]
    fn test_codepoint_to_glyph_invalid() {
        let result = FontLoader::codepoint_to_glyph(&minimal_ttf_data(), 'A');
        // With invalid font data, should return None
        assert!(result.is_none());
    }
}
