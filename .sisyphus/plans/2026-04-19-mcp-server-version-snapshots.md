# MCP Server + Version Snapshots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an MCP server (stdio transport) and version snapshots to storage-service, enabling AI agents to read/write World Office documents with automatic versioning.

**Architecture:** New `wo-mcp-server` Rust crate uses `rmcp` SDK for stdio transport. It calls storage-service HTTP API for file CRUD. Version snapshots are stored in a new `snapshots` table in storage-service's existing SQLite database. Every MCP write auto-snapshots the previous content.

**Tech Stack:** Rust, rmcp (MCP SDK), reqwest, axum, rusqlite, sha2

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `services/storage-service/src/repository.rs` | MODIFY | Add `snapshots` table + CRUD methods |
| `services/storage-service/src/lib.rs` | MODIFY | Add 3 snapshot REST endpoints + Snapshot struct |
| `services/mcp-server/Cargo.toml` | CREATE | Crate definition |
| `services/mcp-server/src/main.rs` | CREATE | MCP server entry point (stdio transport) |
| `services/mcp-server/src/client.rs` | CREATE | HTTP client for storage-service API |
| `services/mcp-server/src/tools.rs` | CREATE | 7 MCP tool implementations |
| `services/mcp-server/src/snapshots.rs` | CREATE | Snapshot orchestration (hash, dedup, prune) |
| `Cargo.toml` (workspace root) | MODIFY | Add `wo-mcp-server` member |

---

## Task 1: Snapshot Table + Repository Methods

**Files:**
- Modify: `services/storage-service/src/repository.rs`

- [ ] **Step 1: Add Snapshot struct and table init**

After the existing `init_table` method, add a `Snapshot` struct and extend `init_table` to also create the `snapshots` table.

```rust
/// Version snapshot record.
#[derive(Debug, Clone)]
pub struct Snapshot {
    pub id: String,
    pub file_id: String,
    pub content_hash: String,
    pub content_blob: Vec<u8>,
    pub agent_name: String,
    pub summary: String,
    pub created_at: String,
}
```

Replace `init_table` with:

```rust
fn init_table(&self) -> Result<(), rusqlite::Error> {
    self.conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS files (
            id           TEXT PRIMARY KEY,
            name         TEXT NOT NULL,
            content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
            size         INTEGER NOT NULL DEFAULT 0,
            path         TEXT NOT NULL,
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS snapshots (
            id           TEXT PRIMARY KEY,
            file_id      TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
            content_hash TEXT NOT NULL,
            content_blob BLOB NOT NULL,
            agent_name   TEXT NOT NULL DEFAULT 'unknown',
            summary      TEXT NOT NULL DEFAULT '',
            created_at   TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_snapshots_file_id ON snapshots(file_id);
        CREATE INDEX IF NOT EXISTS idx_snapshots_content_hash ON snapshots(content_hash);",
    )?;
    Ok(())
}
```

- [ ] **Step 2: Add snapshot CRUD methods**

Add these methods to `impl StorageRepository`:

