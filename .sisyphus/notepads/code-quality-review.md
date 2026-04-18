## F2 Code Quality Review — Session Learnings

### Build System
- All cargo commands MUST run via WSL on this machine: `wsl bash -c "cd /mnt/c/Users/Tobias/git/World-Office && ~/.cargo/bin/cargo ..."`
- wo-pdf MUST be excluded: `--workspace --exclude wo-pdf` (ICE on rustc 1.94.1)
- pnpm filter uses the full package name: `@world-office/documenteditor` not `documenteditor-react`

### Clippy Warnings (pre-existing, non-blocking)
- wo-renderer-wasm has 11 warnings (mostly unneeded returns)
- wo-docx-renderer has 4 warnings (get_first, too many args, unneeded returns)
- wo-webdav has 10 warnings (unused imports)
- These are accumulated across the project, not new

### Code Quality Observations
- Zero AI slop patterns (TODO/FIXME/HACK/stub/placeholder) in changed Rust files
- Zero TS anti-patterns (as any, @ts-ignore, empty catch, console.log) across all 6 apps + sdk-bridge
- Module-level TODO comments in wasm-renderer.ts are acceptable per project convention
- pipeline.rs render_page re-parses DOCX for single-page PDF (inefficient but correct)

### Test Counts
- Total: 846 tests pass across 33 crates, 0 failures
- Largest test suites: wo-x2t (166 tests), wo-odf (100 tests), wo-renderer (125 tests from other session)
