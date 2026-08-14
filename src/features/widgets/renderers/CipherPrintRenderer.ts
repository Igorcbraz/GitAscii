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

export function renderCipherPrint(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const isDark = true
  const background = isDark ? '#17131A' : '#D4C4AB'
  const paper = isDark ? '#29212D' : '#F3E8D2'
  const paperLift = isDark ? '#332839' : '#FBF2E2'
  const ink = isDark ? '#F4E8D2' : '#35283A'
  const muted = isDark ? '#B9AAAF' : '#776B70'
  const rule = isDark ? '#594B5D' : '#B8A58F'
  const grape = isDark ? '#A47AAA' : '#68466E'
  const verdigris = isDark ? '#62A493' : '#337B6D'
  const vermilion = isDark ? '#D86A55' : '#B84837'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  const repos = data.repos || []
  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  if (layoutType === 'hero') {
    const heroRepos = repos.slice(0, 6)
    const heroCount = heroRepos.length

    const heroRows = heroRepos
      .map((layer: GitHubRepo, index: number) => {
        const yOffset = index * 43
        const accent = index % 2 === 0 ? verdigris : vermilion
        const name = escapeXml(shorten(layer.name, 22))
        const desc = escapeXml(shorten(layer.description || 'No description provided.', 60))
        const lang = escapeXml(
          shorten(
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
            12
          )
        ).toUpperCase()

        return `
      <g class="cipher-reveal" style="animation-delay:${90 + index * 55}ms">
        <circle cx="697" cy="${74 + yOffset}" r="7" fill="${paperLift}" stroke="${accent}"/><circle cx="697" cy="${74 + yOffset}" r="2" fill="${accent}"/>
        <text x="717" y="${71 + yOffset}" class="cipher-label" font-size="12" font-weight="800" fill="${ink}">${name}</text><text x="1138" y="${71 + yOffset}" text-anchor="end" class="cipher-mono" font-size="7.5" letter-spacing="1.4" fill="${accent}">${lang}</text>
        <text x="717" y="${89 + yOffset}" class="cipher-label" font-size="9" fill="${muted}">${desc}</text><path d="M717 ${98 + yOffset}H1138" stroke="${rule}"/>
      </g>`
      })
      .join('')

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" role="img" aria-label="${escapeXml((cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'user')} cipher print profile">
      <defs>
        <pattern id="cipher-paper-${widget.instanceId}" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${rule}" stroke-opacity=".13"/><circle cx="4" cy="4" r=".65" fill="${rule}" fill-opacity=".2"/></pattern>
        <pattern id="cipher-weave-${widget.instanceId}" width="72" height="24" patternUnits="userSpaceOnUse"><path d="M-18 12C0-3 18-3 36 12S72 27 90 12" fill="none" stroke="${grape}" stroke-opacity=".2"/><path d="M-18 12C0 27 18 27 36 12S72-3 90 12" fill="none" stroke="${verdigris}" stroke-opacity=".18"/></pattern>
        <g id="cipher-rosette-${widget.instanceId}" fill="none"><ellipse rx="96" ry="31" stroke="${grape}"/><ellipse rx="96" ry="31" transform="rotate(30)" stroke="${verdigris}"/><ellipse rx="96" ry="31" transform="rotate(60)" stroke="${grape}"/><ellipse rx="96" ry="31" transform="rotate(90)" stroke="${vermilion}"/><ellipse rx="96" ry="31" transform="rotate(120)" stroke="${grape}"/><ellipse rx="96" ry="31" transform="rotate(150)" stroke="${verdigris}"/><circle r="67" stroke="${rule}" stroke-dasharray="1 5"/><circle r="18" stroke="${vermilion}"/></g>
      </defs>
      <style>
        .cipher-display{font-family:Iowan Old Style,Palatino Linotype,Book Antiqua,Georgia,serif}.cipher-label{font-family:Avenir Next Condensed,Arial Narrow,sans-serif}.cipher-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .cipher-orbit{transform-box:fill-box;transform-origin:center;animation:cipher-orbit 22s linear infinite}.cipher-thread{stroke-dasharray:2 12;animation:cipher-thread 8s linear infinite}.cipher-reveal{animation:cipher-reveal .72s cubic-bezier(.2,.75,.2,1) both}
        @keyframes cipher-orbit{to{transform:rotate(360deg)}}@keyframes cipher-thread{to{stroke-dashoffset:-112}}@keyframes cipher-reveal{from{opacity:.18;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){.cipher-orbit,.cipher-thread,.cipher-reveal{animation:none}}
      </style>
      <rect width="1200" height="360" fill="${background}"/>
      <rect x="14" y="14" width="1172" height="332" rx="2" fill="${paper}" stroke="${rule}"/>
      <rect x="14" y="14" width="1172" height="332" fill="url(#cipher-paper-${widget.instanceId})"/>
      <rect x="28" y="28" width="620" height="304" fill="none" stroke="${rule}"/>
      <rect x="663" y="28" width="494" height="304" fill="${paperLift}" fill-opacity=".38" stroke="${rule}"/>
      <path d="M672 57H1145" stroke="${grape}"/>
      <path class="cipher-thread" d="M672 59H1145" stroke="${verdigris}" stroke-width="2"/>
      <g transform="translate(582 181)" opacity=".27"><use class="cipher-orbit" href="#cipher-rosette-${widget.instanceId}"/></g>
      <rect x="28" y="294" width="620" height="38" fill="url(#cipher-weave-${widget.instanceId})"/>
      <g class="cipher-reveal">
        <text x="52" y="51" class="cipher-mono" font-size="8" letter-spacing="2.5" fill="${verdigris}">CIPHER PRINT / OPEN SYSTEMS FOLIO</text>
        <text x="624" y="51" text-anchor="end" class="cipher-mono" font-size="8" letter-spacing="1.5" fill="${muted}">PLATE ${String(heroCount).padStart(2, '0')} · ${escapeXml(shorten(data.user?.location || 'EARTH', 15)).toUpperCase()} · UTC+0</text>
        <text x="52" y="83" class="cipher-label" font-size="12" font-weight="800" letter-spacing="2" fill="${grape}">${escapeXml(shorten((cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'USER', 15)).toUpperCase()}</text>
        <text x="49" y="137" class="cipher-display" font-size="36" font-weight="700" fill="${ink}">${escapeXml(shorten((cfg.customTitle ? String(cfg.customTitle) : data.user?.name) || (cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'User Profile', 25)).toUpperCase()}</text>
        <path d="M52 213H392" stroke="${vermilion}" stroke-width="3"/>
        <text x="52" y="241" class="cipher-label" font-size="11" fill="${muted}">${escapeXml(shorten((cfg.customBio ? String(cfg.customBio) : data.user?.bio) || 'Exploring the unknown.', 80))}</text>
        <text x="52" y="278" class="cipher-mono" font-size="8" letter-spacing="1.7" fill="${ink}">ROSETTE 06 / LAYER REGISTER 08</text>
      </g>
      <text x="687" y="48" class="cipher-display" font-size="16" font-style="italic" fill="${ink}">Flagship impressions</text>
      <text x="1138" y="48" text-anchor="end" class="cipher-mono" font-size="8" letter-spacing="1.4" fill="${muted}">${String(heroCount).padStart(2, '0')} IMPRESSIONS</text>
      ${heroRows}
      <circle cx="43" cy="315" r="3" fill="${primary}"/>
      <circle cx="55" cy="315" r="3" fill="${secondary}"/>
      <path d="M67 315H116" stroke="${ink}"/>
      <path d="M1145 315h-22m11-11v22" stroke="${vermilion}"/>
    </svg>
    `
  }

  const layers = repos.slice(0, 8)
  const count = layers.length

  const rows = layers
    .map((layer: GitHubRepo, index: number) => {
      const column = Math.floor(index / 4)
      const row = index % 4
      const x = 230 + column * 270
      const y = 85 + row * 50
      const accent = index % 2 === 0 ? verdigris : vermilion
      const name = escapeXml(shorten(layer.name, 16))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          15
        )
      )

      return `
        <g class="cipher-reveal" style="animation-delay:${index * 42}ms">
          <circle cx="${x}" cy="${y - 4}" r="9" fill="none" stroke="${accent}" stroke-dasharray="2 2"/>
          <text x="${x}" y="${y - 1}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7" fill="${accent}">${String(index + 1).padStart(2, '0')}</text>
          <text x="${x + 20}" y="${y - 7}" font-family="sans-serif" font-size="11" font-weight="800" fill="${ink}">${name}</text>
          <text x="${x + 20}" y="${y + 10}" font-family="sans-serif" font-size="8.5" fill="${muted}">${lang} · ★ ${layer.stargazers_count || 0}</text>
          <path d="M${x + 20} ${y + 18} H${x + 250}" stroke="${rule}" stroke-width="0.5"/>
        </g>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          .cipher-display { font-family: Georgia, serif; }
          .cipher-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
        <pattern id="cipher-paper-${widget.instanceId}" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0 H0 V28" fill="none" stroke="${rule}" stroke-opacity="0.13"/>
          <circle cx="4" cy="4" r="0.65" fill="${rule}" fill-opacity="0.2"/>
        </pattern>
      </defs>

      <rect width="800" height="330" fill="${background}"/>
      <rect x="10" y="10" width="780" height="310" fill="${paper}" stroke="${rule}" stroke-width="1"/>
      <rect x="10" y="10" width="780" height="310" fill="url(#cipher-paper-${widget.instanceId})"/>

      <!-- Rosette Rosace panel -->
      <g>
        <rect x="25" y="25" width="165" height="280" fill="${paperLift}" fill-opacity="0.48" stroke="${rule}"/>
        <text x="107" y="55" text-anchor="middle" class="cipher-mono" font-size="8" letter-spacing="2.2" fill="${verdigris}">ROSETTE INDEX</text>
        <text x="107" y="150" text-anchor="middle" class="cipher-display" font-size="56" font-weight="700" fill="${ink}">${String(count).padStart(2, '0')}</text>
        <text x="107" y="210" text-anchor="middle" class="cipher-mono" font-size="8" fill="${grape}">ENGRAVED INDEX</text>
        <path d="M50 230 H165" stroke="${vermilion}" stroke-width="1"/>
      </g>

      <!-- Ledger headers -->
      <g>
        <text x="210" y="42" class="cipher-display" font-size="16" font-style="italic" fill="${ink}">Ledger register</text>
        <text x="770" y="42" text-anchor="end" class="cipher-mono" font-size="8" letter-spacing="1.5" fill="${muted}">LEDGER // VOL. 01</text>
        <path d="M210 52 H770" stroke="${rule}" stroke-width="1"/>
        <path d="M480 60 V300" stroke="${rule}" stroke-width="1"/>
      </g>

      <!-- Ledger rows -->
      ${rows}
    </svg>
  `
}
