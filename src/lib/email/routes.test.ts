import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { POST as reengagementPost } from '@/app/api/email/reengagement/route'
import { POST as requestStarPost } from '@/app/api/email/request-star/route'
import { GET as unsubscribeGet, POST as unsubscribePost } from '@/app/api/email/unsubscribe/route'

import { isSuppressed, resetLedgerForTesting } from './ledger'
import { createUnsubscribeToken } from './tokens'

describe('Email API Endpoints Suite', () => {
  const originalEnv = process.env

  beforeEach(() => {
    resetLedgerForTesting()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('GET /api/email/unsubscribe', () => {
    it('redirects to unsubscribe success page on valid token and suppresses email', async () => {
      const email = 'developer@example.com'
      const username = 'octocat'
      const token = createUnsubscribeToken(email, username)

      const request = new Request(
        `https://gitascii.com/api/email/unsubscribe?token=${encodeURIComponent(token)}`
      )
      const response = await unsubscribeGet(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/unsubscribe?status=success')
      expect(location).toContain('email=developer%40example.com')
      expect(location).toContain('username=octocat')
      expect(isSuppressed(email)).toBe(true)
    })

    it('redirects to invalid status when token parameter is missing', async () => {
      const request = new Request('https://gitascii.com/api/email/unsubscribe')
      const response = await unsubscribeGet(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/unsubscribe?status=invalid')
    })

    it('redirects to invalid status when token is tampered or malformed', async () => {
      const request = new Request(
        'https://gitascii.com/api/email/unsubscribe?token=malformed_token'
      )
      const response = await unsubscribeGet(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/unsubscribe?status=invalid')
    })
  })

  describe('POST /api/email/unsubscribe (RFC 8058 One-Click)', () => {
    it('successfully processes valid token and records suppression', async () => {
      const email = 'oneclick@example.com'
      const username = 'oneclickuser'
      const token = createUnsubscribeToken(email, username)

      const request = new Request(
        `https://gitascii.com/api/email/unsubscribe?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'List-Unsubscribe=One-Click',
        }
      )

      const response = await unsubscribePost(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.email).toBe(email)
      expect(isSuppressed(email)).toBe(true)
    })

    it('returns 400 when token query parameter is missing', async () => {
      const request = new Request('https://gitascii.com/api/email/unsubscribe', {
        method: 'POST',
      })

      const response = await unsubscribePost(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Missing unsubscribe token')
    })

    it('returns 400 when token is invalid or expired', async () => {
      const request = new Request(
        'https://gitascii.com/api/email/unsubscribe?token=invalid.signature',
        { method: 'POST' }
      )

      const response = await unsubscribePost(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid or expired token')
    })
  })

  describe('POST /api/email/reengagement', () => {
    it('enforces authorization header when CRON_SECRET is configured', async () => {
      process.env.CRON_SECRET = 'super_secret_cron_key'

      const unauthorizedRequest = new Request('https://gitascii.com/api/email/reengagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer wrong_token',
        },
        body: JSON.stringify({ users: [{ username: 'dev', email: 'dev@test.com' }] }),
      })

      const resUnauthorized = await reengagementPost(unauthorizedRequest)
      expect(resUnauthorized.status).toBe(401)

      const authorizedRequest = new Request('https://gitascii.com/api/email/reengagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer super_secret_cron_key',
        },
        body: JSON.stringify({ users: [{ username: 'dev', email: 'dev@test.com' }] }),
      })

      const resAuthorized = await reengagementPost(authorizedRequest)
      expect(resAuthorized.status).toBe(200)
    })

    it('returns 400 when body does not contain users array', async () => {
      const req1 = new Request('https://gitascii.com/api/email/reengagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const res1 = await reengagementPost(req1)
      expect(res1.status).toBe(400)

      const req2 = new Request('https://gitascii.com/api/email/reengagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: [] }),
      })
      const res2 = await reengagementPost(req2)
      expect(res2.status).toBe(400)
    })

    it('processes batch of inactive users successfully', async () => {
      const request = new Request('https://gitascii.com/api/email/reengagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: [
            { username: 'user1', email: 'user1@example.com', inactiveDays: 20 },
            { username: 'user2', email: 'user2@example.com', inactiveDays: 16 },
          ],
        }),
      })

      const response = await reengagementPost(request)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.processed).toBe(2)
      expect(data.results).toHaveLength(2)
    })

    it('returns 500 on unexpected parsing error', async () => {
      const request = new Request('https://gitascii.com/api/email/reengagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{',
      })

      const response = await reengagementPost(request)
      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/email/request-star', () => {
    it('enforces authorization header when CRON_SECRET is configured', async () => {
      process.env.CRON_SECRET = 'secret_star_cron'

      const unauthorizedRequest = new Request('https://gitascii.com/api/email/request-star', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid',
        },
        body: JSON.stringify({ users: [{ username: 'active1', email: 'active1@test.com' }] }),
      })

      const resUnauthorized = await requestStarPost(unauthorizedRequest)
      expect(resUnauthorized.status).toBe(401)
    })

    it('returns 400 for empty or missing users array', async () => {
      const req = new Request('https://gitascii.com/api/email/request-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: [] }),
      })

      const res = await requestStarPost(req)
      expect(res.status).toBe(400)
    })

    it('processes batch of users requesting GitHub star', async () => {
      const request = new Request('https://gitascii.com/api/email/request-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: [
            { username: 'staruser1', email: 'staruser1@example.com' },
            { username: 'staruser2', email: 'staruser2@example.com' },
          ],
        }),
      })

      const response = await requestStarPost(request)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.processed).toBe(2)
      expect(data.results).toHaveLength(2)
    })

    it('returns 500 on malformed json payload', async () => {
      const request = new Request('https://gitascii.com/api/email/request-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not_json}',
      })

      const response = await requestStarPost(request)
      expect(response.status).toBe(500)
    })
  })
})
