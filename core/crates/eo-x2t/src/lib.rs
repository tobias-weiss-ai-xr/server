// eo-x2t -- World-Office format conversion orchestrator
//!
//! Routes conversion requests between format modules and manages
//! the conversion pipeline. Replaces the C++ X2tConverter (38 files).

pub mod model;
pub mod router;

pub use model::{ConversionInput, ConversionOutput, ConversionResult, ConversionStatus};
pub use router::ConversionRouter;

pub const FORMAT_NAME: &str = "x2t";
