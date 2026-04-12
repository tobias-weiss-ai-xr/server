use wo_common::test_harness::discover_tests;
use wo_rtf::{RtfParser, RtfSerializer};

#[test]
fn roundtrip_rtf_corpus() {
    let corpus = std::path::Path::new("../../tests/format-corpus/rtf");
    let tests = discover_tests("rtf", corpus, None);
    if tests.is_empty() {
        return; // No corpus files yet
    }
    for test in &tests {
        // Test that parse-serialize-parse cycle works
        let input_data = std::fs::read(&test.input_path).unwrap();

        // First roundtrip: parse and serialize
        let parser = RtfParser::new();
        let doc1 = parser.parse(&input_data).expect("First parse failed");
        let serializer = RtfSerializer::new();
        let output1 = serializer.serialize(&doc1);

        // Second roundtrip: parse the output again
        let doc2 = parser
            .parse(output1.as_bytes())
            .expect("Second parse failed");
        let _ = serializer.serialize(&doc2);
    }
}
