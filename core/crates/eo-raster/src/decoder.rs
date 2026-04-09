//! Image decoding.
//!
//! Decodes image bytes into RasterImage using the `image` crate.

use image::ImageReader;

use crate::model::{ColorSpace, ImageFormat, ImageInfo, RasterImage};

/// Image decoder — loads and decodes image files.
pub struct ImageDecoder;

impl ImageDecoder {
    /// Decode image bytes into a RasterImage.
    pub fn decode(data: &[u8]) -> Result<RasterImage, String> {
        let format = ImageFormat::from_magic(data);
        if format == ImageFormat::Unknown {
            // Try to let the `image` crate guess
        }

        let img = ImageReader::new(std::io::Cursor::new(data))
            .with_guessed_format()
            .map_err(|e| format!("Cannot detect image format: {}", e))?
            .decode()
            .map_err(|e| format!("Failed to decode image: {}", e))?;

        let rgba = img.to_rgba8();
        let (width, height) = rgba.dimensions();

        Ok(RasterImage::from_rgba_bytes(width, height, rgba.as_raw()))
    }

    /// Decode image and return metadata only (no pixel data).
    pub fn read_info(data: &[u8]) -> Result<ImageInfo, String> {
        let reader = ImageReader::new(std::io::Cursor::new(data))
            .with_guessed_format()
            .map_err(|e| format!("Cannot detect image format: {}", e))?;

        let format = match reader.format() {
            Some(image::ImageFormat::Png) => ImageFormat::Png,
            Some(image::ImageFormat::Jpeg) => ImageFormat::Jpeg,
            Some(image::ImageFormat::Tiff) => ImageFormat::Tiff,
            Some(image::ImageFormat::Gif) => ImageFormat::Gif,
            Some(image::ImageFormat::Bmp) => ImageFormat::Bmp,
            _ => ImageFormat::Unknown,
        };

        let into_reader = reader.into_inner();
        let img = ImageReader::new(std::io::Cursor::new(into_reader.into_inner()))
            .with_guessed_format()
            .ok()
            .and_then(|r| r.decode().ok());

        match img {
            Some(decoded) => {
                let color = decoded.color();
                let has_alpha = color.has_alpha();
                let channel_count = color.channel_count();
                let color_space = match (channel_count, has_alpha) {
                    (1, _) => ColorSpace::Grayscale,
                    (3, false) => ColorSpace::Rgb,
                    (4, true) => ColorSpace::Rgba,
                    (4, false) => ColorSpace::Cmyk,
                    _ => ColorSpace::Unknown,
                };

                Ok(ImageInfo {
                    width: decoded.width(),
                    height: decoded.height(),
                    format,
                    bit_depth: 8, // image crate normalizes to 8-bit
                    has_alpha,
                    color_space,
                })
            }
            None => Err("Failed to decode image for info".to_string()),
        }
    }

    /// Get the dimensions of an image without fully decoding it.
    pub fn dimensions(data: &[u8]) -> Result<(u32, u32), String> {
        let reader = ImageReader::new(std::io::Cursor::new(data))
            .with_guessed_format()
            .map_err(|e| format!("Cannot detect image format: {}", e))?;

        reader
            .into_dimensions()
            .map_err(|e| format!("Cannot read dimensions: {}", e))
    }

    /// Check if data is a supported image format.
    pub fn is_supported(data: &[u8]) -> bool {
        ImageFormat::from_magic(data) != ImageFormat::Unknown
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::RgbaImage;

    fn make_test_png() -> Vec<u8> {
        let img = RgbaImage::from_pixel(10, 10, image::Rgba([255, 0, 0, 255]));
        let mut buf = Vec::new();
        img.write_to(&mut std::io::Cursor::new(&mut buf), image::ImageFormat::Png)
            .unwrap();
        buf
    }

    #[test]
    fn test_decode_png() {
        use crate::model::Pixel;
        let data = make_test_png();
        let img = ImageDecoder::decode(&data).unwrap();
        assert_eq!(img.width, 10);
        assert_eq!(img.height, 10);
        assert_eq!(img.get_pixel(0, 0), Some(Pixel::rgb(255, 0, 0)));
    }

    #[test]
    fn test_is_supported() {
        let data = make_test_png();
        assert!(ImageDecoder::is_supported(&data));
        assert!(!ImageDecoder::is_supported(b"not an image"));
        assert!(!ImageDecoder::is_supported(b""));
    }

    #[test]
    fn test_dimensions() {
        let data = make_test_png();
        let (w, h) = ImageDecoder::dimensions(&data).unwrap();
        assert_eq!(w, 10);
        assert_eq!(h, 10);
    }

    #[test]
    fn test_rejects_invalid() {
        let result = ImageDecoder::decode(b"not an image");
        assert!(result.is_err());
    }

    #[test]
    fn test_read_info() {
        let data = make_test_png();
        let info = ImageDecoder::read_info(&data).unwrap();
        assert_eq!(info.width, 10);
        assert_eq!(info.height, 10);
        assert_eq!(info.format, ImageFormat::Png);
        assert!(info.has_alpha);
    }
}
