# WEB EDITOR FRONTEND

**Generated:** 2026-04-19 | **License:** AGPL-3.0

## OVERVIEW

Web-based document editing suite. Legacy editors in vanilla JS, modern React wrappers in TypeScript. Part of pnpm workspace.

## STRUCTURE

```
apps/web/
├── apps/
│   ├── common/                    # Shared editor code (217 JS files)
│   ├── spreadsheeteditor/         # Spreadsheet editor, vanilla JS (164 JS)
│   ├── documenteditor/            # Document editor, vanilla JS (148 JS)
│   ├── presentationeditor/        # Presentation editor, vanilla JS (112 JS)
│   ├── pdfeditor/                 # PDF editor, vanilla JS (89 JS)
│   ├── visioeditor/               # Visio editor, vanilla JS (40 JS)
│   ├── spreadsheeteditor-react/   # React wrapper (35 ts/tsx)
│   ├── documenteditor-react/      # React wrapper (40 ts/tsx)
│   ├── presentationeditor-react/  # React wrapper (35 ts/tsx)
│   ├── pdfeditor-react/           # React wrapper (30 ts/tsx)
│   ├── visioeditor-react/         # React wrapper (26 ts/tsx)
│   ├── editor-shell/              # Shared shell (13 ts/tsx)
│   └── api/                       # API layer (1 JS)
├── vendor/                        # Vendored libs (ace, backbone, monaco, requirejs, underscore)
├── theme/                         # Editor themes
├── translation/                   # i18n translations
└── test/                          # Web-level tests
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Document editing | `apps/documenteditor/` | Vanilla JS, largest legacy editor |
| Spreadsheet editing | `apps/spreadsheeteditor/` | Vanilla JS, most files (12,528 total) |
| Presentation editing | `apps/presentationeditor/` | Vanilla JS |
| PDF editing | `apps/pdfeditor/` | Vanilla JS |
| React wrappers | `apps/*-react/` | TypeScript, thin wrappers around legacy JS |
| Shared code | `apps/common/` | 217 JS files, shared by all editors |
| Shared components | `apps/editor-shell/` | Shell, toolbar, menu |
| Vendored code | `vendor/` | DO NOT MODIFY — ace, backbone, monaco, requirejs, underscore |

## CONVENTIONS

- Dual architecture: legacy vanilla JS editors + modern React wrappers
- Each editor has `main/app/view/` (views) and `main/app/controller/` (controllers)
- Help resources (images, function docs) account for bulk of file count
- Mobile stores in `apps/*/mobile/src/store/`

## ANTI-PATTERNS

- NEVER modify `vendor/` — frozen vendored dependencies
- NEVER add editor-specific logic to `apps/common/` — shared only
- Changes to `apps/common/` affect ALL editor apps
- React wrappers should stay thin — put logic in the underlying JS editor or shared packages

## NOTES

- `apps/web/` has NO `package.json` — workspace membership via root `pnpm-workspace.yaml`
- Bulk of files are help resources (images, translated function docs), not code
- Actual code: ~800 JS + ~230 TS/TSX files across all editor apps
