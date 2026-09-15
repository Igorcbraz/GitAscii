import { Redis } from '@upstash/redis'

const REDIS_WARNING_INTERVAL_MS = 60_000

export interface IProRedisPipeline {
  get(key: string): IProRedisPipeline
  hget(key: string, field: string): IProRedisPipeline
  hgetall(key: string): IProRedisPipeline
  pfcount(...keys: string[]): IProRedisPipeline
  hincrby(key: string, field: string, increment: number): IProRedisPipeline
  hset(key: string, kvMap: Record<string, any>): IProRedisPipeline
  expire(key: string, seconds: number): IProRedisPipeline
  pfadd(key: string, ...elements: string[]): IProRedisPipeline
  sadd(key: string, ...members: string[]): IProRedisPipeline
  set(key: string, value: any): IProRedisPipeline
  del(...keys: string[]): IProRedisPipeline
  zadd(key: string, ...scoreMembers: { score: number; member: string }[]): IProRedisPipeline
  zrange(key: string, start: number, stop: number, opts?: { rev?: boolean }): IProRedisPipeline
  zrevrange(key: string, start: number, stop: number): IProRedisPipeline
  exec<T = any[]>(): Promise<T>
}

export interface IProRedisStore {
  get<T = any>(key: string): Promise<T | null>
  set(key: string, value: any, opts?: { ex?: number; nx?: boolean }): Promise<any>
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
  sismember(key: string, member: string): Promise<number>
  pfadd(key: string, ...elements: string[]): Promise<number>
  pfcount(...keys: string[]): Promise<number>
  pipeline(): IProRedisPipeline
  keys(pattern: string): Promise<string[]>
  scan(cursor: number, opts?: { match?: string; count?: number }): Promise<[number, string[]]>
  scard(key: string): Promise<number>
  exists(...keys: string[]): Promise<number>
}

class UpstashRedisAdapter implements IProRedisStore {
  private lastWarning = 0

  constructor(
    private client: Redis,
    private fallback: IProRedisStore
  ) {}

  private logError(operation: string, error: unknown): void {
    const now = Date.now()
    if (now - this.lastWarning > REDIS_WARNING_INTERVAL_MS) {
      const errorDetails = error instanceof Error ? error.message : error
      console.warn(
        `[ProRedis] Upstash Redis operation '${operation}' failed (rate limit/quota/connectivity). Falling back to memory store.`,
        errorDetails
      )
      this.lastWarning = now
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      return await this.client.get<T>(key)
    } catch (err) {
      this.logError('get', err)
      return this.fallback.get<T>(key)
    }
  }

  async set(key: string, value: any, opts?: { ex?: number; nx?: boolean }): Promise<any> {
    try {
      const setOpts: any = {}
      if (opts?.ex) setOpts.ex = opts.ex
      if (opts?.nx) setOpts.nx = true
      if (Object.keys(setOpts).length > 0) {
        return await this.client.set(key, value, setOpts)
      }
      return await this.client.set(key, value)
    } catch (err) {
      this.logError('set', err)
      return this.fallback.set(key, value, opts)
    }
  }

  async del(...keys: string[]): Promise<number> {
    try {
      return await this.client.del(...keys)
    } catch (err) {
      this.logError('del', err)
      return this.fallback.del(...keys)
    }
  }

