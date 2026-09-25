import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET, PUT } from './route'

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }))
vi.mock('@/features/pro/server/entitlements', () => ({ isProUser: vi.fn() }))
vi.mock('@/lib/githubApp', () => ({ getInstallationTokenForUser: vi.fn() }))

import { isProUser } from '@/features/pro/server/entitlements'
import { getSession } from '@/lib/auth'
import { getInstallationTokenForUser } from '@/lib/githubApp'

const githubUrl = 'https://api.github.com/repos/igor/igor/contents/README.md'
const source = '# Hello\n\nMy content.\n'

describe('Pro analytics badge route', () => {
  afterEach(() => vi.unstubAllGlobals())
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getSession).mockResolvedValue({ username: 'igor', githubId: 1 })
    vi.mocked(isProUser).mockResolvedValue(true)
    vi.mocked(getInstallationTokenForUser).mockResolvedValue({
      token: 'installation-token',
      installUrl: null,
    })
  })

  it('reports a missing badge from the current README', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: Buffer.from(source).toString('base64'),
          sha: 'sha-1',
        }),
        { status: 200 }
      )
    )
    vi.stubGlobal('fetch', fetchMock)
    const response = await GET(
      new Request('http://localhost/api/pro/analytics/badge?profile=default')
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ installed: false, canWrite: true })
    expect(fetchMock).toHaveBeenCalledWith(githubUrl, expect.any(Object))
  })

  it('updates the README with its SHA and keeps existing content', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ content: Buffer.from(source).toString('base64'), sha: 'sha-1' }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const response = await PUT(
      new Request('http://localhost/api/pro/analytics/badge', {
        method: 'PUT',
        body: JSON.stringify({ profile: 'default', style: 'transparent' }),
      })
    )
    expect(response.status).toBe(200)
    const [, options] = fetchMock.mock.calls[1]
    const payload = JSON.parse(options.body)
    const updated = Buffer.from(payload.content, 'base64').toString('utf8')
    expect(payload.sha).toBe('sha-1')
    expect(updated).toContain(source.trim())
    expect(updated).toContain('style=transparent')
  })

  it('requires a Pro session before reading GitHub', async () => {
    vi.mocked(isProUser).mockResolvedValue(false)
    const response = await GET(new Request('http://localhost/api/pro/analytics/badge'))
    expect(response.status).toBe(403)
    expect(getInstallationTokenForUser).not.toHaveBeenCalled()
  })
})
