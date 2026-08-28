import * as Sentry from '@sentry/nextjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as emailClient from './client'
import { hasEventBeenSent, isSuppressed, recordEventSent, resetLedgerForTesting } from './ledger'
import { emailService } from './service'

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

describe('EmailService Dispatch, Error Handling & Sentry Suite', () => {
  let mockSend: ReturnType<typeof vi.fn>

  beforeEach(() => {
    resetLedgerForTesting()
    vi.clearAllMocks()
    mockSend = vi.fn().mockResolvedValue({ data: { id: 'msg_test_123' }, error: null })
    vi.spyOn(emailClient, 'isEmailConfigured').mockReturnValue(true)
    vi.spyOn(emailClient, 'getResendClient').mockReturnValue({
      emails: { send: mockSend },
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Welcome Email', () => {
    const validPayload = {
      username: 'octocat',
      name: 'Mona Lisa',
      email: 'octocat@github.com',
      editorUrl: 'https://gitascii.com/octocat',
    }

    it('sends welcome email successfully and records event in ledger', async () => {
      const result = await emailService.sendWelcomeEmail(validPayload)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg_test_123')
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(hasEventBeenSent('octocat', 'welcome')).toBe(true)

      const sendArgs = mockSend.mock.calls[0][0]
      expect(sendArgs.to).toEqual(['octocat@github.com'])
      expect(sendArgs.subject).toContain('Welcome to GitAscii')
      expect(sendArgs.headers['List-Unsubscribe']).toBeDefined()
    })

    it('skips sending when email or username is empty', async () => {
      const res1 = await emailService.sendWelcomeEmail({ ...validPayload, email: '' })
      expect(res1.skipped).toBe(true)

      const res2 = await emailService.sendWelcomeEmail({ ...validPayload, username: '' })
      expect(res2.skipped).toBe(true)
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('skips sending when email is suppressed', async () => {
      emailService.unsubscribe(validPayload.email, validPayload.username)

      const result = await emailService.sendWelcomeEmail(validPayload)
      expect(result.skipped).toBe(true)
      expect(result.reason).toContain('suppressed')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('skips duplicate welcome email sends', async () => {
      recordEventSent('octocat', 'welcome')

      const result = await emailService.sendWelcomeEmail(validPayload)
      expect(result.skipped).toBe(true)
      expect(result.reason).toContain('already sent')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('skips when Resend client is unconfigured', async () => {
      vi.spyOn(emailClient, 'isEmailConfigured').mockReturnValue(false)
      vi.spyOn(emailClient, 'getResendClient').mockReturnValue(null)

      const result = await emailService.sendWelcomeEmail(validPayload)
      expect(result.skipped).toBe(true)
      expect(result.reason).toContain('not configured')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('captures Sentry exception when Resend returns an API error', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid API key provided' },
      })

      const result = await emailService.sendWelcomeEmail(validPayload)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid API key provided')
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
      const capturedError = vi.mocked(Sentry.captureException).mock.calls[0][0] as Error
      expect(capturedError.message).toContain('Resend Welcome Email Error')
      expect(hasEventBeenSent('octocat', 'welcome')).toBe(false)
    })

    it('captures Sentry exception when Resend throws unexpected network exception', async () => {
      const networkError = new Error('Network timeout (ETIMEDOUT)')
      mockSend.mockRejectedValueOnce(networkError)

      const result = await emailService.sendWelcomeEmail(validPayload)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Network timeout (ETIMEDOUT)')
      expect(Sentry.captureException).toHaveBeenCalledWith(networkError)
    })
  })

  describe('First Export Email', () => {
    const validPayload = {
      username: 'octocat',
      name: 'Mona Lisa',
      email: 'octocat@github.com',
      profileSlug: 'default',
      widgetCount: 5,
    }

    it('sends first export email successfully', async () => {
      const result = await emailService.sendFirstExportEmail(validPayload)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg_test_123')
      expect(hasEventBeenSent('octocat', 'first_export')).toBe(true)
    })

    it('skips sending when missing required fields or already sent', async () => {
      const res1 = await emailService.sendFirstExportEmail({ ...validPayload, email: '' })
      expect(res1.skipped).toBe(true)

      recordEventSent('octocat', 'first_export')
      const res2 = await emailService.sendFirstExportEmail(validPayload)
      expect(res2.skipped).toBe(true)
    })

    it('skips when user is suppressed', async () => {
      emailService.unsubscribe(validPayload.email)
      const res = await emailService.sendFirstExportEmail(validPayload)
      expect(res.skipped).toBe(true)
    })

    it('handles Resend API error and reports to Sentry', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Domain verification failed' },
      })

      const result = await emailService.sendFirstExportEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
      const capturedError = vi.mocked(Sentry.captureException).mock.calls[0][0] as Error
      expect(capturedError.message).toContain('Resend First Export Error')
    })

    it('handles unexpected exceptions and reports to Sentry', async () => {
      const err = new Error('Fetch failed')
      mockSend.mockRejectedValueOnce(err)

      const result = await emailService.sendFirstExportEmail(validPayload)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Fetch failed')
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })
  })

  describe('App Disconnected Alert Email', () => {
    const validPayload = {
      username: 'octocat',
      name: 'Mona Lisa',
      email: 'octocat@github.com',
      repoName: 'octocat/octocat',
    }

    beforeEach(async () => {
      const { updateUserSettings } = await import('@/features/pro/server/entitlements')
      await updateUserSettings('octocat', { planTier: 'pro' })
    })

    it('sends app disconnected alert successfully', async () => {
      const result = await emailService.sendAppDisconnectedEmail(validPayload)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg_test_123')
      expect(hasEventBeenSent('octocat', 'app_disconnected')).toBe(true)
    })

    it('enforces 7-day cooldown on repeated alerts', async () => {
      recordEventSent('octocat', 'app_disconnected')

      const result = await emailService.sendAppDisconnectedEmail(validPayload)
      expect(result.skipped).toBe(true)
      expect(result.reason).toContain('cooldown')
    })

    it('handles Resend API error and reports to Sentry', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Rate limit exceeded' },
      })

      const result = await emailService.sendAppDisconnectedEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
      const capturedError = vi.mocked(Sentry.captureException).mock.calls[0][0] as Error
      expect(capturedError.message).toContain('Resend App Disconnected Error')
    })

    it('skips app disconnected alert for free plan users', async () => {
      const { updateUserSettings } = await import('@/features/pro/server/entitlements')
      await updateUserSettings('free_user', { planTier: 'free' })

      const result = await emailService.sendAppDisconnectedEmail({
        ...validPayload,
        username: 'free_user',
      })
      expect(result.skipped).toBe(true)
      expect(result.reason).toContain('exclusive to Pro plan')
    })

    it('handles unexpected exceptions and reports to Sentry', async () => {
      const err = new Error('Connection reset by peer')
      mockSend.mockRejectedValueOnce(err)

      const result = await emailService.sendAppDisconnectedEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })
  })

  describe('Star Thank You Email', () => {
    const validPayload = {
      username: 'octocat',
      name: 'Mona Lisa',
      email: 'octocat@github.com',
    }

    it('sends thank you email successfully', async () => {
      const result = await emailService.sendStarThankYouEmail(validPayload)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg_test_123')
      expect(hasEventBeenSent('octocat', 'star_thank_you')).toBe(true)
    })

    it('skips duplicate star thank you sends', async () => {
      recordEventSent('octocat', 'star_thank_you')

      const result = await emailService.sendStarThankYouEmail(validPayload)
      expect(result.skipped).toBe(true)
    })

    it('handles Resend API error and reports to Sentry', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid recipient' },
      })

      const result = await emailService.sendStarThankYouEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
    })

    it('handles unexpected exceptions and reports to Sentry', async () => {
      const err = new Error('Internal Server Error')
      mockSend.mockRejectedValueOnce(err)

      const result = await emailService.sendStarThankYouEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })
  })

  describe('Request Star Email', () => {
    const validPayload = {
      username: 'active_creator',
      name: 'Active Creator',
      email: 'active@example.com',
    }

    it('sends request star email successfully', async () => {
      const result = await emailService.sendRequestStarEmail(validPayload)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg_test_123')
      expect(hasEventBeenSent('active_creator', 'request_star')).toBe(true)
    })

    it('skips if user already starred or request already sent', async () => {
      recordEventSent('active_creator', 'star_thank_you')
      const res1 = await emailService.sendRequestStarEmail(validPayload)
      expect(res1.skipped).toBe(true)

      resetLedgerForTesting()
      recordEventSent('active_creator', 'request_star')
      const res2 = await emailService.sendRequestStarEmail(validPayload)
      expect(res2.skipped).toBe(true)
    })

    it('skips when user is suppressed', async () => {
      emailService.unsubscribe(validPayload.email)
      const res = await emailService.sendRequestStarEmail(validPayload)
      expect(res.skipped).toBe(true)
    })

    it('handles Resend API error and reports to Sentry', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Rate limit' },
      })

      const result = await emailService.sendRequestStarEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
    })

    it('handles unexpected exceptions and reports to Sentry', async () => {
      const err = new Error('Network error')
      mockSend.mockRejectedValueOnce(err)

      const result = await emailService.sendRequestStarEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })
  })

  describe('Re-engagement Email', () => {
    const validPayload = {
      username: 'inactive_dev',
      name: 'Inactive Dev',
      email: 'inactive@example.com',
      inactiveDays: 20,
    }

    it('sends re-engagement email successfully', async () => {
      const result = await emailService.sendReengagementEmail(validPayload)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg_test_123')
      expect(hasEventBeenSent('inactive_dev', 'reengagement')).toBe(true)
    })

    it('enforces re-engagement cooldown (15+ days)', async () => {
      recordEventSent('inactive_dev', 'reengagement')

      const result = await emailService.sendReengagementEmail(validPayload)
      expect(result.skipped).toBe(true)
      expect(result.reason).toContain('cooldown')
    })

    it('skips when user is suppressed', async () => {
      emailService.unsubscribe(validPayload.email)
      const res = await emailService.sendReengagementEmail(validPayload)
      expect(res.skipped).toBe(true)
    })

    it('handles Resend API error and reports to Sentry', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Validation failed' },
      })

      const result = await emailService.sendReengagementEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
    })

    it('handles unexpected exceptions and reports to Sentry', async () => {
      const err = new Error('Socket hung up')
      mockSend.mockRejectedValueOnce(err)

      const result = await emailService.sendReengagementEmail(validPayload)
      expect(result.success).toBe(false)
      expect(Sentry.captureException).toHaveBeenCalledWith(err)
    })
  })

  describe('Unsubscribe & Suppression Helpers', () => {
    it('correctly sets and queries unsubscribe status', () => {
      const email = 'user@example.com'
      expect(emailService.isUnsubscribed(email)).toBe(false)

      emailService.unsubscribe(email, 'user')
      expect(emailService.isUnsubscribed(email)).toBe(true)
      expect(isSuppressed(email)).toBe(true)
    })
  })
})