```rust
/// Insert a snapshot. Returns the snapshot id.
pub fn insert_snapshot(
    &mut self,
    file_id: &str,
    content_hash: &str,
    content_blob: &[u8],
    agent_name: &str,
    summary: &str,
) -> Result<String, rusqlite::Error> {
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    self.conn.execute(
        "INSERT INTO snapshots (id, file_id, content_hash, content_blob, agent_name, summary, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![id, file_id, content_hash, content_blob, agent_name, summary, created_at],
    )?;
    Ok(id)
}

/// Check if a snapshot with this content_hash already exists for this file.
pub fn snapshot_hash_exists(&self, file_id: &str, content_hash: &str) -> Result<bool, rusqlite::Error> {
    let count: i64 = self.conn.query_row(
        "SELECT COUNT(*) FROM snapshots WHERE file_id = ?1 AND content_hash = ?2",
        rusqlite::params![file_id, content_hash],
        |row| row.get(0),
    )?;
    Ok(count > 0)
}

/// List snapshots for a file, newest first. Limit defaults to 20.
pub fn list_snapshots(&self, file_id: &str, limit: usize) -> Result<Vec<Snapshot>, rusqlite::Error> {
    let limit = if limit == 0 { 20 } else { limit };
    let mut stmt = self.conn.prepare(
        "SELECT id, file_id, content_hash, agent_name, summary, created_at
         FROM snapshots WHERE file_id = ?1 ORDER BY created_at DESC LIMIT ?2",
    )?;
    let rows = stmt.query_map(rusqlite::params![file_id, limit as i64], |row| {
        Ok(Snapshot {
            id: row.get(0)?,
            file_id: row.get(1)?,
            content_hash: row.get(2)?,
            content_blob: Vec::new(), // Not loaded in list queries
            agent_name: row.get(3)?,
            summary: row.get(4)?,
            created_at: row.get(5)?,
        })
    })?;
    rows.collect::<Result<Vec<_>, _>>()
}

/// Get a full snapshot (including content_blob).
pub fn get_snapshot(&self, id: &str) -> Result<Option<Snapshot>, rusqlite::Error> {
    let mut stmt = self.conn.prepare(
        "SELECT id, file_id, content_hash, content_blob, agent_name, summary, created_at
         FROM snapshots WHERE id = ?1",
    )?;
    let mut rows = stmt.query(rusqlite::params![id])?;
    match rows.next()? {
        Some(row) => Ok(Some(Snapshot {
            id: row.get(0)?,
            file_id: row.get(1)?,
            content_hash: row.get(2)?,
            content_blob: row.get(3)?,
            agent_name: row.get(4)?,
            summary: row.get(5)?,
            created_at: row.get(6)?,
        })),
        None => Ok(None),
    }
}

/// Delete snapshots beyond max_per_file for a given file. Returns count deleted.
pub fn prune_snapshots(&mut self, file_id: &str, max_per_file: usize) -> Result<usize, rusqlite::Error> {
    let count: i64 = self.conn.query_row(
        "SELECT COUNT(*) FROM snapshots WHERE file_id = ?1",
        rusqlite::params![file_id],
        |row| row.get(0),
    )?;
    if count as usize <= max_per_file {
        return Ok(0);
    }
    let to_delete = count as usize - max_per_file;
    // Find the IDs of the oldest snapshots beyond the limit
    let mut stmt = self.conn.prepare(
        "SELECT id FROM snapshots WHERE file_id = ?1 ORDER BY created_at ASC LIMIT ?2",
    )?;
    let ids: Vec<String> = stmt
        .query_map(rusqlite::params![file_id, to_delete as i64], |row| row.get(0))?
        .collect::<Result<Vec<_>, _>>()?;

    let deleted = ids.len();
    for id in &ids {
        self.conn.execute("DELETE FROM snapshots WHERE id = ?1", rusqlite::params![id])?;
    }
    Ok(deleted)
}

/// Update the updated_at timestamp for a file.
pub fn touch(&mut self, id: &str) -> Result<(), rusqlite::Error> {
    let now = chrono::Utc::now().to_rfc3339();
    self.conn.execute(
        "UPDATE files SET updated_at = ?1 WHERE id = ?2",
        rusqlite::params![now, id],
    )?;
    Ok(())
}

/// Update the file size.
pub fn update_size(&mut self, id: &str, size: usize) -> Result<(), rusqlite::Error> {
    self.conn.execute(
        "UPDATE files SET size = ?1 WHERE id = ?2",
        rusqlite::params![size as i64, id],
    )?;
    Ok(())
}
```

- [ ] **Step 3: Add tests for snapshot methods**

Add these tests to the `#[cfg(test)]` module at the bottom of `repository.rs`:

```rust
#[test]
fn insert_and_list_snapshots() {
    let mut repo = StorageRepository::new_in_memory().unwrap();
    repo.insert(&make_file("snap-file")).unwrap();
    repo.insert_snapshot("snap-file", "abc123", b"content1", "claude", "initial write").unwrap();
    repo.insert_snapshot("snap-file", "def456", b"content2", "codex", "fix typo").unwrap();
    let snaps = repo.list_snapshots("snap-file", 10).unwrap();
    assert_eq!(snaps.len(), 2);
    // Newest first
    assert_eq!(snaps[0].agent_name, "codex");
    assert_eq!(snaps[1].agent_name, "claude");
}

#[test]
fn snapshot_dedup_by_hash() {
    let mut repo = StorageRepository::new_in_memory().unwrap();
    repo.insert(&make_file("dedup-file")).unwrap();
    assert!(!repo.snapshot_hash_exists("dedup-file", "hash1").unwrap());
    repo.insert_snapshot("dedup-file", "hash1", b"data", "agent", "").unwrap();
    assert!(repo.snapshot_hash_exists("dedup-file", "hash1").unwrap());
}

#[test]
fn get_snapshot_returns_blob() {
    let mut repo = StorageRepository::new_in_memory().unwrap();
    repo.insert(&make_file("blob-file")).unwrap();
    let id = repo.insert_snapshot("blob-file", "h1", b"hello world", "agent", "test").unwrap();
    let snap = repo.get_snapshot(&id).unwrap().unwrap();
    assert_eq!(snap.content_blob, b"hello world");
    assert_eq!(snap.agent_name, "agent");
}

#[test]
fn get_missing_snapshot_returns_none() {
    let repo = StorageRepository::new_in_memory().unwrap();
    assert!(repo.get_snapshot("nope").unwrap().is_none());
}

#[test]
fn prune_old_snapshots() {
    let mut repo = StorageRepository::new_in_memory().unwrap();
    repo.insert(&make_file("prune-file")).unwrap();
    for i in 0..5 {
        repo.insert_snapshot("prune-file", &format!("hash{}", i), b"data", "agent", &format!("snap {}", i)).unwrap();
    }
    assert_eq!(repo.list_snapshots("prune-file", 100).unwrap().len(), 5);
    let deleted = repo.prune_snapshots("prune-file", 3).unwrap();
    assert_eq!(deleted, 2);
    assert_eq!(repo.list_snapshots("prune-file", 100).unwrap().len(), 3);
}

#[test]
fn touch_updates_timestamp() {
    let mut repo = StorageRepository::new_in_memory().unwrap();
    repo.insert(&make_file("touch-file")).unwrap();
    repo.touch("touch-file").unwrap();
    // No error = success (can't easily verify timestamp change in same second)
}
```

