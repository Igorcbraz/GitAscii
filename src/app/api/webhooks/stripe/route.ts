import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import {
  getUserByStripeCustomer,
  getUserSettings,
  invalidateEntitlementsCache,
  updateUserSettings,
} from '@/features/pro/server/entitlements'
import { getProRedisClient } from '@/features/pro/server/redisClient'
import {
  getUserBySubscriptionId,
  getUserByUsername,
  isStripeEventProcessed,
  tryRecordStripeEvent,
  updateEntitlement,
} from '@/lib/db/repositories/userRepository'

export const dynamic = 'force-dynamic'

function getStripeClient(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is missing from environment variables.')
  }
  return new Stripe(apiKey)
}

type EventLockStatus = 'new' | 'completed' | 'in_flight'

async function checkAndAcquireEventLock(eventId: string): Promise<EventLockStatus> {
  const redis = getProRedisClient()
  const key = `gitascii:stripe:event:${eventId}`

  try {
    const status = await redis.get<string>(key)
    if (status === 'completed') {
      return 'completed'
    }
    if (status === 'in_flight') {
      return 'in_flight'
    }
  } catch (e) {
    console.warn('[Stripe Webhook] Redis lock read warning:', e)
  }

  try {
    const alreadyProcessed = await isStripeEventProcessed(eventId)
    if (alreadyProcessed) {
      await redis.set(key, 'completed', { ex: 30 * 24 * 60 * 60 }).catch(() => {})
      return 'completed'
    }
  } catch (e) {
    console.warn('[Stripe Webhook] DB event check warning:', e)
  }

  try {
    const acquired = await redis.set(key, 'in_flight', { nx: true, ex: 120 })
    if (acquired) {
      return 'new'
    }
    return 'in_flight'
  } catch (e) {
    console.warn('[Stripe Webhook] Failed to acquire Redis lock:', e)
    return 'new'
  }
}

async function markEventCompleted(eventId: string): Promise<void> {
  try {
    const redis = getProRedisClient()
    await redis.set(`gitascii:stripe:event:${eventId}`, 'completed', {
      ex: 30 * 24 * 60 * 60,
    })
  } catch (e) {
    console.warn('[Stripe Webhook] Error marking event completed in Redis:', e)
  }
}

async function releaseRedisEventLock(eventId: string): Promise<void> {
  try {
    const redis = getProRedisClient()
    await redis.del(`gitascii:stripe:event:${eventId}`)
  } catch {}
}

async function resolveUsername(
  stripe: Stripe,
  target: {
    clientReferenceId?: string | null
    metadata?: Stripe.Metadata | null
    customerId?: string | null
    subscriptionId?: string | null
  }
): Promise<string | null> {
  if (target.clientReferenceId && target.clientReferenceId.trim().length > 0) {
    return target.clientReferenceId.toLowerCase().trim()
  }

  const fromMeta = target.metadata?.username || target.metadata?.github_username
  if (fromMeta && fromMeta.trim().length > 0) {
    return fromMeta.toLowerCase().trim()
  }

  if (target.customerId) {
    const cachedUser = await getUserByStripeCustomer(target.customerId)
    if (cachedUser && cachedUser.trim().length > 0) {
      return cachedUser.toLowerCase().trim()
    }
  }

  if (target.subscriptionId) {
    try {
      const userFromSub = await getUserBySubscriptionId(target.subscriptionId)
      if (userFromSub?.user.username) {
        return userFromSub.user.username.toLowerCase().trim()
      }
    } catch {}
  }

  if (target.customerId) {
    try {
      const customer = await stripe.customers.retrieve(target.customerId)
      if (customer && !customer.deleted) {
        const custMetaUser = customer.metadata?.username || customer.metadata?.github_username
        if (custMetaUser && custMetaUser.trim().length > 0) {
          const u = custMetaUser.toLowerCase().trim()
          const redis = getProRedisClient()
          await redis.set(`gitascii:stripe:customer:${target.customerId}`, u)
          return u
        }
      }
    } catch (err) {
      console.warn(
        `[Stripe Webhook] Failed to fetch customer ${target.customerId} from Stripe API:`,
        err
      )
    }
  }

  return null
}

