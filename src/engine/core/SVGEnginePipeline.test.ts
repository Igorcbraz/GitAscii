import { describe, expect, it } from 'vitest'

import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'
import { sanitizeSvg } from '@/utils/svgSanitizer'

import { embedExternalImages, renderSvg } from './SVGEngine'

const mockProfileData: NormalizedGitHubData = {
  user: {
    id: 99999,
    login: 'testdev',
    name: 'Test Dev',
    avatar_url: 'https://avatars.githubusercontent.com/u/99999',
    bio: 'Full Stack Engineer',
    company: '@acme',
    blog: 'https://testdev.io',
    location: 'Earth',
    email: 'dev@test.io',
    twitter_username: 'testdev',
    public_repos: 20,
    public_gists: 2,
    followers: 500,
    following: 100,
    created_at: '2021-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  repos: [],
  languages: {
    TypeScript: 50000,
    JavaScript: 30000,
    Rust: 20000,
  },
  totalStars: 150,
  totalForks: 30,
  readmeContent: '',
  socialAccounts: [],
  contributions: {
    totalContributions: 800,
    weeks: [],
  },
}

describe('SVG Engine Pipeline & Animation Integrity Suite', () => {
  describe('SMIL and CSS Animation Preservation', () => {
    it('preserves native SMIL animations (<animate>, <set>, <animateTransform>) across the full pipeline', async () => {
      const config: SavedConfiguration = {
        version: 1,
        githubId: 99999,
        username: 'testdev',
        profileSlug: 'default',
        profileName: 'Default',
        templateId: 'terminal',
        widgets: [
          {
            widgetId: 'asciiprofile-portrait',
            instanceId: 'w_portrait',
            name: 'Ascii Portrait',
            position: { x: 0, y: 0 },
            size: { width: 800, height: 300 },
            config: {
              customTitle: 'ASCII Reveal',
              staticMode: false,
            },
            locked: false,
            visible: true,
            zIndex: 1,
          },
          {
            widgetId: 'godprofile-globe',
            instanceId: 'w_globe',
            name: 'Globe',
            position: { x: 0, y: 310 },
            size: { width: 800, height: 200 },
            config: {},
            locked: false,
            visible: true,
            zIndex: 2,
          },
        ],
        globalStyles: {
          backgroundColor: '#060606',
          textColor: '#e5e5e5',
          accentColor: '#c5ff4a',
          borderColor: '#252525',
          fontFamily: "'JetBrains Mono', monospace",
          borderRadius: 0,
          padding: 24,
          themeMode: 'dark',
          templateStyle: 'terminal',
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          schemaVersion: 1,
        },
      }

      const rawSvg = renderSvg(config, mockProfileData)
      const { svg: embeddedSvg } = await embedExternalImages(rawSvg)
      const finalSvg = sanitizeSvg(embeddedSvg)

      // Verify SMIL animation tags are intact
      expect(finalSvg).toContain('<animate')
      expect(finalSvg).toContain('attributeName="width"')
      expect(finalSvg).toContain('<set')
      expect(finalSvg).toContain('attributeName="opacity"')
      expect(finalSvg).toContain('<animateTransform')
      expect(finalSvg).toContain('type="rotate"')
    })

    it('preserves CSS @keyframes without breaking stylesheet syntax', async () => {
      const config: SavedConfiguration = {
        version: 1,
        githubId: 99999,
        username: 'testdev',
        profileSlug: 'default',
        profileName: 'Default',
        templateId: 'terminal',
        widgets: [
          {
            widgetId: 'codeweb-retro-grid',
            instanceId: 'w_grid',
            name: 'Retro Grid',
            position: { x: 0, y: 0 },
            size: { width: 800, height: 260 },
            config: {
              staticMode: false,
            },
            locked: false,
            visible: true,
            zIndex: 1,
          },
        ],
        globalStyles: {
          backgroundColor: '#060606',
          textColor: '#e5e5e5',
          accentColor: '#c5ff4a',
          borderColor: '#252525',
          fontFamily: "'JetBrains Mono', monospace",
          borderRadius: 0,
          padding: 24,
          themeMode: 'dark',
          templateStyle: 'terminal',
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          schemaVersion: 1,
        },
      }

      const rawSvg = renderSvg(config, mockProfileData)
      const { svg: embeddedSvg } = await embedExternalImages(rawSvg)
      const finalSvg = sanitizeSvg(embeddedSvg)

      expect(finalSvg).toContain('@keyframes stack-orb')
      expect(finalSvg).toContain('animation: stack-orb')
      expect(finalSvg).toContain('@import url(')
      expect(finalSvg).not.toMatch(/<style>\s*500;/)
    })
  })

  describe('External Images, Data URIs & Recursive Root Prevention', () => {
    it('never transforms valid SVG and raster data URIs into href="#"', () => {
      const svgPayloads = [
        '<svg><image href="data:image/svg+xml;base64,PHN2Zz48cmVjdC8+PC9zdmc+" width="100" height="30" /></svg>',
        '<svg><image href="data:image/svg+xml;charset=utf-8;base64,PHN2Zz48cmVjdC8+PC9zdmc+" width="100" height="30" /></svg>',
        '<svg><image href="data:image/png;base64,iVBORw0KGgo=" width="50" height="50" /></svg>',
        '<svg><image href="data:image/webp;base64,UklGRkIAAABXRUJQVlA4WAoAAAAQAAAAAQAA" width="50" height="50" /></svg>',
      ]

      for (const svg of svgPayloads) {
        const sanitized = sanitizeSvg(svg)
        expect(sanitized).not.toContain('href="#"')
        expect(sanitized).toContain('data:image/')
      }
    })

    it('replaces dangerous script/executable data URIs with href="#"', () => {
      const dangerousPayloads = [
        '<svg><a href="data:text/html,<script>alert(1)</script>">XSS</a></svg>',
        '<svg><image href="data:text/javascript;base64,YWxlcnQoMSk=" /></svg>',
        '<svg><image href="javascript:alert(1)" /></svg>',
        '<svg><image href="vbscript:msgbox" /></svg>',
      ]

      for (const p of dangerousPayloads) {
        const sanitized = sanitizeSvg(p)
        expect(sanitized).toContain('href="#"')
        expect(sanitized).not.toContain('data:text')
        expect(sanitized).not.toContain('javascript:')
      }
    })
  })

  describe('Google Fonts @import Integrity', () => {
    it('preserves Google Fonts @import statements intact with query string semicolons', () => {
      const input = `<svg><style>
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500&amp;family=PT+Serif:ital,wght@0,300;1,300&amp;display=swap');
        * { box-sizing: border-box; }
      </style></svg>`

      const sanitized = sanitizeSvg(input)
      expect(sanitized).toContain('https://fonts.googleapis.com/css2?family=Inter+Tight')
      expect(sanitized).toContain('family=JetBrains+Mono')
      expect(sanitized).toContain('box-sizing: border-box')
      expect(sanitized).not.toMatch(/<style>\s*500;/)
    })

    it('strips untrusted external @import statements', () => {
      const input = `<svg><style>
        @import url('https://evil.com/malicious.css');
        @import 'http://attacker.org/leak.css';
        .safe { color: red; }
      </style></svg>`

      const sanitized = sanitizeSvg(input)
      expect(sanitized).not.toContain('evil.com')
      expect(sanitized).not.toContain('attacker.org')
      expect(sanitized).toContain('.safe { color: red; }')
    })
  })

  describe('External Widget Fallback Behavior', () => {
    it('triggers fallbackUrl when primary external URL fails (e.g. 404 on contribution snake)', async () => {
      const custom404Url = 'https://cdn.jsdelivr.net/gh/nonexistent-user-9999/repo@output/snake.svg'
      const fallbackUrl =
        'https://cdn.jsdelivr.net/gh/platane/platane@output/github-contribution-grid-snake-dark.svg'

      const testSnippet = `<svg>
        <!-- EXTERNAL_WIDGET_JSON: ${JSON.stringify({
          url: custom404Url,
          x: 0,
          y: 0,
          width: 800,
          height: 200,
          mode: 'contain',
          fallbackUrl,
        })} -->
        <!-- EXTERNAL_WIDGET_END -->
      </svg>`

      const { svg: processedSvg } = await embedExternalImages(testSnippet)
      // Should have successfully fetched fallbackUrl rather than failing
      expect(processedSvg).toContain('<svg')
      expect(processedSvg).not.toContain('Failed to load external widget')
    })
  })
})
