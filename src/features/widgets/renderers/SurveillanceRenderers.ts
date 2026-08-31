import { getTechInfo } from '@/data/techCatalog'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function esc(str: string): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cw(size: number): number {
  return size * 0.6
}

function wrap(text: string, maxchars: number): string[] {
  if (!text) return []
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (cur && cur.length + 1 + w.length > maxchars) {
      lines.push(cur)
      cur = w
    } else {
      cur = cur ? `${cur} ${w}` : w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(85,255,255,${alpha})`
  if (hex.startsWith('rgba(')) {
    return hex.replace(/[\d.]+\)$/, `${alpha})`)
  }
  let h = hex.replace('#', '').trim()
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (!/^[0-9A-F]{6}$/i.test(h)) {
    return hex
  }
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export interface SurveillancePalette {
  primary: string
  secondary: string
  led: string
  ground: string
  black: string
  text: string
  dim: string
  gray: string
  bright: string
  green: string
  red: string
  yellow: string
  bc: string
  bc2: string
  bch: string
  calShades: string[]
}

export function resolvePalette(
  cfg: Record<string, unknown>,
  globalStyles?: GlobalStyles
): SurveillancePalette {
  const primary = (cfg.accentColor as string) || globalStyles?.accentColor || '#55ffff'

  const secondary = (cfg.secondaryColor as string) || '#c084fc'

  const led = (cfg.ledColor as string) || '#ff5555'

  const bc = hexToRgba(primary, 0.3)
  const bc2 = hexToRgba(primary, 0.18)
  const bch = hexToRgba(primary, 0.6)

  const calShades = [
    hexToRgba(primary, 0.1),
    hexToRgba(primary, 0.28),
    hexToRgba(primary, 0.5),
    hexToRgba(primary, 0.72),
    primary,
  ]

  return {
    primary,
    secondary,
    led,
    ground: '#050308',
    black: '#000000',
    text: '#aaaaaa',
    dim: '#6f6478',
    gray: '#8a8a8a',
    bright: '#e6fbfb',
    green: '#55ff55',
    red: '#ff5555',
    yellow: '#ffff55',
    bc,
    bc2,
    bch,
    calShades,
  }
}

const C = {
  ground: '#050308',
  black: '#000000',
  text: '#aaaaaa',
  dim: '#6f6478',
  gray: '#8a8a8a',
  bright: '#e6fbfb',
  cyan: '#55ffff',
  green: '#55ff55',
  red: '#ff5555',
  yellow: '#ffff55',
  purple: '#c084fc',
}

function getBaseCss(id: string): string {
  return `
    #${id} text, #${id} tspan { font-family: 'Departure Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre; }
    #${id} .led { animation: blink-${id} 1.1s steps(1,end) infinite; }
    @keyframes blink-${id} { 0%,55%{opacity:1} 56%,100%{opacity:.12} }
  `
}

function getDefs(id: string, pal?: SurveillancePalette): string {
  const p = pal || resolvePalette({})
  const hex = (p.primary || '#55ffff').replace('#', '')
  const rNorm = (parseInt(hex.slice(0, 2) || '55', 16) / 255).toFixed(3)
  const gNorm = (parseInt(hex.slice(2, 4) || 'ff', 16) / 255).toFixed(3)
  const bNorm = (parseInt(hex.slice(4, 6) || 'ff', 16) / 255).toFixed(3)

  return `
    <defs>
      <pattern id="scan-${id}" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="2" fill="#000"/>
      </pattern>
      <radialGradient id="vig-${id}" cx="50%" cy="50%" r="62%">
        <stop offset="55%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity=".6"/>
      </radialGradient>
      <radialGradient id="amb1-${id}" cx="24%" cy="12%" r="46%">
        <stop offset="0%" stop-color="${p.primary}" stop-opacity=".06"/>
        <stop offset="100%" stop-color="${p.primary}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="amb2-${id}" cx="80%" cy="92%" r="52%">
        <stop offset="0%" stop-color="${p.secondary}" stop-opacity=".11"/>
        <stop offset="100%" stop-color="${p.secondary}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="nmfade-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity=".9"/>
      </linearGradient>
      <filter id="glow-${id}" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.6" result="b"/>
        <feMerge>
          <feMergeNode in="b"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="avtint-${id}">
        <feColorMatrix type="matrix" values="
          0.33 0.33 0.33 0 0
          0.33 0.33 0.33 0 0
          0.33 0.33 0.33 0 0
          0    0    0    1 0
        " result="gray"/>
        <feComponentTransfer in="gray" result="contrast">
          <feFuncR type="linear" slope="1.2" intercept="-0.08"/>
          <feFuncG type="linear" slope="1.2" intercept="-0.08"/>
          <feFuncB type="linear" slope="1.2" intercept="-0.08"/>
        </feComponentTransfer>
        <feColorMatrix in="contrast" type="matrix" values="
          ${rNorm} 0 0 0 0
          0 ${gNorm} 0 0 0
          0 0 ${bNorm} 0 0
          0 0 0 1 0
        "/>
      </filter>
    </defs>
  `
}

function led(x: number, y: number, color = '#ff5555', blink = true, id = ''): string {
  const cls = blink ? ' class="led"' : ''
  const filter = id ? ` filter="url(#glow-${id})"` : ''
  return `<rect x="${x}" y="${y - 4}" width="8" height="8" fill="${color}"${cls}${filter}/>`
}

function corners(
  x: number,
  y: number,
  w: number,
  h: number,
  col = 'rgba(85,255,255,.60)',
  s = 12,
  inset = 5
): string {
  const L = x + inset
  const R = x + w - inset
  const T = y + inset
  const B = y + h - inset
  const p = [
    `<path d="M${L} ${T + s} v${-s} M${L} ${T} h${s}"/>`,
    `<path d="M${R} ${T + s} v${-s} M${R} ${T} h${-s}"/>`,
    `<path d="M${L} ${B - s} v${s} M${L} ${B} h${s}"/>`,
    `<path d="M${R} ${B - s} v${s} M${R} ${B} h${-s}"/>`,
  ]
  return `<g stroke="${col}" stroke-width="1" fill="none">${p.join('')}</g>`
}

function scanlines(x: number, y: number, w: number, h: number, op = 0.18, id = ''): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#scan-${id})" opacity="${op}"/>`
}

