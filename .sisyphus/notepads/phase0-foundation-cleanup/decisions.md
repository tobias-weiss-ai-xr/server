# Decisions

## CI Pipeline Updates (2026-04-12)

- Added `cargo check --workspace` step in `lint-rust` job before clippy, to catch compilation errors separately from lint warnings.
- Added new `build-ts` job (between `typecheck-ts` and `build-rust`) that runs `pnpm build` to verify TypeScript compilation succeeds end-to-end.
