import { beforeEach, describe, expect, it } from 'vitest'

import {
  createProfile,
  createProfileVersion,
  deleteProfile,
  duplicateProfile,
  getProfileVersions,
  getUserProfiles,
  restoreProfileVersion,
  setDefaultProfile,
  updateProfile,
} from './profileManagerStore'
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

  it('enforces 10 profiles maximum per user', async () => {
    const username = 'MultiProfileMaster'
    // Default profile is #1
    for (let i = 1; i <= 9; i++) {
      await createProfile(username, { slug: `profile-${i}`, name: `Profile ${i}` })
    }

    const currentProfiles = await getUserProfiles(username)
    expect(currentProfiles.length).toBe(10)

    // 11th profile should be rejected
    await expect(
      createProfile(username, { slug: 'profile-11', name: 'Profile 11' })
    ).rejects.toThrow('Maximum profile limit (10) reached')
  })

  it('duplicates profile including widgets and initial snapshot', async () => {
    const username = 'DuplicatorUser'
    await createProfile(username, {
      slug: 'source-profile',
      name: 'Source Profile',
      description: 'Original theme',
    })

    const duplicated = await duplicateProfile(username, 'source-profile', {
      slug: 'cloned-profile',
      name: 'Cloned Profile',
      description: 'Duplicated theme',
    })

    expect(duplicated.slug).toBe('cloned-profile')
    expect(duplicated.name).toBe('Cloned Profile')
    expect(duplicated.isDefault).toBe(false)

    const versions = await getProfileVersions(username, 'cloned-profile')
    expect(versions.length).toBe(1)
    expect(versions[0].label).toContain('Cloned from /source-profile')
  })

  it('sets default profile and updates other profiles isDefault flag', async () => {
    const username = 'DefaultSwitcher'
    await createProfile(username, { slug: 'work', name: 'Work Profile' })

    const updatedList = await setDefaultProfile(username, 'work')
    const workProf = updatedList.find((p) => p.slug === 'work')
    const defProf = updatedList.find((p) => p.slug === 'default')

    expect(workProf?.isDefault).toBe(true)
    expect(defProf?.isDefault).toBe(false)
  })

  it('manages version checkpoints and restores previous versions', async () => {
    const username = 'VersionTester'
    await createProfile(username, { slug: 'custom', name: 'Custom Profile' })

    // createProfile automatically created v1 initial snapshot.
    // Create next snapshot
    const mockConfigV1 = {
      id: 'cfg-1',
      userId: 'user-1',
      username,
      slug: 'custom',
      name: 'Custom Profile',
      widgets: [
        {
          instanceId: 'w1',
          widgetId: 'avatar-card',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          config: {},
          locked: false,
          visible: true,
          zIndex: 1,
        },
      ],
      theme: 'dark',
      layout: 'freeform',
      version: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any

    const v2 = await createProfileVersion(username, 'custom', {
      config: mockConfigV1,
      label: 'Version 2 Design',
      description: 'Single widget layout',
    })

    expect(v2.versionNumber).toBe(2)

    // Create v3 snapshot
    const mockConfigV2 = {
      ...mockConfigV1,
      widgets: [
        mockConfigV1.widgets[0],
        {
          instanceId: 'w2',
          widgetId: 'streak-graph',
          position: { x: 0, y: 100 },
          size: { width: 200, height: 100 },
          config: {},
          locked: false,
          visible: true,
          zIndex: 2,
        },
      ],
      version: 3,
    } as any

    const v3 = await createProfileVersion(username, 'custom', {
      config: mockConfigV2,
      label: 'Version 3 with Streak',
      description: 'Two widgets layout',
    })

    expect(v3.versionNumber).toBe(3)

    const allVersions = await getProfileVersions(username, 'custom')
    expect(allVersions.length).toBe(3)
    expect(allVersions[0].versionNumber).toBe(3) // newest first

    // Restore v2 (creates restore checkpoint v4)
    const restored = await restoreProfileVersion(username, 'custom', v2.id)
    expect(restored.restoredVersion.versionNumber).toBe(4)
    expect(restored.restoredVersion.label).toContain('Restored to v2')
    expect(restored.profile.slug).toBe('custom')
  })
})
