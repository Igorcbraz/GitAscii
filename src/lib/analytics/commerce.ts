'use client'

import { analytics } from './index'

export const PRO_ITEM = {
  item_id: 'gitascii-pro-lifetime',
  item_name: 'GitAscii Pro Lifetime',
  quantity: 1,
}

export function trackProOffer() {
  analytics.track('view_item', {
    items: [PRO_ITEM],
  })
}

export function trackCheckoutIntent() {
  analytics.track('begin_checkout', {
    items: [PRO_ITEM],
  })
}

// Attach GA identifiers when GA is active. The server never receives a GA API secret from the browser.
export async function getGAIdentifiers(): Promise<{
  ga_client_id?: string
  ga_session_id?: string
}> {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (process.env.NODE_ENV !== 'production' || !measurementId || !window.gtag) return {}

  const read = (field: 'client_id' | 'session_id') =>
    new Promise<string | undefined>((resolve) => {
      const timer = window.setTimeout(() => resolve(undefined), 800)
      window.gtag?.('get', measurementId, field, (value: unknown) => {
        window.clearTimeout(timer)
        resolve(typeof value === 'string' || typeof value === 'number' ? String(value) : undefined)
      })
    })

  const [ga_client_id, ga_session_id] = await Promise.all([read('client_id'), read('session_id')])
  return { ga_client_id, ga_session_id }
}
