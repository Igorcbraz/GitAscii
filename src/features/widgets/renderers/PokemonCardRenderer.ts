import { DEFAULT_POKEMON_CARD_IMAGE } from '@/constants'
import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { sanitizeId, sanitizeSafeHref } from '@/utils/svgSanitizer'

export function renderPokemonCard(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  width: number,
  height: number
): string {
  const cfg = widget.config
  const rawImageUrl = (cfg.imageUrl as string) || DEFAULT_POKEMON_CARD_IMAGE
  const imageUrl = escapeXml(sanitizeSafeHref(rawImageUrl, DEFAULT_POKEMON_CARD_IMAGE))
  const isLoading = cfg.isLoading === true

  if (!imageUrl && !isLoading) {
    return `<text x="50%" y="50%" text-anchor="middle" font-family="'Inter Tight', sans-serif" font-size="14" fill="#7a7a7a">No Card Selected</text>`
  }

  const cx = width / 2
  const cy = height / 2

  if (isLoading) {
    const id = sanitizeId(widget.instanceId, 'pkmn') + 'load'
    return `
      <defs>
        <filter id="neon-glow-${id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="scanline-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#c5ff4a" stop-opacity="0" />
          <stop offset="50%" stop-color="#c5ff4a" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#c5ff4a" stop-opacity="0" />
        </linearGradient>
        <pattern id="crosses-${id}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <text x="20" y="20" font-family="'JetBrains Mono', monospace" font-size="10" fill="#313131" text-anchor="middle" dominant-baseline="middle">+</text>
        </pattern>
      </defs>

      <style>
        .cyber-ball-shake-${id} { animation: shakeBall-${id} 2s infinite; transform-origin: ${cx}px ${cy}px; }
        .bg-grid-${id} { animation: pulseBg-${id} 2s infinite; }
        .scanline-${id} { animation: scan-${id} 1.5s linear infinite; }
        .ascii-text-${id} { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: #c5ff4a; font-weight: bold; letter-spacing: 1px; animation: blinkText-${id} 1.5s infinite; }

        @keyframes shakeBall-${id} {
          0%, 80% { transform: rotate(0deg); }
          82% { transform: rotate(-5deg); }
          86% { transform: rotate(5deg); }
          90% { transform: rotate(-5deg); }
          94% { transform: rotate(5deg); }
          98%, 100% { transform: rotate(0deg); }
        }
        @keyframes pulseBg-${id} {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes scan-${id} {
          0% { transform: translateY(-50px); }
          100% { transform: translateY(${height + 50}px); }
        }
        @keyframes blinkText-${id} {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.3; }
        }
      </style>

      <rect width="${width}" height="${height}" fill="#00000000" />

      <g class="bg-grid-${id}">
        <rect width="${width}" height="${height}" fill="url(#crosses-${id})" />

        <text x="16" y="24" class="ascii-text-${id}">SYS.PKMN.DATA // EXTRACTING</text>
        <text x="16" y="40" class="ascii-text-${id}" style="opacity: 0.4;">ID: ${id.slice(0, 8).toUpperCase()}</text>
        <text x="${width - 16}" y="24" class="ascii-text-${id}" text-anchor="end">STATUS: [ FETCHING ]</text>

        <rect x="16" y="${height - 24}" width="80" height="4" fill="#c5ff4a" opacity="0.7" />
        <rect x="100" y="${height - 24}" width="20" height="4" fill="#313131" />
        <rect x="124" y="${height - 24}" width="40" height="4" fill="#c5ff4a" opacity="0.3" />
        <text x="${width - 16}" y="${height - 20}" class="ascii-text-${id}" text-anchor="end">PWR: 100%</text>

        <rect x="0" y="0" width="${width}" height="100" fill="url(#scanline-${id})" class="scanline-${id}" style="mix-blend-mode: screen;" pointer-events="none" />
      </g>

      <g class="cyber-ball-shake-${id}">
        <!-- Top Half -->
        <path d="M ${cx - 75} ${cy} A 75 75 0 0 1 ${cx + 75} ${cy} Z" fill="#1f1f1f" stroke="#c5ff4a" stroke-width="2" filter="url(#neon-glow-${id})"/>
        <rect x="${cx - 75}" y="${cy - 3}" width="150" height="3" fill="#c5ff4a" filter="url(#neon-glow-${id})" />
        <path d="M ${cx - 65} ${cy - 5} A 65 65 0 0 1 ${cx + 65} ${cy - 5}" fill="none" stroke="#c5ff4a" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>

        <!-- Bottom Half -->
        <path d="M ${cx - 75} ${cy} A 75 75 0 0 0 ${cx + 75} ${cy} Z" fill="#060606" stroke="#c5ff4a" stroke-width="2" filter="url(#neon-glow-${id})"/>
        <rect x="${cx - 75}" y="${cy}" width="150" height="3" fill="#c5ff4a" filter="url(#neon-glow-${id})" />
        <path d="M ${cx - 65} ${cy + 5} A 65 65 0 0 0 ${cx + 65} ${cy + 5}" fill="none" stroke="#c5ff4a" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>

        <!-- Center Button -->
        <circle cx="${cx}" cy="${cy}" r="22" fill="#060606" stroke="#c5ff4a" stroke-width="2" filter="url(#neon-glow-${id})"/>
        <circle cx="${cx}" cy="${cy}" r="12" fill="#1f1f1f" stroke="#c5ff4a" stroke-width="1" />
        <circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="#c5ff4a" stroke-width="1" stroke-dasharray="2 2">
          <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="${cx}" cy="${cy}" r="4" fill="#c5ff4a">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      </g>
    `
  }

  const enableHolo = cfg.enableHolo !== false
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

  const cardRatio = 63 / 88
  const containerRatio = width / height

  let cardWidth, cardHeight
  if (containerRatio > cardRatio) {
    cardHeight = height * 0.95
    cardWidth = cardHeight * cardRatio
  } else {
    cardWidth = width * 0.95
    cardHeight = cardWidth / cardRatio
  }

  const cardX = (width - cardWidth) / 2
  const cardY = (height - cardHeight) / 2

  const id = sanitizeId(widget.instanceId, 'pkmn')

  return `
    <defs>
      <filter id="card-shadow-${id}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="${rotateY * 0.5}" dy="${-rotateX * 0.5 + 10}" stdDeviation="15" flood-color="#000" flood-opacity="0.6"/>
      </filter>

      ${
        enableHolo
          ? `
      <radialGradient id="glare-grad-${id}" cx="${glareX}%" cy="${glareY}%" r="70%">
        <stop offset="0%" stop-color="white" stop-opacity="${glareOpacity}" />
        <stop offset="100%" stop-color="white" stop-opacity="0" />
      </radialGradient>

      <linearGradient id="shine-grad-${id}" x1="${shineX - 20}%" y1="${shineY - 20}%" x2="${shineX + 80}%" y2="${shineY + 80}%">
        <stop offset="0%" stop-color="rgba(255,100,100,${shineOpacity})" />
        <stop offset="20%" stop-color="rgba(255,200,100,${shineOpacity})" />
        <stop offset="40%" stop-color="rgba(100,255,100,${shineOpacity})" />
        <stop offset="60%" stop-color="rgba(100,200,255,${shineOpacity})" />
        <stop offset="80%" stop-color="rgba(200,100,255,${shineOpacity})" />
        <stop offset="100%" stop-color="rgba(255,100,200,${shineOpacity})" />
      </linearGradient>
      `
          : ''
      }

      <clipPath id="card-clip-${id}">
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="${cardWidth * 0.05}" />
      </clipPath>
    </defs>

    <g transform="${transformStr}" filter="url(#card-shadow-${id})">
      <g clip-path="url(#card-clip-${id})">
        <image href="${imageUrl}" x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" preserveAspectRatio="xMidYMid slice" />
        ${
          enableHolo
            ? `
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" fill="url(#glare-grad-${id})" style="mix-blend-mode: screen;" pointer-events="none" />
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" fill="url(#shine-grad-${id})" style="mix-blend-mode: color-dodge;" pointer-events="none" />
        `
            : ''
        }
      </g>
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="${cardWidth * 0.05}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" pointer-events="none" />
    </g>
  `
}
