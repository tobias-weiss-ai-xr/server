<!--
SPDX-FileCopyrightText: 2026 Euro-Office contributors
SPDX-License-Identifier: CC0-1.0
-->

# Euro-Office Architecture

This document describes the architecture of the Euro-Office workspace, a multi-repo fork of the WORLDOFFICE document suite. It maps the 22 repositories, their dependencies, build order, and provides guidance on where to find specific functionality.

## Dependency Graph

```
DEPLOYMENT / ASSEMBLY
----------------------------------------------------
  DocumentServer/     docker-ci/          document-server-
  (orchestrator)      (CI images)         server-package/
  Ubuntu 24.04                             (deb/rpm)
  Node 20
  JDK 21
  Grunt CLI
  @yao-pkg/pkg
       │
       ▼
SERVER STACK (Web)
----------------------------------------------------
  server/             sdkjs/              web-apps/
  (Node.js)           (JS SDK)            (UI/HTML)
  DocService          Editor API          Document UI
  Converter           Engine              Spreadsheet
  Command             Spreadsheet         Presentation
  Metrics             Presentation        PDF viewer
  AdminPanel          PDF editor          Forms UI
  CoAuth              Common              Diagrams
       │                 │
       │    ┌────────────┘
       ▼    ▼
  core/
  (C++ Engine)
  OOXML parser
  ODF support
  PDF conversion
  DOCX/XLSX/PPTX
  Font rendering
  X2tConverter

DESKTOP STACK (Native)
----------------------------------------------------
  DesktopEditors/     desktop-apps/       desktop-sdk/
  (Qt app)           (Build system)      (C++ SDK)
  Main window        CMake + QMake       CAscAppManager
  App launch         Win/Mac/Linux       CCefView
  Updates            Packaging           SpellChecker
  ResManager         RPM/Deb/Win         Keychain
                                           Qt wrapper
                                           AI plugins
       │
       ▼
  core/ (C++ Engine)
  + CEF (Chromium Embedded Framework)
  + Qt 5.15 (LGPL)
  + libVLC (LGPL)

INTEGRATION ECOSYSTEM
----------------------------------------------------
  world-office-         world-office-         document-server-    documents-app-
  nextcloud/          opencloud/          integration/         android/
  (PHP + Vue 3)       (Node.js + EJS)     (Go,Python,PHP,     (Kotlin)
  NC 33-34 app        Cloud storage +     Java,C#,Node,Ruby)  Android shell
  JWT auth            DocServer editing   WOPI examples       Framework7 + React
  46 PHP files        File mgmt           REST API examples   Native bridge
  File hooks          User auth           JWT auth examples   window.Android
  Admin settings      Express backend

ASSETS & PLUGINS
----------------------------------------------------
  artwork/            core-fonts/          plugin-aiautofill/
  (SVG/PNG)           (TTF/OTF)           (JS, v1.0.0)
  Branding            Rendering           AI form mapping
  Logo, teaser        ~100 locales        Pipedrive + LLM

  dictionaries/       document-           sdkjs-forms/
  (103 locales)       templates/          (JS plugin)
  Hunspell            (.xlsx,.pptx)       Form builder SDK
  Spell check         Binary files        PDF/DOCX forms

  document-           .github/
  formats/            Org profile + ROADMAP + CONTRIBUTING
  (XML specs)         Issue/PR templates, Security policy
```

## Build Order

Topological sort showing the correct build sequence.

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
  desktop-sdk/ (depends on core/) → desktop-apps/ (depends on desktop-sdk/) →
  DesktopEditors/ (depends on desktop-sdk/ + desktop-apps/)

Phase 7 - Integrations (parallel):
  world-office-nextcloud/ → world-office-opencloud/ → document-server-integration/
  documents-app-android/ → document-server-package/
