import { beforeEach, describe, expect, it } from 'vitest'

import {
  canSendTestDigest,
  getProEmailLogs,
  logSentEmail,
  MAX_TEST_DIGESTS,
  recordTestDigestSent,
} from './emailLogStore'
import { resetProRedisMemoryStoreForTesting } from './redisClient'

describe('EmailLogStore Comprehensive Unit Tests', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
  })

  it('logs sent emails and retrieves them in reverse chronological order', async () => {
    const username = 'EmailTester'

    await logSentEmail({
      username,
      recipientEmail: 'dev@gitascii.com',
      templateName: 'WelcomeEmail',
      subject: 'Welcome to GitAscii Pro',
      reason: 'User upgraded account',
      status: 'sent',
    })

    await logSentEmail({
      username,
      recipientEmail: 'dev@gitascii.com',
      templateName: 'WidgetErrorAlertEmail',
      subject: 'Widget failed',
      reason: 'Timeout occurred',
      status: 'sent',
      relatedWidget: 'stats',
      relatedProfile: 'default',
    })

    const logs = await getProEmailLogs(username)
    expect(logs.length).toBe(2)
    expect(logs[0].templateName).toBe('WidgetErrorAlertEmail')
    expect(logs[0].relatedWidget).toBe('stats')
    expect(logs[1].templateName).toBe('WelcomeEmail')
  })

  it('enforces maximum test digest limit of 3', async () => {
    const username = 'DigestTester'

    expect(MAX_TEST_DIGESTS).toBe(3)
    expect(await canSendTestDigest(username)).toBe(true)

    await recordTestDigestSent(username)
    expect(await canSendTestDigest(username)).toBe(true)

    await recordTestDigestSent(username)
    expect(await canSendTestDigest(username)).toBe(true)

    await recordTestDigestSent(username)
    expect(await canSendTestDigest(username)).toBe(false)
  })

  it('returns empty array when user has no logged emails', async () => {
    const logs = await getProEmailLogs('unknown_user')
    expect(logs).toEqual([])
  })
})
