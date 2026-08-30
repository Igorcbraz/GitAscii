import { generateAsciiArt } from '@/engine/ascii/converter'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const INTERNAL_W = 370
const INTERNAL_H = 400

export function renderAsciiPortrait(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  isStaticOverride?: boolean
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 370)
  const height = Math.max(100, Number(widget?.size?.height) || 400)

  const IW = INTERNAL_W
  const IH = INTERNAL_H
  const cfg = widget?.config || {}

  const username = data?.user?.login || 'user'
  const name = data?.user?.name || username

  const COLS = Number(cfg.cols) || 100
  const RAMP = (cfg.customCharset as string) || (cfg.charset as string) || ' .`:-=+*cs#%@'

  const ROW_DUR = Number(cfg.rowDur) || 0.11
  const STAGGER = Number(cfg.stagger) || 0.11

  const bg1 = (cfg.backgroundColor as string) || globalStyles.backgroundColor || '#111722'
  const bg2 = '#0d1117'
  const frameColor = (cfg.borderColor as string) || globalStyles.borderColor || '#30363d'
  const inkColor = (cfg.accentColor as string) || globalStyles.accentColor || '#c9d1d9'
  const titleColor = '#7d8590'
  const cursorColor = inkColor

  const customTitle = (cfg.customTitle as string) || `${username}@github: ~$ ./portrait.sh`
  const customWhoami = (cfg.customWhoami as string) || name

  const PAD = 20
  const TITLEBAR_H = 30
  const STATUS_H = 30

  const CELL_W = (IW - PAD * 2) / COLS
  const remainingHeight = IH - TITLEBAR_H - STATUS_H - PAD

  let rowsTxt: string[] = []
  if (Array.isArray(cfg.asciiText) && cfg.asciiText.length > 0) {
    rowsTxt = cfg.asciiText
  } else {
    const calculatedRowsCount = Math.max(10, Math.floor(remainingHeight / 15))
    rowsTxt = generateAsciiArt(username, {
      charset: 'dense',
      customCharset: RAMP,
      cols: COLS,
      rows: calculatedRowsCount,
    })
  }

  const ROWS = rowsTxt.length
  const CELL_H = remainingHeight / ROWS
  const ART_W = COLS * CELL_W
  const ART_H = ROWS * CELL_H
  const fontSize = CELL_H * 0.86
  void ART_W

  const parts: string[] = []

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${IW} ${IH}" preserveAspectRatio="xMidYMid meet" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">`
  )
  parts.push(
    `<defs>` +
      `<linearGradient id="portrait-bg-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>` +
      `</linearGradient>` +
      `</defs>`
  )

  parts.push(
    `<rect width="${IW}" height="${IH}" rx="${globalStyles.borderRadius || 12}" fill="url(#portrait-bg-${widget.instanceId})"/>`
  )
  parts.push(
    `<rect x="0.5" y="0.5" width="${IW - 1}" height="${IH - 1}" rx="${globalStyles.borderRadius || 12}" fill="none" stroke="${frameColor}" stroke-width="1"/>`
  )

  parts.push(
    `<line x1="0" y1="${TITLEBAR_H}" x2="${IW}" y2="${TITLEBAR_H}" stroke="${frameColor}"/>`
  )
  const dotcols = ['#ff5f56', '#ffbd2e', '#27c93f']
  for (let i = 0; i < 3; i++) {
    parts.push(`<circle cx="${PAD + i * 16}" cy="${TITLEBAR_H / 2}" r="5" fill="${dotcols[i]}"/>`)
  }
  parts.push(
    `<text x="${IW / 2}" y="${TITLEBAR_H / 2 + 4}" fill="${titleColor}" font-size="12" text-anchor="middle">${escapeXml(customTitle)}</text>`
  )

  const artTop = TITLEBAR_H + PAD * 0.35

  const isStatic = isStaticOverride !== undefined ? isStaticOverride : Boolean(cfg.staticMode)

  for (let ry = 0; ry < ROWS; ry++) {
    const line = rowsTxt[ry] || ''
    const y = artTop + ry * CELL_H + CELL_H * 0.74
    const rowY = artTop + ry * CELL_H
    const delay = ry * STAGGER
    const safeLine = escapeXml(line)

    const textElement = `<text xml:space="preserve" x="${PAD}" y="${y.toFixed(1)}" fill="${inkColor}" font-size="${fontSize.toFixed(1)}" textLength="${ART_W.toFixed(1)}" lengthAdjust="spacing">${safeLine}</text>`

    if (isStatic) {
      parts.push(textElement)
      continue
    }

    const clipId = `r-${widget.instanceId}-${ry}`
    parts.push(
      `<clipPath id="${clipId}"><rect x="${PAD}" y="${rowY.toFixed(1)}" height="${CELL_H.toFixed(1)}" width="0">` +
        `<animate attributeName="width" from="0" to="${ART_W.toFixed(1)}" begin="${delay.toFixed(3)}s" dur="${ROW_DUR.toFixed(2)}s" fill="freeze"/>` +
        `</rect></clipPath>`
    )
    parts.push(`<g clip-path="url(#${clipId})">${textElement}</g>`)

    parts.push(
      `<rect y="${(rowY + 1).toFixed(1)}" width="${Math.max(4, CELL_W).toFixed(1)}" height="${(CELL_H - 2).toFixed(1)}" fill="${cursorColor}" opacity="0">` +
        `<animate attributeName="x" from="${PAD}" to="${(PAD + ART_W).toFixed(1)}" begin="${delay.toFixed(3)}s" dur="${ROW_DUR.toFixed(2)}s" fill="freeze"/>` +
        `<set attributeName="opacity" to="0.85" begin="${delay.toFixed(3)}s"/>` +
        `<set attributeName="opacity" to="0" begin="${(delay + ROW_DUR).toFixed(3)}s"/>` +
        `</rect>`
    )
  }

  const statusLineY = TITLEBAR_H + ART_H + PAD * 0.35
  const statusY = statusLineY + 19
  parts.push(
    `<line x1="0" y1="${statusLineY.toFixed(1)}" x2="${IW}" y2="${statusLineY.toFixed(1)}" stroke="${frameColor}"/>`
  )
  parts.push(
    `<text x="${PAD}" y="${statusY.toFixed(1)}" fill="${titleColor}" font-size="13">` +
      `${escapeXml(username)}@github:~$ whoami <tspan fill="${inkColor}">${escapeXml(customWhoami)}</tspan></text>`
  )
  parts.push(
    `<rect x="${PAD + 227}" y="${(statusY - 12).toFixed(1)}" width="8" height="14" fill="${inkColor}">` +
      `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.51;1" dur="1s" repeatCount="indefinite"/>` +
      `</rect>`
  )

  parts.push(`</svg>`)
  return parts.join('\n')
}
