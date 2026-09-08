import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { computeEntitlements, getProEntitlements } from '@/features/pro/server/entitlements'
import { PRO_PLAN_TIERS } from '@/features/pro/types/subscription'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (session?.username) {
    let entitlements = await getProEntitlements(session.username)

    if (process.env.NODE_ENV !== 'production') {
      try {
        const cookieStore = await cookies()
        const devOverride = cookieStore.get('gitascii_dev_pro_override')?.value
        if (devOverride === 'pro') {
          entitlements = computeEntitlements(PRO_PLAN_TIERS.PRO)
        }
      } catch {}
    }

    return NextResponse.json({
      session: {
        ...session,
        isPro: entitlements.tier !== PRO_PLAN_TIERS.FREE,
        tier: entitlements.tier,
        entitlements,
      },
    })
  }
  return NextResponse.json({ session })
}
