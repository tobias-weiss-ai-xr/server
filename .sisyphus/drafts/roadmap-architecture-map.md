# Draft: Euro-Office Architecture Map & Roadmap Plan

## Requirements (confirmed)
- Create detailed architecture map of all 22 repos
- Use PR #2 ROADMAP.md as blueprint format
- Target deployment: Codeberg (`World-Office/.github` repo)
- Must include dependency graph, repo roles, and build flow

## Architecture Map

### Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT / ASSEMBLY                         │
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │ DocumentServer/  │    │ docker-ci/       │    │ document-    │  │
│  │ (orchestrator)   │    │ (CI images)      │    │ server-      │  │
│  │                  │    │                  │    │ package/     │  │
│  │ Contains:        │    │ Ubuntu 24.04     │    │ (deb/rpm)    │  │
│  │  ├─ core/       │───▶│ Node 20          │    └──────────────┘  │
│  │  ├─ server/     │    │ JDK 21           │                       │
│  │  ├─ sdkjs/      │    │ Grunt CLI         │                       │
│  │  ├─ web-apps/   │    │ @yao-pkg/pkg     │                       │
│  │  ├─ core-fonts/ │    └──────────────────┘                       │
│  │  └─ dictionaries│                                              │
│  └────────┬─────────┘                                              │
└───────────┼─────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                      SERVER STACK (Web)                            │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐             │
│  │  server/     │  │  sdkjs/     │  │  web-apps/   │             │
│  │  (Node.js)   │  │  (JS SDK)   │  │  (UI/HTML)   │             │
│  │              │  │             │  │              │             │
│  │ DocService   │◀─│ Editor API  │◀─│ Document UI  │             │
│  │ Converter    │──│ Engine      │──│ Spreadsheet  │             │
│  │ Command      │  │ Spreadsheet │  │ Presentation │             │
│  │ Metrics      │  │ Presentation│  │ PDF viewer   │             │
│  │ AdminPanel   │  │ PDF editor  │  │ Forms UI     │             │
│  │ CoAuth       │  │ Common      │  │ Diagrams     │             │
│  └──────┬───────┘  └──────┬──────┘  └──────────────┘             │
│         │                 │                                        │
│         │    ┌────────────┘                                        │
│         ▼    ▼                                                     │
│  ┌──────────────────┐                                              │
│  │  core/           │                                              │
│  │  (C++ Engine)    │                                              │
│  │                  │                                              │
│  │ OOXML parser     │                                              │
│  │ ODF support      │                                              │
│  │ PDF conversion   │                                              │
│  │ DOCX/XLSX/PPTX   │                                              │
│  │ Font rendering   │                                              │
│  │ X2tConverter     │                                              │
│  └──────────────────┘                                              │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    DESKTOP STACK (Native)                          │
│                                                                   │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐    │
│  │ DesktopEd/   │  │  desktop-apps/  │  │  desktop-sdk/     │    │
│  │ (Qt app)     │──│  (Build system) │──│  (C++ SDK)        │    │
│  │              │  │                 │  │                   │    │
│  │ Main window  │  │ CMake + QMake   │  │ CAscAppManager    │    │
│  │ App launch   │  │ Win/Mac/Linux   │  │ CCefView          │    │
│  │ Updates      │  │ Packaging       │  │ SpellChecker      │    │
│  │ ResManager   │  │ RPM/Deb/Win     │  │ Keychain          │    │
│  └──────┬───────┘  └─────────────────┘  │ Qt wrapper        │    │
│         │                                │ AI plugins        │    │
│         │                                └────────┬──────────┘    │
│         │                                         │                │
│         ▼                                         ▼                │
│  ┌─────────────────────────────────────────────────────┐         │
│  │              core/ (C++ Engine)                     │         │
│  │              + CEF (Chromium Embedded Framework)     │         │
│  │              + Qt 5.15 (LGPL)                       │         │
│  │              + libVLC (LGPL)                        │         │
│  └─────────────────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                  INTEGRATION ECOSYSTEM                            │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ world-office-         │  │ world-office-         │               │
│  │ nextcloud/          │  │ opencloud/          │               │
│  │ (PHP + Vue 3)       │  │ (Node.js + EJS)     │               │
│  │                     │  │                     │               │
│  │ NC 33-34 app        │  │ Cloud storage +     │               │
│  │ JWT auth            │  │ DocServer editing   │               │
│  │ 46 PHP files        │  │ File mgmt           │               │
│  │ File hooks          │  │ User auth           │               │
│  │ Admin settings      │  │ Express backend     │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ documents-app-      │  │ document-server-    │               │
│  │ android/            │  │ integration/        │               │
│  │ (Kotlin)            │  │ (Go,Python,PHP,     │               │
│  │                     │  │  Java,C#,Node,Ruby) │               │
│  │ Android shell       │  │                     │               │
│  │ Framework7 + React  │  │ WOPI examples       │               │
│  │ Native bridge       │  │ REST API examples   │               │
│  │ (window.Android)    │  │ JWT auth examples   │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                   │
│  ┌─────────────────────┐                                          │
│  │ document-server-    │                                          │
│  │ package/            │                                          │
│  │ (Inno Setup, Shell) │                                          │
│  │ Debian/RPM packages │                                          │
│  └─────────────────────┘                                          │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    ASSETS & PLUGINS                                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐      │
│  │ artwork/     │  │ core-fonts/  │  │ plugin-aiautofill/│      │
│  │ (SVG/PNG)    │  │ (TTF/OTF)    │  │ (JS, v1.0.0)      │      │
│  │ Branding     │  │ Rendering    │  │ AI form mapping   │      │
│  │ Logo, teaser │  │ ~100 locales │  │ Pipedrive + LLM   │      │
│  └──────────────┘  └──────────────┘  └───────────────────┘      │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐      │
│  │ dictionaries/│  │ document-    │  │ sdkjs-forms/      │      │
│  │ (103 locales)│  │ templates/   │  │ (JS plugin)       │      │
│  │ Hunspell     │  │ (.xlsx,.pptx)│  │ Form builder SDK  │      │
│  │ Spell check  │  │ Binary files │  │ PDF/DOCX forms    │      │
│  └──────────────┘  └──────────────┘  └───────────────────┘      │
│                                                                   │
│  ┌──────────────┐  ┌──────────────────────────────────────┐      │
│  │ document-    │  │ .github/                              │      │
│  │ formats/     │  │ Org profile + ROADMAP + CONTRIBUTING  │      │
│  │ (XML specs)  │  │ Issue/PR templates, Security policy  │      │
│  └──────────────┘  └──────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────┘
```

### Build Order (Topological)

```
Phase 1 - Foundation (no dependencies):
  core-fonts/ → dictionaries/ → docker-ci/ → artwork/ → document-formats/

Phase 2 - Core engine:
  core/ (depends on nothing, but used by everything below)

Phase 3 - JS layer:
  sdkjs/ (depends on core/) → web-apps/ (depends on sdkjs/)

Phase 4 - Backend:
  server/ (depends on core/, sdkjs/, web-apps/)

Phase 5 - Assembly:
  DocumentServer/ (contains core/ + server/ + sdkjs/ + web-apps/ as git submodules)
  docker-ci/ → builds DocumentServer/ into Docker image

Phase 6 - Desktop (parallel):
  desktop-sdk/ (depends on core/) → desktop-apps/ (depends on desktop-sdk/) → DesktopEditors/ (depends on desktop-sdk/ + desktop-apps/)

Phase 7 - Integrations (parallel):
  world-office-nextcloud/ → world-office-opencloud/ → document-server-integration/
  documents-app-android/ → document-server-package/
```

### Complete Repo Inventory (22 repos)

#### Tier 1: Core Engine (must build first)
| Repo | Language | Files | Purpose | Depends On | Exports To |
|------|----------|-------|---------|------------|------------|
| **core/** | C++ | ~66k | Document rendering, OOXML/ODF/PDF conversion, font engine | Nothing | server/, desktop-sdk/, sdkjs/ |
| **sdkjs/** | JavaScript | ~empty* | JS SDK for editor (submodule, empty locally) | core/ | web-apps/, server/ |
| **server/** | JavaScript (Node.js) | ~500 | DocService, Converter, Command, Metrics, AdminPanel | core/, sdkjs/, web-apps/ | DocumentServer/ |
| **web-apps/** | HTML/JS/CSS | ~28k | Editor UI for document, spreadsheet, presentation, PDF | sdkjs/ | DocumentServer/ |

#### Tier 2: Assembly & Deployment
| Repo | Language | Purpose | Assembles | Depends On |
|------|----------|---------|----------|------------|
| **DocumentServer/** | Shell/Make | Docker/Debian package assembly, CI/CD | core/ + server/ + sdkjs/ + web-apps/ + core-fonts/ + dictionaries/ | All Tier 1 |
| **docker-ci/** | Dockerfile | CI build images (Ubuntu 24.04, Node 20, JDK 21, Grunt) | DocumentServer/ | DocumentServer/ |
| **document-server-package/** | Shell/Inno Setup | Debian/RPM packaging for DocumentServer | DocumentServer/ | DocumentServer/ |

#### Tier 3: Desktop Stack
| Repo | Language | Purpose | Depends On | Exports To |
|------|----------|---------|------------|------------|
| **desktop-sdk/** | C++ | SDK for third-party desktop integrations, CEF wrapper, AI plugins | core/ (CefView, ApplicationManager), Qt 5.15, CEF, libVLC | DesktopEditors/, desktop-apps/ |
| **desktop-apps/** | C++/JS/Make | Desktop packaging, build orchestration, resources, localization | desktop-sdk/ | DesktopEditors/ |
| **DesktopEditors/** | C++ | Main desktop editor application (Chromium-based) | desktop-sdk/, desktop-apps/, core/ | End users |

#### Tier 4: Integration Ecosystem
| Repo | Language | Purpose | Depends On | State |
|------|----------|---------|------------|-------|
| **world-office-nextcloud/** | PHP + Vue 3 (46 PHP files) | Nextcloud app for editing docs from NC | DocumentServer/ (via WOPI/JWT) | ✅ Production |
| **world-office-opencloud/** | Node.js + EJS | Cloud storage + document editing | DocumentServer/ (via HTTP) | 🟡 WIP |
| **document-server-integration/** | Go,Python,PHP,Java,C#,Node,Ruby | Integration examples for 7 languages | DocumentServer/ (via REST/WOPI) | ✅ Reference |
| **documents-app-android/** | Kotlin | Android mobile app shell (Framework7 + React) | DocumentServer/ (via window.Android bridge) | 🟡 Fork needs work |

#### Tier 5: Assets & Plugins
| Repo | Language | Purpose | State |
|------|----------|---------|-------|
| **artwork/** | SVG/PNG | Branding assets (logo, teaser) | ✅ Original Euro-Office |
| **core-fonts/** | TTF/OTF | Bundled fonts for rendering (~100 font files) | ✅ Fork |
| **dictionaries/** | Text | Hunspell spell-check (103 locales) | ✅ Fork |
| **document-formats/** | XML | Open XML format documentation | ✅ Fork |
| **document-templates/** | Binary | Sample Office templates (.xlsx, .pptx, .pdf) | ✅ Fork |
| **sdkjs-forms/** | JavaScript | Forms plugin for JS SDK | ✅ Fork |
| **plugin-aiautofill/** | JavaScript | AI auto-fill plugin (v1.0.0, Pipedrive + LLM) | ✅ Production |

#### Tier 6: Organization
| Repo | Language | Purpose | State |
|------|----------|---------|-------|
| **.github/** | Markdown | Org profile, ROADMAP.md, CONTRIBUTING.md, issue/PR templates, security policy | 🟡 Needs roadmap update |

## Key Findings

### Critical Path
`core/` → `server/` → `DocumentServer/` → Docker image → deployment
`core/` → `desktop-sdk/` → `desktop-apps/` → `DesktopEditors/` → native packages

### Codeberg vs Local Gaps
- 3 repos on Codeberg not in original AGENTS.md: `artwork/`, `world-office-opencloud/`, `documents-app-android/`
- Now all cloned locally ✅

### Licensing Summary
| License | Repos |
|---------|-------|
| AGPL-3.0 | core, server, web-apps, desktop-apps, DocumentServer, document-server-integration, document-templates, plugin-aiautofill, sdkjs-forms, server, desktop-sdk (proprietariness resolved) |
| Apache-2.0 | DesktopEditors, document-formats, document-server-package, world-office-nextcloud |
| CC0-1.0 | .github/ (ROADMAP, CONTRIBUTING) |
| Various per-font | core-fonts |
| Proprietary freeware | desktop-sdk (AGENTS.md says so, but LICENSE says AGPLv3) |

## Open Questions
- None — architecture fully mapped
