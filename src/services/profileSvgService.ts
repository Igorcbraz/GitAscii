import { after, NextResponse } from 'next/server'

import { embedExternalImages, renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { WIDGET_CATALOG } from '@/features/editor/config/widgets'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'
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
  const { username, profileSlug = 'default', template, widgets } = options

  if (!username) {
    return new NextResponse('Username is required', { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  let theme: 'dark' | 'light' = options.theme || 'dark'
  const queryTheme = searchParams.get('theme')
  if (queryTheme === 'light' || queryTheme === 'dark') {
    theme = queryTheme
  }

  const templateParam = template || searchParams.get('template')
  const widgetsParam = widgets || (searchParams.get('widgets')?.split(',').filter(Boolean) ?? null)

  try {
    const data = await fetchGitHubProfile(username)

    let config
    if (templateParam) {
      config = createConfiguration(data.user.id, data.user.login, templateParam, profileSlug)
    } else {
      config = await loadProfileConfig(username, profileSlug)
      if (!config) {
        config = createConfiguration(data.user.id, data.user.login, 'terminal', profileSlug)
      }
    }

    if (widgetsParam && widgetsParam.length > 0) {
      for (const w of widgetsParam) {
        if (!config.widgets.some((cw: any) => cw.widgetId === w || cw.instanceId === w)) {
          let wWidth = 800
          let wHeight = 210

          const catalogItem = WIDGET_CATALOG.find((item) => item.id === w)
          if (catalogItem?.defaultSize) {
            wWidth = catalogItem.defaultSize.width
            wHeight = catalogItem.defaultSize.height
          } else if (['github-readme-stats', 'streak-stats', 'metrics-card'].includes(w)) {
            wWidth = 390
            wHeight = 210
          } else if (['activity-graph', 'contribution-snake', 'readme-quotes'].includes(w)) {
            wWidth = 800
            wHeight = 210
          } else if (w === 'stats' || w === 'streak') {
            wWidth = 390
            wHeight = 210
          }

          config.widgets.push({
            instanceId: `temp-${w}`,
            widgetId: w,
            position: { x: 0, y: 0 },
            size: { width: wWidth, height: wHeight },
            config: {},
            locked: false,
            visible: true,
            zIndex: 99,
          })
        }
      }
    }

    const rawSvgContent = renderSvg(config, data, { theme, widgets: widgetsParam || undefined })
    const svgContent = await embedExternalImages(rawSvgContent)

    const etag = computeEtag(svgContent)
    const ifNoneMatch = request.headers.get('if-none-match')

    const headers: Record<string, string> = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
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
    const message = error instanceof Error ? error.message : 'Error rendering SVG'
    const escaped = escapeErrorXml(message)
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="10" y="35" fill="red">${escaped}</text></svg>`,
      {
        status: 500,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    )
  }
}
