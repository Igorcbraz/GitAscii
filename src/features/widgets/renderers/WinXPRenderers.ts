import {
  EXTERNAL_LINKS,
  LANGUAGE_COLORS,
  WINXP_COLOR_THEMES,
  type WinXPColorTheme,
} from '@/constants'
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

export function resolveWinXPPalette(
  cfg: Record<string, unknown>,
  globalStyles?: GlobalStyles
): WinXPColorTheme {
  const themeName = (cfg.themePreset as string) || ''
  const matched = WINXP_COLOR_THEMES.find((t) =>
    t.name.toLowerCase().includes(themeName.toLowerCase())
  )
  if (matched) return matched

  return {
    name: 'Luna Blue',
    titleGradientStart: (cfg.titleGradientStart as string) || '#0058ee',
    titleGradientEnd:
      (cfg.titleGradientEnd as string) ||
      (globalStyles?.accentColor && globalStyles.accentColor !== '#c5ff4a'
        ? globalStyles.accentColor
        : '#2989f5'),
    titleColor: '#ffffff',
    windowBg: '#ece9d8',
    border: '#0054e3',
    accent: '#3c81f3',
  }
}

function renderWindowChrome(
  id: string,
  w: number,
  h: number,
  title: string,
  palette: WinXPColorTheme,
  iconSvgPath?: string
): string {
  const gradId = `winxp-title-grad-${id}`
  const btnGradId = `winxp-btn-grad-${id}`
  const closeBtnGradId = `winxp-close-grad-${id}`

  return `
    <defs>
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${palette.titleGradientStart}" />
        <stop offset="25%" stop-color="${palette.titleGradientEnd}" />
        <stop offset="85%" stop-color="${palette.titleGradientStart}" />
        <stop offset="100%" stop-color="${palette.titleGradientEnd}" />
      </linearGradient>
      <linearGradient id="${btnGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3c8cf5" />
        <stop offset="40%" stop-color="#2464df" />
        <stop offset="100%" stop-color="#1446b8" />
      </linearGradient>
      <linearGradient id="${closeBtnGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e96c56" />
        <stop offset="40%" stop-color="#d63f24" />
        <stop offset="100%" stop-color="#b8240c" />
      </linearGradient>
      <filter id="winxp-shadow-${id}" x="-4%" y="-4%" width="108%" height="112%">
        <feDropShadow dx="3" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- Outer Window Frame -->
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="6" ry="6" fill="${palette.windowBg}" stroke="${palette.border}" stroke-width="3" filter="url(#winxp-shadow-${id})" />

    <!-- Title Bar Header -->
    <path d="M 4 8 Q 4 4 8 4 L ${w - 8} 4 Q ${w - 4} 4 ${w - 4} 8 L ${w - 4} 30 L 4 30 Z" fill="url(#${gradId})" />
    
    <!-- Title Bar Inner Highlight (Classic XP Gel Gloss) -->
    <path d="M 4 8 Q 4 4 8 4 L ${w - 8} 4 Q ${w - 4} 4 ${w - 4} 8 L ${w - 4} 16 L 4 16 Z" fill="#ffffff" fill-opacity="0.25" />

    <!-- Window Icon -->
    ${
      iconSvgPath
        ? `<g transform="translate(10, 8)">${iconSvgPath}</g>`
        : `<circle cx="16" cy="17" r="6" fill="#f59e0b" /><text x="13.5" y="20.5" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9" font-weight="bold" fill="#ffffff">XP</text>`
    }

    <!-- Window Title -->
    <text x="32" y="20" font-family="'Trebuchet MS', 'Segoe UI', Tahoma, sans-serif" font-size="12" font-weight="bold" fill="${palette.titleColor}" style="text-shadow: 1px 1px 1px #001a66;">
      ${esc(title)}
    </text>

    <!-- Title Bar Buttons (Minimize, Maximize, Close) -->
    <g transform="translate(${w - 74}, 7)">
      <!-- Minimize Button -->
      <rect x="0" y="0" width="19" height="17" rx="3" fill="url(#${btnGradId})" stroke="#ffffff" stroke-width="1" stroke-opacity="0.7" />
      <line x1="4" y1="12" x2="14" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />

      <!-- Maximize Button -->
      <rect x="23" y="0" width="19" height="17" rx="3" fill="url(#${btnGradId})" stroke="#ffffff" stroke-width="1" stroke-opacity="0.7" />
      <rect x="27" y="4" width="10" height="9" fill="none" stroke="#ffffff" stroke-width="1.8" />
      <line x1="27" y1="6" x2="37" y2="6" stroke="#ffffff" stroke-width="2" />

      <!-- Close Button (Red) -->
      <rect x="46" y="0" width="21" height="17" rx="3" fill="url(#${closeBtnGradId})" stroke="#ffffff" stroke-width="1" stroke-opacity="0.8" />
      <path d="M 52 5 L 61 12 M 61 5 L 52 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
    </g>
  `
}

export function renderWinXPWindow(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const h = widget.size.height || 380
  const id = `winxp-window-${widget.instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cfg = widget.config || {}
  const pal = resolveWinXPPalette(cfg, globalStyles)

  const username = data.user.login || 'username'
  const windowTitle = (cfg.windowTitle as string) || `C:\\Documents and Settings\\${username}`
  const name =
    (cfg.displayName as string) || data.user.name || data.user.login || 'GitHub Developer'
  const bio =
    (cfg.customBio as string) ||
    data.user.bio ||
    'Developing next-gen software with vintage passion.'
  const location = (cfg.customLocation as string) || data.user.location || 'Redmond, WA'
  const company = (cfg.customCompany as string) || data.user.company || 'Open Source'
  const hardDriveLabel = (cfg.hardDriveLabel as string) || 'Local Disk (C:)'
  const starFolderLabel = (cfg.starFolderLabel as string) || 'Stars & Badges'
  const networkFolderLabel = (cfg.networkFolderLabel as string) || 'Workgroup'

  const reposCount = data.user.public_repos ?? data.repos.length
  const starsCount = data.totalStars || 0
  const followersCount = data.user.followers || 0
  const bioLines = wrap(bio, 42).slice(0, 3)

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      ${renderWindowChrome(id, w, h, windowTitle, pal)}

      <!-- Menu Bar -->
      <g transform="translate(6, 32)">
        <rect x="0" y="0" width="${w - 12}" height="22" fill="#ece9d8" />
        <line x1="0" y1="22" x2="${w - 12}" y2="22" stroke="#d5d0be" />
        <text x="10" y="15" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#000000">
          <tspan font-weight="500"><u>F</u>ile</tspan>
          <tspan dx="15" font-weight="500"><u>E</u>dit</tspan>
          <tspan dx="15" font-weight="500"><u>V</u>iew</tspan>
          <tspan dx="15" font-weight="500"><u>F</u>avorites</tspan>
          <tspan dx="15" font-weight="500"><u>T</u>ools</tspan>
          <tspan dx="15" font-weight="500"><u>H</u>elp</tspan>
        </text>
        <!-- Windows Flag Logo in menu bar corner -->
        <g transform="translate(${w - 32}, 2)">
          <rect x="0" y="0" width="18" height="18" rx="2" fill="#ffffff" stroke="#c0c0c0" />
          <path d="M 3 4 Q 7 2 10 4 L 10 9 Q 6 7 3 9 Z" fill="#e11d48" />
          <path d="M 11 4 Q 14 6 16 4 L 16 9 Q 13 11 11 9 Z" fill="#2563eb" />
          <path d="M 3 10 Q 7 8 10 10 L 10 15 Q 6 13 3 15 Z" fill="#16a34a" />
          <path d="M 11 10 Q 14 12 16 10 L 16 15 Q 13 17 11 15 Z" fill="#ca8a04" />
        </g>
      </g>

      <!-- Standard Buttons Toolbar & Address Bar -->
      <g transform="translate(6, 56)">
        <rect x="0" y="0" width="${w - 12}" height="32" fill="#ece9d8" />
        <line x1="0" y1="32" x2="${w - 12}" y2="32" stroke="#d5d0be" />
        <!-- Back Button with Green Circle -->
        <circle cx="16" cy="15" r="11" fill="#46a049" stroke="#2e6d30" />
        <path d="M 19 15 L 12 15 M 15 11 L 11 15 L 15 19" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <text x="32" y="19" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#333333">Back</text>
        
        <!-- Address Bar Box -->
        <text x="80" y="19" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#666666">Address</text>
        <rect x="130" y="4" width="${w - 150}" height="22" rx="2" fill="#ffffff" stroke="#7f9db9" stroke-width="1.5" />
        <circle cx="142" cy="15" r="5" fill="#2563eb" />
        <text x="154" y="19" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#1e293b">https://github.com/${esc(username)}</text>
      </g>

      <!-- Main Workspace: Explorer Left Task Pane + Right File View -->
      <g transform="translate(10, 96)">
        <!-- Left Task Panel (Classic Blue Gradient Panel) -->
        <rect x="0" y="0" width="200" height="${h - 130}" rx="3" fill="#6b8fc6" />
        
        <!-- Task Panel Section 1: System Tasks -->
        <path d="M 4 4 Q 4 4 8 4 L 192 4 Q 196 4 196 4 L 196 24 L 4 24 Z" fill="#215dc6" />
        <text x="12" y="17" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" font-weight="bold" fill="#ffffff">System Telemetry</text>
        <rect x="4" y="24" width="192" height="100" fill="#d6dff7" />
        
        <!-- Specs in left panel -->
        <g transform="translate(12, 40)">
          <text font-family="'Segoe UI', Tahoma, sans-serif" font-size="10" fill="#001a66" font-weight="bold">Microsoft Windows XP</text>
          <text y="14" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#334155">Professional Version 2002</text>
          <text y="28" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#334155">Service Pack 3 (Git Edition)</text>
          
          <line x1="0" y1="36" x2="176" y2="36" stroke="#9bb3e1" />
          
          <text y="50" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#001a66" font-weight="bold">Computer Rig:</text>
          <text y="64" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#334155">Intel Pentium 4 @ 3.20GHz</text>
          <text y="78" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#334155">${reposCount} Repositories Online</text>
        </g>

        <!-- Task Panel Section 2: Details / Location -->
        <g transform="translate(0, 132)">
          <path d="M 4 0 L 196 0 L 196 20 L 4 20 Z" fill="#215dc6" />
          <text x="12" y="14" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" font-weight="bold" fill="#ffffff">User Coordinates</text>
          <rect x="4" y="20" width="192" height="${h - 286}" fill="#d6dff7" />
          <g transform="translate(12, 36)">
            <text font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#001a66" font-weight="bold">Location:</text>
            <text y="14" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#334155">${esc(location)}</text>
            <text y="30" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#001a66" font-weight="bold">Affiliation:</text>
            <text y="44" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#334155">${esc(company)}</text>
          </g>
        </g>

        <!-- Right File/Folder Canvas Area (White Background) -->
        <rect x="208" y="0" width="${w - 226}" height="${h - 130}" fill="#ffffff" stroke="#7f9db9" stroke-width="1.5" />

        <!-- User Profile Card Banner inside Canvas -->
        <g transform="translate(222, 16)">
          <!-- Avatar Icon with XP bevel -->
          <rect x="0" y="0" width="60" height="60" rx="3" fill="#ece9d8" stroke="#7f9db9" stroke-width="2" />
          <circle cx="30" cy="24" r="12" fill="#2563eb" />
          <path d="M 12 52 Q 12 40 30 40 Q 48 40 48 52 Z" fill="#2563eb" />
          <rect x="4" y="4" width="52" height="52" fill="none" stroke="#ffffff" stroke-width="1" />

          <!-- User Heading & Bio -->
          <g transform="translate(72, 8)">
            <text font-family="'Trebuchet MS', 'Segoe UI', Tahoma, sans-serif" font-size="15" font-weight="bold" fill="#1e3a8a">
              ${esc(name)}
            </text>
            <text y="16" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#64748b">
              @${esc(username)} • Authentic Windows XP Developer Profile
            </text>
            ${bioLines
              .map(
                (line, idx) =>
                  `<text y="${34 + idx * 14}" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" fill="#334155">${esc(line)}</text>`
              )
              .join('')}
          </g>
        </g>

        <!-- Folder Items Grid (Classic XP Folders for GitHub Stats) -->
        <g transform="translate(222, 106)">
          <!-- Hard Drive / Repos -->
          <g transform="translate(0, 0)">
            <rect x="0" y="0" width="150" height="48" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
            <!-- HDD Icon -->
            <rect x="8" y="10" width="28" height="18" rx="2" fill="#94a3b8" stroke="#475569" />
            <line x1="12" y1="22" x2="24" y2="22" stroke="#ffffff" stroke-width="1.5" />
            <circle cx="30" cy="22" r="1.5" fill="#22c55e" />
            <text x="44" y="20" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">${esc(hardDriveLabel)}</text>
            <text x="44" y="32" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#64748b">${reposCount} Repositories</text>
          </g>

          <!-- Stars / Achievements Drive -->
          <g transform="translate(162, 0)">
            <rect x="0" y="0" width="150" height="48" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
            <!-- Star Folder Icon -->
            <path d="M 8 12 L 18 12 L 22 16 L 36 16 L 36 32 L 8 32 Z" fill="#f59e0b" stroke="#d97706" />
            <text x="44" y="20" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">${esc(starFolderLabel)}</text>
            <text x="44" y="32" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#64748b">${starsCount} Stars Earned</text>
          </g>

          <!-- Followers / Network Folder -->
          <g transform="translate(324, 0)">
            <rect x="0" y="0" width="150" height="48" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
            <!-- Network Icon -->
            <rect x="10" y="12" width="22" height="16" rx="2" fill="#3b82f6" stroke="#1d4ed8" />
            <circle cx="21" cy="20" r="3" fill="#ffffff" />
            <text x="44" y="20" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">${esc(networkFolderLabel)}</text>
            <text x="44" y="32" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#64748b">${followersCount} Followers</text>
          </g>
        </g>
      </g>

      <!-- Status Bar at Window Bottom -->
      <g transform="translate(6, ${h - 26})">
        <rect x="0" y="0" width="${w - 12}" height="20" fill="#ece9d8" stroke="#d5d0be" />
        <text x="12" y="14" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10" fill="#475569">
          3 objects (Disk free space: 98.4 GB)
        </text>
        <line x1="${w - 180}" y1="2" x2="${w - 180}" y2="18" stroke="#d5d0be" />
        <text x="${w - 170}" y="14" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10" fill="#475569">
          My Computer • Local Intranet
        </text>
      </g>
    </svg>
  `
}

export function renderWinXPMinesweeper(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const h = widget.size.height || 340
  const id = `winxp-minesweeper-${widget.instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cfg = widget.config || {}
  const pal = resolveWinXPPalette(cfg, globalStyles)

  const customTitle = (cfg.customTitle as string) || 'Minesweeper - GitHub Activity Mode'
  const customVictoryText =
    (cfg.customVictoryText as string) ||
    `🏆 Victory! ${data.contributions?.totalContributions || data.totalStars * 4 || 382} Annual Commits Swept without detonating bugs.`

  const commitCount = data.contributions?.totalContributions || data.totalStars * 4 || 382
  const reposCount = data.user.public_repos ?? data.repos.length

  const minesLeft = (cfg.customMinesCount as string)
    ? String(cfg.customMinesCount).slice(0, 3).padStart(3, '0')
    : String(Math.max(0, 99 - Math.min(99, reposCount))).padStart(3, '0')

  const timerSec = (cfg.customTimerCount as string)
    ? String(cfg.customTimerCount).slice(0, 3).padStart(3, '0')
    : String(Math.min(999, commitCount)).padStart(3, '0')

  const rows = 6
  const cols = 18
  const cellSize = 22
  const startX = Math.round((w - cols * cellSize) / 2)
  const startY = 110

  const cellData = [
    ['1', '1', '2', 'F', '1', '0', '0', '1', 'F', '1', '0', '1', '1', '1', '0', '0', '1', 'F'],
    ['F', '1', '2', '2', '2', '1', '1', '2', '2', '2', '0', '1', 'F', '1', '0', '0', '1', '1'],
    ['1', '1', '1', 'F', '1', '1', 'F', '1', '1', 'F', '1', '2', '2', '2', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', 'F', '1', '1', 'F', '1', '0'],
    ['0', '1', '1', '2', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '1', 'F', '2', 'F', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
  ]

  const numColors: Record<string, string> = {
    '1': '#0000ff',
    '2': '#008000',
    '3': '#ff0000',
    '4': '#000080',
    '5': '#800000',
    F: '#e11d48',
  }

  let cellsSvg = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = cellData[r]?.[c] || '0'
      const x = startX + c * cellSize
      const y = startY + r * cellSize

      if (val === 'F') {
        cellsSvg += `
          <rect x="${x}" y="${y}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#c0c0c0" stroke="#808080" />
          <line x1="${x}" y1="${y}" x2="${x + cellSize - 2}" y2="${y}" stroke="#ffffff" stroke-width="2" />
          <line x1="${x}" y1="${y}" x2="${x}" y2="${y + cellSize - 2}" stroke="#ffffff" stroke-width="2" />
          <polygon points="${x + 6},${y + 4} ${x + 14},${y + 8} ${x + 6},${y + 12}" fill="#ff0000" />
          <line x1="${x + 6}" y1="${y + 4}" x2="${x + 6}" y2="${y + 17}" stroke="#000000" stroke-width="1.5" />
          <rect x="${x + 4}" y="${y + 15}" width="8" height="2" fill="#000000" />
        `
      } else if (val === '0') {
        cellsSvg += `
          <rect x="${x}" y="${y}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#c0c0c0" stroke="#808080" />
        `
      } else {
        const color = numColors[val] || '#0000ff'
        cellsSvg += `
          <rect x="${x}" y="${y}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#c0c0c0" stroke="#808080" />
          <text x="${x + 7}" y="${y + 16}" font-family="'Lucida Console', Monaco, monospace" font-size="14" font-weight="900" fill="${color}">${val}</text>
        `
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      ${renderWindowChrome(id, w, h, customTitle, pal)}

      <!-- Game Menu -->
      <g transform="translate(6, 32)">
        <rect x="0" y="0" width="${w - 12}" height="20" fill="#ece9d8" />
        <line x1="0" y1="20" x2="${w - 12}" y2="20" stroke="#d5d0be" />
        <text x="10" y="14" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#000000">
          <tspan font-weight="500"><u>G</u>ame</tspan>
          <tspan dx="15" font-weight="500"><u>H</u>elp</tspan>
        </text>
      </g>

      <!-- Classic Minesweeper Bevel Board -->
      <g transform="translate(16, 56)">
        <rect x="0" y="0" width="${w - 32}" height="${h - 68}" fill="#c0c0c0" stroke="#808080" stroke-width="3" />
        
        <!-- Outer 3D Inset Border -->
        <line x1="2" y1="2" x2="${w - 36}" y2="2" stroke="#ffffff" stroke-width="2" />
        <line x1="2" y1="2" x2="2" y2="${h - 72}" stroke="#ffffff" stroke-width="2" />

        <!-- Header Panel with LED Counters & Smiley Face -->
        <g transform="translate(${Math.round((w - 32 - 400) / 2)}, 10)">
          <rect x="0" y="0" width="400" height="36" fill="#c0c0c0" stroke="#808080" stroke-width="2" />
          
          <!-- Mines Left LED Display (Red 7-segment style) -->
          <rect x="10" y="5" width="54" height="26" fill="#000000" />
          <text x="14" y="24" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="#ff0000" letter-spacing="2">${minesLeft}</text>
          
          <!-- Classic Smiley Face Button -->
          <g transform="translate(186, 4)">
            <rect x="0" y="0" width="28" height="28" rx="2" fill="#c0c0c0" stroke="#808080" stroke-width="2" />
            <line x1="1" y1="1" x2="26" y2="1" stroke="#ffffff" stroke-width="2" />
            <line x1="1" y1="1" x2="1" y2="26" stroke="#ffffff" stroke-width="2" />
            <circle cx="14" cy="14" r="10" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
            <path d="M 7 11 L 12 11 L 11 15 L 8 15 Z M 16 11 L 21 11 L 20 15 L 17 15 Z" fill="#000000" />
            <line x1="12" y1="12" x2="16" y2="12" stroke="#000000" stroke-width="1.5" />
            <path d="M 9 18 Q 14 22 19 18" stroke="#000000" stroke-width="1.5" fill="none" />
          </g>

          <!-- Commits Timer LED Display -->
          <rect x="336" y="5" width="54" height="26" fill="#000000" />
          <text x="340" y="24" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="#ff0000" letter-spacing="2">${timerSec}</text>
        </g>

        <!-- Grid Container -->
        <g>
          ${cellsSvg}
        </g>

        <!-- Bottom Game Stats Caption -->
        <text x="${w / 2 - 16}" y="${h - 82}" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">
          ${esc(customVictoryText)}
        </text>
      </g>
    </svg>
  `
}

export function renderWinXPMediaPlayer(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const w = widget.size.width || 780
  const h = widget.size.height || 300
  const id = `winxp-wmp-${widget.instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cfg = widget.config || {}
  const pal = resolveWinXPPalette(cfg, globalStyles)

  const windowTitle = (cfg.windowTitle as string) || 'Windows Media Player'
  const trackTitle =
    (cfg.trackTitle as string) || `${data.user.login} - Full Stack Symphonies (2001-2026)`
  const visualizerMode = (cfg.visualizerMode as string) || 'Ambience : Water'
  const customTime = (cfg.customTime as string) || '03:42 / 04:20'

  const topLanguages = Object.keys(data.languages || {}).slice(0, 4)
  const playlistItems =
    topLanguages.length > 0 ? topLanguages : ['TypeScript', 'React', 'Node.js', 'Rust']

  const barsCount = 28
  const barsSvg = Array.from({ length: barsCount })
    .map((_, i) => {
      const bh = 15 + Math.sin(i * 0.7) * 20 + ((i * 13) % 25)
      const x = 18 + i * 9
      const y = 140 - bh
      return `
        <rect x="${x}" y="${y}" width="6" height="${bh}" fill="url(#wmp-spectrum-${id})">
          ${
            !forceStatic
              ? `<animate attributeName="height" values="${bh};${bh * 0.4 + 10};${Math.min(55, bh * 1.3)};${bh}" dur="${1.2 + (i % 5) * 0.2}s" repeatCount="indefinite" />
                 <animate attributeName="y" values="${y};${140 - (bh * 0.4 + 10)};${140 - Math.min(55, bh * 1.3)};${y}" dur="${1.2 + (i % 5) * 0.2}s" repeatCount="indefinite" />`
              : ''
          }
        </rect>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="wmp-skin-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#192841" />
          <stop offset="50%" stop-color="#0a1324" />
          <stop offset="100%" stop-color="#050a14" />
        </linearGradient>
        <linearGradient id="wmp-spectrum-${id}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="60%" stop-color="#3b82f6" />
          <stop offset="90%" stop-color="#ec4899" />
        </linearGradient>
      </defs>

      ${renderWindowChrome(id, w, h, windowTitle, pal)}

      <!-- WMP Dark Metallic Body -->
      <g transform="translate(6, 32)">
        <rect x="0" y="0" width="${w - 12}" height="${h - 38}" rx="2" fill="url(#wmp-skin-${id})" stroke="#2a4365" stroke-width="1.5" />

        <!-- Top Navigation Ribbon / Now Playing -->
        <g transform="translate(10, 8)">
          <rect x="0" y="0" width="${w - 32}" height="26" rx="3" fill="#0f172a" stroke="#1e293b" />
          <circle cx="16" cy="13" r="8" fill="#2563eb" />
          <polygon points="14,9 20,13 14,17" fill="#ffffff" />
          <text x="32" y="17" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#60a5fa">
            Now Playing: <tspan fill="#ffffff">${esc(trackTitle)}</tspan>
          </text>
          <text x="${w - 100}" y="17" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" fill="#94a3b8">
            ${esc(customTime)}
          </text>
        </g>

        <!-- Left Visualizer Screen -->
        <g transform="translate(10, 42)">
          <rect x="0" y="0" width="280" height="150" rx="4" fill="#020617" stroke="#334155" stroke-width="2" />
          <line x1="10" y1="75" x2="270" y2="75" stroke="#1e293b" stroke-dasharray="2,2" />
          <line x1="10" y1="110" x2="270" y2="110" stroke="#1e293b" stroke-dasharray="2,2" />
          <line x1="10" y1="140" x2="270" y2="140" stroke="#2563eb" stroke-opacity="0.4" />

          ${barsSvg}

          <text x="14" y="20" font-family="'Trebuchet MS', sans-serif" font-size="11" font-weight="bold" fill="#38bdf8">
            ${esc(visualizerMode)}
          </text>
        </g>

        <!-- Right Playlist -->
        <g transform="translate(302, 42)">
          <rect x="0" y="0" width="${w - 324}" height="150" rx="4" fill="#090d16" stroke="#1e293b" />
          <text x="14" y="20" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#94a3b8">
            PLAYLIST: TECH STACK AUDIO CHANNELS
          </text>
          <line x1="14" y1="28" x2="${w - 340}" y2="28" stroke="#1e293b" />

          ${playlistItems
            .map((lang, idx) => {
              const yPos = 48 + idx * 26
              const isSelected = idx === 0
              return `
                <g transform="translate(14, ${yPos})">
                  <rect x="0" y="-12" width="${w - 355}" height="22" rx="2" fill="${isSelected ? '#1e3a8a' : 'transparent'}" />
                  <text x="8" y="3" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" font-weight="${isSelected ? 'bold' : 'normal'}" fill="${isSelected ? '#ffffff' : '#cbd5e1'}">
                    ${idx + 1}. Track 0${idx + 1} - ${esc(lang)} Code Engine.mp3
                  </text>
                  <text x="${w - 410}" y="3" font-family="'Segoe UI', Tahoma, sans-serif" font-size="9.5" fill="#64748b">
                    320 kbps
                  </text>
                </g>
              `
            })
            .join('')}
        </g>

        <!-- Bottom Transport Controls Bar -->
        <g transform="translate(10, 202)">
          <rect x="0" y="0" width="${w - 32}" height="52" rx="3" fill="#0b1322" stroke="#1e293b" />
          
          <rect x="14" y="8" width="${w - 60}" height="4" rx="2" fill="#1e293b" />
          <rect x="14" y="8" width="${Math.round((w - 60) * 0.65)}" height="4" rx="2" fill="#3b82f6" />
          <circle cx="${14 + Math.round((w - 60) * 0.65)}" cy="10" r="5" fill="#60a5fa" stroke="#ffffff" stroke-width="1.5" />

          <!-- Circular Metal Play / Pause Buttons -->
          <g transform="translate(${Math.round((w - 32) / 2 - 60)}, 20)">
            <circle cx="0" cy="14" r="11" fill="#1e293b" stroke="#3b82f6" />
            <polygon points="-4,14 2,9 2,19" fill="#93c5fd" />
            <line x1="-4" y1="9" x2="-4" y2="19" stroke="#93c5fd" stroke-width="1.5" />

            <circle cx="35" cy="14" r="15" fill="url(#wmp-spectrum-${id})" stroke="#ffffff" stroke-width="1.5" />
            <rect x="30" y="8" width="3.5" height="12" fill="#ffffff" />
            <rect x="36.5" y="8" width="3.5" height="12" fill="#ffffff" />

            <circle cx="70" cy="14" r="11" fill="#1e293b" stroke="#3b82f6" />
            <polygon points="4,14 -2,9 -2,19" fill="#93c5fd" />
            <line x1="4" y1="9" x2="4" y2="19" stroke="#93c5fd" stroke-width="1.5" />

            <circle cx="100" cy="14" r="11" fill="#1e293b" stroke="#3b82f6" />
            <rect x="96" y="10" width="8" height="8" fill="#93c5fd" />
          </g>

          <g transform="translate(${w - 150}, 30)">
            <path d="M 0 5 L 4 5 L 8 1 L 8 9 L 4 5 Z" fill="#94a3b8" />
            <rect x="16" y="4" width="70" height="3" rx="1.5" fill="#334155" />
            <rect x="16" y="4" width="55" height="3" rx="1.5" fill="#10b981" />
            <circle cx="71" cy="5.5" r="4" fill="#ffffff" stroke="#10b981" stroke-width="1.5" />
          </g>
        </g>
      </g>
    </svg>
  `
}

export function renderWinXPPaint(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const h = widget.size.height || 360
  const id = `winxp-paint-${widget.instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cfg = widget.config || {}
  const pal = resolveWinXPPalette(cfg, globalStyles)

  const windowTitle = (cfg.windowTitle as string) || 'untitled - Paint'
  const artworkHeading = (cfg.artworkHeading as string) || 'My GitHub Artwork 🎨'
  const sortBy = (cfg.repoSortBy as string) || 'stars'
  const selectedRepos: string[] = Array.isArray(cfg.selectedRepos)
    ? (cfg.selectedRepos as string[])
    : []

  const allRepos = data.repos ? [...data.repos].filter((r) => !r.fork) : []

  const sortedRepos = [...allRepos].sort((a, b) => {
    if (sortBy === 'updated')
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    if (sortBy === 'forks') return b.forks_count - a.forks_count
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return b.stargazers_count - a.stargazers_count
  })

  const reposToDisplay =
    selectedRepos.length > 0
      ? sortedRepos.filter((r) => selectedRepos.includes(r.name)).slice(0, 3)
      : sortedRepos.slice(0, 3)

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      ${renderWindowChrome(id, w, h, windowTitle, pal)}

      <!-- Menu Bar -->
      <g transform="translate(6, 32)">
        <rect x="0" y="0" width="${w - 12}" height="20" fill="#ece9d8" />
        <line x1="0" y1="20" x2="${w - 12}" y2="20" stroke="#d5d0be" />
        <text x="10" y="14" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#000000">
          <tspan font-weight="500"><u>F</u>ile</tspan>
          <tspan dx="15" font-weight="500"><u>E</u>dit</tspan>
          <tspan dx="15" font-weight="500"><u>V</u>iew</tspan>
          <tspan dx="15" font-weight="500"><u>I</u>mage</tspan>
          <tspan dx="15" font-weight="500"><u>C</u>olors</tspan>
          <tspan dx="15" font-weight="500"><u>H</u>elp</tspan>
        </text>
      </g>

      <!-- Main Paint Workspace -->
      <g transform="translate(10, 56)">
        <!-- Left Classic Tool Palette -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="58" height="230" fill="#ece9d8" stroke="#7f9db9" stroke-width="1.5" />
          
          <rect x="4" y="4" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <polygon points="15,7 17,12 22,12 18,15 20,20 15,17 10,20 12,15 8,12 13,12" fill="#3b82f6" />
          <rect x="30" y="4" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <rect x="34" y="8" width="14" height="14" fill="none" stroke="#000000" stroke-dasharray="2,2" />

          <rect x="4" y="30" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <rect x="8" y="37" width="14" height="9" rx="1" fill="#f43f5e" stroke="#000000" />
          <rect x="30" y="30" width="22" height="22" fill="#ffffff" stroke="#0058ee" stroke-width="2" />
          <path d="M 37 38 L 47 43 L 42 49 L 34 44 Z" fill="#2563eb" />

          <rect x="4" y="56" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <line x1="8" y1="72" x2="18" y2="62" stroke="#000000" stroke-width="2" />
          <rect x="30" y="56" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <circle cx="39" cy="65" r="5" fill="none" stroke="#000000" stroke-width="2" />
          <line x1="43" y1="69" x2="48" y2="74" stroke="#000000" stroke-width="2" />

          <rect x="4" y="82" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <line x1="8" y1="98" x2="18" y2="88" stroke="#f59e0b" stroke-width="3" />
          <rect x="30" y="82" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <path d="M 36 98 C 36 94 44 94 44 88" stroke="#10b981" stroke-width="2" fill="none" />

          <rect x="4" y="108" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <circle cx="12" cy="116" r="1" fill="#000000" />
          <circle cx="16" cy="120" r="1.5" fill="#000000" />
          <circle cx="14" cy="124" r="1" fill="#000000" />
          <rect x="30" y="108" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <text x="36" y="124" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="bold" fill="#000000">A</text>

          <rect x="4" y="134" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <line x1="8" y1="150" x2="20" y2="138" stroke="#000000" stroke-width="2" />
          <rect x="30" y="134" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <path d="M 34 150 Q 41 136 48 150" stroke="#000000" stroke-width="2" fill="none" />

          <rect x="4" y="160" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <rect x="8" y="166" width="14" height="10" fill="none" stroke="#000000" stroke-width="1.5" />
          <rect x="30" y="160" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <polygon points="35,174 41,164 48,172 40,178" fill="none" stroke="#000000" stroke-width="1.5" />

          <rect x="4" y="186" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <ellipse cx="15" cy="197" rx="8" ry="6" fill="none" stroke="#000000" stroke-width="1.5" />
          <rect x="30" y="186" width="22" height="22" fill="#ece9d8" stroke="#808080" />
          <rect x="34" y="191" width="14" height="11" rx="3" fill="none" stroke="#000000" stroke-width="1.5" />
        </g>

        <!-- Center White Drawing Board (Canvas) -->
        <g transform="translate(68, 0)">
          <rect x="0" y="0" width="${w - 90}" height="230" fill="#808080" />
          <rect x="2" y="2" width="${w - 94}" height="226" fill="#ffffff" stroke="#000000" stroke-width="1" />

          <g transform="translate(20, 20)">
            <text font-family="'Comic Sans MS', 'Chalkboard SE', cursive" font-size="18" font-weight="bold" fill="#2563eb">
              ${esc(artworkHeading)}
            </text>
            <text y="24" font-family="'Courier New', Courier, monospace" font-size="12" fill="#475569">
              Total Stars: ${data.totalStars} • Repos: ${reposToDisplay.length} Displayed
            </text>

            <g transform="translate(0, 44)">
              ${reposToDisplay
                .map((repo, i) => {
                  const x = i * 215
                  return `
                    <g transform="translate(${x}, 0)">
                      <rect x="0" y="0" width="200" height="95" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
                      <rect x="0" y="0" width="200" height="20" fill="#f59e0b" />
                      <text x="8" y="14" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">
                        📁 ${esc(repo.name)}
                      </text>
                      <text x="10" y="44" font-family="'Comic Sans MS', cursive" font-size="10.5" fill="#78350f">
                        ${esc((repo.description || 'Open Source Project').slice(0, 30))}
                      </text>
                      <polygon points="20,65 24,73 33,73 26,79 29,88 20,83 12,88 15,79 8,73 17,73" fill="#eab308" stroke="#ca8a04" />
                      <text x="38" y="80" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#b45309">
                        ★ ${repo.stargazers_count} Stars
                      </text>
                    </g>
                  `
                })
                .join('')}
            </g>
          </g>
        </g>

        <!-- Bottom Color Palette Bar -->
        <g transform="translate(0, 238)">
          <rect x="0" y="0" width="${w - 20}" height="36" fill="#ece9d8" stroke="#7f9db9" stroke-width="1.5" />
          <rect x="6" y="6" width="24" height="24" fill="#ffffff" stroke="#808080" />
          <rect x="12" y="12" width="14" height="14" fill="#2563eb" stroke="#000000" />
          
          <g transform="translate(42, 6)">
            ${[
              '#000000',
              '#808080',
              '#800000',
              '#808000',
              '#008000',
              '#008080',
              '#000080',
              '#800080',
              '#808040',
              '#004040',
              '#0080ff',
              '#004080',
              '#8000ff',
              '#804000',
              '#ffffff',
              '#c0c0c0',
              '#ff0000',
              '#ffff00',
              '#00ff00',
              '#00ffff',
              '#0000ff',
              '#ff00ff',
              '#ffff80',
              '#00ff80',
              '#80ffff',
              '#7f9db9',
              '#ff80ff',
              '#ff8040',
            ]
              .map((color, i) => {
                const r = i >= 14 ? 1 : 0
                const c = i % 14
                return `<rect x="${c * 16}" y="${r * 12}" width="15" height="11" fill="${color}" stroke="#808080" stroke-width="1" />`
              })
              .join('')}
          </g>
        </g>
      </g>
    </svg>
  `
}

export function renderWinXPTaskbar(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const h = widget.size.height || 48
  const id = `winxp-taskbar-${widget.instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cfg = widget.config || {}

  const username = data.user.login || 'User'
  const customTime = (cfg.customTime as string) || '04:20 PM'
  const startButtonLabel = (cfg.startButtonLabel as string) || 'start'
  const activeWindowLabel = (cfg.activeWindowLabel as string) || `${username} - GitAscii`
  const inactiveWindowLabel = (cfg.inactiveWindowLabel as string) || 'Minesweeper'

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="winxp-tb-grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#245edb" />
          <stop offset="10%" stop-color="#3f8cf3" />
          <stop offset="30%" stop-color="#245edb" />
          <stop offset="90%" stop-color="#1941a5" />
          <stop offset="100%" stop-color="#1941a5" />
        </linearGradient>

        <linearGradient id="winxp-start-grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#388e3c" />
          <stop offset="12%" stop-color="#66bb6a" />
          <stop offset="45%" stop-color="#43a047" />
          <stop offset="90%" stop-color="#2e7d32" />
          <stop offset="100%" stop-color="#1b5e20" />
        </linearGradient>

        <linearGradient id="winxp-tray-grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0f64c8" />
          <stop offset="30%" stop-color="#1e7ce8" />
          <stop offset="90%" stop-color="#0e54ad" />
          <stop offset="100%" stop-color="#0b418a" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="${w}" height="${h}" fill="url(#winxp-tb-grad-${id})" />
      <line x1="0" y1="0" x2="${w}" y2="0" stroke="#529bf7" stroke-width="1.5" />

      <!-- Iconic Green Start Button -->
      <g transform="translate(0, 0)">
        <path d="M 0 0 L 105 0 Q 118 0 120 24 Q 118 48 105 48 L 0 48 Z" fill="url(#winxp-start-grad-${id})" />
        
        <g transform="translate(14, 12)">
          <path d="M 3 4 Q 7 2 10 4 L 10 10 Q 6 8 3 10 Z" fill="#e11d48" />
          <path d="M 12 4 Q 16 6 19 4 L 19 10 Q 15 12 12 10 Z" fill="#2563eb" />
          <path d="M 3 12 Q 7 10 10 12 L 10 18 Q 6 16 3 18 Z" fill="#16a34a" />
          <path d="M 12 12 Q 16 14 19 12 L 19 18 Q 15 20 12 18 Z" fill="#ca8a04" />
        </g>

        <text x="44" y="31" font-family="'Trebuchet MS', 'Segoe UI', Tahoma, sans-serif" font-size="19" font-weight="900" font-style="italic" fill="#ffffff" style="text-shadow: 1px 1px 2px #0f380f;">
          ${esc(startButtonLabel)}
        </text>
      </g>

      <!-- Quick Launch Toolbar -->
      <g transform="translate(130, 8)">
        <line x1="0" y1="4" x2="0" y2="28" stroke="#1d4ed8" stroke-width="1" />
        <line x1="1" y1="4" x2="1" y2="28" stroke="#60a5fa" stroke-width="1" />
        
        <rect x="8" y="6" width="18" height="18" rx="2" fill="#0284c7" stroke="#38bdf8" />
        <circle cx="42" cy="15" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" />
        <text x="38" y="19" font-family="'Georgia', serif" font-size="13" font-weight="bold" font-style="italic" fill="#ffffff">e</text>
        <circle cx="68" cy="15" r="9" fill="#f97316" />
        <polygon points="66,11 72,15 66,19" fill="#ffffff" />
      </g>

      <!-- Running Task Windows Buttons (Active Tabs) -->
      <g transform="translate(225, 6)">
        <rect x="0" y="0" width="165" height="34" rx="3" fill="#1e40af" stroke="#3b82f6" stroke-width="1.5" />
        <circle cx="16" cy="17" r="6" fill="#22c55e" />
        <text x="28" y="21" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">
          ${esc(activeWindowLabel)}
        </text>

        <rect x="175" y="0" width="145" height="34" rx="3" fill="#2563eb" stroke="#1d4ed8" stroke-width="1" />
        <polygon points="186,13 194,17 186,21" fill="#facc15" />
        <text x="200" y="21" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#dbeafe">
          ${esc(inactiveWindowLabel)}
        </text>
      </g>

      <!-- System Notification Tray (Bottom Right) -->
      <g transform="translate(${w - 145}, 0)">
        <path d="M 12 0 L ${145} 0 L ${145} 48 L 0 48 Q 8 24 12 0 Z" fill="url(#winxp-tray-grad-${id})" />
        <line x1="12" y1="0" x2="${145}" y2="0" stroke="#3b82f6" stroke-width="1.5" />
        
        <g transform="translate(20, 16)">
          <path d="M 0 5 L 4 5 L 8 1 L 8 11 L 4 7 L 0 7 Z" fill="#ffffff" />
          <rect x="16" y="2" width="10" height="8" rx="1" fill="#22c55e" stroke="#ffffff" stroke-width="1" />
          <polygon points="34,2 40,4 40,8 34,13 28,8 28,4" fill="#eab308" />
        </g>

        <text x="80" y="29" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11.5" font-weight="bold" fill="#ffffff">
          ${esc(customTime)}
        </text>
      </g>
    </svg>
  `
}

// 6. WINXP CRITICAL ERROR DIALOG
export function renderWinXPErrorDialog(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 520
  const h = widget.size.height || 210
  const id = `winxp-error-${widget.instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cfg = widget.config || {}
  const pal = resolveWinXPPalette(cfg, globalStyles)

  const errorTitle = (cfg.errorTitle as string) || 'CommitOverflow.exe - System Error'
  const errorMessage =
    (cfg.errorMessage as string) ||
    'An unhandled git commit overload has occurred at 0x004A9F21. The developer profile cannot stop coding.'
  const errorCode = (cfg.errorCode as string) || 'Error Code: 0x80004005 (E_FAIL_PERFECTION)'
  const okButtonLabel = (cfg.okButtonLabel as string) || 'OK'
  const cancelButtonLabel = (cfg.cancelButtonLabel as string) || 'Cancel'
  const msgLines = wrap(errorMessage, 48).slice(0, 3)

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      ${renderWindowChrome(id, w, h, errorTitle, pal)}

      <!-- Dialog Body -->
      <g transform="translate(16, 46)">
        <g transform="translate(10, 15)">
          <circle cx="20" cy="20" r="18" fill="#dc2626" stroke="#991b1b" stroke-width="2" />
          <path d="M 12 12 L 28 28 M 28 12 L 12 28" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />
        </g>

        <g transform="translate(64, 14)">
          ${msgLines
            .map(
              (line, idx) =>
                `<text y="${idx * 16}" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11.5" fill="#0f172a">${esc(line)}</text>`
            )
            .join('')}
          <text y="${msgLines.length * 16 + 14}" font-family="'Courier New', Courier, monospace" font-size="10.5" font-weight="bold" fill="#64748b">
            ${esc(errorCode)}
          </text>
        </g>

        <g transform="translate(${Math.round(w / 2 - 95)}, ${h - 96})">
          <rect x="0" y="0" width="75" height="24" rx="3" fill="#ece9d8" stroke="#0058ee" stroke-width="1.5" />
          <rect x="2" y="2" width="71" height="20" fill="none" stroke="#000000" stroke-dasharray="1,1" />
          <text x="28" y="16" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#000000">${esc(okButtonLabel)}</text>

          <rect x="90" y="0" width="75" height="24" rx="3" fill="#ece9d8" stroke="#7f9db9" stroke-width="1.5" />
          <text x="108" y="16" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#000000">${esc(cancelButtonLabel)}</text>
        </g>
      </g>
    </svg>
  `
}

// 7. WINXP SYSTEM PROPERTIES (LANGUAGES WIDGET)
export function renderWinXPSystemProperties(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const h = widget.size.height || 400
  const id = `winxp-sysprop-${widget.instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cfg = widget.config || {}
  const pal = resolveWinXPPalette(cfg, globalStyles)

  const windowTitle = (cfg.windowTitle as string) || 'System Properties'
  const activeTab = (cfg.activeTab as string) || 'Languages'
  const layout = (cfg.langsLayout as string) || 'bars'
  const displayMode =
    (cfg.langDisplayMode as 'icon_name' | 'icon_only' | 'name_only') || 'icon_name'
  const langsCount = Number(cfg.langsCount) || 5
  const showPercentage = cfg.showPercentage !== false

  const hideLangs: string[] = Array.isArray(cfg.hideLangsArr)
    ? (cfg.hideLangsArr as string[])
    : typeof cfg.hideLangs === 'string' && cfg.hideLangs
      ? (cfg.hideLangs as string)
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean)
      : []

  const rawLanguages = data.languages || {}
  const filteredLanguages = Object.entries(rawLanguages)
    .filter(([name]) => !hideLangs.some((h) => h.toLowerCase() === name.toLowerCase()))
    .sort(([, bytesA], [, bytesB]) => bytesB - bytesA)
    .slice(0, langsCount)

  const totalBytes = filteredLanguages.reduce((sum, [, bytes]) => sum + bytes, 0) || 1

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      ${renderWindowChrome(id, w, h, windowTitle, pal)}

      <!-- Dialog Tab Controls (General, Languages, Hardware, Advanced) -->
      <g transform="translate(14, 34)">
        <!-- Tabs Header Bar -->
        <g>
          <!-- Tab 1: General (Inactive) -->
          <path d="M 0 16 L 0 4 Q 0 0 4 0 L 60 0 Q 64 0 64 4 L 64 16 Z" fill="#ece9d8" stroke="#999999" />
          <text x="14" y="11" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" fill="#555555">General</text>

          <!-- Tab 2: Languages (Active - Highlighted Top) -->
          <path d="M 66 16 L 66 2 Q 66 -2 70 -2 L 155 -2 Q 159 -2 159 2 L 159 16 Z" fill="#ffffff" stroke="#0058ee" stroke-width="1.5" />
          <text x="82" y="11" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#001a66">${esc(activeTab)}</text>

          <!-- Tab 3: Hardware (Inactive) -->
          <path d="M 161 16 L 161 4 Q 161 0 165 0 L 230 0 Q 234 0 234 4 L 234 16 Z" fill="#ece9d8" stroke="#999999" />
          <text x="175" y="11" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" fill="#555555">Hardware</text>

          <!-- Tab 4: Advanced (Inactive) -->
          <path d="M 236 16 L 236 4 Q 236 0 240 0 L 305 0 Q 309 0 309 4 L 309 16 Z" fill="#ece9d8" stroke="#999999" />
          <text x="250" y="11" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" fill="#555555">Advanced</text>
        </g>

        <!-- Main Tab Pane Body (White with 3D Border) -->
        <g transform="translate(0, 16)">
          <rect x="0" y="0" width="${w - 28}" height="${h - 96}" fill="#ffffff" stroke="#7f9db9" stroke-width="1.5" />

          <!-- Monitor and System Language Specs Header -->
          <g transform="translate(18, 14)">
            <!-- Classic CRT Monitor Icon -->
            <rect x="0" y="0" width="48" height="38" rx="3" fill="#ece9d8" stroke="#7f9db9" stroke-width="2" />
            <rect x="4" y="4" width="40" height="30" rx="1" fill="#0284c7" />
            <polygon points="12,14 24,6 36,14" fill="#38bdf8" opacity="0.6" />
            <rect x="18" y="38" width="12" height="8" fill="#94a3b8" />
            <rect x="12" y="46" width="24" height="4" rx="1" fill="#64748b" />

            <g transform="translate(60, 4)">
              <text font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0f172a">
                Installed Programming Language Drivers
              </text>
              <text y="16" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" fill="#64748b">
                Driver Provider: GitHub GraphQL API • Total Byte Size: ${(totalBytes / 1024).toFixed(1)} KB
              </text>
            </g>
          </g>

          <!-- Divider line -->
          <line x1="18" y1="74" x2="${w - 46}" y2="74" stroke="#d5d0be" />

          <!-- Languages List / Progress Bars Content -->
          <g transform="translate(18, 86)">
            ${
              layout === 'list'
                ? filteredLanguages
                    .map(([name, bytes], i) => {
                      const pct = ((bytes / totalBytes) * 100).toFixed(1)
                      const color = (LANGUAGE_COLORS as Record<string, string>)[name] || '#2563eb'
                      const y = i * 32
                      const showIcon = displayMode === 'icon_name' || displayMode === 'icon_only'
                      const showName = displayMode === 'icon_name' || displayMode === 'name_only'

                      return `
                        <g transform="translate(0, ${y})">
                          <rect x="0" y="0" width="${w - 64}" height="26" rx="2" fill="${i % 2 === 0 ? '#f8fafc' : '#ffffff'}" stroke="#e2e8f0" />
                          ${
                            showIcon
                              ? `
                                <rect x="8" y="5" width="16" height="16" rx="2" fill="${color}" stroke="#1e293b" stroke-width="1" />
                                <text x="16" y="16" font-family="'Courier New', monospace" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">
                                  ${esc(name.slice(0, 2).toUpperCase())}
                                </text>
                              `
                              : ''
                          }
                          ${
                            showName
                              ? `
                                <text x="${showIcon ? 32 : 12}" y="17" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#1e3a8a">
                                  ${esc(name)} Driver (v${i + 1}.0.4)
                                </text>
                              `
                              : ''
                          }
                          <text x="${w - 220}" y="17" font-family="'Segoe UI', Tahoma, sans-serif" font-size="10.5" fill="#64748b">
                            ${(bytes / 1024).toFixed(1)} KB ${showPercentage ? `(${pct}%)` : ''}
                          </text>
                          <rect x="${w - 110}" y="6" width="38" height="14" rx="1" fill="#ece9d8" stroke="#999999" />
                          <text x="${w - 103}" y="17" font-family="'Segoe UI', sans-serif" font-size="9" fill="#000000">Active</text>
                        </g>
                      `
                    })
                    .join('')
                : filteredLanguages
                    .map(([name, bytes], i) => {
                      const pct = Math.round((bytes / totalBytes) * 100)
                      const color = (LANGUAGE_COLORS as Record<string, string>)[name] || '#22c55e'
                      const barWidth = Math.max(12, Math.round(((w - 240) * pct) / 100))
                      const y = i * 34
                      const showIcon = displayMode === 'icon_name' || displayMode === 'icon_only'
                      const showName = displayMode === 'icon_name' || displayMode === 'name_only'

                      return `
                        <g transform="translate(0, ${y})">
                          ${
                            showIcon
                              ? `
                                <rect x="0" y="3" width="16" height="16" rx="2" fill="${color}" stroke="#1e293b" stroke-width="1" />
                                <text x="8" y="14" font-family="'Courier New', monospace" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">
                                  ${esc(name.slice(0, 2).toUpperCase())}
                                </text>
                              `
                              : ''
                          }
                          ${
                            showName
                              ? `
                                <text x="${showIcon ? 24 : 0}" y="15" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#1e3a8a">
                                  ${esc(name)}
                                </text>
                              `
                              : ''
                          }
                          <rect x="140" y="4" width="${w - 250}" height="16" fill="#ffffff" stroke="#7f9db9" stroke-width="1.5" />
                          <rect x="142" y="6" width="${barWidth}" height="12" fill="${color}" />
                          ${showPercentage ? `<text x="${w - 95}" y="16" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#334155">${pct}%</text>` : ''}
                        </g>
                      `
                    })
                    .join('')
            }
          </g>
        </g>
      </g>

      <g transform="translate(${w - 250}, ${h - 36})">
        <rect x="0" y="0" width="70" height="22" rx="3" fill="#ece9d8" stroke="#0058ee" stroke-width="1.5" />
        <text x="26" y="15" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" font-weight="bold" fill="#000000">OK</text>

        <rect x="80" y="0" width="70" height="22" rx="3" fill="#ece9d8" stroke="#7f9db9" stroke-width="1.5" />
        <text x="98" y="15" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#000000">Cancel</text>

        <rect x="160" y="0" width="70" height="22" rx="3" fill="#ece9d8" stroke="#7f9db9" stroke-width="1.5" opacity="0.6" />
        <text x="180" y="15" font-family="'Segoe UI', Tahoma, sans-serif" font-size="11" fill="#888888">Apply</text>
      </g>
    </svg>
  `
}

export function renderWinXPBliss(
  widget: WidgetInstance,
  _data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const w = widget.size.width || 780
  const h = widget.size.height || 440
  const id = `winxp-bliss-${widget.instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const cfg = widget.config || {}
  const pal = resolveWinXPPalette(cfg, globalStyles)

  const chromeH = 28
  const menuH = 22
  const innerY = chromeH + menuH + 2
  const innerH = h - innerY - 2
  const innerW = w - 6

  const imageUrl = (cfg.imageUrl as string) || EXTERNAL_LINKS.DEFAULT_WINXP_BLISS_WALLPAPER

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      ${renderWindowChrome(id, w, h, 'Bliss.bmp - Windows Picture and Fax Viewer', pal)}

      <rect x="3" y="${chromeH}" width="${w - 6}" height="${menuH}" fill="#ece9d8" />
      <line x1="3" y1="${chromeH + menuH}" x2="${w - 3}" y2="${chromeH + menuH}" stroke="#d5d0be" stroke-width="1"/>
      <text x="12" y="${chromeH + 15}" font-family="Tahoma, sans-serif" font-size="11" fill="#000">
        <tspan font-weight="500"><u>F</u>ile</tspan>
        <tspan dx="14"><u>V</u>iew</tspan>
        <tspan dx="14"><u>H</u>elp</tspan>
      </text>

      <defs>
        <clipPath id="bliss-clip-${id}">
          <rect x="3" y="${innerY}" width="${innerW}" height="${innerH}" />
        </clipPath>
      </defs>

      <g clip-path="url(#bliss-clip-${id})">
        <!-- Background placeholder while loading -->
        <rect x="3" y="${innerY}" width="${innerW}" height="${innerH}" fill="#3a8fd4" />

        <!-- Real Bliss Wallpaper Image -->
        <image
          href="${esc(imageUrl)}"
          x="3"
          y="${innerY}"
          width="${innerW}"
          height="${innerH}"
          preserveAspectRatio="xMidYMid slice"
        />
      </g>

      <!-- Window border bottom -->
      <rect x="3" y="${h - 4}" width="${innerW}" height="2" fill="#d4d0c8" />
    </svg>
  `
}
