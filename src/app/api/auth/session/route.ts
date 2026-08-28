import { NextResponse } from 'next/server'

import { getProEntitlements } from '@/features/pro/server/entitlements'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (session?.username) {
    const entitlements = await getProEntitlements(session.username)
    return NextResponse.json({
      session: {
        ...session,
        isPro: entitlements.tier !== 'free',
        tier: entitlements.tier,
        entitlements,
      },
    })
  }
  return NextResponse.json({ session })
}
