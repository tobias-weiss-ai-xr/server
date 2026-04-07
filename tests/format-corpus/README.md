# Format Test Corpus

Collection of test documents for format roundtrip testing. Each format has its own subdirectory with categorized test files.

## Structure

```
format-corpus/
├── txt/         — Plain text (simplest, reference format)
├── fb2/         — FictionBook 2.0
├── html/        — HTML import/export
├── rtf/         — Rich Text Format
├── docx/        — Office Open XML (Word)
├── xlsx/        — Office Open XML (Excel)
├── pptx/        — Office Open XML (PowerPoint)
├── pdf/         — PDF documents
├── odt/         — OpenDocument Text
├── ods/         — OpenDocument Spreadsheet
├── odp/         — OpenDocument Presentation
├── csv/         — Comma-separated values
└── golden-masters/ — Expected output for roundtrip comparison
```

## Adding Test Files

1. Place file in the appropriate format subdirectory
2. Follow naming convention: `{category}-{description}.{ext}`
3. Categories: `simple`, `complex`, `edge-cases`, `corrupted`, `large`
4. For golden masters: place expected output in `golden-masters/{format}/`

## Target Counts

| Format | Simple | Complex | Edge Cases | Corrupted | Large | Total |
|--------|--------|---------|------------|-----------|-------|-------|
| txt | 5 | 3 | 5 | 2 | 2 | 17 |
| fb2 | 3 | 5 | 3 | 1 | 1 | 13 |
| html | 5 | 10 | 5 | 2 | 2 | 24 |
| rtf | 5 | 10 | 5 | 2 | 2 | 24 |
| docx | 10 | 20 | 10 | 5 | 5 | 50 |
| xlsx | 5 | 15 | 5 | 3 | 3 | 31 |
| pptx | 5 | 15 | 5 | 3 | 3 | 31 |
| pdf | 5 | 10 | 5 | 3 | 3 | 26 |
| odt | 5 | 10 | 5 | 2 | 2 | 24 |
| ods | 3 | 8 | 3 | 2 | 2 | 18 |
| odp | 3 | 8 | 3 | 2 | 2 | 18 |
| csv | 5 | 5 | 5 | 2 | 2 | 19 |
| **Total** | **59** | **119** | **59** | **27** | **27** | **295** |

## Roundtrip Test Harness

See `core/crates/eo-common/src/test_harness.rs` for the Rust roundtrip testing infrastructure.
