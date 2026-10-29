import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  enqueue: vi.fn(),
  flush: vi.fn(),
  pro: vi.fn(),
  ingest: vi.fn(),
}))
vi.mock('@/lib/db/client', () => ({ hasDbConfig: () => true }))
vi.mock('@/features/pro/server/telemetryQueueRedis', () => ({
  getTelemetryQueueStore: () => ({ enqueue: mocks.enqueue }),
  flushQueuedTelemetry: mocks.flush,
}))
vi.mock('@/features/pro/server/entitlements', () => ({ isProUser: mocks.pro }))
vi.mock('@/features/pro/server/analyticsStore', () => ({ ingestProfileView: mocks.ingest }))

import { POST } from '@/app/api/internal/telemetry-flush/route'

import { recordProfileView } from './profileMetrics'

const metric = {
  username: 'alice',
  profileSlug: 'default',
  theme: 'dark' as const,
  timestamp: new Date().toISOString(),
  renderTimeMs: 1,
  isCamoProxy: true,
  isCacheHit: false,
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.enqueue.mockResolvedValue(undefined)
  mocks.flush.mockResolvedValue(0)
})
afterEach(() => vi.unstubAllEnvs())

it('enqueues badges without per-request entitlement queries or SQL ingestion', async () => {
  await recordProfileView(metric)
  expect(mocks.enqueue).toHaveBeenCalledTimes(1)
  expect(mocks.pro).not.toHaveBeenCalled()
  expect(mocks.ingest).not.toHaveBeenCalled()
})
it('never falls back to SQL or draining when Redis cannot accept an event', async () => {
  mocks.enqueue.mockRejectedValue(new Error('offline'))
  await recordProfileView(metric)
  expect(mocks.flush).not.toHaveBeenCalled()
  expect(mocks.pro).not.toHaveBeenCalled()
  expect(mocks.ingest).not.toHaveBeenCalled()
})
it('denies missing or wrong scheduler credentials before draining', async () => {
  vi.stubEnv('TELEMETRY_CRON_SECRET', '')
  vi.stubEnv('CRON_SECRET', '')
  expect(
    (await POST(new Request('https://test/api/internal/telemetry-flush', { method: 'POST' })))
      .status
  ).toBe(503)
  vi.stubEnv('TELEMETRY_CRON_SECRET', 'secret')
  expect(
    (await POST(new Request('https://test/api/internal/telemetry-flush', { method: 'POST' })))
      .status
  ).toBe(401)
  expect(mocks.flush).not.toHaveBeenCalled()
})
it('authorized scheduler observes the same drain and reports failure without retry loops', async () => {
  vi.stubEnv('TELEMETRY_CRON_SECRET', 'secret')
  mocks.flush.mockRejectedValue(new Error('offline'))
  const response = await POST(
    new Request('https://test/api/internal/telemetry-flush', {
      method: 'POST',
      headers: { authorization: 'Bearer secret' },
    })
  )
  expect(response.status).toBe(503)
  expect(mocks.flush).toHaveBeenCalledTimes(1)
})
