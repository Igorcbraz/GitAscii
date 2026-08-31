import * as Sentry from '@sentry/nextjs'
import React from 'react'

import { getEmailReplyTo, getEmailSender, getResendClient, isEmailConfigured } from './client'
import { getEmailTranslator } from './i18n'
import {
  canSendReengagement,
  getLastEventTimestamp,
  hasEventBeenSent,
  isSuppressed,
  recordEventSent,
  recordSuppression,
} from './ledger'
import { AppDisconnectedEmail } from './templates/AppDisconnectedEmail'
import { FirstExportEmail } from './templates/FirstExportEmail'
import { ReengagementEmail } from './templates/ReengagementEmail'
import { RequestStarEmail } from './templates/RequestStarEmail'
import { StarThankYouEmail } from './templates/StarThankYouEmail'
import { WelcomeEmail } from './templates/WelcomeEmail'
import { getUnsubscribeUrl } from './tokens'
import type {
  AppDisconnectedEmailPayload,
  FirstExportEmailPayload,
  ReengagementEmailPayload,
  RequestStarEmailPayload,
  SendEmailResult,
  StarThankYouEmailPayload,
  WelcomeEmailPayload,
} from './types'

function safeLog(_val: unknown): string {
  return '[redacted]'
}

export class EmailService {
  private buildHeaders(email: string, username: string) {
    const unsubUrl = getUnsubscribeUrl(email, username)
    return {
      'List-Unsubscribe': `<${unsubUrl}>, <mailto:support@gitascii.com?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    }
  }

  async sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<SendEmailResult> {
    const { email, username, locale = 'en' } = payload
    const t = getEmailTranslator(locale)

    if (!email || !username) {
      return { success: false, skipped: true, reason: 'Missing email or username' }
    }

    if (isSuppressed(email)) {
      return { success: false, skipped: true, reason: 'Email is suppressed/unsubscribed' }
    }

    if (hasEventBeenSent(username, 'welcome')) {
      return { success: false, skipped: true, reason: 'Welcome email already sent to user' }
    }

    const subject = t('email.welcome.subject', 'Welcome to GitAscii, @{username} 🚀', { username })

    const resend = getResendClient()
    if (!resend || !isEmailConfigured()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n[EmailService:DEV] ✉️ Simulated Welcome Email:')
        console.log(`  To: ${safeLog(email)}`)
        console.log(`  User: @${safeLog(username)}`)
        console.log(`  Subject: ${safeLog(subject)}`)
        recordEventSent(username, 'welcome')
        return { success: true, messageId: `dev-simulated-welcome-${Date.now()}` }
      }
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          `[EmailService] RESEND_API_KEY is not configured. Skipped sending welcome email to @${safeLog(username)}.`
        )
      }
      return { success: false, skipped: true, reason: 'Resend API key not configured' }
    }

    try {
      const idempotencyKey = `welcome-email/${username.toLowerCase().trim()}`
      const headers = this.buildHeaders(email, username)

      const { data, error } = await resend.emails.send(
        {
          from: getEmailSender(),
          replyTo: getEmailReplyTo(),
          to: [email],
          subject,
          react: React.createElement(WelcomeEmail, payload),
          headers,
        },
        { idempotencyKey }
      )

      if (error) {
        console.error(
          `[EmailService] Failed to send welcome email to @${safeLog(username)}:`,
          safeLog(error.message)
        )
        Sentry.captureException(new Error(`Resend Welcome Email Error: ${error.message}`))
        return { success: false, error: error.message }
      }

      recordEventSent(username, 'welcome')
      return { success: true, messageId: data?.id }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error sending welcome email'
      console.error(
        `[EmailService] Exception sending welcome email to @${safeLog(username)}:`,
        safeLog(message)
      )
      Sentry.captureException(err)
      return { success: false, error: message }
    }
  }

  async sendFirstExportEmail(payload: FirstExportEmailPayload): Promise<SendEmailResult> {
    const { email, username, locale = 'en' } = payload
    const t = getEmailTranslator(locale)

    if (!email || !username) {
      return { success: false, skipped: true, reason: 'Missing email or username' }
    }

    if (isSuppressed(email)) {
      return { success: false, skipped: true, reason: 'Email is suppressed/unsubscribed' }
    }

    if (hasEventBeenSent(username, 'first_export')) {
      return { success: false, skipped: true, reason: 'First export email already sent to user' }
    }

    const subject = t('email.first_export.subject', '🚀 Your GitAscii README is Live on GitHub!')

    const resend = getResendClient()
    if (!resend || !isEmailConfigured()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n[EmailService:DEV] ✉️ Simulated First Export Email:')
        console.log(`  To: ${safeLog(email)}`)
        console.log(`  User: @${safeLog(username)}`)
        console.log(`  Subject: ${safeLog(subject)}`)
        recordEventSent(username, 'first_export')
        return { success: true, messageId: `dev-simulated-export-${Date.now()}` }
      }
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          `[EmailService] RESEND_API_KEY is not configured. Skipped sending first export email to @${safeLog(username)}.`
        )
      }
      return { success: false, skipped: true, reason: 'Resend API key not configured' }
    }

    try {
      const idempotencyKey = `first-export/${username.toLowerCase().trim()}`
      const headers = this.buildHeaders(email, username)

      const { data, error } = await resend.emails.send(
        {
          from: getEmailSender(),
          replyTo: getEmailReplyTo(),
          to: [email],
          subject,
          react: React.createElement(FirstExportEmail, payload),
          headers,
        },
        { idempotencyKey }
      )

      if (error) {
        console.error(
          `[EmailService] Failed to send first export email to @${safeLog(username)}:`,
          safeLog(error.message)
        )
        Sentry.captureException(new Error(`Resend First Export Error: ${error.message}`))
        return { success: false, error: error.message }
      }

      recordEventSent(username, 'first_export')
      return { success: true, messageId: data?.id }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown error sending first export email'
      console.error(
        `[EmailService] Exception sending first export email to @${safeLog(username)}:`,
        safeLog(message)
      )
      Sentry.captureException(err)
      return { success: false, error: message }
    }
  }

  async sendAppDisconnectedEmail(payload: AppDisconnectedEmailPayload): Promise<SendEmailResult> {
    const { email, username, locale = 'en' } = payload
    const t = getEmailTranslator(locale)

    if (!email || !username) {
      return { success: false, skipped: true, reason: 'Missing email or username' }
    }

    try {
      const { getProEntitlements } = await import('@/features/pro/server/entitlements')
      const entitlements = await getProEntitlements(username).catch(() => null)
      if (
        entitlements &&
        (entitlements.tier === 'free' || !entitlements.widgetErrorAlertsEnabled)
      ) {
        return {
          success: false,
          skipped: true,
          reason: 'App disconnected alert is exclusive to Pro plan users',
        }
      }
    } catch {}

    const lastSent = getLastEventTimestamp(username, 'app_disconnected')
    if (lastSent && Date.now() - lastSent < 7 * 24 * 60 * 60 * 1000) {
      return { success: false, skipped: true, reason: 'App disconnected alert in cooldown period' }
    }

    const subject = t(
      'email.app_disconnected.subject',
      '⚠️ [Action Required] GitAscii needs write permission for @{username}',
      { username }
    )

    const resend = getResendClient()
    if (!resend || !isEmailConfigured()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n[EmailService:DEV] ✉️ Simulated App Disconnected Email:')
        console.log(`  To: ${safeLog(email)}`)
        console.log(`  User: @${safeLog(username)}`)
        console.log(`  Subject: ${safeLog(subject)}`)
        recordEventSent(username, 'app_disconnected')
        return { success: true, messageId: `dev-simulated-app-disc-${Date.now()}` }
      }
      return { success: false, skipped: true, reason: 'Resend API key not configured' }
    }

    try {
      const idempotencyKey = `app-disconnected/${username.toLowerCase().trim()}`
      const headers = this.buildHeaders(email, username)

      const { data, error } = await resend.emails.send(
        {
          from: getEmailSender(),
          replyTo: getEmailReplyTo(),
          to: [email],
          subject,
          react: React.createElement(AppDisconnectedEmail, payload),
          headers,
        },
        { idempotencyKey }
      )

      if (error) {
        console.error(
          `[EmailService] Failed to send app disconnected alert to @${safeLog(username)}:`,
          safeLog(error.message)
        )
        Sentry.captureException(new Error(`Resend App Disconnected Error: ${error.message}`))
        return { success: false, error: error.message }
      }

      recordEventSent(username, 'app_disconnected')
      return { success: true, messageId: data?.id }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(
        `[EmailService] Exception sending app disconnected email to @${safeLog(username)}:`,
        safeLog(message)
      )
      Sentry.captureException(err)
      return { success: false, error: message }
    }
  }

  async sendStarThankYouEmail(payload: StarThankYouEmailPayload): Promise<SendEmailResult> {
    const { email, username, locale = 'en' } = payload
    const t = getEmailTranslator(locale)

    if (!email || !username) {
      return { success: false, skipped: true, reason: 'Missing email or username' }
    }

    if (hasEventBeenSent(username, 'star_thank_you')) {
      return { success: false, skipped: true, reason: 'Star thank-you email already sent' }
    }

    const subject = t(
      'email.star_thank_you.subject',
      '⭐ Thank you for supporting GitAscii on GitHub, @{username}!',
      { username }
    )

    const resend = getResendClient()
    if (!resend || !isEmailConfigured()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n[EmailService:DEV] ✉️ Simulated Star Thank You Email:')
        console.log(`  To: ${safeLog(email)}`)
        console.log(`  User: @${safeLog(username)}`)
        console.log(`  Subject: ${safeLog(subject)}`)
        recordEventSent(username, 'star_thank_you')
        return { success: true, messageId: `dev-simulated-star-thanks-${Date.now()}` }
      }
      return { success: false, skipped: true, reason: 'Resend API key not configured' }
    }

    try {
      const idempotencyKey = `star-thank-you/${username.toLowerCase().trim()}`
      const headers = this.buildHeaders(email, username)

      const { data, error } = await resend.emails.send(
        {
          from: getEmailSender(),
          replyTo: getEmailReplyTo(),
          to: [email],
          subject,
          react: React.createElement(StarThankYouEmail, payload),
          headers,
        },
        { idempotencyKey }
      )

      if (error) {
        console.error(
          `[EmailService] Failed to send star thank-you email to @${safeLog(username)}:`,
          safeLog(error.message)
        )
        Sentry.captureException(new Error(`Resend Star Thank You Error: ${error.message}`))
        return { success: false, error: error.message }
      }

      recordEventSent(username, 'star_thank_you')
      return { success: true, messageId: data?.id }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(
        `[EmailService] Exception sending star thank-you email to @${safeLog(username)}:`,
        safeLog(message)
      )
      Sentry.captureException(err)
      return { success: false, error: message }
    }
  }

  async sendRequestStarEmail(payload: RequestStarEmailPayload): Promise<SendEmailResult> {
    const { email, username, locale = 'en' } = payload
    const t = getEmailTranslator(locale)

    if (!email || !username) {
      return { success: false, skipped: true, reason: 'Missing email or username' }
    }

    if (isSuppressed(email)) {
      return { success: false, skipped: true, reason: 'Email is suppressed/unsubscribed' }
    }

    if (
      hasEventBeenSent(username, 'request_star') ||
      hasEventBeenSent(username, 'star_thank_you')
    ) {
      return {
        success: false,
        skipped: true,
        reason: 'Request star email already sent or user already starred',
      }
    }

    const subject = t(
      'email.request_star.subject',
      'Enjoying your dynamic GitHub README? Leave a ⭐ on GitAscii!'
    )

    const resend = getResendClient()
    if (!resend || !isEmailConfigured()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n[EmailService:DEV] ✉️ Simulated Request Star Email:')
        console.log(`  To: ${safeLog(email)}`)
        console.log('  User: [redacted]')
        console.log(`  Subject: ${safeLog(subject)}`)
        recordEventSent(username, 'request_star')
        return { success: true, messageId: `dev-simulated-request-star-${Date.now()}` }
      }
      return { success: false, skipped: true, reason: 'Resend API key not configured' }
    }

    try {
      const idempotencyKey = `request-star/${username.toLowerCase().trim()}`
      const headers = this.buildHeaders(email, username)

      const { data, error } = await resend.emails.send(
        {
          from: getEmailSender(),
          replyTo: getEmailReplyTo(),
          to: [email],
          subject,
          react: React.createElement(RequestStarEmail, payload),
          headers,
        },
        { idempotencyKey }
      )

      if (error) {
        console.error(
          '[EmailService] Failed to send request star email to @%s:',
          safeLog(username),
          safeLog(error.message)
        )
        Sentry.captureException(new Error(`Resend Request Star Error: ${error.message}`))
        return { success: false, error: error.message }
      }

      recordEventSent(username, 'request_star')
      return { success: true, messageId: data?.id }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(
        '[EmailService] Exception sending request star email to @%s: %s',
        safeLog(username),
        safeLog(message)
      )
      Sentry.captureException(err)
      return { success: false, error: message }
    }
  }

  async sendReengagementEmail(payload: ReengagementEmailPayload): Promise<SendEmailResult> {
    const { email, username, inactiveDays = 15, locale = 'en' } = payload
    const t = getEmailTranslator(locale)

    if (!email || !username) {
      return { success: false, skipped: true, reason: 'Missing email or username' }
    }

    if (isSuppressed(email)) {
      return { success: false, skipped: true, reason: 'Email is suppressed/unsubscribed' }
    }

    if (!canSendReengagement(username, inactiveDays)) {
      return { success: false, skipped: true, reason: 'Reengagement email in cooldown period' }
    }

    const subject = t(
      'email.reengagement.subject',
      'Level up your GitHub README with new GitAscii features'
    )

    const resend = getResendClient()
    if (!resend || !isEmailConfigured()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n[EmailService:DEV] ✉️ Simulated Re-engagement Email:')
        console.log(`  To: ${safeLog(email)}`)
        console.log('  User:', `@${safeLog(username)}`)
        console.log(`  Subject: ${safeLog(subject)}`)
        recordEventSent(username, 'reengagement')
        return { success: true, messageId: `dev-simulated-reengagement-${Date.now()}` }
      }
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          '[EmailService] RESEND_API_KEY is not configured. Skipped sending re-engagement email.'
        )
      }
      return { success: false, skipped: true, reason: 'Resend API key not configured' }
    }

    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const idempotencyKey = `reengagement/${username.toLowerCase().trim()}/${currentMonth}`
      const headers = this.buildHeaders(email, username)

      const { data, error } = await resend.emails.send(
        {
          from: getEmailSender(),
          replyTo: getEmailReplyTo(),
          to: [email],
          subject,
          react: React.createElement(ReengagementEmail, payload),
          headers,
        },
        { idempotencyKey }
      )

      if (error) {
        console.error(
          '[EmailService] Failed to send re-engagement email',
          { username: safeLog(username) },
          safeLog(error.message)
        )
        Sentry.captureException(new Error(`Resend Reengagement Error: ${error.message}`))
        return { success: false, error: error.message }
      }

      recordEventSent(username, 'reengagement')
      return { success: true, messageId: data?.id }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown error sending re-engagement email'
      console.error(
        '[EmailService] Exception sending re-engagement email',
        { username: safeLog(username) },
        safeLog(message)
      )
      Sentry.captureException(err)
      return { success: false, error: message }
    }
  }

  unsubscribe(email: string, username: string = ''): void {
    recordSuppression(email, username, true, true)
  }

  isUnsubscribed(email: string): boolean {
    return isSuppressed(email)
  }
}

export const emailService = new EmailService()
