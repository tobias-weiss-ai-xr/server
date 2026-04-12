# Learnings — Phase 0 Foundation Cleanup

## Rust Cargo Tasks in turbo.json
- Added 5 cargo tasks: `cargo:check`, `cargo:build`, `cargo:test`, `cargo:lint`, `cargo:fmt`
- `cargo:build` and `cargo:test` depend on `cargo:check` to ensure type checking first
- All tasks output `target/**` except `cargo:lint` and `cargo:fmt` which have empty outputs
- Placed after `clean` task in the tasks block

## Cargo Scripts in package.json
- Added 6 scripts: `cargo:check`, `cargo:build`, `cargo:test`, `cargo:lint`, `cargo:fmt`, `cargo:fmt:fix`
- `cargo:lint` uses `clippy --workspace -- -D warnings` (warnings as errors)
- `cargo:fmt` uses `--check` flag (CI mode), `cargo:fmt:fix` applies formatting
