import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { embedExternalImages, renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { fetchGitHubProfile, GitHubUserNotFoundError } from '@/features/github/api/fetchProfile'
import { loadProfileConfig } from '@/lib/profileStorage'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ svgPath: string[] }> }
) {
  try {
    const { svgPath } = await params

    if (!svgPath || svgPath.length === 0) {
      return new NextResponse('Invalid SVG route', { status: 400 })
    }

    const pathSegments = [...svgPath]
    if (pathSegments[0] === 'api') {
      pathSegments.shift()
    }

    if (pathSegments.length === 0) {
      return new NextResponse('Invalid SVG route', { status: 400 })
    }

    let username = ''
    let profileSlug = 'default'
    let theme: 'dark' | 'light' = 'dark'

    const { searchParams } = new URL(request.url)
    const queryTheme = searchParams.get('theme')
    if (queryTheme === 'light' || queryTheme === 'dark') {
      theme = queryTheme
    }

    if (pathSegments.length === 1) {
      const file = pathSegments[0]
      if (file.endsWith('.svg')) {
        const parts = file.split('.')
        username = parts[0]
      } else {
        username = file
      }
    } else if (pathSegments.length === 2) {
      username = pathSegments[0]
      const file = pathSegments[1]
      if (file.endsWith('.svg')) {
        const variant = file.replace('.svg', '')
        if (variant === 'light') theme = 'light'
        else if (variant === 'dark') theme = 'dark'
        else profileSlug = variant
      } else {
        profileSlug = file
      }
    } else if (pathSegments.length >= 3) {
      username = pathSegments[0]
      profileSlug = pathSegments[1]
      const file = pathSegments[2]
      if (file.endsWith('.svg')) {
        const variant = file.replace('.svg', '')
        theme = variant === 'light' ? 'light' : 'dark'
      }
    }

    const widgetsParam = searchParams.get('widgets') || searchParams.get('widget')
    const widgets = widgetsParam
      ? widgetsParam
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean)
      : undefined

    const templateParam =
      searchParams.get('template') ||
      (queryTheme && queryTheme !== 'light' && queryTheme !== 'dark' ? queryTheme : null)

    const data = await fetchGitHubProfile(username)

    let config = await loadProfileConfig(username, profileSlug)
    if (!config) {
      const cleanTemplate = templateParam
        ? templateParam
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '')
            .replace(/-/g, '')
        : 'terminal'
      config = createConfiguration(
        data.user.id,
        data.user.login,
        cleanTemplate,
        profileSlug,
        'Default',
        data
      )
    }

    const rawSvgContent = renderSvg(config, data, { theme, widgets })
    const svgContent = await embedExternalImages(rawSvgContent)

    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:;",
      },
    })
  } catch (error: unknown) {
    const isNotFound =
      error instanceof GitHubUserNotFoundError ||
      (error instanceof Error && error.message.toLowerCase().includes('not found'))

    if (!isNotFound) {
      Sentry.captureException(error)
    }

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
        status: isNotFound ? 404 : 500,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    )
  }
}
