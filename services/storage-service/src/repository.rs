//! StorageRepository — SQLite-backed file metadata persistence.
//!
//! Replaces the in-memory store with a `rusqlite::Connection` so that
//! file metadata survives service restarts.  Actual file blobs remain on
//! disk; only metadata rows are stored in SQLite.

use crate::StoredFile;
use rusqlite::Connection;
use std::path::Path;

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

    /// Create the `files` table if it does not yet exist.
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
            );",
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
}
