import { beforeEach, describe, expect, it } from 'vitest'

import { createProfile, deleteProfile, getUserProfiles, updateProfile } from './profileManagerStore'
import { resetProRedisMemoryStoreForTesting } from './redisClient'

describe('ProfileManagerStore Comprehensive Unit Tests', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
  })

  it('initializes default profile automatically if user has none', async () => {
    const username = 'BrandNewUser'
    const profiles = await getUserProfiles(username)

    expect(profiles.length).toBe(1)
    expect(profiles[0].slug).toBe('default')
    expect(profiles[0].name).toBe('Primary GitHub Profile')
    expect(profiles[0].isDefault).toBe(true)
    expect(profiles[0].publicUrl).toContain('/brandnewuser')
  })

  it('creates custom profiles and sanitizes slugs', async () => {
    const username = 'ProUser'
    const profile = await createProfile(username, {
      slug: 'Stats & Minimal 2026!',
      name: 'Stats Minimal',
      description: 'Clean theme for job applications',
    })

    expect(profile.slug).toBe('statsminimal2026')
    expect(profile.name).toBe('Stats Minimal')
    expect(profile.description).toBe('Clean theme for job applications')
    expect(profile.isDefault).toBe(false)
  })

  it('rejects invalid empty slugs', async () => {
    const username = 'ProUser'
    await expect(
      createProfile(username, {
        slug: '   !@#$%   ',
        name: 'Invalid',
      })
    ).rejects.toThrow('Invalid profile identifier/slug.')
  })

  it('updates profile fields and returns updated record', async () => {
    const username = 'UpdaterUser'
    await createProfile(username, { slug: 'compact', name: 'Old Name' })

    const updated = await updateProfile(username, 'compact', {
      name: 'New Compact Layout',
      description: 'Updated bio and widgets',
      status: 'draft',
      widgetsCount: 7,
    })

    expect(updated).not.toBeNull()
    expect(updated?.name).toBe('New Compact Layout')
    expect(updated?.description).toBe('Updated bio and widgets')
    expect(updated?.status).toBe('draft')
    expect(updated?.widgetsCount).toBe(7)
  })

  it('returns null when updating non-existent profile', async () => {
    const result = await updateProfile('user', 'non_existent_slug', { name: 'Test' })
    expect(result).toBeNull()
  })

  it('prevents deletion of default profile', async () => {
    const username = 'ProtectorUser'
    await expect(deleteProfile(username, 'default')).rejects.toThrow(
      'The default profile cannot be deleted.'
    )
  })

  it('successfully deletes custom profiles', async () => {
    const username = 'DeleteTester'
    await createProfile(username, { slug: 'temp', name: 'Temp' })

    let list = await getUserProfiles(username)
    expect(list.length).toBe(2)

    const deleted = await deleteProfile(username, 'temp')
    expect(deleted).toBe(true)

    list = await getUserProfiles(username)
    expect(list.length).toBe(1)
    expect(list[0].slug).toBe('default')
  })
})
