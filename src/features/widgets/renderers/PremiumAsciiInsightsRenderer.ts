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
  const width = Math.max(280, Number(widget?.size?.width) || 390)
  const height = Math.max(200, Number(widget?.size?.height) || 380)
  const cfg = widget?.config || {}

  const habits = data?.habits || calculateTemporalHabits(data?.contributions?.weeks || [])
  const insights =
    data?.derivedInsights ||
    calculateDerivedInsights(
      data?.user,
      data?.repos || [],
      data?.languages || {},
      habits,
      data?.totalStars || 0
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
  const LINE_H = 17

  function buildCardLines(p: number): string[] {
    const lines: string[] = []

    // Header
    const title = 'INSIGHTS & HABITS 🧠'
    const padTitle = Math.max(0, Math.floor((INNER_W - title.length) / 2))
    lines.push(
      ` ${' '.repeat(padTitle)}<tspan fill="${accentLime}" font-weight="bold">${title}</tspan>`
    )
    lines.push(` <tspan fill="${borderColor}">${'─'.repeat(INNER_W)}</tspan>`)

    // Insights List
    lines.push(` <tspan fill="${accentCyan}" font-weight="bold">KEY INSIGHTS</tspan>`)
    const maxInsightLen = INNER_W - 4
    insights.slice(0, 3).forEach((insight) => {
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

    // Divider
    lines.push(` <tspan fill="${borderColor}">${'─'.repeat(INNER_W)}</tspan>`)

    // Activity Schedule & Habits with interpolated percentages
    lines.push(` <tspan fill="${accentCyan}" font-weight="bold">TEMPORAL PRODUCTIVITY</tspan>`)

    const curMorn = Math.round(habits.morningPercent * p)
    const curAft = Math.round(habits.afternoonPercent * p)
    const curEve = Math.round(habits.eveningPercent * p)
    const curNight = Math.round(habits.nightPercent * p)

    if (INNER_W >= 46) {
      lines.push(
        ` <tspan fill="${textAsh}">Morning:   </tspan><tspan fill="${accentLime}">${curMorn}%</tspan>    <tspan fill="${textAsh}">Afternoon: </tspan><tspan fill="${accentLime}">${curAft}%</tspan>`
      )
      lines.push(
        ` <tspan fill="${textAsh}">Evening:   </tspan><tspan fill="${accentLime}">${curEve}%</tspan>    <tspan fill="${textAsh}">Late Night:</tspan><tspan fill="${accentLime}">${curNight}%</tspan>`
      )
      lines.push(
        ` <tspan fill="${textAsh}">Peak Day:  </tspan><tspan fill="${accentYellow}">${escapeXml(
          truncate(habits.peakDayOfWeek, 10)
        )}</tspan>  <tspan fill="${textAsh}">Month:</tspan><tspan fill="${accentYellow}">${escapeXml(
          truncate(habits.peakMonth, 10)
        )}</tspan>`
      )
    } else {
      lines.push(
        ` <tspan fill="${textAsh}">Morn:</tspan><tspan fill="${accentLime}">${curMorn}%</tspan> <tspan fill="${textAsh}">Aft:</tspan><tspan fill="${accentLime}">${curAft}%</tspan> <tspan fill="${textAsh}">Eve:</tspan><tspan fill="${accentLime}">${curEve}%</tspan> <tspan fill="${textAsh}">Night:</tspan><tspan fill="${accentLime}">${curNight}%</tspan>`
      )
      lines.push(
        ` <tspan fill="${textAsh}">Peak:</tspan> <tspan fill="${accentYellow}">${escapeXml(
          habits.peakDayOfWeek
        )}</tspan> / <tspan fill="${accentYellow}">${escapeXml(habits.peakMonth)}</tspan>`
      )
    }

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
