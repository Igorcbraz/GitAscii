import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchProfiles } from './profilesClient'

afterEach(() => vi.unstubAllGlobals())

describe('shared editor and Pro profile listing', () => {
  it('preserves server identity and draft status, and refetches after account changes', async () => {
    const alice = { slug: 'work', name: 'Alice work', isSynced: false, isDefault: false }
    const bob = { slug: 'default', name: 'Bob profile', isSynced: true, isDefault: true }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ profiles: [alice] }))
      .mockResolvedValueOnce(Response.json({ profiles: [bob] }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchProfiles()).toEqual([alice])
    expect(await fetchProfiles()).toEqual([bob])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenLastCalledWith('/api/pro/profiles', {
      cache: 'no-store',
      signal: undefined,
    })
  })

  it('does not disguise an authorization or malformed response as an empty list', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({}, { status: 401 }))
        .mockResolvedValueOnce(Response.json({ profiles: {} }))
    )
    await expect(fetchProfiles()).rejects.toThrow('401')
    await expect(fetchProfiles()).rejects.toThrow('Invalid profiles response')
  })
})
