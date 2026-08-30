import { NextResponse } from 'next/server'

import { getWidgetHealthList } from '@/features/pro/server/healthMonitoringStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const profile = searchParams.get('profile') || undefined

  try {
    const widgets = await getWidgetHealthList(session.username, profile)
    return NextResponse.json({ widgets })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch widget health metrics'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
