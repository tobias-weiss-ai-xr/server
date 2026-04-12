// wo-renderer -- World-Office rendering engine
//!
//! Pure Rust 2D rendering engine for document visualization.
//! Replaces the C++ DesktopEditor/graphics canvas.
//!
//! Provides a canvas API with drawing primitives (paths, rectangles,
//! ellipses, text), color management, transforms, and compositing.

pub mod canvas;
pub mod color;
pub mod gradient;
pub mod model;
pub mod path;
pub mod text;
pub mod transform;

pub use canvas::Canvas;
pub use color::{Color, Paint, StrokeStyle};
pub use gradient::Gradient;
pub use model::{BlendMode, Page, RenderResult};
pub use path::{FillRule, PathBuilder};
pub use text::TextLayoutEngine;
pub use transform::{AffineTransform, TransformStack};

pub const FORMAT_NAME: &str = "renderer";
