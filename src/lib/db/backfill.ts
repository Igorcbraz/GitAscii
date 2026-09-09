import crypto from 'crypto'

import { REDIS_KEYS } from '@/features/pro/server/analyticsStore'
import { getProRedisClient } from '@/features/pro/server/redisClient'
import type {
  DynamicRuleRecord,
  ProfileVersionRecord,
  ProProfileRecord,
} from '@/features/pro/types/profiles'
import type { ProPlanTier, ProUserSettings } from '@/features/pro/types/subscription'

import { sql } from './client'
import {
  createDynamicRuleInDb,
  saveDynamicRulesConfigInDb,
} from './repositories/dynamicRulesRepository'
import { logSentEmailInDb } from './repositories/emailLogRepository'
import { recordWidgetErrorInDb } from './repositories/healthRepository'
import {
  createProfileInDb,
  createProfileVersionInDb,
  saveProfileConfigInDb,
} from './repositories/profileRepository'
import {
  ensureUser,
  getUserByUsername,
  updateUserSettingsInDb,
} from './repositories/userRepository'

export interface BackfillSummary {
  usersMigrated: number
  proUsersFound: number
  settingsMigrated: number
  profilesMigrated: number
  rulesMigrated: number
  emailLogsMigrated: number
  errorsMigrated: number
  errors: string[]
}

