import { NextResponse } from 'next/server'

import {
  getProEntitlements,
  invalidateEntitlementsCache,
  updateUserSettings,
} from '@/features/pro/server/entitlements'
import { PRO_PLAN_TIERS } from '@/features/pro/types/subscription'
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
  const targetTier = body.tier === PRO_PLAN_TIERS.FREE ? PRO_PLAN_TIERS.FREE : PRO_PLAN_TIERS.PRO

  if (targetTier === PRO_PLAN_TIERS.FREE) {
    try {
      const { hasDbConfig, sql } = await import('@/lib/db/client')
      if (hasDbConfig()) {
        const u = session.username.toLowerCase().trim()
        await sql`
          UPDATE user_entitlements
          SET plan_tier = ${PRO_PLAN_TIERS.FREE},
              stripe_subscription_id = NULL,
              stripe_payment_intent_id = NULL,
              stripe_price_id = NULL,
              stripe_subscription_status = NULL,
              stripe_current_period_end = NULL
          WHERE user_id = (SELECT id FROM users WHERE username = ${u} LIMIT 1)
        `
      }

      const { getProRedisClient } = await import('@/features/pro/server/redisClient')
      const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')
      const redis = getProRedisClient()
      const usernameLower = session.username.toLowerCase().trim()
      await redis.del(REDIS_KEYS.userSettings(usernameLower)).catch(() => {})
    } catch (e) {
      console.warn('Failed to force clear dev entitlements:', e)
    }
  }

  await updateUserSettings(session.username, { planTier: targetTier })
  invalidateEntitlementsCache(session.username)

  const entitlements = await getProEntitlements(session.username)

  const response = NextResponse.json({
    success: true,
    tier: targetTier,
    message: `Plan tier updated to ${targetTier} (development mode only).`,
    entitlements,
  })

  response.cookies.set('gitascii_dev_pro_override', targetTier, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  return response
}
