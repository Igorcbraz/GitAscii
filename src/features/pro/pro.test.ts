import { beforeEach, describe, expect, it } from 'vitest'

import { getAnalyticsSummary, ingestProfileView } from './server/analyticsStore'
import {
  canSendTestDigest,
  getProEmailLogs,
  logSentEmail,
  recordTestDigestSent,
} from './server/emailLogStore'
import { getProEntitlements, getUserSettings, updateUserSettings } from './server/entitlements'
import {
  clearAllWidgetErrors,
  getWidgetErrors,
  recordWidgetError,
  resolveWidgetError,
} from './server/errorTrackerStore'
import {
  generateAnonymizedVisitorId,
  parseBrowser,
  parseDeviceType,
  parseOperatingSystem,
  sanitizeCountryCode,
  sanitizeReferrer,
} from './server/privacy'
import {
  createProfile,
  deleteProfile,
  getUserProfiles,
  updateProfile,
} from './server/profileManagerStore'
import { resetProRedisMemoryStoreForTesting } from './server/redisClient'

describe('GitAscii Pro Ecosystem Test Suite', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
  })

  describe('Privacy & LGPD Anonymization', () => {
    it('generates deterministic daily pseudonymized visitor hash with salt rotation', () => {
      const day1HashA = generateAnonymizedVisitorId(
        '192.168.1.1',
        'Mozilla/5.0 Chrome',
        '2026-08-27'
      )
      const day1HashB = generateAnonymizedVisitorId(
        '192.168.1.1',
        'Mozilla/5.0 Chrome',
        '2026-08-27'
      )
      const day2Hash = generateAnonymizedVisitorId(
        '192.168.1.1',
        'Mozilla/5.0 Chrome',
        '2026-08-28'
      )

      expect(day1HashA).toBe(day1HashB)
      expect(day1HashA).not.toBe(day2Hash)
      expect(day1HashA).not.toContain('192.168.1.1')
    })

    it('sanitizes referrers, removing queries and PII', () => {
      expect(sanitizeReferrer('https://github.com/torvalds/linux?token=secret#top')).toBe('GitHub')
      expect(sanitizeReferrer('https://www.google.com/search?q=gitascii')).toBe('Google Search')
      expect(sanitizeReferrer('https://t.co/xyz123')).toBe('X / Twitter')
      expect(sanitizeReferrer(null)).toBe('Direct / No Referrer')
      expect(sanitizeReferrer(null, true)).toBe('GitHub README (Camo Proxy)')
    })

    it('classifies browser, device, and operating system without invasive fingerprinting', () => {
      const macChromeUa =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      expect(parseOperatingSystem(macChromeUa, false)).toBe('macOS')
      expect(parseBrowser(macChromeUa, false)).toBe('Chrome')
      expect(parseDeviceType(macChromeUa, false)).toBe('Desktop')

      const camoProxyUa = 'github-camo (0.1)'
      expect(parseDeviceType(camoProxyUa, true)).toBe('GitHub Camo Proxy')
      expect(parseBrowser(camoProxyUa, true)).toBe('GitHub Image Proxy')
    })

    it('sanitizes country codes to ISO 3166 alpha-2 format', () => {
      expect(sanitizeCountryCode('BR')).toBe('BR')
      expect(sanitizeCountryCode('us')).toBe('US')
      expect(sanitizeCountryCode('INVALID123')).toBe('IN')
      expect(sanitizeCountryCode(null)).toBe('XX')
    })

    it('parses language and traffic delivery types correctly', async () => {
      const { parseLanguage, parseTrafficType } = await import('./server/privacy')
      expect(parseLanguage('pt-BR,pt;q=0.9,en-US;q=0.8')).toBe('pt')
      expect(parseLanguage('en-US,en;q=0.9')).toBe('en')
      expect(parseLanguage(null)).toBe('en')

      expect(parseTrafficType('github-camo (0.1)', true)).toBe('camo')
      expect(parseTrafficType('Mozilla/5.0 Chrome', false, 'https://github.com/user')).toBe(
        'direct'
      )
      expect(parseTrafficType('Googlebot/2.1', false)).toBe('bot')
      expect(parseTrafficType('Mozilla/5.0', false, 'https://gitascii.com/editor')).toBe('app')
    })

    it('maps country codes to names, continents and flag emojis', async () => {
      const { getCountryName, getCountryContinent, getCountryFlagEmoji } =
        await import('./server/geoData')
      expect(getCountryName('US')).toBe('United States')
      expect(getCountryName('BR')).toBe('Brazil')
      expect(getCountryContinent('DE').name).toBe('Europe')
      expect(getCountryContinent('JP').name).toBe('Asia')
      expect(getCountryFlagEmoji('US')).toBe('🇺🇸')
      expect(getCountryFlagEmoji('BR')).toBe('🇧🇷')
    })
  })

  describe('Analytics Ingestion & Multi-Dimensional Summaries', () => {
    it('ingests profile views and computes comprehensive multi-dimensional metrics', async () => {
      const username = 'testuser'

      await ingestProfileView({
        username,
        profileSlug: 'default',
        theme: 'dark',
        renderTimeMs: 45,
        isCamoProxy: false,
        isCacheHit: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0',
        referrer: 'https://github.com/testuser',
        country: 'US',
        region: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        language: 'en-US,en;q=0.9',
        ip: '10.0.0.1',
        statusCode: 200,
      })

      await ingestProfileView({
        username,
        profileSlug: 'default',
        theme: 'dark',
        renderTimeMs: 30,
        isCamoProxy: true,
        isCacheHit: true,
        userAgent: 'github-camo (0.1)',
        referrer: 'https://github.com/testuser',
        country: 'BR',
        region: 'SP',
        city: 'Sao Paulo',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR,pt;q=0.9',
        ip: '10.0.0.2',
        statusCode: 304,
      })

      const summary = await getAnalyticsSummary(username, 'default', '30d', true)

      expect(summary.totalViews).toBe(2)
      expect(summary.uniqueVisitors).toBeGreaterThanOrEqual(1)
      expect(summary.cacheHitRatio).toBe(50)
      expect(summary.camoRatio).toBe(50)
      expect(summary.directRatio).toBe(50)
      expect(summary.avgLatencyMs).toBeGreaterThan(0)
      expect(summary.topCountries.length).toBeGreaterThan(0)
      expect(summary.topSources.length).toBeGreaterThan(0)
      expect(summary.heatmapGrid.length).toBe(7 * 24)
      expect(summary.recentActivity.length).toBe(2)
      expect(summary.recentActivity[0].flagEmoji).toBeDefined()
    })

    it('aggregates across all profiles when profileSlug is "all"', async () => {
      const username = 'multi_prof_user'

      await ingestProfileView({
        username,
        profileSlug: 'default',
        theme: 'dark',
        renderTimeMs: 20,
        isCamoProxy: false,
        isCacheHit: false,
        country: 'US',
        ip: '1.1.1.1',
      })

      await ingestProfileView({
        username,
        profileSlug: 'compact',
        theme: 'light',
        renderTimeMs: 25,
        isCamoProxy: false,
        isCacheHit: false,
        country: 'DE',
        ip: '2.2.2.2',
      })

      const allSummary = await getAnalyticsSummary(username, 'all', '30d')
      expect(allSummary.totalViews).toBe(2)

      const compactSummary = await getAnalyticsSummary(username, 'compact', '30d')
      expect(compactSummary.totalViews).toBe(1)
    })
  })

  describe('Widget Error Tracker & Cooldown', () => {
    it('records widget failures and deduplicates alerts with cooldown', async () => {
      const username = 'erroruser'

      await recordWidgetError({
        username,
        profileSlug: 'default',
        widgetId: 'streak-stats',
        widgetName: 'GitHub Streak Stats',
        errorType: 'FETCH_TIMEOUT',
        message: 'Upstream streak server timed out',
      })

      await recordWidgetError({
        username,
        profileSlug: 'default',
        widgetId: 'streak-stats',
        widgetName: 'GitHub Streak Stats',
        errorType: 'FETCH_TIMEOUT',
        message: 'Upstream streak server timed out again',
      })

      const errors = await getWidgetErrors(username)
      expect(errors.length).toBe(1)
      expect(errors[0].occurrences).toBe(2)
      expect(errors[0].status).toBe('active')

      const resolved = await resolveWidgetError(username, errors[0].id)
      expect(resolved).toBe(true)

      const updatedErrors = await getWidgetErrors(username)
      expect(updatedErrors[0].status).toBe('resolved')

      await clearAllWidgetErrors(username)
      const emptyErrors = await getWidgetErrors(username)
      expect(emptyErrors.length).toBe(0)
    })
  })

  describe('Email Notification Logger & 90-Day Test Quota', () => {
    it('logs sent emails in user audit trail', async () => {
      const username = 'emailuser'

      await logSentEmail({
        username,
        recipientEmail: 'user@example.com',
        templateName: 'WelcomeEmail',
        subject: 'Welcome to GitAscii Pro',
        reason: 'User onboarded to Pro',
        status: 'sent',
      })

      const logs = await getProEmailLogs(username)
      expect(logs.length).toBe(1)
      expect(logs[0].subject).toBe('Welcome to GitAscii Pro')
      expect(logs[0].status).toBe('sent')
    })

    it('enforces 3 test digests per 90-day window quota', async () => {
      const username = 'digest_quota_user'

      expect(await canSendTestDigest(username)).toBe(true)

      await logSentEmail({
        username,
        recipientEmail: 'digest@example.com',
        templateName: 'ProDigestEmail',
        subject: '⚡ GitAscii Pro Weekly Traffic & Growth Digest (1)',
        reason: 'Weekly profile telemetry digest dispatched to account',
        status: 'sent',
      })
      await recordTestDigestSent(username)
      expect(await canSendTestDigest(username)).toBe(true)

      await logSentEmail({
        username,
        recipientEmail: 'digest@example.com',
        templateName: 'ProDigestEmail',
        subject: '⚡ GitAscii Pro Weekly Traffic & Growth Digest (2)',
        reason: 'Weekly profile telemetry digest dispatched to account',
        status: 'sent',
      })
      await recordTestDigestSent(username)
      expect(await canSendTestDigest(username)).toBe(true)

      await logSentEmail({
        username,
        recipientEmail: 'digest@example.com',
        templateName: 'ProDigestEmail',
        subject: '⚡ GitAscii Pro Weekly Traffic & Growth Digest (3)',
        reason: 'Weekly profile telemetry digest dispatched to account',
        status: 'sent',
      })
      await recordTestDigestSent(username)

      expect(await canSendTestDigest(username)).toBe(false)
    })
  })

  describe('Multi-Profile Management', () => {
    it('manages multiple profiles, enforces unique slugs and default profile constraints', async () => {
      const username = 'profileuser'

      const initialProfiles = await getUserProfiles(username)
      expect(initialProfiles.length).toBe(1)
      expect(initialProfiles[0].slug).toBe('default')
      expect(initialProfiles[0].isDefault).toBe(true)

      const newProfile = await createProfile(username, {
        slug: 'minimal',
        name: 'Minimal Dark',
        description: 'Compact README profile',
      })
      expect(newProfile.slug).toBe('minimal')
      expect(newProfile.name).toBe('Minimal Dark')

      const updatedProfiles = await getUserProfiles(username)
      expect(updatedProfiles.length).toBe(2)

      const edited = await updateProfile(username, 'minimal', {
        name: 'Minimal Clean v2',
        status: 'draft',
      })
      expect(edited?.name).toBe('Minimal Clean v2')
      expect(edited?.status).toBe('draft')

      const deleted = await deleteProfile(username, 'minimal')
      expect(deleted).toBe(true)

      const afterDelete = await getUserProfiles(username)
      expect(afterDelete.length).toBe(1)

      await expect(deleteProfile(username, 'default')).rejects.toThrow(
        'The default profile cannot be deleted.'
      )
    })
  })

  describe('Entitlements & Settings', () => {
    it('returns Pro entitlements and manages user settings', async () => {
      const defaultEntitlements = await getProEntitlements('new_user')
      expect(defaultEntitlements.tier).toBe('free')
      expect(defaultEntitlements.widgetErrorAlertsEnabled).toBe(false)

      await updateUserSettings('pro_user', { planTier: 'pro' })
      const entitlements = await getProEntitlements('pro_user')
      expect(entitlements.tier).toBe('pro')
      expect(entitlements.maxProfiles).toBe(10)
      expect(entitlements.analyticsRetentionDays).toBe(90)
      expect(entitlements.widgetErrorAlertsEnabled).toBe(true)

      const settings = await getUserSettings('pro_user')
      expect(settings.emailAlertsEnabled).toBe(true)

      const updatedSettings = await updateUserSettings('pro_user', {
        dailyDigestEnabled: true,
        themePreference: 'dark',
      })
      expect(updatedSettings.dailyDigestEnabled).toBe(true)
      expect(updatedSettings.themePreference).toBe('dark')
    })

    it('enforces free tier limitations for error alerts', async () => {
      await updateUserSettings('free_tier_user', { planTier: 'free' })
      const entitlements = await getProEntitlements('free_tier_user')
      expect(entitlements.tier).toBe('free')
      expect(entitlements.widgetErrorAlertsEnabled).toBe(false)
      expect(entitlements.maxProfiles).toBe(1)

      await recordWidgetError({
        username: 'free_tier_user',
        profileSlug: 'default',
        widgetId: 'stats',
        widgetName: 'Stats Card',
        errorType: 'FETCH_TIMEOUT',
        message: 'Timeout fetching data',
      })

      const emailLogs = await getProEmailLogs('free_tier_user')
      expect(emailLogs.filter((e) => e.templateName === 'WidgetErrorAlertEmail').length).toBe(0)
    })

    it('grants Pro tier automatically via PRO_USERNAMES env variable allowlist', async () => {
      const prevEnv = process.env.PRO_USERNAMES
      process.env.PRO_USERNAMES = 'env_admin,sponsor_vip'

      try {
        const entitlements = await getProEntitlements('sponsor_vip')
        expect(entitlements.tier).toBe('pro')
        expect(entitlements.widgetErrorAlertsEnabled).toBe(true)

        const settings = await getUserSettings('sponsor_vip')
        expect(settings.planTier).toBe('pro')

        const normalUser = await getProEntitlements('random_stranger')
        expect(normalUser.tier).toBe('free')
      } finally {
        process.env.PRO_USERNAMES = prevEnv
      }
    })
  })
})