export async function runRedisToPostgresBackfill(): Promise<BackfillSummary> {
  const summary: BackfillSummary = {
    usersMigrated: 0,
    proUsersFound: 0,
    settingsMigrated: 0,
    profilesMigrated: 0,
    rulesMigrated: 0,
    emailLogsMigrated: 0,
    errorsMigrated: 0,
    errors: [],
  }

  const instanceId = `${process.pid || 'worker'}-${crypto.randomBytes(6).toString('hex')}`
  let dbLockAcquired = false
  let redisLockAcquired = false

  try {
    try {
      const redis = getProRedisClient()
      const rLock = await redis.set('gitascii:lock:backfill', instanceId, { nx: true, ex: 300 })
      redisLockAcquired = Boolean(rLock)
      if (!redisLockAcquired) {
        console.log(
          '[Backfill] Another instance is currently executing backfill (Redis lock active). Skipping.'
        )
        return summary
      }
    } catch (e: any) {
      console.warn('[Backfill] Redis lock warning:', e.message)
    }

    try {
      const lockRows = await sql`
        INSERT INTO system_locks (lock_name, locked_until, locked_by)
        VALUES ('migrations_and_backfill', NOW() + INTERVAL '5 minutes', ${instanceId})
        ON CONFLICT (lock_name) DO UPDATE
        SET locked_until = NOW() + INTERVAL '5 minutes', locked_by = ${instanceId}
        WHERE system_locks.locked_until < NOW()
        RETURNING lock_name;
      `
      dbLockAcquired = lockRows.length > 0
      if (!dbLockAcquired) {
        console.log(
          '[Backfill] Another instance is currently executing backfill (DB lock active). Skipping.'
        )
        if (redisLockAcquired) {
          await getProRedisClient()
            .del('gitascii:lock:backfill')
            .catch(() => {})
        }
        return summary
      }
    } catch (e: any) {
      console.warn('[Backfill] DB lock warning:', e.message)
    }

    const redis = getProRedisClient()
    const usersToProcess = new Set<string>()
    const proCustomersSet = new Set<string>()

    try {
      const allUsers = await redis.smembers('gitascii:all:users')
      if (Array.isArray(allUsers)) {
        allUsers.forEach((u) => u && usersToProcess.add(u.toLowerCase().trim()))
      }
    } catch (e: any) {
      console.warn('[Backfill] Could not read gitascii:all:users:', e.message)
    }

    try {
      const proCustomers = await redis.smembers('gitascii:pro:customers')
      if (Array.isArray(proCustomers)) {
        proCustomers.forEach((u) => {
          if (u) {
            const normalized = u.toLowerCase().trim()
            usersToProcess.add(normalized)
            proCustomersSet.add(normalized)
            summary.proUsersFound++
          }
        })
      }
    } catch (e: any) {
      console.warn('[Backfill] Could not read gitascii:pro:customers:', e.message)
    }

    try {
      let cursor = 0
      let iterations = 0
      const maxIterations = 50
      do {
        const scanRes = await redis.scan(cursor, {
          match: 'gitascii:pro:*:settings',
          count: 100,
        })
        if (Array.isArray(scanRes) && scanRes.length === 2) {
          cursor = Number(scanRes[0])
          const keys = scanRes[1]
          if (Array.isArray(keys)) {
            for (const key of keys) {
              const match = key.match(/^gitascii:pro:([^:]+):settings$/)
              if (match && match[1]) {
                usersToProcess.add(match[1].toLowerCase().trim())
              }
            }
          }
        } else {
          break
        }
        iterations++
      } while (cursor !== 0 && iterations < maxIterations)
    } catch (e: any) {
      console.warn('[Backfill] SCAN discovery warning:', e.message)
    }

    for (const username of usersToProcess) {
      if (username.startsWith('test_')) continue
      try {
        await ensureUser(username)
        summary.usersMigrated++

        const settingsKey = `gitascii:pro:${username}:settings`
        const raw = await redis.hgetall<Record<string, unknown>>(settingsKey)
        const isProCustomer = proCustomersSet.has(username)

        if (raw || isProCustomer) {
          const currentDbUser = await getUserByUsername(username)
          const existingDbTier = currentDbUser?.entitlement.plan_tier || 'free'
          let planTier: ProPlanTier = (raw?.planTier as ProPlanTier) || 'free'

          if (isProCustomer && planTier === 'free') {
            planTier = 'pro'
          }
          if (existingDbTier === 'pro' && planTier === 'free') {
            planTier = 'pro'
          }

          const settingsPayload: Partial<ProUserSettings> = {}
          if (raw?.emailAlertsEnabled !== undefined) {
            settingsPayload.emailAlertsEnabled =
              raw.emailAlertsEnabled === 'true' || raw.emailAlertsEnabled === true
          }
          if (typeof raw?.alertEmailAddress === 'string') {
            settingsPayload.alertEmailAddress = raw.alertEmailAddress
          }
          if (raw?.dailyDigestEnabled !== undefined) {
            settingsPayload.dailyDigestEnabled =
              raw.dailyDigestEnabled === 'true' || raw.dailyDigestEnabled === true
          }
          if (typeof raw?.themePreference === 'string') {
            settingsPayload.themePreference = raw.themePreference as any
          }
          if (raw?.anonymizeReferrers !== undefined) {
            settingsPayload.anonymizeReferrers =
              raw.anonymizeReferrers !== 'false' && raw.anonymizeReferrers !== false
          }
          if (planTier !== 'free') {
            settingsPayload.planTier = planTier
          }
          if (typeof raw?.stripeCustomerId === 'string' && raw.stripeCustomerId) {
            settingsPayload.stripeCustomerId = raw.stripeCustomerId
          }
          if (typeof raw?.stripeSubscriptionId === 'string' && raw.stripeSubscriptionId) {
            settingsPayload.stripeSubscriptionId = raw.stripeSubscriptionId
          }
          if (typeof raw?.stripePriceId === 'string' && raw.stripePriceId) {
            settingsPayload.stripePriceId = raw.stripePriceId
          }
          if (typeof raw?.stripeSubscriptionStatus === 'string' && raw.stripeSubscriptionStatus) {
            settingsPayload.stripeSubscriptionStatus = raw.stripeSubscriptionStatus
          }
          if (raw?.stripeCurrentPeriodEnd) {
            settingsPayload.stripeCurrentPeriodEnd = Number(raw.stripeCurrentPeriodEnd)
          }

          await updateUserSettingsInDb(username, settingsPayload)
          summary.settingsMigrated++
        }

        const profileSlugs = await redis.smembers(REDIS_KEYS.userProfiles(username)).catch(() => [])
        if (Array.isArray(profileSlugs)) {
          for (const slug of profileSlugs) {
            if (!slug) continue
            try {
              const meta = await redis.hgetall<any>(REDIS_KEYS.profileMeta(username, slug))
              const config = await redis.get<any>(REDIS_KEYS.profileConfig(username, slug))
              const parsedConfig = typeof config === 'string' ? JSON.parse(config) : config

              if (meta && meta.name) {
                const isDefault =
                  meta.isDefault === 'true' ||
                  meta.isDefault === true ||
                  (slug === 'default' && meta.isDefault !== 'false')

                const profileRecord: ProProfileRecord = {
                  id: `prof_${username}_${slug}`,
                  slug,
                  name: meta.name,
                  description: meta.description || '',
                  status: meta.status || 'active',
                  isDefault,
                  widgetsCount: Number(meta.widgetsCount || 1),
                  totalViews: Number(meta.totalViews || 0),
                  versionCount: 1,
                  healthStatus: meta.healthStatus || 'operational',
                  renderSuccessRate: Number(meta.renderSuccessRate || 100),
                  createdAt: meta.createdAt || new Date().toISOString(),
                  lastUpdated: meta.updatedAt || meta.lastUpdated || new Date().toISOString(),
                  publicUrl: `/${username}/${slug}`,
                  rawSvgUrl: `/${username}/${slug}.svg`,
                }
                await createProfileInDb(username, profileRecord, parsedConfig || undefined)
                summary.profilesMigrated++
              } else if (parsedConfig) {
                await saveProfileConfigInDb(username, slug, parsedConfig)
                summary.profilesMigrated++
              }

              const versionIds = await redis
                .zrange<string[]>(REDIS_KEYS.profileVersions(username, slug), 0, -1)
                .catch(() => [])
              if (Array.isArray(versionIds)) {
                for (const vId of versionIds) {
                  const rawVer = await redis.get<any>(
                    REDIS_KEYS.profileVersionItem(username, slug, vId)
                  )
                  if (rawVer) {
                    const ver: ProfileVersionRecord =
                      typeof rawVer === 'string' ? JSON.parse(rawVer) : rawVer
                    await createProfileVersionInDb(username, slug, ver)
                  }
                }
              }
            } catch (pErr: any) {
              summary.errors.push(`Profile error @${username}/${slug}: ${pErr.message}`)
            }
          }
        }

        try {
          const rawDynConfig = await redis.hgetall<any>(REDIS_KEYS.dynamicRulesConfig(username))
          if (rawDynConfig) {
            await saveDynamicRulesConfigInDb(username, {
              enabled: rawDynConfig.enabled === 'true',
              fallbackProfileSlug: rawDynConfig.fallbackProfileSlug || 'default',
              defaultTimezone: rawDynConfig.defaultTimezone || 'UTC',
            })
          }
          const dynRuleIds = await redis
            .zrange<string[]>(REDIS_KEYS.dynamicRulesList(username), 0, -1)
            .catch(() => [])
          if (Array.isArray(dynRuleIds)) {
            for (const rId of dynRuleIds) {
              const rawRule = await redis.get<any>(REDIS_KEYS.dynamicRuleItem(username, rId))
              if (rawRule) {
                const rule: DynamicRuleRecord =
                  typeof rawRule === 'string' ? JSON.parse(rawRule) : rawRule
                await createDynamicRuleInDb(username, rule)
                summary.rulesMigrated++
              }
            }
          }
        } catch (dynErr: any) {
          summary.errors.push(`Dynamic rules error @${username}: ${dynErr.message}`)
        }

        try {
          const emailIds = await redis
            .zrevrange<string[]>(REDIS_KEYS.emailList(username), 0, 50)
            .catch(() => [])
          if (Array.isArray(emailIds)) {
            for (const emlId of emailIds) {
              const rawEml = await redis.hgetall<any>(REDIS_KEYS.emailItem(username, emlId))
              if (rawEml && rawEml.id) {
                await logSentEmailInDb(username, {
                  id: rawEml.id,
                  recipientEmail: rawEml.recipientEmail,
                  templateName: rawEml.templateName,
                  subject: rawEml.subject,
                  reason: rawEml.reason,
                  relatedWidget: rawEml.relatedWidget || null,
                  relatedProfile: rawEml.relatedProfile || null,
                  sentAt: rawEml.sentAt || new Date().toISOString(),
                  status: rawEml.status || 'sent',
                  errorMessage: rawEml.errorMessage || null,
                  messageId: rawEml.messageId || null,
                })
                summary.emailLogsMigrated++
              }
            }
          }
        } catch (emlErr: any) {
          summary.errors.push(`Email logs error @${username}: ${emlErr.message}`)
        }

        try {
          const errorIds = await redis
            .zrevrange<string[]>(REDIS_KEYS.errorList(username), 0, 50)
            .catch(() => [])
          if (Array.isArray(errorIds)) {
            for (const errId of errorIds) {
              const rawErr = await redis.hgetall<any>(REDIS_KEYS.errorItem(username, errId))
              if (rawErr && rawErr.id) {
                await recordWidgetErrorInDb(username, {
                  id: rawErr.id,
                  widgetId: rawErr.widgetId,
                  widgetName: rawErr.widgetName || rawErr.widgetId,
                  profileSlug: rawErr.profileSlug || 'default',
                  errorType: rawErr.errorType || 'UNKNOWN',
                  message: rawErr.message || 'Unknown error',
                  details: rawErr.details || undefined,
                  status: rawErr.status || 'active',
                  occurrences: Number(rawErr.occurrences || 1),
                  firstSeenAt: rawErr.firstSeenAt || new Date().toISOString(),
                  lastSeenAt: rawErr.lastSeenAt || new Date().toISOString(),
                  resolvedAt: rawErr.resolvedAt || null,
                })
                summary.errorsMigrated++
              }
            }
          }
        } catch (errErr: any) {
          summary.errors.push(`Widget errors error @${username}: ${errErr.message}`)
        }
      } catch (userErr: any) {
        summary.errors.push(`Error migrating @${username}: ${userErr.message}`)
      }
    }
  } catch (err: any) {
    summary.errors.push(`Fatal backfill error: ${err.message}`)
  } finally {
    if (dbLockAcquired) {
      await sql`
        DELETE FROM system_locks
        WHERE lock_name = 'migrations_and_backfill' AND locked_by = ${instanceId}
      `.catch(() => {})
    }
    if (redisLockAcquired) {
      try {
        const redis = getProRedisClient()
        await redis.del('gitascii:lock:backfill')
      } catch {}
    }
  }

  return summary
}
