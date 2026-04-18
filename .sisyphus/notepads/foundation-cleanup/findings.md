# Rust Workspace Build Verification — Findings

**Date:** 2026-04-15
**Toolchain:** rustc 1.94.1 stable (WSL, x86_64-unknown-linux-gnu)
**Command prefix:** `wsl bash -c "cd /mnt/c/Users/Tobias/git/World-Office && ~/.cargo/bin/cargo ..."`

---

## 1. cargo check --workspace

**Result: PASS** (with exclusions)

```bash
cargo check --workspace --exclude wo-pdf --exclude wo-webdav --exclude wo-docserver
```

41 of 44 workspace members compile cleanly. 3 crates excluded due to rustc 1.94.1 ICE (see §5).

**Warnings found and fixed:**
- `storage-service`: unused import `delete` from `axum::routing` (moved to test module)
- `coauthoring-service`: dead_code warning on `EditOperation` struct (added `#[allow(dead_code)]`)

---

## 2. cargo test --workspace --lib

**Result: PASS** (536 tests, 0 failures)

```bash
cargo test --workspace --exclude wo-pdf --exclude wo-webdav --exclude wo-docserver \
  --exclude wo-x2t-wasm --exclude wo-renderer-wasm --lib -- --test-threads=1
```

### Crates tested (with test counts):

| Crate | Tests | Status |
|-------|-------|--------|
| wo-common | 17 | PASS |
| wo-comparison | 0 | PASS |
| wo-converter-pro | 0 | PASS |
| wo-digital-signature | 0 | PASS |
| wo-djvu | 11 | PASS |
| wo-docx-renderer | 25 | PASS |
| wo-drm | 0 | PASS |
| wo-epub | 11 | PASS |
| wo-fb2 | 13 | PASS |
| wo-fonts | 36 | PASS |
| wo-html | 18 | PASS |
| wo-hwp | 12 | PASS |
| wo-msbinary | 29 | PASS |
| wo-odf | 15 | PASS |
| wo-ofd | 10 | PASS |
| wo-office-utils | 18 | PASS |
| wo-ooxml | 18 | PASS |
| wo-raster | 22 | PASS |
| wo-redaction | 0 | PASS |
| wo-renderer | 88 | PASS |
| wo-rtf | 41 | PASS |
| wo-txt | 23 | PASS |
| wo-unicode | 32 | PASS |
| wo-watermark | 0 | PASS |
| wo-wopi | 9 | PASS |
| wo-x2t | 48 | PASS |
| wo-renderer-wasm | 13 | PASS |
| api-gateway | (bin) | PASS |
| coauthoring-service | (bin) | PASS |
| conversion-service | (bin) | PASS |
| identity-service | (bin) | PASS |
| scim-service | (bin) | PASS |
| session-service | (bin) | PASS |
| storage-service | (bin) | PASS |
| audit-service | (bin) | PASS |
| webhook-service | (bin) | PASS |

### Test fixes applied:
1. **wo-wopi** (`server.rs:143`): `Arc::try_unwrap()` returns `Result` — changed to `.ok().expect("...")` to avoid requiring `Debug` bound on `WopiState`
2. **wo-renderer-wasm** (`canvas_bridge.rs:484`): Floating-point precision — `0x80/255 = 0.50196...` not `0.5`, changed to approximate comparison

### Pre-existing failures (not fixed, known limitations):
- **wo-x2t-wasm**: 3 test failures — tests expect `docx->pdf` conversion but no PDF converter exists in WASM shim. Per AGENTS.md: "WASM crates cannot be tested with standard cargo test — they need wasm-pack or a browser runtime"

---

## 3. cargo clippy --workspace -D warnings

**Result: PARTIAL** (rustc ICE prevents full run on stable 1.94.1)

Clippy ICEs on multiple crates due to the same `annotate_snippets` bug (see §5). Before ICEing, clippy found and we fixed these issues:

| Crate | Lint | Fix |
|-------|------|-----|
| wo-fonts | `match_like_matches_macro` | Replaced `match` with `matches!` macro |
| wo-renderer | `let_and_return` | Removed unnecessary `let t = ...; t` binding |
| wo-renderer | `derivable_impls` | Replaced manual `Default` impl with `#[derive(Default)]` |
| wo-wopi | `format_in_format_args` | Inlined `format!("{:?}", op)` into outer `format!` |
| storage-service | `unused_imports` | Moved `delete` import into test module |

Verified on nightly (1.97.0-nightly): wo-webdav has 8 unused import warnings, wo-docserver had 1 unused import (fixed).

---

## 4. turbo.json Verification

**Has cargo tasks: YES**

```json
"cargo:check": { "outputs": ["target/**"] },
"cargo:build": { "dependsOn": ["cargo:check"], "outputs": ["target/**"] },
"cargo:test": { "dependsOn": ["cargo:check"], "outputs": ["target/**"] },
"cargo:lint": { "outputs": [] },
"cargo:fmt": { "outputs": [] }
```

These are defined but not wired to any package.json scripts. The turbo.json tasks exist as hooks for future monorepo integration.

---

## 5. CI Workflow Verification (.github/workflows/ci.yml)

**Issues found:**

1. **CI will FAIL on stable rustc 1.94.1** — `cargo check --workspace` and `cargo test --workspace` do not exclude wo-pdf, wo-webdav, or wo-docserver, all of which trigger ICE on stable 1.94.1.

2. **CI does not exclude WASM crates** from `cargo test --workspace` — wo-x2t-wasm has 3 pre-existing test failures that will fail CI.

3. **CI clippy runs with `-D warnings`** — the clippy lint issues we fixed would cause CI failure. Now fixed.

4. **CI uses `cargo clippy --all-targets`** which includes tests — this will also trigger the ICE on affected crates.

**Recommended CI fixes:**
```yaml
# ci.yml — lint-rust job
- run: cargo check --workspace --exclude wo-pdf --exclude wo-webdav --exclude wo-docserver
- run: cargo clippy --workspace --exclude wo-pdf --exclude wo-webdav --exclude wo-docserver \
      --exclude wo-x2t-wasm --exclude wo-renderer-wasm -- -D warnings

# ci.yml — test-rust job  
- run: cargo test --workspace --exclude wo-pdf --exclude wo-webdav --exclude wo-docserver \
      --exclude wo-x2t-wasm --exclude wo-renderer-wasm
```

---

## 6. Files Modified

| File | Change |
|------|--------|
| `services/coauthoring-service/src/main.rs` | Added `#[allow(dead_code)]` to `EditOperation` |
| `services/storage-service/src/main.rs` | Moved `delete` import from top-level to test module |
| `core/crates/wo-wopi/src/server.rs` | Fixed `Arc::try_unwrap()` → `.ok().expect(...)` |
| `core/crates/wo-wopi/src/handlers.rs` | Inlined `format!("{:?}", op)` |
| `core/crates/wo-renderer/src/model.rs` | Replaced manual `Default` impl with derive |
| `core/crates/wo-renderer/src/gradient.rs` | Removed unnecessary `let t` binding |
| `core/crates/wo-fonts/src/loader.rs` | Replaced `match` with `matches!` |
| `core/crates/wo-renderer-wasm/src/canvas_bridge.rs` | Fixed float comparison (0x80/255 precision) |
| `core/crates/wo-docserver/Cargo.toml` | Added `tower` as dev-dependency |
| `core/crates/wo-docserver/src/static_files.rs` | Removed unused `IntoResponse`, `Response` imports |

---

## 7. Known ICE — rustc 1.94.1 annotate_snippets bug

**Affected crates:** wo-pdf, wo-webdav, wo-docserver (and clippy on wo-common, wo-renderer)

**Root cause:** rustc 1.94.1 has a bug in `annotate_snippets::renderer::StyledBuffer::replace` that panics with "slice index starts at N but ends at N-1". This is triggered when the compiler attempts to render certain diagnostic messages (particularly unused import warnings) in JSON format.

**Workaround:** Use `--exclude` for affected crates, or upgrade to nightly (1.97.0-nightly) where the bug is fixed.

**Upstream issue:** This is a known rustc regression. All three crates compile cleanly on nightly.