function panelFrame(
  w: number,
  h: number,
  title: string,
  ref: string,
  y0 = 0,
  id = '',
  pal?: SurveillancePalette
): string {
  const p = pal || resolvePalette({})
  const parts: string[] = []
  parts.push(
    `<rect x="1" y="${y0 + 1}" width="${w - 2}" height="${h - 2}" fill="${p.black}" stroke="${p.bc}"/>`
  )
  parts.push(
    `<rect x="1" y="${y0 + 1}" width="${w - 2}" height="26" fill="${hexToRgba(p.primary, 0.05)}"/>`
  )
  parts.push(`<line x1="1" y1="${y0 + 27}" x2="${w - 1}" y2="${y0 + 27}" stroke="${p.bc2}"/>`)
  parts.push(led(16, y0 + 14, p.led, true, id))
  parts.push(
    `<text x="30" y="${y0 + 17.5}" font-size="9.5" letter-spacing="1.6" fill="${p.primary}">${esc(title)}</text>`
  )
  parts.push(
    `<text x="${w - 14}" y="${y0 + 17.5}" font-size="9.5" letter-spacing="1.6" text-anchor="end" fill="${p.gray}">${esc(ref)}</text>`
  )
  parts.push(corners(1, y0 + 1, w - 2, h - 2, p.bch, 12, 5))
  parts.push(scanlines(2, y0 + 28, w - 4, h - 30, 0.18, id))
  return parts.join('')
}

function wrapSvg(
  w: number,
  h: number,
  id: string,
  extraCss: string,
  body: string,
  bgOn = true,
  pal?: SurveillancePalette
): string {
  const p = pal || resolvePalette({})
  const bgHtml = bgOn
    ? `
      <rect width="${w}" height="${h}" fill="${p.ground}"/>
      <rect width="${w}" height="${h}" fill="url(#amb1-${id})"/>
      <rect width="${w}" height="${h}" fill="url(#amb2-${id})"/>
    `
    : ''
  return `
    <svg xmlns="http://www.w3.org/2000/svg" id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" font-family="'Departure Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace">
      ${getDefs(id, p)}
      <style>
        ${getBaseCss(id)}
        ${extraCss}
      </style>
      ${bgHtml}
      ${body}
    </svg>
  `
}

export function renderSurveillanceHeader(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const w = widget.size.width || 780
  const cfg = widget.config || {}
  const id = widget.instanceId || 'surv-hdr'
  const pal = resolvePalette(cfg, globalStyles)

  const username = (cfg.username as string) || data.user.login || 'operator'
  const name = (cfg.displayName as string) || data.user.name || username
  const bio = (cfg.customBio as string) || data.user.bio || 'Terminal Purist // Open Source Hacker'
  const modeTag = (cfg.modeTag as string) || '198X MODE'
  const sigStatus = (cfg.sigStatus as string) || 'STRONG'
  const roleTag = (cfg.roleTag as string) || 'Developer'
  const quoteText =
    (cfg.quoteText as string) ||
    '“Once I told the computer to do something and it did it exactly how I told it to.”'
  const coords = (cfg.coords as string) || '◎ 12.911210, 79.132685'
  const avatarUrl =
    (cfg.avatarUrl as string) || data.user.avatar_url || `https://github.com/${username}.png`

  const fw = Math.min(300, Math.max(200, Math.round(w * 0.38)))
  const fh = Math.round(fw * 0.75)
  const rowY = 176
  const h = widget.size.height || rowY + fh + 16

  const css = forceStatic
    ? ''
    : `
      @keyframes jitter-${id}{0%,93%,100%{transform:translateX(0)}94%{transform:translateX(-3px)}96%{transform:translateX(2px)}98%{transform:translateX(-1px)}}
      #${id} .nm{animation:jitter-${id} 7s steps(1) infinite;transform-box:fill-box}
      @keyframes roll-${id}{0%{transform:translateY(-14px)}100%{transform:translateY(${fh}px)}}
      #${id} .track{animation:roll-${id} 9s linear infinite}
    `

  const b: string[] = []

  b.push(
    `<text x="8" y="14" font-size="10" letter-spacing="1.5" fill="${pal.dim}">NODE//${esc(username)}  ·  SIG:<tspan fill="${pal.green}">${esc(sigStatus)}</tspan>  ·  ${esc(modeTag)}</text>`
  )
  b.push(led(w - 116, 10, pal.led, !forceStatic, id))
  b.push(
    `<text x="${w - 8}" y="14" font-size="10" letter-spacing="1.5" text-anchor="end" fill="${pal.red}">REC 00:37:12</text>`
  )
  b.push(`<line x1="8" y1="24" x2="${w - 8}" y2="24" stroke="${pal.bc2}"/>`)

  const cx = w / 2
  b.push(
    `<text x="${cx}" y="52" font-size="10.5" letter-spacing="2.4" text-anchor="middle" fill="${pal.primary}" opacity=".8">[ SYSTEM :: OXIDE TERMINAL PROFILE :: ${esc(modeTag)} ]</text>`
  )

  const nm = `&gt; ${esc(name)}`
  if (!forceStatic) {
    b.push(
      `<text class="nm" x="${cx - 2}" y="108" font-size="48" letter-spacing="5" text-anchor="middle" fill="${pal.red}" opacity=".5">${nm}</text>`
    )
    b.push(
      `<text class="nm" x="${cx + 2}" y="108" font-size="48" letter-spacing="5" text-anchor="middle" fill="${pal.primary}" opacity=".55">${nm}</text>`
    )
  }
  b.push(
    `<text class="nm" x="${cx}" y="108" font-size="48" letter-spacing="5" text-anchor="middle" fill="${pal.bright}" filter="url(#glow-${id})"><tspan fill="${pal.dim}">&gt;</tspan> ${esc(name)}</text>`
  )
  b.push(
    `<text x="${cx}" y="130" font-size="11" letter-spacing=".9" text-anchor="middle" fill="${pal.dim}">[ ${esc(name)} // @${esc(username)} // ${esc(roleTag)} ]</text>`
  )
  b.push(
    `<text x="${cx}" y="152" font-size="13" letter-spacing="2.6" text-anchor="middle" fill="${pal.primary}">${esc(roleTag)} <tspan fill="${pal.secondary}">//</tspan> Terminal Purist</text>`
  )

  const fx = w - 8 - fw
  const fy = rowY
  const bx = 8
  const bw = fx - bx - 20
  const fs = 11
  const maxc = Math.max(20, Math.floor(bw / (fs * 0.72)))

  b.push(`<rect x="${bx}" y="${fy + 2}" width="2" height="${fh - 40}" fill="${pal.bc}"/>`)
  const tx = bx + 14
  let y = fy + 14
  b.push(
    `<text x="${tx}" y="${y}" font-size="${fs}" fill="${pal.text}"><tspan fill="${pal.primary}">${esc(name)} (@${esc(username)})</tspan> — system operator.</text>`
  )
  y += 16
  b.push(
    `<text x="${tx}" y="${y}" font-size="${fs}" fill="${pal.text}">Welcome to the terminal station.</text>`
  )
  y += 22
  for (const ql of wrap(quoteText, maxc)) {
    b.push(`<text x="${tx}" y="${y}" font-size="${fs}" fill="${pal.secondary}">${esc(ql)}</text>`)
    y += 16
  }
  y += 6
  for (const bl of wrap(bio, maxc)) {
    b.push(
      `<text x="${tx}" y="${y}" font-size="${fs}" fill="${pal.text}"><tspan fill="${pal.primary}">SYS:</tspan> ${esc(bl)}</text>`
    )
    y += 16
  }

  const iy = fy + 4
  const ih = fh - 4
  const barCols = ['#ffffff', '#ffff55', '#55ffff', '#55ff55', '#ff55ff', '#ff5555', '#5555ff']
  const sw = fw / barCols.length
  for (let i = 0; i < barCols.length; i++) {
    b.push(`<rect x="${fx + i * sw}" y="${fy}" width="${sw + 1}" height="4" fill="${barCols[i]}"/>`)
  }
  b.push(
    `<clipPath id="hfclip-${id}"><rect x="${fx}" y="${iy}" width="${fw}" height="${ih}"/></clipPath>`
  )
  b.push(`<g clip-path="url(#hfclip-${id})">`)
  b.push(
    `<image x="${fx}" y="${iy}" width="${fw}" height="${ih}" preserveAspectRatio="xMidYMid slice" href="${avatarUrl}" filter="url(#avtint-${id})" style="image-rendering:pixelated;"/>`
  )
  b.push(
    `<rect x="${fx}" y="${iy}" width="${fw}" height="${ih}" fill="url(#scan-${id})" opacity=".4"/>`
  )
  if (!forceStatic) {
    b.push(
      `<rect class="track" x="${fx}" y="${iy}" width="${fw}" height="12" fill="#fff" opacity=".10"/>`
    )
  }
  b.push(`<rect x="${fx}" y="${iy}" width="${fw}" height="${ih}" fill="url(#vig-${id})"/>`)
  b.push(`</g>`)
  b.push(
    `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="none" stroke="${pal.bc}" stroke-width="2"/>`
  )

  b.push(`<rect x="${fx}" y="${iy}" width="${fw}" height="17" fill="rgba(0,0,0,.55)"/>`)
  b.push(led(fx + 9, iy + 8.5, pal.led, !forceStatic, id))
  b.push(
    `<text x="${fx + 19}" y="${iy + 12}" font-size="8" letter-spacing="1.2" fill="${pal.primary}">CH 03 · CAM-01</text>`
  )
  b.push(
    `<text x="${fx + fw - 8}" y="${iy + 12}" font-size="8" letter-spacing="1.2" text-anchor="end" fill="${pal.red}">LIVE</text>`
  )

  b.push(
    `<rect x="${fx}" y="${iy + ih - 34}" width="${fw}" height="34" fill="url(#nmfade-${id})"/>`
  )
  b.push(
    `<text x="${fx + 8}" y="${iy + ih - 16}" font-size="8" letter-spacing=".8" fill="${pal.red}">REC <tspan fill="${pal.primary}">02:41:07:14</tspan></text>`
  )
  b.push(
    `<text x="${fx + 8}" y="${iy + ih - 6}" font-size="8" letter-spacing=".8" fill="${pal.primary}">${esc(coords)}</text>`
  )
  b.push(corners(fx, fy, fw, fh, pal.bch, 11, 4))

  return wrapSvg(w, h, id, css, b.join(''), false, pal)
}

