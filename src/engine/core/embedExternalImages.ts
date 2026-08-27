import { isTrustedCdnHostname } from '@/constants'
import { safeFetch, validateSafeExternalUrl } from '@/utils/ssrfValidator'
import { sanitizeSvg } from '@/utils/svgSanitizer'

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

function inlineSvg(
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

  const inlinedSvgContent = svg.replace(svgTagRegex, newSvgTag)

  if (extractedStyles.trim()) {
    return `<style>\n${extractedStyles.trim()}\n</style>\n${inlinedSvgContent}`
  }

  return inlinedSvgContent
}

async function fetchAndProcessExternalImage(
  url: string,
  x: string,
  y: string,
  width: string,
  height: string,
  preserve: string
): Promise<string> {
  const urlCheck = await validateSafeExternalUrl(url)
  if (!urlCheck.safe) {
    console.warn(
      `SSRF protection blocked external request: ${url.replace(/[\r\n]/g, '')} (${(urlCheck.error || '').replace(/[\r\n]/g, '')})`
    )
    throw new Error(`Blocked URL: ${urlCheck.error}`)
  }

  const response = await safeFetch(url, {
    headers: { accept: 'image/svg+xml, image/*;q=0.9, */*;q=0.1' },
    signal: AbortSignal.timeout(6000),
  })
  if (!response.ok) {
    console.warn(
      `Failed to fetch external SVG: ${url.replace(/[\r\n]/g, '')} (HTTP ${response.status})`
    )
    throw new Error(`HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  const buffer = await response.arrayBuffer()

  if (buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error('Image response too large')
  }

  const isSvg =
    contentType.includes('image/svg+xml') ||
    contentType.includes('xml') ||
    url.toLowerCase().split('?')[0].endsWith('.svg')

  if (isSvg) {
    try {
      const text = Buffer.from(buffer).toString('utf-8')
      return inlineSvg(text, x, y, width, height, preserve)
    } catch (inlineErr) {
      console.error('Failed to inline SVG, falling back to base64 image tag:', inlineErr)
      const base64 = Buffer.from(buffer).toString('base64')
      return `<image href="data:image/svg+xml;base64,${base64}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" />`
    }
  } else {
    const base64 = Buffer.from(buffer).toString('base64')
    let mimeType = contentType.split(';')[0].trim()
    if (!mimeType || !mimeType.startsWith('image/')) mimeType = 'image/png'
    return `<image href="data:${mimeType};base64,${base64}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" />`
  }
}

function unescapeXmlContent(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

export interface ProcessedSvgResult {
  svg: string
  hasErrors: boolean
}

export async function embedExternalImages(svgContent: string): Promise<ProcessedSvgResult> {
  const JSON_START_TOKEN = '<!-- EXTERNAL_WIDGET_JSON:'
  const LEGACY_START_TOKEN = '<!-- EXTERNAL_WIDGET_START:'
  const COMMENT_END_TOKEN = '-->'
  const BLOCK_END_TOKEN = '<!-- EXTERNAL_WIDGET_END -->'

  let finalSvg = svgContent
  let hasErrors = false

  // 1. Process robust JSON format first using safe index scanning (immune to ReDoS)
  while (true) {
    const startIdx = finalSvg.indexOf(JSON_START_TOKEN)
    if (startIdx === -1) break

    const commentEndIdx = finalSvg.indexOf(COMMENT_END_TOKEN, startIdx + JSON_START_TOKEN.length)
    if (commentEndIdx === -1) break

    const blockEndIdx = finalSvg.indexOf(BLOCK_END_TOKEN, commentEndIdx + COMMENT_END_TOKEN.length)
    if (blockEndIdx === -1) break

    const rawJsonSection = finalSvg.slice(startIdx + JSON_START_TOKEN.length, commentEndIdx)

    let replacement = ''
    try {
      const parsed = JSON.parse(unescapeXmlContent(rawJsonSection.trim()))
      const { url, x, y, width, height, mode, fallbackUrl } = parsed
      const preserve = mode === 'badge' ? 'xMinYMid meet' : 'xMinYMin meet'

      try {
        replacement = await fetchAndProcessExternalImage(
          url,
          String(x),
          String(y),
          String(width),
          String(height),
          preserve
        )
      } catch {
        if (fallbackUrl) {
          try {
            replacement = await fetchAndProcessExternalImage(
              fallbackUrl,
              String(x),
              String(y),
              String(width),
              String(height),
              preserve
            )
          } catch {}
        }
        if (!replacement) {
          hasErrors = true
          const isSnake = url.includes('contribution-grid-snake') || url.includes('platane')
          const isStreak = url.includes('streak-stats')

          let errorMsg = 'Failed to load widget'
          if (isSnake) {
            errorMsg = 'Snake not generated yet (run GitHub Action)'
          } else if (isStreak) {
            errorMsg = 'Streak stats temporarily unavailable'
          }

          replacement = `<svg width="${width}" height="${height}" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#141414" rx="6" ry="6" stroke="#333" stroke-dasharray="4" />
            <text x="50%" y="50%" fill="#888888" font-family="monospace" font-size="11" text-anchor="middle" dominant-baseline="middle">${errorMsg}</text>
          </svg>`
        }
      }
    } catch (e) {
      console.warn('Failed to parse JSON external widget marker:', e)
      hasErrors = true
      replacement = ''
    }

    finalSvg =
      finalSvg.slice(0, startIdx) +
      replacement +
      finalSvg.slice(blockEndIdx + BLOCK_END_TOKEN.length)
  }

  // 2. Process legacy format for any remaining widgets using safe index scanning
  while (true) {
    const startIdx = finalSvg.indexOf(LEGACY_START_TOKEN)
    if (startIdx === -1) break

    const commentEndIdx = finalSvg.indexOf(COMMENT_END_TOKEN, startIdx + LEGACY_START_TOKEN.length)
    if (commentEndIdx === -1) break

    const blockEndIdx = finalSvg.indexOf(BLOCK_END_TOKEN, commentEndIdx + COMMENT_END_TOKEN.length)
    if (blockEndIdx === -1) break

    const startData = finalSvg.slice(startIdx + LEGACY_START_TOKEN.length, commentEndIdx).trim()
    const parts = startData.split('|').map((s) => s.trim())

    let replacement = ''
    if (parts.length >= 6) {
      let urlPart: string
      let xPart: string
      let yPart: string
      let widthPart: string
      let heightPart: string
      let modePart: string
      let fallbackUrlPart: string = ''

      if (parts.length === 7) {
        ;[urlPart, xPart, yPart, widthPart, heightPart, modePart, fallbackUrlPart] = parts
      } else if (parts.length === 6) {
        ;[urlPart, xPart, yPart, widthPart, heightPart, modePart] = parts
      } else {
        fallbackUrlPart = parts[parts.length - 1]
        modePart = parts[parts.length - 2]
        heightPart = parts[parts.length - 3]
        widthPart = parts[parts.length - 4]
        yPart = parts[parts.length - 5]
        xPart = parts[parts.length - 6]
        urlPart = parts.slice(0, parts.length - 6).join('|')
      }

      const url = unescapeXmlContent(urlPart)
      const x = xPart
      const y = yPart
      const width = widthPart
      const height = heightPart
      const mode = modePart
      const fallbackUrl = unescapeXmlContent(fallbackUrlPart)
      const preserve = mode === 'badge' ? 'xMinYMid meet' : 'xMinYMin meet'

      try {
        replacement = await fetchAndProcessExternalImage(url, x, y, width, height, preserve)
      } catch {
        if (fallbackUrl) {
          try {
            replacement = await fetchAndProcessExternalImage(
              fallbackUrl,
              x,
              y,
              width,
              height,
              preserve
            )
          } catch {}
        }
        if (!replacement) {
          hasErrors = true
          const isSnake = url.includes('contribution-grid-snake') || url.includes('platane')
          const isStreak = url.includes('streak-stats')

          let errorMsg = 'Failed to load widget'
          if (isSnake) {
            errorMsg = 'Snake not generated yet (run GitHub Action)'
          } else if (isStreak) {
            errorMsg = 'Streak stats temporarily unavailable'
          }

          replacement = `<svg width="${width}" height="${height}" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#141414" rx="6" ry="6" stroke="#333" stroke-dasharray="4" />
            <text x="50%" y="50%" fill="#888888" font-family="monospace" font-size="11" text-anchor="middle" dominant-baseline="middle">${errorMsg}</text>
          </svg>`
        }
      }
    }

    finalSvg =
      finalSvg.slice(0, startIdx) +
      replacement +
      finalSvg.slice(blockEndIdx + BLOCK_END_TOKEN.length)
  }

  const imageMatches = finalSvg.match(/<image[^<>]*>/gi) || []

  for (const fullMatch of imageMatches) {
    const hrefMatch = fullMatch.match(/href="((?:https?:\/\/|www\.)[^"]+?)"/i)
    if (!hrefMatch) continue
    let url = hrefMatch[1].replace(/&amp;/g, '&')

    try {
      const parsedUrl = new URL(url)
      if (
        (parsedUrl.hostname === 'assets.tcgdex.net' ||
          parsedUrl.hostname.endsWith('.tcgdex.net')) &&
        parsedUrl.pathname.endsWith('/high.webp')
      ) {
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/high\.webp$/, '/low.webp')
        url = parsedUrl.toString()
      }
    } catch {
      // Keep original URL if unparseable
    }

    try {
      let response: Response
      try {
        response = await safeFetch(url, {
          headers: { accept: 'image/*, */*' },
          signal: AbortSignal.timeout(4000),
        })
      } catch (fetchErr) {
        const urlObj = new URL(url)
        const isTrustedCdn = isTrustedCdnHostname(urlObj.hostname)

        if (isTrustedCdn) {
          response = await fetch(url, {
            headers: { accept: 'image/*, */*' },
            signal: AbortSignal.timeout(4000),
          })
        } else {
          throw fetchErr
        }
      }

      if (!response.ok) {
        hasErrors = true
        continue
      }
      const buffer = await response.arrayBuffer()
      if (buffer.byteLength > 5 * 1024 * 1024) continue

      let mimeType = (response.headers.get('content-type') || 'image/webp').split(';')[0].trim()
      if (!mimeType || !mimeType.startsWith('image/')) mimeType = 'image/png'
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUri = `data:${mimeType};base64,${base64}`

      const replacement = fullMatch.replace(hrefMatch[0], `href="${dataUri}"`)
      finalSvg = finalSvg.replace(fullMatch, () => replacement)
    } catch (err) {
      hasErrors = true
      const errorMessage = (err instanceof Error ? err.message : String(err)).replace(/[\r\n]/g, '')
      console.error(
        'Failed to embed inline image:',
        url.replace(/[\r\n]/g, ''),
        `error=${errorMessage}`
      )
    }
  }

  return { svg: sanitizeSvg(finalSvg), hasErrors }
}
