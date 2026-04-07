# World Office E2E Tests

Playwright-based end-to-end tests for the World Office document editing suite.

## Setup

```bash
cd tests/e2e
pnpm install
pnpm exec playwright install
```

## Running

```bash
# Run all tests (headless)
pnpm test

# Run with UI
pnpm test:ui

# Run headed (visible browser)
pnpm test:headed

# View report
pnpm report
```

## Prerequisites

- Document Server running at http://localhost:8080
- Node.js 20+
- Browsers installed via `npx playwright install`
