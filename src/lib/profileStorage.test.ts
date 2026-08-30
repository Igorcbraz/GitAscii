import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SavedConfiguration } from '@/engine/types'

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

vi.mock('@/services/profileSvgService', () => ({
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
  beforeEach(() => {
    vi.clearAllMocks()
    invalidateProfileConfig('testuser', 'default')
  })

  it('saves and reads from in-memory cache directly', async () => {
    cacheProfileConfig(mockConfig)
    const loaded = await loadProfileConfig('testuser', 'default')
    expect(loaded).toEqual(mockConfig)
    expect(mockRedis.get).not.toHaveBeenCalled()
  })

  it('saves config to redis and memory', async () => {
    mockRedis.set.mockResolvedValue('OK')
    await saveProfileConfig(mockConfig)
    expect(mockRedis.set).toHaveBeenCalled()

    const loaded = await loadProfileConfig('testuser', 'default')
    expect(loaded).toEqual(mockConfig)
  })

  it('loads config from redis when memory cache misses', async () => {
    invalidateProfileConfig('testuser', 'default')
    mockRedis.get.mockResolvedValue(JSON.stringify(mockConfig))

    const loaded = await loadProfileConfig('testuser', 'default')
    expect(loaded).toEqual(mockConfig)
    expect(mockRedis.get).toHaveBeenCalled()
  })

  it('fetches from github when redis and cache miss and returns null on failure', async () => {
    invalidateProfileConfig('testuser', 'custom')
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
    invalidateProfileConfig('testuser', 'default')
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