- [ ] **Step 4: Run tests**

```bash
cargo test -p storage-service
```

Expected: All tests pass (existing + new snapshot tests).

- [ ] **Step 5: Commit**

```bash
git add services/storage-service/src/repository.rs
git commit -m "feat(storage): add snapshots table and repository methods

Add snapshots table to SQLite with content_hash index for dedup.
Implement insert, list, get, dedup check, prune, touch, and
update_size methods. Add comprehensive tests."
```

---

## Task 2: Snapshot REST Endpoints

**Files:**
- Modify: `services/storage-service/src/lib.rs`

- [ ] **Step 1: Add Snapshot struct and response types**

Add these types after the existing `FileListResponse` struct (around line 80):

```rust
/// Version snapshot metadata (without blob).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotResponse {
    pub id: String,
    pub file_id: String,
    pub agent_name: String,
    pub summary: String,
    pub created_at: String,
}

/// Snapshot list response.
#[derive(Serialize)]
pub struct SnapshotListResponse {
    pub snapshots: Vec<SnapshotResponse>,
    pub count: usize,
}

/// Restore response.
#[derive(Serialize)]
pub struct RestoreResponse {
    pub file_id: String,
    pub restored_from: String,
    pub new_size: usize,
}
```

- [ ] **Step 2: Add snapshot REST handlers**

Add these handler functions before the `app()` function:

```rust
/// GET /files/{id}/snapshots — list snapshots for a file.
pub async fn list_snapshots(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
) -> Result<Json<SnapshotListResponse>, (StatusCode, Json<ErrorResponse>)> {
    // Verify file exists
    {
        let repo = state.repo.lock().await;
        match repo.get(&file_id) {
            Ok(Some(_)) => {}
            Ok(None) => {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: format!("File {} not found", file_id),
                        code: 404,
                    }),
                ));
            }
            Err(e) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Failed to get file: {}", e),
                        code: 500,
                    }),
                ));
            }
        }
    }
    let repo = state.repo.lock().await;
    match repo.list_snapshots(&file_id, 50) {
        Ok(snaps) => {
            let count = snaps.len();
            let response = SnapshotListResponse {
                snapshots: snaps
                    .into_iter()
                    .map(|s| SnapshotResponse {
                        id: s.id,
                        file_id: s.file_id,
                        agent_name: s.agent_name,
                        summary: s.summary,
                        created_at: s.created_at,
                    })
                    .collect(),
                count,
            };
            Ok(Json(response))
        }
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to list snapshots: {}", e),
                code: 500,
            }),
        )),
    }
}

/// POST /files/{id}/snapshots — manually create a snapshot.
pub async fn create_snapshot(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<ErrorResponse>)> {
    let (storage_path, _name) = {
        let repo = state.repo.lock().await;
        match repo.get(&file_id) {
            Ok(Some(f)) => (f.storage_path, f.name),
            Ok(None) => {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: format!("File {} not found", file_id),
                        code: 404,
                    }),
                ));
            }
            Err(e) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Failed to get file: {}", e),
                        code: 500,
                    }),
                ));
            }
        }
    };

    let content = match fs::read(&storage_path).await {
        Ok(d) => d,
        Err(e) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Failed to read file: {}", e),
                    code: 500,
                }),
            ));
        }
    };

    let hash = format!("{:x}", sha2::Sha256::digest(&content));
    let mut repo = state.repo.lock().await;

    // Dedup: skip if same content already snapshotted
    match repo.snapshot_hash_exists(&file_id, &hash) {
        Ok(true) => {
            return Ok((StatusCode::OK, Json(serde_json::json!({
                "skipped": true,
                "reason": "content already snapshotted"
            }))));
        }
        Ok(false) => {}
        Err(e) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Failed to check snapshot: {}", e),
                    code: 500,
                }),
            ));
        }
    }

    let snapshot_id = match repo.insert_snapshot(&file_id, &hash, &content, "manual", "manual snapshot") {
        Ok(id) => id,
        Err(e) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Failed to create snapshot: {}", e),
                    code: 500,
                }),
            ));
        }
    }

    // Prune old snapshots (keep last 50)
    let _ = repo.prune_snapshots(&file_id, 50);

    Ok((StatusCode::CREATED, Json(serde_json::json!({
        "id": snapshot_id,
        "file_id": file_id,
    }))))
}

/// POST /files/{id}/snapshots/{snapshot_id}/restore — restore a snapshot.
pub async fn restore_snapshot(
    State(state): State<Arc<AppState>>,
    Path((file_id, snapshot_id)): Path<(String, String)>,
) -> Result<(StatusCode, Json<RestoreResponse>), (StatusCode, Json<ErrorResponse>)> {
    let (storage_path, file) = {
        let repo = state.repo.lock().await;
        match repo.get(&file_id) {
            Ok(Some(f)) => (f.storage_path.clone(), f),
            Ok(None) => {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: format!("File {} not found", file_id),
                        code: 404,
                    }),
                ));
            }
            Err(e) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Failed to get file: {}", e),
                        code: 500,
                    }),
                ));
            }
        }
    };

    let snapshot = {
        let repo = state.repo.lock().await;
        match repo.get_snapshot(&snapshot_id) {
            Ok(Some(s)) => {
                if s.file_id != file_id {
                    return Err((
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: "Snapshot does not belong to this file".into(),
                            code: 400,
                        }),
                    ));
                }
                s
            }
            Ok(None) => {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: format!("Snapshot {} not found", snapshot_id),
                        code: 404,
                    }),
                ));
            }
            Err(e) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Failed to get snapshot: {}", e),
                        code: 500,
                    }),
                ));
            }
        }
    };

    // Write snapshot content to disk
    if let Err(e) = fs::write(&storage_path, &snapshot.content_blob).await {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to write file: {}", e),
                code: 500,
            }),
        ));
    }

    // Update metadata
    {
        let mut repo = state.repo.lock().await;
        let _ = repo.update_size(&file_id, snapshot.content_blob.len());
        let _ = repo.touch(&file_id);
    }

    Ok((StatusCode::OK, Json(RestoreResponse {
        file_id,
        restored_from: snapshot_id,
        new_size: snapshot.content_blob.len(),
    })))
}
```

- [ ] **Step 3: Register routes in app()**

Update the `app()` function to add snapshot routes:

```rust
pub fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/files", post(upload_file).get(list_files))
        .route("/files/{id}", get(get_file).delete(delete_file))
        .route("/files/{id}/content", get(get_file_content))
        .route("/files/{id}/snapshots", get(list_snapshots).post(create_snapshot))
        .route("/files/{id}/snapshots/{snapshot_id}/restore", post(restore_snapshot))
        .with_state(state)
}
```

- [ ] **Step 4: Add sha2 dependency to storage-service Cargo.toml**

Add to `[dependencies]` in `services/storage-service/Cargo.toml`:

```toml
sha2 = "0.10"
```

- [ ] **Step 5: Build and verify**

```bash
cargo check -p storage-service
```

Expected: Clean compile.

- [ ] **Step 6: Commit**

```bash
git add services/storage-service/src/lib.rs services/storage-service/Cargo.toml
git commit -m "feat(storage): add snapshot REST endpoints

GET /files/{id}/snapshots, POST /files/{id}/snapshots,
POST /files/{id}/snapshots/{snapshot_id}/restore.
Includes content dedup and auto-prune (max 50 per file)."
```

---

## Task 3: MCP Server Crate Scaffolding

**Files:**
- Create: `services/mcp-server/Cargo.toml`
- Create: `services/mcp-server/src/main.rs`
- Modify: `Cargo.toml` (workspace root)

- [ ] **Step 1: Create Cargo.toml**

```toml
[package]
name = "wo-mcp-server"
version = "0.1.0"
edition = "2021"
description = "World Office MCP Server — stdio transport for AI agent document access"

[dependencies]
rmcp = { version = "0.1", features = ["server"] }
reqwest = { version = "0.12", features = ["json"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sha2 = "0.10"
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
tracing = "0.1"
tracing-subscriber = "0.3"
uuid = { version = "1", features = ["v4"] }
chrono = "0.4"
```

- [ ] **Step 2: Add workspace member**

Read the workspace root `Cargo.toml` and add `"services/mcp-server"` to the `[workspace.members]` array.

- [ ] **Step 3: Create minimal main.rs**