  async exists(...keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0
      return await this.client.exists(keys[0], ...keys.slice(1))
    } catch (err) {
      this.logError('exists', err)
      return this.fallback.exists(...keys)
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds)
    } catch (err) {
      this.logError('expire', err)
      return this.fallback.expire(key, seconds)
    }
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      return await this.client.hget<T>(key, field)
    } catch (err) {
      this.logError('hget', err)
      return this.fallback.hget<T>(key, field)
    }
  }

  async hset(key: string, kvMap: Record<string, any>): Promise<number> {
    try {
      return await this.client.hset(key, kvMap)
    } catch (err) {
      this.logError('hset', err)
      return this.fallback.hset(key, kvMap)
    }
  }

  async hgetall<T extends Record<string, any> = Record<string, any>>(
    key: string
  ): Promise<T | null> {
    try {
      const res = await this.client.hgetall<T>(key)
      return res as T | null
    } catch (err) {
      this.logError('hgetall', err)
      return this.fallback.hgetall<T>(key)
    }
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    try {
      return await this.client.hincrby(key, field, increment)
    } catch (err) {
      this.logError('hincrby', err)
      return this.fallback.hincrby(key, field, increment)
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key)
    } catch (err) {
      this.logError('incr', err)
      return this.fallback.incr(key)
    }
  }

  async zadd(key: string, ...scoreMembers: { score: number; member: string }[]): Promise<number> {
    try {
      if (scoreMembers.length === 0) return 0
      let added = 0
      for (const sm of scoreMembers) {
        await this.client.zadd(key, { score: sm.score, member: sm.member })
        added++
      }
      return added
    } catch (err) {
      this.logError('zadd', err)
      return this.fallback.zadd(key, ...scoreMembers)
    }
  }

  async zrange<T = string[]>(
    key: string,
    start: number,
    stop: number,
    opts?: { rev?: boolean }
  ): Promise<T> {
    try {
      const res = await this.client.zrange(key, start, stop, opts?.rev ? { rev: true } : undefined)
      return res as unknown as T
    } catch (err) {
      this.logError('zrange', err)
      return this.fallback.zrange<T>(key, start, stop, opts)
    }
  }

  async zrevrange<T = string[]>(key: string, start: number, stop: number): Promise<T> {
    return this.zrange<T>(key, start, stop, { rev: true })
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.zrem(key, ...members)
    } catch (err) {
      this.logError('zrem', err)
      return this.fallback.zrem(key, ...members)
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, members[0], ...members.slice(1))
    } catch (err) {
      this.logError('sadd', err)
      return this.fallback.sadd(key, ...members)
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      const res = await this.client.smembers(key)
      return (res || []) as string[]
    } catch (err) {
      this.logError('smembers', err)
      return this.fallback.smembers(key)
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.srem(key, members[0], ...members.slice(1))
    } catch (err) {
      this.logError('srem', err)
      return this.fallback.srem(key, ...members)
    }
  }

  async sismember(key: string, member: string): Promise<number> {
    try {
      const res = await this.client.sismember(key, member)
      return Number(res)
    } catch (err) {
      this.logError('sismember', err)
      return this.fallback.sismember(key, member)
    }
  }

  async pfadd(key: string, ...elements: string[]): Promise<number> {
    try {
      return await this.client.pfadd(key, elements[0], ...elements.slice(1))
    } catch (err) {
      this.logError('pfadd', err)
      return this.fallback.pfadd(key, ...elements)
    }
  }

  async pfcount(...keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0
      return await this.client.pfcount(keys[0], ...keys.slice(1))
    } catch (err) {
      this.logError('pfcount', err)
      return this.fallback.pfcount(...keys)
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const res = await this.client.keys(pattern)
      return (res || []) as string[]
    } catch (err) {
      this.logError('keys', err)
      return this.fallback.keys(pattern)
    }
  }

  async scan(
    cursor: number,
    opts?: { match?: string; count?: number }
  ): Promise<[number, string[]]> {
    try {
      const res = await this.client.scan(cursor, {
        match: opts?.match,
        count: opts?.count ?? 100,
      })
      return res as unknown as [number, string[]]
    } catch (err) {
      this.logError('scan', err)
      return this.fallback.scan(cursor, opts)
    }
  }

  async scard(key: string): Promise<number> {
    try {
      return await this.client.scard(key)
    } catch (err) {
      this.logError('scard', err)
      return this.fallback.scard(key)
    }
  }

  pipeline(): IProRedisPipeline {
    const p = this.client.pipeline()
    const memPipeline = this.fallback.pipeline()
    const self = this

    const wrapper: IProRedisPipeline = {
      get(key: string) {
        p.get(key)
        memPipeline.get(key)
        return wrapper
      },
      hget(key: string, field: string) {
        p.hget(key, field)
        memPipeline.hget(key, field)
        return wrapper
      },
      hgetall(key: string) {
        p.hgetall(key)
        memPipeline.hgetall(key)
        return wrapper
      },
      pfcount(...keys: string[]) {
        if (keys.length > 0) {
          p.pfcount(keys[0], ...keys.slice(1))
        }
        memPipeline.pfcount(...keys)
        return wrapper
      },
      hincrby(key: string, field: string, increment: number) {
        p.hincrby(key, field, increment)
        memPipeline.hincrby(key, field, increment)
        return wrapper
      },
      hset(key: string, kvMap: Record<string, any>) {
        p.hset(key, kvMap)
        memPipeline.hset(key, kvMap)
        return wrapper
      },
      expire(key: string, seconds: number) {
        p.expire(key, seconds)
        memPipeline.expire(key, seconds)
        return wrapper
      },
      pfadd(key: string, ...elements: string[]) {
        if (elements.length > 0) {
          p.pfadd(key, elements[0], ...elements.slice(1))
        }
        memPipeline.pfadd(key, ...elements)
        return wrapper
      },
      sadd(key: string, ...members: string[]) {
        if (members.length > 0) {
          p.sadd(key, members[0], ...members.slice(1))
        }
        memPipeline.sadd(key, ...members)
        return wrapper
      },
      set(key: string, value: any) {
        p.set(key, value)
        memPipeline.set(key, value)
        return wrapper
      },
      del(...keys: string[]) {
        if (keys.length > 0) {
          p.del(...keys)
        }
        memPipeline.del(...keys)
        return wrapper
      },
      zadd(key: string, ...scoreMembers: { score: number; member: string }[]) {
        for (const scoreMember of scoreMembers) {
          p.zadd(key, { score: scoreMember.score, member: scoreMember.member })
        }
        memPipeline.zadd(key, ...scoreMembers)
        return wrapper
      },
      zrange(key: string, start: number, stop: number, opts?: { rev?: boolean }) {
        p.zrange(key, start, stop, opts?.rev ? { rev: true } : undefined)
        memPipeline.zrange(key, start, stop, opts)
        return wrapper
      },
      zrevrange(key: string, start: number, stop: number) {
        p.zrange(key, start, stop, { rev: true })
        memPipeline.zrevrange(key, start, stop)
        return wrapper
      },
      async exec<T = any[]>(): Promise<T> {
        try {
          return (await p.exec()) as unknown as T
        } catch (err) {
          self.logError('pipeline.exec', err)
          return memPipeline.exec<T>()
        }
      },
    }
    return wrapper
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

  async set(key: string, value: any, opts?: { ex?: number; nx?: boolean }): Promise<any> {
    if (opts?.nx && this.kv.has(key) && !this.isExpired(key)) {
      return null
    }
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

  async exists(...keys: string[]): Promise<number> {
    let count = 0
    for (const key of keys) {
      if (this.isExpired(key)) continue
      if (
        this.kv.has(key) ||
        this.hashes.has(key) ||
        this.sortedSets.has(key) ||
        this.sets.has(key) ||
        this.hll.has(key)
      ) {
        count++
      }
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

  async sismember(key: string, member: string): Promise<number> {
    if (this.isExpired(key)) return 0
    const set = this.sets.get(key)
    return set && set.has(member) ? 1 : 0
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

  async keys(pattern: string): Promise<string[]> {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
    const regex = new RegExp(`^${escaped}$`)
    const allKeys = [
      ...this.kv.keys(),
      ...this.hashes.keys(),
      ...this.sortedSets.keys(),
      ...this.sets.keys(),
    ]
    const unique = [...new Set(allKeys)]
    return unique.filter((k) => regex.test(k) && !this.isExpired(k))
  }

  async scan(
    cursor: number,
    opts?: { match?: string; count?: number }
  ): Promise<[number, string[]]> {
    const allKeys = await this.keys(opts?.match ?? '*')
    const count = opts?.count ?? 100
    const start = cursor
    const slice = allKeys.slice(start, start + count)
    const nextCursor = start + slice.length >= allKeys.length ? 0 : start + slice.length
    return [nextCursor, slice]
  }

  async scard(key: string): Promise<number> {
    if (this.isExpired(key)) return 0
    const set = this.sets.get(key)
    return set ? set.size : 0
  }

  pipeline(): IProRedisPipeline {
    const queue: Array<() => Promise<any>> = []
    const wrapper: IProRedisPipeline = {
      get: (key: string) => {
        queue.push(() => this.get(key))
        return wrapper
      },
      hget: (key: string, field: string) => {
        queue.push(() => this.hget(key, field))
        return wrapper
      },
      hgetall: (key: string) => {
        queue.push(() => this.hgetall(key))
        return wrapper
      },
      pfcount: (...keys: string[]) => {
        queue.push(() => this.pfcount(...keys))
        return wrapper
      },
      hincrby: (key: string, field: string, increment: number) => {
        queue.push(() => this.hincrby(key, field, increment))
        return wrapper
      },
      hset: (key: string, kvMap: Record<string, any>) => {
        queue.push(() => this.hset(key, kvMap))
        return wrapper
      },
      expire: (key: string, seconds: number) => {
        queue.push(() => this.expire(key, seconds))
        return wrapper
      },
      pfadd: (key: string, ...elements: string[]) => {
        queue.push(() => this.pfadd(key, ...elements))
        return wrapper
      },
      sadd: (key: string, ...members: string[]) => {
        queue.push(() => this.sadd(key, ...members))
        return wrapper
      },
      set: (key: string, value: any) => {
        queue.push(() => this.set(key, value))
        return wrapper
      },
      del: (...keys: string[]) => {
        queue.push(() => this.del(...keys))
        return wrapper
      },
      zadd: (key: string, ...scoreMembers: { score: number; member: string }[]) => {
        queue.push(() => this.zadd(key, ...scoreMembers))
        return wrapper
      },
      zrange: (key: string, start: number, stop: number, opts?: { rev?: boolean }) => {
        queue.push(() => this.zrange(key, start, stop, opts))
        return wrapper
      },
      zrevrange: (key: string, start: number, stop: number) => {
        queue.push(() => this.zrevrange(key, start, stop))
        return wrapper
      },
      exec: async <T = any[]>(): Promise<T> => {
        const results = []
        for (const fn of queue) {
          results.push(await fn())
        }
        return results as unknown as T
      },
    }
    return wrapper
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
      globalAdapterInstance = new UpstashRedisAdapter(upstashRedis, memoryStoreInstance)
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
