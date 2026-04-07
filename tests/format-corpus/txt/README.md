# TXT Format Corpus

Plain text format — the simplest document format.

## Test Categories

| Category | Description | Count |
|----------|-------------|-------|
| simple | Basic ASCII text | 5+ |
| utf8 | Unicode/multilingual text | 5+ |
| latin1 | Western European encoding | 3+ |
| edge-cases | Empty files, very long lines, binary-like content | 5+ |
| large | Files > 1MB | 2+ |

## Naming Convention

`{category}-{description}.txt`

## Notes

- TXT is the reference format for testing the roundtrip harness
- Golden masters stored in `../golden-masters/txt/`