export function renderSurveillanceDossier(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const cfg = widget.config || {}
  const id = widget.instanceId || 'surv-dossier'
  const pal = resolvePalette(cfg, globalStyles)

  const username = (cfg.username as string) || data.user.login || 'operator'
  const name = (cfg.displayName as string) || data.user.name || username
  const subjectRole = (cfg.classRole as string) || 'Linux/Windows Power-User'
  const rigInfo = (cfg.rigInfo as string) || 'Arch Linux · Hyprland | Windows · WSL · Powershell'
  const habitInfo = (cfg.habitInfo as string) || 'Watches build logs from the terminal'
  const statusInfo = (cfg.statusInfo as string) || '● ONLINE & RICED'
  const location = (cfg.location as string) || data.user.location || 'Localhost / Network'

  const rows: [string, [string, string][]][] = [
    [
      'SUBJECT',
      [
        [`${name} — `, pal.bright],
        [`@${username}`, pal.primary],
      ],
    ],
    [
      'LOCATION',
      [
        [location, pal.bright],
        [' · Earth', pal.dim],
      ],
    ],
    ['CLASS', [[subjectRole, pal.secondary]]],
    ['RIG', [[rigInfo, pal.primary]]],
    ['HABIT', [[habitInfo, pal.bright]]],
    ['STATUS', [[statusInfo, pal.green]]],
  ]

  const rowH = 30
  const bodyY = 28 + 16
  const h = widget.size.height || bodyY + rows.length * rowH + 12
  const b = [panelFrame(w, h, 'SUBJECT DOSSIER', 'REF://ABOUT.DAT', 0, id, pal)]

  const dtx = 22
  const ddx = 150
  let y = bodyY + 14

  for (const [label, spans] of rows) {
    b.push(
      `<text x="${dtx}" y="${y}" font-size="10.5" letter-spacing="1" fill="${pal.dim}">${esc(label)}</text>`
    )
    let seg = `<text x="${ddx}" y="${y}" font-size="12.5">`
    for (const [txt, col] of spans) {
      seg += `<tspan fill="${col}">${esc(txt)}</tspan>`
    }
    seg += '</text>'
    b.push(seg)
    y += rowH
  }

  return wrapSvg(w, h, id, '', b.join(''), true, pal)
}

