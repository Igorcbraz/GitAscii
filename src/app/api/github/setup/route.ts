import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')

  if (state) {
    const trimmed = state.trim().replace(/^[/\\+]+/, '')
    if (/^[a-zA-Z0-9_.-]+(\/[a-zA-Z0-9_.-]+)*$/.test(trimmed)) {
      return NextResponse.redirect(new URL(`/${trimmed}`, url.origin))
    }
  }

  return NextResponse.redirect(new URL('/', url.origin))
}
