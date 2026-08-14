import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function localEscapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

interface SocialPlatformDef {
  name: string
  label: string
  bgColor: string
  accentColor: string
  gradientId: string
  stops: { offset: string; color: string }[]
  iconSvg: string
}

const SOCIAL_PLATFORMS: Record<string, SocialPlatformDef> = {
  github: {
    name: 'GitHub',
    label: 'GitHub',
    bgColor: '#141414',
    accentColor: '#ffffff',
    gradientId: 'smb-grad-GitHub',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#ffffff' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#ffffff" fill-rule="evenodd" clip-rule="evenodd" d="M9 1.5C4.858 1.5 1.5 4.858 1.5 9c0 3.314 2.149 6.126 5.13 7.12.375.068.513-.163.513-.361v-1.266c-2.087.454-2.527-.946-2.527-.946-.341-.867-.833-1.098-.833-1.098-.681-.466.052-.456.052-.456.753.053 1.15.773 1.15.773.67 1.147 1.756.816 2.184.624.068-.485.262-.816.476-1.003-1.666-.19-3.418-.833-3.418-3.708 0-.819.292-1.488.773-2.013-.078-.19-.335-.952.073-1.986 0 0 .63-.202 2.063.769.598-.166 1.24-.249 1.878-.252.637.003 1.279.086 1.878.252 1.432-.971 2.061-.769 2.061-.769.41 1.034.153 1.796.075 1.986.482.525.772 1.194.772 2.013 0 2.883-1.755 3.515-3.426 3.702.27.233.51.691.51 1.393v2.065c0 .201.136.433.517.359C14.354 15.122 16.5 12.312 16.5 9c0-4.142-3.358-7.5-7.5-7.5z"/>`,
  },
  instagram: {
    name: 'Instagram',
    label: 'Instagram',
    bgColor: '#2b0a2b',
    accentColor: '#E4405F',
    gradientId: 'smb-grad-Instagram',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#E4405F' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#f5f5f5" d="M9 3.5c1.792 0 2.004.007 2.712.039.655.03 1.011.139 1.248.231.314.122.538.267.773.502.235.235.38.459.502.773.092.237.201.593.231 1.248.032.708.039.92.039 2.712s-.007 2.004-.039 2.712c-.03.655-.139 1.011-.231 1.248-.122.314-.267.538-.502.773-.235.235-.459.38-.773.502-.237.092-.593.201-1.248.231-.708.032-.92.039-2.712.039s-2.004-.007-2.712-.039c-.655-.03-1.011-.139-1.248-.231-.314-.122-.538-.267-.773-.502-.235-.235-.38-.459-.502-.773-.092-.237-.201-.593-.231-1.248C3.507 11.004 3.5 10.792 3.5 9s.007-2.004.039-2.712c.03-.655.139-1.011.231-1.248.122-.314.267-.538.502-.773.235-.235.459-.38.773-.502.237-.092.593-.201 1.248-.231.708-.032.92-.039 2.712-.039zm0-1.5c-1.823 0-2.051.008-2.766.04-.714.033-1.202.146-1.629.312a3.868 3.868 0 0 0-1.398.91 3.868 3.868 0 0 0-.91 1.398c-.166.427-.279.915-.312 1.629C2.008 6.949 2 7.177 2 9c0 1.823.008 2.051.04 2.766.033.714.146 1.202.312 1.629.166.427.387.79.91 1.398.523.523.886.744 1.398.91.427.166.915.279 1.629.312.715.032.943.04 2.766.04s2.051-.008 2.766-.04c.714-.033 1.202-.146 1.629-.312.427-.166.875-.387 1.398-.91.523-.523.744-.886.91-1.398.166-.427.279-.915.312-1.629.032-.715.04-.943.04-2.766s-.008-2.051-.04-2.766c-.033-.714-.146-1.202-.312-1.629a3.868 3.868 0 0 0-.91-1.398 3.868 3.868 0 0 0-1.398-.91c-.427-.166-.915-.279-1.629-.312C11.051 2.008 10.823 2 9 2zm0 3.414A3.586 3.586 0 1 0 12.586 9 3.586 3.586 0 0 0 9 5.414zm0 5.758A2.172 2.172 0 1 1 11.172 9 2.172 2.172 0 0 1 9 11.172zm3.727-6.07a.838.838 0 1 1-.838-.838.838.838 0 0 1 .838.838z"/>`,
  },
  facebook: {
    name: 'Facebook',
    label: 'Facebook',
    bgColor: '#0d1b3d',
    accentColor: '#1877F2',
    gradientId: 'smb-grad-Facebook',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#1877F2' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#f5f5f5" d="M14.5 1.5H3.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h5.5v-5.5H7.5V8.5H9V7c0-1.657 1.343-3 3-3h2v2.5h-1.5c-.552 0-1 .448-1 1v1h2.5l-.5 2.5h-2v5.5h3.5a2 2 0 0 0 2-2v-11a2 2 0 0 0-2-2z"/>`,
  },
  gmail: {
    name: 'Gmail',
    label: 'Gmail',
    bgColor: '#331010',
    accentColor: '#EA4335',
    gradientId: 'smb-grad-Gmail',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#EA4335' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#EA4335" d="M1.5 4.5v9a1.5 1.5 0 0 0 1.5 1.5h1.5V8.25L9 11.25l4.5-3v6.75H15a1.5 1.5 0 0 0 1.5-1.5v-9L9 8.25 1.5 4.5z"/><path fill="#FBBC05" d="M16.5 4.5V3A1.5 1.5 0 0 0 15 1.5h-1.5L9 4.5l4.5 3.75 3-3.75z"/><path fill="#4285F4" d="M1.5 4.5l3 3.75L9 4.5 4.5 1.5H3A1.5 1.5 0 0 0 1.5 3v1.5z"/>`,
  },
  x: {
    name: 'X',
    label: 'X / Twitter',
    bgColor: '#101010',
    accentColor: '#ffffff',
    gradientId: 'smb-grad-X',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#222222' },
      { offset: '50%', color: '#dddddd' },
      { offset: '60%', color: '#ffffff' },
      { offset: '80%', color: '#222222' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#ffffff" d="M13.2 2h2.5l-5.4 6.2L16.6 16h-5l-3.9-5.1L3.2 16H.7l5.8-6.6L.4 2h5.1l3.5 4.7L13.2 2zm-.9 12.5h1.4L4.8 3.4H3.3l9 11.1z"/>`,
  },
  linkedin: {
    name: 'LinkedIn',
    label: 'LinkedIn',
    bgColor: '#002244',
    accentColor: '#0A66C2',
    gradientId: 'smb-grad-LinkedIn',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#0A66C2' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#0A66C2" d="M2.5 3.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-1.5 2h3v11h-3v-11zm5 0h2.9v1.5h.1c.4-.8 1.4-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.8v6.4h-3v-5.7c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.8h-3v-11z"/>`,
  },
  discord: {
    name: 'Discord',
    label: 'Discord',
    bgColor: '#1a1d36',
    accentColor: '#5865F2',
    gradientId: 'smb-grad-Discord',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#5865F2' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#5865F2" d="M14.5 3.2s-1.3-.6-2.7-.8c-.2.3-.4.7-.5 1-1.4-.2-2.8-.2-4.2 0-.2-.3-.4-.7-.5-1-1.4.2-2.7.8-2.7.8-1.7 2.6-2.2 5.1-2 7.6 1.2.9 2.3 1.4 3.4 1.8.3-.4.5-.8.8-1.2-1.2-.4-1.7-1-1.7-1s.1.1.3.2c2.4 1.1 4.9 1.1 7.3 0 .2-.1.3-.2.3-.2s-.5.6-1.7 1c.3.4.5.8.8 1.2 1.1-.4 2.2-.9 3.4-1.8.3-2.9-.6-5.4-2-7.6zM6.5 9.5c-.7 0-1.3-.6-1.3-1.4s.6-1.4 1.3-1.4 1.3.6 1.3 1.4-.6 1.4-1.3 1.4zm5 0c-.7 0-1.3-.6-1.3-1.4s.6-1.4 1.3-1.4 1.3.6 1.3 1.4-.6 1.4-1.3 1.4z"/>`,
  },
  youtube: {
    name: 'YouTube',
    label: 'YouTube',
    bgColor: '#3b0d0d',
    accentColor: '#FF0000',
    gradientId: 'smb-grad-YouTube',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#FF0000' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#FF0000" d="M16.5 5.5s-.2-1.2-.7-1.7c-.7-.7-1.4-.7-1.8-.8C11.5 2.8 9 2.8 9 2.8s-2.5 0-5 .2c-.4.1-1.1.1-1.8.8-.5.5-.7 1.7-.7 1.7S1.3 7 1.3 8.4v1.2c0 1.4.2 2.9.2 2.9s.2 1.2.7 1.7c.7.7 1.6.7 2 .8 1.5.1 4.8.2 4.8.2s2.5 0 5-.2c.4-.1 1.1-.1 1.8-.8.5-.5.7-1.7.7-1.7s.2-1.5.2-2.9V8.4c0-1.4-.2-2.9-.2-2.9zM7.5 11V6.5l4.5 2.25L7.5 11z"/>`,
  },
  twitch: {
    name: 'Twitch',
    label: 'Twitch',
    bgColor: '#21103b',
    accentColor: '#9146FF',
    gradientId: 'smb-grad-Twitch',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#9146FF' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#9146FF" d="M2 1.5h14v9.5l-3.5 3.5h-3l-2 2v-2H4.5L2 11.5V1.5zm11.5 8V3.5h-9v7h2.5v1.5L8.5 10.5h2.5l2.5-2.5z"/><path fill="#ffffff" d="M7 5.5h1.5v3.5H7V5.5zm3.5 0H12v3.5h-1.5V5.5z"/>`,
  },
  portfolio: {
    name: 'Portfolio',
    label: 'Portfolio / Web',
    bgColor: '#0f241d',
    accentColor: '#10B981',
    gradientId: 'smb-grad-Portfolio',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#10B981' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#10B981" d="M9 1.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm-5.9 7h3.1c.1-1.3.4-2.5.8-3.6-1.8.8-3.2 2-3.9 3.6zm3.1 2H3.1c.7 1.6 2.1 2.8 3.9 3.6-.4-1.1-.7-2.3-.8-3.6zm1.8 0h2c-.1 1.2-.4 2.2-.8 3-.4-.8-.7-1.8-.8-3zm0-2h2c-.1-1.2-.4-2.2-.8-3-.4.8-.7 1.8-.8 3zm4.9-2h-3.1c-.1-1.3-.4-2.5-.8-3.6 1.8.8 3.2 2 3.9 3.6zm-3.1 4h3.1c-.7 1.6-2.1 2.8-3.9 3.6.4-1.1.7-2.3.8-3.6z"/>`,
  },
  repositories: {
    name: 'Repositories',
    label: 'Repositories',
    bgColor: '#161b22',
    accentColor: '#58a6ff',
    gradientId: 'smb-grad-Repositories',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#58a6ff' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#58a6ff" fill-rule="evenodd" clip-rule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zm2 .5v8h8v-8H4zm2 2h4v1.5H6V6zm0 2.5h4V10H6V8.5z"/>`,
  },
  stars: {
    name: 'Total Stars',
    label: 'Total Stars',
    bgColor: '#1e1b12',
    accentColor: '#e3b341',
    gradientId: 'smb-grad-Stars',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#e3b341' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#e3b341" fill-rule="evenodd" clip-rule="evenodd" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>`,
  },
  followers: {
    name: 'Followers',
    label: 'Followers',
    bgColor: '#151b23',
    accentColor: '#3fb950',
    gradientId: 'smb-grad-Followers',
    stops: [
      { offset: '0%', color: '#ffffff' },
      { offset: '10%', color: '#111111' },
      { offset: '50%', color: '#eeeeee' },
      { offset: '60%', color: '#3fb950' },
      { offset: '80%', color: '#111111' },
      { offset: '100%', color: '#555555' },
    ],
    iconSvg: `<path fill="#3fb950" fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM2 5.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm10-1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-2.5 1.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zM1 13c0-1.657 2.015-3 4.5-3s4.5 1.343 4.5 3v1H1v-1zm1.5 0c.264-.78 1.41-1.5 3-1.5s2.736.72 3 1.5H2.5zm9 0c0-.853-.518-1.57-1.31-2.028.324-.07.67-.107 1.03-.107 1.933 0 3.5.895 3.5 2v1h-3.22H11.5z"/>`,
  },
}

function renderPillSvg(
  platformKey: string,
  customLabel: string | undefined,
  showIcons: boolean,
  showText: boolean,
  x: number,
  y: number,
  height: number,
  isStatic: boolean,
  animSpeed: string
): { svg: string; defs: string; width: number } {
  const p = SOCIAL_PLATFORMS[platformKey.toLowerCase()] || SOCIAL_PLATFORMS.github
  const label = customLabel || p.label
  const uniqueId = `pill-${p.name.toLowerCase()}-${Math.floor(x)}-${Math.floor(y)}`

  // Calculate pill width based on content
  const charWidth = 8
  const iconSpace = showIcons ? 26 : 0
  const textSpace = showText ? label.length * charWidth : 0
  const padding = 28
  const pillWidth = Math.max(iconSpace + textSpace + padding, showIcons && !showText ? 44 : 90)

  const stopList = p.stops
    .map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"></stop>`)
    .join('\n')

  const animTransform = isStatic
    ? ''
    : `<animateTransform attributeName="gradientTransform" type="rotate" from="0 0.5 0.5" to="360 0.5 0.5" dur="${animSpeed}" repeatCount="indefinite" />`

  const defs = `
    <linearGradient id="grad-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
      ${stopList}
      ${animTransform}
    </linearGradient>
  `

  const iconX = x + (showText ? 14 : (pillWidth - 18) / 2)
  const iconY = y + (height - 18) / 2

  const textX = showIcons ? iconX + 26 : x + pillWidth / 2
  const textAnchor = showIcons ? 'start' : 'middle'
  const textY = y + height / 2 + 5

  const iconElement = showIcons
    ? `<g transform="translate(${iconX}, ${iconY}) scale(1)">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          ${p.iconSvg}
        </svg>
      </g>`
    : ''

  const textElement = showText
    ? `<text x="${textX}" y="${textY}" text-anchor="${textAnchor}" fill="#f5f5f5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="500" letter-spacing="0.2">${localEscapeXml(label)}</text>`
    : ''

  const svg = `
    <g id="${uniqueId}">
      <!-- Outer rotating gradient border -->
      <rect x="${x}" y="${y}" width="${pillWidth}" height="${height}" rx="${height / 2}" ry="${height / 2}" fill="none" stroke="url(#grad-${uniqueId})" stroke-width="1.8" />
      
      <!-- Dark container background with subtle glow -->
      <rect x="${x + 1}" y="${y + 1}" width="${pillWidth - 2}" height="${height - 2}" rx="${(height - 2) / 2}" ry="${(height - 2) / 2}" fill="${p.bgColor}" />
      
      <!-- Inner highlight layer -->
      <rect x="${x + 1}" y="${y + 1}" width="${pillWidth - 2}" height="${height - 2}" rx="${(height - 2) / 2}" ry="${(height - 2) / 2}" fill="rgba(255,255,255,0.03)" />
      
      <!-- Icon & Text Content -->
      ${iconElement}
      ${textElement}
    </g>
  `

  return { svg, defs, width: pillWidth }
}

export function renderCodewebSocialBadge(
  widget: WidgetInstance,
  _data: NormalizedGitHubData,
  _globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const width = widget.size.width || 800
  const height = widget.size.height || 44
  const cfg = widget.config || {}

  const renderMode = (cfg.renderMode as 'single' | 'multi' | 'grid') || 'multi'
  const isStatic = forceStatic || Boolean(cfg.staticMode)
  const animSpeed = (cfg.animSpeed as string) || '8s'
  const showIcons = cfg.showIcons !== false
  const showText = cfg.showText !== false

  const allDefs: string[] = []
  const elements: string[] = []

  let viewBoxW = 800
  let viewBoxH = 44

  if (renderMode === 'single') {
    const platform = (cfg.platform as string) || 'github'
    const customLabel =
      (cfg.customLabel as string) || (cfg.username ? `${platform}: @${cfg.username}` : undefined)

    // In single mode, calculate pill dimensions and size viewBox to fit snugly or centered
    const pill = renderPillSvg(
      platform,
      customLabel,
      showIcons,
      showText,
      2,
      2,
      40,
      isStatic,
      animSpeed
    )
    allDefs.push(pill.defs)
    elements.push(pill.svg)
    viewBoxW = pill.width + 4
    viewBoxH = 44
  } else if (renderMode === 'grid') {
    // Grid mode: 2, 3 or 4 columns
    const columns = Math.max(1, Number(cfg.gridColumns) || 2)
    const defaultList = ['github', 'instagram', 'facebook', 'gmail', 'x', 'linkedin']
    const activeList =
      Array.isArray(cfg.platforms) && cfg.platforms.length > 0
        ? (cfg.platforms as string[])
        : defaultList

    const gapX = 16
    const gapY = 14
    const pillHeight = 44

    // Fixed width per pill in grid mode for clean aligned cards
    const gridPillWidth = Math.floor((800 - (columns - 1) * gapX) / columns)
    const rows = Math.ceil(activeList.length / columns)
    viewBoxW = 800
    viewBoxH = rows * pillHeight + (rows - 1) * gapY + 8

    activeList.forEach((pKey, i) => {
      const col = i % columns
      const row = Math.floor(i / columns)
      const px = col * (gridPillWidth + gapX)
      const py = row * (pillHeight + gapY) + 4
      const customLabel = (cfg[`label_${pKey}`] as string) || undefined

      const pill = renderPillSvg(
        pKey,
        customLabel,
        showIcons,
        showText,
        px,
        py,
        pillHeight,
        isStatic,
        animSpeed
      )
      allDefs.push(pill.defs)
      elements.push(pill.svg)
    })
  } else {
    // Multi (horizontal strip) mode
    const defaultList = ['github', 'instagram', 'facebook', 'gmail']
    const activeList =
      Array.isArray(cfg.platforms) && cfg.platforms.length > 0
        ? (cfg.platforms as string[])
        : defaultList

    const spacing = 12
    const pillHeight = 44
    const pillY = 2

    // Pre-calculate positions to center if total width fits
    const pillsInfo = activeList.map((pKey) => {
      const customLabel = (cfg[`label_${pKey}`] as string) || undefined
      return renderPillSvg(
        pKey,
        customLabel,
        showIcons,
        showText,
        0,
        pillY,
        pillHeight,
        isStatic,
        animSpeed
      )
    })

    const totalWidth = pillsInfo.reduce((acc, p) => acc + p.width + spacing, 0) - spacing
    viewBoxW = Math.max(totalWidth + 20, 800)
    viewBoxH = 48
    let currentX = Math.max((viewBoxW - totalWidth) / 2, 10)

    activeList.forEach((pKey) => {
      const customLabel = (cfg[`label_${pKey}`] as string) || undefined
      const pill = renderPillSvg(
        pKey,
        customLabel,
        showIcons,
        showText,
        currentX,
        pillY,
        pillHeight,
        isStatic,
        animSpeed
      )
      currentX += pill.width + spacing
      allDefs.push(pill.defs)
      elements.push(pill.svg)
    })
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${viewBoxW} ${viewBoxH}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${allDefs.join('\n')}
      </defs>
      <g>
        ${elements.join('\n')}
      </g>
    </svg>
  `
}
