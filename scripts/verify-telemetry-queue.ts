import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

import { Redis } from '@upstash/redis'

import { drainTelemetry, type TelemetryBatch } from '../src/features/pro/server/telemetryQueue'
import { createTelemetryQueueStore } from '../src/features/pro/server/telemetryQueueRedis'

const url = process.env.UPSTASH_REDIS_REST_URL,
  token = process.env.UPSTASH_REDIS_REST_TOKEN
if (!url || !token) throw new Error('Configure Redis credentials explicitly')
const redis = new Redis({
  url,
  token,
  retry: false,
  enableAutoPipelining: false,
  signal: () => AbortSignal.timeout(5000),
})
const prefix = `gitascii:{telemetry-test-${randomUUID()}}`
const keys = [`${prefix}:pending`, `${prefix}:processing`, `${prefix}:hour-budget`]
const store = () => createTelemetryQueueStore(redis, prefix)
const committed = new Set<string>()
let writes = 0
const persist = async (batch: TelemetryBatch) => {
  writes++
  committed.add(batch.id)
}
const event = {
  username: 'test',
  slug: 'default',
  timestamp: new Date().toISOString(),
  source: 'Other',
  trafficType: 'bot',
  status: '200',
}
try {
  await store().enqueue(event)
  await store().enqueue(event)
  const faultyAck = {
    ...store(),
    acknowledge: async () => {
      throw new Error('Simulated lost acknowledgement')
    },
  }
  await assert.rejects(() => drainTelemetry(faultyAck, persist))
  assert.equal(writes, 1)
  assert.equal(await redis.llen(keys[0]), 0)
  assert.equal(await redis.exists(keys[1]), 1)
  await Promise.all(Array.from({ length: 20 }, () => drainTelemetry(store(), persist)))
  assert.equal(writes, 1, 'Hourly reservation prevents repeated SQL after failure')
  // Release only this disposable test reservation to simulate the following hour.
  await redis.del(keys[2])
  await Promise.all(Array.from({ length: 20 }, () => drainTelemetry(store(), persist)))
  assert.equal(writes, 2)
  assert.equal(committed.size, 1, 'Retry must use the same immutable batch ID')
  assert.equal(await redis.exists(keys[1]), 0)
  assert.equal(await drainTelemetry(store(), persist), 0)
  console.log(
    'PASS: Redis Lua claim/ack, 20 competing workers, retained batch after failure and stable retry ID. Postgres writer was simulated.'
  )
} finally {
  await redis.del(...keys)
  console.log('Removed all three test-owned Redis keys.')
}
