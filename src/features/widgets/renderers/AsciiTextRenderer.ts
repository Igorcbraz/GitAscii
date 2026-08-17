import { type AsciiFontName, convertTextToAscii } from '@/engine/ascii/textConverter'
import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderAsciiText(
  widget: WidgetInstance,
  _data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(80, Number(widget?.size?.width) || 400)
  const height = Math.max(40, Number(widget?.size?.height) || 120)
  const cfg = widget?.config || {}
  const accent = (cfg.accentColor as string) || globalStyles?.accentColor || '#c5ff4a'

  const fontSize = Math.max(6, Number(cfg.fontSize) || 12)
  const charWidth = fontSize * 0.6
  const lineHeight = fontSize * 1.2
  const rawLines = Array.isArray(cfg.asciiLines)
    ? (cfg.asciiLines as string[])
    : convertTextToAscii(
        (cfg.customText as string) || 'GitAscii',
        (cfg.asciiFont as AsciiFontName) || 'block',
        cfg.charSpacing !== undefined ? Number(cfg.charSpacing) : 1,
        (cfg.charset as string) || 'default',
        (cfg.customCharset as string) || ''
      )

  const asciiLines =
    Array.isArray(rawLines) && rawLines.length > 0
      ? rawLines.map((l) => (typeof l === 'string' ? l : ''))
      : ['GitAscii']

  const maxCols = Math.max(...asciiLines.map((l) => l.length), 1)
  const viewW = Math.max(1, maxCols * charWidth)
  const viewH = Math.max(1, asciiLines.length * lineHeight)

  const xCoords = Array.from({ length: maxCols }, (_, i) => (i * charWidth).toFixed(2)).join(' ')
  const fontFamily =
    "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"

  const linesContent = asciiLines
    .map((line, rowIndex) => {
      const yPos = (rowIndex + 0.85) * lineHeight
      return `<text x="${xCoords}" y="${yPos}" font-family="${fontFamily}" font-size="${fontSize}" fill="${accent}" xml:space="preserve">${escapeXml(line)}</text>`
    })
    .join('\n')

  return `
    <svg x="16" y="16" width="${width - 32}" height="${height - 32}" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet">
      ${linesContent}
    </svg>
  `
}
