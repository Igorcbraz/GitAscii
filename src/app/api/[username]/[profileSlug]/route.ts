import { NextResponse } from 'next/server'

import { WIDGET_IDS } from '@/constants'
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

          if (
            [
              WIDGET_IDS.GITHUB_README_STATS as string,
              WIDGET_IDS.STREAK_STATS as string,
              WIDGET_IDS.METRICS_CARD as string,
            ].includes(w)
          ) {
            wWidth = 390
            wHeight = 210
          } else if (
            [
              WIDGET_IDS.ACTIVITY_GRAPH as string,
              WIDGET_IDS.CONTRIBUTION_SNAKE as string,
              WIDGET_IDS.README_QUOTES as string,
            ].includes(w)
          ) {
            wWidth = 800
            wHeight = 210
          } else if (w === WIDGET_IDS.STATS || w === 'streak') {
            wWidth = 390
          } else if (
            [
              WIDGET_IDS.GODPROFILE_TERMINAL as string,
              WIDGET_IDS.GODPROFILE_MARQUEE as string,
              WIDGET_IDS.GODPROFILE_NEURAL as string,
              WIDGET_IDS.GODPROFILE_TROPHIES as string,
              WIDGET_IDS.GODPROFILE_WAKATIME as string,
              WIDGET_IDS.GODPROFILE_GLOBE as string,
              WIDGET_IDS.ASCII_PORTRAIT as string,
              WIDGET_IDS.ASCII_INFO as string,
              WIDGET_IDS.ASCII_HEATMAP as string,
              WIDGET_IDS.CONTROLPLANE_SYSTEM_LOOP as string,
              WIDGET_IDS.CONTROLPLANE_COMMAND_DECK as string,
              WIDGET_IDS.CONTROLPLANE_SIGNAL_GRID as string,
              WIDGET_IDS.CONTROLPLANE_METRO as string,
              WIDGET_IDS.CONTROLPLANE_BENTO as string,
            ].includes(w)
          ) {
            const defaultSizeMap: Record<string, { width: number; height: number }> = {
              [WIDGET_IDS.GODPROFILE_TERMINAL]: { width: 450, height: 300 },
              [WIDGET_IDS.GODPROFILE_MARQUEE]: { width: 800, height: 120 },
              [WIDGET_IDS.GODPROFILE_NEURAL]: { width: 800, height: 320 },
              [WIDGET_IDS.GODPROFILE_TROPHIES]: { width: 800, height: 280 },
              [WIDGET_IDS.GODPROFILE_WAKATIME]: { width: 420, height: 260 },
              [WIDGET_IDS.GODPROFILE_GLOBE]: { width: 320, height: 350 },
              [WIDGET_IDS.ASCII_PORTRAIT]: { width: 370, height: 400 },
              [WIDGET_IDS.ASCII_INFO]: { width: 490, height: 400 },
              [WIDGET_IDS.ASCII_HEATMAP]: { width: 780, height: 240 },
              [WIDGET_IDS.CONTROLPLANE_SYSTEM_LOOP]: { width: 800, height: 360 },
              [WIDGET_IDS.CONTROLPLANE_COMMAND_DECK]: { width: 800, height: 300 },
              [WIDGET_IDS.CONTROLPLANE_SIGNAL_GRID]: { width: 800, height: 320 },
              [WIDGET_IDS.CONTROLPLANE_METRO]: { width: 800, height: 350 },
              [WIDGET_IDS.CONTROLPLANE_BENTO]: { width: 800, height: 340 },
              [WIDGET_IDS.CODEWEB_HERO_ORBIT]: { width: 800, height: 360 },
              [WIDGET_IDS.CODEWEB_RETRO_GRID]: { width: 800, height: 220 },
              [WIDGET_IDS.CODEWEB_SHOWCASE_CARDS]: { width: 800, height: 260 },
              [WIDGET_IDS.CODEWEB_SOCIAL_BADGE]: { width: 800, height: 44 },
              [WIDGET_IDS.CODEWEB_MINIMAL_BADGE]: { width: 800, height: 44 },
            }
            wWidth = defaultSizeMap[w]?.width || 800
            wHeight = defaultSizeMap[w]?.height || 210
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
