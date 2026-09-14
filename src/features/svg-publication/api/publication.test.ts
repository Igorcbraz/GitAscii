import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { NormalizedGitHubData } from '@/engine/types'

import { DEFAULT_PUBLICATION_RULES, publicationKeys } from '../constants'
import { servePublishedImage } from '../server/imageWorker'
import { publishSource } from '../server/publishSource'
import type { PublicationManifest, PublicationSource, PublicationStore } from '../types'
import { baseVariants, parseImageRequest, variantId } from '../utils/variants'

const source: PublicationSource = {
  username: 'octocat',
  profiles: [{ slug: 'default', isDefault: true, config: null }],
  rules: DEFAULT_PUBLICATION_RULES,
}
const data = { user: { login: 'octocat' } } as NormalizedGitHubData

describe('published SVG delivery', () => {
  const objects = new Map<string, string>()
  const store: PublicationStore = {
    readJson: async <T>(key: string) =>
      objects.has(key) ? (JSON.parse(objects.get(key)!) as T) : null,
    writeJson: async (key, value) => {
      objects.set(key, JSON.stringify(value))
    },
    writeSvg: async (key, svg) => {
      objects.set(key, svg)
    },
  }
  const render = vi.fn(async () => ({
    svg: '<svg xmlns="http://www.w3.org/2000/svg"><text>custom profile</text></svg>',
    degraded: false,
  }))
  const deps = { store, render, fetchData: vi.fn(async () => data), rendererRevision: 'v1' }
  const env = {
    ASSETS: {
      fetch: vi.fn(async (request: Request) => {
        const key = new URL(request.url).pathname.slice(1)
        return objects.has(key)
          ? new Response(request.method === 'HEAD' ? null : objects.get(key), {
              headers: { ETag: '"test"' },
            })
          : new Response(null, { status: 404 })
      }),
    },
    APP: { fetch: vi.fn(async () => new Response('application')) },
  }
  const context = { waitUntil: vi.fn() }

  beforeEach(() => {
    objects.clear()
    vi.clearAllMocks()
    render.mockResolvedValue({ svg: '<svg>personalized</svg>', degraded: false })
  })

  it('retains the personalized image when GitHub becomes unavailable', async () => {
    await publishSource(source, deps)
    const key = publicationKeys.image('octocat', 'default', 'dark')
    const good = objects.get(key)
    const result = await publishSource(source, {
      ...deps,
      rendererRevision: 'v2',
      fetchData: async () => {
        throw new Error('429')
      },
    })
    expect(result.failures).toHaveLength(2)
    expect(objects.get(key)).toBe(good)
    const response = await servePublishedImage(
      new Request('https://gitascii.com/api/octocat?v=new'),
      env,
      context
    )
    expect(response.status).toBe(200)
    expect(await response.text()).toBe(good)
  })

  it('does not replace an existing SVG with missing external widgets', async () => {
    await publishSource(source, deps)
    render.mockResolvedValue({ svg: '<svg>incomplete</svg>', degraded: true })
    const result = await publishSource(source, { ...deps, rendererRevision: 'v2' })
    expect(result.failures).toHaveLength(2)
    expect(objects.get(publicationKeys.image('octocat', 'default', 'dark'))).toBe(
      '<svg>personalized</svg>'
    )
  })

  it('publishes a first usable image with incomplete optional widgets and retries it', async () => {
    render.mockResolvedValue({ svg: '<svg>first</svg>', degraded: true })
    await publishSource(source, deps)
    render.mockResolvedValue({ svg: '<svg>complete</svg>', degraded: false })
    await publishSource(source, deps)
    expect(objects.get(publicationKeys.image('octocat', 'default', 'dark'))).toBe(
      '<svg>complete</svg>'
    )
  })

  it('serves only assets when the publisher is stopped; HEAD has no body', async () => {
    await publishSource(source, deps)
    const calls = render.mock.calls.length
    const response = await servePublishedImage(
      new Request('https://gitascii.com/api/octocat', { method: 'HEAD' }),
      env,
      context
    )
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('')
    expect(render).toHaveBeenCalledTimes(calls)
    expect(env.APP.fetch).not.toHaveBeenCalled()
  })

  it('does not queue cache-busting v parameters or regenerate fresh publications', async () => {
    await publishSource(source, deps)
    await publishSource(source, deps)
    await servePublishedImage(new Request('https://gitascii.com/api/octocat?v=any'), env, context)
    expect(render).toHaveBeenCalledTimes(2)
    expect(context.waitUntil).not.toHaveBeenCalled()
  })

  it('keeps authenticated app APIs out of image delivery', async () => {
    for (const route of [
      'auth/login',
      'pro/analytics',
      'github/commit',
      'config/octocat/default',
    ]) {
      const response = await servePublishedImage(
        new Request(`https://gitascii.com/api/${route}`),
        env,
        context
      )
      expect(await response.text()).toBe('application')
    }
  })

  it('does not expose private publication manifests', async () => {
    await publishSource(source, deps)
    const response = await servePublishedImage(
      new Request('https://img.gitascii.com/__publication/manifests/octocat.json'),
      env,
      context
    )
    expect(response.status).toBe(404)
  })

  it('keeps delivering the base image when the KV free quota is exhausted', async () => {
    await publishSource(source, deps)
    const response = await servePublishedImage(
      new Request('https://gitascii.com/api/octocat?widgets=stats'),
      {
        ...env,
        PUBLICATION_REQUESTS: {
          get: async () => {
            throw new Error('KV quota exceeded')
          },
          put: vi.fn(),
          list: vi.fn(),
        },
      },
      context
    )
    await Promise.all(context.waitUntil.mock.calls.map((call) => call[0]))
    expect(response.status).toBe(200)
    expect(response.headers.get('X-GitAscii-Publication')).toBe('variant-pending')
    expect(await response.text()).toBe('<svg>personalized</svg>')
  })

  it('passes conditional requests to assets and preserves a bodyless 304', async () => {
    await publishSource(source, deps)
    env.ASSETS.fetch.mockImplementationOnce(
      async (request) => new Response(objects.get(new URL(request.url).pathname.slice(1)))
    )
    env.ASSETS.fetch.mockImplementationOnce(async (request) => {
      expect(request.headers.get('If-None-Match')).toBe('"test"')
      return new Response(null, { status: 304, headers: { ETag: '"test"' } })
    })
    const response = await servePublishedImage(
      new Request('https://gitascii.com/api/octocat', {
        headers: { 'If-None-Match': '"test"' },
      }),
      env,
      context
    )
    expect(response.status).toBe(304)
    expect(await response.text()).toBe('')
  })

  it('does not send invalid template query values to the rendering application', async () => {
    await publishSource(source, deps)
    const response = await servePublishedImage(
      new Request('https://gitascii.com/api/octocat?template=../../x'),
      env,
      context
    )
    expect(response.status).toBe(200)
    expect(env.APP.fetch).not.toHaveBeenCalled()
  })

  it('preserves scheduled selection between already published profiles', async () => {
    await publishSource(
      {
        ...source,
        profiles: [...source.profiles, { slug: 'weekend', isDefault: false, config: null }],
      },
      deps
    )
    const manifest = await store.readJson<PublicationManifest>(publicationKeys.manifest('octocat'))
    manifest!.rules = {
      ...DEFAULT_PUBLICATION_RULES,
      enabled: true,
      rules: [
        {
          id: 'test',
          name: 'Weekend',
          priority: 100,
          enabled: true,
          type: 'weekend',
          targetProfileSlug: 'weekend',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
    }
    await store.writeJson(publicationKeys.manifest('octocat'), manifest)
    await servePublishedImage(
      new Request('https://gitascii.com/api/octocat?date=2026-09-13T12:00:00Z'),
      env,
      context
    )
    expect(new URL(env.ASSETS.fetch.mock.calls.at(-1)![0].url).pathname).toBe(
      '/profiles/octocat/weekend/dark.svg'
    )
  })
})

describe('image URL compatibility', () => {
  it.each(['/api/Octocat', '/api/svg/Octocat.svg', '/Octocat.svg'])('normalizes %s', (pathname) => {
    expect(parseImageRequest(new URL(pathname, 'https://gitascii.com'))?.variant).toEqual(
      baseVariants('octocat', 'default')[0]
    )
  })
  it('separates themes and canonicalizes widget order', async () => {
    const a = parseImageRequest(
      new URL('https://gitascii.com/api/octocat/work?widgets=b,a,a&theme=light')
    )!
    const b = parseImageRequest(
      new URL('https://gitascii.com/api/octocat/work?widget=a,b&theme=light&v=2')
    )!
    expect(await variantId(a.variant)).toBe(await variantId(b.variant))
    expect(a.explicitSlug).toBe(true)
    expect(a.variant.theme).toBe('light')
  })
  it.each([
    '/icon.svg',
    '/example.svg',
    '/api/auth/login',
    '/api/octocat/health-badge',
    '/api/%2fetc',
  ])('does not capture %s', (pathname) => {
    expect(parseImageRequest(new URL(pathname, 'https://gitascii.com'))).toBeNull()
  })
})
