import { afterEach, expect, it, vi } from 'vitest'

import { appOrigin } from './config'

afterEach(() => vi.unstubAllEnvs())

it('uses the public site for production when no application URL is configured', () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('NEXT_PUBLIC_APP_URL', '')
  expect(appOrigin()).toBe('https://gitascii.com')
})

it('keeps rejecting explicit insecure production origins', () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3200')
  expect(() => appOrigin()).toThrow('public HTTPS')
})

it('accepts an explicit HTTPS preview origin', () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://preview.example.test/path')
  expect(appOrigin()).toBe('https://preview.example.test')
})
