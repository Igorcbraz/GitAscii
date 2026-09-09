import type { ProEmailLogRecord } from '@/features/pro/types/emails'

import { hasDbConfig, sql } from '../client'
import { ensureUser } from './userRepository'

export async function logSentEmailInDb(username: string, record: ProEmailLogRecord): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO email_logs (
      id,
      user_id,
      recipient_email,
      template_name,
      subject,
      reason,
      related_widget,
      related_profile,
      sent_at,
      status,
      error_message,
      message_id
    ) VALUES (
      ${record.id},
      ${user.id},
      ${record.recipientEmail},
      ${record.templateName},
      ${record.subject},
      ${record.reason},
      ${record.relatedWidget || null},
      ${record.relatedProfile || null},
      ${new Date(record.sentAt)},
      ${record.status},
      ${record.errorMessage || null},
      ${record.messageId || null}
    )
    ON CONFLICT (id) DO NOTHING;
  `
}

export async function getProEmailLogsFromDb(
  username: string,
  limit: number = 50
): Promise<ProEmailLogRecord[]> {
  if (!hasDbConfig()) return []
  const u = username.toLowerCase().trim()

  const rows = await sql`
    SELECT
      e.id,
      e.recipient_email,
      e.template_name,
      e.subject,
      e.reason,
      e.related_widget,
      e.related_profile,
      e.sent_at,
      e.status,
      e.error_message,
      e.message_id
    FROM email_logs e
    JOIN users u ON u.id = e.user_id
    WHERE u.username = ${u}
    ORDER BY e.sent_at DESC
    LIMIT ${limit};
  `

  return rows.map((r: any) => ({
    id: r.id,
    recipientEmail: r.recipient_email,
    templateName: r.template_name,
    subject: r.subject,
    reason: r.reason,
    relatedWidget: r.related_widget || null,
    relatedProfile: r.related_profile || null,
    sentAt: new Date(r.sent_at).toISOString(),
    status: r.status as any,
    errorMessage: r.error_message || null,
    messageId: r.message_id || null,
  }))
}

export async function getTestDigestCountFromDb(username: string): Promise<number> {
  if (!hasDbConfig()) return 0
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  const rows = await sql`
    SELECT test_digest_count FROM user_digest_cooldowns WHERE user_id = ${user.id} LIMIT 1;
  `
  if (rows.length === 0) return 0
  return Number(rows[0].test_digest_count || 0)
}

export async function recordTestDigestSentInDb(username: string): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO user_digest_cooldowns (user_id, test_digest_count, last_sent_at, updated_at)
    VALUES (${user.id}, 1, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET test_digest_count = user_digest_cooldowns.test_digest_count + 1, last_sent_at = NOW(), updated_at = NOW();
  `
}
