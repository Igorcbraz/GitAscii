import { describe, expect, it, vi } from 'vitest'

import { GET as getStarStatus, POST as postStar } from '@/app/api/github/star/route'
import * as auth from '@/lib/auth'

describe('GitHub Star & Guest Hooks Suite', () => {
  it('GET /api/github/star returns unauthenticated when no session', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValueOnce(null)

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ stargazers_count: 50 }), { status: 200 })
      )

    const res = await getStarStatus()
    const data = await res.json()

    expect(data.authenticated).toBe(false)
    expect(data.starred).toBe(false)
    expect(data.stargazersCount).toBe(50)
    expect(data.repoUrl).toBe('https://github.com/Igorcbraz/GitAscii')
    fetchSpy.mockRestore()
  })

  it('POST /api/github/star returns unauthenticated fallback URL when no session', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValueOnce(null)

    const res = await postStar()
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.fallbackUrl).toBe('https://github.com/Igorcbraz/GitAscii')
    expect(data.reason).toBe('unauthenticated')
  })

  it('GET /api/github/star handles authenticated user without error', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValueOnce({
      username: 'testuser',
      githubId: 123456,
      accessToken: 'gho_mock_token',
    })

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ stargazers_count: 50 }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    const res = await getStarStatus()
    const data = await res.json()

    expect(data.authenticated).toBe(true)
    expect(data.starred).toBe(true)
    expect(data.stargazersCount).toBe(50)
    fetchSpy.mockRestore()
  })

  it('POST /api/github/star returns success when GitHub API returns 204', async () => {
    vi.spyOn(auth, 'getSession').mockResolvedValueOnce({
      username: 'testuser',
      githubId: 123456,
      accessToken: 'gho_mock_token',
    })

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    const res = await postStar()
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.starred).toBe(true)
    fetchSpy.mockRestore()
  })
})
