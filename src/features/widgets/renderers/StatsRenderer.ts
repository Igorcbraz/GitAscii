import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderStats(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width } = widget.size
  const cfg = widget.config
  const textClr = (cfg.textColor as string) || globalStyles.textColor || '#ffffff'
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#c5ff4a'

  const hideMetrics: string[] = Array.isArray(cfg.hideMetrics) ? (cfg.hideMetrics as string[]) : []

  const allMetrics = [
    { id: 'stars', label: 'STARS', val: data.totalStars.toLocaleString() },
    { id: 'repos', label: 'REPOS', val: data.user.public_repos.toLocaleString() },
    { id: 'followers', label: 'FOLLOWERS', val: data.user.followers.toLocaleString() },
    { id: 'following', label: 'FOLLOWING', val: data.user.following.toLocaleString() },
    { id: 'forks', label: 'FORKS', val: data.totalForks.toLocaleString() },
    { id: 'gists', label: 'GISTS', val: data.user.public_gists.toLocaleString() },
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
    if (statsLayout === 'horizontal') {
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
        <g transform="translate(24, ${startY + i * 32})">
          <text x="0" y="18" font-family="${monoFont}" font-size="13" fill="${accent}">[ ${m.val} ]</text>
          ${labelStyle !== 'none' ? `<text x="${(m.val.length + 4) * 8 + 4}" y="18" font-family="${monoFont}" font-size="9" fill="#7a7a7a" letter-spacing="2">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    } else {
      const colW = (width - 48) / 2
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(${24 + (i % 2) * colW}, ${startY + Math.floor(i / 2) * 40})">
          <text x="0" y="18" font-family="${monoFont}" font-size="13" fill="${accent}">[ ${m.val} ]</text>
          ${labelStyle !== 'none' ? `<text x="0" y="30" font-family="${monoFont}" font-size="9" fill="#7a7a7a" letter-spacing="2">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    }
  } else if (statsStyle === 'minimal') {
    const fs = valueFontSize
    if (statsLayout === 'horizontal') {
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
      const colW = (width - 48) / 2
      statsSvg = statItems
        .map(
          (m, i) => `
        <text x="${24 + (i % 2) * colW}" y="${48 + Math.floor(i / 2) * (Math.min(fs, 24) + 8) + Math.min(fs, 24)}" font-family="${globalStyles.fontFamily}" font-size="${Math.min(fs, 24)}" font-weight="200" fill="${textClr}">${m.val}</text>`
        )
        .join('')
    }
  } else if (statsStyle === 'cards') {
    const cardH = 52
    const gap = 8
    const cols = statsLayout === 'vertical' ? 1 : 2
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
          <text x="12" y="22" font-family="${globalStyles.fontFamily}" font-size="${Math.min(valueFontSize, 22)}" font-weight="300" fill="${accent}">${m.val}</text>
          ${labelStyle !== 'none' ? `<text x="12" y="42" font-family="${globalStyles.fontFamily}" font-size="9" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
        </g>`
      })
      .join('')
  } else {
    if (statsLayout === 'horizontal') {
      const itemWidth = statItems.length > 0 ? (width - 48) / statItems.length : width - 48
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(${24 + i * itemWidth}, 48)">
          <text x="0" y="${valueFontSize}" font-family="${globalStyles.fontFamily}" font-size="${valueFontSize}" font-weight="300" fill="${accent}">${m.val}</text>
          ${labelStyle !== 'none' ? `<text x="0" y="${valueFontSize + 18}" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    } else if (statsLayout === 'vertical') {
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(24, ${48 + i * 52})">
          <text x="0" y="28" font-family="${globalStyles.fontFamily}" font-size="${Math.min(valueFontSize, 24)}" font-weight="300" fill="${accent}">${m.val}</text>
          ${labelStyle !== 'none' ? `<text x="${Math.min(valueFontSize, 24) * (m.val.length * 0.6) + 8}" y="28" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
        </g>`
        )
        .join('')
    } else {
      const colW = (width - 48) / 2
      statsSvg = statItems
        .map(
          (m, i) => `
        <g transform="translate(${24 + (i % 2) * colW}, ${48 + Math.floor(i / 2) * 60})">
          <text x="0" y="${Math.min(valueFontSize, 26)}" font-family="${globalStyles.fontFamily}" font-size="${Math.min(valueFontSize, 26)}" font-weight="300" fill="${accent}">${m.val}</text>
          ${labelStyle !== 'none' ? `<text x="0" y="${Math.min(valueFontSize, 26) + 16}" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
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
