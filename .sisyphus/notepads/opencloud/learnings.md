## Session: Tasks 1-4 Implementation

### Patterns
- PowerShell on Windows: cannot use xport, use $env:VAR='value' instead
- git add/commit works fine with env vars set inline even if export fails
- git add -A stages deletions and new files together cleanly

### Decisions
- Followed plan code exactly for lib/config.js, lib/compose.js, lib/ocis-config.js
- js-yaml added to package.json manually (not via npm install since node_modules may be incomplete)
- Kept empty routes/, views/, public/, templates/ directories as scaffolding for later tasks

### Gotchas
- CRLF warnings from git on Windows — expected, harmless
- LSP errors from core/ C++ code are unrelated to this project

