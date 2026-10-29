import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const service = vi.hoisted(() => ({
  sendReengagementEmail: vi.fn().mockResolvedValue({ success: true }),
  sendRequestStarEmail: vi.fn().mockResolvedValue({ success: true }),
}))
vi.mock('./service', () => ({ emailService: service }))

import { POST as reengagement } from '@/app/api/email/reengagement/route'
import { POST as requestStar } from '@/app/api/email/request-star/route'

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('CRON_SECRET', '')
  vi.stubEnv('EMAIL_CRON_SECRET', '')
})
afterEach(() => vi.unstubAllEnvs())

describe.each([
  ['reengagement', reengagement],
  ['request-star', requestStar],
] as const)('%s scheduled task authorization', (path, handler) => {
  const request = (authorization?: string) =>
    new Request(`https://gitascii.test/api/email/${path}`, {
      method: 'POST',
      headers: authorization ? { authorization } : {},
      body: JSON.stringify({ users: [{ username: 'test', email: 'test@example.test' }] }),
    })

  it.each(['', '   '])(
    'rejects missing/blank configuration before reading the body (%j)',
    async (secret) => {
      vi.stubEnv('CRON_SECRET', secret)
      const req = request('Bearer undefined')
      const response = await handler(req)
      expect(response.status).toBe(503)
      expect(req.bodyUsed).toBe(false)
      expect(service.sendReengagementEmail).not.toHaveBeenCalled()
      expect(service.sendRequestStarEmail).not.toHaveBeenCalled()
    }
  )

  it.each([undefined, 'Bearer wrong'])(
    'rejects absent/wrong credentials without dispatch (%s)',
    async (header) => {
      vi.stubEnv('CRON_SECRET', 'test-secret')
      const req = request(header)
      expect((await handler(req)).status).toBe(401)
      expect(req.bodyUsed).toBe(false)
      expect(service.sendReengagementEmail).not.toHaveBeenCalled()
      expect(service.sendRequestStarEmail).not.toHaveBeenCalled()
    }
  )

  it.each(['CRON_SECRET', 'EMAIL_CRON_SECRET'])(
    'accepts the configured %s credential',
    async (name) => {
      vi.stubEnv(name, 'test-secret')
      expect((await handler(request('Bearer test-secret'))).status).toBe(200)
      expect(
        service.sendReengagementEmail.mock.calls.length +
          service.sendRequestStarEmail.mock.calls.length
      ).toBe(1)
    }
  )
})
