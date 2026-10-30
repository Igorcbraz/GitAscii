import { Redis } from '@upstash/redis'

export const PUBLIC_COUNTER_REFRESH_SECONDS = 3600
const RETAIN_SECONDS = 24 * 3600

export interface PublicCounterStore {
  get(key: string): Promise<unknown>
  set(
    key: string,
    value: unknown,
    options: { ex: number; nx: true } | { ex: number; nx?: never }
  ): Promise<unknown>
}

let redis: Redis | null = null

/** Intentionally bypasses the general Redis adapter's in-memory fallback. */
export function getPublicCounterStore(): PublicCounterStore | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  redis ??= new Redis({
    url,
    token,
    retry: false,
    enableAutoPipelining: false,
    signal: () => AbortSignal.timeout(2000),
  })
  return redis
}

interface Snapshot<T> {
  value: T
  freshUntil: number
  retainUntil: number
}

interface CounterOptions<T> {
  key: string
  load: () => Promise<T>
  valid: (value: unknown) => value is T
  fallback: () => T
  getStore?: () => PublicCounterStore | null
  // Short intervals are useful for exercising the same protocol against real Redis.
  refreshSeconds?: number
}

/**
 * For non-authoritative public counters only, never permissions or billing.
 * SET NX EX is an hourly budget reservation, NOT a lock released after loading.
 * Retaining it on errors bounds retries across workers, even if snapshot writes fail.
 */
export function createPublicCounterCache<T>(options: CounterOptions<T>): () => Promise<T> {
  const refreshSeconds = options.refreshSeconds ?? PUBLIC_COUNTER_REFRESH_SECONDS
  if (!Number.isInteger(refreshSeconds) || refreshSeconds < 1 || refreshSeconds > RETAIN_SECONDS) {
    throw new Error('Invalid public counter refresh interval')
  }
  let latest: Snapshot<T> | null = null
  let pending: Promise<T> | null = null
  let retryAfter = 0
  let lastWarning = -Infinity

  function fallback(): T {
    return latest && latest.retainUntil > Date.now() ? latest.value : options.fallback()
  }

  function warn(): void {
    if (Date.now() - lastWarning < 60_000) return
    lastWarning = Date.now()
    // Do not log SDK errors: they can include request URLs or credentials.
    console.warn(`[PublicCounterCache] ${options.key}: refresh unavailable; serving fallback`)
  }

  function readSnapshot(raw: unknown): Snapshot<T> | null {
    try {
      const parsed: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (!parsed || typeof parsed !== 'object') return null
      const candidate = parsed as Partial<Snapshot<unknown>>
      if (
        !options.valid(candidate.value) ||
        typeof candidate.freshUntil !== 'number' ||
        !Number.isFinite(candidate.freshUntil) ||
        typeof candidate.retainUntil !== 'number' ||
        !Number.isFinite(candidate.retainUntil) ||
        candidate.retainUntil <= Date.now() ||
        candidate.freshUntil > candidate.retainUntil
      )
        return null
      return candidate as Snapshot<T>
    } catch {
      return null
    }
  }

  async function refresh(): Promise<T> {
    try {
      const store = (options.getStore ?? getPublicCounterStore)()
      if (!store) throw new Error('Shared cache unavailable')
      const snapshot = readSnapshot(await store.get(options.key))
      if (snapshot) latest = snapshot
      if (latest && latest.freshUntil > Date.now()) return latest.value

      const reserved = await store.set(`${options.key}:refresh-budget`, 'reserved', {
        nx: true,
        ex: refreshSeconds,
      })
      if (reserved !== 'OK') {
        // A peer may have finished while we were acquiring the reservation.
        const peer = readSnapshot(await store.get(options.key))
        if (peer) latest = peer
        retryAfter = Date.now() + 60_000
        return fallback()
      }

      // Never delete this reservation, including when load or persistence fails.
      retryAfter = Date.now() + refreshSeconds * 1000
      const value = await options.load()
      if (!options.valid(value)) throw new Error('Invalid public counter')
      latest = {
        value,
        freshUntil: Date.now() + refreshSeconds * 1000,
        retainUntil: Date.now() + RETAIN_SECONDS * 1000,
      }
      await store.set(options.key, latest, { ex: RETAIN_SECONDS })
      return value
    } catch {
      retryAfter = Math.max(retryAfter, Date.now() + 60_000)
      warn()
      return fallback()
    }
  }

  return async () => {
    if (latest && latest.freshUntil > Date.now()) return latest.value
    if (pending) return pending
    if (retryAfter > Date.now()) return fallback()
    pending = refresh()
    try {
      return await pending
    } finally {
      pending = null
    }
  }
}
