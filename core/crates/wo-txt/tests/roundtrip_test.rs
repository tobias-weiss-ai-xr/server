use std::path::PathBuf;

use wo_common::test_harness::{discover_tests, run_roundtrip};
use wo_txt::roundtrip::TxtRoundtrip;

#[test]
fn roundtrip_txt_corpus() {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let test_dir = manifest_dir
        .parent()
        .and_then(|p| p.parent())
        .and_then(|p| p.parent())
        .map(|p| p.join("tests/format-corpus/txt"))
        .expect("Failed to construct corpus path");

    let golden_dir = test_dir.clone();
    let tests = discover_tests("txt", &test_dir, Some(&golden_dir));
    assert!(!tests.is_empty(), "No test files found in corpus");
    for test in &tests {
        let result = run_roundtrip(test, TxtRoundtrip::new);
        assert!(
            result.passed,
            "Roundtrip failed for {}: {}",
            test.name, result.details
        );
    }
}
