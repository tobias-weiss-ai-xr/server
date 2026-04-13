# Learnings — testsuite-extended

## 2026-04-13: file-sizes.test.js creation

- Edge-case tests in `tests/tests/e2e/edge/` follow concurrency.test.js patterns exactly
- Imports: `@jest/globals` for test primitives, `axios` for HTTP, `../../setup` for config
- Service URLs: env vars → config fallback → hardcoded localhost defaults
- `validateStatus: () => true` on all axios calls to prevent throwing on non-2xx
- `beforeAll` service availability check with graceful skip pattern (`skipAll` flag)
- `test.each()` works well for parameterized special-character filename tests
- `node -c` confirms syntax without needing jest runtime
- Placeholder tokens clearly marked with `NOT a secret` comments
- Path traversal assertions: check response body doesn't contain `/etc/passwd` patterns
