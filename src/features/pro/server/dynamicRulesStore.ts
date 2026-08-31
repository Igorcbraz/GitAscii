import type {
  DynamicEvaluatedRuleStep,
  DynamicEvaluationResult,
  DynamicRuleRecord,
  DynamicRulesConfig,
} from '../types/profiles'
import { REDIS_KEYS } from './analyticsStore'
import { getUserProfiles } from './profileManagerStore'
import { getProRedisClient } from './redisClient'

function parseTimeInMinutes(timeStr?: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10))
  return (h || 0) * 60 + (m || 0)
}

export function getDateInfoInTimezone(
  date: Date,
  timeZone: string
): {
  year: number
  month: number
  day: number
  dayOfWeek: number
  hours: number
  minutes: number
  timeInMinutes: number
  formattedTime: string
  formattedDate: string
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const parts = formatter.formatToParts(date)
    const partMap: Record<string, string> = {}
    for (const p of parts) {
      partMap[p.type] = p.value
    }

    const year = parseInt(partMap.year || '2026', 10)
    const month = parseInt(partMap.month || '1', 10)
    const day = parseInt(partMap.day || '1', 10)
    const hours = parseInt(partMap.hour === '24' ? '0' : partMap.hour || '0', 10)
    const minutes = parseInt(partMap.minute || '0', 10)

    const dayNameMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    }
    const dayOfWeek = dayNameMap[partMap.weekday || 'Mon'] ?? date.getUTCDay()
    const timeInMinutes = hours * 60 + minutes

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    return {
      year,
      month,
      day,
      dayOfWeek,
      hours,
      minutes,
      timeInMinutes,
      formattedTime,
      formattedDate,
    }
  } catch {
    const hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      dayOfWeek: date.getUTCDay(),
      hours,
      minutes,
      timeInMinutes: hours * 60 + minutes,
      formattedTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      formattedDate: date.toISOString().split('T')[0],
    }
  }
}

export async function getDynamicRulesConfig(username: string): Promise<DynamicRulesConfig> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const configKey = REDIS_KEYS.dynamicRulesConfig(u)
  const listKey = REDIS_KEYS.dynamicRulesList(u)

  const [rawConfig, ruleIds] = await Promise.all([
    redis.hgetall<any>(configKey),
    redis.zrevrange<string[]>(listKey, 0, -1).catch(() => []),
  ])

  const enabled = rawConfig?.enabled === 'true'
  const fallbackProfileSlug = rawConfig?.fallbackProfileSlug || 'default'
  const defaultTimezone = rawConfig?.defaultTimezone || 'UTC'

  const rules: DynamicRuleRecord[] = []
  if (ruleIds && ruleIds.length > 0) {
    for (const id of ruleIds) {
      const itemKey = REDIS_KEYS.dynamicRuleItem(u, id)
      const rawRule = await redis.get<string | DynamicRuleRecord>(itemKey)
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

  return {
    enabled,
    fallbackProfileSlug,
    defaultTimezone,
    rules,
  }
}

export async function saveDynamicRulesConfig(
  username: string,
  updates: Partial<DynamicRulesConfig>
): Promise<DynamicRulesConfig> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const configKey = REDIS_KEYS.dynamicRulesConfig(u)

  const payload: Record<string, string> = {}
  if (updates.enabled !== undefined) payload.enabled = String(updates.enabled)
  if (updates.fallbackProfileSlug !== undefined)
    payload.fallbackProfileSlug = updates.fallbackProfileSlug
  if (updates.defaultTimezone !== undefined) payload.defaultTimezone = updates.defaultTimezone

  if (Object.keys(payload).length > 0) {
    await redis.hset(configKey, payload)
  }

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

  const itemKey = REDIS_KEYS.dynamicRuleItem(u, ruleId)
  await redis.set(itemKey, JSON.stringify(newRule))
  await redis.zadd(listKey, { score: priority, member: ruleId })

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

  const raw = await redis.get<string | DynamicRuleRecord>(itemKey)
  if (!raw) return null

  const existing: DynamicRuleRecord = typeof raw === 'string' ? JSON.parse(raw) : raw
  const now = new Date().toISOString()

  const updated: DynamicRuleRecord = {
    ...existing,
    ...updates,
    id: existing.id,
    updatedAt: now,
  }

  await redis.set(itemKey, JSON.stringify(updated))

  if (updates.priority !== undefined && updates.priority !== existing.priority) {
    await redis.zadd(listKey, { score: updates.priority, member: ruleId })
  }

  return updated
}

