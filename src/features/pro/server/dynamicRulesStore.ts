import { evaluatePublishedRules } from '../utils/evaluatePublishedRules'
export { getDateInfoInTimezone } from '../utils/evaluatePublishedRules'
import {
  createDynamicRuleInDb,
  deleteDynamicRuleFromDb,
  getDynamicRulesConfigFromDb,
  reorderDynamicRulesInDb,
  saveDynamicRulesConfigInDb,
  updateDynamicRuleInDb,
} from '@/lib/db/repositories/dynamicRulesRepository'

import type {
  DynamicEvaluationResult,
  DynamicRuleRecord,
  DynamicRulesConfig,
} from '../types/profiles'
import { REDIS_KEYS } from './analyticsStore'
import { getUserProfiles } from './profileManagerStore'
import { getProRedisClient } from './redisClient'

const RULES_CACHE_TTL_MS = 30_000
const rulesCache = new Map<string, { config: DynamicRulesConfig; expiresAt: number }>()

function invalidateRulesCache(username: string): void {
  rulesCache.delete(username.toLowerCase().trim())
}

export async function getDynamicRulesConfig(username: string): Promise<DynamicRulesConfig> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cached = rulesCache.get(u)
  if (cached && cached.expiresAt > Date.now()) return cached.config
  const configKey = REDIS_KEYS.dynamicRulesConfig(u)
  const listKey = REDIS_KEYS.dynamicRulesList(u)

  const [rawConfig, ruleIds] = await Promise.all([
    redis.hgetall<any>(configKey).catch(() => null),
    redis.zrevrange<string[]>(listKey, 0, -1).catch(() => []),
  ])

  if (!rawConfig && (!ruleIds || ruleIds.length === 0)) {
    try {
      const dbConfig = await getDynamicRulesConfigFromDb(u)
      if (dbConfig) {
        const p = redis.pipeline()
        p.hset(configKey, {
          enabled: String(dbConfig.enabled),
          fallbackProfileSlug: dbConfig.fallbackProfileSlug,
          defaultTimezone: dbConfig.defaultTimezone,
        })
        for (const r of dbConfig.rules) {
          p.set(REDIS_KEYS.dynamicRuleItem(u, r.id), JSON.stringify(r))
          p.zadd(listKey, { score: r.priority, member: r.id })
        }
        await p.exec().catch(() => {})
        rulesCache.set(u, { config: dbConfig, expiresAt: Date.now() + RULES_CACHE_TTL_MS })
        return dbConfig
      }
    } catch (dbErr) {
      console.warn(`[DynamicRules] PostgreSQL read error for @${u}:`, dbErr)
    }
  }

  const enabled = rawConfig?.enabled === 'true'
  const fallbackProfileSlug = rawConfig?.fallbackProfileSlug || 'default'
  const defaultTimezone = rawConfig?.defaultTimezone || 'UTC'

  const rules: DynamicRuleRecord[] = []
  if (ruleIds && ruleIds.length > 0) {
    const p = redis.pipeline()
    for (const id of ruleIds) {
      p.get(REDIS_KEYS.dynamicRuleItem(u, id))
    }
    const results = await p.exec<any[]>().catch(() => [])
    for (const rawRule of results) {
      if (rawRule) {
        const parsed: DynamicRuleRecord =
          typeof rawRule === 'string' ? JSON.parse(rawRule) : rawRule
        rules.push(parsed)
      }
    }
  }

  rules.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const config = {
    enabled,
    fallbackProfileSlug,
    defaultTimezone,
    rules,
  }
  rulesCache.set(u, { config, expiresAt: Date.now() + RULES_CACHE_TTL_MS })
  return config
}

export async function saveDynamicRulesConfig(
  username: string,
  updates: Partial<DynamicRulesConfig>
): Promise<DynamicRulesConfig> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const configKey = REDIS_KEYS.dynamicRulesConfig(u)

  try {
    await saveDynamicRulesConfigInDb(u, updates)
  } catch (dbErr) {
    console.warn(`[DynamicRules] PostgreSQL saveDynamicRulesConfig error for @${u}:`, dbErr)
  }

  const payload: Record<string, string> = {}
  if (updates.enabled !== undefined) payload.enabled = String(updates.enabled)
  if (updates.fallbackProfileSlug !== undefined)
    payload.fallbackProfileSlug = updates.fallbackProfileSlug
  if (updates.defaultTimezone !== undefined) payload.defaultTimezone = updates.defaultTimezone

  if (Object.keys(payload).length > 0) {
    await redis.hset(configKey, payload).catch(() => {})
  }

  invalidateRulesCache(u)
  return getDynamicRulesConfig(u)
}

