# Learnings: MCP Server Snapshots

## repository.rs Snapshot Extension (2026-04-21)

- `rusqlite::changes()` returns the number of rows affected by the most recent INSERT/UPDATE/DELETE — used in `prune_snapshots` to report how many snapshots were deleted.
- `execute_batch` can run multiple DDL statements (CREATE TABLE, CREATE INDEX) in a single call — used for `init_table` to create both `files` and `snapshots` tables plus indexes atomically.
- SQLite `REFERENCES ... ON DELETE CASCADE` works out of the box with rusqlite — no need to enable foreign keys explicitly for in-memory databases (it's enabled by default).
- The `list_snapshots` method intentionally omits `content_blob` from the SELECT (sets `Vec::new()`) for performance — listing should be lightweight, use `get_snapshot` for full data.
- `chrono::Utc::now().to_rfc3339()` and `uuid::Uuid::new_v4().to_string()` are already available in the storage-service workspace — no new dependencies needed.
- The `size` field uses `i64` in SQLite but `usize` in Rust — need `as i64` / `as usize` casts (matching existing `insert`/`row_to_stored_file` pattern).
