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

export function renderEditorial(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config
  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  const isDark = true
  const background = isDark ? '#0D0E0C' : '#DCD5C7'
  const paper = isDark ? '#191A16' : '#F4EDDF'
  const ink = isDark ? '#F4EEDC' : '#171915'
  const muted = isDark ? '#AAA797' : '#6E6B61'
  const rule = isDark ? '#45463E' : '#B9B1A2'
  const spine = isDark ? '#E9E2D0' : '#1B1D19'
  const spineInk = isDark ? '#11120F' : '#F4EDDF'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  const repos = data.repos || []

  if (layoutType === 'hero') {
    const layers = repos.slice(0, 3)
    const userLogin = escapeXml(
      (cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'GITHUB USER'
    )
    const userBio = escapeXml(
      shorten(
        (cfg.customBio ? String(cfg.customBio) : data.user?.bio) ||
          'Building the systems around coding agents...',
        75
      )
    )
    const userLocation = escapeXml(data.user?.location || 'EARTH').toUpperCase()

    const userName = (
      (cfg.customTitle ? String(cfg.customTitle) : data.user?.name) ||
      (cfg.customTitle ? String(cfg.customTitle) : data.user?.login) ||
      'GITHUB USER'
    ).toUpperCase()
    const nameParts = userName.split(' ')
    const firstName = escapeXml(nameParts[0] || 'AI AGENT')
    const lastName = escapeXml(nameParts.slice(1).join(' ') || 'INFRASTRUCTURE')

    const heroRows = layers
      .map((layer: GitHubRepo, index: number) => {
        const color = index % 2 === 0 ? primary : secondary
        const yOffset = index * 70
        const delay = 120 + index * 70
        const num = String(index + 1).padStart(2, '0')
        const name = escapeXml(shorten(layer.name, 25))
        const lang = escapeXml(
          (
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] ||
            layer.language ||
            'Code'
          ).toUpperCase()
        )
        const desc = escapeXml(shorten(layer.description || 'Repository on GitHub...', 45))

        return `
      <g class="enter" style="animation-delay:${delay}ms">
        <text x="790" y="${93 + yOffset}" class="grotesk" font-size="30" font-weight="900" fill="${color}" opacity=".82">${num}</text>
        <text x="850" y="${87 + yOffset}" class="body" font-size="15" font-weight="800" fill="${ink}">${name}</text>
        <text x="850" y="${106 + yOffset}" class="mono" font-size="8" letter-spacing="1.5" fill="${color}">${lang} / SELECTED SYSTEM</text>
        <text x="850" y="${127 + yOffset}" class="body" font-size="10" fill="${muted}">${desc}</text>
        <path d="M790 ${140 + yOffset}H1152" stroke="${rule}"/>
      </g>`
      })
      .join('')

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" role="img" aria-label="${userLogin} editorial profile" data-mode="dark">
      <defs>
        <pattern id="paper-grid-${widget.instanceId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${rule}" stroke-opacity=".17"/></pattern>
        <filter id="grain-${widget.instanceId}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="2" seed="7"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .045 0"/></filter>
      </defs><style>
        .display{font-family:Georgia,"Times New Roman",serif}.grotesk{font-family:"Arial Narrow","Avenir Next Condensed",Impact,sans-serif}.body{font-family:"Avenir Next",Avenir,Helvetica,sans-serif}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .enter{animation:enter .65s cubic-bezier(.2,.8,.2,1)}.scan{stroke-dasharray:3 8;animation:scan 9s linear infinite}
        @keyframes enter{from{opacity:.25;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes scan{to{stroke-dashoffset:-120}}
        @media(prefers-reduced-motion:reduce){.enter,.scan{animation:none}}
      </style><rect width="1200" height="360" fill="${background}"/><rect x="13" y="13" width="1174" height="334" fill="${paper}" stroke="${rule}"/><rect x="13" y="13" width="1174" height="334" fill="url(#paper-grid-${widget.instanceId})"/>
      <rect x="13" y="13" width="156" height="334" fill="${spine}"/><rect x="26" y="26" width="5" height="72" fill="${primary}"/><rect x="26" y="105" width="5" height="34" fill="${secondary}"/>
      <text x="91" y="220" text-anchor="middle" class="grotesk" font-size="164" font-weight="900" letter-spacing="-10" fill="${spineInk}">01</text><text x="91" y="253" text-anchor="middle" class="mono" font-size="8" letter-spacing="3" fill="${spineInk}">SYSTEMS REVIEW</text>
      <path d="M52 281H130" stroke="${spineInk}"/><text x="91" y="307" text-anchor="middle" class="mono" font-size="8" letter-spacing="2" fill="${spineInk}">${String(layers.length).padStart(2, '0')} WORKS</text><text x="91" y="326" text-anchor="middle" class="mono" font-size="8" letter-spacing="2" fill="${spineInk}">${userLocation}</text>
      <g class="enter"><text x="199" y="48" class="mono" font-size="8" letter-spacing="2.5" fill="${primary}">PROFILE DOSSIER / ${userLogin.toUpperCase()}</text><path d="M199 62H730" stroke="${rule}"/>
      <text x="196" y="122" class="display" font-size="46" font-weight="700" letter-spacing="-1" fill="${ink}">${firstName}</text><text x="196" y="168" class="display" font-size="46" font-style="italic" letter-spacing="-1" fill="${ink}">${lastName}</text>
      <rect x="199" y="218" width="42" height="4" fill="${secondary}"/><text x="199" y="250" class="body" font-size="12" fill="${muted}">${userBio}</text>
      <text x="199" y="294" class="mono" font-size="8" letter-spacing="2" fill="${ink}">AUTHORED SYSTEMS · OPEN SOURCE · ${String(repos.length).padStart(2, '0')} ACTIVE LAYERS</text><path class="scan" d="M199 314H730" stroke="${primary}" stroke-width="2"/></g>
      <path d="M758 30V330" stroke="${rule}"/><text x="790" y="47" class="display" font-size="17" font-style="italic" fill="${ink}">Editor&apos;s selection</text><text x="1152" y="47" text-anchor="end" class="mono" font-size="8" letter-spacing="2" fill="${muted}">VOL. 01 / ${String(layers.length).padStart(2, '0')}</text>
      ${heroRows}
      <rect x="1157" y="317" width="5" height="5" fill="${primary}"/><rect x="1145" y="317" width="5" height="5" fill="${secondary}"/><rect x="13" y="13" width="1174" height="334" filter="url(#grain-${widget.instanceId})" opacity=".28" pointer-events="none"/>
    </svg>`
  }

  const layers = repos.slice(0, 10)

  const rows = layers
    .map((layer: GitHubRepo, index: number) => {
      const column = Math.floor(index / 5)
      const row = index % 5
      const x = 205 + column * 280
      const y = 78 + row * 45
      const color = index % 2 === 0 ? primary : secondary
      const name = escapeXml(shorten(layer.name, 15))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          15
        )
      )
      return `
        <g class="enter" style="animation-delay:${index * 45}ms">
          <rect x="${x}" y="${y - 17}" width="4" height="30" fill="${color}"/>
          <text x="${x + 12}" y="${y - 3}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="8" letter-spacing="1.5" fill="${color}">${String(index + 1).padStart(2, '0')}</text>
          <text x="${x + 35}" y="${y - 3}" font-family="'Avenir Next', Avenir, Helvetica, sans-serif" font-size="11" font-weight="800" fill="${ink}">${name}</text>
          <text x="${x + 35}" y="${y + 10}" font-family="Georgia, serif" font-size="10.5" font-style="italic" fill="${muted}">${lang}</text>
          <path d="M${x + 12} ${y + 18} H${x + 260}" stroke="${rule}" stroke-width="0.5"/>
        </g>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          .display { font-family: Georgia, "Times New Roman", serif; }
          .body { font-family: "Avenir Next", Avenir, Helvetica, sans-serif; }
          .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
        <pattern id="paper-grid-${widget.instanceId}" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 H0 V24" fill="none" stroke="${rule}" stroke-opacity="0.15"/>
        </pattern>
      </defs>

      <rect width="800" height="330" fill="${background}"/>
      <rect x="10" y="10" width="780" height="310" fill="${paper}" stroke="${rule}" stroke-width="1"/>
      <rect x="10" y="10" width="780" height="310" fill="url(#paper-grid-${widget.instanceId})"/>

      <!-- Editorial spine book column -->
      <g>
        <rect x="10" y="10" width="120" height="310" fill="${spine}"/>
        <rect x="20" y="20" width="4" height="60" fill="${primary}"/>
        <rect x="20" y="90" width="4" height="30" fill="${secondary}"/>
        <text x="70" y="180" text-anchor="middle" font-family="'Arial Narrow', sans-serif" font-weight="900" font-size="90" fill="${spineInk}">01</text>
        <text x="70" y="210" text-anchor="middle" class="mono" font-size="7" letter-spacing="2" fill="${spineInk}">WORKING INDEX</text>
        <path d="M 40 230 H 100" stroke="${spineInk}" stroke-width="1"/>
        <text x="70" y="250" text-anchor="middle" class="mono" font-size="7" letter-spacing="1.5" fill="${spineInk}">${String(layers.length).padStart(2, '0')} PROJECTS</text>
      </g>

      <!-- Main editorial headers -->
      <g>
        <text x="160" y="42" class="display" font-size="18" font-style="italic" fill="${ink}">Working index</text>
        <text x="770" y="42" text-anchor="end" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">ARCHIVE // VOL. 01</text>
        <path d="M 160 52 H 770" stroke="${rule}" stroke-width="1"/>
        <path d="M 470 60 V 300" stroke="${rule}" stroke-width="1"/>
      </g>

      <!-- Nodes -->
      ${rows}
    </svg>
  `
}
