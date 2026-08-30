import crypto from 'crypto'

function getDailySalt(dateStr: string): string {
  const baseSecret = process.env.SESSION_SECRET || 'gitascii-privacy-salt-default-secret'
  return crypto.createHmac('sha256', baseSecret).update(`salt:${dateStr}`).digest('hex')
}

export function generateAnonymizedVisitorId(
  ip: string | null | undefined,
  userAgent: string | null | undefined,
  dateStr: string
): string {
  const rawData = `${ip || 'unknown-ip'}|${userAgent || 'unknown-ua'}`
  const salt = getDailySalt(dateStr)
  return crypto.createHmac('sha256', salt).update(rawData).digest('hex').slice(0, 16)
}

export function sanitizeReferrer(referrerUrl: string | null | undefined, isCamo?: boolean): string {
  if (isCamo) return 'GitHub README (Camo Proxy)'
  if (!referrerUrl) return 'Direct / No Referrer'

  try {
    const parsed = new URL(referrerUrl)
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')

    if (hostname.includes('github.com')) {
      return 'GitHub'
    }
    if (hostname.includes('google.')) {
      return 'Google Search'
    }
    if (
      hostname.includes('twitter.com') ||
      hostname.includes('x.com') ||
      hostname.includes('t.co')
    ) {
      return 'X / Twitter'
    }
    if (hostname.includes('linkedin.com')) {
      return 'LinkedIn'
    }
    if (hostname.includes('reddit.com')) {
      return 'Reddit'
    }
    if (hostname.includes('dev.to') || hostname.includes('hashnode.')) {
      return 'Dev Community'
    }
    if (hostname.includes('gitascii.com') || hostname.includes('localhost')) {
      return 'GitAscii App'
    }

    return hostname
  } catch {
    return 'Other Referrer'
  }
}

export function parseDeviceType(ua: string | null | undefined, isCamo: boolean): string {
  if (isCamo) return 'GitHub Camo Proxy'
  if (!ua) return 'Desktop'

  const lower = ua.toLowerCase()
  if (lower.includes('tablet') || lower.includes('ipad')) return 'Tablet'
  if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android'))
    return 'Mobile'
  if (lower.includes('bot') || lower.includes('crawler') || lower.includes('spider'))
    return 'Bot / Crawler'
  return 'Desktop'
}

export function parseBrowser(ua: string | null | undefined, isCamo: boolean): string {
  if (isCamo) return 'GitHub Image Proxy'
  if (!ua) return 'Other'

  const lower = ua.toLowerCase()
  if (lower.includes('edg/') || lower.includes('edge/')) return 'Edge'
  if (lower.includes('brave/') || lower.includes('arc/')) return 'Arc / Brave'
  if (lower.includes('chrome') && !lower.includes('edg')) return 'Chrome'
  if (lower.includes('safari') && !lower.includes('chrome')) return 'Safari'
  if (lower.includes('firefox')) return 'Firefox'
  if (lower.includes('opera') || lower.includes('opr/')) return 'Opera'
  if (
    lower.includes('curl') ||
    lower.includes('wget') ||
    lower.includes('python') ||
    lower.includes('axios')
  )
    return 'CLI / Script'
  return 'Other'
}

export function parseOperatingSystem(ua: string | null | undefined, isCamo: boolean): string {
  if (isCamo) return 'GitHub Cloud (Proxy)'
  if (!ua) return 'Other'

  const lower = ua.toLowerCase()
  if (lower.includes('macintosh') || lower.includes('mac os') || lower.includes('darwin'))
    return 'macOS'
  if (lower.includes('windows')) return 'Windows'
  if (lower.includes('android')) return 'Android'
  if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ios')) return 'iOS'
  if (lower.includes('linux') || lower.includes('x11')) return 'Linux'
  if (lower.includes('cros')) return 'ChromeOS'
  return 'Other'
}

export function parseLanguage(acceptLang: string | null | undefined): string {
  if (!acceptLang) return 'en'
  const primary = acceptLang.split(',')[0]?.split(';')[0]?.trim().toLowerCase()
  if (!primary) return 'en'
  const lang = primary
    .split('-')[0]
    .replace(/[^a-z]/g, '')
    .slice(0, 3)
  return lang || 'en'
}

export function parseTrafficType(
  ua: string | null | undefined,
  isCamo: boolean,
  referrer?: string | null
): 'camo' | 'direct' | 'app' | 'bot' {
  if (isCamo) return 'camo'
  const lowerUa = (ua || '').toLowerCase()
  if (
    lowerUa.includes('bot') ||
    lowerUa.includes('crawler') ||
    lowerUa.includes('spider') ||
    lowerUa.includes('github-hookshot')
  ) {
    return 'bot'
  }
  const ref = (referrer || '').toLowerCase()
  if (ref.includes('gitascii.com') || ref.includes('localhost')) {
    return 'app'
  }
  return 'direct'
}

export function sanitizeCountryCode(country: string | null | undefined): string {
  if (!country) return 'XX'
  const clean = country
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2)
  return clean.length === 2 ? clean : 'XX'
}

export function sanitizeRegion(region: string | null | undefined): string {
  if (!region) return 'Unknown'
  return (
    region
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .slice(0, 30) || 'Unknown'
  )
}

export function sanitizeCity(city: string | null | undefined): string {
  if (!city) return 'Unknown'
  return (
    city
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .slice(0, 40) || 'Unknown'
  )
}

export function sanitizeTimezone(timezone: string | null | undefined): string {
  if (!timezone) return 'UTC'
  const clean = timezone
    .trim()
    .replace(/[^a-zA-Z0-9_\-\/]/g, '')
    .slice(0, 40)
  return clean || 'UTC'
}
