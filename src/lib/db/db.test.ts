import fs from 'node:fs'
import path from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

if (!process.env.DATABASE_URL) {
  const envLocalPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envLocalPath) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envLocalPath)
    } catch {}
  }
}

import { runMigrations } from './migrations'
import {
  ensureUser,
  getUserByUsername,
  linkStripeCustomer,
  tryRecordStripeEvent,
  updateEntitlement,
} from './repositories/userRepository'

const isDbConfigured = Boolean(process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED)
const describeDb = isDbConfigured ? describe : describe.skip

describeDb('PostgreSQL Neon Database Layer', () => {
  beforeAll(async () => {
    if (isDbConfigured) {
      try {
        const { sql } = await import('./client')
        await sql`DELETE FROM users WHERE username LIKE 'test_%'`
      } catch {}
    }
  })

  it('runs migrations without error', async () => {
    await expect(runMigrations()).resolves.not.toThrow()
  })

  it('ensures and retrieves user correctly', async () => {
    const testUsername = `test_user_${Date.now()}`
    const testGithubId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const user = await ensureUser(testUsername, {
      email: 'test@example.com',
      name: 'Test User',
      githubId: testGithubId,
    })

    expect(user.username).toBe(testUsername)

    const retrieved = await getUserByUsername(testUsername)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.user.email).toBe('test@example.com')
    expect(retrieved?.entitlement.plan_tier).toBe('free')
  })

  it('updates entitlement and handles out-of-order events safely', async () => {
    const testUsername = `test_order_${Date.now()}`
    const subNew = `sub_new_${Date.now()}`
    const subOld = `sub_old_${Date.now()}`
    await ensureUser(testUsername)

    // Event 1 with timestamp 2000
    await updateEntitlement({
      username: testUsername,
      planTier: 'pro',
      stripeSubscriptionId: subNew,
      eventCreatedAt: 2000,
    })

    let current = await getUserByUsername(testUsername)
    expect(current?.entitlement.plan_tier).toBe('pro')
    expect(current?.entitlement.stripe_subscription_id).toBe(subNew)

    // Older event with timestamp 1000 attempting to downgrade to free
    await updateEntitlement({
      username: testUsername,
      planTier: 'free',
      stripeSubscriptionId: subOld,
      eventCreatedAt: 1000,
    })

    // Must NOT have been overwritten by older event!
    current = await getUserByUsername(testUsername)
    expect(current?.entitlement.plan_tier).toBe('pro')
    expect(current?.entitlement.stripe_subscription_id).toBe(subNew)
  })

  it('enforces unique stripe_customer_id across different users', async () => {
    const userA = `test_user_a_${Date.now()}`
    const userB = `test_user_b_${Date.now()}`
    const stripeCustId = `cus_test_${Date.now()}`

    await ensureUser(userA)
    await ensureUser(userB)

    await linkStripeCustomer(userA, stripeCustId)

    // Attempting to assign same customer to userB must fail
    await expect(linkStripeCustomer(userB, stripeCustId)).rejects.toThrow(
      /already linked to another account/
    )

    // Attempting to change userA's customer ID must fail (immutable ownership)
    await expect(linkStripeCustomer(userA, `cus_new_${Date.now()}`)).rejects.toThrow(
      /Cannot change/
    )
  })

  it('enforces immutable ownership on stripe subscriptions and payment intents', async () => {
    const userA = `test_sub_a_${Date.now()}`
    const userB = `test_sub_b_${Date.now()}`
    const subId = `sub_uniq_${Date.now()}`
    const intentId = `pi_uniq_${Date.now()}`

    await ensureUser(userA)
    await ensureUser(userB)

    // Assign subId and intentId to userA
    await updateEntitlement({
      username: userA,
      planTier: 'pro',
      stripeSubscriptionId: subId,
      stripePaymentIntentId: intentId,
    })

    // Assigning same subId to userB must fail
    await expect(
      updateEntitlement({
        username: userB,
        planTier: 'pro',
        stripeSubscriptionId: subId,
      })
    ).rejects.toThrow(/already linked to another account/)

    // Assigning same intentId to userB must fail
    await expect(
      updateEntitlement({
        username: userB,
        planTier: 'pro',
        stripePaymentIntentId: intentId,
      })
    ).rejects.toThrow(/already linked to another account/)
  })

  it('handles Subscription A canceled arriving after Subscription B created', async () => {
    const username = `test_multi_sub_${Date.now()}`
    await ensureUser(username)

    // 1. Subscription A created at t=100
    await updateEntitlement({
      username,
      planTier: 'pro',
      stripeSubscriptionId: 'sub_A_123',
      stripeSubscriptionStatus: 'active',
      eventCreatedAt: 100,
    })

    let user = await getUserByUsername(username)
    expect(user?.entitlement.plan_tier).toBe('pro')
    expect(user?.entitlement.stripe_subscription_id).toBe('sub_A_123')

    // 2. Subscription B created at t=200
    await updateEntitlement({
      username,
      planTier: 'pro',
      stripeSubscriptionId: 'sub_B_456',
      stripeSubscriptionStatus: 'active',
      eventCreatedAt: 200,
    })

    user = await getUserByUsername(username)
    expect(user?.entitlement.plan_tier).toBe('pro')
    expect(user?.entitlement.stripe_subscription_id).toBe('sub_B_456')

    // 3. Delayed webhook: Subscription A canceled arrives (even with higher timestamp)
    await updateEntitlement({
      username,
      planTier: 'free',
      stripeSubscriptionId: 'sub_A_123',
      stripeSubscriptionStatus: 'canceled',
      eventCreatedAt: 250,
    })

    // User must REMAIN PRO with Subscription B!
    user = await getUserByUsername(username)
    expect(user?.entitlement.plan_tier).toBe('pro')
    expect(user?.entitlement.stripe_subscription_id).toBe('sub_B_456')
  })

  it('preserves Lifetime Pro (payment intent) from subscription cancellations', async () => {
    const username = `test_lifetime_${Date.now()}`
    await ensureUser(username)

    // Lifetime Pro purchase via payment intent
    await updateEntitlement({
      username,
      planTier: 'pro',
      stripePaymentIntentId: 'pi_lifetime_test',
    })

    let user = await getUserByUsername(username)
    expect(user?.entitlement.plan_tier).toBe('pro')
    expect(user?.entitlement.stripe_payment_intent_id).toBe('pi_lifetime_test')

    // Webhook tries to demote to free
    await updateEntitlement({
      username,
      planTier: 'free',
      stripeSubscriptionStatus: 'canceled',
      eventCreatedAt: 999999,
    })

    // Lifetime Pro remains intact
    user = await getUserByUsername(username)
    expect(user?.entitlement.plan_tier).toBe('pro')
  })

  it('recovers seamlessly when Redis cache is wiped', async () => {
    const { getProEntitlements, getUserSettings } =
      await import('@/features/pro/server/entitlements')
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')

    const username = `test_redis_wipe_${Date.now()}`
    await ensureUser(username)
    await updateEntitlement({
      username,
      planTier: 'pro',
      stripeSubscriptionId: 'sub_wipe_test',
    })

    const redis = getProRedisClient()
    const settingsKey = REDIS_KEYS.userSettings(username)

    // Completely wipe Redis state for this user
    await redis.del(settingsKey)
    await redis.srem('gitascii:pro:customers', username)

    // Query entitlements & settings
    const entitlements = await getProEntitlements(username)
    const settings = await getUserSettings(username)

    expect(entitlements.tier).toBe('pro')
    expect(settings.planTier).toBe('pro')

    // Verify Redis cache was auto-healed from PostgreSQL
    const cached = await redis.hgetall<Record<string, unknown>>(settingsKey)
    expect(cached?.planTier).toBe('pro')
  })

  it('guarantees Redis can NEVER demote a Pro persisted in PostgreSQL', async () => {
    const { getProEntitlements, getUserSettings, invalidateEntitlementsCache } =
      await import('@/features/pro/server/entitlements')
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')

    const username = `test_redis_demote_${Date.now()}`
    await ensureUser(username)
    await updateEntitlement({
      username,
      planTier: 'pro',
      stripeSubscriptionId: 'sub_anti_demote',
    })

    const redis = getProRedisClient()
    const settingsKey = REDIS_KEYS.userSettings(username)

    // Stale or corrupted Redis write sets planTier to 'free'
    await redis.hset(settingsKey, { planTier: 'free' })
    invalidateEntitlementsCache(username)

    // getProEntitlements must NOT believe Redis 'free' and must return 'pro' from PostgreSQL!
    const entitlements = await getProEntitlements(username)
    expect(entitlements.tier).toBe('pro')

    const settings = await getUserSettings(username)
    expect(settings.planTier).toBe('pro')

    // Redis must have been healed back to 'pro'
    const cached = await redis.hgetall<Record<string, unknown>>(settingsKey)
    expect(cached?.planTier).toBe('pro')
  })

  it('records stripe events idempotently', async () => {
    const eventId = `evt_test_${Date.now()}`
    const firstAttempt = await tryRecordStripeEvent(eventId, 'checkout.session.completed', 12345)
    expect(firstAttempt).toBe(true)

    const secondAttempt = await tryRecordStripeEvent(eventId, 'checkout.session.completed', 12345)
    expect(secondAttempt).toBe(false)
  })

  it('persists and self-heals profile configurations when Redis cache is wiped', async () => {
    const { saveProfileConfig, loadProfileConfig, invalidateProfileConfig } =
      await import('@/lib/profileStorage')
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')

    const username = `test_prof_cfg_${Date.now()}`
    await ensureUser(username)

    const mockConfig = {
      version: 1,
      githubId: 12345,
      username,
      profileSlug: 'default',
      profileName: 'Default Profile',
      templateId: 'terminal',
      widgets: [
        {
          instanceId: 'widget-1',
          widgetId: 'github-stats',
          position: { x: 0, y: 0 },
          size: { width: 2, height: 2 },
          config: { color: 'green' },
          locked: false,
          visible: true,
          zIndex: 1,
        },
      ],
      globalStyles: {
        backgroundColor: '#0a0a0a',
        textColor: '#ffffff',
        accentColor: '#c5ff4a',
        borderColor: 'rgba(255,255,255,0.1)',
        fontFamily: 'monospace',
        borderRadius: 8,
        padding: 16,
        themeMode: 'dark' as const,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schemaVersion: 1,
      },
    }

    await saveProfileConfig(mockConfig)

    // Clear memory cache and Redis cache
    invalidateProfileConfig(username, 'default')
    const redis = getProRedisClient()
    await redis.del(REDIS_KEYS.profileConfig(username, 'default'))

    // Load profile config — must seamlessly recover from PostgreSQL
    const loaded = await loadProfileConfig(username, 'default')
    expect(loaded).not.toBeNull()
    expect(loaded?.username).toBe(username)
    expect(loaded?.widgets).toHaveLength(1)
    expect(loaded?.widgets[0].instanceId).toBe('widget-1')

    // Verify Redis cache was repopulated
    const cached = await redis.get(REDIS_KEYS.profileConfig(username, 'default'))
    expect(cached).not.toBeNull()
  }, 20000)

  it('persists profile manager profiles and versions in PostgreSQL with self-healing', async () => {
    const { createProfile, getUserProfiles, createProfileVersion, getProfileVersions } =
      await import('@/features/pro/server/profileManagerStore')
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')

    const username = `test_prof_mgr_${Date.now()}`
    await ensureUser(username)

    // 1. Create a profile
    const profile = await createProfile(username, {
      name: 'Work Profile',
      slug: 'work',
      description: 'Profile for work showcase',
    })
    expect(profile.slug).toBe('work')

    // 2. Create a version for this profile (version 1 was created by createProfile, so this is version 2)
    const version = await createProfileVersion(username, 'work', {
      label: 'Second release',
      description: 'Updated widget layout',
      config: {
        version: 1,
        githubId: 12345,
        username,
        profileSlug: 'work',
        profileName: 'Work Profile',
        templateId: 'terminal',
        widgets: [],
        globalStyles: {
          backgroundColor: '#0a0a0a',
          textColor: '#ffffff',
          accentColor: '#c5ff4a',
          borderColor: 'rgba(255,255,255,0.1)',
          fontFamily: 'monospace',
          borderRadius: 8,
          padding: 16,
          themeMode: 'dark' as const,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          schemaVersion: 1,
        },
      },
    })
    expect(version?.versionNumber).toBe(2)

    // 3. Wipe Redis cache completely for this user
    const redis = getProRedisClient()
    await redis.del(
      REDIS_KEYS.userProfiles(username),
      REDIS_KEYS.profileMeta(username, 'work'),
      REDIS_KEYS.profileVersions(username, 'work')
    )

    // 4. Query profiles — must be retrieved from PostgreSQL and self-heal Redis
    const profiles = await getUserProfiles(username)
    expect(profiles.some((p) => p.slug === 'work')).toBe(true)

    // 5. Query versions — must be retrieved from PostgreSQL and self-heal Redis
    const versions = await getProfileVersions(username, 'work')
    expect(versions).toHaveLength(2)
    expect(versions.some((v) => v.versionNumber === 2)).toBe(true)
  })

  it('persists dynamic rules in PostgreSQL and recovers upon Redis cache wipe', async () => {
    const { createDynamicRule, saveDynamicRulesConfig, getDynamicRulesConfig } =
      await import('@/features/pro/server/dynamicRulesStore')
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')

    const username = `test_dyn_rules_${Date.now()}`
    await ensureUser(username)

    await saveDynamicRulesConfig(username, {
      enabled: true,
      fallbackProfileSlug: 'default',
    })

    await createDynamicRule(username, {
      name: 'Night Theme',
      enabled: true,
      priority: 1,
      targetProfileSlug: 'dark-theme',
      type: 'work_hours',
      startTime: '20:00',
      endTime: '06:00',
      timezone: 'UTC',
    })

    // Wipe Redis cache
    const redis = getProRedisClient()
    await redis.del(REDIS_KEYS.dynamicRulesConfig(username), REDIS_KEYS.dynamicRulesList(username))

    // Retrieve from PostgreSQL
    const config = await getDynamicRulesConfig(username)
    expect(config.enabled).toBe(true)
    expect(config.rules).toHaveLength(1)
    expect(config.rules[0].name).toBe('Night Theme')
  })

  it('enforces LGPD compliance by cascading deletions across all PostgreSQL tables and Redis', async () => {
    const { deleteUser } = await import('./repositories/userRepository')
    const { saveProfileConfig } = await import('@/lib/profileStorage')
    const { saveDynamicRulesConfig } = await import('@/features/pro/server/dynamicRulesStore')
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')
    const { sql } = await import('./client')

    const username = `test_lgpd_${Date.now()}`
    const user = await ensureUser(username, { email: 'lgpd@example.com' })

    // Seed profile and dynamic rule
    await saveProfileConfig({
      username,
      profileSlug: 'default',
      widgets: [],
      theme: 'dark',
      updatedAt: new Date().toISOString(),
    } as any)

    await saveDynamicRulesConfig(username, {
      enabled: true,
      rules: [],
      fallbackProfileSlug: 'default',
    })

    const redis = getProRedisClient()
    const settingsKey = REDIS_KEYS.userSettings(username)
    const configKey = REDIS_KEYS.profileConfig(username, 'default')

    // Confirm keys exist or can be set in Redis
    await redis.hset(settingsKey, { planTier: 'free' })
    await redis.sadd('gitascii:all:users', username)

    // Execute LGPD permanent deletion
    const deleted = await deleteUser(username)
    expect(deleted).toBe(true)

    // 1. Check PostgreSQL - User record must be gone
    const userRows = await sql`SELECT id FROM users WHERE id = ${user.id}`
    expect(userRows).toHaveLength(0)

    // 2. Check PostgreSQL - Cascaded tables must have 0 records for that user
    const entitlementRows = await sql`SELECT id FROM user_entitlements WHERE user_id = ${user.id}`
    expect(entitlementRows).toHaveLength(0)

    const settingsRows = await sql`SELECT user_id FROM user_settings WHERE user_id = ${user.id}`
    expect(settingsRows).toHaveLength(0)

    const profileConfigRows =
      await sql`SELECT user_id FROM profile_configurations WHERE user_id = ${user.id}`
    expect(profileConfigRows).toHaveLength(0)

    const dynamicRuleConfigRows =
      await sql`SELECT user_id FROM dynamic_rules_configs WHERE user_id = ${user.id}`
    expect(dynamicRuleConfigRows).toHaveLength(0)

    // 3. Check Redis - Keys and set memberships must be purged
    const cachedSettings = await redis.exists(settingsKey)
    expect(cachedSettings).toBe(0)

    const cachedConfig = await redis.exists(configKey)
    expect(cachedConfig).toBe(0)

    const isMember = await redis.sismember('gitascii:all:users', username)
    expect(isMember).toBe(0)
  })

  it('runs backfill from Redis to PostgreSQL safely', async () => {
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const redis = getProRedisClient()
    await redis.del('gitascii:lock:backfill')

    const { sql } = await import('./client')
    await sql`DELETE FROM system_locks WHERE lock_name = 'migrations_and_backfill'`

    const { runRedisToPostgresBackfill } = await import('./backfill')
    const summary = await runRedisToPostgresBackfill()
    expect(summary.errors).toHaveLength(0)
    expect(summary.usersMigrated).toBeGreaterThanOrEqual(1)

    const user = await getUserByUsername('igorcbraz')
    expect(user).not.toBeNull()
    expect(user?.user.username).toBe('igorcbraz')
  }, 20000)

  it('executes Stripe atomic CTE and rejects duplicate events in a single transaction', async () => {
    const username = `test_stripe_atomic_${Date.now()}`
    const eventId = `evt_atomic_${Date.now()}`
    await ensureUser(username)

    // 1. First event processing with atomic CTE
    const result = await updateEntitlement({
      username,
      planTier: 'pro',
      stripeSubscriptionId: `sub_atomic_${Date.now()}`,
      eventId,
      eventType: 'customer.subscription.updated',
      eventCreatedAt: 1000,
    })
    expect(result.entitlement.plan_tier).toBe('pro')

    // Verify stripe_processed_events recorded
    const { isStripeEventProcessed } = await import('./repositories/userRepository')
    const isRecorded = await isStripeEventProcessed(eventId)
    expect(isRecorded).toBe(true)

    // 2. Duplicate event must be rejected / throw duplicate error
    await expect(
      updateEntitlement({
        username,
        planTier: 'pro',
        stripeSubscriptionId: `sub_atomic_${Date.now()}`,
        eventId,
        eventType: 'customer.subscription.updated',
        eventCreatedAt: 1000,
      })
    ).rejects.toThrow(/already processed/)
  })

  it('prevents older backfill data from overwriting newer PostgreSQL profile configurations', async () => {
    const { saveProfileConfigInDb, getProfileConfigFromDb } =
      await import('./repositories/profileRepository')
    const username = `test_backfill_guard_${Date.now()}`
    await ensureUser(username)

    const now = new Date()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // 1. Newer config saved in PostgreSQL (representing current user edit)
    await saveProfileConfigInDb(
      username,
      'default',
      {
        version: 2,
        widgets: [
          {
            instanceId: 'w-new',
            widgetId: 'test',
            position: { x: 0, y: 0 },
            size: { width: 1, height: 1 },
            locked: false,
            visible: true,
            zIndex: 1,
          },
        ],
      } as any,
      { updatedAt: now.toISOString() }
    )

    // 2. Older config coming from Redis backfill (representing stale cache)
    await saveProfileConfigInDb(
      username,
      'default',
      {
        version: 1,
        widgets: [
          {
            instanceId: 'w-old',
            widgetId: 'test',
            position: { x: 0, y: 0 },
            size: { width: 1, height: 1 },
            locked: false,
            visible: true,
            zIndex: 1,
          },
        ],
      } as any,
      { updatedAt: yesterday.toISOString() }
    )

    // 3. PostgreSQL must have preserved the newer config (w-new), not the older (w-old)
    const current = await getProfileConfigFromDb(username, 'default')
    expect(current).not.toBeNull()
    expect(current?.widgets[0]?.instanceId).toBe('w-new')
  })

  it('flushes analytics in idempotent batches using GREATEST without degrading metrics', async () => {
    const { flushAnalyticsBatchToDb, getUserAnalyticsTotalsFromDb, getDailyAnalyticsFromDb } =
      await import('./repositories/analyticsRepository')
    const username = `test_analytics_flush_${Date.now()}`
    const dateStr = '2026-09-08'
    await ensureUser(username)

    // 1. Initial batch flush: 50 views, 20 uniques
    await flushAnalyticsBatchToDb(username, {
      totalViews: 50,
      totalUniques: 20,
      daily: [{ slug: 'default', dateStr, views: 50, uniques: 20 }],
    })

    let totals = await getUserAnalyticsTotalsFromDb(username)
    let daily = await getDailyAnalyticsFromDb(username, 'default', dateStr)
    expect(totals?.views).toBe(50)
    expect(totals?.uniques).toBe(20)
    expect(daily?.views).toBe(50)
    expect(daily?.uniques).toBe(20)

    // 2. Stale or lower batch flush: 40 views, 15 uniques (e.g. out of order or partial buffer)
    await flushAnalyticsBatchToDb(username, {
      totalViews: 40,
      totalUniques: 15,
      daily: [{ slug: 'default', dateStr, views: 40, uniques: 15 }],
    })

    // Must still retain 50 / 20 because of GREATEST(...)
    totals = await getUserAnalyticsTotalsFromDb(username)
    daily = await getDailyAnalyticsFromDb(username, 'default', dateStr)
    expect(totals?.views).toBe(50)
    expect(totals?.uniques).toBe(20)
    expect(daily?.views).toBe(50)
    expect(daily?.uniques).toBe(20)

    // 3. Higher batch flush: 80 views, 35 uniques
    await flushAnalyticsBatchToDb(username, {
      totalViews: 80,
      totalUniques: 35,
      daily: [{ slug: 'default', dateStr, views: 80, uniques: 35 }],
    })

    totals = await getUserAnalyticsTotalsFromDb(username)
    daily = await getDailyAnalyticsFromDb(username, 'default', dateStr)
    expect(totals?.views).toBe(80)
    expect(totals?.uniques).toBe(35)
    expect(daily?.views).toBe(80)
    expect(daily?.uniques).toBe(35)
  })

  it('handles deleteUser safely and idempotently on empty Redis and repeated execution', async () => {
    const { deleteUser } = await import('./repositories/userRepository')
    const username = `test_delete_idempotent_${Date.now()}`
    await ensureUser(username)

    // First delete on existing user
    const firstResult = await deleteUser(username)
    expect(firstResult).toBe(true)

    // Repeated delete on already-deleted user
    const secondResult = await deleteUser(username)
    expect(secondResult).toBe(true)

    // Delete on completely non-existent user
    const nonExistentResult = await deleteUser(`non_existent_${Date.now()}`)
    expect(nonExistentResult).toBe(true)
  })

  it('enforces optimistic concurrency control (OCC) version checking on profile updates', async () => {
    const { createProfileInDb, updateProfileInDb } =
      await import('./repositories/profileRepository')
    const username = `test_occ_${Date.now()}`
    await ensureUser(username)

    // Create profile with version = 1
    await createProfileInDb(username, {
      id: `prof_occ_${Date.now()}`,
      slug: 'occ-test',
      name: 'OCC Initial',
      description: 'Test',
      status: 'active',
      isDefault: false,
      widgetsCount: 1,
      totalViews: 0,
      versionCount: 1,
      healthStatus: 'operational',
      renderSuccessRate: 100,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      publicUrl: `/${username}/occ-test`,
      rawSvgUrl: `/${username}/occ-test.svg`,
    })

    // Update with matching expectedVersion = 1 -> succeeds, increments version to 2
    const updated = await updateProfileInDb(
      username,
      'occ-test',
      { name: 'OCC Updated Once' },
      1 // expectedVersion
    )
    expect(updated.name).toBe('OCC Updated Once')
    expect(updated.version).toBe(2)

    // Stale concurrent update with expectedVersion = 1 -> MUST throw concurrency conflict!
    await expect(
      updateProfileInDb(
        username,
        'occ-test',
        { name: 'OCC Stale Overwrite' },
        1 // stale expectedVersion
      )
    ).rejects.toThrow(/Optimistic concurrency conflict/)

    // Update with current version = 2 -> succeeds, increments version to 3
    const updatedAgain = await updateProfileInDb(
      username,
      'occ-test',
      { name: 'OCC Updated Twice' },
      2 // expectedVersion
    )
    expect(updatedAgain.name).toBe('OCC Updated Twice')
    expect(updatedAgain.version).toBe(3)
  })

  it('reconciles real Stripe customers and lifetime purchases with PostgreSQL and Redis', async () => {
    const Stripe = (await import('stripe')).default
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
    const redis = getProRedisClient()

    const sessions = await stripe.checkout.sessions.list({ limit: 100 })
    const paidSessions = sessions.data.filter((s) => s.payment_status === 'paid')

    for (const s of paidSessions) {
      const full = await stripe.checkout.sessions.retrieve(s.id, {
        expand: ['line_items', 'payment_intent'],
      })

      const username = (full.metadata?.username || full.client_reference_id || '')
        .toLowerCase()
        .trim()
      const githubId = full.metadata?.githubId ? parseInt(full.metadata.githubId, 10) : undefined
      const email = full.customer_details?.email || full.customer_email || undefined
      const name = full.customer_details?.name || undefined
      const paymentIntentId =
        typeof full.payment_intent === 'string'
          ? full.payment_intent
          : full.payment_intent?.id || undefined
      const priceId = full.line_items?.data?.[0]?.price?.id || undefined

      if (!username) continue

      const user = await ensureUser(username, { githubId, email, name })
      expect(user.username).toBe(username)

      await updateEntitlement({
        username,
        planTier: 'pro',
        stripePaymentIntentId: paymentIntentId,
        stripePriceId: priceId,
        stripeSubscriptionStatus: 'active',
      })

      await redis.sadd('gitascii:pro:customers', username)
      await redis.hset(`gitascii:pro:${username}:settings`, {
        planTier: 'pro',
        stripePaymentIntentId: paymentIntentId || '',
        stripePriceId: priceId || '',
        stripeSubscriptionStatus: 'active',
      })
    }
  })

  it('registers live mode customer Praneshsivasankaran in PostgreSQL and Redis', async () => {
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const redis = getProRedisClient()

    const username = 'praneshsivasankaran'
    const githubId = 147587672
    const name = 'Pranesh S'
    const email = 'praneshsivasankaran@gmail.com'
    const paymentIntentId = 'pi_3UD3RVABH3qRfPhd1jOReyp1'

    const user = await ensureUser(username, { githubId, email, name })
    expect(user.username).toBe(username)

    await updateEntitlement({
      username,
      planTier: 'pro',
      stripePaymentIntentId: paymentIntentId,
      stripeSubscriptionStatus: 'active',
    })

    await redis.sadd('gitascii:pro:customers', username)
    await redis.hset(`gitascii:pro:${username}:settings`, {
      planTier: 'pro',
      stripePaymentIntentId: paymentIntentId,
      stripeSubscriptionStatus: 'active',
      alertEmailAddress: email,
    })
  })
})
