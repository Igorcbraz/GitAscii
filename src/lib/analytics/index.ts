'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { getConsentChoice } from '@/lib/consent'
import { ConsentBanner } from '@/lib/consent/ConsentBanner'
import { safeStorage } from '@/utils/storage'

import { GoogleAnalyticsProvider } from './google-analytics'
import { AnalyticsProvider } from './interface'
import { AnalyticsEvents, ConsentState, UserProperties } from './types'

export const analytics: AnalyticsProvider = new GoogleAnalyticsProvider()

if (typeof window !== 'undefined') {
  analytics.init()
}

export function useAnalytics() {
  return {
    generateReadme: (params: AnalyticsEvents['generate_readme']) => {
      analytics.track('generate_readme', params)
    },

    previewTemplate: (params: AnalyticsEvents['preview_template']) => {
      analytics.track('preview_template', params)
    },

    templateSelected: (params: AnalyticsEvents['template_selected']) => {
      analytics.track('template_selected', params)
    },

    widgetAdded: (params: AnalyticsEvents['widget_added']) => {
      analytics.track('widget_added', params)
    },

    widgetRemoved: (params: AnalyticsEvents['widget_removed']) => {
      analytics.track('widget_removed', params)
    },

    copyMarkdown: (params: AnalyticsEvents['copy_markdown']) => {
      analytics.track('copy_markdown', params)
    },

    copySvg: (params: AnalyticsEvents['copy_svg']) => {
      analytics.track('copy_svg', params)
    },

    downloadSvg: (params: AnalyticsEvents['download_svg']) => {
      analytics.track('download_svg', params)
    },

    downloadPng: (params: AnalyticsEvents['download_png']) => {
      analytics.track('download_png', params)
    },

    publishProfile: (params: AnalyticsEvents['publish_profile']) => {
      analytics.track('publish_profile', params)
    },

    shareProfile: (params: AnalyticsEvents['share_profile']) => {
      analytics.track('share_profile', params)
    },

    openEditor: (params: AnalyticsEvents['open_editor']) => {
      analytics.track('open_editor', params)
    },

    usernameChecked: (params: AnalyticsEvents['username_checked']) => {
      analytics.track('username_checked', params)
    },

    apiRequest: (params: AnalyticsEvents['api_request']) => {
      analytics.track('api_request', params)
    },

    apiSuccess: (params: AnalyticsEvents['api_success']) => {
      analytics.track('api_success', params)
    },

    apiError: (params: AnalyticsEvents['api_error']) => {
      analytics.track('api_error', params)
    },

    login: (params: AnalyticsEvents['login']) => {
      if (params.userId) {
        analytics.identify(params.userId, { plan: 'free' })
      }
      analytics.track('login', params)
    },

    signup: (params: AnalyticsEvents['signup']) => {
      if (params.userId) {
        analytics.identify(params.userId, { plan: 'free' })
      }
      analytics.track('signup', params)
    },

    trackError: (
      type: 'api_error' | 'generate_failed' | 'widget_error' | 'markdown_error' | 'render_error',
      error: any,
      context?: Record<string, any>
    ) => {
      analytics.trackError(type, error, context)
    },

    identify: (userId: string, properties?: UserProperties) => {
      analytics.identify(userId, properties)
    },

    setUserProperties: (properties: UserProperties) => {
      analytics.setUserProperties(properties)
    },

    updateConsent: (consent: ConsentState) => {
      analytics.updateConsent(consent)
    },

    track: <E extends keyof AnalyticsEvents>(event: E, params?: AnalyticsEvents[E]) => {
      analytics.track(event, params)
    },
  }
}

function RouteTrackListener() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string>('')

  useEffect(() => {
    if (!pathname) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    if (lastTrackedPath.current === url) return
    lastTrackedPath.current = url
    analytics.trackPageView(url, typeof document !== 'undefined' ? document.title : '')
  }, [pathname, searchParams])

  return null
}

export function AutoAnalyticsTracker({ children }: { children: React.ReactNode }) {
  const editorStartTime = useRef<number | null>(null)
  const previewStartTime = useRef<number | null>(null)

  const [consentGranted, setConsentGranted] = useState<boolean>(false)

  const applyGrantedConsent = useCallback(() => {
    analytics.updateConsent({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  }, [])

  useEffect(() => {
    const stored = getConsentChoice()
    if (stored === 'granted') {
      applyGrantedConsent()
      setConsentGranted(true)
    }
  }, [applyGrantedConsent])

  const handleConsentDecision = useCallback(
    (choice: 'granted' | 'denied') => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('analytics-consent-decision', { detail: { choice } }))
      }

      if (choice === 'granted') {
        applyGrantedConsent()
        setConsentGranted(true)
        analytics.track('session_start')
      } else {
        analytics.updateConsent({
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        })
        setConsentGranted(false)
      }
    },
    [applyGrantedConsent]
  )

  useEffect(() => {
    const isFirstVisit = !safeStorage.getItem('gitascii_visited')
    if (isFirstVisit) {
      analytics.track('first_visit')
      safeStorage.setItem('gitascii_visited', 'true')
    }
    analytics.track('session_start')

    const handleFirstInteraction = (e: Event) => {
      analytics.track('first_interaction', { action: e.type })
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
    window.addEventListener('click', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)

    const handleVisibilityChange = () => {
      const isEditor = window.location.pathname.includes('/editor')
      if (document.hidden) {
        flushTimers()
      } else {
        if (isEditor) editorStartTime.current = Date.now()
        else previewStartTime.current = Date.now()
      }
    }

    const flushTimers = () => {
      if (editorStartTime.current) {
        const duration = Math.round((Date.now() - editorStartTime.current) / 1000)
        if (duration > 0) {
          analytics.track('editor_time', { durationSeconds: duration })
        }
        editorStartTime.current = null
      }
      if (previewStartTime.current) {
        const duration = Math.round((Date.now() - previewStartTime.current) / 1000)
        if (duration > 0) {
          analytics.track('preview_time', { durationSeconds: duration })
        }
        previewStartTime.current = null
      }
    }

    const pathname = window.location.pathname
    if (pathname.includes('/editor')) {
      editorStartTime.current = Date.now()
    } else {
      previewStartTime.current = Date.now()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', flushTimers)

    const handleGlobalError = (event: ErrorEvent) => {
      if (!event.error && !event.message) return
      analytics.trackError('render_error', event.error || new Error(event.message), {
        context: 'window_onerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(
        'render_error',
        event.reason || new Error('Unhandled promise rejection'),
        {
          context: 'window_onunhandledrejection',
        }
      )
    }

    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      flushTimers()
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', flushTimers)
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Suspense, { fallback: null }, React.createElement(RouteTrackListener)),
    React.createElement(ConsentBanner, { onConsent: handleConsentDecision }),
    children
  )
}

export type { ConsentState }