export function renderSurveillanceLoadout(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const cfg = widget.config || {}
  const id = widget.instanceId || 'surv-loadout'
  const pal = resolvePalette(cfg, globalStyles)

  const defaultTools = [
    'VS Code',
    'Git',
    'Docker',
    'Terminal',
    'PowerShell',
    'Linux',
    'Postman',
    'Figma',
  ]
  const customWorkflow =
    Array.isArray(cfg.workflow) && cfg.workflow.length > 0
      ? (cfg.workflow as string[])
      : defaultTools

  const detectedLangs =
    data.languages && typeof data.languages === 'object' && Object.keys(data.languages).length > 0
      ? Object.keys(data.languages).slice(0, 8)
      : ['Rust', 'C++', 'Python', 'TypeScript', 'Go', 'Bash']
  const customLangs =
    Array.isArray(cfg.languages) && cfg.languages.length > 0
      ? (cfg.languages as string[])
      : detectedLangs

  const displayMode = (cfg.displayMode as 'both' | 'logo' | 'name') || 'both'

  function renderChips(items: string[], yPos: number, isLang = false): string {
    const border = isLang ? hexToRgba(pal.secondary, 0.45) : pal.bc2
    const fillbg = isLang ? hexToRgba(pal.secondary, 0.08) : hexToRgba(pal.primary, 0.04)
    const txtcol = isLang ? pal.secondary : pal.text
    let xPos = 22
    const out: string[] = []

    for (const it of items) {
      const info = getTechInfo(it)
      const iconId = info.id === 'reactnative' ? 'react' : info.id
      const iconUrl = `https://skillicons.dev/icons?i=${iconId}&theme=dark`
      const label = info.name.toUpperCase()

      let wc = 32
      if (displayMode === 'logo') {
        wc = 28
      } else if (displayMode === 'name') {
        wc = Math.max(Math.round(label.length * 7.4 + 18), 38)
      } else {
        wc = Math.max(Math.round(16 + 6 + label.length * 7.0 + 16), 52)
      }

      if (xPos + wc > w - 20) break

      out.push(
        `<rect x="${xPos}" y="${yPos}" width="${wc}" height="24" fill="${fillbg}" stroke="${border}"/>`
      )

      if (displayMode === 'logo') {
        out.push(
          `<image x="${xPos + 6}" y="${yPos + 4}" width="16" height="16" href="${iconUrl}"/>`
        )
      } else if (displayMode === 'name') {
        out.push(
          `<text x="${xPos + 9}" y="${yPos + 16}" font-size="10.5" letter-spacing=".5" fill="${txtcol}">${esc(label)}</text>`
        )
      } else {
        out.push(
          `<image x="${xPos + 6}" y="${yPos + 4}" width="16" height="16" href="${iconUrl}"/>`
        )
        out.push(
          `<text x="${xPos + 26}" y="${yPos + 16}" font-size="10.5" letter-spacing=".5" fill="${txtcol}">${esc(label)}</text>`
        )
      }
      xPos += wc + 7
    }
    return out.join('')
  }

  const bodyY = 44
  const h = widget.size.height || bodyY + 150
  const b = [panelFrame(w, h, 'DAILY LOADOUT', 'REF://LOADOUT.CFG', 0, id, pal)]

  b.push(
    `<text x="22" y="${bodyY + 14}" font-size="10" letter-spacing="1.4" fill="${pal.dim}">WORKFLOW</text>`
  )
  b.push(renderChips(customWorkflow, bodyY + 24, false))

  b.push(
    `<text x="22" y="${bodyY + 78}" font-size="10" letter-spacing="1.4" fill="${pal.dim}">LANGUAGES</text>`
  )
  b.push(renderChips(customLangs, bodyY + 88, true))

  return wrapSvg(w, h, id, '', b.join(''), true, pal)
}

const LANG_COLORS = [
  '#56b4e9',
  '#e69f00',
  '#d55e00',
  '#cc79a7',
  '#009e73',
  '#f0e442',
  '#0072b2',
  '#dddddd',
]

