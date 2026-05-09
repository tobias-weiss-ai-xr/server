# C++ to Rust Migration Documentation

> **Status:** Design approved, implementation pending
> **Created:** 2026-01-09
> **Author:** Sisyphus

## Overview

The Document Server has been fully migrated from C++ to Rust (`wo-docserver`). This design documents the necessary documentation updates to reflect the new architecture for both end users and contributors.

**Scope:** Documentation only — no code changes. The migration work is complete from (b5), (b6), (b11), (b12).

**Goal:** Update README files, AGENTS.md, and CHANGELOG to accurately describe the Rust-based Document Server architecture.

---

## Design

### Section 1: Main README Updates

**File:** `server/README.md`

Add "Document Server Architecture" section before the existing "Services" section.

**Content:**

```markdown
## Document Server Architecture

The Document Server (`wo-docserver`) is a Rust-based WOPI client that replaces the former C++ Document Server.

### Responsibilities:
- **WOPI Client**: Implements CheckFileInfo, GetFile, PutFile WOPI endpoints
- **Editor UI Hosting**: Serves React-based editors from `apps/web/apps/`
- **WOPI Discovery Proxies**: Proxies `/hosting/discovery` and `/hosting/wopi/*` to WOPI host
- **Format Conversion**: Backend for `wo-x2t` format conversion orchestration

### Key Differences from C++ Document Server:
- **Language**: Rust (axum/tokio) instead of C++
- **Build Time**: ~5-10 minutes instead of 2-4 hours
- **Editor UI**: React-based editors from monorepo instead of compiled JavaScript
- **Deploy**: Single binary or Docker container
```

**File:** `/home/weiss/git/World-Office/AGENTS.md` (workspace root)

Update "KEY FACTS" section. Add one line:
- wo-docserver serves editor UI and proxies WOPI requests

---

### Section 2: Architecture Diagram

**File:** `server/README.md`

Add after the "Document Server Architecture" section.

**Content:**

```markdown
### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                         │
│  (React Document/Spreadsheet/Presentation Editors)          │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              wo-docserver (Rust)                            │
│  ┌──────────────────┬────────────────────────────────────┐ │
│  │  WOPI Client      │  Editor UI Hosting                │ │
│  │  - CheckFileInfo │  - /hosting/wopi/*                 │ │
│  │  - GetFile       │  - /hosting/discovery (proxy)     │ │
│  │  - PutFile       │  - Serves React apps from apps/    │ │
│  └────────┬─────────┴────────┬───────────────────────────┘ │
│           │                  │                              │
│           │ WOPI protocol    │                              │
└───────────┼──────────────────┼──────────────────────────────┘
            │                  │
        ┌───▼──────────────────▼────┐
        │   WOPI Host (OCIS)        │
        │   - File storage           │
        │   - WOPI discovery         │
        │   - Auth (built-in IDP)    │
        └────────────────────────────┘
```

**Request Flow:**
1. Browser requests `http://docserver:8080/hosting/wopi/word/edit?wopisrc=...`
2. wo-docserver serves React editor UI with embedded `WOPISrc` parameter
3. Editor loads and makes WOPI requests to `/wopi/files/{id}/`, `/wopi/files/{id}/contents/`
4. wo-docserver proxies these to OCIS (WOPI host) with JWT authentication
5. OCIS returns file metadata/content, wo-docserver forwards to editor
```

---

### Section 3: Core/AGENTS.md Updates

**File:** `server/core/AGENTS.md`

Add after the `wo-docserver` entry in the "Protocol and Infrastructure" section.

**Content:**

```markdown
#### wo-docserver Implementation Notes

**Built with:** axum (routes), tokio (async runtime)

**Key features:**
- WOPI endpoints: `/wopi/files/{id}`, `/wopi/files/{id}/contents` (GET/POST), `/hosting/discovery` (proxy), `/hosting/wopi/{path}`
- JWT validation via `JWT_SECRET` env var
- Editor UI served from `apps/web/apps/*/dist/` directories
- WOPI host configuration via `WOPI_HOST` env var (also accepts `WOPI_HOST_URL`)

**Directory structure:**
```
wo-docserver/
├── src/
│   ├── lib.rs       # Route registration, app factory
│   ├── config.rs    # Env var parsing, JWT secret loading
│   ├── wopi.rs      # WopiClient for OCIS communication
│   └── static_files.rs  # Discovery handler, editor UI serving
└── Cargo.toml
```

**Testing:**
```bash
cargo build -p wo-docserver --release
cargo test -p wo-docserver
```
```

