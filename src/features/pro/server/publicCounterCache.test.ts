import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CounterStore } from './__tests__/counterStore'
import { createPublicCounterCache } from './publicCounterCache'

describe('public counter database budget', () => {
  let store: CounterStore
  const load = vi.fn<() => Promise<number>>()
  function worker(key = 'counter', getStore = () => store) {
    return createPublicCounterCache({
      key,
      load,
      getStore,
      fallback: () => 0,
      valid: (value): value is number => Number.isInteger(value) && Number(value) >= 0,
    })
  }
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-01T00:00:00Z'))
    store = new CounterStore()
    load.mockReset().mockResolvedValue(426)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('coalesces 100 simultaneous calls in one worker', async () => {
    const read = worker()
    const results = await Promise.all(Array.from({ length: 100 }, () => read()))
    expect(new Set(results)).toEqual(new Set([426]))
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('allows only one source read across 100 independent workers on a cold cache', async () => {
    await Promise.all(Array.from({ length: 100 }, () => worker()()))
    expect(load).toHaveBeenCalledTimes(1)
    expect(await worker()()).toBe(426)
  })

  it('survives instance restarts and only refreshes after the hour expires', async () => {
    await worker()()
    for (let i = 0; i < 11; i++) {
      vi.advanceTimersByTime(300_000)
      expect(await worker()()).toBe(426)
    }
    expect(load).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(300_000)
    load.mockResolvedValue(427)
    await Promise.all(Array.from({ length: 100 }, () => worker()()))
    expect(load).toHaveBeenCalledTimes(2)
    expect(await worker()()).toBe(427)
  })

  it('simulates 31 days of constant requests with at most 744 reads per counter', async () => {
    for (let minute = 0; minute < 31 * 24 * 60; minute++) {
      await worker()()
      vi.advanceTimersByTime(60_000)
    }
    expect(load).toHaveBeenCalledTimes(744)
  })

  it('caches a valid zero value', async () => {
    load.mockResolvedValue(0)
    await worker()()
    await worker()()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('does not query without a shared store', async () => {
    const read = createPublicCounterCache({
      key: 'counter',
      load,
      getStore: () => null,
      fallback: () => 0,
      valid: (value): value is number => typeof value === 'number',
    })
    expect(await read()).toBe(0)
    expect(load).not.toHaveBeenCalled()
  })

  it.each(['failReads', 'failReservations'] as const)(
    'does not query Postgres when Redis reports %s',
    async (failure) => {
      store[failure] = true
      await Promise.all(Array.from({ length: 100 }, () => worker()()))
      expect(load).not.toHaveBeenCalled()
    }
  )

  it('does not query when a reservation reply is lost, even if Redis accepted it', async () => {
    store.loseReservationReply = true
    await worker()()
    store.loseReservationReply = false
    await worker()()
    expect(load).not.toHaveBeenCalled()
  })

  it('keeps the reservation after a failed snapshot write across cold workers', async () => {
    store.failWrites = true
    expect(await worker()()).toBe(426)
    await Promise.all(Array.from({ length: 100 }, () => worker()()))
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('keeps the reservation after a database error, without caching it as a valid zero', async () => {
    load.mockRejectedValue(new Error('DB unavailable'))
    await worker()()
    vi.advanceTimersByTime(60_000)
    await worker()()
    expect(load).toHaveBeenCalledTimes(1)
    expect(await store.get('counter')).toBeNull()
    vi.advanceTimersByTime(3_540_000)
    load.mockResolvedValue(427)
    expect(await worker()()).toBe(427)
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('serves stale data during an outage, but never beyond the 24-hour retention', async () => {
    const read = worker()
    await read()
    vi.advanceTimersByTime(3_600_000)
    store.failReads = true
    expect(await read()).toBe(426)
    vi.advanceTimersByTime(23 * 3_600_000)
    expect(await read()).toBe(0)
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('does not let corrupt data bypass the shared reservation', async () => {
    await worker()()
    await store.set('counter', { value: -1, freshUntil: 'invalid' }, { ex: 86400 })
    expect(await worker()()).toBe(0)
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid source results instead of persisting them', async () => {
    load.mockResolvedValue(NaN)
    expect(await worker()()).toBe(0)
    expect(await store.get('counter')).toBeNull()
    await worker()()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('does not refresh again when the snapshot disappears but the budget survives', async () => {
    await worker()()
    store.entries.delete('counter')
    await Promise.all(Array.from({ length: 100 }, () => worker()()))
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('serves the previous value while another worker refreshes a stale snapshot', async () => {
    await worker()()
    vi.advanceTimersByTime(3_600_000)
    let finish!: (count: number) => void
    load.mockImplementation(
      () =>
        new Promise<number>((resolve) => {
          finish = resolve
        })
    )
    const refresh = worker()()
    // Drain the read/reservation microtasks without advancing the expiry clock.
    for (let i = 0; i < 5; i++) await Promise.resolve()
    expect(await worker()()).toBe(426)
    expect(load).toHaveBeenCalledTimes(2)
    finish(427)
    expect(await refresh).toBe(427)
  })

  it('recovers after Redis becomes available without a database fallback during the outage', async () => {
    store.failReads = true
    const read = worker()
    expect(await read()).toBe(0)
    expect(load).not.toHaveBeenCalled()
    store.failReads = false
    vi.advanceTimersByTime(60_000)
    expect(await read()).toBe(426)
    expect(load).toHaveBeenCalledTimes(1)
  })
})
