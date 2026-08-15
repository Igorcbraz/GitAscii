import { NextResponse } from 'next/server'

import { generateProfileSvgResponse } from '@/services/profileSvgService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params

  if (!path || path.length === 0) {
    return new NextResponse('Invalid SVG route', { status: 400 })
  }

  let username = ''
  let profileSlug = 'default'
  let theme: 'dark' | 'light' | undefined = undefined

  if (path.length === 1) {
    const file = path[0]
    username = file.replace('.svg', '')
  } else if (path.length === 2) {
    username = path[0]
    const file = path[1]
    if (file.endsWith('.svg')) {
      const variant = file.replace('.svg', '')
      if (variant === 'light') theme = 'light'
      else if (variant === 'dark') theme = 'dark'
      else profileSlug = variant
    }
  } else if (path.length >= 3) {
    username = path[0]
    profileSlug = path[1]
    const file = path[2]
    if (file.endsWith('.svg')) {
      const variant = file.replace('.svg', '')
      theme = variant === 'light' ? 'light' : 'dark'
    }
  }

  return generateProfileSvgResponse(request, {
    username,
    profileSlug,
    theme,
  })
}
