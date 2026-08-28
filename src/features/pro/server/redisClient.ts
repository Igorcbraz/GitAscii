import { Redis } from '@upstash/redis'

export interface IProRedisStore {
  get<T = any>(key: string): Promise<T | null>
  set(key: string, value: any, opts?: { ex?: number }): Promise<any>
  del(...keys: string[]): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  hget<T = any>(key: string, field: string): Promise<T | null>
  hset(key: string, kvMap: Record<string, any>): Promise<number>
  hgetall<T extends Record<string, any> = Record<string, any>>(key: string): Promise<T | null>
  hincrby(key: string, field: string, increment: number): Promise<number>
  incr(key: string): Promise<number>
  zadd(key: string, ...scoreMembers: { score: number; member: string }[]): Promise<number>
  zrange<T = string[]>(
    key: string,
    start: number,
    stop: number,
    opts?: { rev?: boolean }
  ): Promise<T>
  zrevrange<T = string[]>(key: string, start: number, stop: number): Promise<T>
  zrem(key: string, ...members: string[]): Promise<number>
  sadd(key: string, ...members: string[]): Promise<number>
  smembers(key: string): Promise<string[]>
  srem(key: string, ...members: string[]): Promise<number>
  pfadd(key: string, ...elements: string[]): Promise<number>
  pfcount(...keys: string[]): Promise<number>
}

class UpstashRedisAdapter implements IProRedisStore {
  constructor(private client: Redis) {}

  async get<T = any>(key: string): Promise<T | null> {
    return this.client.get<T>(key)
  }

  async set(key: string, value: any, opts?: { ex?: number }): Promise<any> {
    if (opts?.ex) {
      return this.client.set(key, value, { ex: opts.ex })
    }
    return this.client.set(key, value)
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys)
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds)
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    return this.client.hget<T>(key, field)
  }

  async hset(key: string, kvMap: Record<string, any>): Promise<number> {
    return this.client.hset(key, kvMap)
  }

  async hgetall<T extends Record<string, any> = Record<string, any>>(
    key: string
  ): Promise<T | null> {
    const res = await this.client.hgetall<T>(key)
    return res as T | null
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    return this.client.hincrby(key, field, increment)
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async zadd(key: string, ...scoreMembers: { score: number; member: string }[]): Promise<number> {
    if (scoreMembers.length === 0) return 0
    let added = 0
    for (const sm of scoreMembers) {
      await this.client.zadd(key, { score: sm.score, member: sm.member })
      added++
    }
    return added
  }

  async zrange<T = string[]>(
    key: string,
    start: number,
    stop: number,
    opts?: { rev?: boolean }
  ): Promise<T> {
    const res = await this.client.zrange(key, start, stop, opts?.rev ? { rev: true } : undefined)
    return res as unknown as T
  }

  async zrevrange<T = string[]>(key: string, start: number, stop: number): Promise<T> {
    return this.zrange<T>(key, start, stop, { rev: true })
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return this.client.zrem(key, ...members)
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, members[0], ...members.slice(1))
  }

  async smembers(key: string): Promise<string[]> {
    const res = await this.client.smembers(key)
    return (res || []) as string[]
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, members[0], ...members.slice(1))
  }

  async pfadd(key: string, ...elements: string[]): Promise<number> {
    return this.client.pfadd(key, elements[0], ...elements.slice(1))
  }

  async pfcount(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0
    return this.client.pfcount(keys[0], ...keys.slice(1))
  }
}

class MemoryRedisStore implements IProRedisStore {
  private kv = new Map<string, any>()
  private hashes = new Map<string, Map<string, any>>()
  private sortedSets = new Map<string, Array<{ score: number; member: string }>>()
  private sets = new Map<string, Set<string>>()
  private hll = new Map<string, Set<string>>()
  private expires = new Map<string, number>()

  private isExpired(key: string): boolean {
    const exp = this.expires.get(key)
    if (exp && Date.now() > exp) {
      this.del(key)
      return true
    }
    return false
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (this.isExpired(key)) return null
    return this.kv.has(key) ? (this.kv.get(key) as T) : null
  }

  async set(key: string, value: any, opts?: { ex?: number }): Promise<'OK'> {
    this.kv.set(key, value)
    if (opts?.ex) {
      this.expires.set(key, Date.now() + opts.ex * 1000)
    }
    return 'OK'
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0
    for (const key of keys) {
      if (this.kv.delete(key)) count++
      if (this.hashes.delete(key)) count++
      if (this.sortedSets.delete(key)) count++
      if (this.sets.delete(key)) count++
      if (this.hll.delete(key)) count++
      this.expires.delete(key)
    }
    return count
  }

  async expire(key: string, seconds: number): Promise<number> {
    this.expires.set(key, Date.now() + seconds * 1000)
    return 1
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    if (this.isExpired(key)) return null
    const hash = this.hashes.get(key)
    if (!hash || !hash.has(field)) return null
    return hash.get(field) as T
  }

  async hset(key: string, kvMap: Record<string, any>): Promise<number> {
    if (this.isExpired(key)) {
      this.hashes.delete(key)
    }
    let hash = this.hashes.get(key)
    if (!hash) {
      hash = new Map()
      this.hashes.set(key, hash)
    }
    let added = 0
    for (const [k, v] of Object.entries(kvMap)) {
      if (!hash.has(k)) added++
      hash.set(k, v)
    }
    return added
  }

