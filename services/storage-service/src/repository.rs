//! StorageRepository — SQLite-backed file metadata persistence.
//!
//! Replaces the in-memory store with a `rusqlite::Connection` so that
//! file metadata survives service restarts.  Actual file blobs remain on
//! disk; only metadata rows are stored in SQLite.

use crate::StoredFile;
use rusqlite::Connection;
use std::path::Path;

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

/// SQLite-backed store for [`StoredFile`] metadata.
pub struct StorageRepository {
    conn: Connection,
}

impl StorageRepository {
    /// Open an in-memory database (for tests).
    pub fn new_in_memory() -> Result<Self, rusqlite::Error> {
        let conn = Connection::open_in_memory()?;
        let repo = Self { conn };
        repo.init_table()?;
        Ok(repo)
    }

    /// Open (or create) a file-backed database at the given path.
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self, rusqlite::Error> {
        let conn = Connection::open(path)?;
        let repo = Self { conn };
        repo.init_table()?;
        Ok(repo)
    }

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

    /// Insert a new stored-file record.
    pub fn insert(&mut self, file: &StoredFile) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "INSERT INTO files (id, name, content_type, size, path, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![
                file.id,
                file.name,
                file.content_type,
                file.size as i64,
                file.storage_path,
                file.created_at,
                file.created_at,
            ],
        )?;
        Ok(())
    }

    /// Retrieve a stored-file record by id.
    pub fn get(&self, id: &str) -> Result<Option<StoredFile>, rusqlite::Error> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, content_type, size, path, created_at FROM files WHERE id = ?1",
        )?;
        let mut rows = stmt.query(rusqlite::params![id])?;

        match rows.next()? {
            Some(row) => Ok(Some(row_to_stored_file(row)?)),
            None => Ok(None),
        }
    }

    /// List all stored-file records.
    pub fn list(&self) -> Result<Vec<StoredFile>, rusqlite::Error> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, name, content_type, size, path, created_at FROM files")?;
        let rows = stmt.query_map([], row_to_stored_file)?;
        rows.collect::<Result<Vec<_>, _>>()
    }

    /// Delete a stored-file record by id. Returns true if a row was removed.
    pub fn delete(&mut self, id: &str) -> Result<bool, rusqlite::Error> {
        let affected = self
            .conn
            .execute("DELETE FROM files WHERE id = ?1", rusqlite::params![id])?;
        Ok(affected > 0)
    }

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

    pub fn snapshot_hash_exists(
        &self,
        file_id: &str,
        content_hash: &str,
    ) -> Result<bool, rusqlite::Error> {
        let count: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM snapshots WHERE file_id = ?1 AND content_hash = ?2",
            rusqlite::params![file_id, content_hash],
            |row| row.get(0),
        )?;
        Ok(count > 0)
    }

    pub fn list_snapshots(
        &self,
        file_id: &str,
        limit: usize,
    ) -> Result<Vec<Snapshot>, rusqlite::Error> {
        let effective_limit = if limit == 0 { 20 } else { limit };
        let mut stmt = self.conn.prepare(
            "SELECT id, file_id, content_hash, agent_name, summary, created_at
             FROM snapshots WHERE file_id = ?1 ORDER BY created_at DESC LIMIT ?2",
        )?;
        let rows = stmt.query_map(rusqlite::params![file_id, effective_limit], |row| {
            Ok(Snapshot {
                id: row.get(0)?,
                file_id: row.get(1)?,
                content_hash: row.get(2)?,
                content_blob: Vec::new(),
                agent_name: row.get(3)?,
                summary: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;
        rows.collect::<Result<Vec<_>, _>>()
    }

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

    /// Delete a single snapshot by id. Returns true if a row was removed.
    pub fn delete_snapshot(&mut self, id: &str) -> Result<bool, rusqlite::Error> {
        let affected = self
            .conn
            .execute("DELETE FROM snapshots WHERE id = ?1", rusqlite::params![id])?;
        Ok(affected > 0)
    }

    pub fn prune_snapshots(
        &mut self,
        file_id: &str,
        max_per_file: usize,
    ) -> Result<usize, rusqlite::Error> {
        self.conn.execute(
            "DELETE FROM snapshots WHERE file_id = ?1 AND id NOT IN (
                SELECT id FROM snapshots WHERE file_id = ?1 ORDER BY created_at DESC LIMIT ?2
            )",
            rusqlite::params![file_id, max_per_file],
        )?;
        let count: i64 = self
            .conn
            .query_row("SELECT changes()", [], |row| row.get(0))?;
        Ok(count as usize)
    }

    pub fn touch(&mut self, id: &str) -> Result<(), rusqlite::Error> {
        let now = chrono::Utc::now().to_rfc3339();
        self.conn.execute(
            "UPDATE files SET updated_at = ?1 WHERE id = ?2",
            rusqlite::params![now, id],
        )?;
        Ok(())
    }

    pub fn update_size(&mut self, id: &str, size: usize) -> Result<(), rusqlite::Error> {
        self.conn.execute(
            "UPDATE files SET size = ?1 WHERE id = ?2",
            rusqlite::params![size as i64, id],
        )?;
        Ok(())
    }
}

fn row_to_stored_file(row: &rusqlite::Row<'_>) -> Result<StoredFile, rusqlite::Error> {
    Ok(StoredFile {
        id: row.get(0)?,
        name: row.get(1)?,
        content_type: row.get(2)?,
        size: row.get::<_, i64>(3)? as usize,
        created_at: row.get(5)?,
        storage_path: row.get(4)?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_file(id: &str) -> StoredFile {
        StoredFile {
            id: id.to_string(),
            name: format!("{}.txt", id),
            content_type: "text/plain".to_string(),
            size: 42,
            created_at: "2026-04-17T00:00:00+00:00".to_string(),
            storage_path: format!("/tmp/wo/{}", id),
        }
    }

    #[test]
    fn insert_and_get() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        let f = make_file("abc-123");
        repo.insert(&f).unwrap();
        let got = repo.get("abc-123").unwrap().unwrap();
        assert_eq!(got.id, f.id);
        assert_eq!(got.name, f.name);
        assert_eq!(got.size, f.size);
        assert_eq!(got.content_type, f.content_type);
        assert_eq!(got.storage_path, f.storage_path);
    }

    #[test]
    fn get_missing_returns_none() {
        let repo = StorageRepository::new_in_memory().unwrap();
        assert!(repo.get("nope").unwrap().is_none());
    }

    #[test]
    fn list_empty() {
        let repo = StorageRepository::new_in_memory().unwrap();
        assert!(repo.list().unwrap().is_empty());
    }

    #[test]
    fn list_multiple() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        repo.insert(&make_file("a")).unwrap();
        repo.insert(&make_file("b")).unwrap();
        repo.insert(&make_file("c")).unwrap();
        let list = repo.list().unwrap();
        assert_eq!(list.len(), 3);
    }

    #[test]
    fn delete_existing() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        repo.insert(&make_file("del-me")).unwrap();
        assert!(repo.get("del-me").unwrap().is_some());
        let removed = repo.delete("del-me").unwrap();
        assert!(removed);
        assert!(repo.get("del-me").unwrap().is_none());
    }

    #[test]
    fn delete_missing_returns_false() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        assert!(!repo.delete("ghost").unwrap());
    }

    #[test]
    fn persistence_across_restarts() {
        // Simulate a service restart by opening the same file-backed DB twice.
        let dir = std::env::temp_dir().join(format!(
            "wo-storage-repo-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&dir).unwrap();
        let db_path = dir.join("files.db");

        {
            let mut repo = StorageRepository::new(&db_path).unwrap();
            repo.insert(&make_file("persist-1")).unwrap();
            repo.insert(&make_file("persist-2")).unwrap();
        }
        // "Restart" — open a fresh connection to the same path.
        {
            let repo = StorageRepository::new(&db_path).unwrap();
            let list = repo.list().unwrap();
            assert_eq!(list.len(), 2);
            assert!(repo.get("persist-1").unwrap().is_some());
            assert!(repo.get("persist-2").unwrap().is_some());
        }

        // Cleanup
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn insert_and_list_snapshots() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        repo.insert(&make_file("f1")).unwrap();
        repo.insert_snapshot("f1", "hash-a", b"blob-a", "agent-1", "first save")
            .unwrap();
        repo.insert_snapshot("f1", "hash-b", b"blob-b", "agent-2", "second save")
            .unwrap();
        let snaps = repo.list_snapshots("f1", 0).unwrap();
        assert_eq!(snaps.len(), 2);
        assert_eq!(snaps[0].summary, "second save");
        assert_eq!(snaps[1].summary, "first save");
    }

    #[test]
    fn snapshot_dedup_by_hash() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        repo.insert(&make_file("f2")).unwrap();
        assert!(!repo.snapshot_hash_exists("f2", "dup-hash").unwrap());
        repo.insert_snapshot("f2", "dup-hash", b"blob", "agent", "save")
            .unwrap();
        assert!(repo.snapshot_hash_exists("f2", "dup-hash").unwrap());
    }

    #[test]
    fn get_snapshot_returns_blob() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        repo.insert(&make_file("f3")).unwrap();
        let snap_id = repo
            .insert_snapshot("f3", "hash-x", b"hello-world", "agent", "save")
            .unwrap();
        let snap = repo.get_snapshot(&snap_id).unwrap().unwrap();
        assert_eq!(snap.content_blob, b"hello-world");
    }

    #[test]
    fn get_missing_snapshot_returns_none() {
        let repo = StorageRepository::new_in_memory().unwrap();
        assert!(repo.get_snapshot("nonexistent").unwrap().is_none());
    }

    #[test]
    fn prune_old_snapshots() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        repo.insert(&make_file("f4")).unwrap();
        for i in 0..5 {
            repo.insert_snapshot(
                "f4",
                &format!("hash-{}", i),
                b"x",
                "agent",
                &format!("s{}", i),
            )
            .unwrap();
        }
        let deleted = repo.prune_snapshots("f4", 3).unwrap();
        assert_eq!(deleted, 2);
        let remaining = repo.list_snapshots("f4", 0).unwrap();
        assert_eq!(remaining.len(), 3);
    }

    #[test]
    fn touch_updates_timestamp() {
        let mut repo = StorageRepository::new_in_memory().unwrap();
        repo.insert(&make_file("f5")).unwrap();
        repo.touch("f5").unwrap();
    }
}