---

### Section 4: Tests/README Updates

**File:** `server/tests/README.md`

Add under "Quick Start" section, after "### 1. Clone and Install".

**Content:**

```markdown
## Document Server (Rust)

The Document Server container builds the Rust-based `wo-docserver` from `World-Office/server`.

**Build details:**
- Base image: `debian:bookworm-slim`
- Rust toolchain: nightly (via rust-toolchain.toml)
- Build time: ~5-10 minutes (vs 2-4 hours for C++)
- Ports exposed: `:80` (HTTP)
- Required env vars:
  - `JWT_SECRET`: Token validation key (must match OCIS)
  - `WOPI_HOST`: OCIS WOPI host URL (e.g., `ocis:9200`)

**Endpoints:**
| Path | Method | Purpose |
|------|--------|---------|
| `/health` | GET | Health check |
| `/hosting/discovery` | GET | WOPI discovery (proxied to OCIS) |
| `/hosting/wopi/*` | GET | Editor UI routing |
| `/wopi/files/{id}` | GET | CheckFileInfo |
| `/wopi/files/{id}/contents` | GET/POST | GetFile / PutFile |
```

**Remove/Replace:** Existing content that references C++ build steps should be replaced with above.

---

### Section 5: CHANGELOG Entry

**File:** `server/core/CHANGELOG.md`

Add to beginning of "develop" section.

**Content:**

```markdown
## develop
### wo-docserver
* **migration-complete**: Replaced C++ Document Server with Rust implementation
  - WOPI endpoints (CheckFileInfo, GetFile, PutFile) implemented in Rust
  - `/hosting/discovery` and `/hosting/wopi/*` routes added for editor UI
  - Editor UI now served from `apps/web/apps/*/dist/` React builds
  - JWT validation via `JWT_SECRET` env var
  - Single binary deployment with ~5-10 min build time
  - WOPI host configuration via `WOPI_HOST` env var (aliased to `WOPI_HOST_URL`)
  - E2E Dockerfile rewritten to build from Rust sources instead of C++
```

---

## Files to Modify

| File | Purpose | Lines to Add |
|------|---------|--------------|
| `server/README.md` | Add Document Server Architecture section | ~25 |
| `/home/weiss/git/World-Office/AGENTS.md` | Update KEY FACTS section | ~1 |
| `server/core/AGENTS.md` | Add wo-docserver Implementation Notes | ~25 |
| `server/tests/README.md` | Add Document Server (Rust) section | ~25 |
| `server/core/CHANGELOG.md` | Add migration entry | ~10 |

**Total:** ~86 lines of documentation to add

---

## Implementation Order

1. `server/README.md` — Section 1 (Document Server Architecture)
2. `server/README.md` — Section 2 (Architecture Diagram)
3. `/home/weiss/git/World-Office/AGENTS.md` — Section 1 (KEY FACTS update)
4. `server/core/AGENTS.md` — Section 3 (wo-docserver Implementation Notes)
5. `server/tests/README.md` — Section 4 (Document Server build details)
6. `server/core/CHANGELOG.md` — Section 5 (CHANGELOG entry)

---

## Validation

After making all changes:

1. **Markdown lint:** Ensure no broken links in diagrams
2. **Line breaks:** Verify ASCII diagram renders correctly in GitHub flavoured markdown
3. **Consistency:** Ensure wo-docserver is referenced consistently (not "Document Server" when wo-docserver is the crate name)
4. **Review:** Check all sections for typos or formatting issues

---

## Notes

- The migration work is complete in (b5), (b6), (b11), (b12). This spec only covers documentation.
- The `server/.sisyphus/plans/migrate-core.md` plan is now obsolete (all tasks completed).
- The E2E Docker image now builds from Rust sources; the tests/README should reflect this.
- No new documentation files are created — only updates to existing files.