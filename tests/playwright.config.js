const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e/documents',
  testMatch: '**/*.spec.js',
  timeout: 180000,
  retries: 0,
  expect: { timeout: 30000 },
  baseURL: process.env.OCIS_URL || 'http://localhost:9200',
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  },
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
