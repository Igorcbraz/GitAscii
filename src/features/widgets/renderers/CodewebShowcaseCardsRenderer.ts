import { icons } from 'lucide-react'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function localEscapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getLucideSvg(iconName: string, size = 28, color = '#ffffff'): string {
  if (!iconName) {
    iconName = 'Target'
  }
  const cleaned = iconName.trim()
  const pascalCase = cleaned
    .split(/[-_ ]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

  const IconComponent =
    (icons as Record<string, React.ElementType>)[pascalCase] ||
    (icons as Record<string, React.ElementType>)[cleaned] ||
    (icons as Record<string, React.ElementType>)[cleaned.toLowerCase()] ||
    icons.Target

  try {
    return ReactDOMServer.renderToStaticMarkup(
      React.createElement(IconComponent, {
        size,
        color,
        strokeWidth: 2,
      })
    )
  } catch {
    return ReactDOMServer.renderToStaticMarkup(
      React.createElement(icons.Target, {
        size,
        color,
        strokeWidth: 2,
      })
    )
  }
}

export function renderCodewebShowcaseCards(
  widget: WidgetInstance,
  _data: NormalizedGitHubData,
  _globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const width = widget.size.width || 800
  const height = widget.size.height || 220
  const cfg = widget.config || {}
  const instanceId = widget.instanceId || 'aura-sc'

  const aboutTag = (cfg.aboutTag as string) ?? (cfg.status as string) ?? 'about'
  const titleLine1 = (cfg.titleLine1 as string) ?? (cfg.title as string) ?? 'Building things'
  const titleLine2 = (cfg.titleLine2 as string) ?? (cfg.role as string) ?? 'that matter.'
  const terminalText = (cfg.terminalText as string) ?? '> open to collaborations'

  const leftGif =
    (cfg.leftGifUrl as string) ||
    'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmVyNmVtYnVubXg1Mmw1MTZ5Y29hdXN0dzJlOTFtNzVmNWwycmgxbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fVsVfxVwz40I24GT7X/giphy.gif'
  const card1Gif =
    (cfg.card1GifUrl as string) ||
    'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZW95cTRnOXM1dTc1YTFwNjRkcGNkN2RqYjdhdTB3NTc3NDFiNjFxYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h58dtf5vTpjulO4M5o/giphy.gif'
  const card2Gif =
    (cfg.card2GifUrl as string) ||
    'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExemdhbXMwdWNkaDA5eTM4Y3ZjYnYzNTR5YnB0M21jdzlrd2gyczQxNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VGh13y4IVFZzCACfTX/giphy.gif'

  const card1IconName = (cfg.card1Icon as string) || 'Target'
  const card1Text = (cfg.card1Text as string) || 'always learning'

  const card2IconName = (cfg.card2Icon as string) || 'Star'
  const card2Text = (cfg.card2Text as string) || 'craft matters'

  const isStatic = forceStatic || Boolean(cfg.staticMode)

  const card1Svg = getLucideSvg(card1IconName, 26, '#ffffff')
  const card2Svg = getLucideSvg(card2IconName, 26, '#ffffff')

  const anim = isStatic
    ? ''
    : `
    <style>
      @keyframes about-orb-l-${instanceId} { 0%, 100% { transform: translate(0,0); opacity: 0.65; } 50% { transform: translate(20px,-14px); opacity: 0.9; } }
      @keyframes about-orb-r-${instanceId} { 0%, 100% { transform: translate(0,0); opacity: 0.55; } 50% { transform: translate(-16px,12px); opacity: 0.8; } }
      @keyframes about-ring-${instanceId} { 0%, 100% { opacity: 0.07; } 50% { opacity: 0.2; } }
      @keyframes about-ring-b-${instanceId} { 0%, 100% { opacity: 0.04; } 50% { opacity: 0.13; } }
      @keyframes cursor-blink-${instanceId} { 0%, 100% { opacity: 1; } 49% { opacity: 1; } 50% { opacity: 0; } 99% { opacity: 0; } }
      #ab-o1-${instanceId} { animation: about-orb-l-${instanceId} 8s ease-in-out infinite; }
      #ab-o2-${instanceId} { animation: about-orb-r-${instanceId} 10s ease-in-out infinite 1s; }
      #ab-o3-${instanceId} { animation: about-orb-l-${instanceId} 7s ease-in-out infinite 2s; }
      #ab-r1-${instanceId} { animation: about-ring-${instanceId} 7s ease-in-out infinite; }
      #ab-r2-${instanceId} { animation: about-ring-${instanceId} 7s ease-in-out infinite 2s; }
      #ab-r3-${instanceId} { animation: about-ring-b-${instanceId} 7s ease-in-out infinite 3.5s; }
      #ab-cursor-${instanceId} { animation: cursor-blink-${instanceId} 1.1s step-end infinite; }
    </style>
  `

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 800 220" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${anim}
        <clipPath id="ab-clip-left-${instanceId}">
          <rect x="0" y="0" width="564" height="220" rx="16" ry="16" />
        </clipPath>
        <clipPath id="ab-clip-r1-${instanceId}">
          <rect x="0" y="0" width="220" height="102" rx="16" ry="16" />
        </clipPath>
        <clipPath id="ab-clip-r2-${instanceId}">
          <rect x="0" y="0" width="220" height="102" rx="16" ry="16" />
        </clipPath>

        <radialGradient id="ab-gl-${instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(108,195,130,0.6)" />
          <stop offset="100%" stop-color="rgba(108,195,130,0)" />
        </radialGradient>
        <radialGradient id="ab-gr-${instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(230,100,115,0.5)" />
          <stop offset="100%" stop-color="rgba(230,100,115,0)" />
        </radialGradient>
        <radialGradient id="ab-gb-${instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(195,155,255,0.35)" />
          <stop offset="100%" stop-color="rgba(195,155,255,0)" />
        </radialGradient>
      </defs>

      <!-- LEFT CARD: Hero Showcase (564 x 220) -->
      <g>
        <rect x="0" y="0" width="564" height="220" rx="16" ry="16" fill="#08080d" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

        <g clip-path="url(#ab-clip-left-${instanceId})">
          <!-- Background GIF -->
          ${
            leftGif
              ? `<image href="${localEscapeXml(leftGif)}" x="0" y="0" width="564" height="220" preserveAspectRatio="xMidYMid slice" opacity="0.35" />`
              : ''
          }

          <!-- Glowing Orbs & Concentric Rings -->
          <ellipse id="ab-o1-${instanceId}" cx="40"  cy="180" rx="130" ry="110" fill="url(#ab-gl-${instanceId})" />
          <ellipse id="ab-o2-${instanceId}" cx="320" cy="40"  rx="120" ry="100" fill="url(#ab-gr-${instanceId})" />
          <ellipse id="ab-o3-${instanceId}" cx="260" cy="200" rx="100" ry="90"  fill="url(#ab-gb-${instanceId})" />
          <circle id="ab-r1-${instanceId}" cx="165" cy="110" r="38"  fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="0.7" opacity="0.12" />
          <circle id="ab-r2-${instanceId}" cx="165" cy="110" r="65"  fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="0.7" opacity="0.12" />
          <circle id="ab-r3-${instanceId}" cx="165" cy="110" r="100" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="0.7" opacity="0.08" />
        </g>

        <!-- Content Overlay -->
        <g transform="translate(28, 0)">
          <!-- Eyebrow / Tag -->
          <text x="0" y="62" fill="rgba(255,255,255,0.35)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="500" letter-spacing="3">${localEscapeXml(aboutTag.toUpperCase())}</text>

          <!-- Headline Line 1 -->
          <text x="0" y="98" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="0.2">${localEscapeXml(titleLine1)}</text>

          <!-- Headline Line 2 -->
          <text x="0" y="126" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="0.2">${localEscapeXml(titleLine2)}</text>

          <!-- Terminal / Prompt Line -->
          <g transform="translate(0, 164)">
            <text x="0" y="0" fill="rgba(255,255,255,0.45)" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" font-size="13" font-weight="400">${localEscapeXml(terminalText)}</text>
            <!-- Cursor positioned after terminal text -->
            <text id="ab-cursor-${instanceId}" x="${terminalText.length * 7.8 + 4}" y="0" fill="rgba(255,255,255,0.6)" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" font-size="13" font-weight="400">_</text>
          </g>
        </g>
      </g>

      <!-- RIGHT CARD 1 (Top: 220 x 102 at x=580, y=0) -->
      <g transform="translate(580, 0)">
        <rect x="0" y="0" width="220" height="102" rx="16" ry="16" fill="#08080d" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

        <g clip-path="url(#ab-clip-r1-${instanceId})">
          ${
            card1Gif
              ? `<image href="${localEscapeXml(card1Gif)}" x="0" y="0" width="220" height="102" preserveAspectRatio="xMidYMid slice" opacity="0.3" />`
              : ''
          }
        </g>

        <!-- Icon & Label Centered -->
        <g transform="translate(110, 36)">
          <g transform="translate(-13, -13)">
            ${card1Svg}
          </g>
          <text x="0" y="32" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="500" letter-spacing="2">${localEscapeXml(card1Text.toUpperCase())}</text>
        </g>
      </g>

      <!-- RIGHT CARD 2 (Bottom: 220 x 102 at x=580, y=118) -->
      <g transform="translate(580, 118)">
        <rect x="0" y="0" width="220" height="102" rx="16" ry="16" fill="#08080d" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

        <g clip-path="url(#ab-clip-r2-${instanceId})">
          ${
            card2Gif
              ? `<image href="${localEscapeXml(card2Gif)}" x="0" y="0" width="220" height="102" preserveAspectRatio="xMidYMid slice" opacity="0.3" />`
              : ''
          }
        </g>

        <!-- Icon & Label Centered -->
        <g transform="translate(110, 36)">
          <g transform="translate(-13, -13)">
            ${card2Svg}
          </g>
          <text x="0" y="32" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="500" letter-spacing="2">${localEscapeXml(card2Text.toUpperCase())}</text>
        </g>
      </g>
    </svg>
  `
}
