import { NextResponse } from 'next/server'

import { getProEntitlements, updateUserSettings } from '@/features/pro/server/entitlements'
import type { ProPlanTier } from '@/features/pro/types/subscription'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const adminSecret = process.env.PRO_ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json(
      { error: 'Server configuration error: PRO_ADMIN_SECRET is not set.' },
      { status: 500 }
    )
  }

  const authKey =
    request.headers.get('x-admin-key') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!authKey || authKey !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized: Invalid admin secret key.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { username, tier = 'pro' } = body

  if (!username || typeof username !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid username parameter.' }, { status: 400 })
  }

  const validTiers: ProPlanTier[] = ['free', 'pro', 'team', 'enterprise']
  const assignedTier = validTiers.includes(tier as ProPlanTier) ? (tier as ProPlanTier) : 'pro'

  await updateUserSettings(username, { planTier: assignedTier })
  const entitlements = await getProEntitlements(username)

  return NextResponse.json({
    success: true,
    message: `Plan tier for @${username} updated to ${assignedTier}.`,
    entitlements,
  })
}
