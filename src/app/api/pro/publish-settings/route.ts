import { NextResponse } from 'next/server'

import {
  getProEntitlements,
  getUserSettings,
  updateUserSettings,
} from '@/features/pro/server/entitlements'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const FREE_INTERVAL_MINUTES = 1440
const PRO_MIN_INTERVAL_MINUTES = 60

export async function GET() {
  const session = await getSession()
  if (!session?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entitlements = await getProEntitlements(session.username)
  const settings = await getUserSettings(session.username)
  const isPro = entitlements.tier !== 'free'
  return NextResponse.json({
    tier: entitlements.tier,
    intervalMinutes: isPro
      ? Math.max(PRO_MIN_INTERVAL_MINUTES, settings.publishIntervalMinutes || FREE_INTERVAL_MINUTES)
      : FREE_INTERVAL_MINUTES,
    minimumMinutes: isPro ? PRO_MIN_INTERVAL_MINUTES : FREE_INTERVAL_MINUTES,
  })
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entitlements = await getProEntitlements(session.username)
  if (entitlements.tier === 'free') {
    return NextResponse.json(
      { error: 'Custom publication frequency requires GitAscii Pro' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const requested = Number(body.intervalMinutes)
  if (!Number.isFinite(requested) || requested < PRO_MIN_INTERVAL_MINUTES) {
    return NextResponse.json(
      { error: `Publication interval must be at least ${PRO_MIN_INTERVAL_MINUTES} minutes` },
      { status: 400 }
    )
  }

  const intervalMinutes = Math.round(requested)
  await updateUserSettings(session.username, { publishIntervalMinutes: intervalMinutes })
  return NextResponse.json({ intervalMinutes, minimumMinutes: PRO_MIN_INTERVAL_MINUTES })
}
