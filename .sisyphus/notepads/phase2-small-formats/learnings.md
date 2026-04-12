# FormatRoundtrip Implementation for Parse-Only Crates

## Date: 2026-04-12

## Task
Implement \FormatRoundtrip\ trait for wo-fb2, wo-epub and wo-hwp (parse-only crates).

## Implementation Pattern

For parse-only crates (no format-specific serializer), use JSON serialization as the roundtrip target:

\\\ust
impl FormatRoundtrip for XxxRoundtrip {
    fn parse(&self, data: &[u8]) -> Result<(), String> {
        let parser = XxxParser::new();
        let doc = parser.parse(data).map_err(|e| format!(\
e
\))?;
        *self.doc.borrow_mut() = Some(doc);
        Ok(())
    }

    fn serialize(&self) -> Result<Vec<u8>, String> {
        let doc = self.doc.borrow();
        let doc = doc.as_ref().ok_or(\No
document
parsed\)?;
        serde_json::to_vec_pretty(doc).map_err(|e| format!(\JSON
serialize
failed:
e
\))
    }
}
\\\

### Key Points

1. **Use \RefCell<Option<Document>>\**: Required because \FormatRoundtrip::parse\ takes \&self\ (no \&mut self\)

2. **Error handling**: Convert \Result<T, CoreError>\ to \Result<(), String>\ using \.map_err(|e| format!(\
e
\))\

3. **JSON pretty printing**: Use \serde_json::to_vec_pretty()\ for readable output (useful for debugging)

4. **Dependency addition**: All three crates needed \serde_json = \1\\ added to Cargo.toml

## Testing Strategy

Since these formats require complex binary/XML files for corpus testing:

### Minimal Valid Input

Each roundtrip.rs includes inline unit tests that build minimal valid input:

- **wo-fb2**: Minimal XML with \<FictionBook>\ root, \<description>\, and \<body>\
- **wo-epub**: Uses \ArchiveWriter\ to build a valid EPUB ZIP with mimetype, container.xml, OPF, and XHTML chapter
- **wo-hwp**: Builds a minimal HWP 5.x file with signature, version flags, and doc info record

### Test Verification

All tests verify:
1. Parse succeeds on minimal valid input
2. Serialize succeeds (produces valid JSON)
3. JSON output contains expected structure (version, metadata, etc.)

## Challenges

### wo-epub Complexity

EPUB requires ZIP container structure. Test helper uses \wo_office_utils::ArchiveWriter\ to build:
- mimetype file (stored, not compressed)
- META-INF/container.xml
- OEBPS/content.opf
- OEBPS/chapter1.xhtml

This requires careful structuring of ZIP entries and uses \CompressionMethod::Stored\ for mimetype (EPUB spec requirement).

### wo-hwp Binary Format

HWP 5.x uses specific structure:
- 5-byte signature (EUC-KR \HWPDO\)
- 23 bytes padding
- 2 bytes version flags (bits: compression, encryption, summary, etc.)
- 2 bytes version (major, minor)
- Padding to 256 bytes
- Doc info record (ID 0x0001, size, tagged UTF-16LE strings)

Test builds a minimal 268-byte file to verify parser and roundtrip.

## Results

All tests pass:
- wo-fb2: 13 tests passed
- wo-epub: 11 tests passed
- wo-hwp: 12 tests passed
- Total: 36 tests passed

## Files Modified

1. \core/crates/wo-fb2/Cargo.toml\ - Added \serde_json = \1\\
2. \core/crates/wo-fb2/src/roundtrip.rs\ - Created new file (107 lines)
3. \core/crates/wo-fb2/src/lib.rs\ - Added \pub mod roundtrip;\
4. \core/crates/wo-epub/Cargo.toml\ - Added \serde_json = \1\\
5. \core/crates/wo-epub/src/roundtrip.rs\ - Created new file (150 lines)
6. \core/crates/wo-epub/src/lib.rs\ - Added \pub mod roundtrip;\
7. \core/crates/wo-hwp/Cargo.toml\ - Added \serde_json = \1\\
8. \core/crates/wo-hwp/src/roundtrip.rs\ - Created new file (133 lines)
9. \core/crates/wo-hwp/src/lib.rs\ - Added \pub mod roundtrip;\

## Notes

- All models already derive \serde::Serialize\, so JSON serialization works seamlessly
- Pattern is consistent with \wo-txt/src/roundtrip.rs\ reference implementation
- Future work could add corpus files for more comprehensive roundtrip testing

