# World-Office WASM Build

This directory contains WebAssembly (WASM) bindings for World-Office's core functionality:

- **wo-x2t-wasm**: Format conversion (DOCX → PDF, ODT → PDF, etc.)
- **wo-renderer-wasm**: Document rendering to HTML5 Canvas

## Prerequisites

- Rust 1.70+ with `wasm32-unknown-unknown` target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

- `wasm-pack` for building and packaging:
  ```bash
  cargo install wasm-pack
  ```

## Building

Build both WASM modules:

```bash
# Build for web usage
cd core/crates/wo-x2t-wasm
wasm-pack build --target web

cd ../wo-renderer-wasm
wasm-pack build --target web
```

Build outputs will be in `pkg/` directories:
- `wo_x2t_wasm.js` - JavaScript bindings
- `wo_x2t_wasm_bg.wasm` - WASM binary
- `wo_x2t_wasm.d.ts` - TypeScript definitions

## Usage

### Format Conversion (wo-x2t-wasm)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>World-Office Conversion</title>
</head>
<body>
  <input type="file" id="inputFile">
  <select id="targetFormat">
    <option value="pdf">PDF</option>
    <option value="odt">ODT</option>
    <option value="txt">Text</option>
  </select>
  <button onclick="convertFile()">Convert</button>
  <pre id="output"></pre>

  <script type="module">
    import init, { convert, init as initWasm } from './crates/wo-x2t-wasm/pkg/wo_x2t_wasm.js';

    async function convertFile() {
      await initWasm();

      const fileInput = document.getElementById('inputFile');
      const targetFormat = document.getElementById('targetFormat').value;
      const output = document.getElementById('output');

      if (!fileInput.files.length) {
        output.textContent = 'Please select a file';
        return;
      }

      const file = fileInput.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const inputBytes = new Uint8Array(arrayBuffer);

      const sourceFormat = file.name.split('.').pop().toLowerCase();

      try {
        const result = convert(inputBytes, sourceFormat, targetFormat);
        output.textContent = `Converted ${file.name} to ${targetFormat}`;
        // You can download result as a file, etc.
      } catch (error) {
        output.textContent = `Error: ${error}`;
      }
    }

    window.convertFile = convertFile;
  </script>
</body>
</html>
```

### Document Rendering (wo-renderer-wasm)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>World-Office Renderer</title>
</head>
<body>
  <input type="file" id="inputFile">
  <canvas id="renderCanvas" width="800" height="600"></canvas>

  <script type="module">
    import init, { render_to_canvas, init as initWasm } from './crates/wo-renderer-wasm/pkg/wo_renderer_wasm.js';

    async function renderFile() {
      await initWasm();

      const fileInput = document.getElementById('inputFile');

      if (!fileInput.files.length) {
        console.error('Please select a file');
        return;
      }

      const file = fileInput.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const inputBytes = new Uint8Array(arrayBuffer);

      const format = file.name.split('.').pop().toLowerCase();
      const canvasId = 'renderCanvas';

      try {
        render_to_canvas(inputBytes, format, canvasId);
        console.log('Rendered successfully');
      } catch (error) {
        console.error('Render error:', error);
      }
    }

    document.getElementById('inputFile').addEventListener('change', renderFile);
  </script>
</body>
</html>
```

## API Reference

### wo-x2t-wasm

#### `init()`
Initialize the WASM module (sets up panic hooks for better error messages).

#### `convert(input: &[u8], source_format: &str, target_format: &str) -> Result<Vec<u8>, String>`
Convert a document from one format to another.

**Parameters:**
- `input` - Input document bytes
- `source_format` - Source format (e.g., "docx", "pdf", "odt")
- `target_format` - Target format (e.g., "pdf", "odt", "docx")

**Returns:** Output document bytes on success, error message on failure

#### `is_supported(source_format: &str, target_format: &str) -> bool`
Check if a conversion is supported.

#### `conversion_path(source_format: &str, target_format: &str) -> Vec<String>`
Get the conversion path (intermediate formats if any).

### wo-renderer-wasm

#### `init()`
Initialize the WASM module.

#### `render_to_canvas(doc_bytes: &[u8], format: &str, canvas_id: &str) -> Result<(), String>`
Render a document to an HTML5 Canvas element.

**Parameters:**
- `doc_bytes` - Document bytes
- `format` - Document format (e.g., "docx", "pdf")
- `canvas_id` - ID of the canvas element

#### `render_to_pixels(doc_bytes: &[u8], format: &str, width: u32, height: u32) -> Result<Vec<u8>, String>`
Render a document and return RGBA pixel data.

**Returns:** RGBA bytes (4 bytes per pixel)

#### `create_page(page_format: &str) -> Result<String, String>`
Create a new page with standard dimensions.

**Parameters:**
- `page_format` - "a4", "letter", "legal", or "widthxheight"

**Returns:** JSON with page dimensions

## Browser Compatibility

Works in all modern browsers that support WebAssembly:

- Chrome/Edge 57+
- Firefox 52+
- Safari 11+

## Build Targets

- `--target web` - For direct browser usage (default)
- `--target bundler` - For bundlers (webpack, rollup, etc.)
- `--target nodejs` - For Node.js usage

## Development

Check code without building WASM:

```bash
cargo check -p wo-x2t-wasm -p wo-renderer-wasm
```

Run tests:

```bash
cargo test -p wo-x2t-wasm -p wo-renderer-wasm
```

## Notes

- The current implementation is a stub with test patterns. Real document parsing and rendering will be implemented as format-specific parsers are added.
- Error messages in the browser will be more informative due to panic hooks.
- Performance optimization is ongoing.
