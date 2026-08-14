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
  const all = data.repos || []
  let filtered = [...all]

  if (selectedRepos && selectedRepos.length > 0) {
    filtered = all.filter((r) => selectedRepos.includes(r.name))
    filtered.sort((a, b) => selectedRepos.indexOf(a.name) - selectedRepos.indexOf(b.name))
  } else {
    if (sortBy === 'stars') {
      filtered.sort((a, b) => b.stargazers_count - a.stargazers_count)
    } else if (sortBy === 'forks') {
      filtered.sort((a, b) => b.forks_count - a.forks_count)
    } else if (sortBy === 'updated') {
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  return filtered.slice(0, maxCount)
}

export function renderBlueprint(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const isDark = true
  const backgroundTop = isDark ? '#0A2A4A' : '#F7F9FB'
  const backgroundBottom = isDark ? '#0D3358' : '#EFF3F7'
  const line = isDark ? '#E8F1F8' : '#1F4E79'
  const ink = isDark ? '#E8F1F8' : '#1F4E79'
  const muted = isDark ? '#9FB8CC' : '#54749B'
  const gridColor = isDark ? '#FFFFFF' : '#1F4E79'
  const fill = isDark ? '#0F3A63' : '#E7EEF5'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#00A7D1'
  const secondary = (cfg.secondaryColor as string) || '#E84A8A'

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'
  const customTitle =
    (cfg.customTitle as string) ||
    (cfg.customTitle ? String(cfg.customTitle) : data.user.name) ||
    (cfg.customTitle ? String(cfg.customTitle) : data.user.login) ||
    'USER'

  // Retrieve sorted/filtered repos
  const selectedRepos = Array.isArray(cfg.selectedRepos) ? (cfg.selectedRepos as string[]) : []
  const sortBy = (cfg.repoSortBy as string) || 'stars'
  const maxRepos = Number(cfg.maxRepos) || 8

  const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(8, maxRepos))
  const partsCount = String(layers.length).padStart(2, '0')
  const authorName = escapeXml(customTitle).toUpperCase()

  if (layoutType === 'hero') {
    // Exact hero layout from blueprint-output assets/hero-dark.svg
    const listG = layers
      .map((layer, index) => {
        const column = index % 3
        const row = Math.floor(index / 3)
        const x = 56 + column * 252
        const y = 102 + row * 118

        const color = index % 2 === 0 ? primary : secondary
        const name = escapeXml(shorten(layer.name, 22))

        return `
          <g>
            <path class="cline" d="M${x - 18} ${y + 29}H${x + 186}" stroke="${line}" stroke-opacity=".55" stroke-width=".8"/>
            <rect x="${x}" y="${y}" width="168" height="58" fill="${fill}" fill-opacity=".55" stroke="${line}" stroke-width="1.2"/>
            <path d="M${x + 8} ${y + 50}L${x + 24} ${y + 34}M${x + 8} ${y + 38}L${x + 20} ${y + 26}" stroke="${line}" stroke-opacity=".4" stroke-width=".7"/>
            <circle cx="${x + 84}" cy="${y + 29}" r="2.4" fill="none" stroke="${line}" stroke-width=".8"/>
            <circle cx="${x - 4}" cy="${y - 4}" r="12" fill="${backgroundTop}" stroke="${color}" stroke-width="1.6"/>
            <text x="${x - 4}" y="${y - 1}" text-anchor="middle" class="mono" font-size="9" font-weight="700" fill="${ink}">${String(index + 1).padStart(2, '0')}</text>
            <path d="M${x} ${y + 74}H${x + 168}" stroke="${line}" stroke-width=".8" marker-start="url(#bp-arr-${widget.instanceId})" marker-end="url(#bp-arr-${widget.instanceId})"/>
            <path d="M${x} ${y + 69}V${y + 79}M${x + 168} ${y + 69}V${y + 79}" stroke="${line}" stroke-width=".6"/>
            <text x="${x + 84}" y="${y + 88}" text-anchor="middle" class="mono" font-size="9" fill="${ink}">${name}</text>
          </g>
        `
      })
      .join('')

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="bp-bg-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${backgroundTop}"/>
            <stop offset="1" stop-color="${backgroundBottom}"/>
          </linearGradient>
          <pattern id="bp-grid-${widget.instanceId}" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0 V20" fill="none" stroke="${gridColor}" stroke-opacity=".08"/>
          </pattern>
          <pattern id="bp-grid-major-${widget.instanceId}" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M100 0H0 V100" fill="none" stroke="${gridColor}" stroke-opacity=".14"/>
          </pattern>
          <marker id="bp-arr-${widget.instanceId}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0L8 4L0 8Z" fill="${line}"/>
          </marker>
          <style>
            .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
            .cline{stroke-dasharray:14 4 2 4;animation:cdrift 14s linear infinite}
            @keyframes cdrift{to{stroke-dashoffset:-96}}
          </style>
        </defs>

        <rect width="1200" height="360" fill="url(#bp-bg-${widget.instanceId})"/>
        <rect x="10" y="10" width="1180" height="340" fill="none" stroke="${line}" stroke-width="1.5"/>
        <rect x="16" y="16" width="1168" height="328" fill="url(#bp-grid-${widget.instanceId})" stroke="${line}" stroke-width=".5"/>
        <rect x="16" y="16" width="1168" height="328" fill="url(#bp-grid-major-${widget.instanceId})"/>

        <text x="40" y="48" class="mono" font-size="14" font-weight="700" letter-spacing="3" fill="${ink}">${authorName} — GENERAL ARRANGEMENT</text>
        <text x="40" y="66" class="mono" font-size="9" letter-spacing="1.5" fill="${muted}">AI AGENT INFRASTRUCTURE GENERAL COMPONENT SCHEMATIC</text>
        <path d="M40 76H600" stroke="${line}" stroke-width=".7"/>
        <text x="1160" y="48" text-anchor="end" class="mono" font-size="9" letter-spacing="2" fill="${muted}">DWG NO. ${escapeXml(cfg.customTitle ? String(cfg.customTitle) : data.user.login).toUpperCase()}-001</text>

        <!-- Components -->
        ${listG}

        <!-- Technical Label Block -->
        <rect x="854" y="218" width="330" height="126" fill="${fill}" stroke="${line}" stroke-width="1.2"/>
        <path d="M954 218V344" stroke="${line}" stroke-width=".6"/>
        <path d="M854 218H1184" stroke="${line}" stroke-width=".6"/>
        <text x="864" y="232" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">DRAWN BY</text>
        <text x="962" y="232" class="mono" font-size="9.5" fill="${ink}">${authorName}</text>
        
        <path d="M854 239H1184" stroke="${line}" stroke-width=".6"/>
        <text x="864" y="253" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">PROJECT</text>
        <text x="962" y="253" class="mono" font-size="9.5" fill="${ink}">AI AGENT INFRASTRUCTURE</text>
        
        <path d="M854 260H1184" stroke="${line}" stroke-width=".6"/>
        <text x="864" y="274" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">LOCATION</text>
        <text x="962" y="274" class="mono" font-size="9.5" fill="${ink}">${escapeXml(data.user.location || 'ONLINE').toUpperCase()}</text>
        
        <path d="M854 281H1184" stroke="${line}" stroke-width=".6"/>
        <text x="864" y="295" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">SHEET</text>
        <text x="962" y="295" class="mono" font-size="9.5" fill="${ink}">01 OF 01</text>
        
        <path d="M854 302H1184" stroke="${line}" stroke-width=".6"/>
        <text x="864" y="316" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">REV</text>
        <text x="962" y="316" class="mono" font-size="9.5" fill="${ink}">08</text>
        
        <path d="M854 323H1184" stroke="${line}" stroke-width=".6"/>
        <text x="864" y="337" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">SCALE</text>
        <text x="962" y="337" class="mono" font-size="9.5" fill="${ink}">NTS</text>
      </svg>
    `
  } else {
    // Exact closed-loop layout from blueprint-output assets/closed-loop-dark.svg
    const explodedParts = layers
      .map((layer, index) => {
        const xOffset = 127.77 + index * 57.77
        const isOdd = index % 2 === 0
        const yCoord = isOdd ? 131 : 199
        const rectColor = index % 2 === 0 ? primary : secondary

        const pathD = isOdd ? `M${xOffset.toFixed(1)} 165V131` : `M${xOffset.toFixed(1)} 165V199`

        const shape = isOdd
          ? `<rect x="${(xOffset - 16).toFixed(1)}" y="118" width="32" height="26" fill="${fill}" fill-opacity=".6" stroke="${rectColor}" stroke-width="1.4"/>`
          : `<circle cx="${xOffset.toFixed(1)}" cy="199" r="15" fill="${fill}" fill-opacity=".6" stroke="${rectColor}" stroke-width="1.4"/>`

        const numText = `<text x="${xOffset.toFixed(1)}" y="${isOdd ? '111' : '227'}" text-anchor="middle" class="mono" font-size="8.5" font-weight="700" fill="${ink}">${String(index + 1).padStart(2, '0')}</text>`

        const connLineY = isOdd ? 106 : 130
        const connector = `<path d="M${(xOffset + 18).toFixed(1)} ${yCoord}L615 ${yCoord}L637 ${connLineY}L640 ${connLineY}" fill="none" stroke="${line}" stroke-width=".6" stroke-opacity=".65"/>`

        return `
          <g>
            <path d="${pathD}" stroke="${line}" stroke-width=".7" stroke-dasharray="3 3"/>
            ${shape}
            ${numText}
            ${connector}
            <circle cx="${(xOffset + 18).toFixed(1)}" cy="${yCoord}" r="1.6" fill="${line}"/>
          </g>
        `
      })
      .join('')

    const partSpecRows = layers
      .map((layer, index) => {
        const y = 112 + index * 24
        const color = index % 2 === 0 ? primary : secondary
        const specName = escapeXml(shorten(layer.name, 16))
        const specDesc = escapeXml(
          shorten(
            layer.description ||
              (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
              layer.language ||
              'Module part specifications',
            36
          )
        )
        return `
          <text x="650" y="${y}" class="mono" font-size="9" font-weight="700" fill="${color}">${String(index + 1).padStart(2, '0')}</text>
          <text x="688" y="${y}" class="mono" font-size="9" fill="${ink}">${specName}</text>
          <text x="850" y="${y}" class="mono" font-size="8.5" fill="${muted}">${specDesc}</text>
          <path d="M640 ${y + 6}H1160" stroke="${line}" stroke-width=".5" stroke-opacity=".7"/>
        `
      })
      .join('')

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 330" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="bp-bg-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${backgroundTop}"/>
            <stop offset="1" stop-color="${backgroundBottom}"/>
          </linearGradient>
          <pattern id="bp-grid-${widget.instanceId}" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0 V20" fill="none" stroke="${gridColor}" stroke-opacity=".08"/>
          </pattern>
          <pattern id="bp-grid-major-${widget.instanceId}" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M100 0H0 V100" fill="none" stroke="${gridColor}" stroke-opacity=".14"/>
          </pattern>
          <marker id="bp-arr-${widget.instanceId}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0L8 4L0 8Z" fill="${line}"/>
          </marker>
          <style>
            .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
            .cline{stroke-dasharray:14 4 2 4;animation:cdrift 14s linear infinite}
            @keyframes cdrift{to{stroke-dashoffset:-96}}
          </style>
        </defs>

        <rect width="1200" height="330" fill="url(#bp-bg-${widget.instanceId})"/>
        <rect x="10" y="10" width="1180" height="310" fill="none" stroke="${line}" stroke-width="1.5"/>
        <rect x="16" y="16" width="1168" height="298" fill="url(#bp-grid-${widget.instanceId})" stroke="${line}" stroke-width=".5"/>
        <rect x="16" y="16" width="1168" height="298" fill="url(#bp-grid-major-${widget.instanceId})"/>

        <text x="40" y="46" class="mono" font-size="12" font-weight="700" letter-spacing="3" fill="${ink}">EXPLODED ASSEMBLY — ${partsCount} PARTS</text>
        <text x="40" y="62" class="mono" font-size="8.5" letter-spacing="1.5" fill="${muted}">${authorName}</text>
        
        <path class="cline" d="M50 165H610" stroke="${line}" stroke-opacity=".55" stroke-width=".9"/>
        <path d="M610 165H618" stroke="${line}" stroke-width=".9" marker-end="url(#bp-arr-${widget.instanceId})"/>

        <!-- Rendered parts assemblies -->
        ${explodedParts}

        <!-- Part Specifications Ledger Table -->
        <rect x="640" y="72" width="520" height="214" fill="${fill}" fill-opacity=".5" stroke="${line}" stroke-width="1.2"/>
        <text x="650" y="87" class="mono" font-size="8" letter-spacing="2" fill="${ink}">NO.</text>
        <text x="688" y="87" class="mono" font-size="8" letter-spacing="2" fill="${ink}">PART</text>
        <text x="850" y="87" class="mono" font-size="8" letter-spacing="2" fill="${ink}">SPECIFICATION (DESCRIPTION)</text>
        <path d="M680 72V286M842 72V286" stroke="${line}" stroke-width=".5"/>
        <path d="M640 94H1160" stroke="${line}" stroke-width=".5" stroke-opacity=".7"/>

        ${partSpecRows}

        <text x="40" y="306" class="mono" font-size="8" letter-spacing="2" fill="${muted}">ALL DIMENSIONS NOMINAL · DO NOT SCALE DRAWING</text>
      </svg>
    `
  }
}
