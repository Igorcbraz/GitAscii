import { NextResponse } from 'next/server'

import { generateProfileSvgResponse } from '@/services/profileSvgService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ svgPath: string[] }> }
) {
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

  return generateProfileSvgResponse(request, {
    username,
    profileSlug,
    theme,
    template: templateParam,
    widgets,
  })
}
