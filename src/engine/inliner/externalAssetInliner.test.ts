import { describe, expect, it } from 'vitest'

import { processExternalAssets } from './externalAssetInliner'

describe('External Asset Inliner Suite', () => {
  it('gracefully handles 404 errors by inserting fallback placeholder without crashing', async () => {
    const mockFetcher = async () => {
      return new Response('Not Found', { status: 404 })
    }

    const testSnippet = `<svg>
      <!-- EXTERNAL_WIDGET_JSON: ${JSON.stringify({
        url: 'https://cdn.example.com/widget-404.svg',
        x: 0,
        y: 0,
        width: 400,
        height: 100,
        mode: 'contain',
      })} -->
      <!-- EXTERNAL_WIDGET_END -->
    </svg>`

    const result = await processExternalAssets(testSnippet, {
      fetcher: mockFetcher,
      validateUrl: async () => ({ safe: true }),
    })

    expect(result.hasErrors).toBe(true)
    expect(result.failedUrls).toContain('https://cdn.example.com/widget-404.svg')
    expect(result.svg).toContain('<svg')
    expect(result.svg).toContain('Failed to load widget')
  })

  it('uses fallbackUrl when primary URL fails', async () => {
    const mockFetcher = async (url: string) => {
      if (url.includes('primary-fail')) {
        return new Response('Not Found', { status: 404 })
      }
      return new Response(
        '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="green"/></svg>',
        {
          status: 200,
          headers: { 'content-type': 'image/svg+xml' },
        }
      )
    }

    const testSnippet = `<svg>
      <!-- EXTERNAL_WIDGET_JSON: ${JSON.stringify({
        url: 'https://cdn.example.com/primary-fail.svg',
        fallbackUrl: 'https://cdn.example.com/fallback-ok.svg',
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        mode: 'contain',
      })} -->
      <!-- EXTERNAL_WIDGET_END -->
    </svg>`

    const result = await processExternalAssets(testSnippet, {
      fetcher: mockFetcher,
      validateUrl: async () => ({ safe: true }),
    })

    expect(result.hasErrors).toBe(false)
    expect(result.svg).toContain('fill="green"')
  })

  it('replaces failed raster images with transparent pixel', async () => {
    const mockFetcher = async () => {
      throw new Error('Connection timeout')
    }

    const testSnippet = `<svg>
      <image href="https://cdn.example.com/avatar-fail.png" width="50" height="50" />
    </svg>`

    const result = await processExternalAssets(testSnippet, {
      fetcher: mockFetcher,
      validateUrl: async () => ({ safe: true }),
    })

    expect(result.hasErrors).toBe(true)
    expect(result.svg).toContain('data:image/png;base64,')
  })

  it('rejects assets exceeding maximum size budget', async () => {
    const hugeBuffer = new Uint8Array(3 * 1024 * 1024) // 3MB
    const mockFetcher = async () => {
      return new Response(hugeBuffer, {
        status: 200,
        headers: { 'content-type': 'image/png' },
      })
    }

    const testSnippet = `<svg>
      <image href="https://cdn.example.com/huge-image.png" width="50" height="50" />
    </svg>`

    const result = await processExternalAssets(testSnippet, {
      fetcher: mockFetcher,
      validateUrl: async () => ({ safe: true }),
      maxSizeBytes: 2 * 1024 * 1024,
    })

    expect(result.hasErrors).toBe(true)
    expect(result.failedUrls).toContain('https://cdn.example.com/huge-image.png')
  })
})
