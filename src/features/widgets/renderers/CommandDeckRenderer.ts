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

export function renderCommandDeck(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  // Industrial palette values
  const bg1 = '#07131A'
  const bg2 = '#10141F'
  const panel = '#0C1C24'
  const border = '#2B4A57'
  const textClr = '#E7F7FC'
  const muted = '#8BA9B5'

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

  if (layoutType === 'hero') {
    // 1200x360 layout adapted for widgets width x height
    const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(8, maxRepos))
    const flagships = layers.slice(0, 3)
    const userTitle = escapeXml(customTitle).toUpperCase()
    const bioText = escapeXml(
      shorten(
        (cfg.customBio ? String(cfg.customBio) : data.user.bio) ||
          'Building the systems around coding agents — from skills and trust to memory a…',
        65
      )
    )

    const activeCount = String(layers.length).padStart(2, '0')
    const flagshipCount = String(flagships.length).padStart(2, '0')

    const listModules = flagships
      .map((layer, index) => {
        const y = 72 + index * 74
        const accent = index === 2 ? secondary : primary
        const name = escapeXml(shorten(layer.name, 22))
        const lang = escapeXml(
          shorten(
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
              layer.language ||
              'EXTEND',
            15
          ).toUpperCase()
        )

        return `
          <g class="boot" style="animation-delay: ${(index * 0.18).toFixed(2)}s">
            <path d="M760 ${y} H1148 V${y + 55} H780 L760 ${y + 35} Z" fill="${panel}" fill-opacity=".88" stroke="${accent}" stroke-opacity=".72"/>
            <text x="778" y="${y + 20}" font-size="8" font-weight="700" letter-spacing="1.5" fill="${accent}">${String(index + 1).padStart(2, '0')} / ${lang}</text>
            <text x="778" y="${y + 39}" font-size="13" font-weight="800" fill="${textClr}">${name}</text>
            <text x="1131" y="${y + 39}" text-anchor="end" font-size="8" fill="${muted}">CHANNEL ${String(index + 1).padStart(2, '0')}</text>
            <circle class="pulse" cx="1129" cy="${y + 17}" r="3" fill="${accent}"/>
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
          .pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.4s ease-in-out infinite}
          .scan{animation:scan 5s ease-in-out infinite}
          .flicker{animation:flicker 2.2s ease-in-out infinite}
          .boot{animation:boot .8s cubic-bezier(.2,.8,.2,1) both}
          @keyframes pulse{50%{opacity:.35;transform:scale(.72)}}
          @keyframes scan{50%{opacity:.28;transform:translateX(24px)}}
          @keyframes flicker{50%{opacity:.38}}
          @keyframes boot{from{opacity:0}to{opacity:1}}
        </style>

        <rect width="1200" height="360" rx="18" fill="url(#industrial-bg-${widget.instanceId})"/>
        <rect width="1200" height="360" rx="18" fill="url(#industrial-grid-${widget.instanceId})" opacity=".68"/>
        
        <path d="M0 1H1200" stroke="url(#industrial-accent-${widget.instanceId})" stroke-width="2"/>
        <path d="M720 44V344" stroke="${border}"/>
        <path d="M730 44V344" stroke="#17313C"/>

        <!-- Header Panel -->
        <g transform="translate(20 22)">
          <circle cx="0" cy="0" r="4" fill="#EF4B5A"/>
          <circle cx="18" cy="0" r="4" fill="#E6A425"/>
          <circle cx="36" cy="0" r="4" fill="#22A447"/>
          <text x="58" y="4" class="micro" fill="${muted}">${escapeXml(cfg.customTitle ? String(cfg.customTitle) : data.user.login).toUpperCase()} / COMMAND_DECK</text>
        </g>
        <g transform="translate(1046 22)">
          <circle class="flicker" r="4" fill="${primary}" filter="url(#industrial-glow-${widget.instanceId})"/>
          <text x="14" y="4" class="micro" fill="${muted}">MISSION READY</text>
        </g>
        <path d="M0 44H1200" stroke="${border}"/>

        <!-- Main Body -->
        <g class="boot">
          <text x="38" y="82" class="label" fill="${primary}">// OPERATOR IDENTITY / SYSTEM COMMAND</text>
          <text x="38" y="139" font-size="43" font-weight="900" letter-spacing="-1.6" fill="${textClr}">${userTitle}</text>
          <text x="38" y="182" font-size="43" font-weight="900" letter-spacing="-1.6" fill="${textClr}">COMMAND CENTER</text>
          <path d="M38 223H650" stroke="${border}"/>
          <path class="scan" d="M38 223H270" stroke="${primary}" stroke-width="2"/>
          <text x="38" y="250" font-size="11" letter-spacing="1.5" fill="${muted}">${bioText}</text>

          <!-- Metrics blocks -->
          <g transform="translate(38 282)">
            <path d="M0 0H188L198 10V42H0Z" fill="${panel}" stroke="${border}"/>
            <text x="14" y="16" font-size="7" letter-spacing="1.5" fill="${muted}">LAYERS</text>
            <text x="14" y="34" font-size="15" font-weight="900" fill="${primary}">${activeCount}</text>
            <path d="M164 30h18" stroke="${primary}"/>
            <circle cx="182" cy="30" r="3" fill="${primary}"/>
          </g>
          <g transform="translate(243 282)">
            <path d="M0 0H188L198 10V42H0Z" fill="${panel}" stroke="${border}"/>
            <text x="14" y="16" font-size="7" letter-spacing="1.5" fill="${muted}">FLAGSHIPS</text>
            <text x="14" y="34" font-size="15" font-weight="900" fill="${secondary}">${flagshipCount}</text>
            <path d="M164 30h18" stroke="${secondary}"/>
            <circle cx="182" cy="30" r="3" fill="${secondary}"/>
          </g>
          <g transform="translate(448 282)">
            <path d="M0 0H188L198 10V42H0Z" fill="${panel}" stroke="${border}"/>
            <text x="14" y="16" font-size="7" letter-spacing="1.5" fill="${muted}">STATUS</text>
            <text x="14" y="34" font-size="15" font-weight="900" fill="${primary}">READY</text>
            <path d="M164 30h18" stroke="${primary}"/>
            <circle cx="182" cy="30" r="3" fill="${primary}"/>
          </g>
        </g>

        <!-- Right Side Signal Channels -->
        <text x="760" y="64" class="label" fill="${secondary}">FLAGSHIP CHANNELS</text>
        <text x="1148" y="64" text-anchor="end" class="micro" fill="${muted}">03 PRIORITY SIGNALS</text>
        ${listModules}

        <!-- Dial radar at bottom right -->
        <g transform="translate(1083 310)">
          <circle r="29" fill="${panel}" stroke="${border}"/>
          <circle r="20" fill="none" stroke="url(#industrial-accent-${widget.instanceId})" stroke-dasharray="5 5"/>
          <path d="M0-16V16M-16 0H16" stroke="${primary}"/>
          <circle class="pulse" r="4" fill="${secondary}"/>
        </g>
        <text x="760" y="322" class="micro" fill="${muted}">CONTROL BUS / ONLINE</text>
        <rect x="1" y="1" width="1198" height="358" rx="18" fill="none" stroke="${primary}" stroke-opacity=".72"/>
      </svg>
    `
  } else {
    // 1200x330 Closed-loop layout matching execution deck/closed-loop-dark.svg
    const layers = getSortedRepos(data, selectedRepos, sortBy, Math.min(8, maxRepos))
    const userTitle = escapeXml(customTitle).toUpperCase()
    const activeCount = String(layers.length).padStart(2, '0')

    const listModules = layers
      .map((layer, index) => {
        const isBottom = index % 2 !== 0
        const slot = Math.floor(index / 2) // 0, 1, 2, 3
        const x = 100 + slot * 333.3

        const yLine = isBottom ? 'V 208' : 'V 122'
        const cardY = isBottom ? 204 : 50

        const accent = index % 2 === 0 ? primary : secondary
        const name = escapeXml(shorten(layer.name, 18))
        const lang = escapeXml(
          (
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
            layer.language ||
            'EXTEND'
          ).toUpperCase()
        )

        return `
          <g>
            <path d="M${x.toFixed(1)} 164 ${yLine}" stroke="${accent}" stroke-opacity=".66"/>
            <circle cx="${x.toFixed(1)}" cy="164" r="4" fill="${accent}"/>
            <path d="M${(x - 82).toFixed(1)} ${cardY} H${(x + 72).toFixed(1)} L${(x + 82).toFixed(1)} ${cardY + 10} V${cardY + 56} H${(x - 82).toFixed(1)} Z" fill="${panel}" stroke="${accent}"/>
            <text x="${(x - 66).toFixed(1)}" y="${cardY + 20}" font-size="8" letter-spacing="1.2" fill="${accent}">${String(index + 1).padStart(2, '0')} / ${lang}</text>
            <text x="${(x - 66).toFixed(1)}" y="${cardY + 41}" font-size="10" font-weight="800" fill="${textClr}">${name}</text>
            <circle class="pulse" cx="${(x + 61).toFixed(1)}" cy="${cardY + 39}" r="3" fill="${accent}"/>
          </g>
        `
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
        
        <text x="28" y="33" class="label" fill="${primary}">${userTitle} / EXECUTION DECK</text>
        <text x="1170" y="33" text-anchor="end" class="micro" fill="${muted}">${activeCount} CHANNELS · STATUS READY</text>
        
        <path d="M42 164H1158" stroke="#2B4A57" stroke-width="5"/>
        <path class="flow" d="M42 164H1158" stroke="url(#industrial-accent-${widget.instanceId})" stroke-width="2"/>
        <path d="M42 151V177M1158 151V177" stroke="${primary}"/>

        <!-- Rendered channels -->
        ${listModules}

        <rect x="542" y="153" width="116" height="22" rx="4" fill="${bg1}" stroke="${border}"/>
        <text x="600" y="168" text-anchor="middle" font-size="8" font-weight="700" letter-spacing="2" fill="${muted}">COMMAND BUS</text>
        
        <rect x="1" y="1" width="1198" height="328" rx="18" fill="none" stroke="${secondary}" stroke-opacity=".6"/>
      </svg>
    `
  }
}