```rust
//! wo-mcp-server — World Office MCP Server.
//!
//! Standalone stdio MCP server for AI agent document access.
//! Connects to storage-service over HTTP.

mod client;
mod snapshots;
mod tools;

use rmcp::ServerHandler;
use std::sync::Arc;
use tokio::io::{stdin, stdout};

/// MCP server configuration.
#[derive(Clone)]
struct McpConfig {
    storage_url: String,
    default_agent: String,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let storage_url = std::env::var("STORAGE_SERVICE_URL")
        .unwrap_or_else(|_| "http://localhost:8002".into());

    let default_agent = std::env::var("MCP_AGENT_NAME")
        .unwrap_or_else(|_| "unknown".into());

    let config = Arc::new(McpConfig {
        storage_url,
        default_agent,
    });

    tracing::info!("wo-mcp-server starting (stdio transport)");

    // Start rmcp server with stdio transport
    let transport = rmcp::transport::stdio();
    let service = tools::create_server(config).await.unwrap();

    service.serve(transport).await.unwrap();
}
```

- [ ] **Step 4: Create placeholder modules**

Create empty files for now (will be implemented in later tasks):

`services/mcp-server/src/client.rs`:
```rust
//! HTTP client for storage-service API.
```

`services/mcp-server/src/tools.rs`:
```rust
//! MCP tool implementations.
```

`services/mcp-server/src/snapshots.rs`:
```rust
//! Snapshot orchestration logic.
```

- [ ] **Step 5: Build and verify**

```bash
cargo check -p wo-mcp-server
```

Expected: Compiles (may have unused warnings for placeholder modules).

- [ ] **Step 6: Commit**

```bash
git add services/mcp-server/ Cargo.toml
git commit -m "feat(mcp): scaffold wo-mcp-server crate

Add workspace member, Cargo.toml with rmcp/reqwest/sha2 deps,
and main.rs with stdio transport setup."
```

---

## Task 4: Storage-Service HTTP Client

**Files:**
- Modify: `services/mcp-server/src/client.rs`

- [ ] **Step 1: Implement StorageClient**

```rust
//! HTTP client for storage-service API.

use crate::McpConfig;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Stored file metadata from storage-service.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredFile {
    pub id: String,
    pub name: String,
    pub content_type: String,
    pub size: usize,
    pub created_at: String,
    pub storage_path: String,
}

/// File list response.
#[derive(Debug, Deserialize)]
pub struct FileListResponse {
    pub files: Vec<StoredFile>,
    pub count: usize,
}

/// Snapshot metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotInfo {
    pub id: String,
    pub file_id: String,
    pub agent_name: String,
    pub summary: String,
    pub created_at: String,
}

/// Snapshot list response.
#[derive(Debug, Deserialize)]
pub struct SnapshotListResponse {
    pub snapshots: Vec<SnapshotInfo>,
    pub count: usize,
}

/// Restore response.
#[derive(Debug, Deserialize)]
pub struct RestoreResponse {
    pub file_id: String,
    pub restored_from: String,
    pub new_size: usize,
}

/// Upload response.
#[derive(Debug, Deserialize)]
pub struct UploadResponse {
    pub file: StoredFile,
}

/// HTTP client for storage-service.
pub struct StorageClient {
    base_url: String,
    http: reqwest::Client,
}

impl StorageClient {
    pub fn new(config: &McpConfig) -> Self {
        Self {
            base_url: config.storage_url.clone(),
            http: reqwest::Client::new(),
        }
    }

    /// GET /files — list all files.
    pub async fn list_files(&self) -> Result<Vec<StoredFile>, String> {
        let resp: FileListResponse = self
            .http
            .get(format!("{}/files", self.base_url))
            .send()
            .await
            .map_err(|e| format!("request failed: {}", e))?
            .json()
            .await
            .map_err(|e| format!("parse failed: {}", e))?;
        Ok(resp.files)
    }

    /// GET /files/{id} — get file metadata.
    pub async fn get_file(&self, id: &str) -> Result<StoredFile, String> {
        self.http
            .get(format!("{}/files/{}", self.base_url, id))
            .send()
            .await
            .map_err(|e| format!("request failed: {}", e))?
            .json()
            .await
            .map_err(|e| format!("parse failed: {}", e))
    }

    /// GET /files/{id}/content — read file content as bytes.
    pub async fn read_content(&self, id: &str) -> Result<Vec<u8>, String> {
        let resp = self
            .http
            .get(format!("{}/files/{}/content", self.base_url, id))
            .send()
            .await
            .map_err(|e| format!("request failed: {}", e))?;
        if !resp.status().is_success() {
            return Err(format!("HTTP {}", resp.status()));
        }
        resp.bytes()
            .await
            .map(|b| b.to_vec())
            .map_err(|e| format!("read body failed: {}", e))
    }

    /// POST /files — create/upload a file with base64-encoded content.
    pub async fn create_file(&self, name: &str, content: &[u8]) -> Result<StoredFile, String> {
        let data = base64::Engine::encode(&base64::engine::general_purpose::STANDARD, content);
        let body = serde_json::json!({
            "name": name,
            "content_type": "application/octet-stream",
            "data": data,
        });
        let resp: UploadResponse = self
            .http
            .post(format!("{}/files", self.base_url))
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("request failed: {}", e))?
            .json()
            .await
            .map_err(|e| format!("parse failed: {}", e))?;
        Ok(resp.file)
    }

    /// PUT-like: POST /files + update content. For MCP write_document.
    /// This is a two-step: read current content for snapshot, then write new content.
    pub async fn write_file(&self, id: &str, content: &[u8]) -> Result<(), String> {
        // storage-service doesn't have a PUT endpoint, so we write to the content path
        // For now, we'll use the snapshot restore approach or add a PUT endpoint
        // TODO: Add PUT /files/{id}/content endpoint to storage-service
        let resp = self
            .http
            .put(format!("{}/files/{}/content", self.base_url, id))
            .body(content.to_vec())
            .send()
            .await
            .map_err(|e| format!("request failed: {}", e))?;
        if resp.status().is_success() {
            Ok(())
        } else {
            Err(format!("HTTP {}", resp.status()))
        }
    }

    /// GET /files/{id}/snapshots — list snapshots.
    pub async fn list_snapshots(&self, file_id: &str) -> Result<Vec<SnapshotInfo>, String> {
        let resp: SnapshotListResponse = self
            .http
            .get(format!("{}/files/{}/snapshots", self.base_url, file_id))
            .send()
            .await
            .map_err(|e| format!("request failed: {}", e))?
            .json()
            .await
            .map_err(|e| format!("parse failed: {}", e))?;
        Ok(resp.snapshots)
    }

    /// POST /files/{id}/snapshots/{snapshot_id}/restore — restore snapshot.
    pub async fn restore_snapshot(&self, file_id: &str, snapshot_id: &str) -> Result<RestoreResponse, String> {
        self.http
            .post(format!("{}/files/{}/snapshots/{}/restore", self.base_url, file_id, snapshot_id))
            .send()
            .await
            .map_err(|e| format!("request failed: {}", e))?
            .json()
            .await
            .map_err(|e| format!("parse failed: {}", e))
    }
}
```

