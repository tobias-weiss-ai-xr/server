<!--
SPDX-FileCopyrightText: 2026 Word Office contributors
SPDX-License-Identifier: CC0-1.0
-->

# Contributing to Word Office

Thanks for your interest! This guide covers how to set up, make changes, and submit contributions. See the [roadmap](ROADMAP.md) for project direction, and the [architecture doc](ARCHITECTURE.md) for how the repos fit together.

---

## Getting Started

1. **Source** the repository on [Codeberg](https://codeberg.org/word-office).
2. **Clone** your Source:
   ```sh
   git clone git@codeberg.org:<your-username>/<repo>.git
   cd <repo>
   ```
3. **Build** with Docker (fastest path):
   ```sh
   cd develop
   make pull    # use latest pre-built image
   # or
   make build   # build from scratch (required for ARM64)
   ```
4. **Start** the development environment:
   ```sh
   make
   ```
   The editor is available at `http://localhost:8081/`.

See the [DocumentServer build docs](https://codeberg.org/word-office/DocumentServer/src/branch/main/build) and [development setup](https://codeberg.org/word-office/DocumentServer/src/branch/main/develop) for details.

---

## Repository Overview

Word Office consists of 22 repositories. The main integration point is **DocumentServer**, which assembles the other components into a deployable service.

| Repository | Purpose | Language |
|---|---|---|
| [DocumentServer](https://codeberg.org/word-office/DocumentServer) | Docker/Debian package assembly, CI/CD | Shell, Make |
| [core](https://codeberg.org/word-office/core) | Document rendering engine (OOXML, ODF, PDF) | C++ |
| [server](https://codeberg.org/word-office/server) | Node.js backend (DocService, converter, admin panel) | JavaScript |
| [sdkjs](https://codeberg.org/word-office/sdkjs) | JavaScript SDK for the editor | JavaScript |
| [web-apps](https://codeberg.org/word-office/web-apps) | Editor UI (document, spreadsheet, presentation, PDF) | HTML/JS/CSS |
| [desktop-sdk](https://codeberg.org/word-office/desktop-sdk) | Desktop integration SDK, CEF wrapper, AI plugins | C++ |
| [desktop-apps](https://codeberg.org/word-office/desktop-apps) | Desktop packaging and build orchestration | C++/JS |
| [DesktopEditors](https://codeberg.org/word-office/DesktopEditors) | Desktop editor application (Chromium-based) | C++ |
| [word-office-nextcloud](https://codeberg.org/word-office/word-office-nextcloud) | Nextcloud integration app | PHP, Vue 3 |
| [word-office-opencloud](https://codeberg.org/word-office/word-office-opencloud) | Cloud storage + document editing | Node.js, EJS |
| [documents-app-android](https://codeberg.org/word-office/documents-app-android) | Android mobile app | Kotlin |
| [document-server-integration](https://codeberg.org/word-office/document-server-integration) | Integration examples (7 languages) | Go, Python, PHP, Java, C#, Node, Ruby |
| [document-server-package](https://codeberg.org/word-office/document-server-package) | Debian/RPM packaging | Shell |
| [docker-ci](https://codeberg.org/word-office/docker-ci) | CI Docker images (Ubuntu 24.04, Node 20, JDK 21) | Dockerfile |
| [core-fonts](https://codeberg.org/word-office/core-fonts) | Bundled fonts for rendering (~100 files) | TTF/OTF |
| [dictionaries](https://codeberg.org/word-office/dictionaries) | Spell-check dictionaries (103 locales) | Text |
| [document-formats](https://codeberg.org/word-office/document-formats) | Open XML format documentation | XML |
| [document-templates](https://codeberg.org/word-office/document-templates) | Sample document templates | Binary |
| [sdkjs-forms](https://codeberg.org/word-office/sdkjs-forms) | Forms plugin for JS SDK | JavaScript |
| [plugin-aiautofill](https://codeberg.org/word-office/plugin-aiautofill) | AI auto-fill plugin (v1.0.0) | JavaScript |
| [artwork](https://codeberg.org/word-office/artwork) | Branding assets (logo, teaser images) | SVG/PNG |
| [.github](https://codeberg.org/word-office/.github) | Org profile, roadmap, contributing guide | Markdown |

---

## Development Setup

### Docker (recommended)

The Docker-based environment is the fastest way to get started:

1. Follow the [DocumentServer/develop setup](https://codeberg.org/word-office/DocumentServer/src/branch/main/develop)
2. Enter the container: `docker compose exec eo bash`
3. Build individual components:
   ```sh
   make web-apps    # JavaScript UI
   make sdkjs       # Editor SDK
   make core        # C++ rendering engine
   make server      # Node.js backend
   ```

Quick rebuilds (no dependency install): `make web-apps-dev`. Debug builds: `make sdkjs DEBUG=1`.

### ARM64 (Apple Silicon / Graviton)

ARM64 is supported with automatic fallbacks for x86\_64-only tooling. No pre-built ARM64 image yet — build locally with `make build`.

### Testing

Tests run as part of CI. To run them locally inside the development container, check the specific repository's test documentation.

---

## Making Changes

### Branching

Create a descriptive branch from `main`:

```sh
git checkout -b fix/login-redirect main
```

Keep branches focused on one concern each.

### Commit Messages

Write clear, plain English commit messages that explain what changed and why.

**Good:**
```
Fix typos in README.md
Add FAQ entry regarding Word Office's openness
Remove unused import in document converter
```

**Bad:**
```
fix: login redirect
feat(ui): add button
update stuff
```

No semantic prefixes (`feat:`, `fix:`, `chore:`). Just say what you did.

### Pull Requests

1. Push your branch to your Source.
2. Open a PR against the upstream `main` branch.
3. Describe what the PR does and why. Link related issues.
4. Keep PRs small and focused. Large changes should be split into a series.
5. A maintainer will review your PR. Be ready to discuss and iterate.

---

## Code Style

- **Language**: All code comments and commit messages must be in English.
- **Follow existing patterns**: When in doubt, match the style of surrounding code.
- **No binary blobs**: Do not add compiled binaries, obfuscated code, or minified files without a clear reason discussed in the PR.
- **Clear naming**: Use descriptive variable and function names. Avoid single-letter names except in tight loops.

Each repository may have more specific style guides. Check for linter configurations (`.eslintrc`, `.clang-format`, etc.) in the repo you are working on.

---

## Reporting Issues

Found a bug or have a feature request?

1. **Search first** — check if the issue already exists in [DocumentServer/issues](https://codeberg.org/word-office/DocumentServer/issues) or the relevant repository.
2. **Be specific** — include steps to reproduce, expected vs. actual behavior, and your environment (OS, browser, Docker version).
3. **Screenshots help** — attach screenshots or screen recordings when applicable.
4. **One issue per report** — don't bundle unrelated problems into one issue.

---

## Community Guidelines

Word Office is built by people from different backgrounds and countries. Be respectful and constructive in all interactions. Assume good intent. Focus on the code, not the person.

---

## License

Word Office is licensed under the [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html).

All source files must include SPDX license headers. For new files, use:

```
SPDX-FileCopyrightText: 2026 Word Office contributors
SPDX-License-Identifier: AGPL
```