export async function POST(req: Request) {
  const body = await req.text()
  const headerList = await headers()
  const signature = headerList.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    console.error('[Stripe Webhook] Missing signature or webhook secret.')
    return NextResponse.json(
      { error: 'Missing stripe signature or STRIPE_WEBHOOK_SECRET.' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  let stripe: Stripe

  try {
    stripe = getStripeClient()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const lockStatus = await checkAndAcquireEventLock(event.id)
  if (lockStatus === 'completed') {
    console.log(`[Stripe Webhook] Duplicate event already completed: ${event.id}`)
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
  }
  if (lockStatus === 'in_flight') {
    console.warn(`[Stripe Webhook] Event currently in flight: ${event.id}`)
    return NextResponse.json({ error: 'Event currently in flight' }, { status: 429 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id || null

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id || undefined

        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || undefined

        const username = await resolveUsername(stripe, {
          clientReferenceId: session.client_reference_id,
          metadata: session.metadata,
          customerId,
          subscriptionId,
        })

        if (!username) {
          console.warn(
            '[Stripe Webhook] checkout.session.completed received without identifiable user.'
          )
          break
        }

        if (customerId) {
          try {
            await stripe.customers.update(customerId, {
              metadata: { username },
            })
          } catch {}
        }

        await updateEntitlement({
          eventId: event.id,
          eventType: event.type,
          username,
          planTier: 'pro',
          stripeCustomerId: customerId || undefined,
          stripeSubscriptionId: subscriptionId,
          stripePaymentIntentId: paymentIntentId,
          stripeSubscriptionStatus: session.mode === 'payment' ? 'paid' : 'active',
          eventCreatedAt: event.created,
        })

        invalidateEntitlementsCache(username)
        await updateUserSettings(username, {
          planTier: 'pro',
          stripeCustomerId: customerId || undefined,
          stripeSubscriptionId: subscriptionId,
          stripeSubscriptionStatus: session.mode === 'payment' ? 'paid' : 'active',
        }).catch(() => {})

        try {
          const redis = getProRedisClient()
          await redis.sadd('gitascii:pro:customers', username)
          await redis.del('gitascii:pro:social_proof_cache')
        } catch (e) {
          console.warn('[Stripe Webhook] Failed to update social proof set:', e)
        }

        console.log(`[Stripe Webhook] Verified checkout completed for user: ${username}`)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id || null

        const username = await resolveUsername(stripe, {
          metadata: subscription.metadata,
          customerId,
          subscriptionId: subscription.id,
        })

        if (!username) {
          console.warn(
            `[Stripe Webhook] Subscription event without identified user: ${subscription.id}`
          )
          break
        }

        const status = subscription.status
        const priceId = subscription.items.data[0]?.price?.id
        const currentPeriodEnd = (subscription as any).current_period_end
        const isActive = status === 'active' || status === 'trialing'

        const current = await getUserByUsername(username)
        const isLifetimePro = Boolean(
          current?.entitlement.stripe_payment_intent_id && current?.entitlement.plan_tier === 'pro'
        )

        const effectiveTier = isActive || isLifetimePro ? 'pro' : 'free'

        await updateEntitlement({
          eventId: event.id,
          eventType: event.type,
          username,
          planTier: effectiveTier,
          stripeCustomerId: customerId || undefined,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeSubscriptionStatus: status,
          stripeCurrentPeriodEnd: currentPeriodEnd,
          eventCreatedAt: event.created,
        })

        await updateUserSettings(username, {
          planTier: effectiveTier,
          stripeCustomerId: customerId || undefined,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeSubscriptionStatus: status,
          stripeCurrentPeriodEnd: currentPeriodEnd,
        }).catch(() => {})

        console.log(
          `[Stripe Webhook] Subscription status updated for ${username}: status=${status}, pro=${isActive}`
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id || null

        const username = await resolveUsername(stripe, {
          metadata: subscription.metadata,
          customerId,
          subscriptionId: subscription.id,
        })

        if (username) {
          const current = await getUserByUsername(username)
          if (!current) break

          if (
            current.entitlement.stripe_subscription_id &&
            current.entitlement.stripe_subscription_id !== subscription.id
          ) {
            console.warn(
              `[Stripe Webhook] Ignored subscription.deleted for @${username}: event sub ${subscription.id} does not match current sub ${current.entitlement.stripe_subscription_id}`
            )
            await tryRecordStripeEvent(event.id, event.type, event.created, username)
            break
          }

          if (
            current.entitlement.stripe_payment_intent_id &&
            current.entitlement.plan_tier === 'pro'
          ) {
            console.log(
              `[Stripe Webhook] Preserving Pro for @${username} due to lifetime one-time payment`
            )
            await tryRecordStripeEvent(event.id, event.type, event.created, username)
            break
          }

          await updateEntitlement({
            eventId: event.id,
            eventType: event.type,
            username,
            planTier: 'free',
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: 'canceled',
            eventCreatedAt: event.created,
          })

          await updateUserSettings(username, {
            planTier: 'free',
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: 'canceled',
          }).catch(() => {})

          console.log(`[Stripe Webhook] Subscription deleted. Revoked PRO access for: ${username}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null
        const subscriptionId =
          typeof (invoice as any).subscription === 'string'
            ? (invoice as any).subscription
            : (invoice as any).subscription?.id

        const username = await resolveUsername(stripe, {
          customerId,
          subscriptionId,
        })

        if (username) {
          console.warn(`[Stripe Webhook] Payment failed on invoice for user: ${username}`)

          const current = await getUserByUsername(username)
          if (!current) break

          if (
            current.entitlement.stripe_payment_intent_id &&
            current.entitlement.plan_tier === 'pro'
          ) {
            console.log(
              `[Stripe Webhook] Preserving Pro for @${username} with lifetime payment despite failed invoice`
            )
            await tryRecordStripeEvent(event.id, event.type, event.created, username)
            break
          }

          if (
            subscriptionId &&
            current.entitlement.stripe_subscription_id &&
            current.entitlement.stripe_subscription_id !== subscriptionId
          ) {
            console.warn(
              `[Stripe Webhook] Payment failed for unrelated subscription ${subscriptionId} for user ${username}`
            )
            await tryRecordStripeEvent(event.id, event.type, event.created, username)
            break
          }

          let subscriptionStatus = 'past_due'
          let isStillPro = true

          if (subscriptionId) {
            try {
              const sub = await stripe.subscriptions.retrieve(subscriptionId)
              subscriptionStatus = sub.status
              isStillPro =
                sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due'
            } catch (err) {
              console.warn(
                '[Stripe Webhook] Could not retrieve subscription during payment_failed:',
                err
              )
            }
          }

          const currentSettings = await getUserSettings(username)
          const newTier = isStillPro ? currentSettings.planTier : 'free'

          await updateEntitlement({
            eventId: event.id,
            eventType: event.type,
            username,
            planTier: newTier,
            stripeSubscriptionId: subscriptionId,
            stripeSubscriptionStatus: subscriptionStatus,
            eventCreatedAt: event.created,
          })

          await updateUserSettings(username, {
            planTier: newTier,
            stripeSubscriptionId: subscriptionId,
            stripeSubscriptionStatus: subscriptionStatus,
          }).catch(() => {})
        }
        break
      }

      default:
        break
    }

    await markEventCompleted(event.id)
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    if (error?.message?.includes('already processed')) {
      console.warn(
        `[Stripe Webhook] Duplicate event ${event.id} suppressed gracefully:`,
        error.message
      )
      await markEventCompleted(event.id)
      return NextResponse.json({ received: true, deduplicated: true }, { status: 200 })
    }
    console.error('[Stripe Webhook Handler Error]:', error)
    await releaseRedisEventLock(event.id)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
