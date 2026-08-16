import { EXTERNAL_LINKS } from '@/constants'

export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return ''
  let trimmed = rawUrl.trim()

  if (trimmed.startsWith('//')) {
    trimmed = `https:${trimmed}`
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname.toLowerCase() === 'github.com' && parsed.pathname.includes('/blob/')) {
      trimmed = trimmed.replace(
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/i,
        `${EXTERNAL_LINKS.GITHUB_RAW_BASE}/$1/$2/$3`
      )
    }
  } catch {}

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)

    const paramsToStrip = new Set([
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
      't',
      'v',
      'cb',
      'cache',
      'rnd',
      'timestamp',
      '_',
      'bypass',
    ])

    const searchParams = parsed.searchParams
    const keysToDelete: string[] = []

    searchParams.forEach((_, key) => {
      if (paramsToStrip.has(key.toLowerCase())) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((k) => searchParams.delete(k))

    searchParams.sort()

    parsed.search = searchParams.toString()
    return parsed.toString()
  } catch {
    return trimmed
  }
}

function safeDecode(val: string): string {
  try {
    return decodeURIComponent(val)
  } catch {
    return val
  }
}

export function extractUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  try {
    const parsed = new URL(url.startsWith('//') ? `https:${url}` : url)
    parsed.searchParams.forEach((val, key) => {
      params[key] = val
    })
  } catch {
    const match = url.match(/\?([^#]+)/)
    if (match) {
      const pairs = match[1].split('&')
      for (const pair of pairs) {
        const [k, v] = pair.split('=')
        if (k) params[safeDecode(k)] = v ? safeDecode(v) : ''
      }
    }
  }
  return params
}
