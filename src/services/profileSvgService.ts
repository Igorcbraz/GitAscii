import * as Sentry from '@sentry/nextjs'
import { after, NextResponse } from 'next/server'

import { embedExternalImages } from '@/engine/core/embedExternalImages'
import { renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { WIDGET_CATALOG } from '@/features/editor/config/widgets'
import { fetchGitHubProfile, GitHubUserNotFoundError } from '@/features/github/api/fetchProfile'
import { parseViewerMetadata, recordProfileView } from '@/lib/analytics/profileMetrics'
import { loadProfileConfig } from '@/lib/profileStorage'

import { getCachedProfileSvg } from './profileSvgCache'

export { invalidateSvgCache } from './profileSvgCache'

export interface ProfileSvgRequestOptions {
  username: string
  profileSlug?: string
  theme?: 'dark' | 'light'
  template?: string | null
  widgets?: string[] | null
  isExplicitSlug?: boolean
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

type CloudflareCacheStorage = CacheStorage & { default?: Cache }

function getEdgeCacheRequest(request: Request, username: string): Request | null {
  if (request.method !== 'GET' || typeof caches === 'undefined') return null
  const url = new URL(request.url)
  if (
    url.searchParams.has('preview_date') ||
    url.searchParams.has('date') ||
    url.searchParams.has('timezone') ||
    url.searchParams.has('tz')
  ) {
    return null
  }

  const normalized = new URL(url.origin)
  normalized.pathname = url.pathname.toLowerCase()
  for (const key of ['theme', 'template', 'widgets', 'widget']) {
    const value = url.searchParams.get(key)
    if (value) normalized.searchParams.set(key, value.toLowerCase())
  }
  normalized.searchParams.sort()
  normalized.searchParams.set('__gitascii_user', username)
  return new Request(normalized, { method: 'GET' })
}

function getDefaultEdgeCache(): Cache | null {
  if (typeof caches === 'undefined') return null
  return (caches as CloudflareCacheStorage).default ?? null
}

async function getCachedSvgPayload(
  username: string,
  profileSlug: string,
  theme: 'dark' | 'light',
  templateParam: string | null,
  widgetsParam: string[] | undefined
) {
  return getCachedProfileSvg(
    username,
    [profileSlug, theme, templateParam, widgetsParam],
    async () => {
      const data = await fetchGitHubProfile(username, { publicOnly: true })
      let config = await loadProfileConfig(username, profileSlug, {
        bypassMemory: false,
      })

      // Query widgets must not mutate the saved configuration held by another cache.
      if (config) config = structuredClone(config)

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
              instanceId: `${safeWidgetId}-query`,
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

      const renderedWidgetIds = config.widgets.map((w: any) => w.widgetId || 'widget')

      const rawSvgContent = renderSvg(config, data, { theme, widgets: widgetsParam || undefined })
      const embedResult = await embedExternalImages(rawSvgContent)
      // embedExternalImages already sanitizes the complete result.
      const svgContent = embedResult.svg
      const etag = computeEtag(svgContent)
      const hasErrors = embedResult.hasErrors

      return { svgContent, etag, hasErrors, renderedWidgetIds }
    }
  )
}

export async function generateProfileSvgResponse(
  request: Request,
  options: ProfileSvgRequestOptions
): Promise<NextResponse> {
  const startTime = Date.now()
  const rawUsername = options.username || ''
  const username = rawUsername.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()

  if (!username) {
    return new NextResponse('Username is required', { status: 400 })
  }

  try {
    const edgeCache = getDefaultEdgeCache()
    const edgeCacheRequest = getEdgeCacheRequest(request, username)
    if (edgeCache && edgeCacheRequest) {
      const cachedResponse = await edgeCache.match(edgeCacheRequest)
      if (cachedResponse) {
        const response = new NextResponse(cachedResponse.body, cachedResponse)
        response.headers.set('X-GitAscii-Cache', 'HIT')
        return response
      }
    }

    const { searchParams } = new URL(request.url)
    const previewDateParam = searchParams.get('preview_date') || searchParams.get('date')
    const timezoneParam = searchParams.get('timezone') || searchParams.get('tz')

    let profileSlug =
      (options.profileSlug || 'default').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'default'
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

    const normalizedWidgets = widgetsParam
      ? [...new Set(widgetsParam)]
          .filter((widgetId) => WIDGET_CATALOG.some((widget) => widget.id === widgetId))
          .sort()
          .slice(0, 12)
      : undefined

    const payload = await getCachedSvgPayload(
      username,
      profileSlug,
      theme,
      templateParam,
      normalizedWidgets
    )

    const { svgContent, etag, hasErrors, renderedWidgetIds } = payload
    const ifNoneMatch = request.headers.get('if-none-match')

    const cacheControl = hasErrors
      ? 'public, max-age=60'
      : isDynamicResolved
        ? 'public, max-age=30'
        : 'public, max-age=300'

    const cdnCacheControl = hasErrors
      ? 'public, max-age=120, stale-while-revalidate=300'
      : isDynamicResolved
        ? 'public, max-age=60, stale-while-revalidate=180'
        : 'public, max-age=300, stale-while-revalidate=3600'

    const headers: Record<string, string> = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': cacheControl,
      'CDN-Cache-Control': cdnCacheControl,
      'Cloudflare-CDN-Cache-Control': cdnCacheControl,
      ETag: etag,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; img-src data: https:;",
      'X-GitAscii-Cache': 'MISS',
    }

    const isCacheHit =
      ifNoneMatch
        ?.split(',')
        .some(
          (value) =>
            value.trim() === '*' || value.trim().replace(/^W\//, '') === etag.replace(/^W\//, '')
        ) ?? false
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
        const sampleRate = Number(process.env.PROFILE_TELEMETRY_SAMPLE_RATE || '0.01')
        if (!Number.isFinite(sampleRate) || sampleRate <= 0 || Math.random() > sampleRate) return

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

    const response = new NextResponse(svgContent, {
      status: 200,
      headers,
    })
    if (edgeCache && edgeCacheRequest && !hasErrors) {
      // Vinext marks dynamic route responses as `no-store` before they leave the
      // Worker. Store an independent, cacheable Response so that framework
      // headers cannot make the Cache API silently reject this entry.
      const cacheResponse = new Response(svgContent, {
        status: 200,
        headers: new Headers(headers),
      })
      await edgeCache.put(edgeCacheRequest, cacheResponse)
    }
    return response
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
