import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { calculateCodingVelocity } from '@/features/github/utils/scoreCalculator'

function escapeXml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function vLen(str: string): number {
  let len = 0
  let inTag = false
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    if (char === '<') {
      inTag = true
    } else if (char === '>') {
      inTag = false
    } else if (!inTag) {
      len++
    }
  }
  return len
}

function vPad(str: string, targetWidth: number): string {
  const len = vLen(str)
  return str + ' '.repeat(Math.max(0, targetWidth - len))
}

function renderBlockBar(
  val: number,
  max: number,
  width = 16,
  filledColor = '#3fb950',
  emptyColor = '#21262d'
): string {
  const safeMax = Math.max(1, max)
  const pct = Math.max(0, Math.min(100, (val / safeMax) * 100))
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled
  return `<tspan fill="${filledColor}">${'█'.repeat(filled)}</tspan><tspan fill="${emptyColor}">${' '.repeat(empty)}</tspan>`
}

export function renderPremiumAsciiCodingVelocity(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const width = Math.max(280, Number(widget?.size?.width) || 390)
  const height = Math.max(180, Number(widget?.size?.height) || 260)
  const cfg = widget?.config || {}

  const velocity =
    data?.codingVelocity ||
    calculateCodingVelocity(
      data?.activityMetrics,
      data?.contributions?.totalContributions || 0,
      data?.contributions?.weeks || []
    )

  // Matching card color palette
  const isDark = globalStyles?.themeMode !== 'light'
  const bg =
    (cfg.backgroundColor as string) ||
    globalStyles?.backgroundColor ||
    (isDark ? '#0d1117' : '#f6f8fa')
  const borderColor = (cfg.borderColor as string) || (isDark ? '#30363d' : '#d0d7de')
  const textChalk = isDark ? '#c9d1d9' : '#24292f'
  const textAsh = isDark ? '#8b949e' : '#57606a'
  const accentLime = (cfg.accentColor as string) || globalStyles?.accentColor || '#3fb950'
  const accentCyan = '#39c5cf'
  const accentYellow = '#ffbd2e'

  // Calculate inner width based on widget width
  const FONT_SIZE = 12
  const CHAR_W = 7.2
  const maxChars = Math.floor((width - 32) / CHAR_W)
  const INNER_W = Math.max(38, Math.min(60, maxChars - 2))
  const BAR_W = INNER_W >= 50 ? 20 : 16
  const LINE_H = 17

  function buildCardLines(p: number): string[] {
    const lines: string[] = []

    // Header
    const title = 'CODING VELOCITY'
    const padTitle = Math.max(0, Math.floor((INNER_W - title.length) / 2))
    lines.push(
      ` ${' '.repeat(padTitle)}<tspan fill="${accentLime}" font-weight="bold">${title}</tspan>`
    )
    lines.push(` <tspan fill="${borderColor}">${'─'.repeat(INNER_W)}</tspan>`)

    // Metrics
    const labelW = INNER_W >= 50 ? 18 : 16
    velocity.metrics.forEach((m) => {
      const curVal = Math.round(m.value * p)
      const label = vPad(m.label, labelW)
      const bar = renderBlockBar(curVal, m.max, BAR_W, accentLime, isDark ? '#21262d' : '#d0d7de')
      const valStr = `${String(curVal).padStart(4)}`
      lines.push(
        ` <tspan fill="${textChalk}">${escapeXml(label)}</tspan>${bar} <tspan fill="${accentCyan}" font-weight="bold">${valStr}</tspan>`
      )
    })

    // Divider
    lines.push(` <tspan fill="${borderColor}">${'─'.repeat(INNER_W)}</tspan>`)

    // Summary Average
    const curAvg = +(velocity.avgCommitsPerDay * p).toFixed(1)
    lines.push(
      ` <tspan fill="${textAsh}">Avg. commits/day:</tspan> <tspan fill="${accentYellow}" font-weight="bold">${curAvg}</tspan>`
    )

    return lines
  }

  const finalLines = buildCardLines(1)
  const bottomY = 24 + (finalLines.length + 1) * LINE_H

  const isAnimated = Boolean(cfg.animated) && !forceStatic
  let framesCss = ''
  let framesXml = ''

  if (!isAnimated) {
    const rowsXml: string[] = []
    rowsXml.push(`<text x="16" y="24" fill="${borderColor}">┌${'─'.repeat(INNER_W + 2)}┐</text>`)
    finalLines.forEach((line, idx) => {
      const y = 24 + (idx + 1) * LINE_H
      const visualLen = vLen(line)
      const paddingRight = ' '.repeat(Math.max(0, INNER_W + 1 - visualLen))
      rowsXml.push(
        `<text x="16" y="${y}"><tspan fill="${borderColor}">│</tspan> ${line}${paddingRight}<tspan fill="${borderColor}">│</tspan></text>`
      )
    })
    rowsXml.push(
      `<text x="16" y="${bottomY}" fill="${borderColor}">└${'─'.repeat(INNER_W + 2)}┘</text>`
    )
    framesXml = `<g>${rowsXml.join('\n    ')}</g>`
  } else {
    const FRAMES = 16
    const DUR = 1.6

    for (let f = 0; f < FRAMES; f++) {
      const p = f === FRAMES - 1 ? 1 : f / (FRAMES - 1)
      const currentLines = buildCardLines(p)
      const rowsXml: string[] = []

      rowsXml.push(`<text x="16" y="24" fill="${borderColor}">┌${'─'.repeat(INNER_W + 2)}┐</text>`)
      currentLines.forEach((line, idx) => {
        const y = 24 + (idx + 1) * LINE_H
        const visualLen = vLen(line)
        const paddingRight = ' '.repeat(Math.max(0, INNER_W + 1 - visualLen))
        rowsXml.push(
          `<text x="16" y="${y}"><tspan fill="${borderColor}">│</tspan> ${line}${paddingRight}<tspan fill="${borderColor}">│</tspan></text>`
        )
      })
      rowsXml.push(
        `<text x="16" y="${bottomY}" fill="${borderColor}">└${'─'.repeat(INNER_W + 2)}┘</text>`
      )

      if (f === FRAMES - 1) {
        const startPct = ((f / FRAMES) * 100).toFixed(1)
        framesCss += `
    .frame-${f} { opacity: 0; animation: show-${f} ${DUR}s forwards; }
    @keyframes show-${f} { 0%, ${Number(startPct) - 0.01}% { opacity: 0; } ${startPct}%, 100% { opacity: 1; } }`
      } else {
        const startPct = ((f / FRAMES) * 100).toFixed(1)
        const endPct = (((f + 1) / FRAMES) * 100).toFixed(1)
        if (f === 0) {
          framesCss += `
    .frame-${f} { animation: show-${f} ${DUR}s forwards; }
    @keyframes show-${f} { 0%, ${Number(endPct) - 0.01}% { opacity: 1; } ${endPct}%, 100% { opacity: 0; } }`
        } else {
          framesCss += `
    .frame-${f} { opacity: 0; animation: show-${f} ${DUR}s forwards; }
    @keyframes show-${f} { 0%, ${Number(startPct) - 0.01}% { opacity: 0; } ${startPct}%, ${Number(endPct) - 0.01}% { opacity: 1; } ${endPct}%, 100% { opacity: 0; } }`
        }
      }

      framesXml += `  <g class="frame-${f}">\n    ${rowsXml.join('\n    ')}\n  </g>\n`
    }
  }

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${bottomY + 20}"
  fill="none"
>
  <style>
    text {
      font-family: 'JetBrains Mono', 'Courier New', Consolas, monospace;
      font-size: ${FONT_SIZE}px;
      fill: ${textChalk};
      white-space: pre;
    }
    ${framesCss}
  </style>
  <rect width="100%" height="100%" fill="${bg}" rx="6"/>
  ${framesXml}
</svg>`
}
