# DOCUMENT-SERVER-INTEGRATION

**Generated:** 2026-03-31
**Source:** codeberg.org/World-Office/document-server-integration
**Files:** ~1.2k | **License:** AGPL-3.0

## OVERVIEW

Integration API and examples for connecting applications to WORLDOFFICE Document Server — shows how to embed editors in web apps.

## STRUCTURE

```
document-server-integration/
├── Makefile                 # Build system
├── web/                     # Integration examples
│   ├── documentserver-example/  # Multi-language examples
│   │   ├── php/             # PHP example
│   │   ├── nodejs/          # Node.js example
│   │   ├── python/          # Python example
│   │   ├── java/            # Java example
│   │   ├── csharp/          # C# example
│   │   └── ruby/            # Ruby example
│   └── apps/                # Complete app integrations
└── (API documentation)/     # SVG diagrams, API docs
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| PHP integration | `web/documentserver-example/php/` | Most complete example |
| Node.js integration | `web/documentserver-example/nodejs/` | `npm install` to set up |
| JavaScript API | `web/apps/*/` | Complete app examples |
| API docs | `web/*.svg` | Architecture diagrams |

## CONVENTIONS

- Build: `make` (installs Node.js example deps)
- PHP code follows PSR-12 (no linter config present)
- Each language example is self-contained

## ANTI-PATTERNS

- NEVER use these examples as production code without security review
- NEVER hardcode Document Server URLs — use configuration

## NOTES

- ~324 SVG files (documentation diagrams), ~170 PHP files, ~118 JS files
- This is the integration layer — it does NOT contain the editor itself
