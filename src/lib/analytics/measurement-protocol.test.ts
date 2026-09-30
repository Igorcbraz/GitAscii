import type Stripe from 'stripe'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  checkoutAnalyticsMetadata,
  sendCheckoutEvent,
  sendCheckoutPaymentFailure,
} from './measurement-protocol'

const originalMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const originalApiSecret = process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET

afterEach(() => {
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalMeasurementId
  process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET = originalApiSecret
  vi.unstubAllGlobals()
})

describe('Stripe to GA4 commerce events', () => {
  it('accepts only GA identifiers and rejects arbitrary request metadata', () => {
    expect(
      checkoutAnalyticsMetadata({
        ga_client_id: '123.456',
        ga_session_id: '123456',
        email: 'someone@example.com',
        username: 'someone',
      })
    ).toEqual({ ga_client_id: '123.456', ga_session_id: '123456' })
    expect(
      checkoutAnalyticsMetadata({ ga_client_id: 'someone@example.com', ga_session_id: 'bad' })
    ).toEqual({})
  })

  it('sends one paid purchase with Stripe transaction ID and correct zero-decimal amount', async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
    process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET = 'test-secret'
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const session = {
      id: 'cs_test_123',
      currency: 'jpy',
      amount_total: 1400,
      metadata: { ga_client_id: '123.456', ga_session_id: '123456', username: 'private' },
    } as unknown as Stripe.Checkout.Session

    await sendCheckoutEvent(session, 'purchase')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(url.origin).toBe('https://www.google-analytics.com')
    expect(url.searchParams.get('api_secret')).toBe('test-secret')
    expect(JSON.parse(options.body as string)).toEqual({
      client_id: '123.456',
      events: [
        {
          name: 'purchase',
          params: {
            checkout_provider: 'stripe',
            engagement_time_msec: 1,
            session_id: '123456',
            transaction_id: 'cs_test_123',
            currency: 'JPY',
            value: 1400,
            items: [
              {
                item_id: 'gitascii-pro-lifetime',
                item_name: 'GitAscii Pro Lifetime',
                price: 1400,
                quantity: 1,
              },
            ],
          },
        },
      ],
    })
    expect(options.body).not.toContain('private')
  })

  it('omits server events without a consented GA client ID', async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
    process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET = 'test-secret'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await sendCheckoutEvent({ metadata: {} } as Stripe.Checkout.Session, 'checkout_expired')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('records a Stripe failure code without customer or card details', async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
    process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET = 'test-secret'
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    await sendCheckoutPaymentFailure({
      metadata: { ga_client_id: '123.456' },
      last_payment_error: { decline_code: 'insufficient_funds', message: 'Private message' },
    } as unknown as Stripe.PaymentIntent)

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(payload.events[0]).toEqual({
      name: 'checkout_payment_failed',
      params: {
        checkout_provider: 'stripe',
        failure_reason: 'insufficient_funds',
        engagement_time_msec: 1,
      },
    })
    expect(fetchMock.mock.calls[0][1].body).not.toContain('Private message')
  })
})
