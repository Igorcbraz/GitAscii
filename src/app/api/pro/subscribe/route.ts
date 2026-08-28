import { NextResponse } from 'next/server'

import { getProEntitlements, updateUserSettings } from '@/features/pro/server/entitlements'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized. Please login with GitHub.' }, { status: 401 })
  }

  const checkoutUrl = process.env.PRO_CHECKOUT_URL || process.env.STRIPE_CHECKOUT_URL

  if (checkoutUrl) {
    return NextResponse.json({
      checkoutUrl,
      redirect: true,
    })
  }

  if (process.env.NODE_ENV !== 'production') {
    await updateUserSettings(session.username, { planTier: 'pro' })
    const entitlements = await getProEntitlements(session.username)

    return NextResponse.json({
      success: true,
      message: 'GitAscii Pro plan simulated in development mode.',
      entitlements,
    })
  }

  return NextResponse.json(
    { error: 'Checkout is currently being prepared. Please contact support or sponsor on GitHub.' },
    { status: 400 }
  )
}
