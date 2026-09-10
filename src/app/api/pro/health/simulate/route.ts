import { NextResponse } from 'next/server'

import { simulateHealthIncident } from '@/features/pro/server/healthMonitoringStore'
import { getProSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await getProSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { widgetId, widgetName, profileSlug, errorType, message } = body

    const health = await simulateHealthIncident(session.username, {
      widgetId,
      widgetName,
      profileSlug,
      errorType,
      message,
    })

    return NextResponse.json(health)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to simulate health incident'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
