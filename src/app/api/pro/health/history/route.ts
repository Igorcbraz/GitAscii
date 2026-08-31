import { NextResponse } from 'next/server'

import { getHealthHistory } from '@/features/pro/server/healthMonitoringStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30', 10)

  try {
    const history = await getHealthHistory(session.username, isNaN(days) ? 30 : days)
    return NextResponse.json({ history })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch health history'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