export async function createDynamicRule(
  username: string,
  ruleData: Omit<DynamicRuleRecord, 'id' | 'createdAt' | 'updatedAt' | 'enabled'> & {
    enabled?: boolean
  }
): Promise<DynamicRuleRecord> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const listKey = REDIS_KEYS.dynamicRulesList(u)
  const now = new Date().toISOString()
  const ruleId = `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

  const targetProfileSlug = (ruleData.targetProfileSlug || 'default').toLowerCase().trim()
  const priority = Number.isInteger(ruleData.priority) ? ruleData.priority : 50

  const newRule: DynamicRuleRecord = {
    id: ruleId,
    name: ruleData.name.trim(),
    targetProfileSlug,
    priority,
    enabled: ruleData.enabled !== false,
    type: ruleData.type || 'work_hours',
    daysOfWeek: ruleData.daysOfWeek || (ruleData.type === 'weekend' ? [0, 6] : [1, 2, 3, 4, 5]),
    startTime: ruleData.startTime || (ruleData.type === 'work_hours' ? '09:00' : undefined),
    endTime: ruleData.endTime || (ruleData.type === 'work_hours' ? '18:00' : undefined),
    timezone: ruleData.timezone || undefined,
    startDate: ruleData.startDate || undefined,
    endDate: ruleData.endDate || undefined,
    eventName: ruleData.eventName || undefined,
    expiresAt: ruleData.expiresAt || undefined,
    description: ruleData.description || '',
    createdAt: now,
    updatedAt: now,
  }

  try {
    await createDynamicRuleInDb(u, newRule)
  } catch (dbErr) {
    console.warn(`[DynamicRules] PostgreSQL createDynamicRule error for @${u}:`, dbErr)
  }

  const itemKey = REDIS_KEYS.dynamicRuleItem(u, ruleId)
  await redis.set(itemKey, JSON.stringify(newRule)).catch(() => {})
  await redis.zadd(listKey, { score: priority, member: ruleId }).catch(() => {})

  invalidateRulesCache(u)
  return newRule
}

export async function updateDynamicRule(
  username: string,
  ruleId: string,
  updates: Partial<DynamicRuleRecord>
): Promise<DynamicRuleRecord | null> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const itemKey = REDIS_KEYS.dynamicRuleItem(u, ruleId)
  const listKey = REDIS_KEYS.dynamicRulesList(u)

  const raw = await redis.get<string | DynamicRuleRecord>(itemKey).catch(() => null)
  if (!raw) return null

  const existing: DynamicRuleRecord = typeof raw === 'string' ? JSON.parse(raw) : raw
  const now = new Date().toISOString()

  const updated: DynamicRuleRecord = {
    ...existing,
    ...updates,
    id: existing.id,
    updatedAt: now,
  }

  try {
    await updateDynamicRuleInDb(u, ruleId, updates)
  } catch (dbErr) {
    console.warn(`[DynamicRules] PostgreSQL updateDynamicRule error for @${u}:`, dbErr)
  }

  await redis.set(itemKey, JSON.stringify(updated)).catch(() => {})

  if (updates.priority !== undefined && updates.priority !== existing.priority) {
    await redis.zadd(listKey, { score: updates.priority, member: ruleId }).catch(() => {})
  }

  invalidateRulesCache(u)
  return updated
}

export async function deleteDynamicRule(username: string, ruleId: string): Promise<boolean> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const itemKey = REDIS_KEYS.dynamicRuleItem(u, ruleId)
  const listKey = REDIS_KEYS.dynamicRulesList(u)

  try {
    await deleteDynamicRuleFromDb(u, ruleId)
  } catch (dbErr) {
    console.warn(`[DynamicRules] PostgreSQL deleteDynamicRule error for @${u}:`, dbErr)
  }

  await redis.del(itemKey).catch(() => {})
  await redis.zrem(listKey, ruleId).catch(() => {})

  invalidateRulesCache(u)
  return true
}

export async function reorderDynamicRules(
  username: string,
  ruleIdsInOrder: string[]
): Promise<DynamicRuleRecord[]> {
  const u = username.toLowerCase().trim()
  invalidateRulesCache(u)

  try {
    await reorderDynamicRulesInDb(u, ruleIdsInOrder)
  } catch (dbErr) {
    console.warn(`[DynamicRules] PostgreSQL reorderDynamicRules error for @${u}:`, dbErr)
  }

  let basePriority = ruleIdsInOrder.length * 10
  for (const id of ruleIdsInOrder) {
    await updateDynamicRule(u, id, { priority: basePriority })
    basePriority -= 10
  }

  const config = await getDynamicRulesConfig(u)
  return config.rules
}

export async function evaluateDynamicProfile(
  username: string,
  options?: Parameters<typeof evaluatePublishedRules>[2]
): Promise<DynamicEvaluationResult> {
  const u = username.toLowerCase().trim()
  const [config, profiles] = await Promise.all([getDynamicRulesConfig(u), getUserProfiles(u)])
  return evaluatePublishedRules(config, profiles, options)
}
