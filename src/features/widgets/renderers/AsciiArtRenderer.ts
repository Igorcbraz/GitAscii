import { generateAsciiArt } from '@/engine/ascii/converter'
import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { sanitizeColor } from '@/utils/svgSanitizer'

export function renderAsciiArt(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 280)
  const height = Math.max(80, Number(widget?.size?.height) || 280)
  const cfg = widget?.config || {}
  const accent = sanitizeColor((cfg.accentColor as string) || globalStyles?.accentColor, '#c5ff4a')

  const fontSize = Math.max(6, Number(cfg.fontSize) || 9)
  const charWidth = fontSize * 0.58
  const lineHeight = Math.max(7, Math.round(fontSize * 1.12))
  const colorMode = (cfg.colorMode as string) || 'monochrome'
  const asciiText = Array.isArray(cfg.asciiText)
    ? (cfg.asciiText as string[]).map((l) => (typeof l === 'string' ? l : ''))
    : undefined
  const asciiColors = Array.isArray(cfg.asciiColors) ? (cfg.asciiColors as string[][]) : undefined

  const username = data?.user?.login || 'user'

  const asciiLines =
    asciiText ||
    generateAsciiArt(username, {
      charset: (cfg.charset as string) || 'dense',
      customCharset: cfg.customCharset as string,
      invert: Boolean(cfg.invert),
      cols: Math.max(10, Math.floor((width - 32) / charWidth)),
      rows: Math.max(8, Math.floor((height - 32) / lineHeight)),
    })

  const safeAsciiLines =
    Array.isArray(asciiLines) && asciiLines.length > 0 ? asciiLines : ['GitAscii Art']
  const maxCols = Math.max(...safeAsciiLines.map((l) => (typeof l === 'string' ? l.length : 0)), 12)
  const viewW = Math.max(1, maxCols * charWidth)
  const viewH = Math.max(1, safeAsciiLines.length * lineHeight)

  const xCoords = Array.from({ length: maxCols }, (_, i) => (i * charWidth).toFixed(2)).join(' ')
  const fontFamily =
    "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"

  let innerContent = ''

  if (colorMode === 'color' && asciiColors && asciiColors.length === asciiLines.length) {
    innerContent = asciiLines
      .map((line, rowIndex) => {
        const rowColors = asciiColors[rowIndex] || []
        let rowSvg = ''

        for (let charIndex = 0; charIndex < line.length;) {
          let chunk = line[charIndex]
          const rawCharColor = rowColors[charIndex] || accent
          const charColor = sanitizeColor(rawCharColor, accent)
          let nextIndex = charIndex + 1
          while (
            nextIndex < line.length &&
            sanitizeColor(rowColors[nextIndex] || accent, accent) === charColor
          ) {
            chunk += line[nextIndex]
            nextIndex++
          }
          rowSvg += `<tspan fill="${charColor}">${escapeXml(chunk)}</tspan>`
          charIndex = nextIndex
        }

        const yPos = (rowIndex + 0.85) * lineHeight
        return `<text x="${xCoords}" y="${yPos}" font-family="${fontFamily}" font-size="${fontSize}" xml:space="preserve">${rowSvg}</text>`
      })
      .join('\n')
  } else {
    innerContent = asciiLines
      .map((line, rowIndex) => {
        const yPos = (rowIndex + 0.85) * lineHeight
        return `<text x="${xCoords}" y="${yPos}" font-family="${fontFamily}" font-size="${fontSize}" fill="${accent}" xml:space="preserve">${escapeXml(line)}</text>`
      })
      .join('\n')
  }

  return `
    <svg x="16" y="16" width="${width - 32}" height="${height - 32}" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet">
      ${innerContent}
    </svg>
  `
}
