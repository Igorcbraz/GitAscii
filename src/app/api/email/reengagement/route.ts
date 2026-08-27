import { NextResponse } from 'next/server'

import { emailService } from '@/lib/email/service'
import type { ReengagementEmailPayload } from '@/lib/email/types'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.EMAIL_CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { users } = body as { users?: ReengagementEmailPayload[] }

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: Expected an array of users' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      users.map(async (user) => {
        const result = await emailService.sendReengagementEmail({
          email: user.email,
          username: user.username,
          name: user.name,
          inactiveDays: user.inactiveDays || 15,
        })
        return { username: user.username, result }
      })
    )

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
