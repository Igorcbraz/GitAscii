import { NextResponse } from 'next/server'

import { embedExternalImages, renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'
import { loadProfileConfig } from '@/lib/profileStorage'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string; profileSlug: string }> }
) {
  try {
    const { username, profileSlug } = await params
    if (!username || !profileSlug) {
      return new NextResponse('Username and Profile Slug are required', { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    let theme: 'dark' | 'light' = 'dark'
    const queryTheme = searchParams.get('theme')
    if (queryTheme === 'light' || queryTheme === 'dark') {
      theme = queryTheme
    }

    const widgetsParam = searchParams.get('widgets')
    const widgets = widgetsParam ? widgetsParam.split(',') : undefined

    const data = await fetchGitHubProfile(username)

    const templateParam = searchParams.get('template')
    let config
    if (templateParam) {
      config = createConfiguration(data.user.id, data.user.login, templateParam, profileSlug)
    } else {
      config = await loadProfileConfig(username, profileSlug)
      if (!config) {
        config = createConfiguration(data.user.id, data.user.login, 'terminal', profileSlug)
      }
    }

    if (widgets) {
      for (const w of widgets) {
        if (!config.widgets.some((cw: any) => cw.widgetId === w || cw.instanceId === w)) {
          let wWidth = 800
          let wHeight = 210

          if (['github-readme-stats', 'streak-stats', 'metrics-card'].includes(w)) {
            wWidth = 390
            wHeight = 210
          } else if (['activity-graph', 'contribution-snake', 'readme-quotes'].includes(w)) {
            wWidth = 800
            wHeight = 210
          } else if (w === 'stats' || w === 'streak') {
            wWidth = 390
            wHeight = 210
          } else if (
            [
              'godprofile-terminal',
              'godprofile-marquee',
              'godprofile-neural',
              'godprofile-trophies',
              'godprofile-wakatime',
              'godprofile-globe',
            ].includes(w)
          ) {
            const defaultSizeMap: Record<string, { width: number; height: number }> = {
              'godprofile-terminal': { width: 450, height: 300 },
              'godprofile-marquee': { width: 800, height: 120 },
              'godprofile-neural': { width: 800, height: 320 },
              'godprofile-trophies': { width: 800, height: 280 },
              'godprofile-wakatime': { width: 420, height: 260 },
              'godprofile-globe': { width: 320, height: 350 },
            }
            wWidth = defaultSizeMap[w].width
            wHeight = defaultSizeMap[w].height
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

    const rawSvgContent = renderSvg(config, data, { theme, widgets })
    const svgContent = await embedExternalImages(rawSvgContent)

    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:;",
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error rendering SVG'
    const escapedMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="10" y="35" fill="red">${escapedMessage}</text></svg>`,
      {
        status: 500,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    )
  }
}
