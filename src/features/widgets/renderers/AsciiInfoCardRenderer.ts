import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderAsciiInfoCard(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  isStaticOverride?: boolean
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const username = data.user.login
  const host = (cfg.infoHost as string) || username

  const rows: Array<[string, string] | [string, string, string]> = []

  rows.push(['host', ''])

  if (cfg.showNow !== false) {
    rows.push(['kv', 'Now', (cfg.customNow as string) || data.user.bio || 'Software Engineer'])
  }
  if (cfg.showAlso !== false) {
    rows.push([
      'kv',
      'Also',
      (cfg.customAlso as string) ||
        (data.user.company ? `@${data.user.company.replace(/^@/, '')}` : 'Developer'),
    ])
  }
  if (cfg.showLoc !== false) {
    rows.push(['kv', 'Loc', (cfg.customLoc as string) || data.user.location || 'Brazil'])
  }
  if (cfg.showSite !== false) {
    rows.push(['kv', 'Site', (cfg.customSite as string) || data.user.blog || 'github.com'])
  }

  const showLangs = cfg.showLangs !== false
  const showFrontend = cfg.showFrontend !== false
  const showBackend = cfg.showBackend !== false

  if (showLangs || showFrontend || showBackend) {
    rows.push(['gap', ''])
    rows.push(['sec', 'Stack'])
    if (showLangs) {
      const topLangs = Object.keys(data.languages).slice(0, 3).join(', ')
      rows.push([
        'kv',
        'Langs',
        (cfg.customLangs as string) || topLangs || 'TypeScript, JavaScript',
      ])
    }
    if (showFrontend) {
      rows.push(['kv', 'Frontend', (cfg.customFrontend as string) || 'React, Next.js, CSS, HTML'])
    }
    if (showBackend) {
      rows.push(['kv', 'Backend', (cfg.customBackend as string) || 'Node.js, Postgres, Express'])
    }
  }

  const showBullet1 = cfg.showBullet1 !== false
  const showBullet2 = cfg.showBullet2 !== false

  if (showBullet1 || showBullet2) {
    rows.push(['gap', ''])
    rows.push(['sec', 'Highlights'])
    if (showBullet1) {
      rows.push([
        'bul',
        (cfg.customBullet1 as string) ||
          `${data.user.public_repos} public repos, ${data.user.followers} followers`,
      ])
    }
    if (showBullet2) {
      rows.push([
        'bul',
        (cfg.customBullet2 as string) || `Active developer with ${data.totalStars} total stars`,
      ])
    }
  }

  // Timing
  const isStatic = isStaticOverride !== undefined ? isStaticOverride : Boolean(cfg.staticMode)

  // Colors (GitHub dark styling)
  const bg1 = (cfg.backgroundColor as string) || globalStyles.backgroundColor || '#111722'
  const bg2 = '#0d1117'
  const frameColor = (cfg.borderColor as string) || globalStyles.borderColor || '#30363d'
  const mutedColor = '#7d8590'
  const inkColor = '#c9d1d9'
  const keyColor = (cfg.accentColor as string) || globalStyles.accentColor || '#ffa657' // orange keys
  const sectionColor = '#58a6ff' // blue headers
  const greenColor = '#3fb950'
  const accentColor = '#22d3ee'

  const PAD = 20
  const TITLEBAR_H = 30
  const KEY_X = PAD
  const VAL_X = PAD + 92

  // Calculate line spacing dynamically based on row count and widget height
  const nonGapRows = rows.filter((r) => r[0] !== 'gap').length
  const gapRows = rows.filter((r) => r[0] === 'gap').length
  const availableHeight = height - TITLEBAR_H - 48
  const LINE_H = Math.max(16, Math.min(24, availableHeight / (nonGapRows + gapRows * 0.5)))

  const parts: string[] = []

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" ` +
      `font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">`
  )
  parts.push(
    `<defs>` +
      `<linearGradient id="infocard-bg-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>` +
      `</linearGradient>` +
      `</defs>`
  )

  // Background
  parts.push(
    `<rect width="${width}" height="${height}" rx="${globalStyles.borderRadius || 12}" fill="url(#infocard-bg-${widget.instanceId})"/>`
  )
  parts.push(
    `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${globalStyles.borderRadius || 12}" fill="none" stroke="${frameColor}"/>`
  )

  // Title bar
  parts.push(
    `<line x1="0" y1="${TITLEBAR_H}" x2="${width}" y2="${TITLEBAR_H}" stroke="${frameColor}"/>`
  )
  const dotcols = ['#ff5f56', '#ffbd2e', '#27c93f']
  for (let i = 0; i < 3; i++) {
    parts.push(`<circle cx="${PAD + i * 16}" cy="${TITLEBAR_H / 2}" r="5" fill="${dotcols[i]}"/>`)
  }
  parts.push(
    `<text x="${width / 2}" y="${TITLEBAR_H / 2 + 4}" fill="${mutedColor}" font-size="12" ` +
      `text-anchor="middle">${escapeXml(host)}@github: ~$ neofetch</text>`
  )

  // Stagger helper
  const renderRise = (innerHtml: string, index: number) => {
    if (isStatic) {
      return `<g>${innerHtml}</g>`
    }
    const delay = 0.15 + index * 0.06
    return (
      `<g opacity="0" transform="translate(0,5)">${innerHtml}` +
      `<animate attributeName="opacity" from="0" to="1" begin="${delay.toFixed(2)}s" dur="0.4s" fill="freeze"/>` +
      `<animateTransform attributeName="transform" type="translate" from="0 5" to="0 0" ` +
      `begin="${delay.toFixed(2)}s" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>` +
      `</g>`
    )
  }

  let y = TITLEBAR_H + 30
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const kind = row[0]

    if (kind === 'gap') {
      y += LINE_H * 0.5
      continue
    }

    let inner = ''
    if (kind === 'host') {
      const safeHost = escapeXml(host)
      const ruleX = KEY_X + (host.length + 7) * 8 + 8
      inner =
        `<text x="${KEY_X}" y="${y.toFixed(1)}" font-size="14" font-weight="700">` +
        `<tspan fill="${greenColor}">${safeHost}</tspan><tspan fill="${mutedColor}">@</tspan>` +
        `<tspan fill="${accentColor}">github</tspan></text>` +
        `<line x1="${ruleX}" y1="${(y - 4).toFixed(1)}" x2="${width - PAD}" y2="${(y - 4).toFixed(1)}" ` +
        `stroke="${frameColor}" stroke-opacity="0.8"/>`
    } else if (kind === 'sec') {
      const title = escapeXml(row[1])
      const textLen = row[1] ? row[1].length : 0
      inner =
        `<text x="${KEY_X}" y="${y.toFixed(1)}" fill="${sectionColor}" font-size="12.5" font-weight="700">&#8212; ${title}</text>` +
        `<line x1="${KEY_X + 12 + textLen * 8}" y1="${(y - 4).toFixed(1)}" x2="${width - PAD}" y2="${(y - 4).toFixed(1)}" ` +
        `stroke="${frameColor}" stroke-opacity="0.8"/>`
    } else if (kind === 'kv') {
      const key = escapeXml(row[1])
      const val = escapeXml(row[2] || '')
      inner =
        `<text x="${KEY_X}" y="${y.toFixed(1)}" fill="${keyColor}" font-size="12.5" font-weight="700">${key}</text>` +
        `<text x="${VAL_X}" y="${y.toFixed(1)}" fill="${inkColor}" font-size="12.5">${val}</text>`
    } else if (kind === 'bul') {
      const txt = escapeXml(row[1])
      inner =
        `<circle cx="${KEY_X + 3}" cy="${(y - 4).toFixed(1)}" r="2.5" fill="${greenColor}"/>` +
        `<text x="${KEY_X + 14}" y="${y.toFixed(1)}" fill="${inkColor}" font-size="12.5">${txt}</text>`
    }

    parts.push(renderRise(inner, i))
    y += LINE_H
  }

  parts.push(`</svg>`)
  return parts.join('\n')
}
