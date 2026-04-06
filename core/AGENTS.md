# CORE

**Generated:** 2026-03-31
**Source:** codeberg.org/World-Office/core (fork of WORLDOFFICE/core)
**Files:** ~25.6k | **License:** AGPL-3.0

## OVERVIEW

C++ core engine for document format conversion, rendering, and font processing — the foundation of the entire suite.

## STRUCTURE

```
core/
├── X2tConverter/            # Format conversion engine (DOCX↔PDF↔ODT, etc.)
├── DesktopEditor/           # Rendering engine
│   ├── graphics/            # Canvas rendering
│   ├── fontengine/          # Font processing
│   ├── xmlsec/              # XML security/signing
│   ├── allfontsgen/         # Font generation build tool
│   ├── allthemesgen/        # Theme generation build tool
│   ├── pluginsmanager/      # Plugin management
│   └── doctrenderer/        # Document renderer + docbuilder app
├── Common/                  # Shared utilities
│   └── 3dParty/             # Third-party libraries (hunspell, etc.)
├── PdfFile/                 # PDF processing
│   └── Resources/CMapMemory/ # CMap binary data
├── OfficeUtils/             # Office file utilities
├── Test/                    # Test applications
│   └── Applications/x2tTester/ # Format conversion tester
└── CMakeLists.txt           # Root CMake config (min 3.10)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Format conversion | `X2tConverter/` | DOCX↔PDF↔ODT↔XLSX etc. |
| Document rendering | `DesktopEditor/graphics/` | Canvas-based rendering |
| Font engine | `DesktopEditor/fontengine/` | Font loading, shaping |
| Spell checking | `Common/3dParty/hunspell/` | Hunspell integration |
| PDF processing | `PdfFile/` | PDF read/write |
| DocBuilder CLI | `DesktopEditor/doctrenderer/app_builder/` | CLI doc conversion |
| Build tools | `DesktopEditor/AllFontsGen/`, `allthemesgen/` | Font/theme generation |

## CONVENTIONS

- CMake build system — `cmake -B build && cmake --build build`
- Two build paths: native (default) and Emscripten/WASM (conditional in CMakeLists.txt)
- No standardized clang-format — follow per-directory existing C++ style
- Primary languages: C++ (.cpp 5.2k), C headers (.h 7k), text (.txt 3.6k)

## ANTI-PATTERNS

- NEVER push without testing format conversion via `X2tConverter`
- NEVER modify `Common/3dParty/` vendored libs without upstream sync
- NEVER break the Emscripten build path when modifying core rendering code

## NOTES

- This is the deepest dependency — everything else depends on core
- Contains WASM build targets for browser-based rendering (via Emscripten)
- Large codebase (25.6k files) — changes here affect all downstream repos
