// wo-hwp -- World-Office HWP (Hangul Word Processor) format engine
//!
//! HWP is a Korean document format (.hwp) used by Hangul Office / HWP.
//! It's a binary format with a file header, section structure,
//! and mixed text/OLE content.

pub mod model;
pub mod parser;
pub mod roundtrip;
pub mod serializer;

pub use model::HwpDocument;
pub use parser::HwpParser;
pub use serializer::HwpSerializer;

pub const FORMAT_NAME: &str = "hwp";

/// HWP magic bytes: "HWP Document File" in KS X 1001 encoding
/// In practice, HWP files start with specific signature bytes.
pub const HWP_SIGNATURE_5X: &[u8] = &[0xC7, 0xD1, 0xD6, 0xB8, 0xB4]; // "HWPDO" in EUC-KR
pub const HWP_SIGNATURE_3X: &[u8] = &[0x89, 0x48, 0x57, 0x50]; // HWP 3.x magic
pub const HWP_SIGNATURE_OLE: &[u8] = &[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]; // OLE compound doc

/// Check if data looks like an HWP file.
pub fn is_hwp_file(data: &[u8]) -> bool {
    if data.len() >= 8 && &data[..8] == HWP_SIGNATURE_OLE {
        return true;
    }
    if data.len() >= 5 && &data[..5] == HWP_SIGNATURE_5X {
        return true;
    }
    if data.len() >= 4 && &data[..4] == HWP_SIGNATURE_3X {
        return true;
    }
    false
}
