import { DEFAULT_GITFUT_BASE_URL, DEFAULT_GITFUT_FALLBACK_IMAGE } from '@/constants'
import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { sanitizeId, sanitizeSafeHref } from '@/utils/svgSanitizer'

export function renderGitFutCard(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  width: number,
  height: number
): string {
  const cfg = widget.config || {}
  const username = (data?.user?.login || 'user').trim()
  const country = ((cfg.country as string) || '').trim().toUpperCase()
  const isLoading = cfg.isLoading === true
  const enableHolo = cfg.enableHolo === true

  const queryParam = country ? `?country=${encodeURIComponent(country)}` : ''
  const rawImageUrl = `${DEFAULT_GITFUT_BASE_URL}/${encodeURIComponent(username)}.png${queryParam}`
  const imageUrl = escapeXml(sanitizeSafeHref(rawImageUrl, DEFAULT_GITFUT_FALLBACK_IMAGE))

  const cx = width / 2
  const cy = height / 2
  const id = sanitizeId(widget.instanceId, 'gitfut')

  if (isLoading) {
    return `
      <defs>
        <filter id="fut-glow-${id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="fut-sweep-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#39d353" stop-opacity="0" />
          <stop offset="50%" stop-color="#39d353" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#39d353" stop-opacity="0" />
        </linearGradient>
      </defs>

      <style>
        #widget-${widget.instanceId} .fut-spin-${id} { animation: futRadarSpin-${id} 3s linear infinite; transform-origin: ${cx}px ${cy - 10}px; }
        #widget-${widget.instanceId} .fut-radar-pulse-${id} { animation: futRadarPulse-${id} 2s ease-in-out infinite; transform-origin: ${cx}px ${cy - 10}px; }
        #widget-${widget.instanceId} .fut-scan-${id} { animation: futScanSweep-${id} 2s linear infinite; }
        #widget-${widget.instanceId} .fut-text-${id} { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #39d353; font-weight: bold; letter-spacing: 1.5px; animation: futBlink-${id} 1.4s infinite; }
        #widget-${widget.instanceId} .fut-stat-tag-${id} { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; fill: #eab308; font-weight: 700; }

        @keyframes futRadarSpin-${id} {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes futRadarPulse-${id} {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes futScanSweep-${id} {
          0% { transform: translateY(-40px); }
          100% { transform: translateY(${height + 40}px); }
        }
        @keyframes futBlink-${id} {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.35; }
        }
      </style>

      <rect x="0" y="0" width="${width}" height="70" fill="url(#fut-sweep-${id})" class="fut-scan-${id}" pointer-events="none" />

      <text x="16" y="24" class="fut-text-${id}">GITFUT // SCOUTING ENGINE</text>
      <text x="16" y="38" class="fut-stat-tag-${id}">TARGET: @${escapeXml(username.toUpperCase())}</text>
      <text x="${width - 16}" y="24" class="fut-text-${id}" text-anchor="end">[ RATING / 99 ]</text>

      <g class="fut-radar-pulse-${id}">
        <polygon points="${cx},${cy - 65} ${cx + 56},${cy - 32} ${cx + 56},${cy + 32} ${cx},${cy + 65} ${cx - 56},${cy + 32} ${cx - 56},${cy - 32}" fill="none" stroke="#22c55e" stroke-width="1.2" stroke-opacity="0.6" filter="url(#fut-glow-${id})" />
        <polygon points="${cx},${cy - 45} ${cx + 38},${cy - 22} ${cx + 38},${cy + 22} ${cx},${cy + 45} ${cx - 38},${cy + 22} ${cx - 38},${cy - 22}" fill="none" stroke="#22c55e" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3 3" />
        <polygon points="${cx},${cy - 25} ${cx + 21},${cy - 12} ${cx + 21},${cy + 12} ${cx},${cy + 25} ${cx - 21},${cy + 12} ${cx - 21},${cy - 12}" fill="none" stroke="#22c55e" stroke-width="0.8" stroke-opacity="0.3" />

        <text x="${cx}" y="${cy - 72}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#39d353" font-weight="bold" text-anchor="middle">PAC</text>
        <text x="${cx + 68}" y="${cy - 30}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#39d353" font-weight="bold" text-anchor="start">SHO</text>
        <text x="${cx + 68}" y="${cy + 36}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#39d353" font-weight="bold" text-anchor="start">PAS</text>
        <text x="${cx}" y="${cy + 78}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#39d353" font-weight="bold" text-anchor="middle">DRI</text>
        <text x="${cx - 68}" y="${cy + 36}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#39d353" font-weight="bold" text-anchor="end">DEF</text>
        <text x="${cx - 68}" y="${cy - 30}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#39d353" font-weight="bold" text-anchor="end">PHY</text>

        <polygon points="${cx + 3},${cy - 52} ${cx + 46},${cy - 20} ${cx + 38},${cy + 26} ${cx - 5},${cy + 48} ${cx - 42},${cy + 18} ${cx - 36},${cy - 24}" fill="#22c55e" fill-opacity="0.25" stroke="#39d353" stroke-width="1.8" />
      </g>

      <g class="fut-spin-${id}">
        <line x1="${cx}" y1="${cy - 10}" x2="${cx}" y2="${cy - 65}" stroke="#eab308" stroke-width="2" stroke-linecap="round" filter="url(#fut-glow-${id})" />
        <circle cx="${cx}" cy="${cy - 10}" r="4" fill="#eab308" />
      </g>

      <rect x="16" y="${height - 24}" width="${width - 32}" height="3" fill="#14341e" rx="1.5" />
      <rect x="16" y="${height - 24}" width="${(width - 32) * 0.72}" height="3" fill="#39d353" rx="1.5" filter="url(#fut-glow-${id})" />
      <text x="${width - 16}" y="${height - 10}" class="fut-text-${id}" text-anchor="end">EVALUATING COMMITS &amp; REPOS...</text>
    `
  }

  // If holo effect is not enabled, render the clean transparent FIFA card with zero cropping:
  if (!enableHolo) {
    return `
      <image href="${imageUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
    `
  }

  const rotateX = Number(cfg.rotateX) || 0
  const rotateY = Number(cfg.rotateY) || 0
  const glareX = Number(cfg.glareX) || 50
  const glareY = Number(cfg.glareY) || 50
  const shineX = Number(cfg.shineX) || 50
  const shineY = Number(cfg.shineY) || 50
  const intensity = Number(cfg.intensity) || 1
  const scale = Number(cfg.scale) || 1

  const radX = (rotateX * Math.PI) / 180
  const radY = (rotateY * Math.PI) / 180

  const cosY = Math.cos(radY)
  const sinY = Math.sin(radY)
  const cosX = Math.cos(radX)
  const sinX = Math.sin(radX)

  const a = cosY * scale
  const b = sinY * sinX * scale
  const c = 0
  const d = cosX * scale

  const transformStr = `translate(${cx}, ${cy}) matrix(${a.toFixed(3)}, ${b.toFixed(3)}, ${c.toFixed(3)}, ${d.toFixed(3)}, 0, 0) translate(${-cx}, ${-cy})`

  const glareOpacity = 0.4 * intensity
  const shineOpacity = 0.3 * intensity

  return `
    <defs>
      <filter id="fut-card-shadow-${id}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="${rotateY * 0.4}" dy="${-rotateX * 0.4 + 8}" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
      </filter>

      <radialGradient id="fut-glare-grad-${id}" cx="${glareX}%" cy="${glareY}%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="${glareOpacity}" />
        <stop offset="40%" stop-color="#fef08a" stop-opacity="${glareOpacity * 0.5}" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>

      <linearGradient id="fut-shine-grad-${id}" x1="${shineX - 25}%" y1="${shineY - 25}%" x2="${shineX + 85}%" y2="${shineY + 85}%">
        <stop offset="0%" stop-color="rgba(34,197,94,${shineOpacity})" />
        <stop offset="25%" stop-color="rgba(234,179,8,${shineOpacity * 1.2})" />
        <stop offset="50%" stop-color="rgba(56,189,248,${shineOpacity})" />
        <stop offset="75%" stop-color="rgba(244,63,94,${shineOpacity * 0.8})" />
        <stop offset="100%" stop-color="rgba(234,179,8,${shineOpacity})" />
      </linearGradient>

      <mask id="fut-card-mask-${id}">
        <image href="${imageUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
      </mask>
    </defs>

    <g transform="${transformStr}" filter="url(#fut-card-shadow-${id})">
      <image href="${imageUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
      <g mask="url(#fut-card-mask-${id})">
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#fut-glare-grad-${id})" style="mix-blend-mode: screen;" pointer-events="none" />
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#fut-shine-grad-${id})" style="mix-blend-mode: color-dodge;" pointer-events="none" />
      </g>
    </g>
  `
}
