// eo-raster -- World-Office raster image engine
//!
//! Pure Rust image loading, decoding, and basic processing.
//! Replaces parts of the C++ DesktopEditor/graphics raster pipeline.
//!
//! Supports PNG, JPEG, TIFF, GIF, BMP via the `image` crate.
//! Provides image metadata, scaling, format conversion, and pixel access.

pub mod decoder;
pub mod encoder;
pub mod model;

pub use decoder::ImageDecoder;
pub use encoder::ImageEncoder;
pub use model::{ImageFormat, ImageInfo, Pixel, RasterImage};

pub const FORMAT_NAME: &str = "raster";