export function renderSurveillanceTelemetry(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const w = widget.size.width || 780
  const cfg = widget.config || {}
  const id = widget.instanceId || 'surv-telemetry'
  const pal = resolvePalette(cfg, globalStyles)

  const username = (cfg.username as string) || data.user.login || 'operator'
  const reposCount = data.user.public_repos ?? data.repos.length ?? 0
  const totalStars =
    data.totalStars ?? data.repos.reduce((acc: number, r) => acc + (r.stargazers_count || 0), 0)
  const followersCount = data.user.followers || 0
  const followingCount = data.user.following || 0

  const labelH = 28
  const pad = 14
  const cardX = 16
  const cardW = w - 32
  const ipad = 14
  const ix = cardX + ipad
  const iw = cardW - 2 * ipad
  const cardTop = labelH + pad
  const hdH = 26

  const css = forceStatic
    ? ''
    : `
      #${id} .cur{animation:blink-${id} 1s steps(1,end) infinite}
    `

  const c: string[] = []
  let cy = cardTop + hdH + 20

  c.push(
    `<text x="${ix}" y="${cy}" font-size="12.5" fill="${pal.text}"><tspan fill="${pal.primary}">~/${esc(username)}</tspan> <tspan fill="${pal.secondary}">(main)</tspan> <tspan fill="${pal.dim}">$</tspan> <tspan fill="${pal.bright}">./metrics --generate</tspan><tspan class="cur" fill="${pal.primary}">█</tspan></text>`
  )
  cy += 24

  function seclabel(txt: string, right: string | null = null): string {
    let s = `<text x="${ix}" y="${cy}" font-size="10.5" letter-spacing="1.4" fill="${pal.primary}"><tspan fill="${pal.dim}">&gt; </tspan>${esc(txt)}</text>`
    if (right) {
      s += `<text x="${ix + iw}" y="${cy}" font-size="9.5" text-anchor="end" fill="${pal.dim}">${esc(right)}</text>`
    }
    return s
  }

  c.push(seclabel('core stats'))
  cy += 12
  const boxes = [
    { n: reposCount, lab: 'REPOS' },
    { n: totalStars, lab: 'STARS' },
    { n: followersCount, lab: 'FOLLOWERS' },
    { n: followingCount, lab: 'FOLLOWING' },
  ]
  const bw = (iw - 3 * 8) / 4
  for (let i = 0; i < boxes.length; i++) {
    const bx = ix + i * (bw + 8)
    c.push(
      `<rect x="${bx}" y="${cy}" width="${bw}" height="42" fill="${hexToRgba(pal.primary, 0.03)}" stroke="${hexToRgba(pal.primary, 0.16)}"/>`
    )
    c.push(
      `<text x="${bx + 9}" y="${cy + 22}" font-size="17" fill="${pal.primary}" filter="url(#glow-${id})">${boxes[i].n}</text>`
    )
    c.push(
      `<text x="${bx + 9}" y="${cy + 34}" font-size="9" letter-spacing=".8" fill="${pal.dim}">${boxes[i].lab}</text>`
    )
  }
  cy += 42 + 18

  c.push(seclabel('most used languages', 'colorblind-safe'))
  cy += 12
  const langEntries = Object.entries(
    data?.languages && typeof data.languages === 'object' ? data.languages : {}
  )
  const langTotal =
    langEntries.reduce((sum: number, [, count]) => sum + (Number(count) || 0), 0) || 1
  const rawLangs =
    langEntries.length > 0
      ? langEntries.slice(0, 7).map(([name, count]) => ({
          name,
          percentage: Math.round(((Number(count) || 0) / langTotal) * 1000) / 10,
        }))
      : [
          { name: 'TypeScript', percentage: 48.2 },
          { name: 'Python', percentage: 24.1 },
          { name: 'Rust', percentage: 14.5 },
          { name: 'Go', percentage: 8.2 },
          { name: 'Other', percentage: 5.0 },
        ]
  const total = rawLangs.reduce((acc: number, l) => acc + (l.percentage || 0), 0) || 1
  let xSeg = ix
  const barW = iw
  c.push(
    `<rect x="${ix}" y="${cy}" width="${barW}" height="12" fill="none" stroke="rgba(255,255,255,.14)"/>`
  )

  const colmap: Record<string, string> = {}
  for (let i = 0; i < rawLangs.length; i++) {
    const l = rawLangs[i]
    const col = l.name === 'Other' ? '#8a8a8a' : LANG_COLORS[i % LANG_COLORS.length]
    colmap[l.name] = col
    const segw = (barW * (l.percentage || 0)) / total
    c.push(`<rect x="${xSeg}" y="${cy}" width="${segw}" height="12" fill="${col}"/>`)
    xSeg += segw
  }
  cy += 26

  let lx = ix
  const lrowH = 18
  for (let i = 0; i < rawLangs.length; i++) {
    const l = rawLangs[i]
    const itemStr = `${l.name} ${l.percentage}%`
    const wpx = 15 + itemStr.length * cw(11) + 16
    if (lx + wpx > ix + iw) {
      lx = ix
      cy += lrowH
    }
    c.push(`<rect x="${lx}" y="${cy - 9}" width="9" height="9" fill="${colmap[l.name]}"/>`)
    c.push(
      `<text x="${lx + 14}" y="${cy}" font-size="11" fill="${pal.bright}">${esc(l.name)} <tspan fill="${pal.dim}">${l.percentage}%</tspan></text>`
    )
    lx += wpx
  }
  cy += 22

  c.push(seclabel('contribution activity · last year'))
  cy += 12

  const cols = 53
  const gap = 2
  const cell = Math.min(11, Math.max(6, (iw - (cols - 1) * gap) / cols))

  for (let colI = 0; colI < cols; colI++) {
    for (let rowI = 0; rowI < 7; rowI++) {
      const gx = ix + colI * (cell + gap)
      const gy = cy + rowI * (cell + gap)
      const pseudoRandom = Math.sin(colI * 7 + rowI + 42) * 10000
      const r = pseudoRandom - Math.floor(pseudoRandom)
      const level = r > 0.9 ? 4 : r > 0.78 ? 3 : r > 0.6 ? 2 : r > 0.38 ? 1 : 0
      c.push(
        `<rect x="${gx.toFixed(1)}" y="${gy.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" fill="${pal.calShades[level]}"/>`
      )
    }
  }
  cy += 7 * (cell + gap) + 6

  const kx = ix + iw - 12 - 5 * 12 - 30
  c.push(`<text x="${kx}" y="${cy}" font-size="10" fill="${pal.dim}">less</text>`)
  for (let i = 0; i < pal.calShades.length; i++) {
    c.push(
      `<rect x="${kx + 26 + i * 12}" y="${cy - 8}" width="9" height="9" fill="${pal.calShades[i]}"/>`
    )
  }
  c.push(`<text x="${kx + 26 + 5 * 12 + 4}" y="${cy}" font-size="10" fill="${pal.dim}">more</text>`)
  cy += 10

  const cardBottom = cy + 6
  const cardH = cardBottom - cardTop
  const h = widget.size.height || cardBottom + pad

  const out = [panelFrame(w, h, 'TELEMETRY', 'REF://METRICS.SYS', 0, id, pal)]
  out.push(
    `<rect x="${cardX}" y="${cardTop}" width="${cardW}" height="${cardH}" fill="#08060e" stroke="${pal.bc2}"/>`
  )
  out.push(
    `<rect x="${cardX}" y="${cardTop}" width="${cardW}" height="${hdH}" fill="#0b0912" stroke="${pal.bc2}"/>`
  )

  const dots = ['#2f4a44', '#3a2f4a', '#ff5555']
  for (let i = 0; i < dots.length; i++) {
    out.push(
      `<rect x="${cardX + 12 + i * 12}" y="${cardTop + 9}" width="8" height="8" fill="${dots[i]}"/>`
    )
  }
  out.push(
    `<text x="${cardX + 54}" y="${cardTop + 17}" font-size="10" letter-spacing="1.4" fill="${pal.primary}">${esc(username.toUpperCase())}@GITHUB — METRICS</text>`
  )
  out.push(c.join(''))

  return wrapSvg(w, h, id, css, out.join(''), true, pal)
}

export function renderSurveillanceTransmission(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const cfg = widget.config || {}
  const id = widget.instanceId || 'surv-tx'
  const pal = resolvePalette(cfg, globalStyles)

  const quote =
    (cfg.quoteText as string) ||
    data.user.bio ||
    'Programs must be written for people to read, and only incidentally for machines to execute.'
  const title = (cfg.customTitle as string) || 'TRANSMISSION'
  const subTitle = (cfg.customSubtitle as string) || 'INCOMING · SENSIBLE WORDS'

  const bodyY = 44
  const lines = wrap(quote, Math.floor((w - 70) / 9.5))
  const y1 = bodyY + 26
  const h = widget.size.height || bodyY + 20 + lines.length * 22 + 12
  const b = [panelFrame(w, h, title, 'REF://QUOTES.LOG', 0, id, pal)]

  b.push(
    `<text x="22" y="${bodyY + 4}" font-size="10.5" letter-spacing="1.4" fill="${pal.primary}">${esc(subTitle)}</text>`
  )
  b.push(
    `<rect x="22" y="${y1 - 13}" width="2" height="${Math.max(20, lines.length * 22 - 4)}" fill="${pal.primary}"/>`
  )

  let yPos = y1
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    const txt =
      i === 0 && lines.length === 1
        ? `“${ln}”`
        : i === 0
          ? `“${ln}`
          : i === lines.length - 1
            ? `${ln}”`
            : ln
    b.push(`<text x="34" y="${yPos}" font-size="14" fill="${pal.bright}">${esc(txt)}</text>`)
    yPos += 22
  }

  return wrapSvg(w, h, id, '', b.join(''), true, pal)
}

