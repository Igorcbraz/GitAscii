import { NextResponse } from 'next/server'

import { getProEntitlements, updateUserSettings } from '@/features/pro/server/entitlements'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Pro toggle is only available in development mode.' },
      { status: 403 }
    )
  }

  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized. Please login with GitHub.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const targetTier = body.tier === 'free' ? 'free' : 'pro'

  await updateUserSettings(session.username, { planTier: targetTier })
  const entitlements = await getProEntitlements(session.username)

  return NextResponse.json({
    success: true,
    tier: targetTier,
    message: `Plan tier updated to ${targetTier} (development mode only).`,
    entitlements,
  })
}
