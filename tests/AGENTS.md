# E2E TEST SUITE

**Generated:** 2026-04-19 | **License:** AGPL-3.0

## OVERVIEW

End-to-end testing for the full document editing stack: Document Server (WOPI client), OCIS (WOPI host), and Companion (deployment dashboard). Uses Playwright + Jest + Docker Compose.

## STRUCTURE

```
tests/
├── tests/                 # Test specs
│   ├── setup.js           # Test environment setup
│   ├── helpers/docker.js  # Docker Compose helpers
│   └── fixtures/files/    # Test document fixtures
├── scripts/               # Utility + debug scripts (22 files)
│   ├── test-wopi-*.js     # WOPI protocol tests
│   ├── test-coediting.js  # Co-editing test
│   ├── test-ui-*.js       # UI interaction tests
│   ├── start-test-stack.sh
│   ├── stop-test-stack.sh
│   ├── wait-for-stack.sh
│   ├── gen-cert.js        # TLS cert generation
│   └── debug-*.js         # Debug utilities
├── docker-compose.test.yml       # Test stack (DocServer + OCIS)
├── docker-compose.opencloud.yml  # OpenCloud variant
├── playwright.config.js          # Playwright config
├── jest.config.js                # Jest config
├── .env.test                     # Test environment vars
└── .forgejo/workflows/e2e.yml    # CI E2E workflow
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Run E2E tests | `npm test` or `npm run test:e2e` | Starts Docker stack first |
| WOPI tests | `scripts/test-wopi-*.js` | Full chain, putfile, binary check |
| Co-editing test | `scripts/test-coediting.js` | Real-time collaboration |
| UI tests | `scripts/test-ui-*.js` | Context menu, app open |
| Start test stack | `scripts/start-test-stack.sh` | Docker Compose up |
| Test fixtures | `tests/fixtures/files/` | Sample documents |
| Debug utilities | `scripts/debug-*.js` | WOPI, WebDAV, file list debugging |

## CONVENTIONS

- Tests start the full Docker stack (DocServer + OCIS) before running
- Playwright for browser automation, Jest for test runner
- Helper scripts in `scripts/` are standalone Node.js (not Jest tests)
- TLS certs generated via `scripts/gen-cert.js` + `scripts/gen-key.js`

## ANTI-PATTERNS

- NEVER run tests without Docker Compose available
- NEVER skip `wait-for-stack.sh` — services need time to initialize
- Debug scripts (`debug-*.js`) are for development only — not part of CI
