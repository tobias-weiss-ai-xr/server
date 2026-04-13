<p align="center">
  <img src="assets/artwork/assets/banner.png" alt="World-Office Banner" width="600">
</p>

<h1 align="center">World-Office</h1>

<p align="center">
  <strong>Independent, open-source document editing suite.</strong><br>
  Built from scratch in Rust and TypeScript.
</p>

<p align="center">
  <a href="https://codeberg.org/World-Office/server">Repository</a> ·
  <a href="https://codeberg.org/World-Office">Organization</a> ·
  <a href="CODE_OF_CONDUCT.md">Code of Conduct</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="SECURITY.md">Security</a>
</p>

---

## Implementation Status

Based on the [full-rewrite-modernization plan](.sisyphus/plans/full-rewrite-modernization.md) (180 weeks, 11 phases).

**Current phase: 8 of 11 completed (estimated ~55% overall progress).**

| Phase | Description | Weeks | Status |
|-------|-------------|-------|--------|
| Phase 0 | Foundation (monorepo, tooling, discovery) | 1-8 | Partial |
| Phase 1 | Server to microservices (Axum, Rust) | 9-28 | Not started |
| Phase 2 | Core: Small format parsers (8 crates) | 9-14 | Done |
| Phase 3 | Core: Medium format parsers (ODF, DOCX renderer) | 15-30 | Done |
| Phase 4 | Web UI rewrite (React 19 migration) | 25-52 | Done |
| Phase 5 | Core: Large format parsers (OOXML, MSBinary, etc.) | 31-60 | Done |
| Phase 6 | Core: Rendering engine (canvas, fonts, raster) | 61-84 | Done |
| Phase 7 | Desktop Tauri shell (menus, tray, native bridge) | 69-88 | Done |
| Phase 8 | WASM + Offline (browser format conversion, rendering) | 89-108 | Done |
| Phase 9 | Integrations (WOPI, WebDAV) | 109-132 | Done |
| Phase 10 | Launch preparation (migration guide, beta, v1.0) | 133-180 | Not started |

## Architecture

```
core/crates/           Rust workspace (25 crates)
  wo-common            Shared types, errors, test harness
  wo-txt               Plain text parser
  wo-fb2               FictionBook 2.0 parser
  wo-html              HTML import/export
  wo-rtf               Rich Text Format parser + serializer
  wo-epub              EPUB parser (ZIP-based)
  wo-hwp               Korean HWP format parser
  wo-djvu              DjVu document parser
  wo-xps               XPS document parser
  wo-ofd               Chinese OFD document parser
  wo-odf               OpenDocument format parser
  wo-pdf               PDF reading/writing
  wo-unicode           Encoding conversion (ICU wrapper)
  wo-msbinary          OLE compound document parser
  wo-ooxml             OOXML (DOCX/XLSX/PPTX) parser
  wo-x2t               Format conversion orchestrator
  wo-docx-renderer     DOCX to PDF rendering pipeline
  wo-renderer          Canvas rendering engine
  wo-fonts             Font loading, caching, metrics
  wo-raster            Image encode/decode (PNG, BMP)
  wo-office-utils      ZIP/archive manipulation
  wo-x2t-wasm          Format conversion compiled to WASM
  wo-renderer-wasm      Canvas rendering compiled to WASM
  wo-wopi              WOPI protocol server (axum)
  wo-webdav            WebDAV server (axum)

desktop/tauri-poc/     Tauri 2.0 desktop shell
  src-tauri/src/       10 Rust modules (commands, menus, tray, fs, print, updater, keychain, window)
```

## Test Coverage

```
433+ unit tests across the Rust workspace:

Format parsers:      287 tests (16 crates)
Rendering engine:     88 tests (wo-renderer)
Font system:          36 tests (wo-fonts)
Raster imaging:       22 tests (wo-raster)

Run:  cargo test --workspace --lib -- --test-threads=1
```

## Quick Start

```sh
# Clone
git clone https://codeberg.org/World-Office/server.git
cd server

# Build Rust core
cargo build --workspace

# Run tests
cargo test --workspace --lib

# Frontend (not yet migrated to workspace)
pnpm install
pnpm dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Uses conventional commits, requires tests for all changes.

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities to world-office@graphwiz.ai.

## License

MIT
