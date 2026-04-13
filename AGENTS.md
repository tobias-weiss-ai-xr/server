# World-Office WORKSPACE

**Updated:** 2026-04-13
**Source:** codeberg.org/World-Office/server (independent project)
**License:** MIT
**Crate count:** 25 Rust crates + services + integrations

## OVERVIEW

World-Office — an independent, open-source document editing suite built from scratch in Rust + TypeScript. MIT licensed. The Rust core implements format parsing, rendering, conversion, WOPI/WebDAV protocols, desktop (Tauri), and WASM/browser targets.

## STRUCTURE

```
World-Office/
├── core/                          # Rust workspace root
│   └── crates/                    # 25 Rust crates (see below)
├── desktop/                       # Desktop applications
│   └── tauri-poc/                 # Tauri 2.0 desktop shell (10 modules)
├── services/                      # Rust microservices (8 services)
│   ├── api-gateway/               # Request routing
│   ├── coauthoring-service/       # Real-time collaboration
│   ├── conversion-service/        # Format conversion
│   ├── identity-service/          # Auth (JWT, OAuth2)
│   ├── session-service/           # Session management
│   ├── storage-service/           # File storage backend
│   ├── server/                    # Main document server
│   └── admin-panel/              # Admin dashboard
├── integrations/                  # Third-party integrations
│   ├── opencloud/                 # OpenCloud deployment (Node.js, EJS, Docker)
│   ├── nextcloud/                 # Nextcloud app (PHP, OCA\WorldOffice namespace)
│   └── document-server-integration/ # Multi-language examples (C#, Go, Java, Node.js, PHP, Python, Ruby)
├── apps/                          # React 19 web applications
├── packages/                      # Shared TypeScript packages
├── .github/                       # CI workflows (Rust lint/test, TS lint/typecheck/build)
└── .sisyphus/plans/               # Implementation plans
```

## RUST CRATES (core/crates/)

### Format Parsers (16 crates with FormatRoundtrip trait)
| Crate | Description | Tests |
|-------|-------------|-------|
| wo-common | Shared types, errors, test harness | — |
| wo-txt | Plain text parser | ~5 |
| wo-unicode | Encoding conversion (ICU wrapper) | 32 |
| wo-fb2 | FictionBook 2.0 parser → JSON | 13 |
| wo-html | HTML import/export | 3 |
| wo-rtf | Rich Text Format parser + serializer | 41 |
| wo-epub | EPUB parser (ZIP-based) | 11 |
| wo-hwp | Korean HWP format parser | 12 |
| wo-djvu | DjVu document parser | 8 |
| wo-xps | XPS document parser | 14 |
| wo-ofd | Chinese OFD document parser | 10 |
| wo-odf | OpenDocument format parser (ZIP+XML) | 15 |
| wo-pdf | PDF reading/writing | ~8 |
| wo-msbinary | OLE compound document parser → JSON | 29 |
| wo-ooxml | OOXML (DOCX/XLSX/PPTX) parser → JSON | 18 |
| wo-x2t | Format conversion orchestrator | 13 |

### Rendering & Fonts (3 crates)
| Crate | Description | Tests |
|-------|-------------|-------|
| wo-renderer | Canvas rendering engine (text layout, gradients, transforms) | 125 |
| wo-fonts | Font loading, caching, CSS-compliant matching | 36 |
| wo-raster | Image encode/decode (PNG, BMP) | 22 |

### WASM & Web (2 crates)
| Crate | Description |
|-------|-------------|
| wo-x2t-wasm | Format conversion compiled to WASM (wasm-bindgen) |
| wo-renderer-wasm | Canvas rendering compiled to WASM (Web Canvas bridge) |

### Desktop (1 crate)
| Crate | Description |
|-------|-------------|
| wo-docx-renderer | DOCX → PDF rendering pipeline |

### Infrastructure (3 crates)
| Crate | Description |
|-------|-------------|
| wo-office-utils | ZIP/archive manipulation, ArchiveWriter |
| wo-wopi | WOPI protocol server (axum, CheckFileInfo/GetFile/PutFile) |
| wo-webdav | WebDAV server (axum, PROPFIND/MKCOL/PUT/DELETE/LOCK) |

## TAURI DESKTOP (desktop/tauri-poc/)

10 Rust modules providing native desktop functionality:
- commands.rs — Document operations (new, open, save, zoom, fullscreen)
- menu.rs — Application menus (File/Edit/View/Help) using Tauri 2.0
- tray.rs — System tray with context menu
- window.rs — Multi-window management
- state.rs — AppState with recent files, window count
- filesystem.rs — 13 native filesystem commands (Rust ↔ JS bridge)
- print.rs — Print support (render, preview, page sizes)
- updater.rs — Auto-updater (Tauri updater plugin)
- keychain.rs — Credential storage (keyring crate)
- window.rs — Window helpers

## BUILD SYSTEMS

| Component | Build | Command |
|-----------|-------|---------|
| Rust core | Cargo | `cargo build --workspace` |
| Rust tests | Cargo | `cargo test --workspace --lib -- --test-threads=1` |
| Rust lint | Clippy | `cargo clippy --workspace` |
| Tauri desktop | Cargo + npm | `cd desktop/tauri-poc && cargo tauri dev` |
| Web frontend | pnpm | `pnpm install && pnpm dev` |
| CI | GitHub Actions/Forgejo | `.github/workflows/ci.yml` |

## CODE STYLE

- **Rust**: `cargo fmt` + `cargo clippy` — follow existing patterns
- **TypeScript**: ESLint 9 + Prettier
- **Commits**: Conventional commits (feat:, fix:, docs:, test:, refactor:)
- Tests required for all code changes

## WINDOWS DEVELOPMENT

### WSL Workaround for dlltool Issue

Windows builds may fail with `error: calling dlltool 'dlltool.exe': program not found` when compiling windows-sys crates.

**Solution:** Use WSL to run Rust tests and builds:

```bash
# Run specific crate tests via WSL
wsl bash -c "cd /mnt/c/Users/Tobias/git/World-Office && ~/.cargo/bin/cargo test -p wo-html -p wo-rtf"

# Run full workspace tests via WSL
wsl bash -c "cd /mnt/c/Users/Tobias/git/World-Office && ~/.cargo/bin/cargo test --workspace"
```

### Known Issue: wo-pdf ICE

The wo-pdf crate triggers a Rust compiler ICE (Internal Compiler Error) in rustc 1.94.1. Skip wo-pdf tests until fixed upstream.

## ANTI-PATTERNS

- NEVER push to main without running `cargo test` on changed crates
- NEVER add new Rust dependencies without checking they compile on Windows (wasm-bindgen crates can be tricky)
- NEVER modify web-apps/deploy/ without running `pnpm build`
- The WOPI server (wo-wopi) requires access tokens — don't expose endpoints without auth
- WASM crates (wo-x2t-wasm, wo-renderer-wasm) cannot be tested with standard `cargo test` — they need wasm-pack or a browser runtime
