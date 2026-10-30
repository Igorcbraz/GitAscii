import { Redis } from '@upstash/redis'

import { persistTelemetryBatch } from '@/lib/db/repositories/telemetryBatchRepository'

import {
  drainTelemetry,
  type QueuedView,
  type TelemetryBatch,
  type TelemetryQueueStore,
} from './telemetryQueue'

// All keys share a hash tag for Redis deployments that enforce a cluster slot.
const prefix = 'gitascii:{telemetry-v1}'
export const ENQUEUE = `
if redis.call('LLEN', KEYS[1]) >= 20000 then return 0 end
redis.call('RPUSH', KEYS[1], ARGV[1]); return 1`
export const CLAIM = `
local previous = redis.call('GET', KEYS[2])
if previous then return previous end
local entries = redis.call('LRANGE', KEYS[1], 0, 499)
if #entries == 0 then return false end
local events = {}
for i, entry in ipairs(entries) do events[i] = cjson.decode(entry) end
local batch = cjson.encode({id=ARGV[1], events=events})
redis.call('SET', KEYS[2], batch)
redis.call('LTRIM', KEYS[1], #entries, -1)
return batch`
export const ACK = `
local current = redis.call('GET', KEYS[1])
if current and cjson.decode(current).id == ARGV[1] then return redis.call('DEL', KEYS[1]) end
return 0`

export function createTelemetryQueueStore(redis: Redis, keyPrefix = prefix): TelemetryQueueStore {
  const pending = `${keyPrefix}:pending`,
    processing = `${keyPrefix}:processing`
  return {
    async enqueue(event: QueuedView) {
      if ((await redis.eval(ENQUEUE, [pending], [JSON.stringify(event)])) !== 1)
        throw new Error('Telemetry queue capacity reached')
    },
    async hasWork() {
      return Boolean(await redis.exists(processing)) || (await redis.llen(pending)) > 0
    },
    async reserve() {
      return (
        (await redis.set(`${keyPrefix}:hour-budget`, 'reserved', { nx: true, ex: 3600 })) === 'OK'
      )
    },
    async claim(id) {
      const raw = await redis.eval(CLAIM, [pending, processing], [id])
      return raw ? ((typeof raw === 'string' ? JSON.parse(raw) : raw) as TelemetryBatch) : null
    },
    async acknowledge(id) {
      await redis.eval(ACK, [processing], [id])
    },
  }
}

let store: TelemetryQueueStore | undefined
export function getTelemetryQueueStore(): TelemetryQueueStore {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) throw new Error('Durable telemetry requires Redis configuration')
  return (store ??= createTelemetryQueueStore(
    new Redis({
      url,
      token,
      retry: false,
      enableAutoPipelining: false,
      signal: () => AbortSignal.timeout(2000),
    })
  ))
}

let nextAttempt = 0
let pendingDrain: Promise<number> | undefined
export async function flushQueuedTelemetry(): Promise<number> {
  if (Date.now() < nextAttempt) return 0
  if (pendingDrain) return pendingDrain
  // Local throttle reduces Redis polling; the shared reservation is authoritative.
  nextAttempt = Date.now() + 60_000
  pendingDrain = drainTelemetry(getTelemetryQueueStore(), persistTelemetryBatch)
  try {
    return await pendingDrain
  } finally {
    pendingDrain = undefined
  }
}
