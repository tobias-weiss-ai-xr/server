// wo-x2t-wasm -- WASM bindings for World-Office format conversion
//!
//! Provides JavaScript-callable functions for converting between
//! document formats (DOCX, PDF, ODT, etc.).

pub mod converter;

use wasm_bindgen::prelude::*;

/// Initialize the WASM module (optional setup).
#[wasm_bindgen]
pub fn init() {
    // Set up panic hook for better error messages in the browser
    #[cfg(target_arch = "wasm32")]
    {
        console_error_panic_hook::set_once();
    }
}
