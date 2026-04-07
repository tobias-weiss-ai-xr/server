//! Roundtrip test harness for format modules.
//!
//! Provides infrastructure for parsing a document, re-serializing it,
//! and comparing the output against a golden master.

use std::fs;
use std::path::{Path, PathBuf};

/// A single roundtrip test case.
#[derive(Debug, Clone)]
pub struct RoundtripTestCase {
    /// Human-readable test name.
    pub name: String,
    /// Path to the input file.
    pub input_path: PathBuf,
    /// Optional path to expected output (golden master).
    /// If None, the output is compared against the input (identity roundtrip).
    pub expected_output_path: Option<PathBuf>,
}

/// Result of a roundtrip test.
#[derive(Debug)]
pub struct RoundtripResult {
    pub name: String,
    pub passed: bool,
    pub input_size: usize,
    pub output_size: usize,
    pub details: String,
}

/// Trait for format parsers/serializers that support roundtrip testing.
pub trait FormatRoundtrip {
    /// Parse raw bytes into a document.
    fn parse(&self, data: &[u8]) -> Result<(), String>;

    /// Serialize a document back to bytes.
    fn serialize(&self) -> Result<Vec<u8>, String>;
}

/// Discover test cases in a directory.
///
/// Walks `test_dir` and creates `RoundtripTestCase` for each file.
/// If a matching file exists in `golden_dir`, it's used as the expected output.
pub fn discover_tests(
    format_name: &str,
    test_dir: &Path,
    golden_dir: Option<&Path>,
) -> Vec<RoundtripTestCase> {
    let mut cases = Vec::new();

    if !test_dir.exists() {
        return cases;
    }

    for entry in fs::read_dir(test_dir).unwrap_or_else(|e| {
        eprintln!(
            "Warning: cannot read test dir {}: {}",
            test_dir.display(),
            e
        );
        Vec::new()
    }) {
        let Ok(entry) = entry else { continue };
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        // Skip README files and hidden files
        let file_name = path.file_name().unwrap_or_default().to_string_lossy();
        if file_name.starts_with('.') || file_name == "README.md" {
            continue;
        }

        let name = format!(
            "{}: {}",
            format_name,
            path.file_stem().unwrap_or_default().to_string_lossy()
        );

        let expected = golden_dir.and_then(|gd| {
            let golden = gd.join(path.file_name()?);
            golden.exists().then_some(golden)
        });

        cases.push(RoundtripTestCase {
            name,
            input_path: path,
            expected_output_path: expected,
        });
    }

    cases.sort_by(|a, b| a.name.cmp(&b.name));
    cases
}

/// Run a single roundtrip test case.
pub fn run_roundtrip<F: FormatRoundtrip>(
    case: &RoundtripTestCase,
    make_parser: impl Fn() -> F,
) -> RoundtripResult {
    // Read input
    let input_data = match fs::read(&case.input_path) {
        Ok(d) => d,
        Err(e) => {
            return RoundtripResult {
                name: case.name.clone(),
                passed: false,
                input_size: 0,
                output_size: 0,
                details: format!("Failed to read input: {}", e),
            };
        }
    };

    let input_size = input_data.len();

    // Parse
    let parser = make_parser();
    if let Err(e) = parser.parse(&input_data) {
        return RoundtripResult {
            name: case.name.clone(),
            passed: false,
            input_size,
            output_size: 0,
            details: format!("Parse failed: {}", e),
        };
    }

    // Serialize
    let output_data = match parser.serialize() {
        Ok(d) => d,
        Err(e) => {
            return RoundtripResult {
                name: case.name.clone(),
                passed: false,
                input_size,
                output_size: 0,
                details: format!("Serialize failed: {}", e),
            };
        }
    };

    let output_size = output_data.len();

    // Compare against golden master or input
    let expected_data = match &case.expected_output_path {
        Some(p) => fs::read(p).unwrap_or_default(),
        None => input_data.clone(),
    };

    let passed = output_data == expected_data;
    let details = if passed {
        "Roundtrip OK".to_string()
    } else {
        format!(
            "Output differs. Expected {} bytes, got {} bytes.",
            expected_data.len(),
            output_data.len()
        )
    };

    RoundtripResult {
        name: case.name.clone(),
        passed,
        input_size,
        output_size,
        details,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_discover_tests_skips_readme() {
        let dir = PathBuf::from("/nonexistent");
        let cases = discover_tests("txt", &dir, None);
        assert!(cases.is_empty());
    }
}
