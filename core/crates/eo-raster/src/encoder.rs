//! Image encoding.
//!
//! Encodes RasterImage to various formats using the `image` crate.

use image::codecs::png::PngEncoder;
use image::ImageEncoder as _;

use crate::model::{ImageFormat, RasterImage};

/// Image encoder — writes RasterImage to bytes.
pub struct ImageEncoder;

impl ImageEncoder {
    /// Encode a RasterImage to the specified format.
    pub fn encode(img: &RasterImage, format: ImageFormat) -> Result<Vec<u8>, String> {
        let rgba = img.as_rgba_bytes();

        let mut buf = Vec::new();

        match format {
            ImageFormat::Png => {
                let encoder = PngEncoder::new(&mut buf);
                encoder
                    .write_image(
                        &rgba,
                        img.width,
                        img.height,
                        image::ExtendedColorType::Rgba8,
                    )
                    .map_err(|e| format!("PNG encoding failed: {}", e))?;
            }
            ImageFormat::Bmp => {
                let encoder = image::codecs::bmp::BmpEncoder::new(&mut buf);
                encoder
                    .write_image(
                        &rgba,
                        img.width,
                        img.height,
                        image::ExtendedColorType::Rgba8,
                    )
                    .map_err(|e| format!("BMP encoding failed: {}", e))?;
            }
            _ => {
                // Fallback: encode as PNG
                let encoder = PngEncoder::new(&mut buf);
                encoder
                    .write_image(
                        &rgba,
                        img.width,
                        img.height,
                        image::ExtendedColorType::Rgba8,
                    )
                    .map_err(|e| format!("Encoding failed: {}", e))?;
            }
        }

        Ok(buf)
    }

    /// Encode as PNG (convenience method).
    pub fn encode_png(img: &RasterImage) -> Result<Vec<u8>, String> {
        Self::encode(img, ImageFormat::Png)
    }

    /// Encode as BMP (convenience method).
    pub fn encode_bmp(img: &RasterImage) -> Result<Vec<u8>, String> {
        Self::encode(img, ImageFormat::Bmp)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Pixel;

    #[test]
    fn test_encode_png() {
        let img = RasterImage::new(10, 10, Pixel::rgb(255, 0, 0));
        let data = ImageEncoder::encode_png(&img).unwrap();

        // Should be a valid PNG
        assert!(data.len() > 8);
        assert_eq!(
            &data[..8],
            &[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
        );
    }

    #[test]
    fn test_encode_decode_roundtrip() {
        let original = RasterImage::new(8, 8, Pixel::rgb(42, 128, 255));
        let encoded = ImageEncoder::encode_png(&original).unwrap();
        let decoded = crate::decoder::ImageDecoder::decode(&encoded).unwrap();

        assert_eq!(decoded.width, 8);
        assert_eq!(decoded.height, 8);
        assert_eq!(decoded.get_pixel(0, 0), Some(Pixel::rgb(42, 128, 255)));
    }

    #[test]
    fn test_encode_bmp() {
        let img = RasterImage::new(4, 4, Pixel::WHITE);
        let data = ImageEncoder::encode_bmp(&img).unwrap();
        assert!(data.len() > 2);
        assert_eq!(&data[..2], b"BM");
    }

    #[test]
    fn test_encode_empty() {
        let img = RasterImage::blank(0, 0);
        let result = ImageEncoder::encode_png(&img);
        // Empty images may fail — just ensure no panic
        let _ = result;
    }
}
