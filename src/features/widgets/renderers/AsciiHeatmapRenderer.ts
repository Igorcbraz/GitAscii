import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatDateString(dateStr: string): string {
  if (!dateStr || dateStr === 'N/A') return 'N/A'
  try {
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function levelFor(count: number): number {
  if (count === 0) return 0
  if (count <= 5) return 1
  if (count <= 15) return 2
  if (count <= 30) return 3
  if (count <= 50) return 4
  return 5
}

interface StreakStats {
  total: number
  currentStreak: number
  longestStreak: number
  bestDay: { date: string; count: number }
  range: { start: string; end: string }
}

function calculateStreaks(weeks: any[]): StreakStats {
  const safeWeeks = Array.isArray(weeks) ? weeks : []
  const days = safeWeeks
    .flatMap((w) => (w && Array.isArray(w.contributionDays) ? w.contributionDays : []))
    .map((d) => ({
      date: typeof d?.date === 'string' ? d.date : '',
      count: Number(d?.contributionCount) || 0,
    }))
    .filter((d) => Boolean(d.date))
    .sort((a, b) => a.date.localeCompare(b.date))

  let totalContributions = 0
  let currentStreak = 0
  let longestStreak = 0
  let bestDay = { date: 'N/A', count: 0 }

  let tempStreak = 0

  for (const d of days) {
    totalContributions += d.count

    if (d.count > bestDay.count) {
      bestDay = { date: formatDateString(d.date), count: d.count }
    }

    if (d.count > 0) {
      tempStreak++
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 0
    }
  }

  let cs = 0
  const reversedDays = [...days].reverse()
  let foundStart = false
  for (let i = 0; i < reversedDays.length; i++) {
    const d = reversedDays[i]
    if (i <= 1 && d.count === 0 && !foundStart) {
      continue
    }
    if (d.count > 0) {
      foundStart = true
      cs++
    } else {
      if (foundStart) break
    }
  }
  currentStreak = cs

  if (days.length === 0) {
    return {
      total: 0,
      currentStreak: 0,
      longestStreak: 0,
      bestDay: { date: 'N/A', count: 0 },
      range: { start: 'N/A', end: 'N/A' },
    }
  }

  return {
    total: totalContributions,
    currentStreak,
    longestStreak,
    bestDay,
    range: {
      start: formatDateString(days[0].date),
      end: formatDateString(days[days.length - 1].date),
    },
  }
}

export function renderAsciiHeatmap(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  isStaticOverride?: boolean
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 800)
  const height = Math.max(100, Number(widget?.size?.height) || 280)
  const cfg = widget?.config || {}

  const username = data?.user?.login || 'user'

  const weeks = Array.isArray(data?.contributions?.weeks) ? data.contributions.weeks : []

  const stats = calculateStreaks(weeks)

  const PAD = 22
  const LEFT_LABEL_W = 30
  const TOP_LABEL_H = 20
  const TITLEBAR_H = 30

  const availableGridWidth = Math.max(100, width - PAD * 2 - LEFT_LABEL_W)
  const numWeeks = Math.max(weeks.length, 53)

  const CELL = availableGridWidth / (1.25 * (numWeeks - 1) + 1)
  const GAP = CELL * 0.25
  const STEP = CELL + GAP

  const PALETTE = (cfg.palette as string[]) || [
    '#161b22',
    '#0e4429',
    '#006d32',
    '#26a641',
    '#39d353',
    '#69f0a0',
  ]
  const bg1 = '#0d1420'
  const bg2 = (cfg.backgroundColor as string) || globalStyles?.backgroundColor || '#0a0e14'
  const frameColor = (cfg.borderColor as string) || globalStyles?.borderColor || '#1f6feb'
  const mutedColor = '#7d8590'
  const accentColor = (cfg.accentColor as string) || globalStyles?.accentColor || '#22d3ee'
  const greenColor = '#39d353'
  const goldColor = '#f2cc60'

  const COL_T = 0.018
  const ROW_T = 0.045
  const CELL_DUR = 0.42
  const isStatic = isStaticOverride !== undefined ? isStaticOverride : Boolean(cfg.staticMode)

  const grid: Array<Array<{ date: string; count: number; level: number } | null>> = weeks.map(
    (week) => {
      const col: Array<{ date: string; count: number; level: number } | null> = new Array(7).fill(
        null
      )
      const daysList = Array.isArray(week?.contributionDays) ? week.contributionDays : []
      daysList.forEach((day: any) => {
        if (!day?.date) return
        const date = new Date(day.date + 'T00:00:00')
        const weekday = isNaN(date.getTime()) ? 0 : date.getDay()
        col[weekday] = {
          date: day.date,
          count: Number(day.contributionCount) || 0,
          level: levelFor(Number(day.contributionCount) || 0),
        }
      })
      return col
    }
  )

  const monthLabels: Array<{ ci: number; label: string }> = []
  const seenMonths = new Set<string>()
  grid.forEach((column, ci) => {
    for (const cell of column) {
      if (!cell) continue
      const date = new Date(cell.date + 'T00:00:00')
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      if (!seenMonths.has(key) && date.getDate() <= 7) {
        seenMonths.add(key)
        const label = date.toLocaleString('en-US', { month: 'short' })
        monthLabels.push({ ci, label })
      }
      break
    }
  })

  const artH = 7 * STEP

  const gridTop = TITLEBAR_H + TOP_LABEL_H
  const gridLeft = PAD + LEFT_LABEL_W

  const css = isStatic
    ? ''
    : `@keyframes cell-${widget.instanceId} {` +
      `  0%   { opacity: 0; transform: translateY(-6px); }` +
      `  100% { opacity: 1; transform: translateY(0); }` +
      `}` +
      `.c-${widget.instanceId} { opacity: 0; animation: cell-${widget.instanceId} ${CELL_DUR.toFixed(2)}s cubic-bezier(.2,.8,.2,1) both; }`

  const parts: string[] = []

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">`
  )
  if (css) {
    parts.push(`<style>${css}</style>`)
  }
  parts.push(
    `<defs>` +
      `<linearGradient id="heatmap-bg-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>` +
      `</linearGradient>` +
      `</defs>`
  )

  parts.push(
    `<rect width="${width}" height="${height}" rx="${globalStyles.borderRadius || 12}" fill="url(#heatmap-bg-${widget.instanceId})"/>`
  )
  parts.push(
    `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${globalStyles.borderRadius || 12}" ` +
      `fill="none" stroke="${frameColor}" stroke-width="1" stroke-opacity="0.55"/>`
  )
  parts.push(
    `<line x1="0" y1="${TITLEBAR_H}" x2="${width}" y2="${TITLEBAR_H}" stroke="${frameColor}" stroke-opacity="0.35"/>`
  )

  const dotcols = ['#ff5f56', '#ffbd2e', '#27c93f']
  for (let i = 0; i < 3; i++) {
    parts.push(`<circle cx="${PAD + i * 16}" cy="${TITLEBAR_H / 2}" r="5" fill="${dotcols[i]}"/>`)
  }
  parts.push(
    `<text x="${width / 2}" y="${TITLEBAR_H / 2 + 4}" fill="${mutedColor}" font-size="12" ` +
      `text-anchor="middle">${escapeXml(username)}@github: ~/contributions --graph</text>`
  )

  monthLabels.forEach(({ ci, label }) => {
    const x = gridLeft + ci * STEP
    parts.push(
      `<text x="${x}" y="${TITLEBAR_H + 14}" fill="${mutedColor}" font-size="10">${label}</text>`
    )
  })

  const weekdays = [
    { wi: 1, name: 'Mon' },
    { wi: 3, name: 'Wed' },
    { wi: 5, name: 'Fri' },
  ]
  weekdays.forEach(({ wi, name }) => {
    const y = gridTop + wi * STEP + CELL * 0.78
    parts.push(
      `<text x="${PAD}" y="${y.toFixed(1)}" fill="${mutedColor}" font-size="9">${name}</text>`
    )
  })

  grid.forEach((column, ci) => {
    const gx = gridLeft + ci * STEP
    column.forEach((cell, ri) => {
      if (!cell) return
      const { date, count, level } = cell
      const gy = gridTop + ri * STEP
      const delay = ci * COL_T + ri * ROW_T
      const plural = count !== 1 ? 's' : ''
      const styleAttr = isStatic
        ? ''
        : ` class="c-${widget.instanceId}" style="animation-delay:${delay.toFixed(3)}s"`

      parts.push(
        `<rect${styleAttr} x="${gx}" y="${gy}" width="${CELL}" height="${CELL}" rx="2.5" ` +
          `fill="${PALETTE[level] || PALETTE[0]}">` +
          `<title>${date}: ${count} contribution${plural}</title></rect>`
      )
    })
  })

  const legY = gridTop + artH + 6
  const rightBound = width - PAD
  const moreTextWidth = 28
  const textGap = 6
  const legendBlocksWidth = PALETTE.length * STEP - GAP
  const lx_start = rightBound - moreTextWidth - textGap - legendBlocksWidth

  parts.push(
    `<text x="${lx_start - textGap}" y="${(legY + CELL * 0.8).toFixed(1)}" fill="${mutedColor}" font-size="10" text-anchor="end">Less</text>`
  )

  let lx = lx_start
  PALETTE.forEach((color) => {
    parts.push(
      `<rect x="${lx}" y="${legY}" width="${CELL}" height="${CELL}" rx="2.2" fill="${color}"/>`
    )
    lx += STEP
  })

  parts.push(
    `<text x="${rightBound}" y="${(legY + CELL * 0.8).toFixed(1)}" fill="${mutedColor}" font-size="10" text-anchor="end">More</text>`
  )

  const sepY = legY + CELL + 14
  parts.push(
    `<line x1="0" y1="${sepY}" x2="${width}" y2="${sepY}" stroke="${frameColor}" stroke-opacity="0.25"/>`
  )

  const ly = sepY + 24
  parts.push(
    `<text x="${PAD}" y="${ly}" font-size="13" fill="${greenColor}">` +
      `<tspan font-weight="700">${stats.total.toLocaleString()}</tspan>` +
      `<tspan fill="${mutedColor}"> contributions in the last year</tspan></text>`
  )
  parts.push(
    `<text x="${width - PAD}" y="${ly}" font-size="12" fill="${mutedColor}" text-anchor="end">${stats.range.start} &#8594; ${stats.range.end}</text>`
  )

  const ly2 = ly + 24
  parts.push(
    `<text x="${PAD}" y="${ly2}" font-size="13" fill="${mutedColor}">current streak ` +
      `<tspan fill="${accentColor}" font-weight="700">${stats.currentStreak} days</tspan>` +
      `<tspan fill="${mutedColor}">   &#183;   longest </tspan>` +
      `<tspan fill="${accentColor}" font-weight="700">${stats.longestStreak} days</tspan></text>`
  )
  parts.push(
    `<text x="${width - PAD}" y="${ly2}" font-size="12" fill="${mutedColor}" text-anchor="end">` +
      `best day <tspan fill="${goldColor}" font-weight="700">${stats.bestDay.count}</tspan> on ${stats.bestDay.date}</text>`
  )

  parts.push(`</svg>`)
  return parts.join('\n')
}
