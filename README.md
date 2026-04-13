<p align="center">
  <img src="https://codeberg.org/World-Office/artwork/raw/branch/main/assets/banner.png" alt="World-Office Banner" width="600">
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

## What Is This

World-Office is a full rewrite of a C++ document editing suite into Rust + TypeScript. The repository contains **both** the legacy C++ codebase (reference implementation) and the new Rust crates (the rewrite target). Over time, the C++ code will be removed as Rust reaches parity.

## Rewrite Status

**Plan:** [full-rewrite-modernization.md](.sisyphus/plans/full-rewrite-modernization.md) · **10 of 11 phases complete (~90%).**

### ✅ Completed — Rust Replacements

| Legacy C++ | Rust Crate | Status | C++ → Rust |
|------------|-----------|--------|------------|
| `TxtFile/` (16 files) | `wo-txt` | ✅ Done | 16 → 1 |
| `Fb2File/` (7 files) | `wo-fb2` | ✅ Done | 7 → 1 |
| `HtmlFile/` (3 files) | `wo-html` | ✅ Done | 3 → 1 |
| `RtfFile/` (168 files) | `wo-rtf` | ✅ Done | 168 → 1 |
| `EpubFile/` (86 files) | `wo-epub` | ✅ Done | 86 → 1 |
| `HwpFile/` (165 files) | `wo-hwp` | ✅ Done | 165 → 1 |
| `DjVuFile/` (117 files) | `wo-djvu` | ✅ Done | 117 → 1 |
| `XpsFile/` (19 files) | `wo-xps` | ✅ Done | 19 → 1 |
| `OFDFile/` (58 files) | `wo-ofd` | ✅ Done | 58 → 1 |
| `PdfFile/` (205 files) | `wo-pdf` | ✅ Done | 205 → 1 |
| `OdfFile/` (841 files) | `wo-odf` | ✅ Done | 841 → 1 |
| `OOXML/` (3,387 files) | `wo-ooxml` | ✅ Done | 3,387 → 1 |
| `MsBinaryFile/` (2,954 files) | `wo-msbinary` | ✅ Done | 2,954 → 1 |
| `UnicodeConverter/` (937 files) | `wo-unicode` | ✅ Done | 937 → 1 |
| `OfficeUtils/` (44 files) | `wo-office-utils` | ✅ Done | 44 → 1 |
| `DocxRenderer/` (46 files) | `wo-docx-renderer` | ✅ Done | 46 → 1 |
| `X2tConverter/` | `wo-x2t` + `wo-wopi` | ✅ Done | — |
| — | `wo-renderer` | ✅ New | Canvas engine |
| — | `wo-fonts` | ✅ New | Font system |
| — | `wo-raster` | ✅ New | Image I/O |
| — | `wo-x2t-wasm` | ✅ New | WASM |
| — | `wo-renderer-wasm` | ✅ New | WASM |
| — | `wo-webdav` | ✅ New | WebDAV server |
| — | Tauri desktop shell | ✅ New | 10 modules |

**Total: 9,083 C++ files → 25 Rust crates (470+ tests).**

### 🚧 Still Uses Legacy C++ — Needs Porting

| Legacy C++ | Files | Description | Priority |
|------------|-------|-------------|----------|
| `DesktopEditor/` | ~5,000 | **Canvas engine, font engine, document rendering, graphics, XML, rasterizer, 3rd-party libs** — the largest remaining component | **Critical** |
| `Common/` | ~2,000 | Shared utility code, config system, plugin manager, networking, crypto primitives | High |
| `Common/3dParty/` | ~3,000 | Vendored C++ dependencies (boost, openssl, freetype, harfbuzz, icu, etc.) | Medium (replace with Rust crates) |
| `HtmlFile2/` | 22 | Second HTML parser (used for specific import paths) | Low |
| `OfficeCryptReader/` | 7 | Document encryption/decryption | Medium |

**Total remaining: ~10,000+ C++ files**, primarily the DesktopEditor canvas/rendering engine.

### 📋 Not Started

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 10 | Launch preparation (migration guide for C++ removal, beta, v1.0) | Not started |

## Architecture

```
core/
├── crates/              ← Rust workspace (25 crates, the rewrite)
│   ├── wo-*             Format parsers, renderer, fonts, WASM, protocols
│   └── Cargo.toml       Workspace root
│
├── DesktopEditor/       ← Legacy C++ (canvas engine, fonts, rendering)
├── X2tConverter/       ← Legacy C++ (format conversion orchestrator)
├── Common/              ← Legacy C++ (shared utilities, plugins, networking)
│   └── 3dParty/         ← Vendored C++ deps (boost, freetype, icu, etc.)
├── {TxtFile,...}/       ← Legacy C++ format parsers (being replaced)
│
├── desktop/tauri-poc/   ← Rust Tauri 2.0 desktop shell (10 modules)
├── services/             ← Rust microservices (8 stubs, Phase 1 partial)
├── integrations/         ← OpenCloud, Nextcloud, document-server-integration
├── apps/                 ← React 19 web applications
└── packages/             ← Shared TypeScript packages
```

## Test Coverage

```
470+ unit tests across the Rust workspace:

Format parsers:      287 tests (16 crates)
Rendering engine:     88 tests (wo-renderer)
Font system:          36 tests (wo-fonts)
Raster imaging:       22 tests (wo-raster)
Rendering pipeline:   25 tests (wo-docx-renderer)

Run:  cargo test --workspace --lib -- --test-threads=1
```

## Integrations

| Integration | Path | Description |
|-------------|------|-------------|
| OpenCloud | `integrations/opencloud/` | Docker-based document server deployment |
| Nextcloud | `integrations/nextcloud/` | PHP/JS Nextcloud app (OCA\WorldOffice) |
| Document Server | `integrations/document-server-integration/` | Examples in C#, Go, Java Spring, Node.js, PHP Laravel, Python, Ruby |

## Services

| Service | Path | Status |
|---------|------|--------|
| API Gateway | `services/api-gateway/` | Stub |
| Co-authoring | `services/coauthoring-service/` | Stub |
| Conversion | `services/conversion-service/` | Stub |
| Identity | `services/identity-service/` | Stub |
| Session | `services/session-service/` | Stub |
| Storage | `services/storage-service/` | Stub |
| Server | `services/server/` | Stub |
| Admin | `services/admin-panel/` | Stub |

## Quick Start

```sh
git clone https://codeberg.org/World-Office/server.git
cd server

# Build Rust core (the rewrite)
cargo build --workspace

# Run Rust tests
cargo test --workspace --lib -- --test-threads=1

# Frontend (React 19)
pnpm install
pnpm dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Uses conventional commits, requires tests for all code changes.

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities to world-office@graphwiz.ai.

## License

MIT
