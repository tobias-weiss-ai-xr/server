# World Office — Feature Roadmap

## Completed (All Major Plans)

- [x] Rust core rewrite — 25 format parser crates + rendering + fonts + WASM
- [x] Tauri 2.0 desktop shell (10 modules)
- [x] wo-x2t conversion engine (27 native converters, 166 tests)
- [x] Collaboration WebSocket client (diamond-types CRDT)
- [x] Codeberg CI/CD (Forgejo Actions, 5 workflows)
- [x] E2E test suite (Jest + Playwright + Docker Compose, 19+ test files)
- [x] World-Office OpenCloud deployment companion (11 tasks)
- [x] Phase 2: Small format serializers (XPS, OFD, HWP, DjVu)
- [x] Phase 4: Web UI migration (all phases 4A-4G)
- [x] History cleanup — removed ~15k old C++ files, replaced all branding

## In Progress

- [ ] MCP Server + Version Snapshots — plan at `.sisyphus/plans/2026-04-19-mcp-server-version-snapshots.md`
  - stdio transport MCP server (rmcp Rust SDK)
  - 7 tools: list/read/write/create documents + snapshot management
  - Version snapshots in storage-service SQLite
  - Auto-snapshot before every MCP write
  - Agent attribution tracking

## Tier 2 — Near Future

### Comments with @agent Mentions
- Unified comment system across documents
- @agent mention support (agents can be @mentioned in comments)
- Comment threads with reply chains

### Cross-document ContentLink
- Link content between documents (embed cells, ranges, charts)
- Live updates when linked content changes
- Circular reference detection

## Tier 3 — Future

### Slides Editor
- Presentation creation and editing
- Slide layouts, transitions, speaker notes
- Import/export (PPTX, ODP)

### Flowchart Editor
- Visual flowchart/diagram editor
- Node-based editing with connections
- Export to SVG, PNG

### Extended Format Support
- XLSX spreadsheet editing
- PPTX presentation editing
- Enhanced ODF spreadsheet/presentation support
