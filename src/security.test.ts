import { describe, expect, it, vi } from 'vitest'

import { GET as getDynamicProfileSvg } from './app/api/[username]/[profileSlug]/route'
import { POST as postIndexNow } from './app/api/indexnow/route'
import { decryptSession, encryptSession } from './lib/auth'
import {
  isPrivateIPv4,
  isPrivateIPv6,
  safeFetch,
  validateSafeExternalUrl,
} from './utils/ssrfValidator'
import { sanitizeColor, sanitizeId, sanitizeSafeHref, sanitizeSvg } from './utils/svgSanitizer'

describe('Security Audit Fixes & Regression Test Suite', () => {
  describe('Session Authentication & AES-256-GCM Encryption', () => {
    it('encrypts and decrypts valid session payloads accurately', () => {
      const payload = JSON.stringify({
        username: 'octocat',
        githubId: 583231,
        accessToken: 'gho_secret_token_value',
        expiresAt: Date.now() + 100000,
      })

      const encrypted = encryptSession(payload)
      expect(encrypted).toBeDefined()
      expect(encrypted.split('.')).toHaveLength(3)

      const decrypted = decryptSession(encrypted)
      expect(decrypted).toBe(payload)
    })

    it('rejects tampered session payloads with invalid auth tags', () => {
      const payload = JSON.stringify({ username: 'victim', githubId: 12345 })
      const encrypted = encryptSession(payload)
      const parts = encrypted.split('.')

      const tamperedTag = parts[1].substring(0, parts[1].length - 2) + 'AA'
      const tamperedPacked = `${parts[0]}.${tamperedTag}.${parts[2]}`

      expect(decryptSession(tamperedPacked)).toBeNull()
    })

    it('rejects malformed or truncated session strings', () => {
      expect(decryptSession('')).toBeNull()
      expect(decryptSession('invalid')).toBeNull()
      expect(decryptSession('a.b')).toBeNull()
      expect(decryptSession('a.b.c.d')).toBeNull()
    })
  })

  describe('SSRF Protection & Network Boundaries (SSRF-01, SSRF-02, SEC-SSRF-03)', () => {
    it('detects private and loopback IPv4 ranges', () => {
      expect(isPrivateIPv4('127.0.0.1')).toBe(true)
      expect(isPrivateIPv4('127.0.0.2')).toBe(true)
      expect(isPrivateIPv4('10.0.0.1')).toBe(true)
      expect(isPrivateIPv4('172.16.0.1')).toBe(true)
      expect(isPrivateIPv4('172.31.255.255')).toBe(true)
      expect(isPrivateIPv4('192.168.1.1')).toBe(true)
      expect(isPrivateIPv4('169.254.169.254')).toBe(true) // Cloud metadata
      expect(isPrivateIPv4('100.64.0.1')).toBe(true) // CGNAT
      expect(isPrivateIPv4('0.0.0.0')).toBe(true)
      expect(isPrivateIPv4('224.0.0.1')).toBe(true) // Multicast
      expect(isPrivateIPv4('8.8.8.8')).toBe(false)
      expect(isPrivateIPv4('1.1.1.1')).toBe(false)
    })

    it('detects standard, bracketed, and hex-formatted IPv6 private ranges (SEC-SSRF-03 Regression)', () => {
      expect(isPrivateIPv6('::1')).toBe(true)
      expect(isPrivateIPv6('[::1]')).toBe(true)
      expect(isPrivateIPv6('::')).toBe(true)
      expect(isPrivateIPv6('fc00::1')).toBe(true) // ULA
      expect(isPrivateIPv6('fd00:ec2::254')).toBe(true) // AWS metadata
      expect(isPrivateIPv6('fe80::1')).toBe(true) // Link-local
      expect(isPrivateIPv6('::ffff:127.0.0.1')).toBe(true) // IPv4-mapped dotted decimal loopback
      expect(isPrivateIPv6('::ffff:10.0.0.1')).toBe(true) // IPv4-mapped dotted decimal private
      expect(isPrivateIPv6('::ffff:169.254.169.254')).toBe(true) // IPv4-mapped metadata

      // Hexadecimal IPv4-mapped IPv6 representations (Original bypass vector)
      expect(isPrivateIPv6('::ffff:7f00:1')).toBe(true) // 127.0.0.1 in hex
      expect(isPrivateIPv6('::ffff:7f00:0001')).toBe(true)
      expect(isPrivateIPv6('::ffff:a9fe:a9fe')).toBe(true) // 169.254.169.254 in hex
      expect(isPrivateIPv6('[::ffff:7f00:1]')).toBe(true)
      expect(isPrivateIPv6('[::ffff:a9fe:a9fe]')).toBe(true)

      // NAT64 & 6to4 private ranges
      expect(isPrivateIPv6('64:ff9b::127.0.0.1')).toBe(true)
      expect(isPrivateIPv6('64:ff9b::7f00:1')).toBe(true)
      expect(isPrivateIPv6('2002:7f00:1::')).toBe(true)

      // Public IPv6
      expect(isPrivateIPv6('2606:4700:4700::1111')).toBe(false) // Public Cloudflare DNS
      expect(isPrivateIPv6('2001:4860:4860::8888')).toBe(false) // Public Google DNS
    })

    it('blocks dangerous hostnames and private addresses via validateSafeExternalUrl', async () => {
      const blocked = [
        'http://localhost:3000/api',
        'http://127.0.0.1:8080',
        'http://169.254.169.254/latest/meta-data/',
        'http://[::1]/status',
        'http://[::ffff:7f00:1]/api',
        'http://[::ffff:a9fe:a9fe]/metadata',
        'http://172.17.0.1:8080',
        'http://10.0.0.5',
        'http://metadata.google.internal/computeMetadata/v1/',
        'http://server.local',
        'ftp://example.com',
        'javascript:alert(1)',
      ]

      for (const url of blocked) {
        const res = await validateSafeExternalUrl(url)
        expect(res.safe).toBe(false)
      }
    })

    it('blocks HTTP 30x redirect SSRF via safeFetch (SSRF-01 Regression)', async () => {
      // Simulate an initial public response that returns a 302 redirect to AWS metadata endpoint
      const mockFetch = vi.fn()
      // First call (to public URL) returns 302 redirect
      mockFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: {
            location: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
          },
        })
      )

      vi.stubGlobal('fetch', mockFetch)

      try {
        await expect(safeFetch('https://api.github.com/users/octocat')).rejects.toThrow(
          /SSRF blocked request to http:\/\/169\.254\.169\.254/
        )
      } finally {
        vi.unstubAllGlobals()
      }
    })

    it('blocks HTTP 30x redirect to local loopback (SSRF-01 Regression)', async () => {
      const mockFetch = vi.fn()
      mockFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 301,
          headers: { location: 'http://127.0.0.1:3000/internal-admin' },
        })
      )

      vi.stubGlobal('fetch', mockFetch)

      try {
        await expect(safeFetch('https://api.github.com/users/octocat')).rejects.toThrow(
          /SSRF blocked request to http:\/\/127\.0\.0\.1/
        )
      } finally {
        vi.unstubAllGlobals()
      }
    })
  })

  describe('SVG Sanitization & XSS Defenses (SEC-SVG-01 Regression)', () => {
    it('strips slash-delimited event handlers without whitespace', () => {
      const payloads = [
        '<svg/onload=alert(1)><rect width="10" height="10"/></svg>',
        '<svg id="x"/onload=alert(1)></svg>',
        '<svg\nonload=alert(1)></svg>',
        '<svg\tonload=alert(1)></svg>',
        '<g/onclick=alert(1)><text>Click</text></g>',
      ]

      for (const p of payloads) {
        const sanitized = sanitizeSvg(p)
        expect(sanitized).not.toMatch(/on[a-z]+/i)
        expect(sanitized).not.toContain('alert')
      }
    })

    it('strips XML entity-encoded javascript: and vbscript: URIs', () => {
      const payloads = [
        '<svg><a href="jav&#x61;script:alert(1)">Link</a></svg>',
        '<svg><a href="&#x6a;avascript:alert(2)">Link</a></svg>',
        '<svg><a xlink:href="jav&#97;script:alert(3)">Link</a></svg>',
        '<svg><a href="vb&#x73;cript:msgbox(1)">Link</a></svg>',
        '<svg><a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Link</a></svg>',
      ]

      for (const p of payloads) {
        const sanitized = sanitizeSvg(p)
        expect(sanitized).not.toContain('javascript:')
        expect(sanitized).not.toContain('alert')
        expect(sanitized).toContain('href="#"')
      }
    })

    it('strips unquoted javascript: hrefs', () => {
      const maliciousSvg = '<svg><a href=javascript:alert(1)><text>XSS</text></a></svg>'
      const sanitized = sanitizeSvg(maliciousSvg)
      expect(sanitized).not.toContain('javascript:')
      expect(sanitized).not.toContain('alert')
      expect(sanitized).toContain('href="#"')
    })

    it('strips dangerous SMIL animation and meta tags', () => {
      const maliciousSvg = `<svg><animate xlink:href="#target" attributeName="href" values="javascript:alert(1)" /><set attributeName="onmouseover" to="alert(1)" /><meta http-equiv="refresh" content="0;url=javascript:alert(1)" /></svg>`
      const sanitized = sanitizeSvg(maliciousSvg)
      expect(sanitized).not.toContain('<animate')
      expect(sanitized).not.toContain('<set')
      expect(sanitized).not.toContain('<meta')
      expect(sanitized).not.toContain('alert')
    })

    it('sanitizes safe href protocols', () => {
      expect(sanitizeSafeHref('javascript:alert(1)')).toBe('')
      expect(sanitizeSafeHref('data:text/html,<script>alert(1)</script>')).toBe('')
      expect(sanitizeSafeHref('https://github.com/octocat')).toBe('https://github.com/octocat')
      expect(sanitizeSafeHref('/explore')).toBe('/explore')
      expect(sanitizeSafeHref('//evil.com')).toBe('')
      expect(sanitizeSafeHref('/\\evil.com')).toBe('')
    })

    it('sanitizes color strings and rejects CSS injection payloads', () => {
      expect(sanitizeColor('#c5ff4a')).toBe('#c5ff4a')
      expect(sanitizeColor('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)')
      expect(sanitizeColor('red')).toBe('red')
      expect(sanitizeColor('red; background: url(evil.com)')).toBe('#ffffff')
      expect(sanitizeColor('"></tspan><script>alert(1)</script>')).toBe('#ffffff')
    })

    it('strips XML namespace-prefixed dangerous tags and attributes', () => {
      const payloads = [
        '<svg xmlns:svg="http://www.w3.org/2000/svg"><svg:script>alert(1)</svg:script><rect width="10" height="10"/></svg>',
        '<svg xmlns:html="http://www.w3.org/1999/xhtml"><html:script>alert(2)</html:script></svg>',
        '<svg xmlns:ns="http://example.com"><ns:script>alert(3)</ns:script></svg>',
        '<svg xmlns:xl="http://www.w3.org/1999/xlink"><a xl:href="javascript:alert(4)"><text>Link</text></a></svg>',
        '<svg xmlns:svg="http://www.w3.org/2000/svg"><a svg:href="javascript:alert(5)"><text>Link</text></a></svg>',
        '<svg><a href="javascript:alert(6)"><svg:animate attributeName="href" values="javascript:alert(7)"/></a></svg>',
      ]

      for (const p of payloads) {
        const sanitized = sanitizeSvg(p)
        expect(sanitized).not.toMatch(/<(?:[a-zA-Z0-9_-]+:)?(?:script|animate)/i)
        expect(sanitized).not.toContain('alert')
        if (sanitized.includes('<a')) {
          expect(sanitized).toContain('href="#"')
        }
      }
    })

    it('sanitizes style blocks against @import and CSS expression injection', () => {
      const maliciousSvg = `<svg><style>@import url('http://evil.com/xss.css'); .text { width: expression(alert(1)); behavior: url(xss.htc); -moz-binding: url('http://evil.com/xss.xml#test'); }</style><text class="text">Styled</text></svg>`
      const sanitized = sanitizeSvg(maliciousSvg)
      expect(sanitized).not.toContain('@import')
      expect(sanitized).not.toContain('expression')
      expect(sanitized).not.toContain('behavior:')
      expect(sanitized).not.toContain('-moz-binding:')
      expect(sanitized).toContain('<text class="text">Styled</text>')
    })

    it('neutralizes protocol-relative // URIs in href and xlink:href', () => {
      const maliciousSvg = `<svg><a href="//evil.com/phish"><text>Phish</text></a><image xlink:href="//evil.com/track.png" /></svg>`
      const sanitized = sanitizeSvg(maliciousSvg)
      expect(sanitized).not.toContain('//evil.com')
      expect(sanitized).toContain('href="#"')
    })

    it('sanitizes identifiers used in IDs and style blocks', () => {
      expect(sanitizeId('widget-123_abc')).toBe('widget-123_abc')
      expect(sanitizeId('widget-123</style><script>alert(1)</script>')).toBe(
        'widget-123stylescriptalert1script'
      )
    })
  })

  describe('IndexNow Authorization Fail-Closed (SEC-AUTH-01 Regression)', () => {
    it('returns 500 when INDEXNOW_SECRET is not configured in the environment', async () => {
      const originalSecret = process.env.INDEXNOW_SECRET
      delete process.env.INDEXNOW_SECRET

      try {
        const req = new Request('http://localhost:3000/api/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urlList: ['https://gitascii.com/explore'] }),
        })

        const res = await postIndexNow(req)
        expect(res.status).toBe(500)
        const data = await res.json()
        expect(data.error).toContain('not configured')
      } finally {
        if (originalSecret !== undefined) {
          process.env.INDEXNOW_SECRET = originalSecret
        }
      }
    })

    it('returns 401 Unauthorized when secret is configured but invalid header is provided', async () => {
      process.env.INDEXNOW_SECRET = 'correct_secret_key_12345'

      try {
        const req = new Request('http://localhost:3000/api/indexnow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-indexnow-secret': 'wrong_secret',
          },
          body: JSON.stringify({ urlList: ['https://gitascii.com/explore'] }),
        })

        const res = await postIndexNow(req)
        expect(res.status).toBe(401)
      } finally {
        delete process.env.INDEXNOW_SECRET
      }
    })
  })

  describe('Dynamic Route Reserved Username Shadowing (SEC-ROUTING-01 Regression)', () => {
    it('renders SVG for username "github" and slug "terminal" without parameter shadowing', async () => {
      const req = new Request('http://localhost:3000/api/github/terminal')
      const params = Promise.resolve({ username: 'github', profileSlug: 'terminal' })

      const res = await getDynamicProfileSvg(req, { params })
      expect(res.headers.get('content-type')).toContain('image/svg+xml')
      const svgText = await res.text()
      expect(svgText).toContain('<svg')
    })

    it('renders SVG for username "config" and slug "default" without parameter shadowing', async () => {
      const req = new Request('http://localhost:3000/api/config/default')
      const params = Promise.resolve({ username: 'config', profileSlug: 'default' })

      const res = await getDynamicProfileSvg(req, { params })
      expect(res.headers.get('content-type')).toContain('image/svg+xml')
      const svgText = await res.text()
      expect(svgText).toContain('<svg')
    })
  })
})
