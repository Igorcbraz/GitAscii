import type { EmailStatus, ProEmailLogRecord } from '../types/emails'
import { REDIS_KEYS } from './analyticsStore'
import { getProRedisClient } from './redisClient'

export interface LogEmailParams {
  username: string
  recipientEmail: string
  templateName: string
  subject: string
  reason: string
  relatedWidget?: string | null
  relatedProfile?: string | null
  status?: EmailStatus
  errorMessage?: string | null
  messageId?: string | null
}

export async function logSentEmail(params: LogEmailParams): Promise<void> {
  try {
    const redis = getProRedisClient()
    const username = params.username.toLowerCase().trim()
    const emailId = `eml_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const now = new Date().toISOString()
    const score = Date.now()

    const itemKey = REDIS_KEYS.emailItem(username, emailId)
    const listKey = REDIS_KEYS.emailList(username)

    const record: ProEmailLogRecord = {
      id: emailId,
      recipientEmail: params.recipientEmail,
      templateName: params.templateName,
      subject: params.subject,
      reason: params.reason,
      relatedWidget: params.relatedWidget || null,
      relatedProfile: params.relatedProfile || null,
      sentAt: now,
      status: params.status || 'sent',
      errorMessage: params.errorMessage || null,
      messageId: params.messageId || null,
    }

    await redis.hset(itemKey, record as unknown as Record<string, any>)
    await redis.zadd(listKey, { score, member: emailId })

    await redis.expire(itemKey, 90 * 86400)
    await redis.expire(listKey, 90 * 86400)
  } catch (err) {
    console.warn('[EmailLogStore] Failed to log sent email:', err)
  }
}

export async function getProEmailLogs(username: string): Promise<ProEmailLogRecord[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const listKey = REDIS_KEYS.emailList(u)

  const emailIds = await redis.zrevrange<string[]>(listKey, 0, 50)
  if (!emailIds || emailIds.length === 0) {
    return []
  }

  const logs: ProEmailLogRecord[] = []
  for (const id of emailIds) {
    const itemKey = REDIS_KEYS.emailItem(u, id)
    const data = await redis.hgetall<any>(itemKey)
    if (data && data.id) {
      logs.push({
        id: data.id,
        recipientEmail: data.recipientEmail,
        templateName: data.templateName,
        subject: data.subject,
        reason: data.reason,
        relatedWidget: data.relatedWidget || null,
        relatedProfile: data.relatedProfile || null,
        sentAt: data.sentAt || new Date().toISOString(),
        status: (data.status as any) || 'sent',
        errorMessage: data.errorMessage || null,
        messageId: data.messageId || null,
      })
    }
  }

  return logs
}

export const MAX_TEST_DIGESTS = 3

export async function canSendTestDigest(username: string): Promise<boolean> {
  try {
    const redis = getProRedisClient()
    const u = username.toLowerCase().trim()

    const count = Number((await redis.get(REDIS_KEYS.testDigestCooldown(u))) || 0)
    if (count >= MAX_TEST_DIGESTS) {
      return false
    }

    const logs = await getProEmailLogs(u)
    const digestCount = logs.filter(
      (l) =>
        l.templateName === 'ProDigestEmail' && (l.status === 'sent' || l.status === 'delivered')
    ).length
    return digestCount < MAX_TEST_DIGESTS
  } catch (err) {
    console.warn('[EmailLogStore] Error checking test digest eligibility:', err)
    return true
  }
}

export async function recordTestDigestSent(username: string): Promise<void> {
  try {
    const redis = getProRedisClient()
    const u = username.toLowerCase().trim()
    const key = REDIS_KEYS.testDigestCooldown(u)
    const current = Number((await redis.get(key)) || 0)
    await redis.set(key, String(current + 1), { ex: 90 * 86400 })
  } catch (err) {
    console.warn('[EmailLogStore] Error recording test digest cooldown:', err)
  }
}
