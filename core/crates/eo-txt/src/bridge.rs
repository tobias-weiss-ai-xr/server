// bridge.rs — cxx bridge definitions for eo-txt
//
// Defines the FFI boundary between Rust and the legacy C++ TxtFile class.
// This bridge will be REMOVED once the pure Rust implementation of eo-txt
// achieves 100% format parity with the C++ version.
//
// The C++ TxtFile class (core/TxtFile/Source/TxtFormat/TxtFile.h) provides:
//   - Encoding detection (ANSI, Unicode, UTF-8, Big Endian)
//   - Read operations returning vectors of lines
//   - Write operations accepting vectors of lines
//   - Line count queries

#[cxx::bridge]
mod ffi {
    // C++ types and functions exposed to Rust
    extern "C++" {
        include!("eo-txt/wrapper.h");

        type TxtFileWrapper;

        fn create_txt_file(path: &str) -> UniquePtr<TxtFileWrapper>;
        fn read_unicode_lines(self: &TxtFileWrapper) -> Vec<String>;
        fn read_utf8_lines(self: &TxtFileWrapper, code_page: i32) -> Vec<String>;
        fn write_utf8(self: &TxtFileWrapper, lines: &Vec<String>) -> bool;
        fn is_unicode(self: &TxtFileWrapper) -> bool;
        fn is_utf8(self: &TxtFileWrapper) -> bool;
        fn is_big_endian(self: &TxtFileWrapper) -> bool;
        fn get_lines_count(self: &TxtFileWrapper) -> i32;
    }
}

// Safe Rust wrapper around the cxx bridge
pub struct TxtFile {
    inner: cxx::UniquePtr<ffi::TxtFileWrapper>,
}

impl TxtFile {
    /// Open a text file with automatic encoding detection.
    ///
    /// The C++ TxtFile constructor detects the encoding (ANSI, Unicode UTF-16,
    /// UTF-8, Big Endian) from BOM and byte patterns.
    pub fn open(path: &std::path::Path) -> Result<Self, anyhow::Error> {
        let inner = ffi::create_txt_file(&path.to_string_lossy());
        if inner.is_null() {
            anyhow::bail!("Failed to open text file: {}", path.display());
        }
        Ok(Self { inner })
    }

    /// Read all lines as Unicode strings (auto-detected encoding).
    pub fn read_unicode_lines(&self) -> Vec<String> {
        self.inner.read_unicode_lines()
    }

    /// Read all lines as UTF-8 strings with explicit code page hint.
    pub fn read_utf8_lines(&self, code_page: i32) -> Vec<String> {
        self.inner.read_utf8_lines(code_page)
    }

    /// Write lines to file in UTF-8 encoding.
    pub fn write_utf8(&self, lines: &[String]) -> Result<(), anyhow::Error> {
        let lines_vec = lines.to_vec();
        if self.inner.write_utf8(&lines_vec) {
            Ok(())
        } else {
            anyhow::bail!("Failed to write UTF-8 text file");
        }
    }

    /// Check if the file was detected as Unicode (UTF-16 LE).
    pub fn is_unicode(&self) -> bool {
        self.inner.is_unicode()
    }

    /// Check if the file was detected as UTF-8.
    pub fn is_utf8(&self) -> bool {
        self.inner.is_utf8()
    }

    /// Check if the file was detected as Big Endian Unicode.
    pub fn is_big_endian(&self) -> bool {
        self.inner.is_big_endian()
    }

    /// Get the total number of lines in the file.
    pub fn line_count(&self) -> i32 {
        self.inner.get_lines_count()
    }
}
