# World-Office/core Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `World-Office/core` on Codeberg as the home for the Rust Document Server refactor, fix the E2E Dockerfile to build the Rust core, and add missing WOPI endpoints so the E2E test health check passes.

**Architecture:** The C++ Document Server at `tobias-weiss-ai-xr/core` (forked from Euro-Office/core) is being replaced by `server/core/crates/wo-docserver` + `wo-wopi` (Rust). The E2E stack currently clones a non-existent `World-Office/core` repo. We will: (1) create the Codeberg repo, (2) fix missing Rust endpoints, (3) rewrite the Dockerfile to build from Rust sources.

**Tech Stack:** Rust (axum, tokio), Docker multi-stage build, Codeberg git remote

---

## Background

### What the E2E Stack Needs

The `docker-compose.test.yml` health check (and existing tests) require these endpoints from the Document Server:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/hosting/discovery` | GET | WOPI discovery XML — health check target |
| `/wopi/files/{file_id}/` | GET | CheckFileInfo |
| `/wopi/files/{file_id}/contents/` | GET/POST | GetFile / PutFile |
| `/hosting/wopi/word/edit?wopisrc=...` | GET | Editor UI routing |

Environment variables consumed:
- `JWT_SECRET` — token validation
- `WOPI_HOST` (env var name in docker-compose) → `WOPI_HOST_URL` (Rust config) — WOPI host URL

### What the Rust `wo-docserver` Currently Has

Routes registered in `wo-docserver/src/lib.rs`:
- `GET /health` ✅
- `GET /wopi/files/{file_id}` ✅
- `GET /wopi/files/{file_id}/contents` ✅
- `POST /wopi/files/{file_id}/contents` ✅
- `POST /api/conversion/convert` ✅
- `GET /api/conversion/formats` ✅
- `/` fallback → landing page or static editor UI

**MISSING:**
1. `/hosting/discovery` — the E2E health check `curl -f http://localhost/hosting/discovery` will fail
2. `WOPI_HOST` env var (docker-compose passes this but config reads `WOPI_HOST_URL`)
3. `/hosting/wopi/word/edit?wopisrc=...` editor UI routing — the C++ DS serves editor JS apps; the Rust DS serves React editor UI from `apps/web/apps/` but the `editor_ui_dir` is not built in E2E Docker context

---

## File Structure

```
World-Office/server/
├── .sisyphus/plans/                          # This plan
├── tests/docker/documentserver/Dockerfile     # REWRITE: Build Rust core
├── core/crates/wo-docserver/src/
│   ├── lib.rs                                # MODIFY: Add discovery + hosting routes
│   ├── config.rs                             # MODIFY: Add WOPI_HOST env support
│   ├── static_files.rs                       # MODIFY: Add discovery handler
│   └── wopi.rs                               # MODIFY: Add WopiClient for discovery proxy
└── apps/web/apps/                            # EXTERNAL: Editor UI (built separately)
```

---

## Task 1: Fix `wo-docserver` Missing Endpoints

### Sub-task 1A: Add `WOPI_HOST` environment variable support

**Files:**
- Modify: `server/core/crates/wo-docserver/src/config.rs:28`

The docker-compose passes `WOPI_HOST=ocis:9200` but `DocServerConfig` reads `WOPI_HOST_URL`. Add support for `WOPI_HOST` as an alias:

```rust
wopi_host_url: env::var("WOPI_HOST").or_else(|_| env::var("WOPI_HOST_URL")).unwrap_or_else(|_| "http://ocis:9200".into()),
```

### Sub-task 1B: Add `/hosting/discovery` endpoint

**Files:**
- Modify: `server/core/crates/wo-docserver/src/static_files.rs` — add discovery handler
- Modify: `server/core/crates/wo-docserver/src/lib.rs` — register discovery route

The C++ Document Server generates WOPI discovery XML dynamically. The OCIS WOPI host provides a `/hosting/discovery` endpoint that lists capabilities. The E2E health check does `curl -f http://localhost/hosting/discovery` directly.

The Rust docserver should either:
- **Option A**: Proxy to the WOPI host's discovery endpoint (simpler, works for E2E)
- **Option B**: Return a static/minimal discovery XML listing the docserver's own capabilities (more correct)

