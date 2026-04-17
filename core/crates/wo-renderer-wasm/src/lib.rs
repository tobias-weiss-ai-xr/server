// wo-renderer-wasm -- WASM bindings for World-Office rendering engine
//!
//! Provides JavaScript-callable functions for rendering documents
//! to HTML5 Canvas elements.
//!
//! This module exports canvas rendering functions that allow JavaScript
//! code to create and manipulate canvas instances, render shapes and text,
//! and retrieve pixel data.

pub mod canvas_bridge;

use wasm_bindgen::prelude::*;

// Re-export canvas functions
pub use canvas_bridge::{create_canvas, flush_to_canvas, get_pixel_data};

/// Initialize the WASM module.
///
/// Sets up panic hook for better error messages in the browser.
/// Call this before using any other functions.
///
/// # Example
/// ```javascript
/// init();
/// const handle = create_canvas(800, 600);
/// ```
#[wasm_bindgen]
pub fn init() {
    // Set up panic hook for better error messages in the browser
    #[cfg(target_arch = "wasm32")]
    {
        console_error_panic_hook::set_once();
    }
}

/// Render a document page to a canvas.
///
/// This function creates a canvas, renders a document page to it,
/// and returns the canvas handle for further manipulation or
/// retrieval of pixel data.
///
/// # Arguments
/// * `doc_bytes` - Document bytes (e.g., from a DOCX or PDF file)
/// * `format` - Document format identifier (e.g., "docx", "pdf", "odt")
/// * `width` - Output width in pixels (optional, defaults to page width at 96 DPI)
/// * `height` - Output height in pixels (optional, defaults to page height at 96 DPI)
///
/// # Returns
/// * `Result<u32, String>` - Canvas handle on success, error message on failure
///
/// # Example
/// ```javascript
/// const handle = await render_page(docBytes, "docx", 800, 600);
/// if (typeof handle !== 'number') {
///   console.error(handle); // Error message
/// } else {
///   const pixels = get_pixel_data(handle);
/// }
/// ```
#[wasm_bindgen]
pub fn render_page(
    doc_bytes: &[u8],
    format: &str,
    width: Option<u32>,
    height: Option<u32>,
) -> Result<u32, String> {
    // Validate inputs
    if doc_bytes.is_empty() {
        return Err("Document bytes are empty".to_string());
    }

    if format.is_empty() {
        return Err("Format is required".to_string());
    }

    // Use provided dimensions or defaults
    let canvas_width = width.unwrap_or(800);
    let canvas_height = height.unwrap_or(600);

    if canvas_width == 0 || canvas_height == 0 {
        return Err("Width and height must be greater than zero".to_string());
    }

    // Create a canvas
    let handle = canvas_bridge::create_canvas(canvas_width, canvas_height);
    if handle == 0 {
        return Err("Failed to create canvas".to_string());
    }

    // TODO: Implement actual document parsing and rendering
    // For now, draw a simple placeholder pattern to show it's working

    // Fill with white background
    let _ = canvas_bridge::render_rect(
        handle,
        0.0,
        0.0,
        canvas_width as f32,
        canvas_height as f32,
        "#FFFFFF",
    );

    // Draw a border
    let _ = canvas_bridge::render_rect(handle, 0.0, 0.0, canvas_width as f32, 2.0, "#000000");
    let _ = canvas_bridge::render_rect(handle, 0.0, 0.0, 2.0, canvas_height as f32, "#000000");
    let _ = canvas_bridge::render_rect(
        handle,
        canvas_width as f32 - 2.0,
        0.0,
        2.0,
        canvas_height as f32,
        "#000000",
    );
    let _ = canvas_bridge::render_rect(
        handle,
        0.0,
        canvas_height as f32 - 2.0,
        canvas_width as f32,
        2.0,
        "#000000",
    );

    // Draw some placeholder content
    let _ = canvas_bridge::render_text(
        handle,
        &format!("Document: {}", format),
        20.0,
        50.0,
        Some("#333333".to_string()),
        Some(24.0),
    );
    let _ = canvas_bridge::render_text(
        handle,
        &format!("Size: {} bytes", doc_bytes.len()),
        20.0,
        100.0,
        Some("#666666".to_string()),
        Some(16.0),
    );

    // Draw a simple test pattern
    let _ = canvas_bridge::render_rect(handle, 20.0, 150.0, 100.0, 100.0, "#FF0000");
    let _ = canvas_bridge::render_rect(handle, 130.0, 150.0, 100.0, 100.0, "#00FF00");
    let _ = canvas_bridge::render_rect(handle, 240.0, 150.0, 100.0, 100.0, "#0000FF");

    Ok(handle)
}
