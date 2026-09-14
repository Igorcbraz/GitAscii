import { evaluatePublishedRules } from '@/features/pro/utils/evaluatePublishedRules'
import { API_ENDPOINTS } from '@/services/endpoints'

import { PUBLICATION, publicationKeys } from '../constants'
import type { PublicationManifest, SvgVariant } from '../types'
import { isImageRoute, parseImageRequest, variantId } from '../utils/variants'

interface FetchBinding {
  fetch(request: Request): Promise<Response>
}
interface RequestQueue {
  get(key: string): Promise<string | null>
  put(
    key: string,
    value: string,
    options: { expirationTtl: number; metadata: SvgVariant }
  ): Promise<void>
  list(options: { limit: number; cursor?: string }): Promise<{
    keys: Array<{ name: string; metadata?: SvgVariant }>
    list_complete: boolean
    cursor?: string
  }>
}
export interface ImageWorkerEnv {
  ASSETS: FetchBinding
  APP?: FetchBinding
  PUBLICATION_REQUESTS?: RequestQueue
  PUBLICATION_READ_TOKEN?: string
}
interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void
}

function assetRequest(request: Request, key: string): Request {
  return new Request(API_ENDPOINTS.PUBLICATION.ASSET(new URL(request.url).origin, key), {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET',
    headers: request.headers,
  })
}

async function readManifest(request: Request, env: ImageWorkerEnv, username: string) {
  const response = await env.ASSETS.fetch(
    new Request(
      API_ENDPOINTS.PUBLICATION.ASSET(
        new URL(request.url).origin,
        publicationKeys.manifest(username)
      )
    )
  )
  return response.ok ? ((await response.json()) as PublicationManifest) : null
}

async function queueVariant(variant: SvgVariant, env: ImageWorkerEnv): Promise<void> {
  if (!env.PUBLICATION_REQUESTS) return
  try {
    const key = `${variant.username}/${variant.profileSlug}/${await variantId(variant)}`
    if (await env.PUBLICATION_REQUESTS.get(key)) return
    await env.PUBLICATION_REQUESTS.put(key, JSON.stringify(variant), {
      expirationTtl: 24 * 60 * 60,
      metadata: variant,
    })
  } catch {
    // KV Free rejects operations at its daily cap; image delivery must remain independent.
    console.warn('SVG publication request queue unavailable')
  }
}

function pendingImage(username: string): Response {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="96" viewBox="0 0 480 96"><rect width="480" height="96" rx="12" fill="#0d1117"/><text x="24" y="42" fill="#c9d1d9" font-family="monospace" font-size="20">GitAscii · @${username}</text><path d="M24 64h120" stroke="#58a6ff" stroke-width="3"/></svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=30',
        'X-GitAscii-Publication': 'pending',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
}

async function privateEndpoint(request: Request, env: ImageWorkerEnv): Promise<Response> {
  if (
    !env.PUBLICATION_READ_TOKEN ||
    request.headers.get('authorization') !== `Bearer ${env.PUBLICATION_READ_TOKEN}`
  ) {
    return new Response(null, { status: 404 })
  }
  const url = new URL(request.url)
  if (url.pathname === '/__publication/queue') {
    const queue = env.PUBLICATION_REQUESTS
    if (!queue) return Response.json({ requests: [], cursor: '' })
    const list = await queue.list({
      limit: PUBLICATION.maxProfilesPerRun,
      cursor: url.searchParams.get('cursor') || undefined,
    })
    return Response.json(
      {
        requests: list.keys.map((key) => key.metadata).filter(Boolean),
        cursor: list.list_complete ? '' : list.cursor,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  }
  if (url.pathname === '/__publication/read') {
    const key = url.searchParams.get('key') || ''
    if (!/^(profiles|__publication)\/[a-zA-Z0-9_./-]+$/.test(key) || key.includes('..')) {
      return new Response(null, { status: 400 })
    }
    return env.ASSETS.fetch(assetRequest(request, key))
  }
  return env.ASSETS.fetch(request)
}

export async function servePublishedImage(
  request: Request,
  env: ImageWorkerEnv,
  context: WorkerContext
): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname === '/__publication/health') {
    const index = await env.ASSETS.fetch(
      new Request(API_ENDPOINTS.PUBLICATION.ASSET(url.origin, '__publication/index.json'), {
        method: 'HEAD',
      })
    )
    return Response.json(
      { ready: index.ok },
      { status: index.ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
  if (url.pathname.startsWith('/__publication/')) return privateEndpoint(request, env)
  const parsed = parseImageRequest(url)
  if (!parsed)
    return !isImageRoute(url) && env.APP
      ? env.APP.fetch(request)
      : new Response(null, { status: 404 })
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
  const { variant } = parsed
  const manifest = await readManifest(request, env, variant.username)
  if (!manifest) {
    context.waitUntil(queueVariant(variant, env))
    const pending = pendingImage(variant.username)
    return request.method === 'HEAD' ? new Response(null, pending) : pending
  }
  if (!parsed.explicitSlug) {
    try {
      variant.profileSlug = evaluatePublishedRules(manifest.rules, manifest.profiles, {
        simulatedDate: parsed.simulatedDate,
        simulatedTimezone: parsed.simulatedTimezone,
      }).selectedProfileSlug
    } catch {
      variant.profileSlug =
        manifest.profiles.find((profile) => profile.isDefault)?.slug || 'default'
    }
  }
  const profile = manifest.profiles.find((item) => item.slug === variant.profileSlug)
  const id = await variantId(variant)
  const exact = profile?.images[id]
  const fallback = profile?.images[variant.theme]
  const image = exact || fallback
  if (!exact) context.waitUntil(queueVariant(variant, env))
  if (!image) {
    const pending = pendingImage(variant.username)
    return request.method === 'HEAD' ? new Response(null, pending) : pending
  }
  const response = await env.ASSETS.fetch(assetRequest(request, image.key))
  if (!response.ok && response.status !== 304) {
    const pending = pendingImage(variant.username)
    return request.method === 'HEAD' ? new Response(null, pending) : pending
  }
  const headers = new Headers(response.headers)
  headers.set('Content-Type', 'image/svg+xml; charset=utf-8')
  headers.set(
    'Cache-Control',
    `public, max-age=${manifest.rules.enabled ? 30 : PUBLICATION.imageCacheSeconds}`
  )
  headers.set('X-GitAscii-Publication', exact ? 'published' : 'variant-pending')
  headers.set('X-GitAscii-Published-At', image.publishedAt)
  headers.set('X-Content-Type-Options', 'nosniff')
  return new Response(response.body, { status: response.status, headers })
}

const imageWorker = { fetch: servePublishedImage }
export default imageWorker
