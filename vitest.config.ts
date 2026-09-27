import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    maxWorkers: 4,
    alias: {
      '@': path.resolve(dirname, './src'),
    },
    projects: [
      {
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src'),
          },
        },
        test: {
          name: 'unit',
          environment: 'node',
          exclude: ['src/lib/db/db.test.ts'],
          include: [
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
            'src/**/*.spec.ts',
            'src/**/*.spec.tsx',
            'action/**/*.test.ts',
          ],
        },
      },
    ],
  },
})
