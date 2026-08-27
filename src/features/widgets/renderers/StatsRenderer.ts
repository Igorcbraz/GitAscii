import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderStats(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 800)
  const cfg = widget?.config || {}
  const textClr = (cfg.textColor as string) || globalStyles?.textColor || '#ffffff'
  const accent = (cfg.accentColor as string) || globalStyles?.accentColor || '#c5ff4a'

  const hideMetrics: string[] = Array.isArray(cfg.hideMetrics) ? (cfg.hideMetrics as string[]) : []

  const totalStars = Number(data?.totalStars) || 0
  const publicRepos = Number(data?.user?.public_repos) || 0
  const followers = Number(data?.user?.followers) || 0
  const following = Number(data?.user?.following) || 0
  const totalForks = Number(data?.totalForks) || 0
  const publicGists = Number(data?.user?.public_gists) || 0

  const allMetrics = [
    { id: 'stars', label: 'STARS', val: totalStars.toLocaleString() },
    { id: 'repos', label: 'REPOS', val: publicRepos.toLocaleString() },
    { id: 'followers', label: 'FOLLOWERS', val: followers.toLocaleString() },
    { id: 'following', label: 'FOLLOWING', val: following.toLocaleString() },
    { id: 'forks', label: 'FORKS', val: totalForks.toLocaleString() },
    { id: 'gists', label: 'GISTS', val: publicGists.toLocaleString() },
  ]

  const statItems = allMetrics.filter((m) => !hideMetrics.includes(m.id))
  const statsLayout = (cfg.statsLayout as string) || 'horizontal'
  const statsStyle = (cfg.statsStyle as string) || 'default'
  const labelStyle = (cfg.labelStyle as string) || 'label'
  const valueFontSize = Number(cfg.valueFontSize) || 28

  const getLabel = (m: { label: string }) => (labelStyle === 'none' ? '' : m.label)

  let statsSvg = ''

  if (statsStyle === 'terminal') {
    const startY = 48
    const monoFont = `'JetBrains Mono', monospace`
    const minColWidth = 100
    const fitsHorizontal =
      statsLayout === 'horizontal' && (width - 48) / Math.max(1, statItems.length) >= minColWidth

    if (statsLayout === 'horizontal' && fitsHorizontal) {
      const itemW = statItems.length > 0 ? (width - 48) / statItems.length : width - 48
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(${24 + i * itemW}, ${startY})">
          <text x="0" y="18" font-family="${monoFont}" font-size="13" fill="${accent}">[ ${m.val} ]</text>
          ${labelStyle !== 'none' ? `<text x="0" y="32" font-family="${monoFont}" font-size="9" fill="#7a7a7a" letter-spacing="2">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    } else if (statsLayout === 'vertical') {
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(24, ${startY + i * 34})">
          <text x="0" y="18" font-family="${monoFont}" font-size="13" fill="${accent}">[ ${m.val} ]</text>
          ${labelStyle !== 'none' ? `<text x="${(m.val.length + 4) * 8 + 4}" y="18" font-family="${monoFont}" font-size="9" fill="#7a7a7a" letter-spacing="2">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    } else {
      const cols = width < 260 ? 1 : 2
      const colW = (width - 48) / cols
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(${24 + (i % cols) * colW}, ${startY + Math.floor(i / cols) * 40})">
          <text x="0" y="18" font-family="${monoFont}" font-size="13" fill="${accent}">[ ${m.val} ]</text>
          ${labelStyle !== 'none' ? `<text x="0" y="30" font-family="${monoFont}" font-size="9" fill="#7a7a7a" letter-spacing="2">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    }
  } else if (statsStyle === 'minimal') {
    const minColWidth = 70
    const fitsHorizontal =
      statsLayout === 'horizontal' && (width - 48) / Math.max(1, statItems.length) >= minColWidth
    const fs = Math.min(
      valueFontSize,
      Math.max(14, Math.floor((width - 48) / (statItems.length * 3.5)))
    )

    if (statsLayout === 'horizontal' && fitsHorizontal) {
      const itemW = statItems.length > 0 ? (width - 48) / statItems.length : width - 48
      statsSvg = statItems
        .map(
          (m, i) => `
        <text x="${24 + i * itemW}" y="${48 + fs}" font-family="${globalStyles.fontFamily}" font-size="${fs}" font-weight="200" fill="${textClr}">${m.val}</text>`
        )
        .join('')
    } else if (statsLayout === 'vertical') {
      statsSvg = statItems
        .map(
          (m, i) => `
        <text x="24" y="${48 + i * (fs + 12) + fs}" font-family="${globalStyles.fontFamily}" font-size="${Math.min(fs, 22)}" font-weight="200" fill="${textClr}">${m.val}</text>`
        )
        .join('')
    } else {
      const cols = width < 240 ? 1 : 2
      const colW = (width - 48) / cols
      statsSvg = statItems
        .map(
          (m, i) => `
        <text x="${24 + (i % cols) * colW}" y="${48 + Math.floor(i / cols) * (Math.min(fs, 24) + 8) + Math.min(fs, 24)}" font-family="${globalStyles.fontFamily}" font-size="${Math.min(fs, 24)}" font-weight="200" fill="${textClr}">${m.val}</text>`
        )
        .join('')
    }
  } else if (statsStyle === 'cards') {
    const cardH = 52
    const gap = 8
    const cols = statsLayout === 'vertical' || width < 280 ? 1 : 2
    const cardW = cols === 1 ? width - 48 : Math.floor((width - 48 - gap) / 2)
    statsSvg = statItems
      .map((m, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const cx = 24 + col * (cardW + gap)
        const cy = 44 + row * (cardH + gap)
        return `
        <g transform="translate(${cx}, ${cy})">
          <rect x="0" y="0" width="${cardW}" height="${cardH}" fill="#1e1e1e" rx="6" />
          <rect x="0" y="0" width="3" height="${cardH}" fill="${accent}" rx="1" />
          <text x="12" y="22" font-family="${globalStyles.fontFamily}" font-size="${Math.min(valueFontSize, 20)}" font-weight="300" fill="${accent}">${m.val}</text>
          ${labelStyle !== 'none' ? `<text x="12" y="42" font-family="${globalStyles.fontFamily}" font-size="9" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
        </g>`
      })
      .join('')
  } else {
    const minColWidth = 90
    const fitsHorizontal =
      statsLayout === 'horizontal' && (width - 48) / Math.max(1, statItems.length) >= minColWidth

    if (statsLayout === 'horizontal' && fitsHorizontal) {
      const itemWidth = statItems.length > 0 ? (width - 48) / statItems.length : width - 48
      const responsiveFs = Math.min(valueFontSize, Math.max(16, Math.floor(itemWidth / 3.2)))
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(${24 + i * itemWidth}, 48)">
          <text x="0" y="${responsiveFs}" font-family="${globalStyles.fontFamily}" font-size="${responsiveFs}" font-weight="300" fill="${accent}">${m.val}</text>
          ${labelStyle !== 'none' ? `<text x="0" y="${responsiveFs + 16}" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    } else if (statsLayout === 'vertical' || width < 260) {
      const responsiveFs = Math.min(valueFontSize, 22)
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(24, ${48 + i * 48})">
          <text x="0" y="${responsiveFs}" font-family="${globalStyles.fontFamily}" font-size="${responsiveFs}" font-weight="300" fill="${accent}">${m.val}</text>
          ${labelStyle !== 'none' ? `<text x="${responsiveFs * (m.val.length * 0.55) + 12}" y="${responsiveFs}" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    } else {
      const cols = 2
      const colW = (width - 48) / cols
      const responsiveFs = Math.min(valueFontSize, Math.max(16, Math.floor(colW / 4)))
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(${24 + (i % cols) * colW}, ${48 + Math.floor(i / cols) * 56})">
          <text x="0" y="${responsiveFs}" font-family="${globalStyles.fontFamily}" font-size="${responsiveFs}" font-weight="300" fill="${accent}">${m.val}</text>
          ${labelStyle !== 'none' ? `<text x="0" y="${responsiveFs + 15}" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    }
  }

  return `
    <text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ GITHUB METRICS ]</text>
    ${statsSvg}
  `
}
