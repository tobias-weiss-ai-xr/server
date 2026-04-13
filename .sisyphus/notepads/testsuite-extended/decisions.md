## Scope Fidelity Check (F4) — 2026-04-13

### Findings

**T7 (playwright.config.js)**: Missing baseURL, screenshot: only-on-failure, video: retain-on-failure. testDir set to ./tests/e2e instead of tests/e2e/documents.

**T8 (ocis-interactive.spec.js / ocis-wopi-e2e.spec.js)**: Plan specified editing.spec.js with type/save/close/reopen tests. Actual files test WOPI chain and canvas loading only. Core editing workflow completely absent.

**T9 (coediting.spec.js)**: Plan specified real-time co-editing behavior (User A types → B sees, different/same section editing). Actual file only tests WOPI token separation and canvas loading. No actual editing interaction.

**T11 (concurrency.test.js)**: Missing DS restart → reconnection test. Plan specified 5 tests, only 4 present.

**Beyond-spec pattern**: T1-T6 and T11 all include significant extra tests beyond plan specification (edge cases, error handling, additional scenarios). Only T10 is 1:1 compliant.

### Decisions

- VERDICT: REJECT — 4 tasks have missing plan tests, scope divergence on T8/T9 is fundamental (different test scope entirely)
