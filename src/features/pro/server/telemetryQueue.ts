import type { ProfileViewMetric } from '@/lib/analytics/profileMetrics'

import { parseTrafficType, sanitizeReferrer } from './privacy'

export interface QueuedView {
  username: string
  slug: string
  timestamp: string
  source: string
  trafficType: string
  status: string
}
export interface TelemetryBatch {
  id: string
  events: QueuedView[]
}
export interface TelemetryQueueStore {
  enqueue(event: QueuedView): Promise<void>
  hasWork(): Promise<boolean>
  reserve(): Promise<boolean>
  claim(id: string): Promise<TelemetryBatch | null>
  acknowledge(id: string): Promise<void>
}

// Never persist raw IP, UA, arbitrary referer domains, geography or visitor IDs.
const sources = new Set([
  'GitHub README (Camo Proxy)',
  'Direct / No Referrer',
  'GitHub',
  'Google Search',
  'X / Twitter',
  'LinkedIn',
  'Reddit',
  'Dev Community',
])
export function queueView(metric: ProfileViewMetric): QueuedView {
  const username = metric.username.toLowerCase().trim()
  const slug = (metric.profileSlug || 'default').toLowerCase().trim()
  if (!/^[a-z0-9-]{1,39}$/.test(username) || !/^[a-z0-9][a-z0-9_-]{0,49}$/.test(slug))
    throw new Error('Invalid telemetry identity')
  const source = sanitizeReferrer(metric.referrer, metric.isCamoProxy)
  return {
    username,
    slug,
    timestamp: new Date().toISOString(),
    source: sources.has(source) ? source : 'Other',
    trafficType: parseTrafficType(metric.userAgent, metric.isCamoProxy, metric.referrer),
    status: String(metric.statusCode || (metric.isCacheHit ? 304 : 200)),
  }
}

export async function drainTelemetry(
  store: TelemetryQueueStore,
  persist: (batch: TelemetryBatch) => Promise<void>,
  id: () => string = () => crypto.randomUUID()
): Promise<number> {
  // No work means no SQL and no hourly reservation consumed.
  if (!(await store.hasWork()) || !(await store.reserve())) return 0
  let count = 0
  const deadline = Date.now() + 20_000
  // Reservation remains for an hour even on errors. Never retry SQL per badge.
  for (let i = 0; i < 10 && Date.now() < deadline; i++) {
    const batch = await store.claim(id())
    if (!batch) break
    await persist(batch)
    // A failed/lost acknowledgement replays the SAME batch ID on the next drain.
    await store.acknowledge(batch.id)
    count += batch.events.length
  }
  return count
}
