import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SavedConfiguration } from '@/engine/types'
import { saveProfileConfigInDb } from '@/lib/db/repositories/profileRepository'

import {
  cacheProfileConfig,
  invalidateProfileConfig,
  loadProfileConfig,
  saveProfileConfig,
} from './profileStorage'

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}

vi.mock('@/features/pro/server/redisClient', () => ({
  getProRedisClient: () => mockRedis,
}))

vi.mock('@/lib/db/repositories/profileRepository', () => ({
  getProfileConfigFromDb: vi.fn().mockResolvedValue(null),
  saveProfileConfigInDb: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/profileSvgCache', () => ({
  invalidateSvgCache: vi.fn(),
}))

const mockConfig: SavedConfiguration = {
  version: 1,
  githubId: 40432351,
  username: 'testuser',
  profileSlug: 'default',
  profileName: 'Primary Profile',
  templateId: 'default',
  widgets: [
    {
      instanceId: 'inst_1',
      widgetId: 'ascii-art',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      zIndex: 1,
      locked: false,
      visible: true,
      config: {},
    },
  ],
  globalStyles: {
    backgroundColor: '#000',
    textColor: '#fff',
    accentColor: '#00ff00',
    borderColor: '#333',
    fontFamily: 'monospace',
    borderRadius: 8,
    padding: 16,
    themeMode: 'dark',
  },
  metadata: {
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    schemaVersion: 1,
  },
}

describe('profileStorage', () => {
  afterEach(() => vi.unstubAllGlobals())
  beforeEach(async () => {
    vi.clearAllMocks()
    await invalidateProfileConfig('testuser', 'default')
  })

  it('saves and reads from in-memory cache directly', async () => {
    cacheProfileConfig(mockConfig)
    const loaded = await loadProfileConfig('testuser', 'default')
    expect(loaded).toEqual(mockConfig)
    expect(mockRedis.get).not.toHaveBeenCalled()
  })

  it('does not publish a failed database write into the memory cache', async () => {
    cacheProfileConfig(mockConfig)
    vi.mocked(saveProfileConfigInDb).mockRejectedValueOnce(new Error('database unavailable'))
    await expect(
      saveProfileConfig({ ...mockConfig, profileName: 'Unsaved change' })
    ).rejects.toThrow('database unavailable')
    expect((await loadProfileConfig('testuser', 'default'))?.profileName).toBe(
      mockConfig.profileName
    )
  })

  it('binds stored content to the requested account and slug', async () => {
    mockRedis.get.mockResolvedValue({
      ...mockConfig,
      username: 'different-account',
      profileSlug: 'other',
    })
    const loaded = await loadProfileConfig('testuser', 'default')
    expect(loaded?.username).toBe('testuser')
    expect(loaded?.profileSlug).toBe('default')
  })

  it('honors GitHub-first reads even when memory has an older configuration', async () => {
    cacheProfileConfig(mockConfig)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ ...mockConfig, profileName: 'Published update' }))
        )
    )
    expect(
      (await loadProfileConfig('testuser', 'default', { preferGitHub: true }))?.profileName
    ).toBe('Published update')
  })

  it('saves config to redis and memory', async () => {
    mockRedis.set.mockResolvedValue('OK')
    await saveProfileConfig(mockConfig)
    expect(mockRedis.set).toHaveBeenCalled()

    const loaded = await loadProfileConfig('testuser', 'default')
    expect(loaded).toEqual(mockConfig)
  })

  it('loads config from redis when memory cache misses', async () => {
    await invalidateProfileConfig('testuser', 'default')
    mockRedis.get.mockResolvedValue(JSON.stringify(mockConfig))

    const loaded = await loadProfileConfig('testuser', 'default')
    expect(loaded).toEqual(mockConfig)
    expect(mockRedis.get).toHaveBeenCalled()
  })

  it('fetches from github when redis and cache miss and returns null on failure', async () => {
    await invalidateProfileConfig('testuser', 'custom')
    mockRedis.get.mockResolvedValue(null)

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: vi.fn().mockResolvedValue(''),
    } as unknown as Response)

    const loaded = await loadProfileConfig('testuser', 'custom')
    expect(loaded).toBeNull()
  })

  it('fetches from github and populates cache when github returns valid JSON config', async () => {
    await invalidateProfileConfig('testuser', 'default')
    mockRedis.get.mockResolvedValue(null)
    mockRedis.set.mockResolvedValue('OK')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify(mockConfig)),
    } as unknown as Response)

    const loaded = await loadProfileConfig('testuser', 'default')
    expect(loaded).toEqual(mockConfig)
  })
})
