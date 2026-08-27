import { Resend } from 'resend'

let resendInstance: Resend | null = null

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return null
  }

  if (!resendInstance) {
    resendInstance = new Resend(apiKey)
  }

  return resendInstance
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

export function getEmailSender(): string {
  return process.env.EMAIL_FROM?.trim() || 'GitAscii <team@gitascii.com>'
}

export function getEmailReplyTo(): string {
  return process.env.EMAIL_REPLY_TO?.trim() || 'GitAscii Support <support@gitascii.com>'
}

export function getAppBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (envUrl) {
    return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`
  }
  return 'https://gitascii.com'
}
