# Storage Service Learnings

## Snapshot Endpoints (2026-04-23)

- **Route design**: `GET /snapshots/{id}` and `GET /snapshots/file/{file_id}` are separate routes to avoid ambiguity between snapshot-id lookup and file-id listing. Axum cannot distinguish two `get` handlers on the same path pattern.
- **`list_snapshots` returns empty `content_blob`** (Vec::new()) — no need to encode blob for list responses. Use `SnapshotListItem` (no blob field) for list, `SnapshotResponse` (blob as base64 string) for single get.
- **`delete()` in axum is a method on `MethodRouter`**, not a standalone routing function like `get()`/`post()`. Importing `routing::delete` is unnecessary when using `.route("/path", get(h1).delete(h2))`.
- **`Snapshot` already has `Serialize`-compatible fields** but needs manual conversion to response DTOs since `content_blob: Vec<u8>` serializes as number array, not base64.
- **No new Cargo.toml deps needed** — `base64` was already a workspace dependency.
