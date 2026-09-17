import { isTrustedCdnHostname } from '@/constants'
import { safeFetch, validateSafeExternalUrl } from '@/utils/ssrfValidator'
import { sanitizeSvg } from '@/utils/svgSanitizer'

export interface InlinerOptions {
  fetcher?: (url: string, init?: RequestInit) => Promise<Response>
  validateUrl?: (url: string) => Promise<{ safe: boolean; error?: string }>
  timeoutMs?: number
  maxSizeBytes?: number
  maxConcurrency?: number
}

export interface ProcessedSvgResult {
  svg: string
  hasErrors: boolean
  failedUrls?: string[]
}

const DEFAULT_TIMEOUT_MS = 4000
const DEFAULT_MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const DEFAULT_MAX_CONCURRENCY = 4

function getAttributeValue(attrsString: string, name: string): string | null {
  const regex = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
  const match = attrsString.match(regex)
  if (!match) return null
  return match[1] || match[2] || match[3] || null
}

function removeAttributes(attrsString: string, names: string[]): string {
  let cleaned = attrsString
  for (const name of names) {
    const regex = new RegExp(`\\b${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, 'gi')
    cleaned = cleaned.replace(regex, '')
  }
  return cleaned
}

function inlineSvgContent(
  fetchedSvg: string,
  x: string,
  y: string,
  width: string,
  height: string,
  preserve: string
): string {
  const sanitized = sanitizeSvg(fetchedSvg)
  let svg = sanitized.replace(/<\?xml[\s\S]*?\?>/i, '').trim()
  svg = svg.replace(/<!DOCTYPE[\s\S]*?>/i, '').trim()

  const styleRegex = /<style[^<>]*>([\s\S]*?)<\/style>/gi
  let extractedStyles = ''
  const styleMatches = [...svg.matchAll(styleRegex)]
  for (const match of styleMatches) {
    extractedStyles += match[1] + '\n'
  }

  while (svg.match(styleRegex)) {
    svg = svg.replace(styleRegex, '')
  }

  const svgTagRegex = /<svg([^>]*)>/i
  const match = svg.match(svgTagRegex)
  if (!match) {
    throw new Error('No opening <svg> tag found in fetched content')
  }

  let attributesString = match[1]

  const originalWidth = getAttributeValue(attributesString, 'width')
  const originalHeight = getAttributeValue(attributesString, 'height')
  let viewBox = getAttributeValue(attributesString, 'viewBox')

  if (!viewBox && originalWidth && originalHeight) {
    const w = parseFloat(originalWidth)
    const h = parseFloat(originalHeight)
    if (!isNaN(w) && !isNaN(h)) {
      viewBox = `0 0 ${w} ${h}`
    }
  }

  attributesString = removeAttributes(attributesString, [
    'x',
    'y',
    'width',
    'height',
    'preserveAspectRatio',
    'viewBox',
  ])

  let newAttrs = ` x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}"`
  if (viewBox) {
    newAttrs += ` viewBox="${viewBox}"`
  }

  attributesString = attributesString.replace(/\s+/g, ' ').trim()
  const newSvgTag = `<svg ${attributesString} ${newAttrs}>`.replace(/\s+/g, ' ')

  const inlined = svg.replace(svgTagRegex, newSvgTag)

  if (extractedStyles.trim()) {
    return `<style>\n${extractedStyles.trim()}\n</style>\n${inlined}`
  }

  return inlined
}

function unescapeXmlContent(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

// Lightweight concurrency pool to prevent socket exhaustion and rate limit traps
async function asyncPool<T, R>(
  limit: number,
  array: readonly T[],
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const ret: Promise<R>[] = []
  const executing = new Set<Promise<R>>()

  for (let i = 0; i < array.length; i++) {
    const p = Promise.resolve().then(() => fn(array[i], i))
    ret.push(p)
    executing.add(p)

    const clean = () => executing.delete(p)
    p.then(clean, clean)

    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  return Promise.all(ret)
}

const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

export async function processExternalAssets(
  svgContent: string,
  options: InlinerOptions = {}
): Promise<ProcessedSvgResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES
  const maxConcurrency = options.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY
  const fetcher = options.fetcher ?? safeFetch
  const validateUrl = options.validateUrl ?? validateSafeExternalUrl

  let finalSvg = svgContent
  let hasErrors = false
  const failedUrls: string[] = []

  // 1. Process structured JSON external widget markers
  const JSON_START_TOKEN = '<!-- EXTERNAL_WIDGET_JSON:'
  const COMMENT_END_TOKEN = '-->'
  const BLOCK_END_TOKEN = '<!-- EXTERNAL_WIDGET_END -->'

  interface WidgetPlaceholder {
    startIdx: number
    endIdx: number
    rawJson: string
  }

  const widgetPlaceholders: WidgetPlaceholder[] = []
  let searchIdx = 0

  while (true) {
    const startIdx = finalSvg.indexOf(JSON_START_TOKEN, searchIdx)
    if (startIdx === -1) break

    const commentEndIdx = finalSvg.indexOf(COMMENT_END_TOKEN, startIdx + JSON_START_TOKEN.length)
    if (commentEndIdx === -1) break

    const blockEndIdx = finalSvg.indexOf(BLOCK_END_TOKEN, commentEndIdx + COMMENT_END_TOKEN.length)
    if (blockEndIdx === -1) break

    const rawJson = finalSvg.slice(startIdx + JSON_START_TOKEN.length, commentEndIdx)
    widgetPlaceholders.push({
      startIdx,
      endIdx: blockEndIdx + BLOCK_END_TOKEN.length,
      rawJson,
    })

    searchIdx = blockEndIdx + BLOCK_END_TOKEN.length
  }

  const fetchAsset = async (
    url: string,
    x: string,
    y: string,
    width: string,
    height: string,
    preserve: string
  ): Promise<string> => {
    if (validateUrl) {
      const urlCheck = await validateUrl(url)
      if (!urlCheck.safe) {
        throw new Error(`SSRF blocked: ${urlCheck.error || 'unsafe URL'}`)
      }
    }

    const response = await fetcher(url, {
      headers: { accept: 'image/svg+xml, image/png, image/webp, image/*;q=0.9, */*;q=0.1' },
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    const buffer = await response.arrayBuffer()

    if (buffer.byteLength > maxSizeBytes) {
      throw new Error(`Asset exceeds maximum allowed size (${maxSizeBytes} bytes)`)
    }

    const isSvg =
      contentType.includes('image/svg+xml') ||
      contentType.includes('xml') ||
      url.toLowerCase().split('?')[0].endsWith('.svg')

    if (isSvg) {
      try {
        const text = Buffer.from(buffer).toString('utf-8')
        return inlineSvgContent(text, x, y, width, height, preserve)
      } catch (err) {
        console.warn('Failed to inline SVG as text, falling back to base64 image:', err)
        const base64 = Buffer.from(buffer).toString('base64')
        return `<image href="data:image/svg+xml;base64,${base64}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" />`
      }
    } else {
      let mimeType = contentType.split(';')[0].trim()
      if (!mimeType || !mimeType.startsWith('image/')) mimeType = 'image/png'
      const base64 = Buffer.from(buffer).toString('base64')
      return `<image href="data:${mimeType};base64,${base64}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" />`
    }
  }

  // Resolve widget placeholders in parallel with bounded concurrency
  const widgetReplacements = await asyncPool(
    maxConcurrency,
    widgetPlaceholders,
    async (item): Promise<{ replacement: string; error?: string }> => {
      try {
        const parsed = JSON.parse(unescapeXmlContent(item.rawJson.trim()))
        const { url, x, y, width, height, mode, fallbackUrl } = parsed
        const preserve = mode === 'badge' ? 'xMinYMid meet' : 'xMinYMin meet'

        try {
          const res = await fetchAsset(
            url,
            String(x),
            String(y),
            String(width),
            String(height),
            preserve
          )
          return { replacement: res }
        } catch {
          if (fallbackUrl) {
            try {
              const res = await fetchAsset(
                fallbackUrl,
                String(x),
                String(y),
                String(width),
                String(height),
                preserve
              )
              return { replacement: res }
            } catch (fallbackErr) {
              console.warn('Fallback URL also failed:', fallbackErr)
            }
          }

          const isSnake = url.includes('contribution-grid-snake') || url.includes('platane')
          const isStreak = url.includes('streak-stats')

          let errorMsg = 'Failed to load widget'
          if (isSnake) {
            errorMsg = 'Snake not generated yet (run GitHub Action)'
          } else if (isStreak) {
            errorMsg = 'Streak stats temporarily unavailable'
          }

          const fallbackPlaceholder = `<svg width="${width}" height="${height}" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#141414" rx="6" ry="6" stroke="#333" stroke-dasharray="4" />
            <text x="50%" y="50%" fill="#888888" font-family="monospace" font-size="11" text-anchor="middle" dominant-baseline="middle">${errorMsg}</text>
          </svg>`

          return { replacement: fallbackPlaceholder, error: url }
        }
      } catch (err) {
        console.warn('Invalid JSON marker for widget:', err)
        return { replacement: '', error: 'invalid_json_marker' }
      }
    }
  )

  // Apply widget replacements in reverse order to preserve string offsets
  for (let i = widgetPlaceholders.length - 1; i >= 0; i--) {
    const item = widgetPlaceholders[i]
    const rep = widgetReplacements[i]
    if (rep.error) {
      hasErrors = true
      failedUrls.push(rep.error)
    }
    finalSvg = finalSvg.slice(0, item.startIdx) + rep.replacement + finalSvg.slice(item.endIdx)
  }

  // 2. Process inline <image href="http..."> tags
  const imageMatches = [...finalSvg.matchAll(/<image[^<>]*>/gi)]
  const imageCandidates = imageMatches
    .map((match) => {
      const hrefMatch = match[0].match(/href="((?:https?:\/\/|www\.)[^"]+?)"/i)
      return hrefMatch ? { fullTag: match[0], url: hrefMatch[1].replace(/&amp;/g, '&') } : null
    })
    .filter((item): item is { fullTag: string; url: string } => item !== null)

  const imageResults = await asyncPool(maxConcurrency, imageCandidates, async (cand) => {
    let targetUrl = cand.url
    try {
      const parsedUrl = new URL(targetUrl)
      if (
        (parsedUrl.hostname === 'assets.tcgdex.net' ||
          parsedUrl.hostname.endsWith('.tcgdex.net')) &&
        (parsedUrl.pathname.endsWith('.webp') || parsedUrl.pathname.endsWith('/high.webp') || parsedUrl.pathname.endsWith('/low.webp'))
      ) {
        parsedUrl.pathname = parsedUrl.pathname.replace(/\.webp$/, '.png')
        targetUrl = parsedUrl.toString()
      }
    } catch (urlErr) {
      console.debug('Failed to parse URL for tcgdex replacement:', urlErr)
    }

    try {
      let response: Response
      try {
        response = await fetcher(targetUrl, {
          headers: { accept: 'image/*, */*' },
          signal: AbortSignal.timeout(timeoutMs),
        })
      } catch (fetchErr) {
        const urlObj = new URL(targetUrl)
        if (isTrustedCdnHostname(urlObj.hostname)) {
          response = await fetch(targetUrl, {
            headers: { accept: 'image/*, */*' },
            signal: AbortSignal.timeout(timeoutMs),
          })
        } else {
          throw fetchErr
        }
      }

      if (!response.ok) {
        return {
          fullTag: cand.fullTag,
          replacement: cand.fullTag
            .replace(/\bhref="[^"]+"/, `href="${TRANSPARENT_PIXEL}"`)
            .replace(/\bxlink:href="[^"]+"/, `xlink:href="${TRANSPARENT_PIXEL}"`),
          error: targetUrl,
        }
      }

      const buffer = await response.arrayBuffer()
      if (buffer.byteLength > maxSizeBytes) {
        return {
          fullTag: cand.fullTag,
          replacement: cand.fullTag
            .replace(/\bhref="[^"]+"/, `href="${TRANSPARENT_PIXEL}"`)
            .replace(/\bxlink:href="[^"]+"/, `xlink:href="${TRANSPARENT_PIXEL}"`),
          error: targetUrl,
        }
      }

      let mimeType = (response.headers.get('content-type') || 'image/png').split(';')[0].trim()
      if (!mimeType || !mimeType.startsWith('image/')) mimeType = 'image/png'
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUri = `data:${mimeType};base64,${base64}`

      return {
        fullTag: cand.fullTag,
        replacement: cand.fullTag
          .replace(/\bhref="[^"]+"/, `href="${dataUri}"`)
          .replace(/\bxlink:href="[^"]+"/, `xlink:href="${dataUri}"`),
      }
    } catch (err) {
      console.warn('Failed to fetch or inline image:', err)
      return {
        fullTag: cand.fullTag,
        replacement: cand.fullTag
          .replace(/\bhref="[^"]+"/, `href="${TRANSPARENT_PIXEL}"`)
          .replace(/\bxlink:href="[^"]+"/, `xlink:href="${TRANSPARENT_PIXEL}"`),
        error: targetUrl,
      }
    }
  })

  for (const res of imageResults) {
    if (res.error) {
      hasErrors = true
      failedUrls.push(res.error)
    }
    finalSvg = finalSvg.replace(res.fullTag, res.replacement)
  }

  return {
    svg: sanitizeSvg(finalSvg),
    hasErrors,
    failedUrls: failedUrls.length > 0 ? failedUrls : undefined,
  }
}

// Backward compatibility alias for legacy call sites during migration
export const embedExternalImages = processExternalAssets
