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

export function renderFieldSpecimen(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const isDark = true
  const background = isDark ? '#101916' : '#CFD2C7'
  const paper = isDark ? '#1B2722' : '#E8E9DE'
  const panel = isDark ? '#22312A' : '#F3F3E9'
  const ink = isDark ? '#E8E8DA' : '#24332C'
  const muted = isDark ? '#A7AFA4' : '#68736B'
  const rule = isDark ? '#47574E' : '#AAB2A8'
  const pine = isDark ? '#699078' : '#315D49'
  const oxide = isDark ? '#C56350' : '#A74838'
  const mineral = isDark ? '#6992A8' : '#3E718E'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  const repos = data.repos || []

  if (layoutType === 'hero') {
    const heroRepos = repos.slice(0, 6)
    const heroRows = heroRepos
      .map((repo: GitHubRepo, index: number) => {
        const y1 = 151.5 + index * 9
        const y2 = 70 + index * 44
        const name = escapeXml(shorten(repo.name, 25))
        const desc = escapeXml(shorten(repo.description || 'Pinned system', 60))
        const lang = escapeXml(shorten(repo.language || 'EXTEND', 15)).toUpperCase()
        const c = index < 2 ? pine : oxide
        return `
      <g class="field-rise" style="animation-delay:${100 + index * 55}ms">
        <path d="M625 ${y1}C668 ${y1} 691 ${y2} 733 ${y2}" fill="none" stroke="${c}" stroke-opacity=".72"/>
        <path class="field-trace" d="M625 ${y1}C668 ${y1} 691 ${y2} 733 ${y2}" fill="none" stroke="${mineral}" stroke-width="1.5"/>
        <g transform="translate(741 ${y2})"><use class="field-pin" style="animation-delay:${(index * 0.31).toFixed(2)}s" href="#field-specimen-pin-${widget.instanceId}"/></g>
        <text x="763" y="${y2 - 4}" class="field-label" font-size="12" font-weight="800" fill="${ink}">${name}</text>
        <text x="1142" y="${y2 - 4}" text-anchor="end" class="field-mono" font-size="7.5" letter-spacing="1.3" fill="${c}">${lang}</text>
        <text x="763" y="${y2 + 13}" class="field-label" font-size="8.7" fill="${muted}">${desc}</text>
        <path d="M763 ${y2 + 22}H1142" stroke="${rule}"/>
      </g>`
      })
      .join('')

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="field-grid-${widget.instanceId}" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${rule}" stroke-opacity=".12"/><path d="M5 28l4-4M23 8l4-4" stroke="${mineral}" stroke-opacity=".13"/></pattern>
        <filter id="field-mineral-${widget.instanceId}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="11"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .032 0"/></filter>
        <g id="field-specimen-pin-${widget.instanceId}"><path d="M0-9V9" stroke="${oxide}"/><circle cy="-10" r="3.2" fill="${oxide}"/><path d="M-5 9H5" stroke="${mineral}"/></g>
      </defs>
      <style>
        .field-serif{font-family:Iowan Old Style,Palatino Linotype,Book Antiqua,Georgia,serif}.field-label{font-family:Avenir Next Condensed,Arial Narrow,sans-serif}.field-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .field-trace{stroke-dasharray:4 8;animation:field-trace 9s linear infinite}.field-pin{transform-box:fill-box;transform-origin:center;animation:field-pin 3.8s ease-in-out infinite}.field-rise{animation:field-rise .68s cubic-bezier(.2,.75,.2,1) both}
        @keyframes field-trace{to{stroke-dashoffset:-120}}@keyframes field-pin{50%{opacity:.45;transform:scale(.78)}}@keyframes field-rise{from{opacity:.18;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){.field-trace,.field-pin,.field-rise{animation:none}}
      </style>
      <rect width="1200" height="360" fill="${background}"/>
      <rect x="14" y="14" width="1172" height="332" fill="${paper}" stroke="${rule}"/>
      <rect x="14" y="14" width="1172" height="332" fill="url(#field-grid-${widget.instanceId})"/>
      <rect x="14" y="14" width="1172" height="332" filter="url(#field-mineral-${widget.instanceId})" opacity=".42" pointer-events="none"/>
      <rect x="30" y="30" width="520" height="300" fill="${panel}" fill-opacity=".58" stroke="${rule}"/>
      <path d="M50 58H526" stroke="${mineral}"/>
      <path d="M565 30V330" stroke="${rule}"/>
      <g fill="none" stroke-linecap="round">
        <path d="M605 309C599 268 633 235 621 194C609 153 630 116 650 80C659 63 661 47 659 35" stroke="${pine}" stroke-width="3"/>
        <path class="field-trace" d="M605 309C599 268 633 235 621 194C609 153 630 116 650 80C659 63 661 47 659 35" stroke="${mineral}" stroke-width="1.5"/>
        <path d="M623 196C597 182 582 163 574 141M632 116C609 105 595 89 586 69M616 244C638 232 651 216 659 197" stroke="${pine}" stroke-width="1.4"/>
        <circle cx="574" cy="141" r="3" fill="${oxide}" stroke="none"/><circle cx="586" cy="69" r="3" fill="${mineral}" stroke="none"/><circle cx="659" cy="197" r="3" fill="${oxide}" stroke="none"/>
      </g>
      <g class="field-rise">
        <text x="50" y="49" class="field-mono" font-size="8" letter-spacing="2.3" fill="${mineral}">FIELD SPECIMEN / SYSTEMATIC INDEX</text>
        <text x="50" y="82" class="field-label" font-size="12" font-weight="800" letter-spacing="2" fill="${pine}">${escapeXml((cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'LIFCC').toUpperCase()}</text>
        <text x="48" y="133" class="field-serif" font-size="36" font-weight="700" fill="${ink}">${escapeXml((cfg.customTitle ? String(cfg.customTitle) : data.user?.name) ? shorten(cfg.customTitle ? String(cfg.customTitle) : data.user?.name || '', 15).toUpperCase() : 'AI AGENT')}</text>
        <text x="48" y="169" class="field-serif" font-size="36" font-style="italic" fill="${ink}">SPECIMEN</text>
        <path d="M50 210H132" stroke="${oxide}" stroke-width="4"/>
        <text x="50" y="238" class="field-label" font-size="11" fill="${muted}">${escapeXml(shorten((cfg.customBio ? String(cfg.customBio) : data.user?.bio) || 'Building the systems around coding agents', 70))}</text>
        <text x="50" y="276" class="field-mono" font-size="8" letter-spacing="1.5" fill="${ink}">${String(heroRepos.length).padStart(2, '0')} SPECIMENS \u00B7 CLASSIFIED LAYERS</text>
        <text x="50" y="308" class="field-mono" font-size="8" letter-spacing="1.6" fill="${muted}">SITE / ${escapeXml(data.user?.location || 'UNKNOWN').toUpperCase()}</text>
      </g>
      <text x="763" y="47" class="field-serif" font-size="16" font-style="italic" fill="${ink}">Pinned systems</text>
      <text x="1142" y="47" text-anchor="end" class="field-mono" font-size="8" letter-spacing="1.4" fill="${muted}">CATALOG / ${escapeXml((cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'LIFCC').toUpperCase()}</text>
      ${heroRows}
      <circle cx="526" cy="315" r="3" fill="${primary}"/><circle cx="514" cy="315" r="3" fill="${secondary}"/><path d="M50 319H94m-22-8v16" stroke="${oxide}"/>
    </svg>
    `
  }

  const layers = repos.slice(0, 8)
  const count = layers.length

  const rows = layers
    .map((layer: GitHubRepo, index: number) => {
      const column = Math.floor(index / 4)
      const row = index % 4
      const x = 250 + column * 270
      const y = 85 + row * 50
      const color = index % 2 === 0 ? pine : oxide
      const name = escapeXml(shorten(layer.name, 16))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          15
        )
      )

      return `
        <g class="field-rise" style="animation-delay:${index * 42}ms">
          <circle cx="${x}" cy="${y - 4}" r="5" fill="${color}"/>
          <text x="${x + 15}" y="${y - 8}" font-family="ui-monospace, monospace" font-size="7.5" fill="${color}">${String(index + 1).padStart(2, '0')} / ${name.toUpperCase()}</text>
          <text x="${x + 15}" y="${y + 8}" font-family="sans-serif" font-size="11" font-weight="800" fill="${ink}">${lang}</text>
          <text x="${x + 15}" y="${y + 20}" font-family="sans-serif" font-size="8.5" fill="${muted}">★ ${layer.stargazers_count || 0}</text>
          <path d="M${x + 15} ${y + 26} H${x + 250}" stroke="${rule}" stroke-width="0.5"/>
        </g>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          .field-serif { font-family: Georgia, serif; }
          .field-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
        <pattern id="field-grid-${widget.instanceId}" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0 H0 V32" fill="none" stroke="${rule}" stroke-opacity="0.12"/>
        </pattern>
      </defs>

      <rect width="800" height="330" fill="${background}"/>
      <rect x="10" y="10" width="780" height="310" fill="${paper}" stroke="${rule}" stroke-width="1"/>
      <rect x="10" y="10" width="780" height="310" fill="url(#field-grid-${widget.instanceId})"/>

      <!-- Dichotomous Key Panel -->
      <g>
        <rect x="25" y="25" width="165" height="280" fill="${panel}" fill-opacity="0.62" stroke="${rule}"/>
        <text x="107" y="55" text-anchor="middle" class="field-mono" font-size="8" letter-spacing="2.1" fill="${mineral}">DICHOTOMOUS KEY</text>
        <text x="107" y="90" text-anchor="middle" class="field-serif" font-size="20" font-style="italic" fill="${ink}">Classification</text>
        
        <text x="107" y="180" text-anchor="middle" class="field-serif" font-size="52" font-weight="700" fill="${ink}">${String(count).padStart(2, '0')}</text>
        <text x="107" y="210" text-anchor="middle" class="field-mono" font-size="8" letter-spacing="1.8" fill="${oxide}">TAXA OBSERVED</text>
      </g>

      <!-- Taxonomy Headers -->
      <g>
        <text x="210" y="42" class="field-serif" font-size="16" font-style="italic" fill="${ink}">Classification plate</text>
        <text x="770" y="42" text-anchor="end" class="field-mono" font-size="8" letter-spacing="1.4" fill="${muted}">TAXONOMY // VOL. 01</text>
        <path d="M210 52 H770" stroke="${rule}" stroke-width="1"/>
        <path d="M480 60 V300" stroke="${rule}" stroke-width="1"/>
      </g>

      <!-- Specimen Rows -->
      ${rows}
    </svg>
  `
}
