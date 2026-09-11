import { createHash } from 'node:crypto'
import { promisify } from 'node:util'
import { gunzip, gzip } from 'node:zlib'

import { getProRedisClient } from '@/features/pro/server/redisClient'

const compress = promisify(gzip)
const decompress = promisify(gunzip)
const MAX_MEMORY_BYTES = 32 * 1024 * 1024
const MAX_ENTRIES = 64
// Leave room for the REST command envelope. Oversize output is still served intact.
const MAX_PERSISTED_BYTES = 8 * 1024 * 1024
const PREFIX = 'profile-svg:v3'

export interface SvgPayload {
  svgContent: string
  etag: string
  hasErrors: boolean
  renderedWidgetIds: string[]
}

interface Entry {
  payload: SvgPayload
  expiresAt: number
  bytes: number
}

const memory = new Map<string, Entry>()
const pending = new Map<string, Promise<SvgPayload>>()
let memoryBytes = 0

function removeEntry(key: string) {
  const entry = memory.get(key)
  if (entry) memoryBytes -= entry.bytes
  memory.delete(key)
}

function remember(key: string, payload: SvgPayload, expiresAt: number) {
  removeEntry(key)
  const bytes = Buffer.byteLength(payload.svgContent, 'utf8') * 2
  if (bytes > MAX_MEMORY_BYTES) return
  for (const [oldKey, entry] of memory) {
    if (entry.expiresAt <= Date.now()) removeEntry(oldKey)
  }
  while (memory.size >= MAX_ENTRIES || memoryBytes + bytes > MAX_MEMORY_BYTES) {
    const oldest = memory.keys().next().value
    if (oldest === undefined) break
    removeEntry(oldest)
  }
  memory.set(key, { payload, expiresAt, bytes })
  memoryBytes += bytes
}

export async function invalidateSvgCache(username?: string): Promise<void> {
  if (!username) {
    memory.clear()
    memoryBytes = 0
    return
  }
  const user = username.toLowerCase()
  for (const key of memory.keys()) {
    if (key.startsWith(`${PREFIX}:${user}:`)) removeEntry(key)
  }
  // A generation counter invalidates every variant across function instances
  // without scanning Redis. Old values expire on their normal TTL.
  await getProRedisClient().incr(`${PREFIX}:${user}:generation`)
}

export async function getCachedProfileSvg(
  username: string,
  variant: unknown[],
  generate: () => Promise<SvgPayload>
): Promise<SvgPayload> {
  const redis = getProRedisClient()
  const user = username.toLowerCase()
  let generation: number | null
  try {
    generation = await redis.get<number>(`${PREFIX}:${user}:generation`)
  } catch {
    // Do not reuse an unverifiable generation during an invalidation outage.
    return generate()
  }
  const digest = createHash('sha256')
    .update(
      JSON.stringify([
        process.env.CF_VERSION_METADATA || process.env.CF_COMMIT_SHA || 'local',
        ...variant,
      ])
    )
    .digest('hex')
  const key = `${PREFIX}:${user}:${generation ?? 0}:${digest}`
  const cached = memory.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    memory.delete(key)
    memory.set(key, cached)
    return cached.payload
  }
  removeEntry(key)
  const inflight = pending.get(key)
  if (inflight) return inflight

  const work = (async () => {
    try {
      const packed = await redis.get<string>(key)
      if (typeof packed === 'string') {
        const text = await decompress(Buffer.from(packed, 'base64'), {
          maxOutputLength: 64 * 1024 * 1024,
        })
        const entry = JSON.parse(text.toString('utf8')) as {
          payload: SvgPayload
          expiresAt: number
        }
        if (entry.expiresAt > Date.now() && typeof entry.payload?.svgContent === 'string') {
          remember(key, entry.payload, entry.expiresAt)
          return entry.payload
        }
      }
    } catch {
      // A cache miss or unavailable/corrupt cache must not break a widget.
    }

    const payload = await generate()
    const ttl = payload.hasErrors ? 120 : 3600
    const expiresAt = Date.now() + ttl * 1000
    remember(key, payload, expiresAt)
    try {
      const packed = (
        await compress(JSON.stringify({ payload, expiresAt }), { level: 1 })
      ).toString('base64')
      if (packed.length <= MAX_PERSISTED_BYTES) {
        await redis.set(key, packed, { ex: ttl })
      }
    } catch {
      // The bounded local cache still avoids repeated work on this instance.
    }
    return payload
  })()
  pending.set(key, work)
  try {
    return await work
  } finally {
    pending.delete(key)
  }
}
