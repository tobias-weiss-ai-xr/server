# Learnings

## 2026-04-17 Session Start
- Workspace baseline: 767 tests, 0 failures, nightly toolchain, edition 2024
- All cargo commands must run via WSL: `wsl bash -c "cd /mnt/c/Users/Tobias/git/World-Office && ~/.cargo/bin/cargo ..."`
- wo-pdf has known ICE on nightly — skip entirely
- React apps are at `apps/web/apps/` (extra nesting level, not `apps/web/`)
- Two Cargo.toml files: root (services deps) + core/ (parser deps)
- Rectangle glyph hack in TWO locations: wo-docx-renderer pipeline.rs + wo-renderer-wasm canvas_bridge.rs
- All 5 SQLite services use identical `Arc<Mutex<HashMap<String, T>>>` pattern

## 2026-04-17 storage-service SQLite Migration
- Created `repository.rs` module with `StorageRepository` struct wrapping `rusqlite::Connection`
- Table schema: `files(id TEXT PK, name TEXT, content_type TEXT, size INTEGER, path TEXT, created_at TEXT, updated_at TEXT)`
- `StorageRepository` methods: `new_in_memory()`, `new(path)`, `init_table()`, `insert()`, `get()`, `list()`, `delete()`
- `AppState.files: Arc<Mutex<HashMap>>` → `AppState.repo: Arc<Mutex<StorageRepository>>`
- `delete()` needs `&mut self` — must use separate lock scope from read operations
- `list_files` return type changed from `Json<>` to `Result<Json<>, Err>` to propagate SQLite errors
- main.rs now reads `STORAGE_DB_PATH` env var (default `./data/files.db`)
- 7 unit tests all pass: insert_and_get, get_missing, list_empty, list_multiple, delete_existing, delete_missing, persistence_across_restarts
- Persistence test uses file-backed DB with temp dir, opens twice to simulate restart

## 2026-04-17 session-service SQLite Migration
- Replaced `Arc<Mutex<HashMap<String, Session>>>` with `Arc<Mutex<SessionRepository>>`
- `SessionRepository` wraps `rusqlite::Connection` with methods: `new_in_memory()`, `new_file(path)`, `init_table()`, `insert()`, `get()`, `get_all()`, `update_state()`, `delete()`
- Table schema: `sessions(id TEXT PK, user_id TEXT, username TEXT, state TEXT, created_at TEXT, last_activity TEXT, expires_at TEXT, access_token TEXT, refresh_token TEXT, revoked INTEGER DEFAULT 0, metadata TEXT DEFAULT '{}')`
- `metadata` field stored as JSON TEXT (was `HashMap<String, String>`, now `serde_json::Value`)
- `SessionState` enum has `as_str()`/`from_str()` for SQLite TEXT serialization
- Added `tempfile` dep for file-based persistence test
- Endpoint handlers now return 500 on DB errors (proper error propagation)
- `list_sessions` changed from `Json<Vec>` to `Result<Json<Vec>, Err>` for error propagation
- 8 tests all pass: insert_and_get, get_nonexistent, list_sessions, delete_session, update_state_revoke, persistence_across_restarts, file_persistence_across_connections, insert_duplicate_id_fails
- Binary crate — tests run with `--bin session-service`, not `--lib`

## 2026-04-17 XPS and OFD Serializers
- Created XpsSerializer and OfdSerializer following OdfSerializer/EPUB patterns
- Both use ArchiveWriter for ZIP creation, manual XML via std::fmt::Write
- XPS ZIP structure: [Content_Types].xml, _rels/.rels, Documents/1/FixedDocSeq.fdseq, Documents/1/FixedDocument.fdoc, Pages/N.fpage
- OFD ZIP structure: OFD.xml (Stored compression first), Doc_0/Document.xml, Doc_0/Pages/Page_N.xml
- Both crates needed zip added as dev-dependency (for ZipArchive in tests); already had wo-office-utils which depends on zip
- Gotcha: unwrap_or(&format!(...)) creates a temporary value that borrow checker rejects. Fix: bind format! to a let binding first
- Test pattern: zip_entry_names(), zip_read(), zip_read_bytes(), zip_is_stored() helper fns for verifying ZIP structure
- XPS: 15 serializer tests, OFD: 15 serializer tests — all pass (total 54 for both crates)

## 2026-04-17 wo-renderer fontdb Integration (T8)
- fontdb 0.16 API: NO \default_face_id()\ or \ace_data(id)\ — use \query(&Query)\ + \with_face_data(id, callback)\ instead
- fontdb 0.16 \Query\ has no \Default\ impl — must construct manually with \Family::SansSerif\ etc.
- fontdb 0.16 depends on ttf-parser 0.20, but workspace uses ttf-parser 0.25 — no conflict since fontdb stores raw bytes
- \wo-fonts::FontLoader::char_width(data, ch, font_size)\ reuses ttf-parser for glyph advance lookup — avoids direct ttf-parser dep in wo-renderer
- Pattern: \with_best_face_data(callback)\ wraps fontdb's \with_face_data\ to handle face lookup + fallback in one place
- Changed \layout_text\ and \layout_paragraph\ signatures to accept \&FontLibrary\ — breaking API change but no downstream consumers in workspace
- 130 tests pass: 93 unit (incl 5 new FontLibrary tests) + 37 integration
- Fallback values: char_width=0.5*em, ascent=0.8*em, descent=0.2*em (space uses char_advance for space char)