  async hgetall<T extends Record<string, any> = Record<string, any>>(
    key: string
  ): Promise<T | null> {
    if (this.isExpired(key)) return null
    const hash = this.hashes.get(key)
    if (!hash || hash.size === 0) return null
    const obj: Record<string, any> = {}
    for (const [k, v] of hash.entries()) {
      obj[k] = v
    }
    return obj as T
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    if (this.isExpired(key)) {
      this.hashes.delete(key)
    }
    let hash = this.hashes.get(key)
    if (!hash) {
      hash = new Map()
      this.hashes.set(key, hash)
    }
    const current = Number(hash.get(field) || 0)
    const nextVal = current + increment
    hash.set(field, nextVal)
    return nextVal
  }

  async incr(key: string): Promise<number> {
    const current = Number(this.kv.get(key) || 0)
    const nextVal = current + 1
    this.kv.set(key, nextVal)
    return nextVal
  }

  async zadd(key: string, ...scoreMembers: { score: number; member: string }[]): Promise<number> {
    if (this.isExpired(key)) {
      this.sortedSets.delete(key)
    }
    let zset = this.sortedSets.get(key)
    if (!zset) {
      zset = []
      this.sortedSets.set(key, zset)
    }
    let added = 0
    for (const sm of scoreMembers) {
      const idx = zset.findIndex((x) => x.member === sm.member)
      if (idx >= 0) {
        zset[idx].score = sm.score
      } else {
        zset.push({ score: sm.score, member: sm.member })
        added++
      }
    }
    zset.sort((a, b) => a.score - b.score)
    return added
  }

  async zrange<T = string[]>(
    key: string,
    start: number,
    stop: number,
    opts?: { rev?: boolean }
  ): Promise<T> {
    if (this.isExpired(key)) return [] as unknown as T
    const zset = this.sortedSets.get(key) || []
    const copy = [...zset]
    if (opts?.rev) {
      copy.reverse()
    }
    const adjustedStop = stop < 0 ? copy.length + stop + 1 : stop + 1
    const slice = copy.slice(start, adjustedStop).map((x) => x.member)
    return slice as unknown as T
  }

  async zrevrange<T = string[]>(key: string, start: number, stop: number): Promise<T> {
    return this.zrange<T>(key, start, stop, { rev: true })
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    const zset = this.sortedSets.get(key)
    if (!zset) return 0
    let removed = 0
    for (const member of members) {
      const idx = zset.findIndex((x) => x.member === member)
      if (idx >= 0) {
        zset.splice(idx, 1)
        removed++
      }
    }
    return removed
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (this.isExpired(key)) {
      this.sets.delete(key)
    }
    let set = this.sets.get(key)
    if (!set) {
      set = new Set()
      this.sets.set(key, set)
    }
    let count = 0
    for (const m of members) {
      if (!set.has(m)) {
        set.add(m)
        count++
      }
    }
    return count
  }

  async smembers(key: string): Promise<string[]> {
    if (this.isExpired(key)) return []
    const set = this.sets.get(key)
    return set ? Array.from(set) : []
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const set = this.sets.get(key)
    if (!set) return 0
    let removed = 0
    for (const m of members) {
      if (set.delete(m)) removed++
    }
    return removed
  }

  async pfadd(key: string, ...elements: string[]): Promise<number> {
    if (this.isExpired(key)) {
      this.hll.delete(key)
    }
    let set = this.hll.get(key)
    if (!set) {
      set = new Set()
      this.hll.set(key, set)
    }
    let changed = 0
    for (const el of elements) {
      if (!set.has(el)) {
        set.add(el)
        changed = 1
      }
    }
    return changed
  }

  async pfcount(...keys: string[]): Promise<number> {
    const combined = new Set<string>()
    for (const key of keys) {
      if (this.isExpired(key)) continue
      const set = this.hll.get(key)
      if (set) {
        for (const el of set) {
          combined.add(el)
        }
      }
    }
    return combined.size
  }

  clear() {
    this.kv.clear()
    this.hashes.clear()
    this.sortedSets.clear()
    this.sets.clear()
    this.hll.clear()
    this.expires.clear()
  }
}

let globalAdapterInstance: IProRedisStore | null = null
const memoryStoreInstance = new MemoryRedisStore()

export function getProRedisClient(): IProRedisStore {
  if (globalAdapterInstance) {
    return globalAdapterInstance
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (
    url &&
    token &&
    typeof url === 'string' &&
    typeof token === 'string' &&
    url.trim().length > 0
  ) {
    try {
      const upstashRedis = new Redis({
        url: url.trim(),
        token: token.trim(),
      })
      globalAdapterInstance = new UpstashRedisAdapter(upstashRedis)
      return globalAdapterInstance
    } catch (err) {
      console.warn(
        '[ProRedis] Failed to initialize Upstash Redis client. Falling back to memory store:',
        err
      )
    }
  }

  return memoryStoreInstance
}

export function resetProRedisMemoryStoreForTesting(): void {
  memoryStoreInstance.clear()
}