Option A is chosen for minimal implementation:

```rust
// In lib.rs — add to router:
.route("/hosting/discovery", get(discovery_handler))

// Handler:
async fn discovery_handler(
    State(state): State<AppState>,
) -> Result<String, AppError> {
    let discovery = state
        .wopi_client
        .get_discovery()
        .await
        .map_err(|e| AppError::Wopi(e))?;
    Ok(discovery)
}
```

Note: `WopiClient` in `wo-docserver/src/wopi.rs` needs a `get_discovery()` method. Check if it exists — if not, add it. The WOPI host at `http://ocis:9200` provides `GET /hosting/discovery` returning XML.

### Sub-task 1C: Fix `/hosting/wopi/word/edit` routing

**Files:**
- Modify: `server/core/crates/wo-docserver/src/lib.rs`

The existing test `test-wopi-full.js` line 196-197 constructs: `http://localhost:8083/hosting/wopi/word/edit?wopisrc=...`

The Rust docserver needs to serve editor UI at `/hosting/wopi/...`. For the E2E test (no real editor UI built), return a stub or redirect. For real use, `apps/web/apps/` contains the React editors.

Implementation approach:
1. If `EDITOR_UI_DIR` is present and contains built apps — serve them
2. If not — return a simple HTML stub indicating "editor UI not built"

Route to add: `GET /hosting/wopi/{path:.*}` → serve static files or stub

### Sub-task 1D: Fix test health check expectation

**Files:**
- Modify: `server/tests/docker-compose.test.yml:44`

The health check is `curl -f http://localhost/hosting/discovery`. With the discovery handler added (Task 1B), this will pass. No change needed if discovery proxy is working.

---

## Task 2: Create `World-Office/core` Repository on Codeberg

### Sub-task 2A: Initialize the Codeberg repo

**Action:** Create repo `core` under `World-Office` org on Codeberg. Set description: "World-Office Document Server — Rust refactor of the C++ core". Make it public.

**Tool:** Use `gh` CLI or direct Codeberg API:
```bash
# Via Codeberg API:
curl -X POST "https://codeberg.org/api/v1/repos" \
  -H "Authorization: token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"core","description":"World-Office Document Server — Rust refactor","private":false}'
```

Or use the Codeberg web UI manually if API auth is unavailable.

**Note:** This repo is a pointer to the Rust codebase. The `server/` directory in the `World-Office/server` repo IS the core. This repo exists to satisfy the E2E Dockerfile clone URL and to document the migration from C++ to Rust.

### Sub-task 2B: Populate the repo with migration documentation

**Files:**
- Create: `README.md` in `World-Office/core`
- Create: `MIGRATION.md` explaining C++ → Rust transition
- Create: `LICENSE` (AGPL-3.0)

Minimal README content:
```markdown
# World-Office/core

**Status: Migration to Rust in progress**

This repository is the home of the World-Office Document Server, rewritten in Rust.

The original C++ implementation lives at: https://github.com/tobias-weiss-ai-xr/core
The Rust implementation is maintained in the [World-Office/server](https://codeberg.org/World-Office/server) repository under `core/crates/`.

## Quick Start

```bash
# Build the Rust Document Server
cargo build -p wo-docserver

# Run E2E tests
cd tests && npm test
```
```

---

## Task 3: Rewrite E2E Dockerfile to Build Rust Core

### Sub-task 3A: Rewrite `tests/docker/documentserver/Dockerfile`

**Files:**
- Create: `server/tests/docker/documentserver/Dockerfile` (replace existing)

The new Dockerfile should:

1. **Stage 1 — Build Rust:**
   - Base: `rust:1.85-bookworm` (or `rust:1-alpine` for smaller image)
   - Install Node.js for the web editor build
   - Clone `World-Office/server` (the Rust monorepo)
   - Build `wo-docserver` binary with `cargo build -p wo-docserver --release`
   - Build the React editor UI (`cd apps/web && pnpm install && pnpm build`) — or copy pre-built assets if available

