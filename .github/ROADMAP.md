<!--
SPDX-FileCopyrightText: 2026 Word Office contributors
SPDX-License-Identifier: CC0-1.0
-->

# Word Office Roadmap

This document outlines the high-level goals and planned milestones for the Word Office project. It is a living document â€” priorities may shift as the project evolves.

For how the repos fit together, see [ARCHITECTURE.md](ARCHITECTURE.md). For contributor setup, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Vision

Word Office aims to provide a truly open, transparent, and sovereign online office suite for collaborative document editing, free from the governance and transparency concerns that led to the built from scratch.

## Guiding Principles

- **Transparency** â€” No binary blobs, no obfuscated code, English-language comments and commit messages.
- **Buildability** â€” Reliable, documented build instructions that work on first try.
- **Open Contribution** â€” PRs reviewed and merged in a timely manner; low barriers to entry.
- **Sovereignty** â€” European-governed, with a globally open contributor base.

---

## Phase 1 â€” Foundation (In Progress)

> Goal: Make the codebase clean, buildable, and contributor-friendly.

### Codebase Cleanup

- [ ] **Remove or replace binary blobs** â€” ~400-500 MB of non-source content:
  - `core/Common/3dParty/libvlc/build/` â€” ~1,500 precompiled VLC binaries (302 MB across 5 platforms). Move to separate package or Git LFS.
  - 6 emscripten WASM + JS fallback pairs in [sdkjs](https://codeberg.org/word-office/sdkjs) and [core](https://codeberg.org/word-office/core) (~45 MB). These are build outputs of C/C++ source in the repo.
  - `core/Test/Applications/` â€” compiled .exe/.dll test build artifacts.
  - No Git LFS tracking configured in any repo.
- [ ] **Translate Russian code comments** â€” ~22,500 lines identified:
  - [sdkjs](https://codeberg.org/word-office/sdkjs) â€” ~15,300 lines (JavaScript, highest priority)
  - [core](https://codeberg.org/word-office/core) â€” ~7,000 lines (C++, concentrated in XLS/XLSB/PPT binary format handling)
  - [web-apps](https://codeberg.org/word-office/web-apps) â€” ~200 lines (quick wins)
  - [server](https://codeberg.org/word-office/server) â€” 9 lines (negligible)
  - Exclude: native language names in i18n data, regex Cyrillic patterns, 3rd-party vendored code.
- [ ] **Audit third-party dependencies** with unclear licensing (in progress)
- [x] Establish code style guide and contribution guidelines ([CONTRIBUTING.md](CONTRIBUTING.md))

### Build System

- [ ] Fix unreliable and outdated build instructions
- [ ] Set up reproducible builds with containerized toolchains
- [x] Add CI/CD pipelines â€” 66 workflows across 12 of 19 repos. Missing: core-fonts, desktop-sdk, dictionaries, document-formats, document-server-package, document-templates, sdkjs-forms.
- [ ] Document per-repository build and test procedures

### Community Infrastructure

- [x] Create onboarding documentation ([CONTRIBUTING.md](CONTRIBUTING.md) with 22-repo overview)
- [x] Add issue templates (bug report, feature request, question)
- [x] Add PR template and security policy
- [ ] Establish issue triage and PR review workflows (labels, milestones)
- [ ] Set up communication channels (Matrix, Discourse, or similar)

---

## Phase 2 â€” Feature Parity & Restoration

> Goal: Restore features that were removed or closed off in the legacy codebase.

### Administrator Panel

- [x] **Already built by Word Office.** The [server](https://codeberg.org/word-office/server) `AdminPanel/` is a complete React 18 SPA + Express.js backend (707 files, 14 admin pages). Does NOT exist in legacy codebase.
- [ ] Enable the admin panel by default in packaged deployments (currently `autostart=false`)
- [ ] Build the admin panel client (`npm run build` in `server/AdminPanel/client/`)
- [ ] Add tests for the admin panel

### Mobile Applications

- [x] **Audited.** Full mobile web editors exist for all 4 document types (Word, Excel, PPT, Visio) using Framework7 + React (~306 JS files). The native app shells (Android/iOS) are proprietary and NOT in this repo.
- [ ] Build native mobile app shells (recommended: Capacitor for cross-platform)
- [ ] Implement `window.Android`/`window.native` bridge in the Capacitor layer
- [ ] Add cloud storage connectors (WebDAV, S3, Nextcloud) for mobile
- [ ] Add PDF editing to mobile (currently viewing only)
- [ ] Release to app stores (Google Play, Apple App Store)

### Document Compatibility

- [ ] Improve Microsoft Office file format compatibility (DOCX, XLSX, PPTX)
- [ ] Strengthen ODF support (ODT, ODS, ODP)
- [ ] Improve PDF viewing and editing capabilities

---

## Phase 3 â€” Desktop Applications

> Goal: Deliver production-quality desktop editors.

### Desktop Editors

- [ ] Stabilize the Chromium-based desktop editor framework ([DesktopEditors](https://codeberg.org/word-office/DesktopEditors), [desktop-apps](https://codeberg.org/word-office/desktop-apps))
- [ ] Add Flatpak packaging
- [ ] Add Snap packaging
- [ ] Add AppImage packaging
- [ ] Improve macOS and Windows packaging and installer experience
- [ ] Add offline-first capabilities with seamless cloud sync

### Desktop SDK

- [ ] Document the [desktop-sdk](https://codeberg.org/word-office/desktop-sdk) for third-party integrations
- [ ] Publish SDK packages and examples

---

## Phase 4 â€” Integration Ecosystem

> Goal: Make Word Office the default document editing component for European digital workplace solutions.

### Platform Integrations

- [x] **Mature.** [word-office-nextcloud](https://codeberg.org/word-office/word-office-nextcloud) â€” 46 PHP files covering editing, sharing, templates, collaboration, federation, admin settings.
- [ ] Provide first-class integration guides for XWiki, OpenProject, Proton
- [ ] Build integration SDKs for common platforms (Web, REST API, WOPI)
- [ ] Expand language support for [integration examples](https://codeberg.org/word-office/document-server-integration) (Go, Python, PHP, Java, C#, Node.js, Ruby)
- [ ] Integrate into OpenCloud
- [ ] Integrate into SOGo
- [ ] Integrate into Open-Xchange
- [ ] Integrate into Zimbra

### Collaboration with LibreOffice/Collabora

- [ ] Explore collaboration opportunities (e.g., shared document converter)
- [ ] Investigate interoperability testing between Word Office and LibreOffice

---

## Phase 5 â€” Innovation

> Goal: Differentiate Word Office with modern features.

### AI-Powered Features

- [x] **Production (v1.0.0).** [plugin-aiautofill](https://codeberg.org/word-office/plugin-aiautofill) â€” AI form field mapping for Word/PDF forms.
- [x] **Production (v1.1.0).** AI agent plugin in [desktop-sdk](https://codeberg.org/word-office/desktop-sdk) â€” 11 provider support (OpenAI, Anthropic, Gemini, DeepSeek, xAI, Mistral, Together, OpenRouter, Ollama, LM Studio, OpenAI-Compatible), MCP protocol, web search.
- [x] **On-device AI already supported.** Ollama and LM Studio are first-class providers.
- [ ] Add RAG (Retrieval-Augmented Generation) for in-editor AI to use document context
- [ ] Bundle a lightweight local model for offline desktop AI
- [ ] Add spreadsheet AI functions (`=AI("explain this formula")`)
- [ ] Add presentation AI features (slide generation from outlines, speaker notes)

### User Experience

- [ ] Modernize the web-based editor UI ([web-apps](https://codeberg.org/word-office/web-apps))
- [ ] Improve accessibility (WCAG 2.1 AA compliance)
- [ ] Add real-time collaboration enhancements (presence indicators, comments, version history)

### Performance

- [ ] Optimize document rendering engine ([core](https://codeberg.org/word-office/core), [sdkjs](https://codeberg.org/word-office/sdkjs))
- [ ] Reduce memory footprint for large documents
- [ ] Improve WebSocket-based real-time editing performance

---

## How to Get Involved

- **File issues** â€” [DocumentServer/issues](https://codeberg.org/word-office/DocumentServer/issues)
- **Submit PRs** â€” See the [contributing guide](CONTRIBUTING.md) for branch, commit, and PR conventions
- **Join the discussion** â€” Check the [organization page](https://codeberg.org/word-office) for community channels
- **Spread the word** â€” Star the repos, share with your network

---

## Partners & Supporters

Word Office is driven by a growing consortium of European organizations committed to digital sovereignty.

### Corporate & Non-Profit Partners

- IONOS
- Nextcloud
- EuroStack
- XWiki
- OpenProject
- Proton
- Soverin
- Abilian
- BTactic

### Education & Research

- ZKI â€” Zentrum fuer Kommunikation und Informationsverarbeitung, the IT consortium of German universities and research institutions

### Community & Public Sector

- graphwiz.ai Consulting
- Heinlein B1 â€” managed hosting and IT services provider
- Knoppix â€” the iconic Linux live system, supporting open-source office technology

---

## Audit Log

Findings from the initial codebase audit (March 2026):

| Area | Finding | Impact |
|------|---------|--------|
| Binary blobs | ~400-500 MB, dominated by VLC precompiled binaries (302 MB) | High |
| Russian comments | ~22,500 lines across core (7K), sdkjs (15K), web-apps (200) | High |
| Admin panel | Already built by Word Office (not from upstream) | Done |
| Mobile web UI | Complete for all 4 editors (306 JS files) | Done |
| Mobile native shells | None exist â€” must be built | Medium |
| AI features | 4 production features, on-device AI supported | Done |
| Desktop packaging | RPM + Debian + Windows exist; no Flatpak/Snap/AppImage | Low |
| CI/CD | 66 workflows across 12/19 repos | Good |
| Nextcloud integration | Mature (46 PHP files) | Done |
| Dependency licensing | 2 critical issues found | See below |

### Critical License Issues

| Dependency | Location | License | Problem |
|---|---|---|---|
| x265 (HEIF codec) | `core/Common/3dParty/heif/` | GPLv2 | ~~Disabled~~ - AGPL incompatible. See [core PR](https://codeberg.org/word-office/core/pulls/1) for fix.
| dmdb (DaMeng DB driver) | `server/DocService/` | None / Proprietary | No license declared. Proprietary code in AGPL project. Remove or isolate. |

### Medium License Concerns

| Dependency | Location | License | Problem |
|---|---|---|---|
| libde265 | `core/Common/3dParty/heif/` | LGPLv3 / GPLv2+ | Statically linked, LGPL compliance required |
| sharp (bundles libvips) | `server/DocService/` | Apache-2.0 wraps LGPL-2.1+ | Static linking of LGPL libvips needs compliance |
| Qt 5.15 | `desktop-sdk/` | LGPLv3 | Ensure dynamic linking or provide object files |
| libVLC | `desktop-sdk/` | LGPL2.1 | Same LGPL compliance requirements |

### Recommended Actions

1. **x265**: Obtain commercial license, switch to LGPLv3-only codecs, or disable HEIF in AGPL distributions
2. **dmdb**: Remove from AGPL codebase or isolate into a separate non-AGPL plugin
3. **Missing 3DPARTY.md entries**: Add Ace Editor, select2, bootstrap-select, Sparkle, SocketRocket, IXWebSocket, GLEW, POLE
4. **Stale entries**: Remove `fakeredis` from server/3DPARTY.md (not in any package.json)
