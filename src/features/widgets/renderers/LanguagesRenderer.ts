import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Rust: '#dea584',
  Python: '#3572A5',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Go: '#00ADD8',
  Java: '#b07219',
  Ruby: '#701516',
  'C++': '#f34b7d',
  'C#': '#239120',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
}

export function renderLanguages(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 800)
  const cfg = widget?.config || {}
  const textClr = (cfg.textColor as string) || globalStyles?.textColor || '#ffffff'
  const accent = (cfg.accentColor as string) || globalStyles?.accentColor || '#c5ff4a'

  const hideLangsArr: string[] = Array.isArray(cfg.hideLangsArr)
    ? (cfg.hideLangsArr as string[])
    : []
  const hideLangsStr =
    typeof cfg.hideLangs === 'string'
      ? (cfg.hideLangs as string)
          .split(',')
          .map((l) => l.trim().toLowerCase())
          .filter(Boolean)
      : []
  const hideLangs = [...hideLangsArr.map((l) => l.toLowerCase()), ...hideLangsStr]

  let filteredLangs = Object.entries(
    data?.languages && typeof data.languages === 'object' ? data.languages : {}
  )
  if (hideLangs.length > 0) {
    filteredLangs = filteredLangs.filter(([lang]) => !hideLangs.includes(lang.toLowerCase()))
  }

  const maxLangs = Number(cfg.langsCount) || 5
  const topLangs = filteredLangs.slice(0, maxLangs)
  const totalCount = topLangs.reduce((sum, [_, count]) => sum + (Number(count) || 0), 0) || 1
  const showPercentage = cfg.showPercentage !== false
  const langsLayout = (cfg.langsLayout as string) || 'bars'

  const getColor = (lang: string) => LANG_COLORS[lang] || accent

  let langsSvg = ''

  if (langsLayout === 'bars' || langsLayout === undefined) {
    let currentX = 24
    const barWidth = width - 48
    const barSvg = topLangs
      .map(([lang, count]) => {
        const w = ((Number(count) || 0) / totalCount) * barWidth
        const rect = `<rect x="${currentX}" y="52" width="${w}" height="8" fill="${getColor(lang)}" rx="2" />`
        currentX += w
        return rect
      })
      .join('')

    const legendSvg = topLangs
      .map(([lang, count], i) => {
        const pct = Math.round(((Number(count) || 0) / totalCount) * 100)
        return `
      <g transform="translate(${24 + (i % 2) * (barWidth / 2)}, ${80 + Math.floor(i / 2) * 24})">
        <circle cx="6" cy="-4" r="4" fill="${getColor(lang)}" />
        <text x="16" y="0" font-family="'Inter Tight', sans-serif" font-size="12" fill="${textClr}">${escapeXml(lang)} ${showPercentage ? `<tspan fill="#7a7a7a">${pct}%</tspan>` : ''}</text>
      </g>
    `
      })
      .join('')

    langsSvg = `${barSvg}${legendSvg}`
  } else if (langsLayout === 'list') {
    const barW = width - 48
    langsSvg = topLangs
      .map(([lang, count], i) => {
        const pct = Math.round(((Number(count) || 0) / totalCount) * 100)
        const fillW = ((Number(count) || 0) / totalCount) * (barW - 100)
        return `
      <g transform="translate(24, ${48 + i * 26})">
        <circle cx="6" cy="8" r="4" fill="${getColor(lang)}" />
        <text x="18" y="14" font-family="'Inter Tight', sans-serif" font-size="12" fill="${textClr}">${escapeXml(lang)}</text>
        ${showPercentage ? `<text x="${barW - 36}" y="14" text-anchor="end" font-family="'Inter Tight', sans-serif" font-size="11" fill="#7a7a7a">${pct}%</text>` : ''}
        <rect x="0" y="20" width="${barW - 36}" height="3" fill="#252525" rx="1" />
        <rect x="0" y="20" width="${fillW}" height="3" fill="${getColor(lang)}" rx="1" />
      </g>
    `
      })
      .join('')
  } else if (langsLayout === 'compact') {
    const denom = Math.max(1, Math.min(topLangs.length, 3))
    const itemW = (width - 48) / denom
    langsSvg = topLangs
      .map(([lang, count], i) => {
        const pct = Math.round(((Number(count) || 0) / totalCount) * 100)
        return `
      <g transform="translate(${24 + (i % 3) * itemW}, ${48 + Math.floor(i / 3) * 52})">
        <circle cx="6" cy="8" r="5" fill="${getColor(lang)}" />
        <text x="16" y="14" font-family="'Inter Tight', sans-serif" font-size="11" fill="${textClr}">${escapeXml(lang)}</text>
        ${showPercentage ? `<text x="16" y="30" font-family="'Inter Tight', sans-serif" font-size="10" fill="#7a7a7a">${pct}%</text>` : ''}
      </g>
    `
      })
      .join('')
  } else if (langsLayout === 'donut') {
    const donutLegendPos = (cfg.donutLegendPos as string) || 'bottom'
    const donutShowPct = cfg.donutShowPct !== false
    const donutCenterLabel = Boolean(cfg.donutCenterLabel)

    const donutR =
      donutLegendPos === 'side' ? Math.min(width / 4, 60) : Math.min((width - 48) / 2, 60)
    const donutRi = Math.round(donutR * 0.52)
    const donutCx = donutLegendPos === 'side' ? 24 + donutR + 4 : width / 2
    const donutCy = 44 + donutR

    let startAngle = -Math.PI / 2
    const arcsSvg = topLangs
      .map(([lang, count]) => {
        const fraction = count / totalCount
        const angle = fraction * 2 * Math.PI
        const endAngle = startAngle + angle
        const x1 = donutCx + donutR * Math.cos(startAngle)
        const y1 = donutCy + donutR * Math.sin(startAngle)
        const x2 = donutCx + donutR * Math.cos(endAngle)
        const y2 = donutCy + donutR * Math.sin(endAngle)
        const xi1 = donutCx + donutRi * Math.cos(startAngle)
        const yi1 = donutCy + donutRi * Math.sin(startAngle)
        const xi2 = donutCx + donutRi * Math.cos(endAngle)
        const yi2 = donutCy + donutRi * Math.sin(endAngle)
        const large = angle > Math.PI ? 1 : 0
        const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${donutR} ${donutR} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${xi2.toFixed(1)} ${yi2.toFixed(1)} A ${donutRi} ${donutRi} 0 ${large} 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z`
        startAngle = endAngle
        return `<path d="${path}" fill="${getColor(lang)}" />`
      })
      .join('')

    const centerSvg =
      donutCenterLabel && topLangs.length > 0
        ? `<text x="${donutCx}" y="${donutCy + 4}" text-anchor="middle" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="600" fill="${textClr}">${escapeXml(topLangs[0][0])}</text>`
        : ''

    let legendSvg = ''
    if (donutLegendPos === 'bottom') {
      const legendStartY = donutCy + donutR + 16
      const lW = width - 48
      legendSvg = topLangs
        .map(([lang, count], i) => {
          const pct = Math.round((count / totalCount) * 100)
          return `
          <g transform="translate(${24 + (i % 2) * (lW / 2)}, ${legendStartY + Math.floor(i / 2) * 22})">
            <circle cx="6" cy="-4" r="4" fill="${getColor(lang)}" />
            <text x="16" y="0" font-family="'Inter Tight', sans-serif" font-size="11" fill="${textClr}">${escapeXml(lang)}${donutShowPct ? ` <tspan fill="#7a7a7a">${pct}%</tspan>` : ''}</text>
          </g>`
        })
        .join('')
    } else if (donutLegendPos === 'side') {
      const legendX = donutCx + donutR + 16
      legendSvg = topLangs
        .slice(0, 6)
        .map(([lang, count], i) => {
          const pct = Math.round((count / totalCount) * 100)
          return `
          <g transform="translate(${legendX}, ${donutCy - donutR + i * 22})">
            <circle cx="6" cy="-4" r="4" fill="${getColor(lang)}" />
            <text x="16" y="0" font-family="'Inter Tight', sans-serif" font-size="10" fill="${textClr}">${escapeXml(lang.length > 10 ? lang.slice(0, 9) + '…' : lang)}${donutShowPct ? ` <tspan fill="#7a7a7a">${pct}%</tspan>` : ''}</text>
          </g>`
        })
        .join('')
    }

    langsSvg = `${arcsSvg}${centerSvg}${legendSvg}`
  }

  return `
    <text x="24" y="32" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ TOP LANGUAGES ]</text>
    ${langsSvg}
  `
}
