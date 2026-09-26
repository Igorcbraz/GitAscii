import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchGitHubDataForAction } from './dataFetcher'

afterEach(() => vi.unstubAllGlobals())

describe('Action publication data', () => {
  it.each([403, 429, 503])(
    'aborts refresh on repositories HTTP %s instead of publishing empty data',
    async (status) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(Response.json({ login: 'testuser', public_repos: 20 }))
        .mockResolvedValueOnce(Response.json({ message: 'unavailable' }, { status }))
      vi.stubGlobal('fetch', fetchMock)
      await expect(fetchGitHubDataForAction('testuser', 'test-token')).rejects.toThrow(
        `HTTP ${status}`
      )
      expect(fetchMock).toHaveBeenCalledTimes(2)
    }
  )
})
