import crypto from 'crypto'

import { getAppBaseUrl } from './client'
import type { UnsubscribeTokenPayload } from './types'

function getSigningSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.EMAIL_TOKEN_SECRET ||
    'gitascii-email-token-secret-fallback-key-min-32chars'
  )
}

export function createUnsubscribeToken(email: string, username: string): string {
  const payload: UnsubscribeTokenPayload = {
    email: email.toLowerCase().trim(),
    username: username.toLowerCase().trim(),
    issuedAt: Date.now(),
  }

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const hmac = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url')

  return `${payloadB64}.${hmac}`
}

export function verifyUnsubscribeToken(token: string): UnsubscribeTokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null

    const parts = token.split('.')
    if (parts.length !== 2) return null

    const [payloadB64, receivedHmac] = parts
    if (!payloadB64 || !receivedHmac) return null

    const expectedHmac = crypto
      .createHmac('sha256', getSigningSecret())
      .update(payloadB64)
      .digest('base64url')

    const receivedBuf = Buffer.from(receivedHmac)
    const expectedBuf = Buffer.from(expectedHmac)

    if (receivedBuf.length !== expectedBuf.length) return null
    if (!crypto.timingSafeEqual(receivedBuf, expectedBuf)) return null

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8')
    const payload = JSON.parse(jsonStr) as UnsubscribeTokenPayload

    if (!payload.email || !payload.username) return null

    return payload
  } catch {
    return null
  }
}

export function getUnsubscribeUrl(email: string, username: string): string {
  const token = createUnsubscribeToken(email, username)
  const baseUrl = getAppBaseUrl()
  return `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(token)}`
}

export function getPreferencesUrl(email: string, username: string): string {
  const token = createUnsubscribeToken(email, username)
  const baseUrl = getAppBaseUrl()
  return `${baseUrl}/unsubscribe?token=${encodeURIComponent(token)}`
}
