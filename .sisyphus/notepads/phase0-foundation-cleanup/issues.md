# Phase 0 Foundation Cleanup - Issues Log

## 2026-04-12: Missing workspace dependency `unicode-normalization`

**Problem:** `cargo check --workspace` failed because `wo-unicode/Cargo.toml` referenced `unicode-normalization = { workspace = true }` but the root `Cargo.toml` `[workspace.dependencies]` section did not include it.

**Fix:** Added `unicode-normalization = "0.1"` to root `Cargo.toml` line 83 (end of `[workspace.dependencies]`).

**Verification:** `cargo check --workspace` passes with zero errors after fix. Only pre-existing dead_code warnings in service stubs (identity-service, conversion-service, coauthoring-service).

**No other missing workspace dependencies found.**
