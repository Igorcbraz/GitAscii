import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getGAIdentifiers } from './commerce'
import { GoogleAnalyticsProvider } from './google-analytics'

describe('GoogleAnalyticsProvider', () => {
  beforeEach(() => {
    const storage: Record<string, string> = {}
    const localStorageMock = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => {
        storage[key] = val
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
      clear: () => {
        for (const k in storage) delete storage[k]
      },
    }
    vi.stubGlobal('localStorage', localStorageMock)
    vi.stubGlobal('window', {
      dataLayer: [],
      location: {
        hostname: 'gitascii.com',
        origin: 'https://gitascii.com',
      },
      setTimeout: (fn: Function, ms: number) => setTimeout(fn, ms),
      clearTimeout: (id: any) => clearTimeout(id),
    })
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST123')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('initializes with analytics_storage granted by default', () => {
    const provider = new GoogleAnalyticsProvider()
    provider.init()

    expect(window.gtag).toBeDefined()
    const consentCall = (window.dataLayer as any[])?.find(
      (args) => args[0] === 'consent' && args[1] === 'default'
    )
    expect(consentCall).toBeDefined()
    expect(consentCall[2]).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  })

  it('tracks events regardless of user consent', () => {
    const provider = new GoogleAnalyticsProvider()
    provider.init()

    const gtagSpy = vi.fn()
    window.gtag = gtagSpy

    provider.track('open_editor', { entryPoint: 'hero' })
    expect(gtagSpy).toHaveBeenCalledWith('event', 'open_editor', { entryPoint: 'hero' })
  })

  it('tracks page views regardless of user consent', () => {
    const provider = new GoogleAnalyticsProvider()
    provider.init()

    const gtagSpy = vi.fn()
    window.gtag = gtagSpy

    provider.trackPageView('/editor', 'Editor')
    expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/editor',
      page_location: 'https://gitascii.com/editor',
      page_title: 'Editor',
    })
  })

  it('identifies users and sets properties regardless of consent', () => {
    const provider = new GoogleAnalyticsProvider()
    provider.init()

    const gtagSpy = vi.fn()
    window.gtag = gtagSpy

    provider.identify('user-123', { plan: 'pro' })
    expect(gtagSpy).toHaveBeenCalledWith('config', 'G-TEST123', {
      user_id: 'user-123',
      send_page_view: false,
    })
    expect(gtagSpy).toHaveBeenCalledWith('set', 'user_properties', { plan: 'pro' })
  })

  it('resolves GA identifiers from getGAIdentifiers without requiring consent', async () => {
    window.gtag = ((...args: any[]) => {
      const [_action, _id, field, cb] = args
      if (typeof cb === 'function') {
        cb(field === 'client_id' ? '123.456' : '789')
      }
    }) as any

    const ids = await getGAIdentifiers()
    expect(ids).toEqual({
      ga_client_id: '123.456',
      ga_session_id: '789',
    })
  })
})
