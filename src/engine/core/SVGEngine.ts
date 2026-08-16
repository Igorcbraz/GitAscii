import { safeFetch, validateSafeExternalUrl } from '@/utils/ssrfValidator'
import { sanitizeSvg } from '@/utils/svgSanitizer'

import type { NormalizedGitHubData, RenderOptions, SavedConfiguration } from '../types'
import { renderWidgetSvg } from './WidgetRenderer'

export function renderSvg(
  config: SavedConfiguration,
  data: NormalizedGitHubData,
  options: RenderOptions = {}
): string {
  const isLight = options.theme === 'light'

  const bg = isLight ? '#ffffff' : config.globalStyles.backgroundColor || '#060606'
  const isTransparent = Boolean(config.globalStyles.transparentBackground)

  const targetWidgetIds = options.widgets
  let visibleWidgets = config.widgets.filter(
    (w) =>
      w.visible &&
      (!targetWidgetIds ||
        targetWidgetIds.includes(w.instanceId) ||
        targetWidgetIds.includes(w.widgetId))
  )

  if (targetWidgetIds && visibleWidgets.length === 0) {
    visibleWidgets = config.widgets.filter((w) => w.visible)
  }

  const shrinkWrap = Boolean(targetWidgetIds && visibleWidgets.length > 0)

  const minX = shrinkWrap ? Math.min(...visibleWidgets.map((w) => w.position.x)) : 0

  const minY = shrinkWrap ? Math.min(...visibleWidgets.map((w) => w.position.y)) : 0

  const adjustedWidgets = visibleWidgets.map((w) => ({
    ...w,
    position: {
      ...w.position,
      x: w.position.x - minX,
      y: w.position.y - minY,
    },
  }))

  let maxX = shrinkWrap ? 0 : 800
  let maxY = shrinkWrap ? 0 : 100

  adjustedWidgets.forEach((w) => {
    const right = w.position.x + w.size.width
    const bottom = w.position.y + w.size.height
    if (right > maxX) maxX = right
    if (bottom > maxY) maxY = bottom
  })

  const width = options.width || (shrinkWrap ? Math.max(maxX, 1) : 800)
  const height = options.height || (shrinkWrap ? Math.max(maxY, 1) : maxY + 16)

  const widgetsSvg = adjustedWidgets
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((widget) => renderWidgetSvg(widget, data, config.globalStyles))
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500&amp;family=PT+Serif:ital,wght@0,300;1,300&amp;display=swap');

    * {
      box-sizing: border-box;
    }

    text {
      user-select: none;
    }
  </style>

  ${!isTransparent ? `<rect width="${width}" height="${height}" fill="${bg}" rx="${config.globalStyles.borderRadius || 0}" />` : ''}

  ${widgetsSvg}
</svg>`
}

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

  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
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
    console.warn(`SSRF protection blocked external request: ${url} (${urlCheck.error})`)
    return `<svg width="${width}" height="${height}" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#2A2A2A" rx="4" ry="4" stroke="#e06c75" stroke-dasharray="4" />
      <text x="50%" y="50%" fill="#e06c75" font-family="monospace" font-size="12" text-anchor="middle" dominant-baseline="middle">Blocked URL</text>
    </svg>`
  }

  try {
    const response = await safeFetch(url, {
      headers: { accept: 'image/svg+xml, image/*;q=0.9, */*;q=0.1' },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      console.warn(`Failed to fetch external SVG: ${url} (HTTP ${response.status})`)
      return `<svg width="${width}" height="${height}" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#2A2A2A" rx="4" ry="4" stroke="#e06c75" stroke-dasharray="4" />
        <text x="50%" y="50%" fill="#e06c75" font-family="monospace" font-size="12" text-anchor="middle" dominant-baseline="middle">Failed to load widget</text>
      </svg>`
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
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.warn(`Failed to fetch external SVG: ${url} (${errorMsg})`)
    return `<svg width="${width}" height="${height}" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#2A2A2A" rx="4" ry="4" stroke="#e06c75" stroke-dasharray="4" />
      <text x="50%" y="50%" fill="#e06c75" font-family="monospace" font-size="12" text-anchor="middle" dominant-baseline="middle">Failed to load widget</text>
    </svg>`
  }
}

export async function embedExternalImages(svgContent: string): Promise<string> {
  const regex = /<!-- EXTERNAL_WIDGET_START:([\s\S]*?)-->([\s\S]*?)<!-- EXTERNAL_WIDGET_END -->/g

  let finalSvg = svgContent
  const matches = [...svgContent.matchAll(regex)]

  for (const m of matches) {
    const fullMatch = m[0]
    const startData = m[1].trim()
    const parts = startData.split('|').map((s) => s.trim())
    if (parts.length !== 7) continue
    const [urlPart, xPart, yPart, widthPart, heightPart, modePart, fallbackUrlPart] = parts
    const url = urlPart.replace(/&amp;/g, '&')
    const x = xPart
    const y = yPart
    const width = widthPart
    const height = heightPart
    const mode = modePart
    const fallbackUrl = fallbackUrlPart.replace(/&amp;/g, '&')

    const preserve = mode === 'badge' ? 'xMinYMid meet' : 'xMinYMin meet'

    try {
      const replacement = await fetchAndProcessExternalImage(url, x, y, width, height, preserve)
      finalSvg = finalSvg.replace(fullMatch, () => replacement)
    } catch (err) {
      console.error('Failed to fetch external widget:', url, err)

      if (fallbackUrl) {
        try {
          const replacement = await fetchAndProcessExternalImage(
            fallbackUrl,
            x,
            y,
            width,
            height,
            preserve
          )
          finalSvg = finalSvg.replace(fullMatch, () => replacement)
          continue
        } catch (fbErr) {
          console.error('Failed to fetch fallback widget:', fallbackUrl, fbErr)
        }
      }

      finalSvg = finalSvg.replace(
        fullMatch,
        () =>
          `<text x="${x}" y="${Number(y) + 12}" font-family="monospace" font-size="10" fill="red">Failed to load external widget</text>`
      )
    }
  }

  const imageRegex = /<image\s+[^>]*>/gi
  const imageMatches = [...finalSvg.matchAll(imageRegex)]

  for (const m of imageMatches) {
    const fullMatch = m[0]
    const hrefMatch = fullMatch.match(/href="((?:https?:\/\/|www\.)[^"]+?)"/)
    if (!hrefMatch) continue
    const url = hrefMatch[1].replace(/&amp;/g, '&')

    try {
      const response = await safeFetch(url, {
        headers: { accept: 'image/*, */*' },
        signal: AbortSignal.timeout(4000),
      })
      if (!response.ok) continue
      const buffer = await response.arrayBuffer()
      if (buffer.byteLength > 5 * 1024 * 1024) continue

      const contentType = response.headers.get('content-type') || 'image/png'
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUri = `data:${contentType};base64,${base64}`

      const replacement = fullMatch.replace(hrefMatch[0], `href="${dataUri}"`)
      finalSvg = finalSvg.replace(fullMatch, () => replacement)
    } catch (err) {
      console.error('Failed to embed inline image:', url, err)
    }
  }

  return finalSvg
}
