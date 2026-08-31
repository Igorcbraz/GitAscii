import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import {
  getUserByStripeCustomer,
  getUserSettings,
  updateUserSettings,
} from '@/features/pro/server/entitlements'
import { getProRedisClient } from '@/features/pro/server/redisClient'

export const dynamic = 'force-dynamic'

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is missing from environment variables.')
  }
  return new Stripe(apiKey)
}

/**
 * Registra o event.id no Redis para garantir idempotência.
 * Retorna true se o evento é novo, ou false se já foi processado antes.
 * TTL de 30 dias (2.592.000 segundos) para cobrir amplamente a janela de retenção de eventos do Stripe (30 dias).
 */
async function checkAndMarkEventProcessed(eventId: string): Promise<boolean> {
  const redis = getProRedisClient()
  const key = `gitascii:stripe:event:${eventId}`

  const existing = await redis.get(key)
  if (existing) {
    return false
  }

  await redis.set(key, 'processed', { ex: 30 * 24 * 60 * 60 })
  return true
}

/**
 * Resolve o username de forma segura a partir de:
 * 1. Metadados do próprio objeto (session/subscription)
 * 2. client_reference_id (se session)
 * 3. Índice reverso no Redis (stripe:customer:{id})
 * 4. Fallback: consulta segura na API do Stripe ao Customer object (buscando metadata.username ou client_reference_id gravado)
 */
async function resolveUsername(
  stripe: Stripe,
  target: {
    clientReferenceId?: string | null
    metadata?: Stripe.Metadata | null
    customerId?: string | null
  }
): Promise<string | null> {
  // 1. client_reference_id gerado pelo backend
  if (target.clientReferenceId && target.clientReferenceId.trim().length > 0) {
    return target.clientReferenceId.toLowerCase().trim()
  }

  // 2. Metadados injetados pelo backend
  const fromMeta = target.metadata?.username || target.metadata?.github_username
  if (fromMeta && fromMeta.trim().length > 0) {
    return fromMeta.toLowerCase().trim()
  }

  // 3. Índice no Redis via customer ID
  if (target.customerId) {
    const cachedUser = await getUserByStripeCustomer(target.customerId)
    if (cachedUser && cachedUser.trim().length > 0) {
      return cachedUser.toLowerCase().trim()
    }

    // 4. Fallback seguro: consultar o Customer no Stripe para ler seus metadados persistentes
    try {
      const customer = await stripe.customers.retrieve(target.customerId)
      if (customer && !customer.deleted) {
        const custMetaUser = customer.metadata?.username || customer.metadata?.github_username
        if (custMetaUser && custMetaUser.trim().length > 0) {
          const u = custMetaUser.toLowerCase().trim()
          // Atualiza o índice para evitar novas chamadas de API
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

  const isNewEvent = await checkAndMarkEventProcessed(event.id)
  if (!isNewEvent) {
    console.log(`[Stripe Webhook] Duplicate event ignored: ${event.id}`)
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id || null

        const username = await resolveUsername(stripe, {
          clientReferenceId: session.client_reference_id,
          metadata: session.metadata,
          customerId,
        })

        if (!username) {
          console.warn(
            '[Stripe Webhook] checkout.session.completed received without identifiable user.'
          )
          break
        }

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id || undefined

        if (customerId) {
          try {
            await stripe.customers.update(customerId, {
              metadata: { username },
            })
          } catch {}
        }

        await updateUserSettings(username, {
          planTier: 'pro',
          stripeCustomerId: customerId || undefined,
          stripeSubscriptionId: subscriptionId,
          stripeSubscriptionStatus: 'active',
        })

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

        await updateUserSettings(username, {
          planTier: isActive ? 'pro' : 'free',
          stripeCustomerId: customerId || undefined,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeSubscriptionStatus: status,
          stripeCurrentPeriodEnd: currentPeriodEnd,
        })

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
        })

        if (username) {
          await updateUserSettings(username, {
            planTier: 'free',
            stripeSubscriptionStatus: 'canceled',
          })
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
        })

        if (username) {
          console.warn(`[Stripe Webhook] Payment failed on invoice for user: ${username}`)

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
          await updateUserSettings(username, {
            planTier: isStillPro ? currentSettings.planTier : 'free',
            stripeSubscriptionStatus: subscriptionStatus,
          })
        }
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('[Stripe Webhook Handler Error]:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
