import type { PublicCounterStore } from '../publicCounterCache'

/** Serialized shared store with server-side NX/expiry semantics for deterministic tests. */
export class CounterStore implements PublicCounterStore {
  entries = new Map<string, { json: string; expires: number }>()
  failReads = false
  failReservations = false
  failWrites = false
  loseReservationReply = false

  async get(key: string): Promise<unknown> {
    if (this.failReads) throw new Error('Redis unavailable')
    const entry = this.entries.get(key)
    if (!entry || entry.expires <= Date.now()) return null
    return JSON.parse(entry.json)
  }

  async set(key: string, value: unknown, options: { ex: number; nx?: true }) {
    if (options.nx ? this.failReservations : this.failWrites) throw new Error('Redis unavailable')
    const previous = this.entries.get(key)
    if (options.nx && previous && previous.expires > Date.now()) return null
    this.entries.set(key, { json: JSON.stringify(value), expires: Date.now() + options.ex * 1000 })
    if (options.nx && this.loseReservationReply) throw new Error('Response lost after write')
    return 'OK'
  }
}
