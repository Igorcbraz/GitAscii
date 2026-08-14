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

export function renderCartograph(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const isDark = true
  const background = isDark ? '#081120' : '#D5CFB9'
  const paper = isDark ? '#0D1C33' : '#EAE3CC'
  const panel = isDark ? '#152847' : '#F4EEDA'
  const ink = isDark ? '#EDE5CB' : '#29302A'
  const muted = isDark ? '#8FA6C9' : '#6C6F5C'
  const rule = isDark ? '#27436E' : '#B8AD8D'
  const contour = isDark ? '#31598C' : '#C3B488'
  const sienna = isDark ? '#F2A83E' : '#A55E1B'
  const verdigris = isDark ? '#46C1A0' : '#2F705D'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  if (layoutType === 'hero') {
    const repos = data.repos || []
    const layers = repos.slice(0, 6)
    const count = layers.length

    const username = escapeXml(
      (cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'AI AGENT'
    ).toUpperCase()
    const bioText = escapeXml(
      shorten(
        (cfg.customBio ? String(cfg.customBio) : data.user?.bio) ||
          'Building the systems around coding agents...',
        70
      )
    )
    const locText = escapeXml((data.user?.location || 'BEIJING').toUpperCase())

    const nodes = layers
      .map((layer: GitHubRepo, index: number) => {
        const yPath = 151.5 + index * 9
        const yNode = 70 + index * 44
        const accent = index % 2 === 0 ? sienna : verdigris
        const name = escapeXml(shorten(layer.name, 35))
        const lang = escapeXml(
          shorten(
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
              layer.language ||
              'EXTEND',
            15
          )
        ).toUpperCase()
        const desc = escapeXml(shorten(layer.description || 'A GitHub repository.', 55))

        return `
      <g class="carto-rise" style="animation-delay:${100 + index * 55}ms">
        <path d="M560 ${yPath}C610 ${yPath} 640 ${yNode} 688 ${yNode}" fill="none" stroke="${accent}" stroke-opacity=".72"/>
        <path class="carto-trace" d="M560 ${yPath}C610 ${yPath} 640 ${yNode} 688 ${yNode}" fill="none" stroke="${contour}" stroke-width="1.5"/>
        <g transform="translate(700 ${yNode})"><use class="carto-beacon" style="animation-delay:${(index * 0.37).toFixed(2)}s" href="#carto-trig-${widget.instanceId}"/></g>
        <text x="722" y="${yNode - 4}" class="carto-label" font-size="12" font-weight="800" fill="${ink}">${name}</text>
        <text x="1142" y="${yNode - 4}" text-anchor="end" class="carto-mono" font-size="7.5" letter-spacing="1.3" fill="${accent}">${lang}</text>
        <text x="722" y="${yNode + 13}" class="carto-label" font-size="8.7" fill="${muted}">${desc}</text>
        <path d="M722 ${yNode + 22}H1142" stroke="${rule}"/>
      </g>`
      })
      .join('')

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" role="img" aria-label="${username} survey map profile" data-mode="dark">
      <defs>
        <pattern id="carto-grid-${widget.instanceId}" width="46" height="46" patternUnits="userSpaceOnUse">
          <path d="M46 0H0V46" fill="none" stroke="${rule}" stroke-opacity=".14"/>
        </pattern>
        <g id="carto-hill-${widget.instanceId}" fill="none" stroke="${contour}">
          <path d="M0-26C15-26 26-13 26 0C26 15 13 26 0 26C-15 26-26 13-26 0C-26-15-13-26 0-26Z"/>
          <path d="M0-15C9-15 15-8 15 0C15 9 8 15 0 15C-9 15-15 8-15 0C-15-9-8-15 0-15Z"/>
          <path d="M0-5C3-5 5-2 5 0C5 3 2 5 0 5C-3 5-5 2-5 0C-5-3-2-5 0-5Z"/>
        </g>
        <g id="carto-trig-${widget.instanceId}">
          <path d="M0-7L6 5H-6Z" fill="none" stroke="${sienna}" stroke-width="1.6"/>
          <circle cy="-1" r="1.4" fill="${sienna}"/>
        </g>
      </defs>
      <style>
        .carto-serif{font-family:Iowan Old Style,Palatino Linotype,Book Antiqua,Georgia,serif}.carto-label{font-family:Avenir Next Condensed,Arial Narrow,sans-serif}.carto-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .carto-trace{stroke-dasharray:6 10;animation:carto-trace-${widget.instanceId} 10s linear infinite}.carto-beacon{transform-box:fill-box;transform-origin:center;animation:carto-beacon-${widget.instanceId} 3.4s ease-in-out infinite}.carto-rise{animation:carto-rise-${widget.instanceId} .66s cubic-bezier(.2,.75,.2,1) both}
        @keyframes carto-trace-${widget.instanceId}{to{stroke-dashoffset:-160}}@keyframes carto-beacon-${widget.instanceId}{50%{opacity:.35;transform:scale(.72)}}@keyframes carto-rise-${widget.instanceId}{from{opacity:.15;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){.carto-trace,.carto-beacon,.carto-rise{animation:none}}
      </style>
      <rect width="1200" height="360" fill="${background}"/>
      <rect x="14" y="14" width="1172" height="332" fill="${paper}" stroke="${rule}"/>
      <rect x="14" y="14" width="1172" height="332" fill="url(#carto-grid-${widget.instanceId})"/>
      <rect x="30" y="30" width="500" height="300" fill="${panel}" fill-opacity=".58" stroke="${rule}"/>
      <use href="#carto-hill-${widget.instanceId}" transform="translate(430 240)" opacity=".55"/>
      <use href="#carto-hill-${widget.instanceId}" transform="translate(90 290) scale(.7)" opacity=".4"/>
      <path d="M545 30V330" stroke="${rule}"/>
      <path d="M560 30V330" stroke="${contour}" stroke-dasharray="2 6" stroke-opacity=".6"/>
      <g transform="translate(486 62)">
        <circle r="13" fill="none" stroke="${verdigris}" stroke-width="1.4"/>
        <path d="M0-8L4 6L0 2.5L-4 6Z" fill="${sienna}"/>
      </g>
      <g class="carto-rise">
        <text x="50" y="49" class="carto-mono" font-size="8" letter-spacing="2.3" fill="${verdigris}">CARTOGRAPH / FIELD SURVEY</text>
        <text x="50" y="82" class="carto-label" font-size="12" font-weight="800" letter-spacing="2" fill="${sienna}">${username}</text>
        <text x="48" y="133" class="carto-serif" font-size="36" font-weight="700" fill="${ink}">AI AGENT</text>
        <text x="48" y="169" class="carto-serif" font-size="36" font-style="italic" fill="${ink}">INFRASTRUCTURE</text>
        <path d="M50 210H132" stroke="${sienna}" stroke-width="4"/>
        <text x="50" y="238" class="carto-serif" font-size="12" font-style="italic" fill="${muted}">${bioText}</text>
        <text x="50" y="276" class="carto-mono" font-size="8" letter-spacing="1.5" fill="${ink}">0${count} SUMMITS · 08 CONTOUR LAYERS</text>
        <text x="50" y="304" class="carto-mono" font-size="8" letter-spacing="1.6" fill="${muted}">DATUM / ${locText}</text>
      </g>
      <text x="660" y="47" class="carto-serif" font-size="16" font-style="italic" fill="${ink}">Surveyed summits</text>
      <text x="1142" y="47" text-anchor="end" class="carto-mono" font-size="8" letter-spacing="1.4" fill="${muted}">SHEET / MAJIAYU000</text>
      ${nodes}
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
      const accent = index % 2 === 0 ? sienna : verdigris
      const name = escapeXml(shorten(layer.name, 16))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          15
        )
      )

      return `
        <g class="carto-rise" style="animation-delay:${index * 42}ms">
          <path d="M0 -7 L6 5 H-6 Z" fill="none" stroke="${accent}" stroke-width="1.6" transform="translate(${x} ${y - 4})"/>
          <circle cx="${x}" cy="${y - 5}" r="1.4" fill="${accent}"/>
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
          .carto-serif { font-family: Georgia, serif; }
          .carto-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
        <pattern id="carto-grid-${widget.instanceId}" width="46" height="46" patternUnits="userSpaceOnUse">
          <path d="M46 0 H0 V46" fill="none" stroke="${rule}" stroke-opacity="0.14"/>
        </pattern>
        <g id="carto-hill-${widget.instanceId}" fill="none" stroke="${contour}">
          <path d="M0 -26 C15 -26 26 -13 26 0 C26 15 13 26 0 26 C-15 26 -26 13 -26 0 C-26 -15 -13 -26 0 -26 Z"/>
          <path d="M0 -15 C9 -15 15 -8 15 0 C15 9 8 15 0 15 C-9 15 -15 8 -15 0 C-15 -9 -8 -15 0 -15 Z"/>
        </g>
      </defs>

      <rect width="800" height="330" fill="${background}"/>
      <rect x="10" y="10" width="780" height="310" fill="${paper}" stroke="${rule}" stroke-width="1"/>
      <rect x="10" y="10" width="780" height="310" fill="url(#carto-grid-${widget.instanceId})"/>

      <!-- Triangulation panel -->
      <g>
        <rect x="29" y="29" width="185" height="272" fill="${panel}" fill-opacity="0.62" stroke="${rule}"/>
        <text x="121" y="54" text-anchor="middle" class="carto-mono" font-size="8" letter-spacing="2.1" fill="${verdigris}">TRIANGULATION</text>
        <text x="121" y="91" text-anchor="middle" class="carto-serif" font-size="21" font-style="italic" fill="${ink}">Contour survey</text>
        
        <use href="#carto-hill-${widget.instanceId}" transform="translate(121 148) scale(1.1)"/>
        
        <text x="121" y="222" text-anchor="middle" class="carto-serif" font-size="52" font-weight="700" fill="${ink}">${String(count).padStart(2, '0')}</text>
        <text x="121" y="246" text-anchor="middle" class="carto-mono" font-size="8" letter-spacing="1.8" fill="${sienna}">LAYERS CHARTED</text>
      </g>

      <!-- Cartograph headers -->
      <g>
        <text x="250" y="40" class="carto-mono" font-size="10" letter-spacing="2" fill="${verdigris}">CARTOGRAPH / CONTOUR INDEX</text>
        <text x="770" y="40" text-anchor="end" class="carto-mono" font-size="8" letter-spacing="1.4" fill="${muted}">CONTOUR SURVEY // VOL. 01</text>
        <path d="M250 52 H770" stroke="${rule}" stroke-width="1"/>
        <path d="M480 61 V300" stroke="${rule}" stroke-width="1"/>
      </g>

      <!-- Survey rows -->
      ${rows}
    </svg>
  `
}