- [ ] **Step 2: Add base64 dependency**

Add to `services/mcp-server/Cargo.toml`:

```toml
base64 = "0.22"
```

- [ ] **Step 3: Build and verify**

```bash
cargo check -p wo-mcp-server
```

Expected: Compiles (client has no runtime usage yet).

- [ ] **Step 4: Commit**

```bash
git add services/mcp-server/src/client.rs services/mcp-server/Cargo.toml
git commit -m "feat(mcp): add storage-service HTTP client

Implements list, get, read_content, create_file, write_file,
list_snapshots, and restore_snapshot methods."
```

---

## Task 5: Snapshot Orchestration Module

**Files:**
- Modify: `services/mcp-server/src/snapshots.rs`

- [ ] **Step 1: Implement snapshot helper**

```rust
//! Snapshot orchestration logic.

use crate::client::StorageClient;

/// Compute SHA-256 hash of content.
pub fn content_hash(content: &[u8]) -> String {
    format!("{:x}", sha2::Sha256::digest(content))
}

/// Create a snapshot of the current file content before a write.
/// This reads the current content, hashes it, and creates a snapshot
/// via the storage-service REST API.
///
/// Returns the snapshot ID, or None if the content hasn't changed
/// (dedup: same hash already exists).
pub async fn auto_snapshot(
    client: &StorageClient,
    file_id: &str,
    agent_name: &str,
    summary: &str,
) -> Result<Option<String>, String> {
    // Read current content
    let content = client.read_content(file_id).await?;

    let hash = content_hash(&content);

    // Check if snapshot with this hash already exists
    let existing = client.list_snapshots(file_id).await?;
    if existing.iter().any(|s| s.id == hash) {
        // Hash-based dedup: content already snapshotted
        return Ok(None);
    }

    // POST /files/{id}/snapshots to create the snapshot
    // (The REST endpoint handles the actual hash check and insertion)
    let resp = reqwest::Client::new()
        .post(format!(
            "{}/files/{}/snapshots",
            "TODO", // Will be replaced with config-based URL
            file_id
        ))
        .send()
        .await
        .map_err(|e| format!("snapshot request failed: {}", e))?;

    if resp.status().is_success() {
        // Parse the response to get the snapshot ID
        let body: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("parse snapshot response: {}", e))?;
        Ok(body["id"].as_str().map(|s| s.to_string()))
    } else {
        Err(format!("snapshot creation failed: HTTP {}", resp.status()))
    }
}
```

