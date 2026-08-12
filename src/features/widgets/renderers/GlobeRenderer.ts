import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderGlobe(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const bg1 = '#0b0f14'
  const bg2 = '#151c25'
  const border_color = '#2b303a'
  const accent_color = (cfg.accentColor as string) || globalStyles.accentColor || '#b6a891'
  const text_color = (cfg.textColor as string) || globalStyles.textColor || '#eceff4'
  const font_data = 'Consolas, monospace'

  const cx = 200
  const cy = 200
  const scale = 100

  const cos30 = Math.cos(Math.PI / 6)
  const sin30 = Math.sin(Math.PI / 6)

  const lon_path_els: string[] = []
  for (let i = 0; i < 12; i++) {
    const theta = (i * 30 * Math.PI) / 180
    const pts = []
    for (let j = 0; j <= 60; j++) {
      const phi = (j * 3 * Math.PI) / 180
      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)

      const sx = (x - z) * cos30
      const sy = y + (x + z) * sin30
      pts.push(`${(cx + sx * scale).toFixed(2)},${(cy - sy * scale).toFixed(2)}`)
    }
    lon_path_els.push(
      `<path d="M ${pts.join(' L ')}" fill="none" stroke="${border_color}" stroke-width="0.8" opacity="0.55"/>`
    )
  }

  const lat_path_els: string[] = []
  for (let i = 1; i < 9; i++) {
    const phi = (i * 20 * Math.PI) / 180
    const pts = []
    for (let j = 0; j <= 72; j++) {
      const theta = (j * 5 * Math.PI) / 180
      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)

      const sx = (x - z) * cos30
      const sy = y + (x + z) * sin30
      pts.push(`${(cx + sx * scale).toFixed(2)},${(cy - sy * scale).toFixed(2)}`)
    }
    lat_path_els.push(
      `<path d="M ${pts.join(' L ')}" fill="none" stroke="${border_color}" stroke-width="0.8" opacity="0.55"/>`
    )
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="bgGrad-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </radialGradient>
        <radialGradient id="globeGrad-${widget.instanceId}" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="${bg1}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="${bg2}" stop-opacity="0.92"/>
        </radialGradient>
        <filter id="glow-${widget.instanceId}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <clipPath id="globeClip-${widget.instanceId}">
          <circle cx="${cx}" cy="${cy}" r="${scale}"/>
        </clipPath>
      </defs>
      <rect width="400" height="400" fill="url(#bgGrad-${widget.instanceId})" rx="12"/>
      <g id="globe-group-${widget.instanceId}">
        <circle cx="${cx}" cy="${cy}" r="${scale}" fill="url(#globeGrad-${widget.instanceId})" stroke="${border_color}" stroke-width="1.5" filter="url(#glow-${widget.instanceId})"/>
        <g clip-path="url(#globeClip-${widget.instanceId})">
          ${lon_path_els.join('\n')}
          ${lat_path_els.join('\n')}
        </g>
        <circle cx="${cx}" cy="${cy}" r="${scale}" fill="none" stroke="${accent_color}" stroke-width="1.5" opacity="0.25"/>
        <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="30s" repeatCount="indefinite"/>
      </g>
      <text x="${cx}" y="384" text-anchor="middle" font-family="${font_data}" font-size="11" fill="${text_color}" opacity="0.55">GodProfile Globe</text>
    </svg>
  `
}
