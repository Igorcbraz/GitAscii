import path from 'node:path'

import { defineConfig } from 'vitest/config'

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'Set TEST_DATABASE_URL to an isolated disposable database before running test:db.'
  )
}

export default defineConfig({
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
  test: {
    name: 'database-integration',
    environment: 'node',
    include: ['src/lib/db/db.test.ts'],
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL,
      DATABASE_URL_UNPOOLED: process.env.TEST_DATABASE_URL,
    },
  },
})
