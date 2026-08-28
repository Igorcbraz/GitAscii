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
})
