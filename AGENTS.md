# EURO-OFFICE WORKSPACE

**Generated:** 2026-03-31
**Source:** codeberg.org/World-Office (forks of WORLDOFFICE)
**Repos:** 19 | **Total Files:** ~66k

## OVERVIEW

Multi-repo workspace containing Euro-Office forks of the WORLDOFFICE document suite. Each repo is an independent clone (shallow, depth=1) from Codeberg. These are FORKS — upstream is WORLDOFFICE.

## STRUCTURE

```
world-office/
├── core/                          # C++ core engine (format conversion, rendering)
├── web-apps/                      # Web UI: editor interface, apps, media (28k files)
├── desktop-sdk/                   # C++ desktop integration SDK (6.6k files)
├── desktop-apps/                  # Desktop app resources, localization (2.9k files)
├── DesktopEditors/                # Desktop editors build config (shallow)
├── DocumentServer/                # Server deployment configs (Nginx, systemd)
├── document-server-integration/   # PHP/JS integration API + examples
├── document-server-package/       # Linux packaging (Inno Setup, Makefile)
├── document-formats/              # Format documentation (Open XML)
├── document-templates/            # Office templates (.xlsx, .pptx, .pdf)
├── server/                        # Node.js docbuilder + Common modules
├── sdkjs/                         # SDK JS (empty — upstream submodule)
├── sdkjs-forms/                   # JS form builder
├── dictionaries/                  # Hunspell dictionaries (103 locales)
├── core-fonts/                    # Bundled fonts (TTF/OTF)
├── docker-ci/                     # Docker build images (Ubuntu 24.04, Node 20, JDK 21)
├── world-office-nextcloud/          # Nextcloud integration (PHP/JS)
├── plugin-aiautofill/             # AI autofill plugin (JS/JSON)
├── .github/                       # GitHub/Codeberg CI workflows
└── nul                            # (junk — safe to delete)
```

## ARCHITECTURE & DEPENDENCIES

```
                    ┌─────────────┐
                    │ web-apps    │ ← Browser UI
                    └──────┬──────┘
                           │
┌──────────┐        ┌──────┴──────┐        ┌──────────────┐
│ core     │◄───────│ Document    │───────►│ document-    │
│ (C++)    │        │ Server      │        │ server-      │
└────┬─────┘        │ (Nginx+Node)│        │ integration  │
     │              └──────┬──────┘        └──────────────┘
     │                     │
     │              ┌──────┴──────┐
     │              │ server      │ ← Node.js docbuilder
     │              └─────────────┘
     │
┌────┴─────┐
│ desktop- │
│ sdk      │
└────┬─────┘
     │
┌────┴─────────┐
│ desktop-apps │
│ DesktopEds   │
└──────────────┘
```

**Key dependency flow:** `core` → `DocumentServer` → `web-apps` (server). `core` → `desktop-sdk` → `desktop-apps`.

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Format conversion logic | `core/X2tConverter/` | C++, DOCX↔PDF↔ODT etc. |
| Document rendering | `core/DesktopEditor/` | C++, canvas/font engine |
| Web editor UI | `web-apps/apps/*/main/` | JS, per-app (documenteditor, spreadsheeteditor, etc.) |
| Server deployment | `DocumentServer/` | Nginx configs, Docker, systemd |
| Integration examples | `document-server-integration/web/` | PHP, Node.js, Python, Java, etc. |
| Desktop build | `desktop-apps/`, `desktop-sdk/` | CMake-based |
| Document builder | `server/DocBuilder/` | Node.js, CLI doc conversion |
| Branding/theming | `web-apps/build/` | Grunt-based build, license bundling |

## BUILD SYSTEMS

| Repo | Build System | Language | Command |
|------|-------------|----------|---------|
| core | CMake | C++ | `cmake -B build && cmake --build build` |
| web-apps | Makefile + Grunt | JS/HTML | `make` (requires terser, html-minifier) |
| desktop-sdk | CMake | C++ | `cmake -B build && cmake --build build` |
| desktop-apps | CMake | C++/resources | `cmake -B build && cmake --build build` |
| DocumentServer | Shell scripts | Bash | `make` (install deps) |
| server | npm | JS | `npm install && npm run lint:check` |
| document-server-integration | Makefile | PHP/JS | `make` |
| docker-ci | Docker | Dockerfile | `docker build -f docker-ci/ds-base/Dockerfile .` |

## LICENSES

| License | Repos |
|---------|-------|
| AGPL-3.0 | core, desktop-apps, document-server-integration, document-templates, plugin-aiautofill, sdkjs-forms, server, web-apps |
| Apache-2.0 | DesktopEditors, document-formats, document-server-package, world-office-nextcloud |
| Proprietary | desktop-sdk (freeware) |
| Fonts | core-fonts (various per-font) |

## CODE STYLE

- **server/**: ESLint 9 + Prettier (`.editorconfig`, `.prettierrc` present)
- **world-office-nextcloud/**: ESLint (`.eslintrc.js` present)
- **C++ repos**: No standardized clang-format — follow per-repo existing style
- **PHP repos**: No linter config — follow PSR-12 conventions

## ANTI-PATTERNS

- NEVER push to `main` without testing format conversion via `core/X2tConverter`
- NEVER modify `web-apps/deploy/` or `web-apps/build/` without running `make` to verify
- NEVER add new npm dependencies to `server/` without updating `package-lock.json`
- sdkjs repo is EMPTY (submodule not initialized) — do not attempt to use it directly

## NOTES

- All repos are shallow clones (depth=1). Run `git fetch --unshallow` for full history.
- The `nul` file at root is a Windows artifact — safe to delete.
- DesktopEditors contains only CI config (YAML + build script) — actual code is in desktop-apps + desktop-sdk.
- document-templates contains binary Office files — not code-editable.
- Docker CI uses Ubuntu 24.04, Node.js 20, JDK 21, Grunt CLI, @yao-pkg/pkg.
