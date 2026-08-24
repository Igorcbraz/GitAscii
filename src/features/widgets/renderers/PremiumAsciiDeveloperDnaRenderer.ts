import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { calculateDeveloperDNA } from '@/features/github/utils/scoreCalculator'

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
  pct: number,
  width = 16,
  filledColor = '#3fb950',
  emptyColor = '#21262d'
): string {
  const clamped = Math.max(0, Math.min(100, pct))
  const filled = Math.round((clamped / 100) * width)
  const empty = width - filled
  return `<tspan fill="${filledColor}">${'█'.repeat(filled)}</tspan><tspan fill="${emptyColor}">${' '.repeat(empty)}</tspan>`
}

export function renderPremiumAsciiDeveloperDna(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const width = Math.max(280, Number(widget?.size?.width) || 400)
  const height = Math.max(130, Number(widget?.size?.height) || 230)
  const cfg = widget?.config || {}

  const dna =
    data?.developerDna ||
    calculateDeveloperDNA(
      data?.user,
      data?.repos || [],
      data?.contributions?.totalContributions || 0,
      data?.totalStars || 0,
      data?.languages || {}
    )

  const hideTraits = Array.isArray(cfg.hideTraits) ? (cfg.hideTraits as string[]) : []
  const showArchetype = cfg.showArchetype !== false

  const isDark = globalStyles?.themeMode !== 'light'
  const bg =
    (cfg.backgroundColor as string) ||
    globalStyles?.backgroundColor ||
    (isDark ? '#0d1117' : '#f6f8fa')
  const borderColor = (cfg.borderColor as string) || (isDark ? '#30363d' : '#d0d7de')
  const textChalk =
    (cfg.textColor as string) || globalStyles?.textColor || (isDark ? '#c9d1d9' : '#24292f')
  const textAsh = isDark ? '#8b949e' : '#57606a'
  const accentLime = (cfg.accentColor as string) || globalStyles?.accentColor || '#3fb950'
  const accentCyan = (cfg.secondaryColor as string) || '#39c5cf'
  const accentYellow = '#ffbd2e'

  const isTransparent =
    !cfg.backgroundColor ||
    cfg.backgroundColor === 'transparent' ||
    cfg.backgroundColor === 'none' ||
    Boolean(cfg.transparentBackground) ||
    bg === 'transparent' ||
    bg === 'none'

  const BASE_WIDTH = 400
  const FONT_SIZE = 12
  const CHAR_W = 7.2
  const INNER_W = 46
  const BAR_W = 16
  const LINE_H = 17

  function buildCardLines(p: number): string[] {
    const lines: string[] = []

    const title = 'DNA'
    const padTitle = Math.max(0, Math.floor((INNER_W - title.length) / 2))
    lines.push(
      ` ${' '.repeat(padTitle)}<tspan fill="${accentLime}" font-weight="bold">${title}</tspan>`
    )
    lines.push(` <tspan fill="${borderColor}">${'─'.repeat(INNER_W)}</tspan>`)

    const labelW = 12
    const visibleTraits = dna.traits.filter((t) => !hideTraits.includes(t.name.toLowerCase()))

    if (visibleTraits.length > 0) {
      visibleTraits.forEach((t) => {
        const curPct = Math.round(t.percentage * p)
        const label = vPad(t.name, labelW)
        const bar = renderBlockBar(curPct, BAR_W, accentLime, isDark ? '#21262d' : '#d0d7de')
        const pctStr = `${String(curPct).padStart(3)}%`
        lines.push(
          ` <tspan fill="${textChalk}">${escapeXml(label)}</tspan>${bar} <tspan fill="${accentCyan}" font-weight="bold">${pctStr}</tspan>`
        )
      })
    } else {
      lines.push(` <tspan fill="${textAsh}">No traits selected</tspan>`)
    }

    if (showArchetype) {
      lines.push(` <tspan fill="${borderColor}">${'─'.repeat(INNER_W)}</tspan>`)
      lines.push(` <tspan fill="${accentYellow}" font-weight="bold">PRIMARY ARCHETYPE</tspan>`)
      lines.push(
        ` <tspan fill="${accentLime}" font-weight="bold">${escapeXml(dna.primaryArchetype)}</tspan>`
      )
    }

    return lines
  }

  const finalLines = buildCardLines(1)
  const totalContentHeight = (finalLines.length + 2) * LINE_H
  const BASE_HEIGHT = Math.max(230, totalContentHeight + 24)
  const startY = Math.max(16, Math.round((BASE_HEIGHT - totalContentHeight) / 2) + 12)
  const bottomY = startY + (finalLines.length + 1) * LINE_H

  const actualContentWidth = (INNER_W + 4) * CHAR_W
  const padX = Math.max(8, Math.round((BASE_WIDTH - actualContentWidth) / 2))

  const rawId = widget?.instanceId || 'premium-ascii-dna'
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '_')

  const isAnimated = cfg.animated !== false && !forceStatic
  let framesCss = `
    #${id} text {
      font-family: 'JetBrains Mono', 'Courier New', Consolas, monospace;
      font-size: ${FONT_SIZE}px;
      fill: ${textChalk};
      white-space: pre;
    }
  `
  let framesXml = ''

  if (!isAnimated) {
    const rowsXml: string[] = []
    rowsXml.push(
      `<text x="${padX}" y="${startY}"><tspan fill="${borderColor}">┌${'─'.repeat(INNER_W + 2)}┐</tspan></text>`
    )
    finalLines.forEach((line, idx) => {
      const y = startY + (idx + 1) * LINE_H
      const visualLen = vLen(line)
      const paddingRight = ' '.repeat(Math.max(0, INNER_W + 1 - visualLen))
      rowsXml.push(
        `<text x="${padX}" y="${y}"><tspan fill="${borderColor}">│</tspan> ${line}${paddingRight}<tspan fill="${borderColor}">│</tspan></text>`
      )
    })
    rowsXml.push(
      `<text x="${padX}" y="${bottomY}"><tspan fill="${borderColor}">└${'─'.repeat(INNER_W + 2)}┘</tspan></text>`
    )
    framesXml = `<g>${rowsXml.join('\n    ')}</g>`
  } else {
    const FRAMES = 16
    const DUR = 1.6

    for (let f = 0; f < FRAMES; f++) {
      const p = f === FRAMES - 1 ? 1 : f / (FRAMES - 1)
      const currentLines = buildCardLines(p)
      const rowsXml: string[] = []

      rowsXml.push(
        `<text x="${padX}" y="${startY}"><tspan fill="${borderColor}">┌${'─'.repeat(INNER_W + 2)}┐</tspan></text>`
      )
      currentLines.forEach((line, idx) => {
        const y = startY + (idx + 1) * LINE_H
        const visualLen = vLen(line)
        const paddingRight = ' '.repeat(Math.max(0, INNER_W + 1 - visualLen))
        rowsXml.push(
          `<text x="${padX}" y="${y}"><tspan fill="${borderColor}">│</tspan> ${line}${paddingRight}<tspan fill="${borderColor}">│</tspan></text>`
        )
      })
      rowsXml.push(
        `<text x="${padX}" y="${bottomY}"><tspan fill="${borderColor}">└${'─'.repeat(INNER_W + 2)}┘</tspan></text>`
      )

      if (f === FRAMES - 1) {
        const startPct = ((f / FRAMES) * 100).toFixed(1)
        framesCss += `
    #${id} .frame-${f} { opacity: 0; animation: show-${id}-${f} ${DUR}s forwards; }
    @keyframes show-${id}-${f} { 0%, ${Number(startPct) - 0.01}% { opacity: 0; } ${startPct}%, 100% { opacity: 1; } }`
      } else {
        const startPct = ((f / FRAMES) * 100).toFixed(1)
        const endPct = (((f + 1) / FRAMES) * 100).toFixed(1)
        if (f === 0) {
          framesCss += `
    #${id} .frame-${f} { animation: show-${id}-${f} ${DUR}s forwards; }
    @keyframes show-${id}-${f} { 0%, ${Number(endPct) - 0.01}% { opacity: 1; } ${endPct}%, 100% { opacity: 0; } }`
        } else {
          framesCss += `
    #${id} .frame-${f} { opacity: 0; animation: show-${id}-${f} ${DUR}s forwards; }
    @keyframes show-${id}-${f} { 0%, ${Number(startPct) - 0.01}% { opacity: 0; } ${startPct}%, ${Number(endPct) - 0.01}% { opacity: 1; } ${endPct}%, 100% { opacity: 0; } }`
        }
      }

      framesXml += `  <g class="frame-${f}">\n    ${rowsXml.join('\n    ')}\n  </g>\n`
    }
  }

  const bgRect = isTransparent ? '' : `<rect width="100%" height="100%" fill="${bg}" rx="6"/>`

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  id="${id}"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}"
  preserveAspectRatio="xMidYMid meet"
  fill="none"
>
  <style>
    ${framesCss}
  </style>
  ${bgRect}
  ${framesXml}
</svg>`
}
