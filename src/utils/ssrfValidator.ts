import dns from 'dns'
import net from 'net'
import { Agent } from 'undici'

export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true
  }

  const [b0, b1] = parts

  // 0.0.0.0/8
  if (b0 === 0) return true
  // 10.0.0.0/8 (Private RFC 1918)
  if (b0 === 10) return true
  // 100.64.0.0/10 (Shared Address / CGNAT RFC 6598)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true
  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true
  // 169.254.0.0/16 (Link-Local & Cloud Metadata)
  if (b0 === 169 && b1 === 254) return true
  // 172.16.0.0/12 (Private RFC 1918)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true
  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (b0 === 192 && b1 === 0 && parts[2] === 0) return true
  // 192.0.2.0/24 (TEST-NET-1)
  if (b0 === 192 && b1 === 0 && parts[2] === 2) return true
  // 192.88.99.0/24 (6to4 Relay Anycast)
  if (b0 === 192 && b1 === 88 && parts[2] === 99) return true
  // 192.168.0.0/16 (Private RFC 1918)
  if (b0 === 192 && b1 === 168) return true
  // 198.18.0.0/15 (Benchmarking)
  if (b0 === 198 && (b1 === 18 || b1 === 19)) return true
  // 198.51.100.0/24 (TEST-NET-2)
  if (b0 === 198 && b1 === 51 && parts[2] === 100) return true
  // 203.0.113.0/24 (TEST-NET-3)
  if (b0 === 203 && b1 === 0 && parts[2] === 113) return true
  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (b0 >= 224) return true

  return false
}

export function isPrivateIPv6(ip: string): boolean {
  let normalized = ip.toLowerCase().trim()
  if (normalized.startsWith('[') && normalized.endsWith(']')) {
    normalized = normalized.slice(1, -1)
  }

  if (
    normalized === '::' ||
    normalized === '::1' ||
    normalized === '0:0:0:0:0:0:0:0' ||
    normalized === '0:0:0:0:0:0:0:1'
  ) {
    return true
  }

  // Handle IPv4-mapped or embedded IPv4 notation (e.g. ::ffff:127.0.0.1 or 64:ff9b::127.0.0.1)
  const lastColon = normalized.lastIndexOf(':')
  if (lastColon !== -1) {
    const potentialV4 = normalized.substring(lastColon + 1)
    if (potentialV4.includes('.')) {
      const v4Parts = potentialV4.split('.').map(Number)
      if (v4Parts.length === 4 && v4Parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
        if (isPrivateIPv4(potentialV4)) return true
        const hex1 = ((v4Parts[0] << 8) | v4Parts[1]).toString(16)
        const hex2 = ((v4Parts[2] << 8) | v4Parts[3]).toString(16)
        normalized = normalized.substring(0, lastColon) + ':' + hex1 + ':' + hex2
      }
    }
  }

  // Parse IPv6 segments into 8 16-bit words
  const doubleColonCount = (normalized.match(/::/g) || []).length
  if (doubleColonCount > 1) return true // Malformed, fail closed

  let groups: string[]
  if (doubleColonCount === 1) {
    const [left, right] = normalized.split('::')
    const leftGroups = left ? left.split(':') : []
    const rightGroups = right ? right.split(':') : []
    const missingCount = 8 - (leftGroups.length + rightGroups.length)
    if (missingCount < 0) return true
    groups = [...leftGroups, ...Array(missingCount).fill('0'), ...rightGroups]
  } else {
    groups = normalized.split(':')
  }

  if (groups.length !== 8) return true // Malformed, fail closed

  const words: number[] = []
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/i.test(group)) return true // Malformed
    words.push(parseInt(group, 16))
  }

  // ::/128 or ::1/128
  if (words.every((w, i) => (i === 7 ? w === 0 || w === 1 : w === 0))) {
    return true
  }

  // ::ffff:0:0/96 (IPv4-mapped IPv6 in hex, e.g., ::ffff:7f00:1 or ::ffff:a9fe:a9fe)
  if (
    words[0] === 0 &&
    words[1] === 0 &&
    words[2] === 0 &&
    words[3] === 0 &&
    words[4] === 0 &&
    words[5] === 0xffff
  ) {
    const b0 = (words[6] >> 8) & 0xff
    const b1 = words[6] & 0xff
    const b2 = (words[7] >> 8) & 0xff
    const b3 = words[7] & 0xff
    const ipv4 = `${b0}.${b1}.${b2}.${b3}`
    return isPrivateIPv4(ipv4)
  }

  // 64:ff9b::/96 (NAT64)
  if (
    words[0] === 0x0064 &&
    words[1] === 0xff9b &&
    words[2] === 0 &&
    words[3] === 0 &&
    words[4] === 0 &&
    words[5] === 0
  ) {
    const b0 = (words[6] >> 8) & 0xff
    const b1 = words[6] & 0xff
    const b2 = (words[7] >> 8) & 0xff
    const b3 = words[7] & 0xff
    const ipv4 = `${b0}.${b1}.${b2}.${b3}`
    return isPrivateIPv4(ipv4)
  }

  // 2002::/16 (6to4)
  if (words[0] === 0x2002) {
    const b0 = (words[1] >> 8) & 0xff
    const b1 = words[1] & 0xff
    const b2 = (words[2] >> 8) & 0xff
    const b3 = words[2] & 0xff
    const ipv4 = `${b0}.${b1}.${b2}.${b3}`
    return isPrivateIPv4(ipv4)
  }

  // fc00::/7 (Unique Local Addresses - ULA)
  if ((words[0] & 0xfe00) === 0xfc00) {
    return true
  }

  // fe80::/10 (Link-Local)
  if ((words[0] & 0xffc0) === 0xfe80) {
    return true
  }

  // ff00::/8 (Multicast)
  if ((words[0] & 0xff00) === 0xff00) {
    return true
  }

  // 2001:db8::/32 (Documentation)
  if (words[0] === 0x2001 && words[1] === 0x0db8) {
    return true
  }

  // 100::/64 (Discard-only)
  if (words[0] === 0x0100 && words[1] === 0 && words[2] === 0 && words[3] === 0) {
    return true
  }

  return false
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'instance-data',
  'metadata',
  'kubernetes.default',
  'kubernetes.default.svc',
])

