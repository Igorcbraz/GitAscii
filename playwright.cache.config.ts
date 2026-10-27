import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'cache-polling.spec.ts',
  workers: 1,
  timeout: 180_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3107',
    channel: process.env.CACHE_TEST_BROWSER_CHANNEL || undefined,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/start-cache-verification-server.mjs',
    url: 'http://localhost:3107/api/auth/session',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
