import { NextResponse } from 'next/server'

import { getOverallHealth } from '@/features/pro/server/healthMonitoringStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const health = await getOverallHealth(session.username)
    return NextResponse.json(health)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch health monitoring data'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