## 2026-04-17 coauthoring-service SQLite Migration
- Replaced `Arc<Mutex<HashMap<String, EditorSession>>>` with `Arc<Mutex<SessionRepository>>`
- Broadcast channels (`edit_channels`) remain as `Arc<Mutex<HashMap<String, broadcast::Sender>>>` — they are ephemeral runtime-only constructs
- Table schema: `editor_sessions(id TEXT PK, document_id TEXT, created_at TEXT, last_activity TEXT, participants TEXT DEFAULT '[]')`
- `participants` (Vec<Participant>) serialized as JSON TEXT column — participants have user_id, username, color, cursor_position
- Added `last_activity` field to EditorSession (updated on join)
- `SessionRepository` methods: `new_in_memory()`, `new_file(path)`, `init_table()`, `insert()`, `get()`, `get_all()`, `update()`, `delete()`
- Pattern: `update()` takes full `&EditorSession` and re-serializes participants JSON
- Endpoint handlers now return 500 on DB errors; `list_sessions` changed from `Json<Vec>` to `Result<Json<Vec>, Err>`
- `join_session` pattern: read from DB → mutate in memory → write back (two lock scopes)
- 9 tests all pass: insert_and_get, get_nonexistent, list_sessions, delete_session, update_session, persistence_across_restarts, file_persistence_across_connections, insert_duplicate_id_fails, empty_participants_serialized
- tempfile dev-dependency needed for file-based persistence test

## 2026-04-17 HWP and DjVu Serializers
- HWP is a binary format with 256-byte file header (Windows platform), not ZIP
- HWP 5.x header: signature(5) + reserved(23) + version_flags(2 LE) + version(2) + padding to 256
- HWP doc info record: ID=0x0001, tagged fields as tag(u16 LE) + len(u16 LE) + UTF-16LE data
- HWP body: paragraphs as UTF-16LE strings with null terminators
- DjVu is IFF-based: AT&TFORM magic + subtype(4) + chunks
- DjVu INFO chunk: width(u16 BE) + height(u16 BE) + minor(u8) + major(u8) + dpi(u8) + gamma(u8) + title(null-term)
- IFF chunks padded to even boundaries
- Non-INFO DjVu chunks preserved as placeholder data (zeros) since serializer has no access to original compressed data
- Gotcha: [0u8; 256 - variable] doesn't compile in Rust — use while out.len() < N { out.push(0); } instead
- Neither crate uses ArchiveWriter — HWP is raw binary, DjVu is IFF (not ZIP)
- HWP: 20 serializer tests, DjVu: 18 serializer tests — all pass

