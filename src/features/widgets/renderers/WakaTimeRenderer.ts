import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderWakaTime(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config
  const hiddenWakatimeLangs = Array.isArray(cfg.hiddenWakatimeLangs)
    ? (cfg.hiddenWakatimeLangs as string[])
    : []

  const bg1 = '#0b0f14'
  const bg2 = '#151c25'
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#b6a891'
  const text_color = (cfg.textColor as string) || globalStyles.textColor || '#eceff4'
  const border_color = '#2b303a'
  const font = 'Segoe UI, Inter, sans-serif'
  const mono = 'Consolas, monospace'

  let filteredLangs = Object.entries(data.languages || {})
  if (hiddenWakatimeLangs.length > 0) {
    const lowerHidden = hiddenWakatimeLangs.map((l) => l.toLowerCase())
    filteredLangs = filteredLangs.filter(([lang]) => !lowerHidden.includes(lang.toLowerCase()))
  }

  const totalBytes = filteredLangs.reduce((sum, [_, count]) => sum + (count as number), 0) || 1
  const filteredItems = filteredLangs
    .map(([name, count]) => [name, ((count as number) / totalBytes) * 100] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const BAR_OPACITIES = [1.0, 0.78, 0.58, 0.42, 0.3, 0.22]
  const bar_area_left = 100
  const bar_area_right = 340
  const bar_max_width = bar_area_right - bar_area_left
  const row_height = 28
  const chart_top = 44
  const label_max_chars = 13

  const rows_svg: string[] = []
  filteredItems.forEach(([lang, pct], i) => {
    const y = chart_top + i * row_height
    const bar_w = Math.max(4, Math.floor((pct / 100.0) * bar_max_width))
    const opacity = BAR_OPACITIES[i % BAR_OPACITIES.length]
    const label = lang.substring(0, label_max_chars) + (lang.length > label_max_chars ? '.' : '')
    const pct_str = `${pct.toFixed(1)}%`

    rows_svg.push(`
      <rect x="${bar_area_left}" y="${y}" width="${bar_max_width}" height="14" rx="4" fill="${border_color}" opacity="0.18"/>
      <rect x="${bar_area_left}" y="${y}" width="0" height="14" rx="4" fill="${accent}" opacity="${opacity}">
        <animate attributeName="width" from="0" to="${bar_w}" dur="0.8s" begin="${(0.1 + i * 0.12).toFixed(2)}s" fill="freeze"/>
      </rect>
      <text x="${bar_area_left - 6}" y="${y + 11}" font-family="${font}" font-size="10" fill="${text_color}" text-anchor="end">${label}</text>
      <text x="${bar_area_left + bar_w + 5}" y="${y + 11}" font-family="${mono}" font-size="9" fill="${accent}" opacity="0.85">${pct_str}</text>
    `)
  })

  const chart_height = chart_top + filteredItems.length * row_height + 18

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 400 ${chart_height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="wkBg-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="${chart_height}" rx="12" fill="url(#wkBg-${widget.instanceId})" stroke="${border_color}" stroke-width="1"/>
      <text x="16" y="24" font-family="${font}" font-size="13" font-weight="700" fill="${text_color}">WakaTime — Weekly Coding Activity</text>
      <line x1="16" y1="32" x2="384" y2="32" stroke="${accent}" stroke-width="1" opacity="0.3"/>
      ${rows_svg.join('\n')}
    </svg>
  `
}
