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

export function renderMetroMap(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 800)
  const height = Math.max(100, Number(widget?.size?.height) || 400)
  const cfg = widget?.config || {}

  const bg = '#0E1420'
  const ink = '#F2F5FA'
  const muted = '#7C8698'
  const panel = '#1A2232'
  const border = '#2A3446'

  const primary = (cfg.accentColor as string) || globalStyles?.accentColor || '#00A7D1'
  const secondary = (cfg.secondaryColor as string) || '#E84A8A'
  const purpleLine = '#7479AE'

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'
  const customTitle = (cfg.customTitle as string) || data?.user?.name || data?.user?.login || 'USER'

  const selectedRepos = Array.isArray(cfg.selectedRepos) ? (cfg.selectedRepos as string[]) : []
  const sortBy = (cfg.repoSortBy as string) || 'stars'
  const maxRepos = Number(cfg.maxRepos) || 12

  if (layoutType === 'hero') {
    const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(12, maxRepos))
    const totalInterchanges = layers.length
    const titleVal = escapeXml(customTitle).toLowerCase()

    const stationsHtml = layers
      .map((layer, index) => {
        let cx = 380
        let cy = 176
        if (index === 0) {
          cx = 380
          cy = 176
        } else if (index === 1) {
          cx = 620
          cy = 216
        } else if (index === 2) {
          cx = 940
          cy = 246
        } else if (index === 3) {
          cx = 300
          cy = 266
        } else if (index === 4) {
          cx = 800
          cy = 196
        } else if (index === 5) {
          cx = 200
          cy = 296
        } else {
          cx = 150 + (index - 6) * 100
          cy = index % 2 === 0 ? 236 : 176
        }

        const name = escapeXml(shorten(layer.name, 15))

        return `
          <g class="sans">
            <circle cx="${cx}" cy="${cy}" r="9" fill="${bg}" stroke="${ink}" stroke-width="3.5"/>
            <text transform="translate(${(cx + 7).toFixed(1)} ${(cy - 13).toFixed(1)}) rotate(-45)" font-size="11" font-weight="700" fill="${ink}">${name}</text>
          </g>
        `
      })
      .join('')

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet">
        <style>
          .sans{font-family:Helvetica,Arial,sans-serif}
          .flow{stroke-dasharray:4 22;animation:flow 14s linear infinite}
          .train{stroke-dasharray:1 99;animation:train 7s linear infinite}
          @keyframes flow{to{stroke-dashoffset:-260}}@keyframes train{to{stroke-dashoffset:-100}}
        </style>

        <rect width="1200" height="360" fill="${bg}"/>

        <!-- Header -->
        <g class="sans">
          <rect x="40" y="26" width="1120" height="96" rx="14" fill="${panel}" stroke="${border}"/>
          <circle cx="106" cy="74" r="30" fill="${primary}"/>
          <circle cx="106" cy="74" r="30" fill="none" stroke="${ink}" stroke-width="3"/>
          <text x="106" y="83" text-anchor="middle" font-size="26" font-weight="900" fill="${ink}">${String(totalInterchanges).padStart(2, '0')}</text>
          <text x="162" y="70" font-size="40" font-weight="900" letter-spacing="1" fill="${ink}">${titleVal}</text>
          <text x="162" y="102" font-size="15" letter-spacing="2" fill="${ink}" opacity=".75">METRO TRANSIT PROFILE</text>
          <text x="1132" y="102" text-anchor="end" font-size="10" letter-spacing="2" fill="${ink}" opacity=".6">METRO · ${escapeXml(cfg.customTitle ? String(cfg.customTitle) : data.user.login).toUpperCase()}</text>
        </g>

        <!-- Tracks -->
        <path d="M40 236H240L300 176H760L830 246H1094" fill="none" stroke="${primary}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M40 296H420L500 216H972" fill="none" stroke="${purpleLine}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M40 186H140L220 266H600L670 196H1094" fill="none" stroke="${secondary}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>

        <!-- Flow animations -->
        <path class="flow" d="M40 236H240L300 176H760L830 246H1094" fill="none" stroke="${bg}" stroke-width="3" stroke-linecap="round" opacity=".55"/>
        <path class="train" style="animation-duration:6.2s" pathLength="100" d="M40 236H240L300 176H760L830 246H1094" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
        <path class="train" style="animation-duration:7.3s;animation-delay:-1.7s" pathLength="100" d="M40 296H420L500 216H972" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
        <path class="train" style="animation-duration:8.4s;animation-delay:-3.4s" pathLength="100" d="M40 186H140L220 266H600L670 196H1094" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>

        <!-- End line caps -->
        <path d="M1094 236L1116 246L1094 256Z" fill="${primary}"/>
        <path d="M1094 186L1116 196L1094 206Z" fill="${secondary}"/>
        <rect x="972" y="207" width="18" height="18" rx="3" fill="${purpleLine}" stroke="${ink}" stroke-width="2"/>

        <!-- Stations -->
        ${stationsHtml}

        <!-- Footer -->
        <text x="40" y="344" class="sans" font-size="10" letter-spacing="1" fill="${muted}">${escapeXml(shorten((cfg.customBio ? String(cfg.customBio) : data.user.bio) || 'Transit System Directory Map', 95))}</text>
        <text x="1160" y="344" text-anchor="end" class="sans" font-size="9" letter-spacing="2" fill="${muted}">${totalInterchanges} INTERCHANGES</text>
      </svg>
    `
  } else {
    const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(15, maxRepos))

    const stationsHtml = layers
      .map((layer, index) => {
        let cx = 430
        let cy = 86
        const strokeColor = index % 3 === 0 ? primary : index % 3 === 1 ? purpleLine : secondary

        if (index === 0) {
          cx = 430
          cy = 86
        } else if (index === 1) {
          cx = 640
          cy = 86
        } else if (index === 2) {
          cx = 850
          cy = 86
        } else if (index === 3) {
          cx = 1060
          cy = 86
        } else if (index === 4) {
          cx = 444
          cy = 252
        } else if (index === 5) {
          cx = 598
          cy = 252
        } else if (index === 6) {
          cx = 752
          cy = 252
        } else if (index === 7) {
          cx = 906
          cy = 252
        } else if (index === 8) {
          cx = 1060
          cy = 252
        } else if (index === 9) {
          cx = 458
          cy = 148
        } else if (index === 10) {
          cx = 658.7
          cy = 148
        } else if (index === 11) {
          cx = 859.3
          cy = 148
        } else if (index === 12) {
          cx = 1060
          cy = 148
        } else {
          cx = 200 + (index - 13) * 100
          cy = 130
        }

        const name = escapeXml(shorten(layer.name, 15))

        return `
          <circle cx="${cx.toFixed(1)}" cy="${cy}" r="4.5" fill="${bg}" stroke="${strokeColor}" stroke-width="2.2"/>
          <text transform="translate(${(cx + 4).toFixed(1)} ${(cy - 9).toFixed(1)}) rotate(-45)" class="sans" font-size="8" fill="${ink}">${name}</text>
        `
      })
      .join('')

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 330" preserveAspectRatio="xMidYMid meet">
        <style>
          .sans{font-family:Helvetica,Arial,sans-serif}
          .flow{stroke-dasharray:4 22;animation:flow 14s linear infinite}
          .train{stroke-dasharray:1 99;animation:train 7s linear infinite}
          @keyframes flow{to{stroke-dashoffset:-260}}@keyframes train{to{stroke-dashoffset:-100}}
        </style>

        <rect width="1200" height="330" fill="${bg}"/>
        <text x="1160" y="40" text-anchor="end" class="sans" font-size="16" font-weight="900" letter-spacing="4" fill="${ink}">NETWORK MAP</text>
        <text x="1160" y="58" text-anchor="end" class="sans" font-size="9" letter-spacing="2" fill="${muted}">${escapeXml(customTitle).toUpperCase()} · 3 LINES</text>

        <!-- Line Tracks -->
        <path d="M84 130H130L174.0 86H1150" fill="none" stroke="${primary}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
        <path class="train" style="animation-duration:6.8s" pathLength="100" d="M84 130H130L174.0 86H1150" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>

        <path d="M84 146H170L276.0 252H1150" fill="none" stroke="${purpleLine}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
        <path class="train" style="animation-duration:7.7s;animation-delay:-1.4s" pathLength="100" d="M84 146H170L276.0 252H1150" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>

        <path d="M84 162H300L314.0 148H1150" fill="none" stroke="${secondary}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
        <path class="train" style="animation-duration:8.6s;animation-delay:-2.8s" pathLength="100" d="M84 162H300L314.0 148H1150" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>

        <!-- Depot box -->
        <g class="sans">
          <rect x="38" y="116" width="46" height="92" rx="6" fill="${panel}" stroke="${border}"/>
          <text transform="translate(66 190) rotate(-90)" font-size="9" letter-spacing="3" font-weight="700" fill="${ink}">DEPOT</text>
        </g>

        <!-- Directory Panel -->
        <g>
          <rect x="30" y="240" width="234" height="72" rx="6" fill="${bg}" stroke="${border}"/>
          <text x="42" y="256" class="sans" font-size="8" font-weight="700" letter-spacing="2" fill="${muted}">LINE DIRECTORY</text>
          <rect x="42" y="262" width="18" height="6" rx="3" fill="${primary}"/>
          <text x="68" y="270" class="sans" font-size="9" font-weight="700" fill="${ink}">Core loop</text>

          <rect x="42" y="278" width="18" height="6" rx="3" fill="${purpleLine}"/>
          <text x="68" y="286" class="sans" font-size="9" font-weight="700" fill="${ink}">Rust systems</text>

          <rect x="42" y="294" width="18" height="6" rx="3" fill="${secondary}"/>
          <text x="68" y="302" class="sans" font-size="9" font-weight="700" fill="${ink}">Agent tooling</text>
        </g>

        <!-- Stations -->
        ${stationsHtml}
      </svg>
    `
  }
}
