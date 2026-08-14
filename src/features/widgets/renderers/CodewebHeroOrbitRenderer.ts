import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function localEscapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderCodewebHeroOrbit(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  _globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const width = widget.size.width || 800
  const height = widget.size.height || 360
  const cfg = widget.config || {}

  const title = (cfg.title as string) || data.user.name || data.user.login || 'ALIEN'
  const subtitle = (cfg.subtitle as string) || data.user.bio || 'DESIGNER / CREATOR'

  const defaultTags = ['Minimalism', 'Open Source', 'Web']
  const rawTags =
    Array.isArray(cfg.tags) && cfg.tags.length > 0 ? (cfg.tags as string[]) : defaultTags
  const isStatic = forceStatic || Boolean(cfg.staticMode)

  const orbColor1 = (cfg.orbColor1 as string) || 'rgba(108,195,130,0.55)'
  const orbColor2 = (cfg.orbColor2 as string) || 'rgba(230,100,115,0.5)'
  const orbColor3 = (cfg.orbColor3 as string) || 'rgba(195,155,255,0.35)'
  const orbColor4 = (cfg.orbColor4 as string) || 'rgba(255,195,110,0.28)'
  const orbColor5 = (cfg.orbColor5 as string) || 'rgba(80,160,220,0.3)'
  const bgColor = (cfg.bgColor as string) || '#08080d'

  const pillPadding = 12
  const pillHeight = 26
  const tagData = rawTags.map((tag) => {
    const textWidth = Math.max(tag.length * 7.5 + 24, 60)
    return { text: tag, width: textWidth }
  })

  const totalPillsWidth = tagData.reduce((acc, t) => acc + t.width + pillPadding, 0) - pillPadding
  let currentPillX = Math.max((800 - totalPillsWidth) / 2, 20)
  const pillElements: string[] = []

  tagData.forEach((t, i) => {
    const px = currentPillX
    const py = 230
    currentPillX += t.width + pillPadding

    pillElements.push(`
      <g id="hero-tag-${i}">
        <rect x="${px}" y="${py}" width="${t.width}" height="${pillHeight}" rx="13" ry="13" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)" stroke-width="1.2" />
        <text x="${px + t.width / 2}" y="${py + 17}" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="400" letter-spacing="0.5">${localEscapeXml(t.text)}</text>
      </g>
    `)
  })

  const animStyles = isStatic
    ? ''
    : `
    <style>
      @keyframes floatOrb1 { 0%, 100% { transform: translate(0px, 0px) scale(1); } 50% { transform: translate(40px, -30px) scale(1.1); } }
      @keyframes floatOrb2 { 0%, 100% { transform: translate(0px, 0px) scale(1); } 50% { transform: translate(-35px, 35px) scale(0.92); } }
      @keyframes floatOrb3 { 0%, 100% { transform: translate(0px, 0px) scale(1); } 50% { transform: translate(25px, 20px) scale(1.05); } }
      @keyframes pulseRings { 0%, 100% { opacity: 0.18; } 50% { opacity: 0.45; } }
      @keyframes radarRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      #hero-o1 { animation: floatOrb1 16s ease-in-out infinite; }
      #hero-o2 { animation: floatOrb2 20s ease-in-out infinite; }
      #hero-o3 { animation: floatOrb3 18s ease-in-out infinite; }
      #hr1, #hr2, #hr3, #hr4, #hr5 { animation: pulseRings 6s ease-in-out infinite; }
      #hero-dot-group { animation: radarRotate 12s linear infinite; transform-origin: 400px 178px; }
    </style>
  `

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="cw-hero-clip-${widget.instanceId}">
          <rect x="0" y="0" width="800" height="360" rx="20" ry="20" />
        </clipPath>
        <radialGradient id="hg1-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${orbColor1}"></stop>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"></stop>
        </radialGradient>
        <radialGradient id="hg2-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${orbColor2}"></stop>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"></stop>
        </radialGradient>
        <radialGradient id="hg3-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${orbColor3}"></stop>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"></stop>
        </radialGradient>
        <radialGradient id="hg4-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${orbColor4}"></stop>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"></stop>
        </radialGradient>
        <radialGradient id="hg5-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${orbColor5}"></stop>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"></stop>
        </radialGradient>
      </defs>
      ${animStyles}
      <rect x="0" y="0" width="800" height="360" rx="20" ry="20" fill="${bgColor}" />

      <g clip-path="url(#cw-hero-clip-${widget.instanceId})">
        <!-- Animated glowing orbs -->
        <ellipse id="hero-o1" cx="112" cy="310" rx="260" ry="200" fill="url(#hg1-${widget.instanceId})" />
        <ellipse id="hero-o2" cx="712" cy="68" rx="230" ry="190" fill="url(#hg2-${widget.instanceId})" />
        <ellipse id="hero-o3" cx="616" cy="328" rx="200" ry="160" fill="url(#hg3-${widget.instanceId})" />
        <ellipse id="hero-o4" cx="200" cy="54" rx="190" ry="150" fill="url(#hg4-${widget.instanceId})" />
        <ellipse id="hero-o5" cx="400" cy="338" rx="170" ry="130" fill="url(#hg5-${widget.instanceId})" />

        <!-- Concentric Radar Rings -->
        <circle id="hr1" cx="400" cy="178" r="52" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="0.7" />
        <circle id="hr2" cx="400" cy="178" r="92" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="0.7" />
        <circle id="hr3" cx="400" cy="178" r="138" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="0.7" />
        <circle id="hr4" cx="400" cy="178" r="192" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="0.7" />
        <circle id="hr5" cx="400" cy="178" r="256" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="0.7" />

        <!-- Rotating Dot -->
        <g id="hero-dot-group">
          <circle cx="400" cy="126" r="2.5" fill="rgba(255,255,255,0.75)" />
        </g>
      </g>

      <!-- Main Content -->
      <g>
        <!-- Title -->
        <text x="400" y="156" text-anchor="middle" fill="#ffffff" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="44" font-weight="700" letter-spacing="4">${localEscapeXml(title.toUpperCase())}</text>

        <!-- Subtitle -->
        <text x="400" y="194" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="600" letter-spacing="3">${localEscapeXml(subtitle.toUpperCase())}</text>

        <!-- Pills -->
        ${pillElements.join('')}
      </g>
    </svg>
  `
}