export async function validateSafeExternalUrl(
  urlStr: string
): Promise<{ safe: boolean; error?: string; url?: URL }> {
  try {
    const url = new URL(urlStr)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { safe: false, error: 'Protocol must be http or https' }
    }

    let hostname = url.hostname.toLowerCase().trim()
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      hostname = hostname.slice(1, -1)
    }

    if (!hostname) {
      return { safe: false, error: 'Empty hostname' }
    }

    if (
      BLOCKED_HOSTNAMES.has(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.lan') ||
      hostname.endsWith('.home') ||
      hostname.endsWith('.arpa')
    ) {
      return { safe: false, error: 'Forbidden hostname' }
    }

    if (net.isIPv4(hostname)) {
      if (isPrivateIPv4(hostname)) {
        return { safe: false, error: 'Private IPv4 address forbidden' }
      }
      return { safe: true, url }
    }

    if (net.isIPv6(hostname) || hostname.includes(':')) {
      if (isPrivateIPv6(hostname)) {
        return { safe: false, error: 'Private IPv6 address forbidden' }
      }
      return { safe: true, url }
    }

    try {
      const records = await dns.promises.lookup(hostname, { all: true })
      if (!records || records.length === 0) {
        return { safe: false, error: 'Unable to resolve domain name' }
      }

      for (const record of records) {
        if (record.family === 4 && isPrivateIPv4(record.address)) {
          return {
            safe: false,
            error: `Domain resolved to forbidden private IPv4: ${record.address}`,
          }
        }
        if (record.family === 6 && isPrivateIPv6(record.address)) {
          return {
            safe: false,
            error: `Domain resolved to forbidden private IPv6: ${record.address}`,
          }
        }
      }
    } catch {
      return { safe: false, error: 'DNS resolution failure' }
    }

    return { safe: true, url }
  } catch {
    return { safe: false, error: 'Invalid URL string' }
  }
}

let ssrfSafeAgent: Agent | null = null

function getSsrfSafeDispatcher(): Agent | undefined {
  if (ssrfSafeAgent) return ssrfSafeAgent
  try {
    ssrfSafeAgent = new Agent({
      connect: {
        lookup: (
          hostname: string,
          opts: unknown,
          cb: (
            err: NodeJS.ErrnoException | null,
            address: string | dns.LookupAddress[],
            family?: number
          ) => void
        ) => {
          dns.lookup(
            hostname,
            { all: true },
            (err: NodeJS.ErrnoException | null, addresses: dns.LookupAddress[]) => {
              if (err) return cb(err, [])
              if (!addresses || addresses.length === 0) {
                return cb(new Error(`DNS lookup yielded no addresses for ${hostname}`), [])
              }
              for (const addr of addresses) {
                if (addr.family === 4 && isPrivateIPv4(addr.address)) {
                  return cb(
                    new Error(`SSRF blocked: ${hostname} resolved to private IPv4 ${addr.address}`),
                    []
                  )
                }
                if (addr.family === 6 && isPrivateIPv6(addr.address)) {
                  return cb(
                    new Error(`SSRF blocked: ${hostname} resolved to private IPv6 ${addr.address}`),
                    []
                  )
                }
              }
              cb(null, addresses[0].address, addresses[0].family)
            }
          )
        },
      },
    })
  } catch {
    ssrfSafeAgent = null
  }
  return ssrfSafeAgent || undefined
}

/**
 * Safe outbound fetch helper that validates the initial URL and each followed redirect
 * against SSRF filters with redirect: 'manual' and socket-level DNS interception.
 */
export async function safeFetch(
  initialUrl: string,
  options: RequestInit = {},
  maxRedirects = 3
): Promise<Response> {
  let currentUrl = initialUrl
  let redirectsCount = 0

  while (true) {
    const check = await validateSafeExternalUrl(currentUrl)
    if (!check.safe) {
      throw new Error(`SSRF blocked request to ${currentUrl}: ${check.error}`)
    }

    const dispatcher = getSsrfSafeDispatcher()
    const fetchOptions: RequestInit & { dispatcher?: unknown } = {
      ...options,
      redirect: 'manual',
      ...(dispatcher ? { dispatcher } : {}),
    }

    const response = await fetch(currentUrl, fetchOptions)

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      redirectsCount++
      if (redirectsCount > maxRedirects) {
        throw new Error(`Too many redirects (max ${maxRedirects})`)
      }

      const location = response.headers.get('location')
      if (!location) {
        throw new Error('Redirect response missing Location header')
      }

      try {
        const nextUrl = new URL(location, currentUrl).toString()
        currentUrl = nextUrl
        continue
      } catch {
        throw new Error(`Invalid redirect Location header: ${location}`)
      }
    }

    return response
  }
}
