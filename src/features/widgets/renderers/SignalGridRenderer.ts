import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import type { GitHubRepo } from '@/features/github/types/github'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function shorten(value: string, maximumLength: number): string {
  return value.length <= maximumLength ? value : `${value.slice(0, maximumLength - 1).trimEnd()}…`
}

function getSortedRepos(
  data: NormalizedGitHubData,
  selectedRepos: string[],
  sortBy: string,
  maxCount: number
): GitHubRepo[] {
  const all = Array.isArray(data?.repos) ? data.repos.filter(Boolean) : []
  let filtered = [...all]

  if (selectedRepos && selectedRepos.length > 0) {
    filtered = all.filter((r) => r && selectedRepos.includes(r.name))
    filtered.sort((a, b) => selectedRepos.indexOf(a.name) - selectedRepos.indexOf(b.name))
  } else {
    if (sortBy === 'stars') {
      filtered.sort((a, b) => (Number(b.stargazers_count) || 0) - (Number(a.stargazers_count) || 0))
    } else if (sortBy === 'forks') {
      filtered.sort((a, b) => (Number(b.forks_count) || 0) - (Number(a.forks_count) || 0))
    } else if (sortBy === 'updated') {
      filtered.sort((a, b) => {
        const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0
        return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta)
      })
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
    } else {
      filtered.sort((a, b) => (Number(b.stargazers_count) || 0) - (Number(a.stargazers_count) || 0))
    }
  }

  return filtered.slice(0, maxCount)
}

