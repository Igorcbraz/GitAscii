import { sendGAEvent } from '@next/third-parties/google'

import { AnalyticsProvider } from './interface'
import { AnalyticsEvents, ConsentState, UserProperties } from './types'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: Object[]
  }
}

function cleanPayload(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  return Object.entries(obj).reduce((acc, [key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      acc[key] = typeof val === 'object' && !Array.isArray(val) ? cleanPayload(val) : val
    }
    return acc
  }, {} as any)
}

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  private isProd: boolean

  constructor() {
    this.isProd =
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
  }

  init() {
    if (typeof window === 'undefined') return

    if (!window.gtag) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function (..._args: any[]) {
        window.dataLayer?.push(arguments)
      }
    }

    this.updateConsent({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  }

  identify(userId: string, properties?: UserProperties) {
    if (typeof window === 'undefined') return

    const cleanedProperties = properties ? cleanPayload(properties) : undefined

    if (!this.isProd) {
      console.log(`[Analytics Dev] Identify User: ${userId}`, cleanedProperties)
      return
    }

    if (window.gtag) {
      window.gtag('config', 'G-GDBZXFCBLQ', {
        user_id: userId,
      })
      if (cleanedProperties) {
        this.setUserProperties(cleanedProperties)
      }
    }
  }

  setUserProperties(properties: UserProperties) {
    if (typeof window === 'undefined') return

    const cleanedProperties = cleanPayload(properties)

    if (!this.isProd) {
      console.log('[Analytics Dev] Set User Properties:', cleanedProperties)
      return
    }

    if (window.gtag) {
      window.gtag('set', 'user_properties', cleanedProperties)
    }
  }

  track<E extends keyof AnalyticsEvents>(event: E, params?: AnalyticsEvents[E]) {
    if (typeof window === 'undefined') return

    const cleanedParams = params ? cleanPayload(params) : undefined

    if (!this.isProd) {
      console.log(`[Analytics Dev] Event [${event}]:`, cleanedParams)
      return
    }

    try {
      sendGAEvent({
        event: event,
        value: cleanedParams,
      })
    } catch (err) {
      console.error('[GA Error Tracking Event]:', err)
    }
  }

  trackPageView(url: string, title?: string) {
    if (typeof window === 'undefined') return

    if (!this.isProd) {
      console.log(`[Analytics Dev] PageView: ${url} (${title || 'No Title'})`)
      return
    }

    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_title: title,
      })
    }
  }

  trackError(
    type: 'api_error' | 'generate_failed' | 'widget_error' | 'markdown_error' | 'render_error',
    error: any,
    context?: Record<string, any>
  ) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined

    const payload = {
      message,
      stack,
      ...context,
    }

    this.track(type, payload as any)
  }

  updateConsent(consent: ConsentState) {
    if (typeof window === 'undefined') return

    if (!this.isProd) {
      console.log('[Analytics Dev] Update Consent Mode v2:', consent)
    }

    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consent.analytics_storage,
        ad_storage: consent.ad_storage,
        ad_user_data: consent.ad_user_data,
        ad_personalization: consent.ad_personalization,
      })
    }
  }
}
