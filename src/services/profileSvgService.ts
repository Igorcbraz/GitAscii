import * as Sentry from '@sentry/nextjs'
import { after, NextResponse } from 'next/server'

import { embedExternalImages, renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { WIDGET_CATALOG } from '@/features/editor/config/widgets'
import { fetchGitHubProfile, GitHubUserNotFoundError } from '@/features/github/api/fetchProfile'
import { parseViewerMetadata, recordProfileView } from '@/lib/analytics/profileMetrics'
import { loadProfileConfig } from '@/lib/profileStorage'

export interface ProfileSvgRequestOptions {
  username: string
  profileSlug?: string
  theme?: 'dark' | 'light'
  template?: string | null
  widgets?: string[] | null
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
  const { username, profileSlug = 'default' } = options

  if (!username) {
    return new NextResponse('Username is required', { status: 400 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const queryTheme = searchParams.get('theme')
    const theme: 'dark' | 'light' =
      queryTheme === 'light' || queryTheme === 'dark' ? queryTheme : options.theme || 'dark'

    const templateParam = searchParams.get('template') || options.template
    const widgetsParam = searchParams.get('widgets')?.split(',').filter(Boolean) || options.widgets

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
        const hasWidget = config.widgets.some((w: any) => w.widgetId === widgetId)
        if (!hasWidget) {
          const item = WIDGET_CATALOG.find((w) => w.id === widgetId)
          config.widgets.push({
            instanceId: `${widgetId}-query-${Date.now()}`,
            widgetId,
            position: { x: 20, y: 20 },
            size: item?.defaultSize || { width: 400, height: 200 },
            config: {},
            locked: false,
            visible: true,
            zIndex: 99,
          })
        }
      }
    }

    const rawSvgContent = renderSvg(config, data, { theme, widgets: widgetsParam || undefined })
    const { svg: svgContent, hasErrors } = await embedExternalImages(rawSvgContent)

    const etag = computeEtag(svgContent)
    const ifNoneMatch = request.headers.get('if-none-match')

    // Healthy cache: 1 hour fresh, 2 hours stale-while-revalidate
    // Degraded/error cache: 5 minutes fresh, 10 minutes stale-while-revalidate
    const cacheControl = hasErrors
      ? 'public, max-age=0, s-maxage=300, stale-while-revalidate=600'
      : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=7200'

    const cdnCacheControl = hasErrors
      ? 'public, s-maxage=300, stale-while-revalidate=600'
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

    // Non-blocking telemetry ingestion
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
        ip: viewerMeta.ip,
        timestamp: new Date().toISOString(),
      }

      if (typeof after === 'function') {
        after(async () => {
          await recordProfileView(metricPayload)
        })
      } else {
        // Fallback fire-and-forget
        void recordProfileView(metricPayload)
      }
    } catch {
      // Ignore background telemetry errors
    }

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
    const escaped = escapeErrorXml(message)
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="10" y="35" fill="red">${escaped}</text></svg>`,
      {
        status: isNotFound ? 404 : 500,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    )
  }
}
