import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderBio(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config
  const textClr = (cfg.textColor as string) || globalStyles.textColor || '#ffffff'
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#c5ff4a'

  const customBio =
    cfg.customBio !== undefined ? (cfg.customBio as string) : data.user.bio || 'No bio provided.'
  const customLocation =
    cfg.customLocation !== undefined ? (cfg.customLocation as string) : data.user.location || ''
  const customBlog =
    cfg.customBlog !== undefined ? (cfg.customBlog as string) : data.user.blog || ''

  const maxCharsPerLine = Math.max(20, Math.floor((width - 72) / 8.5))
  const wrappedLines: string[] = []

  for (const p of customBio.split('\n')) {
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

  const bioSvg = wrappedLines
    .map((line, i) => `<tspan x="24" dy="${i === 0 ? 0 : 20}">${escapeXml(line)}</tspan>`)
    .join('')

  const requiredHeight = 60 + (Math.max(1, wrappedLines.length) - 1) * 20 + 48
  const finalHeight = Math.max(height, requiredHeight)

  let blogHref = customBlog
  if (blogHref && !blogHref.startsWith('http://') && !blogHref.startsWith('https://')) {
    blogHref = `https://${blogHref}`
  }

  const locationSvg = customLocation
    ? `<text x="0" y="0" font-family="${globalStyles.fontFamily}" font-size="12" fill="#7a7a7a">📍 ${escapeXml(customLocation)}</text>`
    : ''

  const blogSvg = customBlog
    ? `<a href="${escapeXml(blogHref)}" target="_blank" rel="noopener noreferrer" cursor="pointer">
         <text x="${customLocation ? 180 : 0}" y="0" font-family="${globalStyles.fontFamily}" font-size="12" fill="${accent}" text-decoration="underline">🌐 ${escapeXml(customBlog)}</text>
       </a>`
    : ''

  return `
    <text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ BIOGRAPHY ]</text>
    <text x="24" y="60" font-family="${globalStyles.fontFamily}" font-size="14" fill="${textClr}">
      ${bioSvg}
    </text>
    <g transform="translate(24, ${finalHeight - 24})">
      ${locationSvg}
      ${blogSvg}
    </g>
  `
}