export function renderSurveillanceField(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const w = widget.size.width || 780
  const cfg = widget.config || {}
  const id = widget.instanceId || 'surv-field'
  const pal = resolvePalette(cfg, globalStyles)

  const h = widget.size.height || Math.round((w * 9) / 16)
  const pad = 14
  const gap = 8
  const iw = w - 2 * pad
  const ih = h - 2 * pad
  const lw = Math.round(iw * 0.5)
  const rx = pad + lw + gap
  const rw = w - pad - rx
  const ph = (ih - gap) / 2

  const username = data.user.login || 'user'
  const ricingQuote = (cfg.quoteText as string) || '“If it isn’t riced, it isn’t mine.”'
  const workspaceTag = (cfg.workspaceTag as string) || 'CAELESTIA // HYPRLAND'

  const css = forceStatic
    ? ''
    : `
      @keyframes roll-${id}{0%{transform:translateY(-20px)}100%{transform:translateY(${h}px)}}
      #${id} .trk{animation:roll-${id} 6s linear infinite}
      @keyframes pulse-${id}{0%,100%{opacity:.8}50%{opacity:1}}
      #${id} .play{animation:pulse-${id} 2.5s ease-in-out infinite}
    `

  const b: string[] = [`<rect width="${w}" height="${h}" fill="#0b0e14"/>`]

  function pane(
    px: number,
    py: number,
    pw: number,
    phh: number,
    lines: [string, string][]
  ): string {
    let s = `<rect x="${px}" y="${py}" width="${pw}" height="${phh}" fill="rgba(10,7,16,.6)" stroke="${pal.bc2}"/>`
    s += `<rect x="${px}" y="${py}" width="${pw}" height="10" fill="#0c1418"/>`
    let ty = py + 23
    for (const [txt, col] of lines) {
      s += `<text x="${px + 6}" y="${ty}" font-size="9" fill="${col}">${esc(txt)}</text>`
      ty += 13
    }
    return s
  }

  b.push('<g opacity="0.55">')
  b.push(
    pane(pad, pad, lw, ih, [
      [`~/.config/hypr $ hyprctl`, pal.primary],
      [`workspace 1 :: ${esc(username)}`, pal.secondary],
      ['████░░░ 88%', pal.green],
      ['> neofetch', pal.dim],
    ])
  )
  b.push(
    pane(rx, pad, rw, ph, [
      ['btop', pal.primary],
      ['cpu ███░', pal.green],
      ['mem ██░░', pal.green],
    ])
  )
  b.push(
    pane(rx, pad + ph + gap, rw, ph, [
      ['cava', pal.secondary],
      ['▍▁▏▍▂▁▏', pal.primary],
      ['▏▍▂▏▎▍', pal.primary],
    ])
  )
  b.push('</g>')

  b.push(`<rect width="${w}" height="${h}" fill="url(#scan-${id})" opacity=".25"/>`)
  if (!forceStatic) {
    b.push(`<rect class="trk" x="0" y="0" width="${w}" height="20" fill="#fff" opacity=".05"/>`)
  }
  b.push(`<rect width="${w}" height="${h}" fill="url(#vig-${id})"/>`)

  const cx = w / 2
  const cy = h / 2
  b.push('<g class="play">')
  b.push(
    `<rect x="${cx - 28}" y="${cy - 28}" width="56" height="56" fill="${hexToRgba(pal.primary, 0.08)}" stroke="${pal.primary}"/>`
  )
  b.push(
    `<path d="M${cx - 6} ${cy - 11} l18 11 l-18 11 z" fill="${pal.primary}" filter="url(#glow-${id})"/>`
  )
  b.push('</g>')

  b.push(`<text x="14" y="26" font-size="11" fill="${pal.secondary}">${esc(ricingQuote)}</text>`)
  b.push(led(w - 70, 20, pal.led, !forceStatic, id))
  b.push(
    `<text x="${w - 14}" y="26" font-size="11" letter-spacing="1" text-anchor="end" fill="${pal.red}">REC</text>`
  )
  b.push(
    `<text x="14" y="${h - 14}" font-size="11" letter-spacing="1.2" fill="${pal.primary}">${esc(workspaceTag)}</text>`
  )
  b.push(
    `<text x="${w - 14}" y="${h - 14}" font-size="11" letter-spacing="1" text-anchor="end" fill="${pal.dim}">SP · 60FPS · 00:00:37</text>`
  )
  b.push(corners(0, 0, w, h, pal.bch, 14, 6))
  b.push(`<rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="${pal.bc}"/>`)

  return wrapSvg(w, h, id, css, b.join(''), false, pal)
}