2. **Stage 2 — Runtime:**
   - Base: `debian:bookworm-slim`
   - Install runtime deps: `ca-certificates`, `fontconfig`, `fonts-dejavu`, `fonts-liberation`
   - Copy the Rust binary from Stage 1
   - Copy the built editor UI (or serve from a separate location)
   - Set `JWT_SECRET`, `WOPI_HOST`, etc.
   - Health check: `curl -f http://localhost/hosting/discovery`

Key environment variables the container must accept:
- `JWT_SECRET` (required)
- `WOPI_HOST` (maps to WOPI host URL)
- `EDITOR_UI_DIR` (path to built React apps, default `./editor-ui`)

Minimal Dockerfile skeleton:

```dockerfile
# Stage 1: Builder
FROM rust:1.85-bookworm AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Clone the Rust monorepo
RUN git clone --depth=1 https://codeberg.org/World-Office/server.git

WORKDIR /build/server

# Build the docserver binary
RUN cargo build -p wo-docserver --release

# Build editor UI (if needed for full integration)
WORKDIR /build/server/apps/web
RUN corepack enable && pnpm install && pnpm build

# Stage 2: Runtime
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    fontconfig \
    fonts-dejavu \
    fonts-liberation \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary
COPY --from=builder /build/server/target/release/wo-docserver /app/
# Copy editor UI
COPY --from=builder /build/server/apps/web/apps/ /app/editor-ui/

ENV JWT_SECRET=change_me
ENV WOPI_HOST=http://ocis:9200
ENV EDITOR_UI_DIR=/app/editor-ui

EXPOSE 80

CMD ["/app/wo-docserver"]
```

### Sub-task 3B: Update `docker-compose.test.yml` health check consistency

**Files:**
- Modify: `server/tests/docker-compose.test.yml:43-48`

The health check already uses `/hosting/discovery` which will be implemented. No change needed if discovery proxy works.

Confirm the `DOCSERVER_PORT` or port mapping: The docker-compose exposes `8080:80` and the health check uses `http://localhost/hosting/discovery` (port 80 inside container). The Rust binary binds to `0.0.0.0:80` by default (config.port defaults to 80). This is consistent.

### Sub-task 3C: Update `.env.test` if needed

**Files:**
- Modify: `server/tests/.env.test`

The existing env vars are already correct. No changes needed.

---

## Task 4: Verify the Build

### Step 1: Build the Dockerfile locally

```bash
cd /home/weiss/git/World-Office/server
docker build -f tests/docker/documentserver/Dockerfile -t worldoffice-documentserver:test .
```

Expected: Successful build, binary present, health check passes.

### Step 2: Run the E2E stack

```bash
cd /home/weiss/git/World-Office/server/tests
docker compose -f docker-compose.test.yml up -d
docker compose -f docker-compose.test.yml logs -f
```

Expected: All services start, `documentserver` health check passes (green).

### Step 3: Run E2E tests

```bash
cd /home/weiss/git/World-Office/server/tests
npm install
npm test
```

Expected: At minimum, the WOPI full chain test passes (upload, CheckFileInfo, GetFile).

---

## Gaps and Open Questions

1. **Editor UI**: The E2E tests open the editor at `http://localhost:8083/hosting/wopi/word/edit?wopisrc=...`. This port (8083) maps to the OCIS companion, not the docserver. The test routes `/hosting/wopi/**` to convert GET→POST. The docserver needs to handle the GET form at `/hosting/wopi/word/edit`. If no real editor UI is built, a stub page is acceptable for E2E.

2. **WOPI discovery proxy correctness**: Proxying to OCIS's discovery may return OCIS's own WOPI apps, not the docserver's. For the E2E health check, any 200 response is sufficient. Real WOPI app routing depends on OCIS's discovery returning the docserver's app entries — this may need adjustment.

3. **sdkjs / JavaScript editor assets**: The C++ Dockerfile clones `sdkjs` as a submodule. The Rust refactor doesn't need sdkjs (it uses React-based editors). The Dockerfile should NOT clone sdkjs.

4. **Multiple WOPI hosts**: The docker-compose passes `WOPI_HOST=ocis:9200` to the docserver but also has `COLLABORATION_APP_ADDR=http://documentserver:80` in the OCIS service. OCIS uses this to route back to the docserver. Ensure the docserver correctly registers its callback URL with OCIS.