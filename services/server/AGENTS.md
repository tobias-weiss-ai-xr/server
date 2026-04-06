# SERVER

**Generated:** 2026-03-31
**Source:** codeberg.org/World-Office/server (fork of WORLDOFFICE/server)
**Files:** ~863 | **License:** AGPL-3.0

## OVERVIEW

Node.js document builder server and common modules — provides CLI tools for document conversion and server-side processing.

## STRUCTURE

```
server/
├── package.json             # npm config (ESLint 9 + Prettier + Jest)
├── .editorconfig            # Editor configuration
├── .prettierrc              # Prettier config
├── DocBuilder/              # CLI document conversion tool
├── Common/                  # Shared server modules
└── (tests)/                 # Jest test suite
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| DocBuilder CLI | `DocBuilder/` | Command-line document conversion |
| Shared modules | `Common/` | Common server utilities |
| Tests | Various | Jest test suite |
| Lint config | `.prettierrc`, `.editorconfig` | Prettier + EditorConfig |

## CONVENTIONS

- **This repo has proper linting** — the only one in the workspace:
  - `npm run lint:check` — ESLint check
  - `npm run lint:fix` — ESLint auto-fix
  - `npm run format:check` — Prettier check
  - `npm run format:fix` — Prettier auto-fix
  - `npm run code:check` — Both lint + format
- Pre-commit hooks via husky + lint-staged
- ESLint 9 + Prettier 3.4.2

## ANTI-PATTERNS

- NEVER add npm dependencies without updating `package-lock.json`
- NEVER skip lint checks — this is the only repo with enforced linting
- NEVER commit without running `npm run code:check`

## NOTES

- Package name: "builder" v1.0.1
- Uses @eslint/compat for ESLint 9 flat config compatibility
- ~187 JS files, ~475 PNG (icons/screenshots), ~56 JSON configs
