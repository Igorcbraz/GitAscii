import { EXTERNAL_LINKS } from '@/constants'
import { getTechInfo } from '@/data/techCatalog'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { API_ENDPOINTS } from '@/services/endpoints'
import { sanitizeSafeHref } from '@/utils/svgSanitizer'

function localEscapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderCodewebRetroGrid(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  _globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const width = widget.size.width || 800
  const height = widget.size.height || 260
  const cfg = widget.config || {}

  const title = (cfg.title as string) || 'Tech Stack'
  const isStatic = forceStatic || Boolean(cfg.staticMode)
  const displayMode = (cfg.displayMode as 'both' | 'logo' | 'name') || 'both'

  const sourceType = (cfg.sourceType as 'avatar' | 'url' | 'upload') || 'avatar'
  let avatarUrl = data.user.avatar_url || EXTERNAL_LINKS.DEFAULT_GHOST_AVATAR
  if (sourceType === 'upload' && cfg.uploadedImageData) {
    avatarUrl = cfg.uploadedImageData as string
  } else if (sourceType === 'url' && cfg.imageUrl) {
    avatarUrl = cfg.imageUrl as string
  } else if (cfg.avatarUrl && !cfg.sourceType) {
    avatarUrl = cfg.avatarUrl as string
  }
  avatarUrl = sanitizeSafeHref(avatarUrl, '')

  const rawCardLink =
    (cfg.link as string) ||
    (cfg.devCardLink as string) ||
    (data.user.login
      ? API_ENDPOINTS.GITHUB.USER_PROFILE(data.user.login)
      : EXTERNAL_LINKS.GITHUB_REPO)
  const cardLink = sanitizeSafeHref(rawCardLink, EXTERNAL_LINKS.GITHUB_REPO)

  const userName = (cfg.userName as string) || data.user.name || data.user.login || 'Developer'
  const userHandle = (cfg.userHandle as string) || `@${data.user.login || 'developer'}`

  const userLanguages =
    data.languages && typeof data.languages === 'object'
      ? Object.keys(data.languages).slice(0, 12)
      : []

  const fallbackTechs = [
    'js',
    'ts',
    'react',
    'nextjs',
    'nodejs',
    'tailwind',
    'python',
    'docker',
    'git',
    'postgres',
  ]

  const defaultTechs = userLanguages.length >= 3 ? userLanguages : fallbackTechs
  const rawTechs =
    Array.isArray(cfg.selectedTechs) && cfg.selectedTechs.length > 0
      ? (cfg.selectedTechs as string[])
      : Array.isArray(cfg.technologies) && cfg.technologies.length > 0
        ? (cfg.technologies as string[])
        : defaultTechs

  interface ProcessedTech {
    id: string
    name: string
    iconUrl: string
    width: number
  }

  const pillHeight = displayMode === 'logo' ? 32 : 28
  const pillRadius = Math.round(pillHeight / 2)

  const processedTechs: ProcessedTech[] = rawTechs.map((tech) => {
    const info = getTechInfo(tech)
    const iconId = info.id === 'reactnative' ? 'react' : info.id
    const iconUrl = `https://skillicons.dev/icons?i=${iconId}&theme=dark`

    let itemWidth: number
    if (displayMode === 'logo') {
      itemWidth = 32
    } else if (displayMode === 'name') {
      itemWidth = Math.max(Math.round(info.name.length * 7.4 + 24), 48)
    } else {
      itemWidth = Math.max(Math.round(16 + 6 + info.name.length * 7.2 + 20), 56)
    }

    return {
      id: info.id,
      name: info.name,
      iconUrl,
      width: itemWidth,
    }
  })

  const gapX = 8
  const gapY = 8
  const maxWidth = 440

  const rows: ProcessedTech[][] = []
  let currentRow: ProcessedTech[] = []
  let currentRowWidth = 0

  processedTechs.forEach((item) => {
    if (currentRow.length > 0 && currentRowWidth + gapX + item.width > maxWidth) {
      rows.push(currentRow)
      currentRow = [item]
      currentRowWidth = item.width
    } else {
      if (currentRow.length > 0) currentRowWidth += gapX
      currentRow.push(item)
      currentRowWidth += item.width
    }
  })
  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  const totalRowsHeight = rows.length * pillHeight + Math.max(0, rows.length - 1) * gapY
  const startPillsY = Math.max(68, Math.floor(54 + (188 - totalRowsHeight) / 2))

  const techElements: string[] = []
  rows.forEach((row, rowIndex) => {
    const rowTotalW = row.reduce((acc, item) => acc + item.width, 0) + (row.length - 1) * gapX
    let currentX = Math.floor((524 - rowTotalW) / 2)
    const currentY = startPillsY + rowIndex * (pillHeight + gapY)

    row.forEach((item, colIndex) => {
      let innerContent = ''
      if (displayMode === 'logo') {
        innerContent = `
          <image href="${localEscapeXml(item.iconUrl)}" x="${currentX + 5}" y="${currentY + 5}" width="22" height="22" preserveAspectRatio="xMidYMid meet" />
        `
      } else if (displayMode === 'name') {
        innerContent = `
          <text x="${currentX + item.width / 2}" y="${currentY + 18}" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="450">${localEscapeXml(item.name)}</text>
        `
      } else {
        innerContent = `
          <image href="${localEscapeXml(item.iconUrl)}" x="${currentX + 8}" y="${currentY + 6}" width="16" height="16" preserveAspectRatio="xMidYMid meet" />
          <text x="${currentX + 28}" y="${currentY + 18}" fill="rgba(255,255,255,0.82)" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="450">${localEscapeXml(item.name)}</text>
        `
      }

      techElements.push(`
        <g id="cw-bento-tech-${rowIndex}-${colIndex}">
          <rect x="${currentX}" y="${currentY}" width="${item.width}" height="${pillHeight}" rx="${pillRadius}" ry="${pillRadius}" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
          ${innerContent}
        </g>
      `)
      currentX += item.width + gapX
    })
  })

  const anim = isStatic
    ? ''
    : `
    <style>
      @keyframes stack-orb { 0%, 100% { transform: translate(0,0); opacity: 0.45; } 50% { transform: translate(20px, -16px); opacity: 0.7; } }
      @keyframes stack-orb2 { 0%, 100% { transform: translate(0,0); opacity: 0.35; } 50% { transform: translate(-18px, 12px); opacity: 0.6; } }
      #cw-bento-o1-${widget.instanceId} { animation: stack-orb 10s ease-in-out infinite; }
      #cw-bento-o2-${widget.instanceId} { animation: stack-orb2 12s ease-in-out infinite; }
      #cw-bento-o3-${widget.instanceId} { animation: stack-orb 9s ease-in-out infinite 2s; }
    </style>
  `

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        ${anim}
        <radialGradient id="cw-bento-g1-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(108,195,130,0.45)" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>
        <radialGradient id="cw-bento-g2-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(230,100,115,0.35)" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>
        <radialGradient id="cw-bento-g3-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(80,160,220,0.35)" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>
        <linearGradient id="cw-bento-avatar-shade-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(8,8,13,0)" />
          <stop offset="100%" stop-color="rgba(8,8,13,0.92)" />
        </linearGradient>
        <clipPath id="cw-bento-card-clip-${widget.instanceId}">
          <rect x="0" y="0" width="260" height="260" rx="14" ry="14" />
        </clipPath>
        <clipPath id="cw-bento-right-clip-${widget.instanceId}">
          <rect x="0" y="0" width="524" height="260" rx="20" ry="20" />
        </clipPath>
        <filter id="cw-devcard-shadow-${widget.instanceId}" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="rgba(0,0,0,0.35)" />
        </filter>
      </defs>

      <!-- LEFT: Avatar Card (260 x 260) with link & drop shadow -->
      <g filter="url(#cw-devcard-shadow-${widget.instanceId})">
        <a xlink:href="${localEscapeXml(cardLink)}" target="_blank">
          <g clip-path="url(#cw-bento-card-clip-${widget.instanceId})">
            <rect x="0" y="0" width="260" height="260" rx="14" ry="14" fill="#08080d" />
            <image href="${localEscapeXml(avatarUrl)}" x="0" y="0" width="260" height="260" preserveAspectRatio="xMidYMid slice" />
            <rect x="0" y="150" width="260" height="110" fill="url(#cw-bento-avatar-shade-${widget.instanceId})" />
            <g transform="translate(16, 202)">
              <text x="0" y="18" fill="#ffffff" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">${localEscapeXml(userName)}</text>
              <text x="0" y="34" fill="rgba(255,255,255,0.7)" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500">${localEscapeXml(userHandle)}</text>
            </g>
          </g>
        </a>
      </g>

      <!-- RIGHT: Tech Stack Aura Container (524 x 260) -->
      <g transform="translate(276, 0)">
        <rect x="0" y="0" width="524" height="260" rx="20" ry="20" fill="#08080d" />

        <g clip-path="url(#cw-bento-right-clip-${widget.instanceId})">
          <!-- Background glowing radial gradient orbs -->
          <ellipse id="cw-bento-o1-${widget.instanceId}" cx="80" cy="200" rx="170" ry="120" fill="url(#cw-bento-g1-${widget.instanceId})" />
          <ellipse id="cw-bento-o2-${widget.instanceId}" cx="520" cy="40" rx="160" ry="120" fill="url(#cw-bento-g2-${widget.instanceId})" />
          <ellipse id="cw-bento-o3-${widget.instanceId}" cx="470" cy="220" rx="160" ry="120" fill="url(#cw-bento-g3-${widget.instanceId})" />
        </g>

        <!-- Tech Stack Header Label -->
        <text x="262" y="44" text-anchor="middle" fill="rgba(255,255,255,0.38)" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" letter-spacing="4">${localEscapeXml(title.toUpperCase())}</text>

        <!-- Tech Stack Pills List -->
        <g>
          ${techElements.join('')}
        </g>
      </g>
    </svg>
  `
}
