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

export function renderBentoGrid(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 800)
  const height = Math.max(100, Number(widget?.size?.height) || 400)
  const cfg = widget?.config || {}

  const bg = '#080B0D'
  const board = '#101619'
  const moduleColor = '#182125'
  const raised = '#202C31'
  const textClr = '#EEF6F4'
  const muted = '#8BA19F'
  const trace = '#30494C'

  const primary = (cfg.accentColor as string) || globalStyles?.accentColor || '#00A7D1'
  const secondary = (cfg.secondaryColor as string) || '#E84A8A'

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'
  const customTitle = (cfg.customTitle as string) || data?.user?.name || data?.user?.login || 'USER'

  const selectedRepos = Array.isArray(cfg.selectedRepos) ? (cfg.selectedRepos as string[]) : []
  const sortBy = (cfg.repoSortBy as string) || 'stars'
  const maxRepos = Number(cfg.maxRepos) || 8

  if (layoutType === 'hero') {
    const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(3, maxRepos))
    const userTitle = escapeXml(customTitle).toUpperCase()
    const bioText = escapeXml(
      shorten(
        (cfg.customBio ? String(cfg.customBio) : data?.user?.bio) ||
          'Building the systems around coding agents — from skills and trust to memory a…',
        75
      )
    )

    const activeCount = String(layers.length).padStart(2, '0')

    const listModules = layers
      .map((layer, index) => {
        const x = 724 + index * 144
        const accent = index % 2 === 0 ? primary : secondary
        const name = escapeXml(shorten(layer.name, 15))
        const desc = escapeXml(shorten(layer.description || 'No description provided.', 45))

        return `
          <g class="boot" style="animation-delay:${(index * 90).toFixed(0)}ms" filter="url(#module-shadow-${widget.instanceId})">
            <path d="M${x} 23 H${x + 130} L${x + 144} 37 V114 H${x} Z" fill="${moduleColor}" stroke="${trace}" stroke-width="1"/>
            <path d="M${x} 30 H${x + 60}" stroke="${accent}" stroke-width="4"/>
            <circle cx="${x + 22}" cy="${67}" r="10" fill="none" stroke="${accent}"/>
            <circle cx="${x + 22}" cy="${67}" r="3" fill="${accent}"/>
            <text x="${x + 49}" y="${54}" font-family="sans-serif" font-size="15" font-weight="800" fill="${textClr}">${name}</text>
            <text x="${x + 49}" y="${75}" class="mono" font-size="8" letter-spacing="1.4" fill="${accent}">MODULE / PORT ${index + 1}</text>
            <text x="${x + 49}" y="${95}" font-family="sans-serif" font-size="10" fill="${muted}">${desc}</text>
            <path d="M${x + 425} 52v35" stroke="${trace}"/>
          </g>
        `
      })
      .join('')

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet">
        <defs>
          <style>
            .display { font-family: "Arial Narrow", "Avenir Next Condensed", Impact, sans-serif; }
            .body { font-family: "Avenir Next", Avenir, Helvetica, sans-serif; }
            .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
            .boot { animation: boot .65s cubic-bezier(.2,.8,.2,1); }
            .signal { stroke-dasharray: 4 8; animation: signal 7s linear infinite; }
            .dial { transform-box: fill-box; transform-origin: center; animation: dial 14s linear infinite; }
            @keyframes boot { from { opacity:.3; transform:translateY(7px) } to { opacity:1; transform:translateY(0) } }
            @keyframes signal { to { stroke-dashoffset:-120 } }
            @keyframes dial { to { transform:rotate(360deg) } }
          </style>
          <pattern id="perf-${widget.instanceId}" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.15" fill="${trace}" opacity=".5"/>
          </pattern>
          <linearGradient id="board-glow-${widget.instanceId}" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="${board}"/>
            <stop offset=".62" stop-color="${board}"/>
            <stop offset="1" stop-color="${primary}" stop-opacity=".07"/>
          </linearGradient>
          <filter id="module-shadow-${widget.instanceId}" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#000000" flood-opacity=".34"/>
          </filter>
        </defs>

        <rect width="1200" height="360" fill="${bg}"/>
        <rect x="10" y="10" width="1180" height="340" rx="12" fill="url(#board-glow-${widget.instanceId})" stroke="${trace}"/>
        <rect x="10" y="10" width="1180" height="340" rx="12" fill="url(#perf-${widget.instanceId})"/>

        <!-- Signals -->
        <path d="M690 48H706V68H724M690 156H706V176H724M690 264H706V284H724" fill="none" stroke="${trace}" stroke-width="2"/>
        <path class="signal" d="M690 48H706V68H724M690 156H706V176H724M690 264H706V284H724" fill="none" stroke="${primary}"/>

        <!-- Main Identity Module -->
        <g class="boot" filter="url(#module-shadow-${widget.instanceId})">
          <path d="M24 23 H672 L690 41 V254 H24 Z" fill="${moduleColor}" stroke="${trace}"/>
          <rect x="24" y="23" width="7" height="231" fill="${primary}"/>
          <text x="52" y="55" class="mono" font-size="8" letter-spacing="2" fill="${primary}">IDENTITY MODULE / ${escapeXml(cfg.customTitle ? String(cfg.customTitle) : data.user.login).toUpperCase()}</text>
          <text x="50" y="113" class="display" font-size="45" font-weight="900" letter-spacing="-.8" fill="${textClr}">${userTitle}</text>
          <text x="52" y="210" class="body" font-size="11" fill="${muted}">${bioText}</text>
          <path d="M52 226H456" stroke="${trace}"/>
          <text x="52" y="242" class="mono" font-size="8" letter-spacing="1.4" fill="${textClr}">OUTPUT / OPEN SOURCE SYSTEMS</text>

          <g transform="translate(620 80)">
            <circle r="35" fill="${raised}" stroke="${trace}"/>
            <circle class="dial" r="25" fill="none" stroke="${secondary}" stroke-width="4" stroke-dasharray="7 6"/>
            <circle r="8" fill="${secondary}"/>
            <path d="M0-20V-31" stroke="${textClr}" stroke-width="2"/>
          </g>
        </g>

        <!-- Stats modules -->
        <g class="boot" style="animation-delay:80ms" filter="url(#module-shadow-${widget.instanceId})">
          <path d="M24 271H210L228 289V337H24Z" fill="${raised}" stroke="${trace}"/>
          <text x="43" y="294" class="mono" font-size="8" letter-spacing="1.6" fill="${muted}">ACTIVE LAYERS</text>
          <text x="43" y="322" class="display" font-size="23" font-weight="900" fill="${primary}">${activeCount}</text>
          <circle cx="204" cy="313" r="4" fill="${primary}"/>
        </g>

        <g class="boot" style="animation-delay:120ms" filter="url(#module-shadow-${widget.instanceId})">
          <path d="M239 271H435L453 289V337H239Z" fill="${raised}" stroke="${trace}"/>
          <text x="258" y="294" class="mono" font-size="8" letter-spacing="1.6" fill="${muted}">SELECTED SYSTEMS</text>
          <text x="258" y="322" class="display" font-size="23" font-weight="900" fill="${secondary}">${activeCount}</text>
          <circle cx="428" cy="313" r="4" fill="${secondary}"/>
        </g>

        <g class="boot" style="animation-delay:160ms" filter="url(#module-shadow-${widget.instanceId})">
          <path d="M464 271H672L690 289V337H464Z" fill="${raised}" stroke="${trace}"/>
          <text x="483" y="294" class="mono" font-size="8" letter-spacing="1.6" fill="${muted}">WORKSTATION</text>
          <text x="483" y="320" class="mono" font-size="10" font-weight="700" fill="${textClr}">ACTIVE DEVELOPER</text>
          <path d="M650 297v20M642 307h16" stroke="${primary}"/>
        </g>

        <!-- Right Side Modules -->
        ${listModules}
      </svg>
    `
  } else {
    const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(8, maxRepos))
    const userTitle = escapeXml(customTitle).toUpperCase()
    const activeCount = String(layers.length).padStart(2, '0')

    const modules = layers
      .map((layer: GitHubRepo, index: number) => {
        const row = Math.floor(index / 4)
        const column = index % 4
        const x = 210 + column * 218
        const y = 43 + row * 87

        const accent = index % 2 === 0 ? primary : secondary
        const specName = escapeXml(shorten(layer.name, 16))
        const partType = escapeXml(
          (
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
            layer.language ||
            'EXTEND'
          ).toUpperCase()
        )

        return `
          <g class="boot" style="animation-delay: ${index * 45}ms" filter="url(#module-shadow-${widget.instanceId})">
            <path d="M${x} ${y} H${x + 166} L${x + 184} ${y + 18} V${y + 62} H${x} Z" fill="${moduleColor}" stroke="${trace}"/>
            <rect x="${x}" y="${y}" width="5" height="62" fill="${accent}"/>
            <text x="${x + 18}" y="${y + 22}" class="mono" font-size="7" letter-spacing="1.4" fill="${accent}">${String(index + 1).padStart(2, '0')} / ${partType}</text>
            <text x="${x + 18}" y="${y + 45}" class="body" font-size="11" font-weight="800" fill="${textClr}">${specName}</text>
            <circle cx="${x + 165}" cy="${y + 43}" r="3" fill="${accent}"/>
          </g>
        `
      })
      .join('')

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 330" preserveAspectRatio="xMidYMid meet">
        <defs>
          <style>
            .display { font-family: "Arial Narrow", "Avenir Next Condensed", Impact, sans-serif; }
            .body { font-family: "Avenir Next", Avenir, Helvetica, sans-serif; }
            .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
            @keyframes signal {
              to { stroke-dashoffset: -120; }
            }
            .signal { stroke-dasharray: 4 8; animation: signal 7s linear infinite; }
          </style>
          <pattern id="perf-${widget.instanceId}" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.15" fill="${trace}" opacity=".5"/>
          </pattern>
          <linearGradient id="boardGrad-${widget.instanceId}" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="${board}"/>
            <stop offset="100%" stop-color="${board}"/>
          </linearGradient>
          <filter id="module-shadow-${widget.instanceId}" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#000000" flood-opacity=".34"/>
          </filter>
        </defs>

        <rect width="1200" height="330" fill="${bg}"/>
        <rect x="10" y="10" width="1180" height="310" rx="12" fill="url(#boardGrad-${widget.instanceId})" stroke="${trace}"/>
        <rect x="10" y="10" width="1180" height="310" rx="12" fill="url(#perf-${widget.instanceId})"/>

        <!-- Sidebar Module Panel -->
        <g>
          <path d="M24 27H154L172 45V303H24Z" fill="${moduleColor}" stroke="${trace}"/>
          <text x="51" y="61" class="mono" font-size="8" letter-spacing="2" fill="${primary}">SIGNAL MAP</text>
          <text x="51" y="104" class="display" font-size="39" font-weight="900" fill="${textClr}">${activeCount}</text>
          <text x="51" y="123" class="mono" font-size="7" letter-spacing="1.4" fill="${muted}">MODULES ONLINE</text>
          <path d="M51 148H144" stroke="${trace}"/>

          <circle cx="58" cy="179" r="4" fill="${primary}"/>
          <text x="73" y="182" class="mono" font-size="7" letter-spacing="1.3" fill="${muted}">PRIMARY</text>

          <circle cx="58" cy="207" r="4" fill="${secondary}"/>
          <text x="73" y="210" class="mono" font-size="7" letter-spacing="1.3" fill="${muted}">SECONDARY</text>

          <path d="M51 237H144" stroke="${trace}"/>
          <text x="51" y="263" class="mono" font-size="7" letter-spacing="1.2" fill="${textClr}">BUS / 01</text>
          <text x="51" y="283" class="mono" font-size="7" letter-spacing="1.2" fill="${muted}">STATUS / LIVE</text>
        </g>

        <!-- Connections Network -->
        <path d="M302 72L520 72L738 72L956 72L326 159L544 159L762 159L980 159" fill="none" stroke="${trace}" stroke-width="5"/>
        <path class="signal" d="M302 72L520 72L738 72L956 72L326 159L544 159L762 159L980 159" fill="none" stroke="${primary}" stroke-width="2"/>

        <circle cx="302" cy="72" r="8" fill="${board}" stroke="${primary}"/>
        <circle cx="520" cy="72" r="8" fill="${board}" stroke="${primary}"/>
        <circle cx="738" cy="72" r="8" fill="${board}" stroke="${primary}"/>
        <circle cx="956" cy="72" r="8" fill="${board}" stroke="${primary}"/>
        <circle cx="326" cy="159" r="8" fill="${board}" stroke="${primary}"/>
        <circle cx="544" cy="159" r="8" fill="${board}" stroke="${primary}"/>
        <circle cx="762" cy="159" r="8" fill="${board}" stroke="${primary}"/>
        <circle cx="980" cy="159" r="8" fill="${board}" stroke="${primary}"/>

        <!-- Rendered Ingot Modules -->
        ${modules}

        <!-- Bottom stamp info -->
        <text x="1163" y="302" text-anchor="end" class="mono" font-size="7" letter-spacing="1.6" fill="${muted}">${userTitle} // CONNECTED WORKBENCH</text>
      </svg>
    `
  }
}
