import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  getAppBaseUrl,
  getEmailReplyTo,
  getEmailSender,
  getResendClient,
  isEmailConfigured,
} from './client'

describe('Email Client Configuration Suite', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isEmailConfigured', () => {
    it('returns false when RESEND_API_KEY is not set', () => {
      delete process.env.RESEND_API_KEY
      expect(isEmailConfigured()).toBe(false)
    })

    it('returns false when RESEND_API_KEY is empty string', () => {
      process.env.RESEND_API_KEY = '   '
      expect(isEmailConfigured()).toBe(false)
    })

    it('returns true when RESEND_API_KEY is present', () => {
      process.env.RESEND_API_KEY = 're_test_123456789'
      expect(isEmailConfigured()).toBe(true)
    })
  })

  describe('getResendClient', () => {
    it('returns null when RESEND_API_KEY is missing', () => {
      delete process.env.RESEND_API_KEY
      expect(getResendClient()).toBeNull()
    })

    it('returns a Resend instance when RESEND_API_KEY is provided', () => {
      process.env.RESEND_API_KEY = 're_test_sample_key'
      const client = getResendClient()
      expect(client).not.toBeNull()
      expect(typeof client?.emails?.send).toBe('function')
    })
  })

  describe('getEmailSender', () => {
    it('returns default sender when EMAIL_FROM is unset', () => {
      delete process.env.EMAIL_FROM
      expect(getEmailSender()).toBe('GitAscii <team@gitascii.com>')
    })

    it('returns custom sender when EMAIL_FROM is configured', () => {
      process.env.EMAIL_FROM = 'GitAscii Bot <notifications@custom.domain>'
      expect(getEmailSender()).toBe('GitAscii Bot <notifications@custom.domain>')
    })
  })

  describe('getEmailReplyTo', () => {
    it('returns default replyTo when EMAIL_REPLY_TO is unset', () => {
      delete process.env.EMAIL_REPLY_TO
      expect(getEmailReplyTo()).toBe('GitAscii Support <support@gitascii.com>')
    })

    it('returns custom replyTo when EMAIL_REPLY_TO is configured', () => {
      process.env.EMAIL_REPLY_TO = 'GitAscii Help <help@custom.domain>'
      expect(getEmailReplyTo()).toBe('GitAscii Help <help@custom.domain>')
    })
  })

  describe('getAppBaseUrl', () => {
    it('returns default https://gitascii.com when no env vars are set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL
      expect(getAppBaseUrl()).toBe('https://gitascii.com')
    })

    it('uses NEXT_PUBLIC_APP_URL when defined with http prefix', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
      expect(getAppBaseUrl()).toBe('http://localhost:3000')
    })

    it('uses NEXT_PUBLIC_APP_URL and adds https:// when protocol is missing', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'preview.gitascii.com'
      expect(getAppBaseUrl()).toBe('https://preview.gitascii.com')
    })

    it('falls back to VERCEL_PROJECT_PRODUCTION_URL if NEXT_PUBLIC_APP_URL is unset', () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'gitascii.vercel.app'
      expect(getAppBaseUrl()).toBe('https://gitascii.vercel.app')
    })
  })
})
