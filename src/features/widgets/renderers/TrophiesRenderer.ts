import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderTrophies(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config
  const username = data.user.login
  const disabledTrophies = Array.isArray(cfg.disabledTrophies)
    ? (cfg.disabledTrophies as string[])
    : []

  const stars = (data.user as any).stars || (data as any).totalStars || 15
  const commits = (data as any).contributions?.totalContributions || 420
  const prs = (data.user as any).prs || 45
  const issues = (data.user as any).issues || 8
  const repos = data.repos?.length || 12
  const followers = data.user.followers || 50

  const stats = { stars, commits, prs, issues, repos, followers }

  const RANK_THRESHOLDS: Record<string, [number, number, number]> = {
    Stars: [1000, 200, 50],
    Commits: [3000, 1000, 300],
    PRs: [200, 50, 10],
    Issues: [200, 50, 10],
    Repos: [100, 30, 10],
    Followers: [500, 100, 20],
  }

  const RANK_COLORS: Record<string, string | null> = {
    S: '#ffd700',
    A: '#c0c0c0',
    B: '#cd7f32',
    C: null,
  }

  const TROPHY_CUP_PATH =
    'M-16,-24 L16,-24 L20,-8 C20,4 12,12 4,14 L4,20 L10,20 L10,26 ' +
    'L-10,26 L-10,20 L-4,20 L-4,14 C-12,12 -20,4 -20,-8 Z ' +
    'M-22,-24 L-16,-24 L-16,-10 C-20,-12 -22,-18 -22,-24 Z ' +
    'M22,-24 L16,-24 L16,-10 C20,-12 22,-18 22,-24 Z'

  const STAR_PATH =
    'M0,-10 L2.4,-3.1 L9.5,-3.1 L3.8,1.2 L6.2,8.1 ' +
    'L0,4.5 L-6.2,8.1 L-3.8,1.2 L-9.5,-3.1 L-2.4,-3.1 Z'

  const rankFor = (trophyName: string, val: number) => {
    const [s, a, b] = RANK_THRESHOLDS[trophyName] || [9999, 999, 99]
    if (val >= s) return 'S'
    if (val >= a) return 'A'
    if (val >= b) return 'B'
    return 'C'
  }

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
    return String(val)
  }

  const bg1 = '#0b0f14'
  const bg2 = '#151c25'
  const accent_color = (cfg.accentColor as string) || globalStyles.accentColor || '#b6a891'
  const text_color = (cfg.textColor as string) || globalStyles.textColor || '#eceff4'
  const font_header = 'Segoe UI, Inter, sans-serif'
  const font_data = 'Consolas, monospace'

  const rawTrophies: [string, number][] = [
    ['Stars', stats.stars],
    ['Commits', stats.commits],
    ['PRs', stats.prs],
    ['Issues', stats.issues],
    ['Repos', stats.repos],
    ['Followers', stats.followers],
  ]

  const trophies = rawTrophies.filter(([name]) => !disabledTrophies.includes(name))

  const header_h = 36
  const card_w = 120
  const card_h = 170
  const padding_x = Math.floor((800 - trophies.length * card_w) / (trophies.length + 1))
  const start_y = header_h + Math.floor((230 - header_h - card_h) / 2)

  const card_groups: string[] = []
  const filter_defs: string[] = []

  trophies.forEach(([name, value], idx) => {
    const rank = rankFor(name, value)
    const rank_color = RANK_COLORS[rank] || text_color
    const cx = padding_x + idx * (card_w + padding_x) + Math.floor(card_w / 2)
    const cy = start_y

    let glow_filter = ''
    let anim_inside_rect = ''
    const filter_def_id = `sglow-${widget.instanceId}-${idx}`
    if (rank === 'S') {
      glow_filter = `filter="url(#${filter_def_id})"`
      anim_inside_rect = `
        <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"/>
      `
      filter_defs.push(`
        <filter id="${filter_def_id}" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feFlood flood-color="${rank_color}" flood-opacity="0.4" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="shadow"/>
          <feMerge>
            <feMergeNode in="shadow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      `)
    }

    let star_el = ''
    if (rank === 'S') {
      star_el = `
        <g transform="translate(${Math.floor(card_w / 2)},20)" fill="${rank_color}" opacity="0.9">
          <path d="${STAR_PATH}"/>
        </g>
      `
    }

    card_groups.push(`
      <!-- Trophy: ${name} (rank ${rank}) -->
      <g transform="translate(${cx - Math.floor(card_w / 2)},${cy})">
        <rect width="${card_w}" height="${card_h}" rx="10" ry="10" fill="${bg2}" fill-opacity="0.8" stroke="${rank_color}" stroke-width="1.5" ${glow_filter}>
          ${anim_inside_rect}
        </rect>
        ${star_el}
        <!-- Cup icon -->
        <g transform="translate(${Math.floor(card_w / 2)},62)" fill="${rank_color}" opacity="0.9">
          <path d="${TROPHY_CUP_PATH}"/>
        </g>
        <!-- Title -->
        <text x="${Math.floor(card_w / 2)}" y="${card_h - 55}" text-anchor="middle" font-family="${font_data}" font-size="11" fill="${text_color}">${name}</text>
        <!-- Value -->
        <text x="${Math.floor(card_w / 2)}" y="${card_h - 38}" text-anchor="middle" font-family="${font_header}" font-size="15" font-weight="bold" fill="${rank_color}">${formatValue(value)}</text>
        <!-- Rank badge -->
        <rect x="${Math.floor(card_w / 2) - 13}" y="${card_h - 28}" width="26" height="18" rx="5" fill="${rank_color}" opacity="0.18"/>
        <text x="${Math.floor(card_w / 2)}" y="${card_h - 14}" text-anchor="middle" font-family="${font_header}" font-size="12" font-weight="bold" fill="${rank_color}">${rank}</text>
      </g>
    `)
  })

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 230" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="bgGrad-${widget.instanceId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
        ${filter_defs.join('\n')}
      </defs>
      <rect width="800" height="230" fill="url(#bgGrad-${widget.instanceId})" rx="12"/>
      <text x="16" y="24" font-family="${font_header}" font-size="12" font-weight="bold" fill="${accent_color}" opacity="0.7" letter-spacing="1">TROPHY CASE</text>
      <text x="200" y="24" font-family="${font_data}" font-size="11" fill="${text_color}" opacity="0.4">@${username}</text>
      <line x1="16" y1="32" x2="784" y2="32" stroke="${accent_color}" stroke-width="0.5" opacity="0.2"/>
      ${card_groups.join('\n')}
    </svg>
  `
}
