//! WebDAV storage abstraction
//!
//! This module defines the WebDavStorage trait which abstracts storage operations
//! for WebDAV resources. The LocalStorage implementation provides a filesystem-based
//! storage backend using the FileSystem and LockManager modules.

use anyhow::Result;
use chrono::{DateTime, Utc};

/// Information about a WebDAV resource
#[derive(Debug, Clone)]
pub struct ResourceInfo {
    /// Path of the resource
    pub path: String,
    /// Whether this is a collection (directory)
    pub is_collection: bool,
    /// Size in bytes (files only)
    pub size: u64,
    /// Last modified timestamp
    pub modified: DateTime<Utc>,
    /// ETag of the resource
    pub etag: String,
    /// Content type
    pub content_type: String,
}

/// Lock depth
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LockDepth {
    /// Lock only the resource itself
    Zero,
    /// Lock the resource and immediate children
    One,
    /// Lock the resource and all descendants
    Infinity,
}

/// Lock information (storage layer)
#[derive(Debug, Clone)]
pub struct LockInfo {
    /// Lock token
    pub token: String,
    /// Owner of the lock
    pub owner: String,
    /// Depth of the lock
    pub depth: LockDepth,
    /// When the lock was created
    pub created: DateTime<Utc>,
    /// When the lock expires (None for infinite)
    pub expires: Option<DateTime<Utc>>,
}

/// WebDAV storage trait
///
/// This trait defines the interface for WebDAV storage backends.
/// Implementations can use filesystems, cloud storage, or other storage mechanisms.
#[async_trait::async_trait]
pub trait WebDavStorage: Send + Sync + Clone {
    /// Get information about a resource
    async fn get_resource(&self, path: &str) -> Result<ResourceInfo>;

    /// Read a file's content
    async fn read_resource(&self, path: &str) -> Result<Vec<u8>>;

    /// Write content to a file
    async fn write_resource(&self, path: &str, data: Vec<u8>) -> Result<()>;

    /// Delete a resource
    async fn delete_resource(&self, path: &str) -> Result<()>;

    /// Create a collection (directory)
    async fn create_collection(&self, path: &str) -> Result<()>;

    /// List children of a collection
    async fn list_children(&self, path: &str) -> Result<Vec<ResourceInfo>>;

    /// Copy a resource
    async fn copy_resource(&self, source: &str, destination: &str, overwrite: bool) -> Result<()>;

    /// Move a resource
    async fn move_resource(&self, source: &str, destination: &str, overwrite: bool) -> Result<()>;

    /// Check if a resource exists
    async fn exists(&self, path: &str) -> Result<bool>;

    /// Acquire a lock on a resource
    async fn lock_resource(
        &self,
        path: &str,
        owner: String,
        _depth: LockDepth,
        timeout_seconds: Option<u32>,
    ) -> Result<String>;

    async fn unlock_resource(&self, path: &str, token: &str) -> Result<()>;

    async fn is_locked(&self, path: &str) -> Result<bool>;
}

#[cfg(test)]
mod tests {
    // TODO: Implement LocalStorage struct and enable these tests
    /*
    #[tokio::test]
    async fn test_local_storage_basic() {
        let temp_dir = tempfile::tempdir().unwrap();
        let storage = LocalStorage::new(temp_dir.path().to_path_buf()).unwrap();

        // Test creating a collection
        storage.create_collection("/test").await.unwrap();

        // Test existence
        assert!(storage.exists("/test").await.unwrap());

        // Test getting resource info
        let info = storage.get_resource("/test").await.unwrap();
        assert!(info.is_collection);

        // Test writing and reading a file
        storage
            .write_resource("/test/file.txt", b"Hello, World!".to_vec())
            .await
            .unwrap();

        let data = storage.read_resource("/test/file.txt").await.unwrap();
        assert_eq!(data, b"Hello, World!");

        // Test listing children
        let children = storage.list_children("/test").await.unwrap();
        assert_eq!(children.len(), 1);
        assert_eq!(children[0].path, "/test/file.txt");
    }

    #[tokio::test]
    async fn test_local_storage_lock() {
        let temp_dir = tempfile::tempdir().unwrap();
        let storage = LocalStorage::new(temp_dir.path().to_path_buf()).unwrap();

        // Create a file
        storage
            .write_resource("/test.txt", b"test".to_vec())
            .await
            .unwrap();

        // Test lock
        let token = storage
            .lock_resource("/test.txt", "owner1".to_string(), LockDepth::Zero, Some(60))
            .await
            .unwrap();

        // Test is locked
        assert!(storage.is_locked("/test.txt").await.unwrap());

        // Test unlock
        storage.unlock_resource("/test.txt", &token).await.unwrap();

        // Test no longer locked
        assert!(!storage.is_locked("/test.txt").await.unwrap());
    }
    */
}
