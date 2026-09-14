import { isValidGitHubUsername } from '@/utils/githubUsername'

import { PUBLICATION } from '../constants'
import type { SvgVariant } from '../types'

const RESERVED_API = new Set([
  'auth',
  'config',
  'email',
  'generate',
  'github',
  'indexnow',
  'pro',
  'webhooks',
])
const SLUG = /^[a-z0-9_-]{1,50}$/

export interface ImageRequest {
  variant: SvgVariant
  explicitSlug: boolean
  simulatedDate?: string
  simulatedTimezone?: string
}

export function isImageRoute(url: URL): boolean {
  if (['/icon.svg', '/example.svg'].includes(url.pathname.toLowerCase())) return false
  if (url.pathname.endsWith('.svg')) return true
  const parts = url.pathname.split('/').filter(Boolean)
  return parts[0] === 'api' && !RESERVED_API.has(parts[1]) && parts[2] !== 'health-badge'
}

export function parseImageRequest(url: URL): ImageRequest | null {
  if (['/icon.svg', '/example.svg'].includes(url.pathname.toLowerCase())) return null
  let path: string[]
  try {
    path = url.pathname.split('/').filter(Boolean).map(decodeURIComponent)
  } catch {
    return null
  }
  const api = path[0] === 'api'
  if (api) {
    path.shift()
    if (RESERVED_API.has(path[0])) return null
    if (path[0] === 'svg') path.shift()
  } else if (!url.pathname.endsWith('.svg')) {
    return null
  }
  if (!path.length || path.length > 3) return null
  const username = path[0].replace(/\.svg$/, '').toLowerCase()
  if (!isValidGitHubUsername(username)) return null
  let profileSlug = 'default'
  let theme: 'dark' | 'light' = 'dark'
  let explicitSlug = false
  if (path[1]) {
    const value = path[1].replace(/\.svg$/, '').toLowerCase()
    if (path[1].endsWith('.svg') && (value === 'dark' || value === 'light')) theme = value
    else {
      profileSlug = value
      explicitSlug = value !== 'default'
    }
  }
  if (path[2]) {
    if (!['dark.svg', 'light.svg'].includes(path[2])) return null
    theme = path[2] === 'light.svg' ? 'light' : 'dark'
  }
  if (!SLUG.test(profileSlug) || profileSlug === 'health-badge') return null
  const queryTheme = url.searchParams.get('theme')
  if (queryTheme === 'light' || queryTheme === 'dark') theme = queryTheme
  const requestedTemplate = (
    url.searchParams.get('template') ||
    (queryTheme && queryTheme !== 'dark' && queryTheme !== 'light' ? queryTheme : '')
  ).toLowerCase()
  const template = SLUG.test(requestedTemplate) ? requestedTemplate : null
  const widgets = [
    ...new Set(
      (url.searchParams.get('widgets') || url.searchParams.get('widget') || '')
        .split(',')
        .map((value) => value.trim())
        .filter((value) => SLUG.test(value))
    ),
  ]
    .sort()
    .slice(0, PUBLICATION.maxWidgets)
  return {
    variant: { username, profileSlug, theme, template, widgets },
    explicitSlug,
    simulatedDate:
      url.searchParams.get('preview_date') || url.searchParams.get('date') || undefined,
    simulatedTimezone: url.searchParams.get('timezone') || url.searchParams.get('tz') || undefined,
  }
}

export async function variantId(variant: SvgVariant): Promise<string> {
  if (!variant.template && !variant.widgets.length) return variant.theme
  const bytes = new TextEncoder().encode(JSON.stringify([variant.template, variant.widgets]))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  )
  return `${variant.theme}-${hex}`
}

export function baseVariants(username: string, profileSlug: string): SvgVariant[] {
  return (['dark', 'light'] as const).map((theme) => ({
    username,
    profileSlug,
    theme,
    template: null,
    widgets: [],
  }))
}