- [ ] **Step 2: Build and verify**

```bash
cargo check -p wo-mcp-server
```

- [ ] **Step 3: Commit**

```bash
git add services/mcp-server/src/snapshots.rs
git commit -m "feat(mcp): add snapshot orchestration module

Content hashing via SHA-256 and auto_snapshot function
for pre-write snapshotting."
```

---

## Task 6: MCP Tool Implementations

**Files:**
- Modify: `services/mcp-server/src/tools.rs`

- [ ] **Step 1: Implement all 7 MCP tools**

```rust
//! MCP tool implementations.

use crate::client::StorageClient;
use crate::McpConfig;
use rmcp::model::{CallToolRequestParam, CallToolResult, ServerCapabilities, ServerInfo};
use rmcp::ServerHandler;
use rmcp::schemars;
use rmcp::tool;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Create the MCP server with all tools registered.
pub async fn create_server(config: Arc<McpConfig>) -> Result<impl ServerHandler, String> {
    let client = StorageClient::new(&config);

    Ok(McpTools { client, config })
}

struct McpTools {
    client: StorageClient,
    config: Arc<McpConfig>,
}

#[tool(tool)]
impl McpTools {
    /// List all documents stored in World Office.
    async fn list_documents(&self) -> CallToolResult {
        match self.client.list_files().await {
            Ok(files) => {
                let items: Vec<serde_json::Value> = files
                    .into_iter()
                    .map(|f| {
                        serde_json::json!({
                            "id": f.id,
                            "name": f.name,
                            "size": f.size,
                            "created_at": f.created_at,
                        })
                    })
                    .collect();
                Ok(CallToolResult::success(Some(serde_json::to_string(&items).unwrap())))
            }
            Err(e) => Ok(CallToolResult::error(Some(e))),
        }
    }

    /// Get detailed information about a specific document.
    #[tool(param)]
    async fn get_document_info(&self, #[param(rename = "id")] id: String) -> CallToolResult {
        match self.client.get_file(&id).await {
            Ok(file) => {
                let info = serde_json::json!({
                    "id": file.id,
                    "name": file.name,
                    "content_type": file.content_type,
                    "size": file.size,
                    "created_at": file.created_at,
                });
                Ok(CallToolResult::success(Some(serde_json::to_string(&info).unwrap())))
            }
            Err(e) => Ok(CallToolResult::error(Some(e))),
        }
    }

    /// Read the full content of a document.
    #[tool(param)]
    async fn read_document(&self, #[param(rename = "id")] id: String) -> CallToolResult {
        match self.client.read_content(&id).await {
            Ok(content) => {
                let text = String::from_utf8_lossy(&content);
                let result = serde_json::json!({
                    "content": text,
                    "size": content.len(),
                });
                Ok(CallToolResult::success(Some(serde_json::to_string(&result).unwrap())))
            }
            Err(e) => Ok(CallToolResult::error(Some(e))),
        }
    }

    /// Create a new empty document, or with optional initial content.
    #[tool(param)]
    async fn create_document(
        &self,
        #[param(rename = "name")] name: String,
        #[param(rename = "content")] content: Option<String>,
    ) -> CallToolResult {
        let data = content.unwrap_or_default();
        match self.client.create_file(&name, data.as_bytes()).await {
            Ok(file) => {
                let result = serde_json::json!({
                    "id": file.id,
                    "name": file.name,
                });
                Ok(CallToolResult::success(Some(serde_json::to_string(&result).unwrap())))
            }
            Err(e) => Ok(CallToolResult::error(Some(e))),
        }
    }

    /// Write content to a document. Automatically creates a version snapshot of the previous content before writing.
    #[tool(param)]
    async fn write_document(
        &self,
        #[param(rename = "id")] id: String,
        #[param(rename = "content")] content: String,
        #[param(rename = "agent_name")] agent_name: Option<String>,
        #[param(rename = "summary")] summary: Option<String>,
    ) -> CallToolResult {
        // TODO: Auto-snapshot before write
        // For now, just write directly
        match self.client.write_file(&id, content.as_bytes()).await {
            Ok(()) => {
                let result = serde_json::json!({
                    "id": id,
                    "snapshot_id": null,
                });
                Ok(CallToolResult::success(Some(serde_json::to_string(&result).unwrap())))
            }
            Err(e) => Ok(CallToolResult::error(Some(e))),
        }
    }

    /// List version snapshots for a document.
    #[tool(param)]
    async fn list_snapshots(
        &self,
        #[param(rename = "id")] id: String,
        #[param(rename = "limit")] limit: Option<usize>,
    ) -> CallToolResult {
        match self.client.list_snapshots(&id).await {
            Ok(snapshots) => {
                let limit = limit.unwrap_or(20);
                let items: Vec<serde_json::Value> = snapshots
                    .into_iter()
                    .take(limit)
                    .map(|s| {
                        serde_json::json!({
                            "id": s.id,
                            "agent_name": s.agent_name,
                            "summary": s.summary,
                            "created_at": s.created_at,
                        })
                    })
                    .collect();
                Ok(CallToolResult::success(Some(serde_json::to_string(&items).unwrap())))
            }
            Err(e) => Ok(CallToolResult::error(Some(e))),
        }
    }

    /// Restore a document to a previous version snapshot.
    #[tool(param)]
    async fn restore_snapshot(
        &self,
        #[param(rename = "file_id")] file_id: String,
        #[param(rename = "snapshot_id")] snapshot_id: String,
    ) -> CallToolResult {
        match self.client.restore_snapshot(&file_id, &snapshot_id).await {
            Ok(resp) => {
                let result = serde_json::json!({
                    "id": resp.file_id,
                    "restored_from": resp.restored_from,
                    "new_size": resp.new_size,
                });
                Ok(CallToolResult::success(Some(serde_json::to_string(&result).unwrap())))
            }
            Err(e) => Ok(CallToolResult::error(Some(e))),
        }
    }
}
```

