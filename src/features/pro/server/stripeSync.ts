import Stripe from 'stripe'

import {
  STRIPE_SEARCH_LIMIT,
  STRIPE_SUBSCRIPTION_LIMIT,
  STRIPE_SUBSCRIPTION_STATUS,
} from '../constants/subscription'
import { PRO_PLAN_TIERS } from '../types/subscription'
import { updateUserSettings } from './entitlements'

function getStripeClient(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) return null
  return new Stripe(apiKey)
}

export async function syncUserFromStripe(username: string): Promise<{
  isPro: boolean
  tier: typeof PRO_PLAN_TIERS.PRO | typeof PRO_PLAN_TIERS.FREE
} | null> {
  const stripe = getStripeClient()
  if (!stripe) return null

  const normalizedUsername = username.toLowerCase().trim()

  try {
    const query = `metadata['username']:'${normalizedUsername}'`

    let customer: Stripe.Customer | null = null

    try {
      const searchRes = await stripe.customers.search({
        query,
        limit: STRIPE_SEARCH_LIMIT,
      })
      if (searchRes.data.length > 0 && !searchRes.data[0].deleted) {
        customer = searchRes.data[0]
      }
    } catch {}

    if (!customer) {
      return null
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: STRIPE_SUBSCRIPTION_LIMIT,
    })

    const activeSubscription = subscriptions.data.find(
      (sub) =>
        sub.status === STRIPE_SUBSCRIPTION_STATUS.ACTIVE ||
        sub.status === STRIPE_SUBSCRIPTION_STATUS.TRIALING
    )

    if (activeSubscription) {
      const priceId = activeSubscription.items.data[0]?.price?.id
      const currentPeriodEnd = (activeSubscription as unknown as { current_period_end?: number })
        .current_period_end

      await updateUserSettings(normalizedUsername, {
        planTier: PRO_PLAN_TIERS.PRO,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: activeSubscription.id,
        stripePriceId: priceId,
        stripeSubscriptionStatus: activeSubscription.status,
        stripeCurrentPeriodEnd: currentPeriodEnd,
      }).catch(() => {})

      return { isPro: true, tier: PRO_PLAN_TIERS.PRO }
    }
  } catch {}

  return null
}
