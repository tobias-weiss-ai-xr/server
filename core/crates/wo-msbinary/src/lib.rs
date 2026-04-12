// wo-msbinary -- World-Office legacy binary format engine
//!
//! Pure Rust implementation of legacy Microsoft binary format parsers:
//! .doc (Word Binary), .xls (BIFF), .ppt (OLE compound).
//!
//! Replaces the C++ MsBinaryFile module (2,954 files).

pub mod detector;
pub mod model;
pub mod ole;
pub mod roundtrip;

pub use detector::detect_binary_format;
pub use model::{BinaryFormat, MsBinaryDocument};
pub use ole::OleCompoundDoc;
pub use roundtrip::MsbinaryRoundtrip;

pub const FORMAT_NAME: &str = "msbinary";