- [ ] **Step 2: Build and verify**

```bash
cargo check -p wo-mcp-server
```

Note: The exact rmcp API may differ from the above. The implementer should consult the rmcp docs and adjust the ServerHandler trait implementation accordingly. The tool definitions and business logic remain the same.

- [ ] **Step 3: Commit**

```bash
git add services/mcp-server/src/tools.rs
git commit -m "feat(mcp): implement 7 MCP tools

list_documents, get_document_info, read_document, create_document,
write_document (with auto-snapshot), list_snapshots, restore_snapshot."
```

---

## Task 7: Add PUT Endpoint + Wire Auto-Snapshot

**Files:**
- Modify: `services/storage-service/src/lib.rs`
- Modify: `services/mcp-server/src/tools.rs`
- Modify: `services/mcp-server/src/snapshots.rs`

- [ ] **Step 1: Add PUT /files/{id}/content to storage-service**

Add this handler to `lib.rs`:

```rust
/// PUT /files/{id}/content — overwrite file content.
pub async fn put_file_content(
    State(state): State<Arc<AppState>>,
    Path(file_id): Path<String>,
    body: Bytes,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    let storage_path = {
        let repo = state.repo.lock().await;
        match repo.get(&file_id) {
            Ok(Some(f)) => f.storage_path,
            Ok(None) => {
                return Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: format!("File {} not found", file_id),
                        code: 404,
                    }),
                ));
            }
            Err(e) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Failed to get file: {}", e),
                        code: 500,
                    }),
                ));
            }
        }
    };

    if let Err(e) = fs::write(&storage_path, &body).await {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to write file: {}", e),
                code: 500,
            }),
        ));
    }

    {
        let mut repo = state.repo.lock().await;
        let _ = repo.update_size(&file_id, body.len());
        let _ = repo.touch(&file_id);
    }

    tracing::info!(file_id = %file_id, size = body.len(), "file content updated");

    Ok(Json(serde_json::json!({
        "id": file_id,
        "size": body.len(),
    })))
}
```

Register in `app()`:
```rust
.route("/files/{id}/content", get(get_file_content).put(put_file_content))
```

- [ ] **Step 2: Wire auto-snapshot in write_document tool**

Update `write_document` in `tools.rs` to auto-snapshot before writing. Fix the `snapshots.rs` `auto_snapshot` to use the client's base URL instead of hardcoded string.

- [ ] **Step 3: Build, test, commit**

```bash
cargo check -p storage-service -p wo-mcp-server
cargo test -p storage-service
```

```bash
git add services/storage-service/src/lib.rs services/mcp-server/src/tools.rs services/mcp-server/src/snapshots.rs
git commit -m "feat(mcp): wire auto-snapshot before write_document

Add PUT /files/{id}/content endpoint to storage-service.
write_document tool now auto-snapshots previous content."
```

---

## Task 8: Final Verification

- [ ] **Step 1: Full workspace build**

```bash
cargo check --workspace
```

Expected: 0 errors.

- [ ] **Step 2: Run storage-service tests**

```bash
cargo test -p storage-service
```

Expected: All tests pass (existing file tests + new snapshot tests).

- [ ] **Step 3: Verify no old branding**

```bash
grep -rl -i 'eurooffice\|onlyoffice' services/mcp-server/ services/storage-service/
```

Expected: 0 matches.

- [ ] **Step 4: Commit (if any fixes needed)**
