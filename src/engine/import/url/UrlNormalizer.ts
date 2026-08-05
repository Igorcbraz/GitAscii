export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return ''
  let trimmed = rawUrl.trim()

  // Handle relative protocol //
  if (trimmed.startsWith('//')) {
    trimmed = `https:${trimmed}`
  }

  // Convert GitHub blob web view URLs to raw user content URLs
  // e.g. https://github.com/user/repo/blob/branch/path/file.gif -> https://raw.githubusercontent.com/user/repo/branch/path/file.gif
  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname.toLowerCase() === 'github.com' && parsed.pathname.includes('/blob/')) {
      trimmed = trimmed.replace(
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/i,
        'https://raw.githubusercontent.com/$1/$2/$3'
      )
    }
  } catch {
    // Not a valid URL yet, skip
  }

  // Handle relative URLs or non-HTTP protocols gracefully
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)

    // List of irrelevant tracking/cache params to strip
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

    // Sort remaining parameters alphabetically for deterministic matching & deduplication
    searchParams.sort()

    parsed.search = searchParams.toString()
    return parsed.toString()
  } catch {
    return trimmed
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
    // If parsing fails, attempt regex param extraction
    const match = url.match(/\?([^#]+)/)
    if (match) {
      const pairs = match[1].split('&')
      for (const pair of pairs) {
        const [k, v] = pair.split('=')
        if (k) params[decodeURIComponent(k)] = v ? decodeURIComponent(v) : ''
      }
    }
  }
  return params
}