```

## Repository Inventory

### Tier 1: Core Engine

| Repo | Language | Purpose | State |
|------|----------|---------|-------|
| core/ | C++ | Document rendering, OOXML/ODF/PDF conversion, font engine | Fork |
| sdkjs/ | JavaScript | JS SDK for editor (1287 files, actively maintained) | Fork |
| server/ | JavaScript (Node.js) | DocService, Converter, Command, Metrics, AdminPanel | Fork |
| web-apps/ | HTML/JS/CSS | Editor UI for document, spreadsheet, presentation, PDF | Fork |

### Tier 2: Assembly & Deployment

| Repo | Language | Purpose | Assembles | State |
|------|----------|---------|----------|-------|
| DocumentServer/ | Shell/Make | Docker/Debian package assembly, CI/CD | core/ + server/ + sdkjs/ + web-apps/ + core-fonts/ + dictionaries/ | Fork |
| docker-ci/ | Dockerfile | CI build images (Ubuntu 24.04, Node 20, JDK 21, Grunt) | DocumentServer/ | Fork |
| document-server-package/ | Shell/Inno Setup | Debian/RPM packaging for DocumentServer | DocumentServer/ | Fork |

### Tier 3: Desktop Stack

| Repo | Language | Purpose | State |
|------|----------|---------|-------|
| desktop-sdk/ | C++ | SDK for third-party desktop integrations, CEF wrapper, AI plugins | Fork |
| desktop-apps/ | C++/JS/Make | Desktop packaging, build orchestration, resources, localization | Fork |
| DesktopEditors/ | C++ | Main desktop editor application (Chromium-based) | Fork |

### Tier 4: Integration Ecosystem

| Repo | Language | Purpose | State |
|------|----------|---------|-------|
| world-office-nextcloud/ | PHP + Vue 3 | Nextcloud app for editing docs from NC (46 PHP files) | Production |
| world-office-opencloud/ | Node.js + EJS | Cloud storage + document editing (1-commit prototype) | WIP |
| document-server-integration/ | Go,Python,PHP,Java,C#,Node,Ruby | Integration examples for 7 languages | Reference |
| documents-app-android/ | Kotlin | Android mobile app shell (850 Kotlin files, no EO changes) | WIP |

### Tier 5: Assets & Plugins

| Repo | Language | Purpose | State |
|------|----------|---------|-------|
| artwork/ | SVG/PNG | Branding assets (logo, teaser) | Original |
| core-fonts/ | TTF/OTF | Bundled fonts for rendering (~100 font files) | Fork |
| dictionaries/ | Text | Hunspell spell-check (103 locales) | Fork |
| document-formats/ | XML | Open XML format documentation | Fork |
| document-templates/ | Binary | Sample Office templates (.xlsx, .pptx, .pdf) | Fork |
| sdkjs-forms/ | JavaScript | Forms plugin for JS SDK | Fork |
| plugin-aiautofill/ | JavaScript | AI auto-fill plugin (v1.0.0, Pipedrive + LLM) | Production |

### Tier 6: Organization

| Repo | Language | Purpose | State |
|------|----------|---------|-------|
| .github/ | Markdown | Org profile, ROADMAP.md, CONTRIBUTING.md, issue/PR templates, security policy | Active |

## License Compliance

| License | Repos |
|---------|-------|
| AGPL-3.0 | core, server, web-apps, desktop-apps, DocumentServer, document-server-integration, document-templates, plugin-aiautofill, sdkjs-forms, desktop-sdk |
| Apache-2.0 | DesktopEditors, document-formats, document-server-package, world-office-nextcloud |
| CC0-1.0 | .github/ (ROADMAP, CONTRIBUTING) |
| Various per-font | core-fonts |

## Where to Look

Quick reference for finding specific functionality.

| Task | Repo | Location |
|------|------|----------|
| Format conversion logic | core/ | X2tConverter/ |
| Document rendering | core/ | DesktopEditor/ |
| Web editor UI | web-apps/ | apps/*/main/ |
| Server deployment | DocumentServer/ | Nginx configs, Docker, systemd |
| Integration examples | document-server-integration/ | web/ |
| Desktop build | desktop-apps/, desktop-sdk/ | CMake-based |
| Document builder | server/ | DocBuilder/ |
| Branding/theming | web-apps/ | build/ |

All repositories are hosted at codeberg.org/World-Office.
