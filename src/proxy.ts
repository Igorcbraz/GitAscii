import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')
  if (host && host.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.host = host.replace(/^www\./, '')
    return NextResponse.redirect(url, { status: 301 })
  }

  const pathname = request.nextUrl.pathname
  const lang = request.nextUrl.searchParams.get('lang')

  const requestHeaders = new Headers(request.headers)
  if (lang) {
    requestHeaders.set('x-lang', lang)
  }

  if (pathname.endsWith('.svg')) {
    const url = request.nextUrl.clone()
    url.pathname = `/api/svg${pathname}`
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
