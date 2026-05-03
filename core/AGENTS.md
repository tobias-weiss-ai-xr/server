# CORE

**Generated:** 2026-04-19
**Source:** codeberg.org/World-Office/server
**Files:** 164 | **License:** AGPL-3.0 | **Lines:** 54,887 Rust

## OVERVIEW

26 Rust crates for document format parsing, rendering, conversion, and protocol servers. The deepest dependency layer — services and WASM targets depend on these crates.

## STRUCTURE

```
core/
├── Cargo.toml              # Workspace group (resolver 2)
└── crates/
    ├── wo-common/           # Shared types, errors, test harness (FormatRoundtrip)
    ├── wo-x2t/              # Conversion orchestrator (27 converters, 8,954 lines)
    ├── wo-renderer/         # Canvas rendering engine (4,650 lines, 10 modules)
    ├── wo-ooxml/            # OOXML parser+serializer (2,954 lines)
    ├── wo-odf/              # OpenDocument parser+serializer (2,519 lines)
    ├── wo-fb2/              # FictionBook 2.0 parser+serializer (2,784 lines)
    ├── wo-docx-renderer/    # DOCX→PDF pipeline (2,004 lines)
    ├── wo-webdav/           # WebDAV server (axum, 2,119 lines)
    ├── wo-pdf/              # PDF read/write (2,014 lines) ⚠️ ICE in some rustc
    ├── wo-rtf/              # RTF parser+serializer (2,032 lines)
    ├── wo-msbinary/         # OLE compound document→JSON (1,817 lines)
    ├── wo-hwp/              # Korean HWP parser (1,454 lines)
    ├── wo-ofd/              # Chinese OFD parser (1,463 lines)
    ├── wo-xps/              # XPS parser (1,555 lines)
    ├── wo-html/             # HTML import/export (1,682 lines)
    ├── wo-unicode/          # Encoding conversion, ICU-backed (1,040 lines)
    ├── wo-wopi/             # WOPI protocol server (axum, 1,013 lines)
    ├── wo-fonts/            # Font loading, CSS matching (1,155 lines)
    ├── wo-djvu/             # DjVu parser (894 lines)
    ├── wo-txt/              # Plain text parser (882 lines)
    ├── wo-raster/           # Image encode/decode PNG/BMP (667 lines)
    ├── wo-renderer-wasm/    # Renderer→WASM (wasm-bindgen)
    ├── wo-x2t-wasm/         # Converter→WASM (wasm-bindgen)
    ├── wo-office-utils/     # ZIP/archive manipulation (439 lines)
    └── wo-docserver/        # Document server, proxies WOPI→OCIS (756 lines)
```

## WHERE TO LOOK

| Task | Crate | Notes |
|------|-------|-------|
| Add format parser | `wo-{format}/` | Implement `FormatRoundtrip` trait from wo-common |
| Format conversion | `wo-x2t/` | Orchestrates all converters, chain support |
| Canvas rendering | `wo-renderer/` | Text layout, gradients, transforms, paths |
| Font handling | `wo-fonts/` | Loading, caching, CSS-compliant matching |
| WOPI protocol | `wo-wopi/` | CheckFileInfo/GetFile/PutFile (axum) |
| WebDAV protocol | `wo-webdav/` | PROPFIND/MKCOL/PUT/DELETE/LOCK (axum) |
| DOCX→PDF pipeline | `wo-docx-renderer/` | Layout → render → PDF |
| WASM targets | `wo-x2t-wasm/`, `wo-renderer-wasm/ | wasm-bindgen, cannot use `cargo test` |

## CONVENTIONS

- Each parser crate: `src/parser.rs`, `src/serializer.rs`, `src/lib.rs`, `src/roundtrip.rs`
- `FormatRoundtrip` trait in `wo-common/test_harness.rs` — parse→serialize→compare golden master
- Test data in `tests/` subdirectory per crate, `discover_tests()` walks for fixtures
- All crates use `anyhow`/`thiserror` for errors, `serde` for serialization
- `wo-common` is the shared dependency — all other core crates depend on it

## ANTI-PATTERNS

- NEVER add format parsers without implementing `FormatRoundtrip` + roundtrip tests
- NEVER test WASM crates with `cargo test` — use `wasm-pack test` or browser runtime
- NEVER push without `cargo test -p wo-{changed-crate}`
- wo-pdf triggers rustc ICE — CI excludes it from clippy/check
- wo-webdav excluded from CI clippy/check (work in progress)

## NOTES

- All crates share workspace dependencies via root `Cargo.toml [workspace.dependencies]`
- Enterprise crates (`core-enterprise/`) share this workspace but under commercial license
- `wo-x2t` is the largest crate (8,954 lines) — the conversion orchestrator
- `wo-renderer` has the most modules (10) and test modules (8)
- Zero `unsafe` blocks across all core crates
