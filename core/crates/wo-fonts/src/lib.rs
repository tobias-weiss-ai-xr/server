// wo-fonts -- World-Office font engine
//!
//! Pure Rust font loading, metrics, and glyph access.
//! Replaces the C++ DesktopEditor/fontengine module.
//!
//! Supports TrueType (.ttf), OpenType (.otf), WOFF, WOFF2,
//! and provides font metrics, glyph outlines, and basic shaping.

pub mod loader;
pub mod metrics;
pub mod model;

pub use loader::FontLoader;
pub use metrics::FontMetrics;
pub use model::{FontInfo, FontStyle, FontWeight, GlyphMetrics};

pub const FORMAT_NAME: &str = "fonts";
