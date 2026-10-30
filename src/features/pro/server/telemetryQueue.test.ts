import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  drainTelemetry,
  type QueuedView,
  queueView,
  type TelemetryBatch,
  type TelemetryQueueStore,
} from './telemetryQueue'

const metric = {
  username: 'alice',
  profileSlug: 'default',
  theme: 'dark' as const,
  timestamp: '2020-01-01',
  renderTimeMs: 1,
  isCamoProxy: false,
  isCacheHit: false,
  ip: '192.0.2.1',
  userAgent: 'private device',
  referrer: 'https://private.example/path?secret=1',
}
class Queue implements TelemetryQueueStore {
  events: QueuedView[] = []
  batch: TelemetryBatch | null = null
  until = 0
  failAck = false
  async enqueue(event: QueuedView) {
    this.events.push(event)
  }
  async hasWork() {
    return !!this.events.length || !!this.batch
  }
  async reserve() {
    if (this.until > Date.now()) return false
    this.until = Date.now() + 3600000
    return true
  }
  async claim(id: string) {
    return (this.batch ??= this.events.length ? { id, events: this.events.splice(0, 500) } : null)
  }
  async acknowledge(id: string) {
    if (this.failAck) throw new Error('offline')
    if (this.batch?.id === id) this.batch = null
  }
}
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('durable telemetry drain protocol', () => {
  it('does not persist private identifiers or trust caller timestamps', () => {
    const event = queueView(metric)
    expect(event.source).toBe('Other')
    expect(event.timestamp).toBe(new Date().toISOString())
    expect(JSON.stringify(event)).not.toMatch(/192\.0|private|secret/)
  })
  it('empty queues never reserve or access Postgres', async () => {
    const store = new Queue(),
      persist = vi.fn()
    const reserve = vi.spyOn(store, 'reserve')
    expect(await drainTelemetry(store, persist)).toBe(0)
    expect(reserve).not.toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
  })
  it('100 concurrent cold workers share one hourly reservation', async () => {
    const store = new Queue(),
      persist = vi.fn().mockResolvedValue(undefined)
    for (let i = 0; i < 1200; i++) await store.enqueue(queueView(metric))
    await Promise.all(Array.from({ length: 100 }, () => drainTelemetry(store, persist)))
    expect(persist).toHaveBeenCalledTimes(3)
    await store.enqueue(queueView(metric))
    await drainTelemetry(store, persist)
    expect(persist).toHaveBeenCalledTimes(3)
    await vi.advanceTimersByTimeAsync(3600000)
    await drainTelemetry(store, persist)
    expect(persist).toHaveBeenCalledTimes(4)
  })
  it.each(['database', 'acknowledgement'])(
    'preserves the same batch across failed %s and retries only next hour',
    async (failure) => {
      const store = new Queue()
      await store.enqueue(queueView(metric))
      store.failAck = failure === 'acknowledgement'
      const persist = vi.fn().mockImplementation(async () => {
        if (failure === 'database') throw new Error('DB offline')
      })
      await expect(drainTelemetry(store, persist, () => 'stable-id')).rejects.toThrow()
      expect(store.batch?.id).toBe('stable-id')
      await drainTelemetry(store, persist)
      expect(persist).toHaveBeenCalledTimes(1)
      store.failAck = false
      persist.mockResolvedValue(undefined)
      await vi.advanceTimersByTimeAsync(3600000)
      await drainTelemetry(store, persist, () => 'new-id')
      expect(persist.mock.calls[1][0].id).toBe('stable-id')
      expect(store.batch).toBeNull()
    }
  )
  it('a Redis reservation failure never falls back to SQL', async () => {
    const store = new Queue(),
      persist = vi.fn()
    await store.enqueue(queueView(metric))
    store.reserve = async () => {
      throw new Error('offline')
    }
    await expect(drainTelemetry(store, persist)).rejects.toThrow()
    expect(persist).not.toHaveBeenCalled()
    expect(store.events).toHaveLength(1)
  })
})
