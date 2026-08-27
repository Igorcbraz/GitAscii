import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { sanitizeSafeHref } from '@/utils/svgSanitizer'

export function renderBio(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 800)
  const height = Math.max(60, Number(widget?.size?.height) || 120)
  const cfg = widget?.config || {}
  const textClr = (cfg.textColor as string) || globalStyles?.textColor || '#ffffff'
  const accent = (cfg.accentColor as string) || globalStyles?.accentColor || '#c5ff4a'

  const customBio =
    cfg.customBio !== undefined ? String(cfg.customBio) : data?.user?.bio || 'No bio provided.'
  const customLocation =
    cfg.customLocation !== undefined ? String(cfg.customLocation) : data?.user?.location || ''
  const customBlog = cfg.customBlog !== undefined ? String(cfg.customBlog) : data?.user?.blog || ''
  const textAlign = (cfg.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left'

  const contentWidth = Math.max(80, width - 48)
  const charWidthApprox = 8.1
  const maxCharsPerLine = Math.max(12, Math.floor(contentWidth / charWidthApprox))
  const wrappedLines: string[] = []

  for (const p of customBio.split('\n')) {
    if (!p.trim()) {
      wrappedLines.push('')
      continue
    }
    if (p.length <= maxCharsPerLine) {
      wrappedLines.push(p)
      continue
    }
    let remaining = p
    while (remaining.length > 0) {
      if (remaining.length <= maxCharsPerLine) {
        wrappedLines.push(remaining)
        break
      }
      let breakPoint = remaining.lastIndexOf(' ', maxCharsPerLine)
      if (breakPoint === -1) {
        breakPoint = maxCharsPerLine
      }
      wrappedLines.push(remaining.substring(0, breakPoint))
      remaining = remaining.substring(breakPoint + 1).trimStart()
    }
  }

  const textAnchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start'
  const textX = textAlign === 'center' ? width / 2 : textAlign === 'right' ? width - 24 : 24

  const bioSvg = wrappedLines
    .map((line, i) => {
      if (textAlign === 'justify' && wrappedLines.length > 1 && i < wrappedLines.length - 1) {
        const words = line.trim().split(/\s+/)
        if (words.length > 1) {
          const totalWordsLen = words.reduce((acc, w) => acc + w.length, 0)
          const spaceSlots = words.length - 1
          const extraSpace = Math.max(
            0,
            (contentWidth - totalWordsLen * charWidthApprox) / spaceSlots
          )
          const wordSpacingPx = Math.max(4, extraSpace)
          return `<tspan x="24" dy="${i === 0 ? 0 : 20}" word-spacing="${wordSpacingPx.toFixed(1)}px">${escapeXml(line)}</tspan>`
        }
      }
      return `<tspan x="${textX}" dy="${i === 0 ? 0 : 20}">${escapeXml(line)}</tspan>`
    })
    .join('')

  const requiredHeight = 60 + (Math.max(1, wrappedLines.length) - 1) * 20 + 48
  const finalHeight = Math.max(height, requiredHeight)

  let blogHref = customBlog
  if (blogHref && !blogHref.startsWith('http://') && !blogHref.startsWith('https://')) {
    blogHref = `https://${blogHref}`
  }
  blogHref = sanitizeSafeHref(blogHref, '')

  const locationSvg = customLocation
    ? `<text x="0" y="0" font-family="${globalStyles.fontFamily}" font-size="12" fill="#7a7a7a">📍 ${escapeXml(customLocation)}</text>`
    : ''

  const blogSvg =
    customBlog && blogHref
      ? `<a href="${escapeXml(blogHref)}" target="_blank" rel="noopener noreferrer" cursor="pointer">
           <text x="${customLocation ? 180 : 0}" y="0" font-family="${globalStyles.fontFamily}" font-size="12" fill="${accent}" text-decoration="underline">🌐 ${escapeXml(customBlog)}</text>
         </a>`
      : ''

  return `
    <text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ BIOGRAPHY ]</text>
    <text x="${textX}" y="60" text-anchor="${textAnchor}" font-family="${globalStyles.fontFamily}" font-size="14" fill="${textClr}">
      ${bioSvg}
    </text>
    <g transform="translate(24, ${finalHeight - 24})">
      ${locationSvg}
      ${blogSvg}
    </g>
  `
}
