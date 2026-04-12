// wo-webdav — World-Office WebDAV server implementation
//
// This crate implements RFC 4918 WebDAV (Web Distributed Authoring and Versioning)
// for remote file management. It provides a WebDAV server with support for
// PROPFIND, PROPPATCH, GET, PUT, DELETE, MKCOL, COPY, MOVE, LOCK, and UNLOCK operations.

pub mod server;
pub mod handlers;
pub mod models;
pub mod lock;
pub mod fs;
pub mod storage;

pub use server::WebDavServer;
pub use fs::{FileSystem, DavResource};
pub use lock::{LockManager, LockInfo};
pub use storage::{WebDavStorage, ResourceInfo, LockDepth};
pub use models::{
    MultiStatus, PropStat, Prop, DavResponse,
    LockType, LockScope, ActiveLock, LockToken, Owner,
    PropFind, LockInfo as WebDavLockInfo,
};

/// Result type for WebDAV operations.
pub type Result<T> = std::result::Result<T, WebDavError>;

/// WebDAV server errors.
#[derive(Debug, thiserror::Error)]
pub enum WebDavError {
    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Access denied: {0}")]
    AccessDenied(String),

    #[error("Lock conflict: {0}")]
    LockConflict(String),

    #[error("Invalid request: {0}")]
    InvalidRequest(String),

    #[error("Precondition failed: {0}")]
    PreconditionFailed(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("XML error: {0}")]
    Xml(String),

    #[error("Storage error: {0}")]
    Storage(#[from] anyhow::Error),

    #[error("File system error: {0}")]
    FileSystem(String),

    #[error("Internal error: {0}")]
    Internal(String),
}
