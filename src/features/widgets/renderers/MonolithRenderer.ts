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

export function renderMonolith(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const isDark = true
  const background = isDark ? '#151411' : '#F0E8D9'
  const ink = isDark ? '#F0E8D9' : '#171613'
  const muted = isDark ? '#A0988C' : '#6E675D'
  const line = isDark ? '#4A463F' : '#BDB2A1'
  const mass = isDark ? '#E8DFCF' : '#1B1A17'
  const reverse = isDark ? '#151411' : '#F0E8D9'
  const red = isDark ? '#AD4935' : '#B24430'
  const blue = isDark ? '#365A72' : '#315A73'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  const repos = data.repos || []

  if (layoutType === 'hero') {
    const heroLayers = repos.slice(0, 6)
    const heroRows = heroLayers
      .map((layer: GitHubRepo, index: number) => {
        const col = Math.floor(index / 3)
        const row = index % 3
        const x = 754 + col * 220
        const y = 65 + row * 82
        const name = escapeXml(shorten(layer.name, 19))
        const lang = escapeXml(
          shorten(
            layer.description ||
              (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
              layer.language ||
              'Code',
            26
          )
        )
        const color = index % 2 === 0 ? red : blue
        const accent = index % 2 === 0 ? primary : secondary
        const langLabel = escapeXml(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'CODE'
        ).toUpperCase()

        return `
        <g class="monolith-rise" style="animation-delay:${120 + index * 55}ms">
          <path d="M${x} ${y}H${x + 190}" stroke="${line}"/>
          <rect x="${x}" y="${y + 4}" width="4" height="28" fill="${accent}"/>
          <text x="${x + 13}" y="${y + 14}" class="mono" font-size="7.5" letter-spacing="1.4" fill="${color}">${String(index + 1).padStart(2, '0')} / ${langLabel}</text>
          <text x="${x + 13}" y="${y + 33}" class="body" font-size="13" font-weight="700" fill="${ink}">${name}</text>
          <text x="${x + 13}" y="${y + 50}" class="body" font-size="8.5" fill="${muted}">${lang}</text>
        </g>`
      })
      .join('')

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="monolith profile">
      <defs>
        <style>
          .display { font-family: "Avenir Next Condensed", "Helvetica Neue Condensed", "Arial Narrow", sans-serif; }
          .body { font-family: "Gill Sans", "Trebuchet MS", sans-serif; }
          .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .monolith-rise { animation: monolith-rise-${widget.instanceId} .72s cubic-bezier(.2,.76,.2,1) both; }
          @keyframes monolith-rise-${widget.instanceId} { from { opacity: .18; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          @media (prefers-reduced-motion: reduce) { .monolith-rise { animation: none; } }
        </style>
      </defs>
      <rect width="1200" height="360" fill="${background}"/>
      <text x="-26" y="303" class="display" font-size="348" font-weight="900" letter-spacing="-34" fill="${mass}">M</text>
      <rect x="17" y="19" width="8" height="72" fill="${red}"/>
      <rect x="31" y="19" width="8" height="43" fill="${blue}"/>
      <text x="91" y="327" transform="rotate(-90 91 327)" class="mono" font-size="8" letter-spacing="4" fill="${reverse}">MASS / FORM / EVIDENCE</text>
      
      <g class="monolith-rise">
        <text x="252" y="34" class="mono" font-size="8" letter-spacing="2.5" fill="${red}">MONOLITH / MASS STUDY</text>
        <text x="706" y="34" text-anchor="end" class="mono" font-size="8" letter-spacing="1.8" fill="${muted}">${escapeXml((cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'LIFCC').toUpperCase()}</text>
        <path d="M252 48H706" stroke="${line}"/>
        <text x="248" y="121" class="display" font-size="43" font-weight="700" letter-spacing="-1.8" fill="${ink}">${escapeXml(shorten((cfg.customTitle ? String(cfg.customTitle) : data.user?.name) || (cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'AI AGENT INFRASTRUCTURE', 30))}</text>
        <path d="M252 232H292" stroke="${blue}" stroke-width="5"/>
        <text x="252" y="260" class="body" font-size="11" fill="${muted}">${escapeXml(shorten((cfg.customBio ? String(cfg.customBio) : data.user?.bio) || 'Building the systems around coding agents — from skills and trust to local-first memory.', 68))}</text>
      </g>
      
      <text x="754" y="34" class="mono" font-size="8" letter-spacing="2.2" fill="${blue}">PROOF INDEX / ${String(heroLayers.length).padStart(2, '0')}</text>
      
      ${heroRows}
      
      <path d="M236 316H1172" stroke="${line}"/>
      <rect x="236" y="313" width="78" height="6" fill="${red}"/>
      <rect x="314" y="313" width="42" height="6" fill="${blue}"/>
      
      <text x="706" y="337" text-anchor="end" class="mono" font-size="8" letter-spacing="1.6" fill="${ink}">${repos.length || 0} STRATA</text>
      <text x="1172" y="337" text-anchor="end" class="mono" font-size="8" letter-spacing="1.6" fill="${muted}">${heroLayers.length} FLAGSHIP WORKS</text>
      <text x="252" y="337" class="mono" font-size="8" letter-spacing="1.8" fill="${muted}">${escapeXml(data.user?.location || 'BEIJING · UTC+8').toUpperCase()}</text>
    </svg>
    `
  }

  const layers = repos.slice(0, 10)

  const rows = layers
    .map((layer: GitHubRepo, index: number) => {
      const column = Math.floor(index / 5)
      const row = index % 5
      const x = 320 + column * 230
      const y = 85 + row * 42
      const color = index % 2 === 0 ? red : blue
      const accent = index % 2 === 0 ? primary : secondary
      const name = escapeXml(shorten(layer.name, 17))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          15
        )
      )
      return `
        <g class="monolith-rise" style="animation-delay:${index * 45}ms">
          <path d="M${x} ${y + 22} H${x + 210}" stroke="${line}" stroke-width="0.8"/>
          <rect x="${x}" y="${y - 13}" width="3" height="30" fill="${accent}"/>
          <text x="${x + 13}" y="${y - 2}" font-family="ui-monospace, monospace" font-size="8" letter-spacing="1.5" fill="${color}">${String(index + 1).padStart(2, '0')}</text>
          <text x="${x + 40}" y="${y - 2}" font-family="sans-serif" font-size="11.5" font-weight="700" fill="${ink}">${name}</text>
          <text x="${x + 40}" y="${y + 12}" font-family="sans-serif" font-size="8.5" fill="${muted}">${lang} · ★ ${layer.stargazers_count || 0}</text>
        </g>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          .display { font-family: "Avenir Next Condensed", "Helvetica Neue Condensed", "Arial Narrow", sans-serif; }
          .body { font-family: "Gill Sans", "Trebuchet MS", sans-serif; }
          .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
      </defs>

      <rect width="800" height="330" fill="${background}"/>

      <!-- Stark Monolith Mass Block -->
      <g>
        <text x="-15" y="270" class="display" font-size="270" font-weight="900" letter-spacing="-20" fill="${mass}">${String(layers.length).padStart(2, '0')}</text>
        <rect x="18" y="18" width="7" height="66" fill="${red}"/>
        <rect x="32" y="18" width="7" height="38" fill="${blue}"/>
        <text x="80" y="307" transform="rotate(-90 80 307)" class="mono" font-size="8" letter-spacing="3.4" fill="${reverse}">ACTIVE STRATA</text>
      </g>

      <!-- Right column details -->
      <g>
        <text x="280" y="35" class="mono" font-size="8" letter-spacing="2.6" fill="${red}">MONOLITH / STRATA INDEX</text>
        <text x="770" y="35" text-anchor="end" class="mono" font-size="8" letter-spacing="1.8" fill="${muted}">COMPLETE INDEX // VOL. 01</text>
        <path d="M280 49 H770" stroke="${line}" stroke-width="1"/>
        <path d="M300 64 V300" stroke="${line}" stroke-width="1"/>
      </g>

      <!-- Ledger Rows -->
      ${rows}

      <!-- Bottom border indicator block -->
      <rect x="280" y="306" width="490" height="3" fill="${blue}"/>
      <rect x="280" y="306" width="100" height="3" fill="${red}"/>
    </svg>
  `
}
