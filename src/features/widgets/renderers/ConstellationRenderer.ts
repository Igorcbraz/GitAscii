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

export function renderConstellation(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const isDark = true
  const background = isDark ? '#080B10' : '#F5F7FA'
  const backgroundEnd = isDark ? '#0B1026' : '#EFE9D8'
  const starColor = isDark ? '#E8ECFF' : '#1E2A52'
  const ink = isDark ? '#E2E8F0' : '#1E293B'
  const muted = isDark ? '#64748B' : '#94A3B8'
  const graticule = isDark ? '#4A5480' : '#9BA2BD'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#38BDF8'
  const secondary = (cfg.secondaryColor as string) || '#818CF8'

  const repos = data.repos || []
  const layers = repos.slice(0, 8)
  const count = layers.length

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  if (layoutType === 'hero') {
    const heroPoints = [
      { x: 643.9, y: 96.6 },
      { x: 792.6, y: 96.7 },
      { x: 941.4, y: 96.3 },
      { x: 1090.1, y: 96.4 },
      { x: 1089.8, y: 178.5 },
      { x: 940.5, y: 178.7 },
      { x: 791.2, y: 178.2 },
      { x: 641.9, y: 178.4 },
    ]
    const validPoints = heroPoints.slice(0, count)
    const pathStr =
      validPoints.length > 0
        ? validPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join('')
        : ''

    const starsOutput = layers
      .map((layer, index) => {
        const p = heroPoints[index]
        if (!p) return ''
        const delay = (index * 0.32).toFixed(2)
        const color = index < 4 ? primary : secondary
        const radius = 8.5 - index * 0.5
        const name = escapeXml(shorten(layer.name, 15))
        return `
        <g>
          <circle class="major" style="animation-delay:${delay}s" cx="${p.x}" cy="${p.y}" r="${radius}" fill="${color}" filter="url(#star-glow-${widget.instanceId})"/>
          <text x="${p.x}" y="${(p.y - 15).toFixed(1)}" text-anchor="middle" class="mono" font-size="8" letter-spacing="1" fill="${muted}">${name}</text>
        </g>
      `
      })
      .join('')

    const userLogin = escapeXml(
      (cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'User'
    )
    const userBio = escapeXml(
      shorten(
        (cfg.customBio ? String(cfg.customBio) : data.user?.bio) ||
          'Building the systems around coding agents — from skills and trust to…',
        70
      )
    )
    const userLocation = escapeXml(
      data.user?.location
        ? `OBSERVED FROM ${data.user.location.toUpperCase()}`
        : 'OBSERVED FROM EARTH'
    )

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" role="img" aria-label="${userLogin} constellation profile" data-mode="dark">
        <defs>
          <linearGradient id="sky-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="${backgroundEnd}"/></linearGradient>
          <linearGradient id="cline-${widget.instanceId}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient>
          <filter id="star-glow-${widget.instanceId}" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <style>
          .display{font-family:Georgia,"Times New Roman",serif}.body{font-family:"Avenir Next",Avenir,Helvetica,sans-serif}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
          .tw{animation:tw 3.4s ease-in-out infinite}.signal{stroke-dasharray:2 98;animation:signal 6s linear infinite}
          .major{transform-box:fill-box;transform-origin:center;animation:major 4.8s ease-in-out infinite}
          @keyframes tw{50%{opacity:.2}}@keyframes signal{to{stroke-dashoffset:-100}}@keyframes major{0%,44%,100%{opacity:.62;transform:scale(.88)}12%,30%{opacity:1;transform:scale(1.12)}}
          @media(prefers-reduced-motion:reduce){.tw,.signal,.major{animation:none}}
        </style>
        <rect width="1200" height="360" fill="url(#sky-${widget.instanceId})"/>
        
        <circle class="tw" style="animation-delay:3.40s" cx="1104.8" cy="330.0" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="549.1" cy="166.1" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="909.4" cy="271.4" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:1.37s" cx="353.3" cy="107.4" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="226.1" cy="66.4" r="1.7" fill="${starColor}" opacity=".85"/><circle class="tw" style="animation-delay:2.52s" cx="945.4" cy="285.0" r="1.1" fill="${starColor}" opacity=".55"/><circle cx="30.7" cy="7.8" r="0.7" fill="${starColor}" opacity=".55"/><circle cx="750.3" cy="226.5" r="1.1" fill="${starColor}" opacity=".55"/><circle cx="392.2" cy="116.3" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:3.31s" cx="1036.5" cy="312.4" r="1.1" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:2.52s" cx="906.8" cy="273.4" r="1.1" fill="${starColor}" opacity=".55"/><circle cx="262.5" cy="77.4" r="0.7" fill="${starColor}" opacity=".55"/><circle cx="705.2" cy="213.0" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="67.1" cy="18.7" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:0.35s" cx="103.1" cy="32.3" r="1.1" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:1.81s" cx="583.9" cy="173.8" r="1.1" fill="${starColor}" opacity=".55"/><circle cx="1102.2" cy="332.1" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="388.4" cy="115.1" r="1.1" fill="${starColor}" opacity=".55"/><circle cx="419.4" cy="127.2" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="980.9" cy="292.9" r="1.1" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:3.16s" cx="1172.3" cy="350.3" r="1.1" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:1.89s" cx="610.7" cy="184.6" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="971.0" cy="289.9" r="0.7" fill="${starColor}" opacity=".55"/><circle cx="415.0" cy="125.9" r="0.7" fill="${starColor}" opacity=".55"/><circle cx="293.6" cy="86.7" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="1007.1" cy="303.5" r="1.1" fill="${starColor}" opacity=".55"/><circle cx="92.4" cy="26.3" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:1.93s" cx="812.0" cy="245.0" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="453.9" cy="134.8" r="0.7" fill="${starColor}" opacity=".55"/><circle cx="1098.2" cy="330.9" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="1007.4" cy="303.6" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="287.7" cy="84.9" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:3.25s" cx="2.4" cy="2.1" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:1.32s" cx="483.2" cy="143.5" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:2.10s" cx="610.3" cy="184.5" r="1.7" fill="${starColor}" opacity=".85"/><circle class="tw" style="animation-delay:3.15s" cx="1166.4" cy="348.5" r="1.7" fill="${starColor}" opacity=".85"/><circle class="tw" style="animation-delay:2.02s" cx="806.1" cy="243.2" r="1.7" fill="${starColor}" opacity=".85"/><circle class="tw" style="animation-delay:0.72s" cx="161.8" cy="47.1" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="289.0" cy="88.1" r="1.1" fill="${starColor}" opacity=".55"/><circle cx="769.4" cy="229.4" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:0.20s" cx="1140.6" cy="340.8" r="1.7" fill="${starColor}" opacity=".85"/><circle cx="660.2" cy="199.5" r="0.7" fill="${starColor}" opacity=".55"/><circle cx="141.8" cy="41.1" r="0.7" fill="${starColor}" opacity=".55"/><circle class="tw" style="animation-delay:2.28s" cx="861.1" cy="259.7" r="1.7" fill="${starColor}" opacity=".85"/><circle class="tw" style="animation-delay:2.18s" cx="825.0" cy="246.1" r="0.7" fill="${starColor}" opacity=".55"/><circle cx="263.2" cy="80.4" r="1.1" fill="${starColor}" opacity=".55"/><circle cx="1020.5" cy="304.7" r="0.7" fill="${starColor}" opacity=".55"/><circle cx="464.8" cy="140.8" r="0.7" fill="${starColor}" opacity=".55"/>
        
        <text x="60" y="96" class="mono" font-size="9" letter-spacing="3" fill="${secondary}">STAR ATLAS / AI AGENT INFRASTRUCTURE</text>
        <text x="58" y="164" class="display" font-size="58" font-weight="700" letter-spacing="-1" fill="${ink}">${userLogin}</text>
        <path d="M60 190H340" stroke="${primary}" stroke-opacity=".7"/>
        <text x="60" y="222" class="body" font-size="13" fill="${muted}">${userBio}</text>
        <text x="60" y="258" class="mono" font-size="9" letter-spacing="2" fill="${ink}">0${count} MAJOR STARS CHARTED</text>
        <text x="60" y="322" class="mono" font-size="9" letter-spacing="2" fill="${muted}">${userLocation}</text>
        
        <path d="${pathStr}" fill="none" stroke="url(#cline-${widget.instanceId})" stroke-width="1.3" stroke-opacity=".55"/>
        <path class="signal" pathLength="100" d="${pathStr}" fill="none" stroke="${starColor}" stroke-width="3.5" stroke-linecap="round" filter="url(#star-glow-${widget.instanceId})"/>
        
        ${starsOutput}
      </svg>
    `
  }

  const points = layers.map((_, index) => {
    const spacing = 480 / Math.max(1, count - 1)
    const jitter = index % 2 === 0 ? 15 : -15
    return {
      x: 180 + index * spacing,
      y: 165 + jitter,
    }
  })

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join('')

  const stars = layers
    .map((layer: GitHubRepo, index: number) => {
      const point = points[index]
      if (!point) return ''
      const radius = 5
      const color = index % 2 === 0 ? primary : secondary
      const x = point.x.toFixed(1)
      const y = point.y.toFixed(1)
      const name = escapeXml(shorten(layer.name, 12))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          12
        )
      )
      return `
        <g>
          <circle class="major" cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>
          <text x="${x}" y="${(point.y + radius + 14).toFixed(1)}" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="800" fill="${ink}">${name}</text>
          <text x="${x}" y="${(point.y + radius + 24).toFixed(1)}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7" fill="${muted}">${lang}</text>
          <text x="${x}" y="${(point.y - 12).toFixed(1)}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="${color}">${String(index + 1).padStart(2, '0')}</text>
        </g>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          .major { animation: pulse 3s infinite alternate; }
          @keyframes pulse { 0% { transform: scale(0.9); } 100% { transform: scale(1.1); } }
        </style>
        <linearGradient id="sky-${widget.instanceId}" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="${background}"/>
          <stop offset="100%" stop-color="${backgroundEnd}"/>
        </linearGradient>
      </defs>

      <rect width="800" height="330" fill="url(#sky-${widget.instanceId})"/>

      <!-- Graticules -->
      <g stroke="${graticule}" stroke-opacity="0.3" fill="none">
        <ellipse cx="400" cy="165" rx="350" ry="110"/>
        <ellipse cx="400" cy="165" rx="220" ry="110" stroke-dasharray="2 4"/>
        <path d="M50 165 H750"/>
      </g>

      <!-- Atlas Header info -->
      <g>
        <text x="30" y="34" font-family="Georgia, serif" font-size="16" font-style="italic" fill="${ink}">Star chart</text>
        <text x="770" y="34" text-anchor="end" font-family="ui-monospace, monospace" font-size="8" letter-spacing="1.5" fill="${muted}">CONSTELLATION // EPOCH 01</text>
      </g>

      <!-- Star constellation line -->
      <path d="${path}" fill="none" stroke="${graticule}" stroke-opacity="0.5" stroke-width="1.2"/>
      <path d="${path}" fill="none" stroke="${starColor}" stroke-dasharray="2 6" stroke-width="2"/>

      <!-- Stars Nodes -->
      ${stars}
    </svg>
  `
}
