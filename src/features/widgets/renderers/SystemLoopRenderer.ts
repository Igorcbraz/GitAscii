import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

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

export function renderSystemLoop(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config
  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  if (layoutType === 'hero') {
    const repos = data.repos || []
    const layers = repos.slice(0, 8)
    const count = layers.length

    const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#00A7D1'
    const secondary = (cfg.secondaryColor as string) || '#E84A8A'
    const bg1 = '#07131A'
    const bg2 = '#10141F'
    const idSuffix = widget.instanceId

    const nodesHtml = layers
      .map((layer, index) => {
        const isSecondary = index >= Math.ceil(count / 2)
        const color = isSecondary ? secondary : primary
        const delayStr = index === 0 ? '0s' : (index * 0.32).toFixed(2).replace(/^0\./, '.') + 's'
        const name = escapeXml(shorten(layer.name, 15))
        const lang = escapeXml(
          shorten(
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'CODE',
            12
          )
        ).toUpperCase()
        const translateX = (22.0 + index * 146.0).toFixed(1)

        return `<g class="node" style="animation-delay:${delayStr}" transform="translate(${translateX} 304)">
        <rect width="134.0" height="38" rx="5" fill="#0C1C24" fill-opacity=".82" stroke="${color}" stroke-opacity=".65"/>
        <circle class="pulse" style="animation-delay:${delayStr}" cx="14" cy="19" r="3" fill="${color}"/>
        <path class="flow" d="M24 19h100.0" stroke="${color}" stroke-opacity=".34"/>
        <text x="67.0" y="16" text-anchor="middle" font-size="8" letter-spacing="1.3" fill="#8BA9B5">${lang}</text>
        <text x="67.0" y="29" text-anchor="middle" font-size="9" font-weight="700" fill="${color}">${name}</text>
      </g>`
      })
      .join('')

    const userLogin = escapeXml(
      cfg.customTitle ? String(cfg.customTitle) : data.user.login
    ).toUpperCase()
    const userBio = escapeXml(
      shorten(
        (cfg.customBio ? String(cfg.customBio) : data.user.bio) ||
          'BUILDING THE SYSTEMS AROUND CODING AGENTS',
        60
      )
    ).toUpperCase()
    const userLoc = escapeXml(data.user.location || 'EARTH').toUpperCase()

    return `
    <svg id="svg-${idSuffix}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" role="img" aria-label="${userLogin} profile control plane" data-mode="dark">
      <defs>
        <linearGradient id="bg-${idSuffix}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>
        <linearGradient id="accent-${idSuffix}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient>
        <linearGradient id="scan-${idSuffix}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${primary}" stop-opacity="0"/><stop offset=".46" stop-color="${primary}" stop-opacity=".08"/><stop offset=".54" stop-color="${secondary}" stop-opacity=".38"/><stop offset="1" stop-color="${secondary}" stop-opacity="0"/></linearGradient>
        <radialGradient id="reactor-${idSuffix}"><stop stop-color="${primary}" stop-opacity=".9"/><stop offset=".28" stop-color="${primary}" stop-opacity=".38"/><stop offset="1" stop-color="${primary}" stop-opacity="0"/></radialGradient>
        <pattern id="grid-${idSuffix}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#17313C" stroke-width="1"/></pattern>
        <filter id="glow-${idSuffix}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="frame-${idSuffix}"><rect x="1" y="1" width="1198" height="358" rx="18"/></clipPath>
      </defs>
      <style>
        #svg-${idSuffix} text{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace}
        .label{font-size:12px;letter-spacing:3px;font-weight:700}.micro{font-size:10px;letter-spacing:2px}
        .flow{stroke-dasharray:10 14;animation:flow 5s linear infinite}.scan{animation:scan 7s linear infinite}
        .pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.8s ease-in-out infinite}.node{animation:node 5.6s ease-in-out infinite}
        .orbit,.orbit-reverse{transform-box:fill-box;transform-origin:center}.orbit{animation:orbit 12s linear infinite}.orbit-reverse{animation:orbit 18s linear infinite reverse}.blink{animation:blink 2.4s steps(1) infinite}
        .boot{animation:boot .9s cubic-bezier(.2,.8,.2,1) both}.boot-line{stroke-dasharray:100;animation:draw 1.2s ease-out both}.packet{stroke-dasharray:1 99;animation:packet 6.5s linear infinite}
        @keyframes flow{to{stroke-dashoffset:-192}}@keyframes scan{from{transform:translateX(-220px)}to{transform:translateX(1420px)}}
        @keyframes pulse{0%,100%{opacity:.62;transform:scale(.9)}50%{opacity:1;transform:scale(1.08)}}
        @keyframes node{0%,42%,100%{opacity:.58}12%,30%{opacity:1}}@keyframes orbit{to{transform:rotate(360deg)}}
        @keyframes blink{0%,76%{opacity:1}77%,84%{opacity:.2}85%,100%{opacity:1}}
        @keyframes boot{from{opacity:0}to{opacity:1}}@keyframes draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}@keyframes packet{to{stroke-dashoffset:-100}}
        @media(prefers-reduced-motion:reduce){.flow,.scan,.pulse,.node,.orbit,.orbit-reverse,.blink,.boot,.boot-line,.packet{animation:none}}
      </style>
      <g clip-path="url(#frame-${idSuffix})">
        <rect width="1200" height="360" fill="url(#bg-${idSuffix})"/>
        <rect width="1200" height="360" fill="url(#grid-${idSuffix})" opacity=".7"/>
        <path d="M0 292C240 250 360 176 566 84S930 20 1200 0V360H0Z" fill="${primary}" opacity=".035"/>
        <path d="M660 0l290 360h250V0Z" fill="${secondary}" opacity=".04"/>
        <g class="scan" opacity=".72"><path d="M-260 0h130L50 360H-80Z" fill="url(#scan-${idSuffix})"/></g>
        <path class="boot-line" pathLength="100" d="M0 1h1200" stroke="url(#accent-${idSuffix})" stroke-width="2"/>
        <g class="boot" style="animation-delay:.05s" transform="translate(22 22)">
          <circle cx="0" cy="0" r="4" fill="#EF4B5A"/><circle cx="18" cy="0" r="4" fill="#E6A425"/><circle cx="36" cy="0" r="4" fill="#22A447"/>
          <text x="58" y="4" class="micro" fill="#8BA9B5">${userLogin} / CONTROL_PLANE</text>
        </g>
        <g class="boot" style="animation-delay:.18s" transform="translate(1046 22)">
          <circle class="blink" cx="0" cy="0" r="4" fill="${primary}" filter="url(#glow-${idSuffix})"/>
          <text x="14" y="4" class="micro" fill="#8BA9B5">SYSTEM ONLINE</text>
        </g>
        <path d="M0 44h1200" stroke="#2B4A57"/>
        <g class="boot" style="animation-delay:.3s">
          <text x="38" y="91" class="label" fill="${primary}">// BUILDING THE INFRASTRUCTURE LAYER</text>
          <text x="38" y="159" font-size="52" font-weight="900" letter-spacing="-2" fill="#E7F7FC">AI AGENT</text>
          <text x="38" y="218" font-size="45" font-weight="900" letter-spacing="-1.5" fill="#E7F7FC">INFRASTRUCTURE</text>
          <text x="40" y="252" font-size="13" letter-spacing="2" fill="#8BA9B5">${userBio} · ${userLoc}</text>
        </g>
        <g class="boot" style="animation-delay:.58s" transform="translate(1018 151)">
          <circle r="74" fill="none" stroke="#2B4A57"/>
          <circle class="orbit-reverse" r="68" fill="none" stroke="${secondary}" stroke-width="1" stroke-dasharray="3 16" opacity=".38"/>
          <circle class="orbit" r="57" fill="none" stroke="${primary}" stroke-width="1.5" stroke-dasharray="8 10" opacity=".72"/>
          <g stroke="${primary}" opacity=".6"><path d="M0-74V-25M64-37L22-13M64 37L22 13M0 74V25M-64 37L-22 13M-64-37L-22-13"/></g>
          <circle class="pulse" r="34" fill="url(#reactor-${idSuffix})"/>
          <circle r="18" fill="#0C1C24" stroke="${primary}" filter="url(#glow-${idSuffix})"/>
          <circle class="pulse" r="5" fill="${primary}"/>
          <g fill="#0C1C24" stroke="${primary}">
            <circle cy="-74" r="6"/><circle cx="64" cy="-37" r="6"/><circle cx="64" cy="37" r="6"/>
            <circle cy="74" r="6"/><circle cx="-64" cy="37" r="6"/><circle cx="-64" cy="-37" r="6"/>
          </g>
        </g>
        <text x="973" y="247" class="micro" fill="#8BA9B5">CLOSED LOOP</text>
        <text x="22" y="288" class="micro" fill="${secondary}">EXECUTION PATH / ${String(count).padStart(2, '0')} ACTIVE LAYERS</text>
        <g class="boot" style="animation-delay:.82s">
          ${nodesHtml}
        </g>
      </g>
      <rect x="1" y="1" width="1198" height="358" rx="18" fill="none" stroke="${primary}" stroke-opacity=".72"/>
    </svg>
    `
  }

  // Control plane palette (dark mode theme)
  const bg1 = '#050814'
  const bg2 = '#0B1026'
  const panel = '#0A0F22'
  const border = '#2D3748'
  const line = '#3F4E66'
  const textClr = '#E8ECFF'
  const muted = '#8B93B8'
  const grid = '#4A5480'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  const repos = data.repos || []
  const layers = repos.slice(0, 6)
  const count = layers.length
  const centerX = 400
  const centerY = 180
  const radiusX = 260
  const radiusY = 80

  const points = layers.map((layer, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / count
    return {
      layer,
      x: centerX + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY,
    }
  })

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join('')

  const nodes = points
    .map(({ layer, x, y }, index) => {
      const color = index % 2 === 0 ? primary : secondary
      const labelY = y < centerY ? y - 18 : y + 26
      const delay = index === 0 ? '0' : (index * 0.32).toFixed(2).replace(/^0/, '')
      const name = escapeXml(shorten(layer.name, 15))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          12
        )
      )
      return `
        <g class="node" style="animation-delay:${delay}s">
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="${panel}" stroke="${color}" stroke-width="2"/>
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${color}"/>
          <text x="${x.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" fill="${textClr}">${name}</text>
          <text x="${x.toFixed(1)}" y="${(labelY + 10).toFixed(1)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="7.5" fill="${muted}">${lang}</text>
          <text x="${x.toFixed(1)}" y="${(y + 3.2).toFixed(1)}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="8" fill="${color}">${String(index + 1).padStart(2, '0')}</text>
        </g>
      `
    })
    .join('')

  return `
    <svg id="svg-cl-${widget.instanceId}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          #svg-cl-${widget.instanceId} .label { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; letter-spacing: 2px; font-weight: bold; }
          #svg-cl-${widget.instanceId} .micro { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 8px; letter-spacing: 1px; }
          .flow { stroke-dasharray: 10 14; animation: flow 5s linear infinite; }
          .packet { stroke-dasharray: 1 99; animation: packet 6.5s linear infinite; }
          .orbit { animation: orbit 12s linear infinite; transform-origin: 400px 180px; }
          @keyframes flow { to { stroke-dashoffset: -192; } }
          @keyframes orbit { to { transform: rotate(360deg); } }
          @keyframes packet { to { stroke-dashoffset: -100; } }
        </style>
        <linearGradient id="skyGrad-${widget.instanceId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
        <pattern id="grid-${widget.instanceId}" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 H0 V40" fill="none" stroke="${grid}" stroke-width="0.5" opacity="0.3"/>
        </pattern>
        <linearGradient id="accentGrad-${widget.instanceId}" x1="0" y1="0" x2="1" y2="0">
          <stop stop-color="${primary}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </linearGradient>
      </defs>

      <rect width="800" height="360" rx="12" fill="url(#skyGrad-${widget.instanceId})" stroke="${border}" stroke-width="1.5"/>
      <rect width="800" height="360" rx="12" fill="url(#grid-${widget.instanceId})"/>

      <!-- Header status info -->
      <g>
        <text x="28" y="34" class="label" fill="${primary}">CLOSED LOOP / ARCHITECTURE MAP</text>
        <text x="770" y="34" text-anchor="end" class="micro" fill="${muted}">${String(count).padStart(2, '0')} NODES · ONE SYSTEM</text>
        <path d="M 28 44 H 770" stroke="${line}" stroke-width="1"/>
      </g>

      <!-- Loop connection path -->
      <path d="${path}Z" fill="none" stroke="${line}" stroke-width="2"/>
      <path class="flow" d="${path}Z" fill="none" stroke="url(#accentGrad-${widget.instanceId})" stroke-width="2"/>

      <!-- Core reactor hub -->
      <g transform="translate(${centerX} ${centerY})">
        <circle r="42" fill="${panel}" stroke="${line}" stroke-width="1.5"/>
        <circle class="orbit" r="32" fill="none" stroke="${primary}" stroke-width="1" stroke-dasharray="4 6"/>
        <circle r="6" fill="${primary}"/>
      </g>

      <!-- Nodes -->
      ${nodes}

      <!-- Bottom label stamp -->
      <text x="400" y="330" text-anchor="middle" class="micro" fill="${muted}">${escapeXml(cfg.customTitle ? String(cfg.customTitle) : data.user.login).toUpperCase()} // CONTROL PLANE SYSTEMS</text>
    </svg>
  `
}