export async function deleteDynamicRule(username: string, ruleId: string): Promise<boolean> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const itemKey = REDIS_KEYS.dynamicRuleItem(u, ruleId)
  const listKey = REDIS_KEYS.dynamicRulesList(u)

  await redis.del(itemKey)
  await redis.zrem(listKey, ruleId)

  return true
}

export async function reorderDynamicRules(
  username: string,
  ruleIdsInOrder: string[]
): Promise<DynamicRuleRecord[]> {
  const u = username.toLowerCase().trim()

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
  options?: {
    simulatedDate?: Date | string
    simulatedTimezone?: string
    requestHeaders?: Headers
  }
): Promise<DynamicEvaluationResult> {
  const u = username.toLowerCase().trim()
  const config = await getDynamicRulesConfig(u)

  const targetDate = options?.simulatedDate
    ? typeof options.simulatedDate === 'string'
      ? new Date(options.simulatedDate)
      : options.simulatedDate
    : new Date()

  const activeTimezone = options?.simulatedTimezone || config.defaultTimezone || 'UTC'

  const userProfiles = await getUserProfiles(u)
  const defaultProfile = userProfiles.find((p) => p.isDefault) ||
    userProfiles.find((p) => p.slug === config.fallbackProfileSlug) ||
    userProfiles[0] || { slug: 'default' }

  const fallbackSlug = defaultProfile.slug

  if (!config.enabled) {
    return {
      selectedProfileSlug: fallbackSlug,
      matchedRule: null,
      isFallback: true,
      evaluationReason: `Dynamic rules are currently disabled. Fallback to default profile (/${fallbackSlug}).`,
      evaluationTimestamp: targetDate.toISOString(),
      simulatedTimezone: activeTimezone,
      evaluatedRules: [],
    }
  }

  const evaluatedSteps: DynamicEvaluatedRuleStep[] = []
  let matchedRule: DynamicRuleRecord | null = null
  let matchReason = ''

  for (const rule of config.rules) {
    if (matchedRule) {
      evaluatedSteps.push({
        ruleId: rule.id,
        ruleName: rule.name,
        priority: rule.priority,
        targetProfileSlug: rule.targetProfileSlug,
        matched: false,
        reason: `Skipped: Higher priority rule "${matchedRule.name}" already matched`,
      })
      continue
    }

    if (!rule.enabled) {
      evaluatedSteps.push({
        ruleId: rule.id,
        ruleName: rule.name,
        priority: rule.priority,
        targetProfileSlug: rule.targetProfileSlug,
        matched: false,
        reason: 'Rule is disabled',
      })
      continue
    }

    const ruleTz = rule.timezone || activeTimezone
    const dateInfo = getDateInfoInTimezone(targetDate, ruleTz)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[dateInfo.dayOfWeek] || 'Unknown'

    let matched = false
    let stepReason = ''

    switch (rule.type) {
      case 'work_hours': {
        const days =
          rule.daysOfWeek && rule.daysOfWeek.length > 0 ? rule.daysOfWeek : [1, 2, 3, 4, 5]
        const isDayMatch = days.includes(dateInfo.dayOfWeek)
        const startMins = parseTimeInMinutes(rule.startTime || '09:00')
        const endMins = parseTimeInMinutes(rule.endTime || '18:00')
        const isTimeMatch =
          startMins <= endMins
            ? dateInfo.timeInMinutes >= startMins && dateInfo.timeInMinutes < endMins
            : dateInfo.timeInMinutes >= startMins || dateInfo.timeInMinutes < endMins

        if (isDayMatch && isTimeMatch) {
          matched = true
          stepReason = `Matched Work Hours: ${dayName} at ${dateInfo.formattedTime} (${rule.startTime || '09:00'} - ${rule.endTime || '18:00'} ${ruleTz})`
        } else if (!isDayMatch) {
          stepReason = `Day ${dayName} is not in scheduled days [${days.join(', ')}]`
        } else {
          stepReason = `Current time ${dateInfo.formattedTime} is outside window ${rule.startTime || '09:00'} - ${rule.endTime || '18:00'} (${ruleTz})`
        }
        break
      }

      case 'weekend': {
        const days = rule.daysOfWeek && rule.daysOfWeek.length > 0 ? rule.daysOfWeek : [0, 6]
        const isWeekend = days.includes(dateInfo.dayOfWeek)
        if (isWeekend) {
          matched = true
          stepReason = `Matched Weekend schedule: ${dayName} (${ruleTz})`
        } else {
          stepReason = `Current day ${dayName} is not a weekend day`
        }
        break
      }

      case 'date_range': {
        if (!rule.startDate || !rule.endDate) {
          stepReason = 'Date range missing start or end date'
          break
        }
        const start = new Date(rule.startDate).getTime()
        const end = new Date(rule.endDate).getTime()
        const currentMs = targetDate.getTime()

        if (currentMs >= start && currentMs <= end) {
          matched = true
          stepReason = `Matched Date Range: ${dateInfo.formattedDate} is within ${rule.startDate.split('T')[0]} to ${rule.endDate.split('T')[0]}`
        } else if (currentMs < start) {
          stepReason = `Date Range has not started yet (Starts ${rule.startDate})`
        } else {
          stepReason = `Date Range has expired (Ended ${rule.endDate})`
        }
        break
      }

      case 'event': {
        if (!rule.startDate || !rule.endDate) {
          stepReason = 'Event missing date configuration'
          break
        }
        const start = new Date(rule.startDate).getTime()
        const end = new Date(rule.endDate).getTime()
        const currentMs = targetDate.getTime()

        if (currentMs >= start && currentMs <= end) {
          matched = true
          stepReason = `Active Event "${rule.eventName || rule.name}": ${dateInfo.formattedDate}`
        } else {
          stepReason = `Event not active on ${dateInfo.formattedDate}`
        }
        break
      }

      case 'temporary': {
        if (rule.expiresAt) {
          const expMs = new Date(rule.expiresAt).getTime()
          if (targetDate.getTime() <= expMs) {
            matched = true
            stepReason = `Temporary override active until ${rule.expiresAt}`
          } else {
            stepReason = `Temporary override expired on ${rule.expiresAt}`
          }
        } else {
          matched = true
          stepReason = 'Temporary override active without expiration'
        }
        break
      }

      case 'custom': {
        let dayOk = true
        let timeOk = true

        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          dayOk = rule.daysOfWeek.includes(dateInfo.dayOfWeek)
        }
        if (rule.startTime && rule.endTime) {
          const startMins = parseTimeInMinutes(rule.startTime)
          const endMins = parseTimeInMinutes(rule.endTime)
          timeOk =
            startMins <= endMins
              ? dateInfo.timeInMinutes >= startMins && dateInfo.timeInMinutes < endMins
              : dateInfo.timeInMinutes >= startMins || dateInfo.timeInMinutes < endMins
        }

        if (dayOk && timeOk) {
          matched = true
          stepReason = `Matched custom conditions: ${dayName} at ${dateInfo.formattedTime}`
        } else {
          stepReason = 'Custom conditions not satisfied'
        }
        break
      }
    }

    evaluatedSteps.push({
      ruleId: rule.id,
      ruleName: rule.name,
      priority: rule.priority,
      targetProfileSlug: rule.targetProfileSlug,
      matched,
      reason: stepReason,
    })

    if (matched && !matchedRule) {
      matchedRule = rule
      matchReason = stepReason
    }
  }

  if (matchedRule) {
    return {
      selectedProfileSlug: matchedRule.targetProfileSlug,
      matchedRule,
      isFallback: false,
      evaluationReason: matchReason,
      evaluationTimestamp: targetDate.toISOString(),
      simulatedTimezone: activeTimezone,
      evaluatedRules: evaluatedSteps,
    }
  }

  return {
    selectedProfileSlug: fallbackSlug,
    matchedRule: null,
    isFallback: true,
    evaluationReason: `No dynamic rules matched. Falling back to default profile (/${fallbackSlug}).`,
    evaluationTimestamp: targetDate.toISOString(),
    simulatedTimezone: activeTimezone,
    evaluatedRules: evaluatedSteps,
  }
}
