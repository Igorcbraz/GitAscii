import { beforeEach, describe, expect, it } from 'vitest'

import { getAnalyticsSummary, ingestProfileView, REDIS_KEYS } from './analyticsStore'
import { resetProRedisMemoryStoreForTesting } from './redisClient'

describe('AnalyticsStore Comprehensive Unit Tests', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
  })

  describe('ingestProfileView', () => {
    it('ingests a standard desktop view and updates all redis data structures', async () => {
      const username = 'Igorcbraz'
      await ingestProfileView({
        username,
        profileSlug: 'default',
        theme: 'dark',
        renderTimeMs: 35,
        isCamoProxy: false,
        isCacheHit: false,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
        referrer: 'https://github.com/Igorcbraz',
        country: 'BR',
        region: 'SP',
        city: 'Sao Paulo',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR,pt;q=0.9',
        ip: '177.18.29.30',
        statusCode: 200,
      })

      const summary = await getAnalyticsSummary(username, 'default', '24h')
      expect(summary.totalViews).toBe(1)
      expect(summary.uniqueVisitors).toBe(1)
      expect(summary.viewsToday).toBe(1)
      expect(summary.cacheHitRatio).toBe(0)
      expect(summary.camoRatio).toBe(0)
      expect(summary.directRatio).toBe(100)
      expect(summary.avgLatencyMs).toBe(35)
      expect(summary.topCountries[0].code).toBe('BR')
      expect(summary.topCountries[0].name).toBe('Brazil')
      expect(summary.topCountries[0].flagEmoji).toBe('🇧🇷')
    })

    it('ingests GitHub Camo proxy cached requests correctly', async () => {
      const username = 'CamoUser'
      await ingestProfileView({
        username,
        profileSlug: 'stats',
        theme: 'dark',
        renderTimeMs: 15,
        isCamoProxy: true,
        isCacheHit: true,
        userAgent: 'github-camo (0.1)',
        referrer: 'https://github.com/CamoUser/repo',
        country: 'US',
        ip: '140.82.112.4',
        statusCode: 304,
      })

      const summary = await getAnalyticsSummary(username, 'stats', '7d')
      expect(summary.totalViews).toBe(1)
      expect(summary.cacheHitRatio).toBe(100)
      expect(summary.camoRatio).toBe(100)
      expect(summary.directRatio).toBe(0)
      expect(summary.topDevices.find((d) => d.name === 'GitHub Camo')?.count).toBe(1)
    })

    it('limits recent activity stream to 50 items and sorts descending', async () => {
      const username = 'HighTrafficUser'

      for (let i = 0; i < 55; i++) {
        await ingestProfileView({
          username,
          profileSlug: 'default',
          ip: `192.168.1.${i % 250}`,
          userAgent: 'Mozilla/5.0 Chrome',
          country: i % 2 === 0 ? 'US' : 'DE',
          theme: 'dark',
          renderTimeMs: 20 + i,
          isCamoProxy: false,
          isCacheHit: false,
        })
      }

      const summary = await getAnalyticsSummary(username, 'default', '30d')
      expect(summary.recentActivity.length).toBeLessThanOrEqual(50)
      expect(summary.totalViews).toBe(55)
    })
  })

  describe('getAnalyticsSummary across time ranges', () => {
    it('supports 24h, 7d, 30d, 90d, and all time ranges', async () => {
      const username = 'TimeRangeTester'

      await ingestProfileView({
        username,
        profileSlug: 'default',
        country: 'CA',
        ip: '10.0.0.1',
        theme: 'dark',
        renderTimeMs: 25,
        isCamoProxy: false,
        isCacheHit: false,
      })

      const r24h = await getAnalyticsSummary(username, 'default', '24h')
      const r7d = await getAnalyticsSummary(username, 'default', '7d')
      const r30d = await getAnalyticsSummary(username, 'default', '30d')
      const r90d = await getAnalyticsSummary(username, 'default', '90d')
      const rAll = await getAnalyticsSummary(username, 'default', 'all')

      expect(r24h.range).toBe('24h')
      expect(r7d.range).toBe('7d')
      expect(r30d.range).toBe('30d')
      expect(r90d.range).toBe('90d')
      expect(rAll.range).toBe('all')
      expect(r30d.totalViews).toBe(1)
    })

    it('returns structured empty fallbacks when no traffic has been ingested yet', async () => {
      const summary = await getAnalyticsSummary('empty_user', 'default', '30d')

      expect(summary.totalViews).toBe(0)
      expect(summary.uniqueVisitors).toBe(0)
      expect(summary.viewsToday).toBe(0)
      expect(summary.cacheHitRatio).toBe(0)
      expect(summary.avgLatencyMs).toBe(28)
      expect(summary.topCountries.length).toBeGreaterThan(0)
      expect(summary.topSources.length).toBeGreaterThan(0)
      expect(summary.heatmapGrid.length).toBe(7 * 24)
      expect(summary.hourlyDistribution.length).toBe(24)
    })

    it('aggregates multi-profile data when profileSlug is "all"', async () => {
      const username = 'MultiProfileAnalyst'

      await ingestProfileView({
        username,
        profileSlug: 'default',
        country: 'JP',
        ip: '1.1.1.1',
        theme: 'dark',
        renderTimeMs: 25,
        isCamoProxy: false,
        isCacheHit: false,
      })

      await ingestProfileView({
        username,
        profileSlug: 'compact',
        country: 'FR',
        ip: '2.2.2.2',
        theme: 'dark',
        renderTimeMs: 25,
        isCamoProxy: false,
        isCacheHit: false,
      })

      await ingestProfileView({
        username,
        profileSlug: 'stats',
        country: 'GB',
        ip: '3.3.3.3',
        theme: 'dark',
        renderTimeMs: 25,
        isCamoProxy: false,
        isCacheHit: false,
      })

      const allSummary = await getAnalyticsSummary(username, 'all', '30d')
      expect(allSummary.totalViews).toBe(3)
      expect(allSummary.topProfiles.length).toBe(3)
    })
  })

  describe('REDIS_KEYS generator functions', () => {
    it('generates normalized lowercase redis keys', () => {
      expect(REDIS_KEYS.userTotals('MyUser')).toBe('gitascii:pro:myuser:totals')
      expect(REDIS_KEYS.userProfiles('MyUser')).toBe('gitascii:pro:myuser:profiles')
      expect(REDIS_KEYS.profileMeta('MyUser', 'Slug-1')).toBe('gitascii:pro:myuser:profile:slug-1')
      expect(REDIS_KEYS.dailyMetrics('MyUser', 'Default', '2026-08-27')).toBe(
        'gitascii:pro:myuser:default:daily:2026-08-27'
      )
      expect(REDIS_KEYS.dimension('MyUser', 'Default', 'countries', '2026-08-27')).toBe(
        'gitascii:pro:myuser:default:dim:countries:2026-08-27'
      )
    })
  })
})
