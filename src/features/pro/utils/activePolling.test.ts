import { afterEach, expect, it, vi } from 'vitest'

import { POLLING_IDLE_MS, startActivePolling } from './activePolling'

afterEach(() => vi.useRealTimers())

it('stops hidden and idle tabs, resumes on activity, and cleans up on unmount', async () => {
  vi.useFakeTimers()
  const surface = Object.assign(new EventTarget(), {
    visibilityState: 'visible' as DocumentVisibilityState,
  })
  const refresh = vi.fn().mockResolvedValue(undefined)
  const stop = startActivePolling(refresh, 15_000, surface)
  await vi.advanceTimersByTimeAsync(30_000)
  expect(refresh).toHaveBeenCalledTimes(2)
  surface.visibilityState = 'hidden'
  surface.dispatchEvent(new Event('pointermove'))
  await vi.advanceTimersByTimeAsync(600_000)
  expect(refresh).toHaveBeenCalledTimes(2)
  surface.visibilityState = 'visible'
  surface.dispatchEvent(new Event('visibilitychange'))
  await vi.advanceTimersByTimeAsync(POLLING_IDLE_MS)
  expect(refresh).toHaveBeenCalledTimes(9)
  await vi.advanceTimersByTimeAsync(86_400_000)
  expect(refresh).toHaveBeenCalledTimes(9)
  surface.dispatchEvent(new Event('keydown'))
  await vi.advanceTimersByTimeAsync(15_000)
  expect(refresh).toHaveBeenCalledTimes(10)
  stop()
  surface.dispatchEvent(new Event('pointerdown'))
  await vi.advanceTimersByTimeAsync(60_000)
  expect(refresh).toHaveBeenCalledTimes(10)
})

it('does not overlap slow requests and recovers after rejection', async () => {
  vi.useFakeTimers()
  const surface = Object.assign(new EventTarget(), {
    visibilityState: 'visible' as DocumentVisibilityState,
  })
  let reject!: (reason?: unknown) => void
  const refresh = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail
        })
    )
    .mockResolvedValue(undefined)
  const stop = startActivePolling(refresh, 15_000, surface)
  await vi.advanceTimersByTimeAsync(60_000)
  expect(refresh).toHaveBeenCalledTimes(1)
  reject(new Error('offline'))
  await vi.advanceTimersByTimeAsync(15_000)
  expect(refresh).toHaveBeenCalledTimes(2)
  stop()
})
