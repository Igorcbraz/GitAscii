import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({
    username: 'testuser',
    githubId: 1,
    accessToken: 'server-only-token',
    expiresAt: 123,
  }),
}))
vi.mock('@/features/pro/server/entitlements', () => ({
  getProEntitlements: vi.fn().mockResolvedValue({ tier: 'free', maxProfiles: 1 }),
  computeEntitlements: vi.fn(),
}))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({ get: () => undefined }) }))

import { GET } from './route'

describe('browser session contract', () => {
  it('returns public identity and permissions without server credentials', async () => {
    const response = await GET()
    const body = await response.json()
    expect(body.session.username).toBe('testuser')
    expect(body.session.isPro).toBe(false)
    expect(body.session).not.toHaveProperty('accessToken')
    expect(body.session).not.toHaveProperty('expiresAt')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
})
