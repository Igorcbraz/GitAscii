import { describe, expect, it } from 'vitest'

import {
  createUnsubscribeToken,
  getPreferencesUrl,
  getUnsubscribeUrl,
  verifyUnsubscribeToken,
} from './tokens'

describe('Email Tokens & HMAC Cryptography Suite', () => {
  it('creates and successfully verifies valid HMAC tokens', () => {
    const email = 'developer@example.com'
    const username = 'octocat'

    const token = createUnsubscribeToken(email, username)
    expect(typeof token).toBe('string')
    expect(token).toContain('.')

    const parsed = verifyUnsubscribeToken(token)
    expect(parsed).not.toBeNull()
    expect(parsed?.email).toBe(email)
    expect(parsed?.username).toBe(username)
    expect(parsed?.issuedAt).toBeTypeOf('number')
    expect(parsed!.issuedAt).toBeLessThanOrEqual(Date.now())
  })

  it('normalizes email and username to lowercase during token creation', () => {
    const token = createUnsubscribeToken('User.Name@Domain.COM  ', '  OctoCat  ')
    const parsed = verifyUnsubscribeToken(token)

    expect(parsed?.email).toBe('user.name@domain.com')
    expect(parsed?.username).toBe('octocat')
  })

  it('rejects tokens with modified payload (tampering detection)', () => {
    const originalToken = createUnsubscribeToken('alice@example.com', 'alice')
    const [, hmac] = originalToken.split('.')

    const fakePayload = {
      email: 'bob@example.com',
      username: 'alice',
      issuedAt: Date.now(),
    }
    const fakePayloadB64 = Buffer.from(JSON.stringify(fakePayload)).toString('base64url')
    const tamperedToken = `${fakePayloadB64}.${hmac}`

    expect(verifyUnsubscribeToken(tamperedToken)).toBeNull()
  })

  it('rejects tokens with altered signature bytes', () => {
    const originalToken = createUnsubscribeToken('alice@example.com', 'alice')
    const [payloadB64, hmac] = originalToken.split('.')

    const alteredHmac = hmac.slice(0, -2) + 'aa'
    const tamperedToken = `${payloadB64}.${alteredHmac}`

    expect(verifyUnsubscribeToken(tamperedToken)).toBeNull()
  })

  it('rejects malformed token strings', () => {
    expect(verifyUnsubscribeToken('')).toBeNull()
    expect(verifyUnsubscribeToken('no-dot-token')).toBeNull()
    expect(verifyUnsubscribeToken('too.many.dots.in.token')).toBeNull()
    expect(verifyUnsubscribeToken('.')).toBeNull()
    expect(verifyUnsubscribeToken('invalid_base64.valid_looking_hmac')).toBeNull()
  })

  it('rejects tokens missing email or username inside payload', () => {
    const missingEmailPayload = { username: 'octocat', issuedAt: Date.now() }
    const payloadB64 = Buffer.from(JSON.stringify(missingEmailPayload)).toString('base64url')
    const token = `${payloadB64}.fakehmac`
    expect(verifyUnsubscribeToken(token)).toBeNull()
  })

  it('constructs correct unsubscribe and preferences URLs', () => {
    const email = 'user+test@example.com'
    const username = 'octo-dev'

    const unsubUrl = getUnsubscribeUrl(email, username)
    const prefUrl = getPreferencesUrl(email, username)

    expect(unsubUrl).toContain('/api/email/unsubscribe?token=')
    expect(prefUrl).toContain('/unsubscribe?token=')

    const tokenFromUrl = new URL(unsubUrl).searchParams.get('token')
    expect(tokenFromUrl).not.toBeNull()

    const verified = verifyUnsubscribeToken(tokenFromUrl!)
    expect(verified?.email).toBe('user+test@example.com')
    expect(verified?.username).toBe('octo-dev')
  })
})
