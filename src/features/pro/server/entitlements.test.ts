import { beforeEach, describe, expect, it } from 'vitest'

import {
  getProEntitlements,
  getUserByStripeCustomer,
  getUserSettings,
  isProUser,
  updateUserSettings,
} from './entitlements'
import { resetProRedisMemoryStoreForTesting } from './redisClient'

describe('Entitlements Comprehensive Unit Tests', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
  })

  it('correctly provides default free entitlements for unconfigured users', async () => {
    const entitlements = await getProEntitlements('regular_coder')
    expect(entitlements.tier).toBe('free')
    expect(entitlements.maxProfiles).toBe(1)
    expect(entitlements.analyticsRetentionDays).toBe(7)
    expect(entitlements.widgetErrorAlertsEnabled).toBe(false)
    expect(entitlements.customDomainEnabled).toBe(false)
    expect(entitlements.monthlyEmailQuota).toBe(0)

    const isPro = await isProUser('regular_coder')
    expect(isPro).toBe(false)
  })

  it('grants pro privileges via PRO_ADMIN_USERS env variable', async () => {
    const prevEnv = process.env.PRO_ADMIN_USERS
    process.env.PRO_ADMIN_USERS = 'superadmin,devlead'

    try {
      const entitlements = await getProEntitlements('superadmin')
      expect(entitlements.tier).toBe('pro')
      expect(entitlements.maxProfiles).toBe(10)
      expect(entitlements.analyticsRetentionDays).toBe(90)
      expect(entitlements.widgetErrorAlertsEnabled).toBe(true)

      const isPro = await isProUser('superadmin')
      expect(isPro).toBe(true)
    } finally {
      process.env.PRO_ADMIN_USERS = prevEnv
    }
  })

  it('updates and persists user settings properly', async () => {
    const username = 'SettingsUser'

    const initial = await getUserSettings(username)
    expect(initial.planTier).toBe('free')
    expect(initial.themePreference).toBe('system')

    const updated = await updateUserSettings(username, {
      planTier: 'pro',
      emailAlertsEnabled: false,
      alertEmailAddress: 'alerts@domain.com',
      dailyDigestEnabled: true,
      themePreference: 'dark',
    })

    expect(updated.planTier).toBe('pro')
    expect(updated.emailAlertsEnabled).toBe(false)
    expect(updated.alertEmailAddress).toBe('alerts@domain.com')
    expect(updated.dailyDigestEnabled).toBe(true)
    expect(updated.themePreference).toBe('dark')

    const proStatus = await isProUser(username)
    expect(proStatus).toBe(true)
  })

  it('persists and looks up users by Stripe customer id', async () => {
    const username = 'stripe_customer_user'
    const customerId = 'cus_test_99998888'

    await updateUserSettings(username, {
      planTier: 'pro',
      stripeCustomerId: customerId,
      stripeSubscriptionId: 'sub_12345',
      stripeSubscriptionStatus: 'active',
    })

    const foundUser = await getUserByStripeCustomer(customerId)
    expect(foundUser).toBe(username.toLowerCase())

    const settings = await getUserSettings(username)
    expect(settings.stripeCustomerId).toBe(customerId)
    expect(settings.stripeSubscriptionId).toBe('sub_12345')
    expect(settings.stripeSubscriptionStatus).toBe('active')
  })

  it('correctly handles subscription lifecycle (downgrade on cancellation and active renewal)', async () => {
    const username = 'subscription_lifecycle_user'
    const customerId = 'cus_sub_lifecycle_123'

    await updateUserSettings(username, {
      planTier: 'pro',
      stripeCustomerId: customerId,
      stripeSubscriptionId: 'sub_active_123',
      stripeSubscriptionStatus: 'active',
    })
    expect(await isProUser(username)).toBe(true)

    await updateUserSettings(username, {
      planTier: 'free',
      stripeSubscriptionStatus: 'canceled',
    })
    expect(await isProUser(username)).toBe(false)
    const afterCancel = await getUserSettings(username)
    expect(afterCancel.planTier).toBe('free')
    expect(afterCancel.stripeSubscriptionStatus).toBe('canceled')

    await updateUserSettings(username, {
      planTier: 'pro',
      stripeSubscriptionStatus: 'active',
    })
    expect(await isProUser(username)).toBe(true)
  })
})
