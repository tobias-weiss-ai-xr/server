// Static file serving for the React editor UI.

use axum::response::Html;
use std::path::Path;
use tower_http::services::ServeDir;

/// Inline landing page served when the editor UI directory is absent.
pub const LANDING_HTML: &str = r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>World-Office Document Server</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f0f2f5;
            color: #333;
        }
        .card {
            text-align: center;
            padding: 3rem 4rem;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        h1 { color: #1a73e8; margin-bottom: 0.5rem; font-size: 1.75rem; }
        p  { color: #666; font-size: 1rem; }
        .status { display: inline-block; margin-top: 1rem; padding: 0.4rem 1rem; background: #e8f5e9; color: #2e7d32; border-radius: 20px; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>World-Office Document Server</h1>
        <p>Document editing server is running.</p>
        <span class="status">Operational</span>
    </div>
</body>
</html>"#;

/// Handler that returns the fallback landing page.
pub async fn landing_page_handler() -> Html<&'static str> {
    Html(LANDING_HTML)
}

/// Build a static file service for the editor UI directory.
///
/// Returns a tower service that serves files from `editor_ui_dir`.
/// If the directory does not exist or is empty, the caller should
/// fall back to [`landing_page_handler`].
pub fn editor_ui_service(editor_ui_dir: &str) -> Option<ServeDir> {
    let dir = Path::new(editor_ui_dir);
    if !dir.exists() || !dir.is_dir() {
        return None;
    }
    // Treat empty directory as absent
    let has_files = std::fs::read_dir(dir)
        .map(|mut entries| entries.next().is_some())
        .unwrap_or(false);
    if !has_files {
        return None;
    }
    Some(ServeDir::new(dir))
}
