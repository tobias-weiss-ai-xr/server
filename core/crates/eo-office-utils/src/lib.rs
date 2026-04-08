// eo-office-utils -- World-Office shared archive and office utilities
//!
//! Provides ZIP archive reading/writing, office file type detection,
//! and common utilities used across all ZIP-based format crates
//! (EPUB, DOCX, ODF, XLSX, XPS, etc.).

pub mod archive;
pub mod detect;

pub use archive::{ArchiveEntry, ArchiveReader, ArchiveWriter};
pub use detect::{detect_office_format, OfficeFormat};