export function renderSurveillanceFeeds(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const w = widget.size.width || 780
  const cfg = widget.config || {}
  const id = widget.instanceId || 'surv-feeds'
  const pal = resolvePalette(cfg, globalStyles)
  const renderMode = (cfg.renderMode as 'grid' | 'single') || (w < 500 ? 'single' : 'grid')
  const selectedFeed = (cfg.selectedFeed as 'linkedin' | 'email' | 'discord') || 'linkedin'

  const FW = renderMode === 'single' ? w : Math.floor((w - 24) / 3)
  const FH = widget.size.height || 183

  function fxLinkedin(fw: number, fh: number): { css: string; html: string } {
    const BLU = '#4d9fff'
    const LT = '#a9d4ff'
    const cx = fw / 2
    const cy = fh / 2 + 3
    const sats = [
      [30, 36],
      [fw - 30, 38],
      [24, fh - 40],
      [fw - 24, fh - 38],
      [cx, 26],
      [28, cy + 6],
      [fw - 24, cy],
    ]

    const css = forceStatic
      ? ''
      : `
        @keyframes lidash-${id}{to{stroke-dashoffset:-18}}
        #${id} .edge{animation:lidash-${id} 1.5s linear infinite}
        @keyframes linode-${id}{0%,100%{opacity:.5}50%{opacity:1}}
        #${id} .node{animation:linode-${id} 3s ease-in-out infinite}
        @keyframes lispin-${id}{to{transform:rotate(360deg)}}
        #${id} .ring{animation:lispin-${id} 24s linear infinite;transform-box:fill-box;transform-origin:center}
        @keyframes lireach-${id}{0%{transform:scale(.5);opacity:.85}100%{transform:scale(1.7);opacity:0}}
        #${id} .reach{animation:lireach-${id} 3.2s ease-out infinite;transform-box:fill-box;transform-origin:center}
      `

    const out: string[] = [
      `<circle class="ring" cx="${cx}" cy="${cy}" r="46" fill="none" stroke="${BLU}" stroke-width="1" stroke-dasharray="2 9" opacity=".3"/>`,
    ]

    for (const [sx, sy] of sats) {
      out.push(
        `<line class="edge" x1="${cx}" y1="${cy}" x2="${sx}" y2="${sy}" stroke="${BLU}" stroke-width="1" opacity=".45" stroke-dasharray="4 5"/>`
      )
    }

    for (let i = 0; i < sats.length; i++) {
      const [sx, sy] = sats[i]
      const r = 7
      out.push(`
        <g class="node" style="animation-delay:${(i * 0.4).toFixed(2)}s">
          <g transform="translate(${sx},${sy})">
            <circle r="${r}" fill="#0a1830" stroke="#7cc2ff" stroke-width="1.2"/>
            <circle cy="${-r * 0.18}" r="${r * 0.34}" fill="#7cc2ff"/>
            <path d="M${-r * 0.5} ${r * 0.62} a${r * 0.5} ${r * 0.42} 0 0 1 ${r} 0" fill="#7cc2ff"/>
          </g>
        </g>
      `)
    }

    if (!forceStatic) {
      out.push(
        `<circle class="reach" cx="${sats[1][0]}" cy="${sats[1][1]}" r="12" fill="none" stroke="${pal.green}" stroke-width="1.5"/>`
      )
    }

    const hr = 13
    out.push(`
      <g transform="translate(${cx},${cy})">
        <circle r="${hr}" fill="#0a1830" stroke="${LT}" stroke-width="1.2" filter="url(#glow-${id})"/>
        <circle cy="${-hr * 0.18}" r="${hr * 0.34}" fill="${LT}"/>
        <path d="M${-hr * 0.5} ${hr * 0.62} a${hr * 0.5} ${hr * 0.42} 0 0 1 ${hr * 1.0} 0" fill="${LT}"/>
      </g>
      <rect x="${cx + 5}" y="${cy + 2}" width="12" height="12" rx="2" fill="${BLU}"/>
      <text x="${cx + 7}" y="${cy + 11}" font-size="9" fill="#00142c">in</text>
    `)

    return { css, html: out.join('') }
  }

  function fxEmail(fw: number, _fh: number): { css: string; html: string } {
    const TEAL = '#7fe3d0'
    const TEAL2 = '#39b39a'
    const DIMT = '#2b4d47'
    const css = forceStatic
      ? ''
      : `
        @keyframes mdrop-${id}{0%{transform:translateY(-40px);opacity:0}16%{opacity:1}64%{transform:translateY(0);opacity:1}80%,100%{transform:translateY(0);opacity:0}}
        #${id} .drop{animation:mdrop-${id} 4.4s ease-in infinite}
        @keyframes unread-${id}{0%,100%{opacity:.3}50%{opacity:1}}
        #${id} .un{animation:unread-${id} 1.6s ease-in-out infinite}
        @keyframes plane-${id}{0%{transform:translate(-34px,6px);opacity:0}22%,78%{opacity:.95}100%{transform:translate(${fw}px,-14px);opacity:0}}
        #${id} .plane{animation:plane-${id} 5.2s ease-in-out infinite}
        @keyframes caret-${id}{0%,50%{opacity:1}51%,100%{opacity:0}}
        #${id} .caret{animation:caret-${id} 1s steps(1) infinite}
      `

    const out: string[] = []
    const rowYList = [28, 56, 84]
    for (let i = 0; i < rowYList.length; i++) {
      const ry = rowYList[i]
      out.push(
        `<rect x="10" y="${ry}" width="${fw - 20}" height="22" rx="3" fill="#08201c" stroke="rgba(127,227,208,.25)" stroke-width="1"/>`
      )
      out.push(
        `<circle class="un" cx="20" cy="${ry + 11}" r="3" fill="${TEAL}" style="animation-delay:${(i * 0.4).toFixed(2)}s"/>`
      )
      out.push(
        `<g transform="translate(30,${ry + 5})" stroke="${TEAL}" stroke-width="1" fill="none"><rect width="14" height="10" rx="1.5"/><path d="M0 1l7 5L14 1"/></g>`
      )
      out.push(`<rect x="50" y="${ry + 6}" width="${60 + i * 12}" height="3" fill="${TEAL}"/>`)
      out.push(
        `<rect x="50" y="${ry + 13}" width="${120 - i * 16}" height="2.5" fill="${DIMT}" opacity=".6"/>`
      )
    }

    if (!forceStatic) {
      out.push(`
        <g class="drop">
          <g transform="translate(${fw / 2 - 15},16)" stroke="${TEAL}" stroke-width="1.4" fill="#08201c">
            <rect width="30" height="20" rx="2.5"/>
            <path d="M0 2l15 11L30 2" fill="none"/>
          </g>
        </g>
        <path class="plane" d="M0 0l18 7-6 2-2 6z" fill="${TEAL}" transform="translate(0,114)"/>
      `)
    }

    out.push(
      `<text x="12" y="128" font-size="9" letter-spacing="1" fill="${TEAL2}">&gt; compose message</text>`
    )
    out.push(`<rect class="caret" x="126" y="120" width="6" height="10" fill="${TEAL}"/>`)

    return { css, html: out.join('') }
  }

  function fxDiscord(fw: number, _fh: number): { css: string; html: string } {
    const css = forceStatic
      ? ''
      : `
        @keyframes dcpop-${id}{0%{opacity:0;transform:translateY(6px)}12%,84%{opacity:1;transform:translateY(0)}100%{opacity:.1}}
        #${id} .msg{animation:dcpop-${id} 5s ease-out infinite}
        @keyframes tping-${id}{0%,60%,100%{opacity:.3}30%{opacity:1}}
        #${id} .tp{animation:tping-${id} 1.2s infinite}
        @keyframes vspeak-${id}{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.9);opacity:0}}
        #${id} .vs{animation:vspeak-${id} 1.8s ease-out infinite;transform-box:fill-box;transform-origin:center}
      `

    const out: string[] = []
    out.push(
      `<rect x="10" y="24" width="70" height="18" rx="9" fill="#121020" stroke="rgba(88,101,242,.4)"/>`
    )
    out.push(
      `<circle cx="20" cy="33" r="4.5" fill="#5865f2"/><circle cx="20" cy="33" r="2.5" fill="#121020"/>`
    )
    out.push(`<text x="29" y="37" font-size="9" fill="#c9c6ff">#general</text>`)

    out.push(
      `<rect x="${fw - 78}" y="24" width="68" height="18" rx="9" fill="#121020" stroke="rgba(87,242,135,.4)"/>`
    )
    out.push(`<circle class="vs" cx="${fw - 68}" cy="33" r="4" fill="#57f287"/>`)
    out.push(`<circle cx="${fw - 68}" cy="33" r="4" fill="#57f287"/>`)
    out.push(`<text x="${fw - 58}" y="36" font-size="9" fill="#57f287">Voice · 3</text>`)

    const chatItems = [
      { y: 52, u: 'alice', col: '#eb459e', t: 'merged pr #420' },
      { y: 78, u: 'bob', col: '#fee75c', t: 'build succeeded in 1.4s' },
      { y: 104, u: 'charlie', col: '#5865f2', t: 'deploying to edge...' },
    ]

    for (let i = 0; i < chatItems.length; i++) {
      const it = chatItems[i]
      out.push(`
        <g class="msg" style="animation-delay:${(i * 0.8).toFixed(2)}s">
          <circle cx="20" cy="${it.y + 6}" r="6" fill="${it.col}"/>
          <text x="32" y="${it.y + 6}" font-size="9.5" font-weight="bold" fill="${it.col}">${it.u}</text>
          <text x="${36 + it.u.length * 6}" y="${it.y + 6}" font-size="8" fill="#8d8db0">TODAY</text>
          <text x="32" y="${it.y + 18}" font-size="9" fill="#c9c6ff">${it.t}</text>
        </g>
      `)
    }

    out.push(
      `<rect x="10" y="132" width="${fw - 20}" height="18" rx="3" fill="#121020" stroke="rgba(88,101,242,.2)"/>`
    )
    out.push(`<text x="18" y="145" font-size="8.5" fill="#8d8db0">message #general</text>`)
    out.push(`<circle class="tp" cx="${fw - 24}" cy="141" r="1.8" fill="#5865f2"/>`)
    out.push(
      `<circle class="tp" cx="${fw - 19}" cy="141" r="1.8" fill="#5865f2" style="animation-delay:.2s"/>`
    )
    out.push(
      `<circle class="tp" cx="${fw - 14}" cy="141" r="1.8" fill="#5865f2" style="animation-delay:.4s"/>`
    )

    return { css, html: out.join('') }
  }

  function renderSingleTile(
    name: string,
    cam: string,
    kind: string,
    fxFn: (fw: number, fh: number) => { css: string; html: string },
    tileW: number,
    tileH: number,
    tileX: number
  ): { css: string; html: string } {
    const fx = fxFn(tileW, tileH)
    const b: string[] = []
    b.push(`<g transform="translate(${tileX},0)">`)
    b.push(
      `<rect x="1" y="1" width="${tileW - 2}" height="${tileH - 2}" fill="#050308" stroke="${pal.bc2}"/>`
    )
    b.push(
      `<rect x="1" y="1" width="${tileW - 2}" height="22" fill="${hexToRgba(pal.primary, 0.06)}"/>`
    )
    b.push(`<line x1="1" y1="23" x2="${tileW - 1}" y2="23" stroke="${pal.bc2}"/>`)
    b.push(led(12, 12, pal.led, !forceStatic, id))
    b.push(
      `<text x="24" y="15" font-size="9" letter-spacing="1.2" fill="${pal.primary}">FEED // ${esc(name.toUpperCase())}</text>`
    )
    b.push(
      `<text x="${tileW - 10}" y="15" font-size="8" letter-spacing="1" text-anchor="end" fill="${pal.dim}">${esc(cam)}</text>`
    )

    b.push(
      `<clipPath id="fclip-${kind}-${id}"><rect x="1" y="24" width="${tileW - 2}" height="${tileH - 25}"/></clipPath>`
    )
    b.push(`<g clip-path="url(#fclip-${kind}-${id})">`)
    b.push(fx.html)
    b.push(scanlines(1, 24, tileW - 2, tileH - 25, 0.14, id))
    b.push(`</g>`)

    b.push(
      `<text x="${tileW - 10}" y="${tileH - 8}" font-size="8" letter-spacing="1" text-anchor="end" fill="${pal.primary}">CONNECT ▶</text>`
    )
    b.push(corners(1, 1, tileW - 2, tileH - 2, pal.bch, 10, 4))
    b.push('</g>')

    return { css: fx.css, html: b.join('') }
  }

  if (renderMode === 'single') {
    const kind = selectedFeed
    const name = kind === 'linkedin' ? 'LinkedIn' : kind === 'email' ? 'Email' : 'Discord'
    const cam = kind === 'linkedin' ? 'CAM-01' : kind === 'email' ? 'CAM-02' : 'CAM-03'
    const fxFn = kind === 'linkedin' ? fxLinkedin : kind === 'email' ? fxEmail : fxDiscord
    const tile = renderSingleTile(name, cam, kind, fxFn, w, FH, 0)
    return wrapSvg(w, FH, id, tile.css, tile.html, false, pal)
  }

  const tileW = FW
  const tile1 = renderSingleTile('LinkedIn', 'CAM-01', 'linkedin', fxLinkedin, tileW, FH, 0)
  const tile2 = renderSingleTile('Email', 'CAM-02', 'mail', fxEmail, tileW, FH, tileW + 8)
  const tile3 = renderSingleTile(
    'Discord',
    'CAM-03',
    'discord',
    fxDiscord,
    tileW,
    FH,
    (tileW + 8) * 2
  )

  const combinedCss = `${tile1.css}\n${tile2.css}\n${tile3.css}`
  const combinedHtml = `${tile1.html}${tile2.html}${tile3.html}`

  return wrapSvg(w, FH, id, combinedCss, combinedHtml, false, pal)
}