export function renderSignalGrid(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 800)
  const height = Math.max(100, Number(widget?.size?.height) || 400)
  const cfg = widget?.config || {}

  const bg1 = '#07131A'
  const bg2 = '#10141F'
  const panel = '#0C1C24'
  const border = '#2B4A57'
  const textClr = '#E7F7FC'
  const muted = '#8BA9B5'

  const primary = (cfg.accentColor as string) || globalStyles?.accentColor || '#00A7D1'
  const secondary = (cfg.secondaryColor as string) || '#E84A8A'

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'
  const customTitle = (cfg.customTitle as string) || data?.user?.name || data?.user?.login || 'USER'

  const selectedRepos = Array.isArray(cfg.selectedRepos) ? (cfg.selectedRepos as string[]) : []
  const sortBy = (cfg.repoSortBy as string) || 'stars'
  const maxRepos = Number(cfg.maxRepos) || 8

  if (layoutType === 'hero') {
    const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(8, maxRepos))
    const flagships = layers.slice(0, 3)
    const userTitle = escapeXml(customTitle).toUpperCase()
    const bioText = escapeXml(
      shorten(
        (cfg.customBio ? String(cfg.customBio) : data?.user?.bio) ||
          'Building the systems around coding agents — from skills and trust to memory a…',
        65
      )
    )

    const activeCount = String(layers.length).padStart(2, '0')
    const flagshipCount = String(flagships.length).padStart(2, '0')

    const listSignals = flagships
      .map((layer, index) => {
        let cx = 806
        let cy = 112
        if (index === 1) {
          cx = 1028
          cy = 154
        }
        if (index === 2) {
          cx = 846
          cy = 253
        }

        const accent = index === 2 ? secondary : primary
        const name = escapeXml(shorten(layer.name, 18))
        const lang = escapeXml(
          (
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
            layer.language ||
            'EXTEND'
          ).toUpperCase()
        )

        return `
          <g class="boot" style="animation-delay:${(index * 0.18).toFixed(2)}s">
            <circle cx="${cx}" cy="${cy}" r="35" fill="${panel}" stroke="${accent}" stroke-width="2"/>
            <circle class="pulse" cx="${cx}" cy="${cy}" r="7" fill="${accent}" filter="url(#industrial-glow-${widget.instanceId})"/>
            <text x="${cx}" y="${cy + 54}" text-anchor="middle" font-size="9" font-weight="800" fill="${textClr}">${name}</text>
            <text x="${cx}" y="${cy + 68}" text-anchor="middle" font-size="7" letter-spacing="1.2" fill="${accent}">${lang}</text>
          </g>
        `
      })
      .join('')

    const listBlocks = layers
      .map((layer, index) => {
        const x = 36 + index * 142
        const accent = index % 2 === 0 ? primary : secondary
        const lang = escapeXml(
          shorten(
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
            12
          ).toUpperCase()
        )

        return `
          <g>
            <rect x="${x}" y="307" width="134" height="26" fill="${panel}" stroke="${accent}" stroke-opacity=".75"/>
            <rect x="${x}" y="307" width="10.7" height="26" fill="${accent}"/>
            <text x="${x + 67}" y="324" text-anchor="middle" font-size="7" font-weight="700" fill="${textClr}">${lang}</text>
          </g>
        `
      })
      .join('')

    return `
      <svg id="svg-hero-${widget.instanceId}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="industrial-bg-${widget.instanceId}" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="${bg1}"/>
            <stop offset="1" stop-color="${bg2}"/>
          </linearGradient>
          <linearGradient id="industrial-accent-${widget.instanceId}" x1="0" y1="0" x2="1" y2="0">
            <stop stop-color="${primary}"/>
            <stop offset="1" stop-color="${secondary}"/>
          </linearGradient>
          <pattern id="industrial-grid-${widget.instanceId}" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#17313C" stroke-width="1"/>
          </pattern>
          <pattern id="industrial-dots-${widget.instanceId}" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#17313C"/>
          </pattern>
          <filter id="industrial-glow-${widget.instanceId}" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge>
              <feMergeNode in="b"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <style>
          #svg-hero-${widget.instanceId} text{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
          .micro{font-size:9px;letter-spacing:2px}
          .label{font-size:11px;letter-spacing:2.5px;font-weight:700}
          .flow{stroke-dasharray:6 9;animation:flow 7s linear infinite}
          .pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.4s ease-in-out infinite}
          .scan{animation:scan 5s ease-in-out infinite}
          .flicker{animation:flicker 2.2s ease-in-out infinite}
          .boot{animation:boot .8s cubic-bezier(.2,.8,.2,1) both}
          @keyframes flow{to{stroke-dashoffset:-150}}
          @keyframes pulse{50%{opacity:.35;transform:scale(.72)}}
          @keyframes scan{50%{opacity:.28;transform:translateX(24px)}}
          @keyframes flicker{50%{opacity:.38}}
          @keyframes boot{from{opacity:0}to{opacity:1}}
        </style>

        <rect width="1200" height="360" rx="18" fill="url(#industrial-bg-${widget.instanceId})"/>
        <rect width="1200" height="360" rx="18" fill="url(#industrial-grid-${widget.instanceId})" opacity=".68"/>
        <rect x="680" y="44" width="500" height="246" fill="url(#industrial-dots-${widget.instanceId})" opacity=".76"/>

        <path d="M0 1H1200" stroke="url(#industrial-accent-${widget.instanceId})" stroke-width="2"/>

        <!-- Header -->
        <g transform="translate(20 22)">
          <circle cx="0" r="4" fill="#EF4B5A"/>
          <circle cx="18" r="4" fill="#E6A425"/>
          <circle cx="36" r="4" fill="#22A447"/>
          <text x="58" y="4" class="micro" fill="${muted}">${escapeXml(cfg.customTitle ? String(cfg.customTitle) : data.user.login).toUpperCase()} / SIGNAL_GRID</text>
        </g>
        <g transform="translate(1042 22)">
          <circle class="flicker" r="4" fill="${primary}"/>
          <text x="14" y="4" class="micro" fill="${muted}">LINK STABLE</text>
        </g>
        <path d="M0 44H1200" stroke="${border}"/>

        <!-- Left identity block -->
        <g class="boot">
          <path d="M36 70H648V282H36Z" fill="${panel}" fill-opacity=".34" stroke="${border}"/>
          <path d="M36 70h84M36 70v52M648 282h-84M648 282v-52" stroke="${primary}" stroke-width="2"/>
          <text x="62" y="102" class="label" fill="${primary}">// IDENTITY TRANSMISSION</text>
          <text x="60" y="154" font-size="40" font-weight="900" letter-spacing="-1.4" fill="${textClr}">${userTitle}</text>
          <text x="60" y="194" font-size="40" font-weight="900" letter-spacing="-1.4" fill="${textClr}">SIGNAL NETWORK</text>
          <text x="62" y="238" font-size="11" letter-spacing="1.2" fill="${muted}">${bioText}</text>
          <path class="scan" d="M62 259H308" stroke="${secondary}" stroke-width="3"/>
          <text x="62" y="276" class="micro" fill="${textClr}">${activeCount} NETWORKED LAYERS / ${flagshipCount} PRIMARY SIGNALS</text>
        </g>

        <!-- Right Radar Center -->
        <g transform="translate(920 165)">
          <circle r="47" fill="${panel}" stroke="${border}"/>
          <circle r="33" fill="none" stroke="url(#industrial-accent-${widget.instanceId})" stroke-dasharray="6 7"/>
          <path d="M0-56V56M-56 0H56" stroke="${border}"/>
          <circle class="pulse" r="7" fill="${primary}" filter="url(#industrial-glow-${widget.instanceId})"/>
        </g>

        <path d="M920 165L806 112L1028 154L846 253" fill="none" stroke="${border}"/>
        <path class="flow" d="M920 165L806 112L1028 154L846 253" fill="none" stroke="url(#industrial-accent-${widget.instanceId})"/>

        <!-- Signals list -->
        ${listSignals}

        <text x="700" y="66" class="label" fill="${secondary}">PRIMARY SIGNAL TOPOLOGY</text>
        <text x="1170" y="284" text-anchor="end" class="micro" fill="${muted}">CARRIER / ${escapeXml(cfg.customTitle ? String(cfg.customTitle) : data.user.login).toUpperCase()}</text>

        <!-- Dynamic spec blocks -->
        ${listBlocks}

        <rect x="1" y="1" width="1198" height="358" rx="18" fill="none" stroke="${primary}" stroke-opacity=".72"/>
      </svg>
    `
  } else {
    const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(8, maxRepos))
    const userTitle = escapeXml(customTitle).toUpperCase()
    const activeCount = String(layers.length).padStart(2, '0')

    const nodes = layers
      .map((layer, index) => {
        const isBottom = index % 2 !== 0
        const slot = Math.floor(index / 2)
        const x = 110 + slot * 326.7
        const y = isBottom ? 235 : 105

        const accent = index % 2 === 0 ? primary : secondary
        const name = escapeXml(shorten(layer.name, 14))
        const lang = escapeXml(
          (
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
            layer.language ||
            'EXTEND'
          ).toUpperCase()
        )

        return `
          <g>
            <circle cx="${x.toFixed(1)}" cy="${y}" r="24" fill="${panel}" stroke="${accent}" stroke-width="2"/>
            <circle class="pulse" cx="${x.toFixed(1)}" cy="${y}" r="5" fill="${accent}"/>
            <text x="${x.toFixed(1)}" y="${y + 3}" text-anchor="middle" font-size="7" font-weight="700" fill="${accent}">${String(index + 1).padStart(2, '0')}</text>
            <text x="${x.toFixed(1)}" y="${isBottom ? y + 43 : y - 36}" text-anchor="middle" font-size="9" font-weight="800" fill="${textClr}">${name}</text>
            <text x="${x.toFixed(1)}" y="${isBottom ? y + 55 : y - 24}" text-anchor="middle" font-size="7" fill="${muted}">${lang}</text>
          </g>
        `
      })
      .join('')

    const pathsHtml = layers
      .map((_, index) => {
        if (index === 0) return ''
        const prevSlot = Math.floor((index - 1) / 2)
        const prevIsBottom = (index - 1) % 2 !== 0
        const prevX = 110 + prevSlot * 326.7
        const prevY = prevIsBottom ? 235 : 105

        const currSlot = Math.floor(index / 2)
        const currIsBottom = index % 2 !== 0
        const currX = 110 + currSlot * 326.7
        const currY = currIsBottom ? 235 : 105

        return `<path d="M${prevX.toFixed(1)} ${prevY}L${currX.toFixed(1)} ${currY}" stroke="${border}"/>`
      })
      .join('')

    return `
      <svg id="svg-cl-${widget.instanceId}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 330" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="industrial-bg-${widget.instanceId}" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="${bg1}"/>
            <stop offset="1" stop-color="${bg2}"/>
          </linearGradient>
          <linearGradient id="industrial-accent-${widget.instanceId}" x1="0" y1="0" x2="1" y2="0">
            <stop stop-color="${primary}"/>
            <stop offset="1" stop-color="${secondary}"/>
          </linearGradient>
          <pattern id="industrial-grid-${widget.instanceId}" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#17313C" stroke-width="1"/>
          </pattern>
          <pattern id="industrial-dots-${widget.instanceId}" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#17313C"/>
          </pattern>
        </defs>
        <style>
          #svg-cl-${widget.instanceId} text{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
          .micro{font-size:9px;letter-spacing:2px}
          .label{font-size:11px;letter-spacing:2.5px;font-weight:700}
          .flow{stroke-dasharray:6 9;animation:flow 7s linear infinite}
          .pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.4s ease-in-out infinite}
          @keyframes flow{to{stroke-dashoffset:-150}}
          @keyframes pulse{50%{opacity:.35;transform:scale(.72)}}
        </style>

        <rect width="1200" height="330" rx="18" fill="url(#industrial-bg-${widget.instanceId})"/>
        <rect width="1200" height="330" rx="18" fill="url(#industrial-grid-${widget.instanceId})" opacity=".68"/>
        <rect width="1200" height="330" rx="18" fill="url(#industrial-dots-${widget.instanceId})" opacity=".28"/>

        <text x="28" y="33" class="label" fill="${primary}">${userTitle} / NETWORK TOPOLOGY</text>
        <text x="1170" y="33" text-anchor="end" class="micro" fill="${muted}">${activeCount} NODES · MESH ONLINE</text>

        <!-- Connection paths -->
        ${pathsHtml}
        <path class="flow" d="M64 170H1136" stroke="url(#industrial-accent-${widget.instanceId})" stroke-width="2"/>

        <g transform="translate(600 170)">
          <circle r="39" fill="${bg1}" stroke="${border}"/>
          <circle r="28" fill="none" stroke="url(#industrial-accent-${widget.instanceId})" stroke-dasharray="5 6"/>
          <circle class="pulse" r="6" fill="${primary}"/>
        </g>

        <!-- Dynamic nodes -->
        ${nodes}

        <rect x="1" y="1" width="1198" height="328" rx="18" fill="none" stroke="${secondary}" stroke-opacity=".6"/>
      </svg>
    `
  }
}
