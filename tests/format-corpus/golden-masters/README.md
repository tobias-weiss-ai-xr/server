# Golden Masters

Expected output files for roundtrip comparison.

After parsing and re-serializing a test document, the output is compared against the corresponding golden master in this directory.

## Structure

```
golden-masters/
├── txt/     — Expected TXT output
├── fb2/     — Expected FB2 output
├── html/    — Expected HTML output
└── ...      — One subdirectory per format
```

## Generating Golden Masters

Golden masters are generated from the C++ baseline (original codebase) to establish the reference output. During the Rust rewrite, roundtrip output must match these masters exactly.