export function renderSurveillanceTitle(
  widget: WidgetInstance,
  _data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const w = widget.size.width || 780
  const h = widget.size.height || 30
  const cfg = widget.config || {}
  const id = widget.instanceId || 'surv-title'
  const pal = resolvePalette(cfg, globalStyles)

  const title = (cfg.customTitle as string) || (cfg.title as string) || 'ESTABLISH UPLINK'
  const ref = (cfg.customRef as string) || (cfg.referenceTag as string) || 'REF://CONTACT.SYS'
  const showLed = cfg.showLed !== false
  const showRef = cfg.showRef !== false

  const textY = Math.round(h / 2 + 4)
  const ledY = Math.round(h / 2)

  const b: string[] = []
  b.push(
    `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="${hexToRgba(pal.primary, 0.05)}" stroke="${pal.bc}"/>`
  )
  if (showLed) {
    b.push(led(16, ledY, pal.led, !forceStatic, id))
  }
  const textX = showLed ? 30 : 16
  b.push(
    `<text x="${textX}" y="${textY}" font-size="10" letter-spacing="1.6" fill="${pal.primary}">${esc(title)}</text>`
  )
  if (showRef && ref) {
    b.push(
      `<text x="${w - 14}" y="${textY}" font-size="10" letter-spacing="1.6" text-anchor="end" fill="${pal.gray}">${esc(ref)}</text>`
    )
  }

  return wrapSvg(w, h, id, '', b.join(''), true, pal)
}