## 2026-04-18: Rectangle Glyph Hack Removal (draw_text integration)
- Replaced rectangle glyph placeholders in wo-docx-renderer/pipeline.rs and wo-renderer-wasm/canvas_bridge.rs with Canvas::draw_text() calls
- FontLibrary::new() works in both native and WASM contexts — fontdb's load_system_fonts() compiles and runs safely on wasm32-unknown-unknown (just finds no fonts, draw_text becomes silent no-op)
- FontLibrary does NOT implement Clone — must create a new instance per Canvas (can't share one FontLibrary across multiple canvases)
- draw_text signature: (text: &str, x: f64, y: f64, font_size: f64, font: &str, color: Color) — y is baseline
- Baseline calculation from layout top-y: baseline_y = top_y + font_size * 0.8
- set_font_library takes FontLibrary by value (moves it into Canvas)
- Removing warnings parameter from render_table_cell required also removing from render_layout_page call site
- Paint import still needed in pipeline.rs for table border strokes (set_stroke + stroke_rect)
- WASM build: cargo build --target wasm32-unknown-unknown -p wo-renderer-wasm — succeeds with FontLibrary::new() in create_canvas()
- Verification results: 25 wo-docx-renderer tests, 100 wo-renderer tests, 0 hacks remaining, clean WASM build

## 2026-04-18: Real DOCX Parsing in wo-renderer-wasm render_page()
- Replaced placeholder render_page() (white bg + borders + test rectangles) with real DOCX parsing + layout + rendering
- Added wo-ooxml dependency to wo-renderer-wasm — all its deps (zip, roxmltree, serde, anyhow) compile on wasm32-unknown-unknown
- DocxRun font_size is in half-points (e.g. 24 = 12pt), must divide by 2 for pixel rendering
- DocxRun color is hex without # prefix (e.g. 'FF0000'), needs '#' prepended for canvas_bridge
- DOCX paragraph spacing is in twips (1/20 of a point), divide by 20 for approximate pixel values
- Simple word-wrap using 0.5*font_size character width estimate — no font metrics available in WASM without loaded fonts
- Baseline calculation: baseline_y = cursor_y + font_size * 0.8 (matches pipeline.rs pattern)
- First-line indent applied only to the first line of each paragraph via indent_first_line / indent_hanging
- Table rendering: simple grid with 1px borders, first-run text per cell
- Non-DOCX formats return Err with 'Unsupported format' message
- WASM build: 0 warnings, 0 errors — clean compilation

## 2026-04-18: Real PDF Output via pdf-writer (wo-docx-renderer)
- Replaced fake RGBA concatenation in pipeline.rs with actual PDF generation using pdf-writer 0.12 (from typst)
- pdf-writer uses borrow-checked builders — each writer (Pages, Page) must be dropped/finished before the next operation on Pdf
- Pattern: wrap each writer in its own { } block to release borrow before next operation
- pdf-writer API: Pdf::new() → catalog(id) → pages(id) → page(id) → type1_font(id) → stream(id, &content.finish())
- Content::new() for building content streams, then show text with BT/ET operators
- Type1 Helvetica is a standard PDF base font (14 base fonts) — no embedding needed
- PDF coordinate system: origin at bottom-left, y increases upward. Layout y is top-down, so: pdf_y = page_height - layout_y
- PDF string escaping: must escape \, (, ) in text shown via Str()
- Ref IDs must be unique integers — pre-allocate all IDs before writing objects
- render_page() now re-parses and re-lays out to extract a single page for proper single-page PDF output
- 28 tests pass (was 25): added test_pdf_output_starts_with_header, test_pdf_structure_is_valid, test_pdf_multi_page_structure
- Updated test_render_page_placeholder → test_render_single_page_pdf (now succeeds)
- Updated roundtrip test to verify %PDF- header and %%EOF trailer
[2026-04-18] Niche format converters (XPS→DOCX, OFD→DOCX, HWP→DOCX, DjVu→DOCX, DOCX→XPS)

## Patterns
- All converters follow the same pattern: parse source → convert model → serialize target
- CoreProperties uses 'creator' not 'author' for the author field
- Router BFS finds shortest path; adding direct converters changes chain routes (e.g., hwp→html went from hwp→txt→html to hwp→docx→html)
- Test fixtures for ZIP-based formats (XPS, OFD, HWP, DjVu) can be created via their serializers: Serializer::new().serialize(&doc)
- DjVu serializer is IFF binary format; parser may not preserve all fields through roundtrip serialization
- XPS model: XpsDocument with pages containing glyphs (text), paths (vectors), fonts, images
- OFD model: OfdDocument with pages containing text_content (OfdTextObject with bold/italic/font_size)
- HWP model: HwpDocument with paragraphs (HwpParagraph with text/bold/italic/underline/font_name/font_size)
- DjVu model: DjvuDocument is minimal - only metadata (title, page_count, version, subtype), no text content
- DOCX→XPS converter splits content into pages at PAGE_HEIGHT - BOTTOM_MARGIN boundaries (792 - 72 = 720pt usable)

## Counters
- wo-x2t converter count: 33 → 38 (5 new converters added)
- wo-x2t test count: ~120 → 166 (46 new tests added)


## Canvas Rendering Integration (DocumentHolder)
- Created src/lib/wasm-renderer.ts with A4 page rendering via HTML5 Canvas (595x842pt)
- WasmRenderer uses DPR-aware canvas sizing for crisp rendering on HiDPI displays
- DocumentHolder.tsx uses MobX observer pattern (matching ViewTab, StatusBar conventions)
- Pre-existing sdk-bridge type error (oolean | undefined in isLocked()) blocked tsc — fixed with ?? false
- pnpm --filter @world-office/documenteditor build is the correct filter (package name, not directory name)
- StatusBar already has page nav and zoom controls — DocumentHolder adds canvas + nav below the page
- Workspace deps must be installed (pnpm install) before building — node_modules not auto-created

## Canvas Rendering Integration (5 remaining apps)
- All 5 apps wired: spreadsheet, presentation, pdf, visio, editor-shell
- Each app has src/lib/wasm-renderer.ts with init()/renderPage()/setTotalPages()/getTotalPages() API
- Spreadsheet renderer: grid with column/row headers, sample data table, active cell highlight, selection range
- Presentation renderer: 16:9 slides (960x540), dark gradient backgrounds, bullet points, slide navigation
- PDF renderer: A4 page with serif font, section headers, paragraph simulation, page numbers
- Visio renderer: flowchart with shapes (rect, diamond, ellipse, rounded), connectors with arrows, dot grid background
- Editor-shell renderer: toolbar chrome with menu buttons, white page with simulated text lines, status bar
- editor-shell Canvas.tsx keeps children prop — renders canvas by default, shows children when provided
- editor-shell has NO MobX — uses plain useState/useRef (no observer wrapper needed)
- All 5 builds pass: pnpm --filter @world-office/{spreadsheeteditor,presentationeditor,pdfeditor,visioeditor,editor-shell} build
- TypeScript strict mode + noUnusedLocals catches unused variables (e.g., lineRight in editor-shell wasm-renderer)
- Visio uses currentPageIndex (not currentPage), presentation uses currentSlide — each store has its own navigation state
