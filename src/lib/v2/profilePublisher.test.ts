import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { bootstrapGitasciiProfiles } from '@/lib/migration/branchBootstrap'
import { loadProfileConfig } from '@/lib/profileStorage'

import { promoteProfileToDefaultV2 } from './profilePublisher'

vi.mock('@/lib/githubApp', () => ({
  getInstallationTokenForUser: vi.fn().mockResolvedValue({ token: 'test-token' }),
}))
vi.mock('@/features/github/api/fetchProfile', () => ({
  fetchGitHubProfile: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/lib/migration/branchBootstrap', () => ({
  bootstrapGitasciiProfiles: vi.fn().mockResolvedValue({ success: true }),
  bootstrapGitasciiBranch: vi.fn(),
}))
vi.mock('@/lib/profileStorage', () => ({ loadProfileConfig: vi.fn() }))

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('promotion snapshot handoff', () => {
  it('returns the original pair for persistence even if optional workflow dispatch fails', async () => {
    const sourceConfig = createConfiguration(1, 'owner', 'blank', 'work')
    const oldDefaultConfig = createConfiguration(1, 'owner', 'blank')
    vi.mocked(loadProfileConfig)
      .mockResolvedValueOnce(sourceConfig)
      .mockResolvedValueOnce(oldDefaultConfig)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({}, { status: 503 })))
    await expect(promoteProfileToDefaultV2('owner', 'work')).resolves.toEqual({
      sourceConfig,
      oldDefaultConfig,
    })
    expect(bootstrapGitasciiProfiles).toHaveBeenCalledTimes(1)
    expect(
      vi.mocked(bootstrapGitasciiProfiles).mock.calls[0][3].map((config) => config.profileSlug)
    ).toEqual(['default', 'work'])
  })

  it('does not publish when promoting the canonical default to itself', async () => {
    const config = createConfiguration(1, 'owner', 'blank')
    vi.mocked(loadProfileConfig).mockResolvedValue(config)
    await promoteProfileToDefaultV2('owner', 'default')
    expect(bootstrapGitasciiProfiles).not.toHaveBeenCalled()
  })
})
