import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

/**
 * Playwright E2E testing configuration.
 * Optimized for AI-friendly testing and verification of critical application flows.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  reporter: 'html',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Run local dev server before starting the tests
  webServer: {
    command:
      process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ||
      (process.env.CI ? 'npm run start' : 'npm run dev'),
    url: `${baseURL}/api/auth/session`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
