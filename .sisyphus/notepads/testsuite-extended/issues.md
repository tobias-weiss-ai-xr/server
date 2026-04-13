# Issues Found During QA

## 2026-04-13: Manual QA Run

### BLOCKING

1. **Playwright config includes Jest test files** — `npx playwright test --list` crashes on all `.test.js` files with `Error: Do not import @jest/globals outside of the Jest test environment`. Config must use `testMatch` to target only `.spec.js` files, or exclude `.test.js` files. Result: 0 tests listed.

2. **jwt.test.js missing `@jest/globals` import** — File uses `describe()` globally without `const { describe, test, expect } = require('@jest/globals');`. Causes `ReferenceError: describe is not defined`.

### NON-BLOCKING

3. **Jest run times out at 120s** — 14 test suites, only 10 ran before timeout. Live-service tests hang waiting for Docker connections. `--forceExit` doesn't help because tests don't exit cleanly. Consider adding connection timeouts to `wopiRequest()` helper.

4. **Port 3000 and 8080 in use** — LiteLLM Dashboard (PID 15456/39236) occupies both ports. Will conflict with Companion (3000) and Document Server (8080) when Docker services start.

5. **input-validation.test.js error handling** — Catch block checks `error.response?.status` but gets `undefined` because the server isn't running (connection refused, not HTTP error). Tests should handle `ECONNREFUSED` gracefully.
