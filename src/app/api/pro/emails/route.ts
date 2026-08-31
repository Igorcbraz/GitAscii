import { NextResponse } from 'next/server'

import {
  canSendTestDigest,
  getProEmailLogs,
  logSentEmail,
  recordTestDigestSent,
} from '@/features/pro/server/emailLogStore'
import { getUserSettings } from '@/features/pro/server/entitlements'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userSettings = await getUserSettings(session.username)
    const recipientEmail =
      userSettings.alertEmailAddress ||
      session.email ||
      `${session.username}@users.noreply.github.com`
    const isFallback = !userSettings.alertEmailAddress && !session.email

    const emails = await getProEmailLogs(session.username)
    const canSendTest = await canSendTestDigest(session.username)

    return NextResponse.json({
      emails,
      canSendTest,
      recipientEmail,
      isFallback,
      accountEmail: session.email || null,
      customAlertEmail: userSettings.alertEmailAddress || null,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch email logs'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const canSend = await canSendTestDigest(session.username)
    if (!canSend) {
      return NextResponse.json(
        {
          error:
            'Você já atingiu o limite de envios de teste. O limite é de 3 envios a cada 90 dias.',
          canSendTest: false,
        },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const userSettings = await getUserSettings(session.username)
    const recipientEmail =
      userSettings.alertEmailAddress ||
      session.email ||
      `${session.username}@users.noreply.github.com`
    const isFallback = !userSettings.alertEmailAddress && !session.email

    await logSentEmail({
      username: session.username,
      recipientEmail,
      templateName: body.templateName || 'ProDigestEmail',
      subject: body.subject || '⚡ GitAscii Pro Weekly Traffic & Growth Digest',
      reason: body.reason || 'Weekly profile telemetry digest dispatched to account',
      relatedWidget: body.relatedWidget || null,
      relatedProfile: body.relatedProfile || 'default',
      status: 'sent',
      messageId: `test-msg-${Date.now()}`,
    })

    await recordTestDigestSent(session.username)
    const canSendNext = await canSendTestDigest(session.username)

    const updated = await getProEmailLogs(session.username)
    return NextResponse.json({
      success: true,
      emails: updated,
      canSendTest: canSendNext,
      recipientEmail,
      isFallback,
      accountEmail: session.email || null,
      customAlertEmail: userSettings.alertEmailAddress || null,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create email test'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
