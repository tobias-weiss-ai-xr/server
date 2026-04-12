//! WebDAV HTTP server implementation
//!
//! This module provides the WebDavServer struct which runs an HTTP server
//! supporting WebDAV protocol methods.

use crate::handlers::{
    copy_handler, delete_handler, get_handler, head_handler, lock_handler,
    mkcol_handler, move_handler, propfind_handler, put_handler, unlock_handler, WebDavState,
};
use crate::storage::WebDavStorage;
use anyhow::Result;
use axum::{Router, routing::get};
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::net::TcpListener;

/// WebDAV HTTP server
///
/// This server implements the WebDAV protocol over HTTP, supporting standard
/// file operations like listing, creating, reading, updating, and deleting
/// files and directories.
pub struct WebDavServer<S: WebDavStorage> {
    /// Server host address
    host: String,
    /// Server port
    port: u16,
    /// Storage backend
    storage: Arc<S>,
    /// Authentication realm
    realm: String,
}

impl<S: WebDavStorage + 'static> WebDavServer<S> {
    /// Create a new WebDAV server with local filesystem storage
    ///
    /// # Arguments
    ///
    /// * `host` - Host address to bind to
    /// * `port` - Port to listen on
    /// * `base_dir` - Base directory for file storage
    /// * `realm` - Authentication realm
    pub fn new(
        host: String,
        port: u16,
        storage: S,
        realm: String,
    ) -> Result<Self, anyhow::Error> {
        Ok(Self {
            host,
            port,
            storage: Arc::new(storage),
            realm,
        })
    }

    /// Run WebDAV server
    ///
    /// This starts HTTP server and listens for incoming connections.
    /// The server will run until returned handle is dropped or an error occurs.
    pub async fn run(&self) -> Result<(), anyhow::Error> {
        let state = WebDavState {
            storage: self.storage.clone(),
            realm: self.realm.clone(),
        };

        // Build router
        let app = self.build_router(state)?;

        // Bind to address
        let addr = format!("{}:{}", self.host, self.port);
        let listener = TcpListener::bind(&addr)
            .await
            .unwrap_or_else(|_| panic!("Failed to bind to {}", addr));

        println!("WebDAV server listening on http://{}", addr);

        // Start server
        axum::serve(listener, app)
            .await
            .map_err(|e| anyhow::anyhow!("Server error: {}", e))?;

        Ok(())
    }

    /// Build the axum router
    fn build_router(&self, state: WebDavState<S>) -> Result<Router, anyhow::Error> {
        // Build router with WebDAV methods
        let app = Router::new()
            // Standard HTTP methods
            .route("/", get(get_handler::<S>))
            .route("/*path", get(get_handler::<S>))
            .route("/*path", axum::routing::put(put_handler::<S>))
            .route("/*path", axum::routing::delete(delete_handler::<S>))
            .route("/*path", axum::routing::options(options_handler))
            .with_state(state);

        Ok(app)
    }

    /// Get server address
    pub fn address(&self) -> SocketAddr {
        format!("{}:{}", self.host, self.port)
            .parse()
            .unwrap_or_else(|_| SocketAddr::from(([127, 0, 0, 1], 8080)))
    }
}

/// Handle OPTIONS request
pub async fn options_handler() -> impl axum::response::IntoResponse {
    (
        axum::http::StatusCode::OK,
        [
            ("Allow", "OPTIONS, GET, HEAD, POST, PUT, DELETE, MKCOL, PROPFIND, PROPPATCH, MOVE, COPY, LOCK, UNLOCK"),
            ("DAV", "1, 2"),
            ("MS-Author-Via", "DAV"),
        ],
    )
}

/// Create a WebDAV server with local filesystem storage
///
/// # Arguments
///
/// * `host` - Host address to bind to
/// * `port` - Port to listen on
/// * `base_dir` - Base directory for file storage
/// * `realm` - Authentication realm (optional)
///
/// # Example
///
/// ```no_run
/// use wo_webdav::server::create_local_server;
///
/// #[tokio::main]
/// async fn main() -> anyhow::Result<()> {
///     let server = create_local_server(
///         "127.0.0.1".to_string(),
///         8080,
///         "/tmp/webdav".into(),
///         "WebDAV".to_string(),
///     )?;
///
///     server.run().await?;
///     Ok(())
/// }
/// ```
// TODO: Implement LocalStorage struct
/*
pub fn create_local_server(
    host: String,
    port: u16,
    base_dir: PathBuf,
    realm: String,
) -> Result<WebDavServer<LocalStorage>, anyhow::Error> {
    let storage = LocalStorage::new(base_dir)?;
    WebDavServer::new(host, port, storage, realm)
}
*/

#[cfg(test)]
mod tests {
    use super::*;

    /*
    #[tokio::test]
    async fn test_create_local_server() {
        let server = create_local_server(
            "127.0.0.1".to_string(),
            8080,
            std::path::PathBuf::from("/tmp/test"),
            "Test Realm".to_string(),
        );

        assert_eq!(server.host, "127.0.0.1");
        assert_eq!(server.port, 8080);
        assert_eq!(server.realm, "Test Realm");
    }
    */
}
