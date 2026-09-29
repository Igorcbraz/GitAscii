import { afterEach, describe, expect, it, vi } from 'vitest'

import { recordProfileView } from '@/lib/analytics/profileMetrics'

import { GET } from './route'

vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  after: (task: () => Promise<void>) => {
    void task()
  },
}))
vi.mock('@/lib/analytics/profileMetrics', () => ({
  parseViewerMetadata: () => ({ isCamoProxy: false, userAgent: null, referrer: null }),
  recordProfileView: vi.fn().mockResolvedValue(undefined),
}))

describe('public badge telemetry', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('records analytics for an unversioned V2 badge', async () => {
    const response = await GET(new Request('https://gitascii.com/api/badge/alice'), {
      params: Promise.resolve({ username: 'alice' }),
    })
    expect(response.status).toBe(200)
    expect(recordProfileView).toHaveBeenCalledTimes(1)
  })

  it('records only the first V2 request within the edge cache lifetime', async () => {
    const entries = new Map<string, Response>()
    vi.stubGlobal('caches', {
      default: {
        match: async (request: Request) => entries.get(request.url) ?? null,
        put: async (request: Request, response: Response) => {
          entries.set(request.url, response)
        },
      },
    })
    const requestUrl = 'https://gitascii.com/api/badge/alice?slug=default'
    const context = { params: Promise.resolve({ username: 'alice' }) }

    const first = await GET(new Request(requestUrl), context)
    await Promise.resolve()
    const second = await GET(new Request(requestUrl), context)

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(first.headers.get('Cache-Control')).toContain('s-maxage=3600')
    expect(recordProfileView).toHaveBeenCalledTimes(1)
  })
})
