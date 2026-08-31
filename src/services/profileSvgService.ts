import * as Sentry from '@sentry/nextjs'
import { after, NextResponse } from 'next/server'

import { embedExternalImages } from '@/engine/core/embedExternalImages'
import { renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { WIDGET_CATALOG } from '@/features/editor/config/widgets'
import { fetchGitHubProfile, GitHubUserNotFoundError } from '@/features/github/api/fetchProfile'
import { parseViewerMetadata, recordProfileView } from '@/lib/analytics/profileMetrics'
import { loadProfileConfig } from '@/lib/profileStorage'
import { sanitizeSvg } from '@/utils/svgSanitizer'

export interface ProfileSvgRequestOptions {
  username: string
  profileSlug?: string
  theme?: 'dark' | 'light'
  template?: string | null
  widgets?: string[] | null
  isExplicitSlug?: boolean
}

interface SvgCacheEntry {
  svgContent: string
  etag: string
  hasErrors: boolean
  timestamp: number
}

const svgResponseCache = new Map<string, SvgCacheEntry>()
const SVG_CACHE_TTL_MS = 10 * 60 * 1000
const MAX_CACHE_ENTRIES = 300

function getCachedSvg(key: string): SvgCacheEntry | null {
  const entry = svgResponseCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > SVG_CACHE_TTL_MS) {
    svgResponseCache.delete(key)
    return null
  }
  return entry
}

function setCachedSvg(key: string, entry: SvgCacheEntry): void {
  if (svgResponseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = svgResponseCache.keys().next().value
    if (oldestKey) svgResponseCache.delete(oldestKey)
  }
  svgResponseCache.set(key, entry)
}

export function invalidateSvgCache(username?: string): void {
  if (!username) {
    svgResponseCache.clear()
    return
  }
  const prefix = `${username.toLowerCase()}:`
  for (const key of svgResponseCache.keys()) {
    if (key.startsWith(prefix)) {
      svgResponseCache.delete(key)
    }
  }
}

function computeEtag(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return `W/"gitascii-${Math.abs(hash).toString(36)}"`
}

function escapeErrorXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function generateProfileSvgResponse(
  request: Request,
  options: ProfileSvgRequestOptions
): Promise<NextResponse> {
  const startTime = Date.now()
  const rawUsername = options.username || ''
  const username = rawUsername.replace(/[^a-zA-Z0-9_-]/g, '')

  if (!username) {
    return new NextResponse('Username is required', { status: 400 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const previewDateParam = searchParams.get('preview_date') || searchParams.get('date')
    const timezoneParam = searchParams.get('timezone') || searchParams.get('tz')

    let profileSlug = (options.profileSlug || 'default').replace(/[^a-zA-Z0-9_-]/g, '') || 'default'
    let isDynamicResolved = false

    if (!options.isExplicitSlug && (!options.profileSlug || options.profileSlug === 'default')) {
      try {
        const { evaluateDynamicProfile } = await import('@/features/pro/server/dynamicRulesStore')
        const dynamicResult = await evaluateDynamicProfile(username, {
          simulatedDate: previewDateParam || undefined,
          simulatedTimezone: timezoneParam || undefined,
          requestHeaders: request.headers,
        })
        if (dynamicResult?.selectedProfileSlug) {
          profileSlug = dynamicResult.selectedProfileSlug
          isDynamicResolved = !dynamicResult.isFallback
        }
      } catch (dynErr) {
        console.warn(
          '[ProfileSvgService] Dynamic profile evaluation failed, using default:',
          dynErr
        )
      }
    }

    const queryTheme = searchParams.get('theme')
    const theme: 'dark' | 'light' =
      queryTheme === 'light' || queryTheme === 'dark' ? queryTheme : options.theme || 'dark'

    const rawTemplate = searchParams.get('template') || options.template || ''
    const templateParam = rawTemplate ? rawTemplate.toLowerCase().replace(/[^a-z0-9_-]/g, '') : null

    const rawWidgets = searchParams.get('widgets') || searchParams.get('widget')
    const widgetsParam = rawWidgets
      ? rawWidgets
          .split(',')
          .map((w) => w.trim().replace(/[^a-zA-Z0-9_-]/g, ''))
          .filter(Boolean)
      : options.widgets?.map((w) => w.replace(/[^a-zA-Z0-9_-]/g, '')).filter(Boolean)

    const vParam = searchParams.get('v') || searchParams.get('t') || ''
    const cacheKey = `${username.toLowerCase()}:${profileSlug}:${theme}:${templateParam || 'default'}:${(widgetsParam || []).sort().join(',')}:${vParam}`

    let svgContent: string
    let etag: string
    let hasErrors: boolean
    let renderedWidgetIds: string[] = []

    const cachedEntry = getCachedSvg(cacheKey)
    if (cachedEntry) {
      svgContent = cachedEntry.svgContent
      etag = cachedEntry.etag
      hasErrors = cachedEntry.hasErrors
    } else {
      const data = await fetchGitHubProfile(username)

      let config = await loadProfileConfig(username, profileSlug)

      if (!config) {
        const templateId = templateParam || 'terminal'
        config = createConfiguration(
          data.user.id,
          data.user.login,
          templateId,
          profileSlug,
          'Default',
          data
        )
      }

      if (widgetsParam && widgetsParam.length > 0) {
        for (const widgetId of widgetsParam) {
          const item = WIDGET_CATALOG.find((w) => w.id === widgetId)
          if (!item) continue
          const safeWidgetId = item.id
          const hasWidget = config.widgets.some((w: any) => w.widgetId === safeWidgetId)
          if (!hasWidget) {
            config.widgets.push({
              instanceId: `${safeWidgetId}-query-${Date.now()}`,
              widgetId: safeWidgetId,
              position: { x: 20, y: 20 },
              size: item.defaultSize || { width: 400, height: 200 },
              config: {},
              locked: false,
              visible: true,
              zIndex: 99,
            })
          }
        }
      }

      renderedWidgetIds = config.widgets.map((w: any) => w.widgetId || 'widget')

      const rawSvgContent = renderSvg(config, data, { theme, widgets: widgetsParam || undefined })
      const embedResult = await embedExternalImages(rawSvgContent)
      svgContent = sanitizeSvg(embedResult.svg)
      etag = computeEtag(svgContent)
      hasErrors = embedResult.hasErrors

      setCachedSvg(cacheKey, {
        svgContent,
        etag,
        hasErrors,
        timestamp: Date.now(),
      })
    }
    const ifNoneMatch = request.headers.get('if-none-match')

    const cacheControl = hasErrors
      ? 'public, max-age=0, s-maxage=120, stale-while-revalidate=300'
      : isDynamicResolved
        ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=180'
        : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=7200'

    const cdnCacheControl = hasErrors
      ? 'public, s-maxage=120, stale-while-revalidate=300'
      : isDynamicResolved
        ? 'public, s-maxage=60, stale-while-revalidate=180'
        : 'public, s-maxage=3600, stale-while-revalidate=7200'

    const headers: Record<string, string> = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': cacheControl,
      'CDN-Cache-Control': cdnCacheControl,
      ETag: etag,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; img-src data: https:;",
    }

    const isCacheHit = ifNoneMatch === etag
    const renderTimeMs = Date.now() - startTime
    const viewerMeta = parseViewerMetadata(request)

    try {
      const metricPayload = {
        username,
        profileSlug,
        theme,
        renderTimeMs,
        isCamoProxy: viewerMeta.isCamoProxy,
        isCacheHit,
        userAgent: viewerMeta.userAgent,
        referrer: viewerMeta.referrer,
        country: viewerMeta.country,
        region: viewerMeta.region,
        city: viewerMeta.city,
        timezone: viewerMeta.timezone,
        continent: viewerMeta.continent,
        language: viewerMeta.language,
        ip: viewerMeta.ip,
        statusCode: isCacheHit ? 304 : 200,
        timestamp: new Date().toISOString(),
      }

      const telemetryHandler = async () => {
        await recordProfileView(metricPayload)

        try {
          const { recordRenderTelemetry } =
            await import('@/features/pro/server/healthMonitoringStore')
          await recordRenderTelemetry({
            username,
            profileSlug,
            durationMs: renderTimeMs,
            statusCode: isCacheHit ? 304 : 200,
            hasErrors,
            renderedWidgets:
              renderedWidgetIds.length > 0
                ? renderedWidgetIds
                : ['avatar-card', 'stats-cards', 'streak-graph'],
            widgetErrors: hasErrors
              ? [
                  {
                    username,
                    profileSlug,
                    widgetId: 'external-widget',
                    widgetName: 'External Dynamic Embed',
                    errorType: 'FETCH_TIMEOUT',
                    message: 'External widget or image asset timed out or failed to load',
                  },
                ]
              : undefined,
          })
        } catch {}
      }

      if (typeof after === 'function') {
        after(telemetryHandler)
      } else {
        void telemetryHandler()
      }
    } catch {}

    if (isCacheHit) {
      return new NextResponse(null, {
        status: 304,
        headers,
      })
    }

    return new NextResponse(svgContent, {
      status: 200,
      headers,
    })
  } catch (error: unknown) {
    const isNotFound =
      error instanceof GitHubUserNotFoundError ||
      (error instanceof Error && error.message.toLowerCase().includes('not found'))

    if (!isNotFound) {
      Sentry.captureException(error)
    }

    const message = error instanceof Error ? error.message : 'Error rendering SVG'
    const escaped = escapeErrorXml(message.replace(/[\r\n]/g, ' '))
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="10" y="35" fill="red">${escaped}</text></svg>`,
      {
        status: isNotFound ? 404 : 500,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline';",
        },
      }
    )
  }
}
