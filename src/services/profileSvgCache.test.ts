import { randomBytes } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const redis = vi.hoisted(() => {
  const values = new Map<string, unknown>()
  return {
    values,
    get: vi.fn(async (key: string) => values.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown, _options?: { ex: number }) => {
      values.set(key, value)
    }),
    incr: vi.fn(async (key: string) => {
      const next = Number(values.get(key) || 0) + 1
      values.set(key, next)
      return next
    }),
  }
})

vi.mock('@/features/pro/server/redisClient', () => ({ getProRedisClient: () => redis }))

const payload = (svgContent = '<svg/>', hasErrors = false) => ({
  svgContent,
  hasErrors,
  etag: 'W/"test"',
  renderedWidgetIds: ['image'],
})

describe('profile SVG cache', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    vi.resetModules()
    redis.values.clear()
  })

  it('preserves a GIF-backed SVG over 2 MB across cold instances', async () => {
    const svg = `<svg><image href="data:image/gif;base64,${randomBytes(2400000).toString('base64')}"/></svg>`
    const generate = vi.fn(async () => payload(svg))
    const first = await import('./profileSvgCache')
    expect((await first.getCachedProfileSvg('User', ['default'], generate)).svgContent).toBe(svg)
    vi.resetModules()
    const cold = await import('./profileSvgCache')
    expect((await cold.getCachedProfileSvg('user', ['default'], generate)).svgContent).toBe(svg)
    expect(generate).toHaveBeenCalledTimes(1)
    expect(redis.set).toHaveBeenCalledWith(expect.any(String), expect.any(String), { ex: 3600 })
  })

  it('coalesces simultaneous renders of one variant', async () => {
    const { getCachedProfileSvg } = await import('./profileSvgCache')
    const generate = vi.fn(async () => payload())
    await Promise.all(
      Array.from({ length: 8 }, () => getCachedProfileSvg('user', ['dark'], generate))
    )
    expect(generate).toHaveBeenCalledTimes(1)
  })

  it('invalidates all profile variants across warm instances', async () => {
    const first = await import('./profileSvgCache')
    const generate = vi.fn(async () => payload())
    await first.getCachedProfileSvg('user', ['dark'], generate)
    vi.resetModules()
    const second = await import('./profileSvgCache')
    await second.getCachedProfileSvg('user', ['dark'], generate)
    await second.invalidateSvgCache('USER')
    await first.getCachedProfileSvg('user', ['dark'], generate)
    expect(generate).toHaveBeenCalledTimes(2)
  })

  it('keeps themes and profiles separate', async () => {
    const { getCachedProfileSvg } = await import('./profileSvgCache')
    const dark = await getCachedProfileSvg('user', ['default', 'dark'], async () => payload('dark'))
    const light = await getCachedProfileSvg('user', ['default', 'light'], async () =>
      payload('light')
    )
    const other = await getCachedProfileSvg('user', ['other', 'dark'], async () => payload('other'))
    expect([dark.svgContent, light.svgContent, other.svgContent]).toEqual([
      'dark',
      'light',
      'other',
    ])
  })

  it('retries a failed widget after two minutes instead of keeping it for an hour', async () => {
    const { getCachedProfileSvg } = await import('./profileSvgCache')
    const now = Date.now()
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now)
    const generate = vi
      .fn()
      .mockResolvedValueOnce(payload('fallback', true))
      .mockResolvedValue(payload('recovered'))
    await getCachedProfileSvg('user', [], generate)
    expect(redis.set).toHaveBeenLastCalledWith(expect.any(String), expect.any(String), { ex: 120 })
    clock.mockReturnValue(now + 121000)
    expect((await getCachedProfileSvg('user', [], generate)).svgContent).toBe('recovered')
  })

  it('serves the full output when Redis is unavailable', async () => {
    const { getCachedProfileSvg } = await import('./profileSvgCache')
    redis.get.mockRejectedValueOnce(new Error('offline'))
    const result = await getCachedProfileSvg('user', [], async () => payload('intact'))
    expect(result.svgContent).toBe('intact')
  })

  it('does not cache a rejected render', async () => {
    const { getCachedProfileSvg } = await import('./profileSvgCache')
    const generate = vi
      .fn()
      .mockRejectedValueOnce(new Error('upstream'))
      .mockResolvedValue(payload())
    await expect(getCachedProfileSvg('user', [], generate)).rejects.toThrow('upstream')
    await getCachedProfileSvg('user', [], generate)
    expect(generate).toHaveBeenCalledTimes(2)
  })
})
