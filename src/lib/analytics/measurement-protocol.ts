import type Stripe from 'stripe'

const CLIENT_ID_PATTERN = /^\d+\.\d+$/
const SESSION_ID_PATTERN = /^\d+$/

export function checkoutAnalyticsMetadata(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {}
  const data = value as Record<string, unknown>
  const metadata: Record<string, string> = {}
  if (typeof data.ga_client_id === 'string' && CLIENT_ID_PATTERN.test(data.ga_client_id)) {
    metadata.ga_client_id = data.ga_client_id
  }
  if (typeof data.ga_session_id === 'string' && SESSION_ID_PATTERN.test(data.ga_session_id)) {
    metadata.ga_session_id = data.ga_session_id
  }
  return metadata
}

function amountInMajorUnits(amount: number, currency: string): number {
  // Stripe's zero-decimal currency list for the currencies this checkout may offer.
  return [
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
  ].includes(currency)
    ? amount
    : amount / 100
}

async function sendGA4Event(
  metadata: Stripe.Metadata | null,
  name: string,
  params: Record<string, string | number | object[]>
): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const apiSecret = process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET
  const { ga_client_id, ga_session_id } = checkoutAnalyticsMetadata(metadata)
  if (!measurementId || !apiSecret || !ga_client_id) return
  if (ga_session_id) params.session_id = ga_session_id

  const url = new URL('https://www.google-analytics.com/mp/collect')
  url.searchParams.set('measurement_id', measurementId)
  url.searchParams.set('api_secret', apiSecret)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: ga_client_id, events: [{ name, params }] }),
    signal: AbortSignal.timeout(3000),
  })
  if (!response.ok) throw new Error(`GA Measurement Protocol returned ${response.status}`)
}

export async function sendCheckoutEvent(
  session: Stripe.Checkout.Session,
  name: 'purchase' | 'checkout_expired'
): Promise<void> {
  const currency = session.currency?.toUpperCase()
  const value =
    currency && session.amount_total !== null && session.amount_total !== undefined
      ? amountInMajorUnits(session.amount_total, currency)
      : undefined
  const params: Record<string, string | number | object[]> = {
    checkout_provider: 'stripe',
    engagement_time_msec: 1,
  }
  if (name === 'purchase') {
    params.transaction_id = session.id
    if (currency && value !== undefined) {
      params.currency = currency
      params.value = value
      params.items = [
        {
          item_id: 'gitascii-pro-lifetime',
          item_name: 'GitAscii Pro Lifetime',
          price: value,
          quantity: 1,
        },
      ]
    }
  }
  await sendGA4Event(session.metadata, name, params)
}

export async function sendCheckoutPaymentFailure(intent: Stripe.PaymentIntent): Promise<void> {
  const rawReason =
    intent.last_payment_error?.decline_code || intent.last_payment_error?.code || 'unknown'
  const reason = /^[a-z_]{1,40}$/.test(rawReason) ? rawReason : 'unknown'
  await sendGA4Event(intent.metadata, 'checkout_payment_failed', {
    checkout_provider: 'stripe',
    failure_reason: reason,
    engagement_time_msec: 1,
  })
}
