# World Office Desktop (Tauri POC)

Proof-of-concept desktop shell for World Office, built with Tauri 2 + Rust.

**Status:** POC — structural foundation is complete. Full editor parity with the web app is still in progress.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Rust | nightly | `rustup default nightly` |
| Node.js | >=20 | for the frontend build |
| pnpm | latest | `corepack enable` to install |
| npm | any | for `tauri` CLI |

## Build

### 1. Build the frontend

The desktop shell loads the React editor from the pnpm workspace:

```bash
# From server/ root
cd apps/web
pnpm install
pnpm build --filter @world-office/documenteditor
```

This outputs to `apps/web/apps/documenteditor-react/dist/`, which `desktop/tauri-poc/scripts/build-web.mjs` copies into `desktop/tauri-poc/dist/`.

### 2. Build the Tauri app

```bash
cd desktop/tauri-poc
npm install
npm run build          # release build (slow, produces installable packages)
# or
npm run dev            # development build (faster, hot reload)
```

## Output

After `npm run build`, installable packages land in:

| Platform | Path |
|----------|------|
| Linux .deb | `src-tauri/target/release/bundle/deb/` |
| Linux .rpm | `src-tauri/target/release/bundle/rpm/` |
| Linux .AppImage | `src-tauri/target/release/bundle/appimage/` |
| Windows .exe (NSIS) | `src-tauri/target/release/bundle/nsis/` |
| macOS .dmg | `src-tauri/target/release/bundle/dmg/` |

## Run without installing

```bash
# Development mode — starts a dev server and opens the app
npm run dev
```

`npm run dev` runs the Tauri development build. The Rust code is watched for changes and recompiled automatically.

## Project Structure

```
desktop/tauri-poc/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          Entry point
│   │   ├── lib.rs           App builder, menu events, plugin setup
│   │   ├── commands.rs      Tauri commands (new_doc, open_doc, save_doc, etc.)
│   │   ├── state.rs         AppState: recent files tracking, window count
│   │   ├── filesystem.rs    File operations: read, write, copy, list, etc.
│   │   ├── window.rs        Window creation/management
│   │   ├── menu.rs          Application menu builder
│   │   ├── tray.rs          System tray with context menu
│   │   ├── print.rs         Print/print preview via OS dialog
│   │   ├── updater.rs       Auto-update check and install
│   │   ├── keychain.rs      OS keychain credential storage
│   │   └── bridge.rs        JS ↔ Rust event bridge
│   ├── Cargo.toml
│   └── tauri.conf.json      Tauri configuration
├── index.html               Loads the React app
├── package.json             npm scripts
└── scripts/
    └── build-web.mjs        Copies frontend build into dist/
```

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| New/open/save/close document | ✅ Works | Opens new windows with the React editor |
| Recent files menu | ✅ Works | Persisted in `~/.local/share/WorldOffice/recent_files.json` |
| System tray | ✅ Works | Show/hide, new document, quit |
| Zoom | ✅ Works | Ctrl+/Ctrl- shortcuts via menu |
| Fullscreen | ✅ Works | F11 shortcut |
| File drag-and-drop | ❌ Not wired | Native OS DnD not yet connected to editor |
| Print | ✅ Works | Opens OS print dialog |
| Auto-update | ✅ Scaffolded | `updater.rs` ready, needs update server URL |
| Keychain | ✅ Scaffolded | Uses OS credential store, not yet connected to auth |

## Known Issues

- **Single editor type only**: `dist/` only contains `documenteditor-react`. Spreadsheet, presentation, PDF, and Visio editors are not yet integrated.
- **No WOPI integration**: The desktop shell opens local files. WOPI (collaborative editing via OCIS) is a future feature.
- **No global shortcuts**: Registered via Tauri but not yet wired to editor actions.
- **`print_preview`**: Opens system dialog directly. A rendered preview pane is not yet built.

## Architecture Notes

- All file I/O (`filesystem.rs`) is **async** — large files don't block the UI.
- Recent files are stored in `dirs::data_local_dir()` (platform-aware), not in a fixed path.
- The editor communicates with Rust via Tauri's `invoke()` / `emit()` bridge.
- Menus and tray icons emit events to the frontend via `bridge.rs`.