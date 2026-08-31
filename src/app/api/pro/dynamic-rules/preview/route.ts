import { NextResponse } from 'next/server'

import { evaluateDynamicProfile } from '@/features/pro/server/dynamicRulesStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { simulatedDate, simulatedTimezone } = body

    const result = await evaluateDynamicProfile(session.username, {
      simulatedDate: simulatedDate || undefined,
      simulatedTimezone: simulatedTimezone || undefined,
      requestHeaders: request.headers,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Failed to evaluate dynamic profile preview'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
