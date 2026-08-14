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

export function renderFoundry(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const isDark = true
  const background = isDark ? '#0B0908' : '#D6D0C2'
  const paper = isDark ? '#151010' : '#E9E2D1'
  const panel = isDark ? '#201713' : '#F4EDDC'
  const ink = isDark ? '#F6EDDB' : '#241B11'
  const muted = isDark ? '#A99C86' : '#706050'
  const rule = isDark ? '#3F3226' : '#B1A58C'
  const ember = isDark ? '#FF7C1E' : '#BE4D0C'
  const quench = isDark ? '#66A9CC' : '#34637D'
  const iron = isDark ? '#8B95A2' : '#57626E'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  if (layoutType === 'hero') {
    const repos = data.repos || []
    const layers = repos.slice(0, 6)
    const count = layers.length

    const nameParts = (cfg.customTitle ? String(cfg.customTitle) : data.user?.name)
      ? (cfg.customTitle ? String(cfg.customTitle) : data.user?.name || '').split(' ')
      : ['AI AGENT', 'INFRASTRUCTURE']
    const nameLine1 = escapeXml((nameParts[0] || 'AI').toUpperCase())
    const nameLine2 = escapeXml((nameParts.slice(1).join(' ') || 'INFRASTRUCTURE').toUpperCase())

    const rows = layers
      .map((layer: GitHubRepo, index: number) => {
        const y = 70 + index * 44
        const startY = 151.5 + index * 9
        const accent = index % 2 === 0 ? ember : quench
        const name = escapeXml(shorten(layer.name, 22))
        const desc = escapeXml(shorten(layer.description || 'No description provided.', 56))
        const lang = escapeXml(
          shorten(
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
              layer.language ||
              'EXTEND',
            15
          )
        ).toUpperCase()

        return `
      <g class="forge-rise" style="animation-delay:${100 + index * 55}ms">
        <path d="M585 ${startY}C622 ${startY} 644 ${y} 686 ${y}" fill="none" stroke="${accent}" stroke-opacity=".72"/>
        <path class="forge-pour" d="M585 ${startY}C622 ${startY} 644 ${y} 686 ${y}" fill="none" stroke="${ember}" stroke-width="1.5"/>
        <use href="#forge-ingot-${widget.instanceId}" transform="translate(700 ${y})"/>
        <circle class="forge-spark" style="animation-delay:${(index * 0.43).toFixed(2)}s" cx="714" cy="${y - 9}" r="1.8" fill="${ember}"/>
        <text x="724" y="${y - 4}" class="forge-label" font-size="12" font-weight="800" fill="${ink}">${name}</text>
        <text x="1142" y="${y - 4}" text-anchor="end" class="forge-mono" font-size="7.5" letter-spacing="1.3" fill="${accent}">${lang}</text>
        <text x="724" y="${y + 13}" class="forge-label" font-size="8.7" fill="${muted}">${desc}</text>
        <path d="M724 ${y + 22}H1142" stroke="${rule}"/>
      </g>`
      })
      .join('')

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet" data-mode="dark">
      <defs>
        <pattern id="forge-grit-${widget.instanceId}" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="8" r="1" fill="${rule}" fill-opacity=".3"/>
          <circle cx="24" cy="26" r=".8" fill="${rule}" fill-opacity=".22"/>
        </pattern>
        <filter id="forge-heat-${widget.instanceId}" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="7"/>
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .03 0"/>
        </filter>
        <g id="forge-ingot-${widget.instanceId}">
          <path d="M-11 6H11L8-6H-8Z" fill="none" stroke="${iron}" stroke-width="1.6"/>
          <path d="M-6 6L-4-6M4-6L6 6" stroke="${iron}" stroke-opacity=".55"/>
        </g>
      </defs>
      <style>
        .forge-serif{font-family:Iowan Old Style,Palatino Linotype,Book Antiqua,Georgia,serif}.forge-label{font-family:Avenir Next Condensed,Arial Narrow,sans-serif}.forge-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .forge-pour{stroke-dasharray:8 12;animation:forge-pour 5.5s linear infinite}.forge-glow{animation:forge-glow 2.8s ease-in-out infinite}.forge-spark{transform-box:fill-box;transform-origin:center;animation:forge-spark 3.1s ease-in-out infinite}.forge-rise{animation:forge-rise .62s cubic-bezier(.2,.75,.2,1) both}
        @keyframes forge-pour{to{stroke-dashoffset:-140}}@keyframes forge-glow{50%{opacity:.45}}@keyframes forge-spark{0%,100%{transform:translateY(0);opacity:.9}55%{transform:translateY(-5px);opacity:.35}}@keyframes forge-rise{from{opacity:.16;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){.forge-pour,.forge-glow,.forge-spark,.forge-rise{animation:none}}
      </style>
      <rect width="1200" height="360" fill="${background}"/>
      <rect x="14" y="14" width="1172" height="332" fill="${paper}" stroke="${rule}"/>
      <rect x="14" y="14" width="1172" height="332" fill="url(#forge-grit-${widget.instanceId})"/>
      <rect x="14" y="14" width="1172" height="332" filter="url(#forge-heat-${widget.instanceId})" opacity=".42" pointer-events="none"/>
      
      <rect x="30" y="30" width="500" height="300" fill="${panel}" fill-opacity=".6" stroke="${rule}"/>
      <path d="M545 30V330" stroke="${rule}"/>
      <path d="M585 58V322" stroke="${iron}" stroke-opacity=".55"/>
      
      <path d="M448 54H492L486 72H454Z" fill="none" stroke="${iron}" stroke-width="2"/>
      <path class="forge-pour" d="M470 74C474 130 466 210 452 268" fill="none" stroke="${ember}" stroke-width="3"/>
      <circle class="forge-spark" cx="484" cy="150" r="1.9" fill="${ember}"/>
      <circle class="forge-spark" style="animation-delay:.9s" cx="458" cy="205" r="1.6" fill="${ember}"/>
      <circle class="forge-glow" cx="452" cy="272" r="4.5" fill="${ember}"/>
      <use href="#forge-ingot-${widget.instanceId}" transform="translate(452 290)"/>
      <use href="#forge-ingot-${widget.instanceId}" transform="translate(492 290)"/>
      
      <g class="forge-rise">
        <text x="50" y="49" class="forge-mono" font-size="8" letter-spacing="2.3" fill="${ember}">FOUNDRY / CASTING FLOOR</text>
        <text x="50" y="82" class="forge-label" font-size="12" font-weight="800" letter-spacing="2" fill="${ink}">${escapeXml(((cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'LIFCC').toUpperCase())}</text>
        <text x="48" y="133" class="forge-serif" font-size="36" font-weight="700" fill="${ink}">${nameLine1}</text>
        <text x="48" y="169" class="forge-serif" font-size="36" font-style="italic" fill="${ink}">${nameLine2}</text>
        <path d="M50 210H132" stroke="${ember}" stroke-width="4"/>
        <text x="50" y="238" class="forge-label" font-size="11" fill="${muted}">${escapeXml(shorten((cfg.customBio ? String(cfg.customBio) : data.user?.bio) || 'Building the systems around coding agents...', 65))}</text>
        <text x="50" y="276" class="forge-mono" font-size="8" letter-spacing="1.5" fill="${ink}">${String(count).padStart(2, '0')} CASTS POURED · 08 ALLOY LAYERS</text>
        <text x="50" y="304" class="forge-mono" font-size="8" letter-spacing="1.6" fill="${muted}">${escapeXml((data.user?.location || 'YARD / BEIJING · UTC+8').toUpperCase())}</text>
      </g>
      
      <text x="660" y="47" class="forge-serif" font-size="16" font-style="italic" fill="${ink}">Master casts</text>
      <text x="1142" y="47" text-anchor="end" class="forge-mono" font-size="8" letter-spacing="1.4" fill="${muted}">HEAT / MAJIAYU000</text>
      
      ${rows}
      
      <circle cx="500" cy="315" r="3" fill="${primary}"/>
      <circle cx="512" cy="315" r="3" fill="${secondary}"/>
    </svg>`
  }

  const repos = data.repos || []
  const layers = repos.slice(0, 8)
  const count = layers.length

  const rows = layers
    .map((layer: GitHubRepo, index: number) => {
      const column = Math.floor(index / 4)
      const row = index % 4
      const x = 250 + column * 270
      const y = 85 + row * 50
      const accent = index % 2 === 0 ? ember : quench
      const name = escapeXml(shorten(layer.name, 16))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          15
        )
      )

      return `
        <g class="forge-rise" style="animation-delay:${index * 42}ms">
          <rect x="${x - 11}" y="${y - 8}" width="22" height="12" fill="none" stroke="${iron}" stroke-width="1.2" transform="translate(0, 4)"/>
          <path d="M${x - 6} ${y + 2} L${x - 4} ${y - 10} M${x + 4} ${y - 10} L${x + 6} ${y + 2}" stroke="${iron}" stroke-opacity="0.55" transform="translate(0, 4)"/>
          <text x="${x + 18}" y="${y - 8}" font-family="ui-monospace, monospace" font-size="7.5" fill="${accent}">${String(index + 1).padStart(2, '0')} / ${name.toUpperCase()}</text>
          <text x="${x + 18}" y="${y + 8}" font-family="sans-serif" font-size="11" font-weight="800" fill="${ink}">${lang}</text>
          <text x="${x + 18}" y="${y + 20}" font-family="sans-serif" font-size="8.5" fill="${muted}">★ ${layer.stargazers_count || 0}</text>
          <path d="M${x + 18} ${y + 26} H${x + 250}" stroke="${rule}" stroke-width="0.5"/>
        </g>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          .forge-serif { font-family: Georgia, serif; }
          .forge-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
        <pattern id="forge-grit-${widget.instanceId}" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="8" r="1" fill="${rule}" fill-opacity="0.3"/>
          <circle cx="24" cy="26" r="0.8" fill="${rule}" fill-opacity="0.22"/>
        </pattern>
      </defs>

      <rect width="800" height="330" fill="${background}"/>
      <rect x="10" y="10" width="780" height="310" fill="${paper}" stroke="${rule}" stroke-width="1"/>
      <rect x="10" y="10" width="780" height="310" fill="url(#forge-grit-${widget.instanceId})"/>

      <!-- Crucible panel -->
      <g>
        <rect x="29" y="29" width="185" height="272" fill="${panel}" fill-opacity="0.64" stroke="${rule}"/>
        <text x="121" y="54" text-anchor="middle" class="forge-mono" font-size="8" letter-spacing="2.1" fill="${ember}">CRUCIBLE</text>
        <text x="121" y="91" text-anchor="middle" class="forge-serif" font-size="21" font-style="italic" fill="${ink}">Casting floor</text>
        
        <!-- Molten pour animation indicator -->
        <path d="M121 110 V130" fill="none" stroke="${ember}" stroke-width="3"/>
        
        <text x="121" y="222" text-anchor="middle" class="forge-serif" font-size="52" font-weight="700" fill="${ink}">${String(count).padStart(2, '0')}</text>
        <text x="121" y="246" text-anchor="middle" class="forge-mono" font-size="8" letter-spacing="1.8" fill="${ember}">ALLOYS SMELTED</text>
      </g>

      <!-- Ledger titles -->
      <g>
        <text x="250" y="40" class="forge-mono" font-size="10" letter-spacing="2" fill="${ember}">FOUNDRY / ALLOY LEDGER</text>
        <text x="770" y="40" text-anchor="end" class="forge-mono" font-size="8" letter-spacing="1.4" fill="${muted}">CASTING FLOOR // VOL. 01</text>
        <path d="M250 52 H770" stroke="${rule}" stroke-width="1"/>
        <path d="M480 61 V300" stroke="${rule}" stroke-width="1"/>
      </g>

      <!-- Alloy Ingot rows -->
      ${rows}
    </svg>
  `
}
