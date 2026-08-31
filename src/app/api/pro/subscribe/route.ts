import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is missing from environment variables.')
  }
  return new Stripe(apiKey)
}

function resolvePriceId(acceptLanguage: string | null): string | undefined {
  const basePriceId = process.env.STRIPE_PRICE_ID
  if (basePriceId) {
    return basePriceId
  }

  const priceBrl = process.env.STRIPE_PRICE_ID_BRL
  const priceUsd = process.env.STRIPE_PRICE_ID_USD

  if (priceBrl && priceUsd) {
    const isPortuguese = acceptLanguage && /pt(-[A-Z]{2})?/i.test(acceptLanguage)
    return isPortuguese ? priceBrl : priceUsd
  }

  return priceBrl || priceUsd
}

export async function POST() {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized. Please login with GitHub.' }, { status: 401 })
  }

  const username = session.username.toLowerCase().trim()
  const userEmail = session.email && session.email.includes('@') ? session.email.trim() : undefined
  const headerList = await headers()
  const acceptLanguage = headerList.get('accept-language')
  const priceId = resolvePriceId(acceptLanguage)
  const secretKey = process.env.STRIPE_SECRET_KEY
  const directCheckoutUrl = process.env.PRO_CHECKOUT_URL || process.env.STRIPE_CHECKOUT_URL

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    headerList.get('origin') ||
    headerList.get('referer')?.split('/').slice(0, 3).join('/') ||
    'http://localhost:3000'

  if (secretKey && priceId) {
    try {
      const stripe = getStripeClient()
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        client_reference_id: username,
        metadata: {
          username,
          githubId: String(session.githubId),
        },
        success_url: `${origin}/pro?checkout=success`,
        cancel_url: `${origin}/pro?checkout=cancelled`,
      })

      if (checkoutSession.url) {
        return NextResponse.json({
          checkoutUrl: checkoutSession.url,
          redirect: true,
        })
      }
    } catch (error: any) {
      console.error('[Stripe Checkout Session Error]:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create checkout session.' },
        { status: 500 }
      )
    }
  }

  if (directCheckoutUrl) {
    try {
      const url = new URL(directCheckoutUrl)
      url.searchParams.set('client_reference_id', username)
      if (userEmail) {
        url.searchParams.set('prefilled_email', userEmail)
      }
      return NextResponse.json({
        checkoutUrl: url.toString(),
        redirect: true,
      })
    } catch {
      return NextResponse.json({
        checkoutUrl: directCheckoutUrl,
        redirect: true,
      })
    }
  }

  return NextResponse.json(
    { error: 'Checkout is currently being configured. Please contact support.' },
    { status: 400 }
  )
}
