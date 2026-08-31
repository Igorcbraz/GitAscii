import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET as getAnalytics } from '@/app/api/pro/analytics/route'
import { POST as postDevToggle } from '@/app/api/pro/dev-toggle/route'
import { GET as getEmails, POST as postEmails } from '@/app/api/pro/emails/route'
import { PATCH as patchError } from '@/app/api/pro/errors/[errorId]/route'
import { GET as getErrors, POST as postErrors } from '@/app/api/pro/errors/route'
import { GET as getOverview } from '@/app/api/pro/overview/route'
import { DELETE as deleteProfile, PATCH as patchProfile } from '@/app/api/pro/profiles/[slug]/route'
import { GET as getProfiles, POST as postProfiles } from '@/app/api/pro/profiles/route'
import { GET as getReports } from '@/app/api/pro/reports/route'
import { ingestProfileView } from '@/features/pro/server/analyticsStore'
import { resetProRedisMemoryStoreForTesting } from '@/features/pro/server/redisClient'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}))

import { getSession } from '@/lib/auth'

const mockedGetSession = vi.mocked(getSession)

describe('Pro API Route Handlers Test Suite', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
    vi.clearAllMocks()
  })

  describe('Authentication enforcement', () => {
    it('returns 401 Unauthorized for unauthenticated requests on all endpoints', async () => {
      mockedGetSession.mockResolvedValue(null)

      const overviewRes = await getOverview()
      expect(overviewRes.status).toBe(401)

      const analyticsReq = new Request('http://localhost:3000/api/pro/analytics')
      const analyticsRes = await getAnalytics(analyticsReq)
      expect(analyticsRes.status).toBe(401)

      const reportsReq = new Request('http://localhost:3000/api/pro/reports')
      const reportsRes = await getReports(reportsReq)
      expect(reportsRes.status).toBe(401)

      const errorsRes = await getErrors()
      expect(errorsRes.status).toBe(401)

      const emailsRes = await getEmails()
      expect(emailsRes.status).toBe(401)

      const profilesRes = await getProfiles()
      expect(profilesRes.status).toBe(401)
    })
  })

  describe('GET /api/pro/overview', () => {
    it('returns structured overview data for authenticated user', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'ProTester',
        githubId: 12345,
        email: 'pro@test.com',
      } as any)

      await ingestProfileView({
        username: 'ProTester',
        profileSlug: 'default',
        country: 'US',
        ip: '1.2.3.4',
        theme: 'dark',
        renderTimeMs: 25,
        isCamoProxy: false,
        isCacheHit: false,
      })

      const res = await getOverview()
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.totalViews).toBe(1)
      expect(data.activeProfilesCount).toBeGreaterThanOrEqual(1)
      expect(data.recentViewsChart).toBeDefined()
    })
  })

  describe('GET /api/pro/analytics', () => {
    it('returns analytics summary and supports CSV export format', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'AnalystUser',
        githubId: 999,
      } as any)

      await ingestProfileView({
        username: 'AnalystUser',
        profileSlug: 'default',
        country: 'DE',
        ip: '5.6.7.8',
        theme: 'dark',
        renderTimeMs: 25,
        isCamoProxy: false,
        isCacheHit: false,
      })

      const jsonReq = new Request('http://localhost:3000/api/pro/analytics?range=7d')
      const jsonRes = await getAnalytics(jsonReq)
      expect(jsonRes.status).toBe(200)
      const data = await jsonRes.json()
      expect(data.range).toBe('7d')
      expect(data.totalViews).toBe(1)

      const csvReq = new Request('http://localhost:3000/api/pro/analytics?range=30d&export=csv')
      const csvRes = await getAnalytics(csvReq)
      expect(csvRes.status).toBe(200)
      expect(csvRes.headers.get('Content-Type')).toContain('text/csv')
      const csvText = await csvRes.text()
      expect(csvText).toContain('Date,Views,Uniques')
    })
  })

  describe('GET /api/pro/reports', () => {
    it('returns full performance report for current period', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'ReportUser',
        githubId: 888,
      } as any)

      const req = new Request('http://localhost:3000/api/pro/reports?range=30d')
      const res = await getReports(req)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.period).toBe('30d')
      expect(data.generatedAt).toBeDefined()
    })
  })

  describe('/api/pro/errors and /api/pro/errors/[errorId]', () => {
    it('lists, simulates, resolves, and clears widget errors', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'ErrorDev',
        githubId: 777,
      } as any)

      const simReq = new Request('http://localhost:3000/api/pro/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          widgetId: 'stats',
          widgetName: 'Stats Widget',
        }),
      })
      const simRes = await postErrors(simReq)
      expect(simRes.status).toBe(200)

      const listRes = await getErrors()
      const listData = await listRes.json()
      expect(listData.errors.length).toBe(1)
      const errorId = listData.errors[0].id

      const patchReq = new Request(`http://localhost:3000/api/pro/errors/${errorId}`, {
        method: 'PATCH',
      })
      const patchRes = await patchError(patchReq, { params: Promise.resolve({ errorId }) })
      expect(patchRes.status).toBe(200)

      const clearReq = new Request('http://localhost:3000/api/pro/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_all' }),
      })
      const clearRes = await postErrors(clearReq)
      expect(clearRes.status).toBe(200)
    })
  })

  describe('/api/pro/profiles and /api/pro/profiles/[slug]', () => {
    it('manages profile creation, updating, and deletion', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'ProfileMaster',
        githubId: 555,
      } as any)

      const { updateUserSettings } = await import('@/features/pro/server/entitlements')
      await updateUserSettings('ProfileMaster', { planTier: 'pro' })

      const listRes = await getProfiles()
      const listData = await listRes.json()
      expect(listData.profiles.length).toBe(1)

      const createReq = new Request('http://localhost:3000/api/pro/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'job-resume',
          name: 'Job Resume Profile',
          description: 'Custom tailored view',
        }),
      })
      const createRes = await postProfiles(createReq)
      expect(createRes.status).toBe(201)

      const patchReq = new Request('http://localhost:3000/api/pro/profiles/job-resume', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Job Resume Profile v2' }),
      })
      const patchRes = await patchProfile(patchReq, {
        params: Promise.resolve({ slug: 'job-resume' }),
      })
      expect(patchRes.status).toBe(200)

      const delReq = new Request('http://localhost:3000/api/pro/profiles/job-resume', {
        method: 'DELETE',
      })
      const delRes = await deleteProfile(delReq, {
        params: Promise.resolve({ slug: 'job-resume' }),
      })
      expect(delRes.status).toBe(200)
    })
  })

  describe('/api/pro/emails and test digest triggers', () => {
    it('lists email logs and allows triggering test digest', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'EmailAdmin',
        githubId: 444,
        email: 'admin@test.com',
      } as any)

      const getRes = await getEmails()
      expect(getRes.status).toBe(200)
      const getData = await getRes.json()
      expect(getData.canSendTest).toBe(true)

      const postReq = new Request('http://localhost:3000/api/pro/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: 'ProDigestEmail',
          subject: 'Test Pro Digest',
        }),
      })
      const postRes = await postEmails(postReq)
      expect(postRes.status).toBe(200)
      const postData = await postRes.json()
      expect(postData.success).toBe(true)
    })
  })

  describe('/api/pro/dev-toggle', () => {
    it('toggles pro tier in dev environment', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'DevUser',
        githubId: 333,
      } as any)

      const toggleReq = new Request('http://localhost:3000/api/pro/dev-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'pro' }),
      })
      const toggleRes = await postDevToggle(toggleReq)
      expect(toggleRes.status).toBe(200)
      const data = await toggleRes.json()
      expect(data.tier).toBe('pro')
    })
  })

  describe('Multi-profile enhancements: Duplicate, Default, Versions', () => {
    it('duplicates, sets default, and creates/restores versions', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'MultiTester',
        githubId: 101,
      } as any)

      const { POST: postDuplicate } = await import('@/app/api/pro/profiles/[slug]/duplicate/route')
      const { POST: postDefault } = await import('@/app/api/pro/profiles/[slug]/default/route')
      const { GET: getVersions, POST: postVersion } =
        await import('@/app/api/pro/profiles/[slug]/versions/route')
      const { POST: restoreVersion } =
        await import('@/app/api/pro/profiles/[slug]/versions/[versionId]/restore/route')

      // 1. Duplicate default profile
      const dupReq = new Request('http://localhost:3000/api/pro/profiles/default/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSlug: 'resume',
          name: 'Resume Profile',
          description: 'Cloned from default',
        }),
      })
      const dupRes = await postDuplicate(dupReq, {
        params: Promise.resolve({ slug: 'default' }),
      })
      expect(dupRes.status).toBe(201)

      // 2. Set 'resume' as default
      const defReq = new Request('http://localhost:3000/api/pro/profiles/resume/default', {
        method: 'POST',
      })
      const defRes = await postDefault(defReq, {
        params: Promise.resolve({ slug: 'resume' }),
      })
      expect(defRes.status).toBe(200)

      // 3. Create version checkpoint
      const verReq = new Request('http://localhost:3000/api/pro/profiles/resume/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: 'Checkpoint v1',
          description: 'First version',
          config: {
            id: 'c1',
            userId: '101',
            username: 'MultiTester',
            slug: 'resume',
            name: 'Resume Profile',
            widgets: [],
            theme: 'dark',
            layout: 'freeform',
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
      const verRes = await postVersion(verReq, {
        params: Promise.resolve({ slug: 'resume' }),
      })
      expect(verRes.status).toBe(201)
      const verData = await verRes.json()

      // 4. List versions
      const listReq = new Request('http://localhost:3000/api/pro/profiles/resume/versions')
      const listRes = await getVersions(listReq, {
        params: Promise.resolve({ slug: 'resume' }),
      })
      expect(listRes.status).toBe(200)

      // 5. Restore version
      const restReq = new Request(
        'http://localhost:3000/api/pro/profiles/resume/versions/restore',
        {
          method: 'POST',
        }
      )
      const restRes = await restoreVersion(restReq, {
        params: Promise.resolve({ slug: 'resume', versionId: verData.version.id }),
      })
      expect(restRes.status).toBe(200)
    })
  })

  describe('Dynamic Profiles API routes', () => {
    it('manages dynamic rules and preview simulator', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'DynamicTester',
        githubId: 202,
      } as any)

      const {
        GET: getDynRules,
        POST: postDynRule,
        PUT: putDynConfig,
      } = await import('@/app/api/pro/dynamic-rules/route')
      const { PATCH: patchDynRule, DELETE: deleteDynRule } =
        await import('@/app/api/pro/dynamic-rules/[ruleId]/route')
      const { POST: postDynPreview } = await import('@/app/api/pro/dynamic-rules/preview/route')

      // GET initial
      const initialRes = await getDynRules()
      expect(initialRes.status).toBe(200)

      // POST create rule
      const createReq = new Request('http://localhost:3000/api/pro/dynamic-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Work Hours',
          targetProfileSlug: 'work',
          priority: 70,
          type: 'work_hours',
          startTime: '09:00',
          endTime: '18:00',
          daysOfWeek: [1, 2, 3, 4, 5],
        }),
      })
      const createRes = await postDynRule(createReq)
      expect(createRes.status).toBe(201)
      const { rule } = await createRes.json()

      // PUT enable config
      const putReq = new Request('http://localhost:3000/api/pro/dynamic-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      })
      const putRes = await putDynConfig(putReq)
      expect(putRes.status).toBe(200)

      // POST preview simulation
      const previewReq = new Request('http://localhost:3000/api/pro/dynamic-rules/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulatedDate: '2026-09-01T14:00:00',
          simulatedTimezone: 'UTC',
        }),
      })
      const previewRes = await postDynPreview(previewReq)
      expect(previewRes.status).toBe(200)
      const previewData = await previewRes.json()
      expect(previewData.selectedProfileSlug).toBe('work')

      // PATCH rule
      const patchReq = new Request(`http://localhost:3000/api/pro/dynamic-rules/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: 80 }),
      })
      const patchRes = await patchDynRule(patchReq, {
        params: Promise.resolve({ ruleId: rule.id }),
      })
      expect(patchRes.status).toBe(200)

      // DELETE rule
      const delReq = new Request(`http://localhost:3000/api/pro/dynamic-rules/${rule.id}`, {
        method: 'DELETE',
      })
      const delRes = await deleteDynRule(delReq, {
        params: Promise.resolve({ ruleId: rule.id }),
      })
      expect(delRes.status).toBe(200)
    })
  })

  describe('GitAscii Health API routes', () => {
    it('returns overall health, widget breakdown, history, and simulation', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'HealthTester',
        githubId: 303,
      } as any)

      const { GET: getHealth } = await import('@/app/api/pro/health/route')
      const { GET: getHealthWidgets } = await import('@/app/api/pro/health/widgets/route')
      const { GET: getHealthHistory } = await import('@/app/api/pro/health/history/route')
      const { POST: postHealthSimulate } = await import('@/app/api/pro/health/simulate/route')

      // GET health
      const healthRes = await getHealth()
      expect(healthRes.status).toBe(200)
      const healthData = await healthRes.json()
      expect(healthData.status).toBe('operational')

      // GET widgets
      const widgetsReq = new Request('http://localhost:3000/api/pro/health/widgets')
      const widgetsRes = await getHealthWidgets(widgetsReq)
      expect(widgetsRes.status).toBe(200)

      // GET history
      const historyReq = new Request('http://localhost:3000/api/pro/health/history?days=30')
      const historyRes = await getHealthHistory(historyReq)
      expect(historyRes.status).toBe(200)

      // POST simulate
      const simReq = new Request('http://localhost:3000/api/pro/health/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: 'stats',
          widgetName: 'Stats Cards',
          errorType: 'FETCH_TIMEOUT',
          message: 'Timeout during render',
        }),
      })
      const simRes = await postHealthSimulate(simReq)
      expect(simRes.status).toBe(200)

      // Test README as a Service (RaaS) Health Badge SVG endpoint
      const { GET: getHealthBadge } = await import('@/app/api/[username]/health-badge/route')
      const badgeReq = new Request('http://localhost:3000/api/HealthTester/health-badge')
      const badgeRes = await getHealthBadge(badgeReq, {
        params: Promise.resolve({ username: 'HealthTester' }),
      })
      expect(badgeRes.status).toBe(200)
      expect(badgeRes.headers.get('Content-Type')).toContain('image/svg+xml')
      const svgText = await badgeRes.text()
      expect(svgText).toContain('GitAscii Health')
    })
  })

  describe('POST /api/pro/subscribe', () => {
    it('creates checkout session with allow_promotion_codes enabled for vouchers', async () => {
      mockedGetSession.mockResolvedValue({
        username: 'VoucherUser',
        githubId: 9876,
        email: 'voucher@test.com',
      } as any)

      const createSessionSpy = vi.fn().mockResolvedValue({
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      })

      vi.doMock('stripe', () => {
        return {
          default: vi.fn().mockImplementation(function () {
            return {
              checkout: {
                sessions: {
                  create: createSessionSpy,
                },
              },
            }
          }),
        }
      })

      const prevSecret = process.env.STRIPE_SECRET_KEY
      const prevPrice = process.env.STRIPE_PRICE_ID
      process.env.STRIPE_SECRET_KEY = 'sk_test_12345'
      process.env.STRIPE_PRICE_ID = 'price_12345'

      try {
        const { POST: postSubscribe } = await import('@/app/api/pro/subscribe/route')
        const res = await postSubscribe()
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.checkoutUrl).toBe('https://checkout.stripe.com/c/pay/cs_test_123')
        expect(createSessionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            allow_promotion_codes: true,
            customer_email: 'voucher@test.com',
            client_reference_id: 'voucheruser',
          })
        )
      } finally {
        process.env.STRIPE_SECRET_KEY = prevSecret
        process.env.STRIPE_PRICE_ID = prevPrice
        vi.doUnmock('stripe')
      }
    })
  })
})
