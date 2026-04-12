// wo-unicode -- World-Office Unicode conversion engine
//!
//! Pure Rust text encoding conversion using encoding_rs.
//! Replaces the C++ UnicodeConverter (998 files, ICU C API wrappers).
//!
//! Supports conversion between 100+ character encodings and UTF-8/UTF-16,
//! including all Windows code pages, ISO-8859 series, KOI8, EUC-JP/CN/KR,
//! Shift-JIS, GB2312/GBK/GB18030, Big5, and more.

pub mod converter;
pub mod encoding;
pub mod normalizer;
pub mod roundtrip;

pub use converter::UnicodeConverter;
pub use encoding::{EncodingInfo, EncodingRegistry};
pub use roundtrip::UnicodeRoundtrip;

pub const FORMAT_NAME: &str = "unicode";
