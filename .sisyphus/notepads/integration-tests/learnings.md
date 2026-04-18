# Integration Tests - Learnings

## Architecture Decision: lib.rs + thin main.rs
- Both services (conversion-service, storage-service) were binary-only crates with private types
- External integration tests (`tests/` dir) can't access binary crate internals
- Solution: Extract all types/handlers into `lib.rs`, make `main.rs` a thin launcher
- This is the standard Rust pattern for testable services
- Added `[lib]` section to Cargo.toml with `name = "conversion_service"` (underscore convention)
- Re-exported `ConversionRouter` via `pub use wo_x2t::ConversionRouter` in lib.rs

## Test Infrastructure
- `tower::ServiceExt` + `axum::body::Body` for in-memory testing (no HTTP server needed)
- `oneshot()` consumes the Router, so each test needs a fresh Router via `app(state.clone())`
- `axum::body::to_bytes()` for extracting response body
- `base64::Engine::encode/decode` with `general_purpose::STANDARD` for data encoding

## Service API Details
- conversion-service: `input_format`/`output_format` (not `source`/`target` as in task context)
- conversion-service: unsupported formats return 200 with `status: "failed"` job (not HTTP error)
- storage-service: uses temp dir via `create_test_state()` for isolated filesystem tests
- storage-service: `POST /files` returns 201 CREATED with `{ file: {...} }` wrapper
- storage-service: `GET /files/{id}/content` returns raw bytes with content-type header

## Test Counts
- conversion-service: 14 integration tests (4 success, 4 error, formats, jobs, health, full chain)
- storage-service: 15 integration tests (upload, list, get, download, delete, error, full chain, health)
