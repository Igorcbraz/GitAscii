import { NextResponse } from 'next/server'

import {
  clearAllWidgetErrors,
  deleteWidgetErrors,
  getWidgetErrors,
  recordWidgetError,
} from '@/features/pro/server/errorTrackerStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const errors = await getWidgetErrors(session.username)
    return NextResponse.json({ errors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch errors'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const action = body.action || 'simulate'

    if (action === 'clear_all') {
      await clearAllWidgetErrors(session.username)
      return NextResponse.json({ success: true, message: 'All errors cleared' })
    }

    if (action === 'delete_selected') {
      const ids: string[] = Array.isArray(body.ids) ? body.ids : []
      if (ids.length > 0) {
        await deleteWidgetErrors(session.username, ids)
      }
      return NextResponse.json({ success: true, message: 'Selected errors deleted' })
    }

    await recordWidgetError({
      username: session.username,
      profileSlug: body.profileSlug || 'default',
      widgetId: body.widgetId || 'streak-stats',
      widgetName: body.widgetName || 'GitHub Streak Stats',
      errorType: body.errorType || 'FETCH_TIMEOUT',
      message: body.message || 'Simulated timeout connecting to upstream stats provider',
      details: body.details || 'Simulated probe: HTTP 504 Gateway Timeout after 5000ms',
    })

    const updated = await getWidgetErrors(session.username)
    return NextResponse.json({ success: true, errors: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to process error action'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
