import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import {
  calculateDerivedInsights,
  calculateTemporalHabits,
} from '@/features/github/utils/insightsCalculator'

function escapeXml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function truncate(str: string, max: number): string {
  const s = String(str ?? '')
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function vLen(str: string): number {
  return str.replace(/<[^>]+>/g, '').length
}

export function renderPremiumAsciiInsights(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const width = Math.max(280, Number(widget?.size?.width) || 400)
  const height = Math.max(140, Number(widget?.size?.height) || 280)
  const cfg = widget?.config || {}

  const habits = data?.habits || calculateTemporalHabits(data?.contributions?.weeks || [])
  const rawInsights =
    data?.derivedInsights ||
    calculateDerivedInsights(
      data?.user,
      data?.repos || [],
      data?.languages || {},
      habits,
      data?.totalStars || 0
    )

  const showKeyInsights = cfg.showKeyInsights !== false
  const showTemporalProductivity = cfg.showTemporalProductivity !== false
  const showPeakCadence = cfg.showPeakCadence !== false

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
  const LINE_H = 17

  function buildCardLines(p: number): string[] {
    const lines: string[] = []

    const title = 'INSIGHTS & HABITS'
    const padTitle = Math.max(0, Math.floor((INNER_W - title.length) / 2))
    lines.push(
      ` ${' '.repeat(padTitle)}<tspan fill="${accentLime}" font-weight="bold">${title}</tspan>`
    )
    lines.push(` <tspan fill="${borderColor}">${'─'.repeat(INNER_W)}</tspan>`)

    if (showKeyInsights) {
      lines.push(` <tspan fill="${accentCyan}" font-weight="bold">KEY INSIGHTS</tspan>`)
      const maxInsightLen = INNER_W - 4
      rawInsights.slice(0, 3).forEach((insight) => {
        const icon = insight.icon || '▸'
        lines.push(
          ` <tspan fill="${accentYellow}">${icon}</tspan> <tspan fill="${textChalk}" font-weight="bold">${escapeXml(
            truncate(insight.title, maxInsightLen)
          )}</tspan>`
        )
        if (insight.subtitle) {
          lines.push(
            `   <tspan fill="${textAsh}">${escapeXml(truncate(insight.subtitle, maxInsightLen))}</tspan>`
          )
        }
      })
    }

    if (showTemporalProductivity || showPeakCadence) {
      if (showKeyInsights) {
        lines.push(` <tspan fill="${borderColor}">${'─'.repeat(INNER_W)}</tspan>`)
      }
      lines.push(` <tspan fill="${accentCyan}" font-weight="bold">TEMPORAL PRODUCTIVITY</tspan>`)

      const curMorn = Math.round(habits.morningPercent * p)
      const curAft = Math.round(habits.afternoonPercent * p)
      const curEve = Math.round(habits.eveningPercent * p)
      const curNight = Math.round(habits.nightPercent * p)

      if (showTemporalProductivity) {
        lines.push(
          ` <tspan fill="${textAsh}">Morning:   </tspan><tspan fill="${accentLime}">${curMorn}%</tspan>    <tspan fill="${textAsh}">Afternoon: </tspan><tspan fill="${accentLime}">${curAft}%</tspan>`
        )
        lines.push(
          ` <tspan fill="${textAsh}">Evening:   </tspan><tspan fill="${accentLime}">${curEve}%</tspan>    <tspan fill="${textAsh}">Late Night:</tspan><tspan fill="${accentLime}">${curNight}%</tspan>`
        )
      }

      if (showPeakCadence) {
        lines.push(
          ` <tspan fill="${textAsh}">Peak Day:  </tspan><tspan fill="${accentYellow}">${escapeXml(
            truncate(habits.peakDayOfWeek, 10)
          )}</tspan>  <tspan fill="${textAsh}">Month:     </tspan><tspan fill="${accentYellow}">${escapeXml(
            truncate(habits.peakMonth, 10)
          )}</tspan>`
        )
      }
    }

    return lines
  }

  const finalLines = buildCardLines(1)
  const totalContentHeight = (finalLines.length + 2) * LINE_H
  const BASE_HEIGHT = Math.max(280, totalContentHeight + 24)
  const startY = Math.max(16, Math.round((BASE_HEIGHT - totalContentHeight) / 2) + 12)
  const bottomY = startY + (finalLines.length + 1) * LINE_H

  const actualContentWidth = (INNER_W + 4) * CHAR_W
  const padX = Math.max(8, Math.round((BASE_WIDTH - actualContentWidth) / 2))

  const rawId = widget?.instanceId || 'premium-ascii-insights'
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
