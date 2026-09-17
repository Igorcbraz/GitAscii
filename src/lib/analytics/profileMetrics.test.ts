import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockedIsProUser = vi.fn()
const mockedIngestProfileView = vi.fn()

vi.mock('@/features/pro/server/entitlements', () => ({
  isProUser: mockedIsProUser,
}))

vi.mock('@/features/pro/server/analyticsStore', () => ({
  ingestProfileView: mockedIngestProfileView,
}))

import { parseViewerMetadata, recordProfileView } from './profileMetrics'

const metric = {
  username: 'TestUser',
  profileSlug: 'default',
  theme: 'dark' as const,
  renderTimeMs: 12,
  isCamoProxy: true,
  isCacheHit: false,
  timestamp: '2026-09-17T00:00:00.000Z',
}

describe('profile analytics measurement boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('never persists a badge fetch for a Free user', async () => {
    mockedIsProUser.mockResolvedValue(false)

    await recordProfileView(metric)

    expect(mockedIsProUser).toHaveBeenCalledWith('TestUser')
    expect(mockedIngestProfileView).not.toHaveBeenCalled()
  })

  it('persists exactly one badge fetch for a Pro user', async () => {
    mockedIsProUser.mockResolvedValue(true)

    await recordProfileView(metric)

    expect(mockedIngestProfileView).toHaveBeenCalledTimes(1)
    expect(mockedIngestProfileView).toHaveBeenCalledWith(metric)
  })

  it('extracts only observable request metadata and detects GitHub Camo', () => {
    const request = new Request('https://gitascii.com/api/badge/test', {
      headers: {
        'user-agent': 'github-camo (0.1)',
        referer: 'https://github.com/test/test',
        'cf-ipcountry': 'BR',
        'x-forwarded-for': '203.0.113.10',
      },
    })

    expect(parseViewerMetadata(request)).toEqual({
      isCamoProxy: true,
      userAgent: 'github-camo (0.1)',
      referrer: 'https://github.com/test/test',
    })
  })
})
