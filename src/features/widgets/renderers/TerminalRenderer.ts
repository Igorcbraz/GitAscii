import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import type { GitHubRepo } from '@/features/github/types/github'

function localEscapeXml(str: string): string {
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

export function renderTerminal(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const isDark = true
  const bg = isDark ? '#0B0F0C' : '#F4F6F4'
  const panel = isDark ? '#101511' : '#FFFFFF'
  const chrome = isDark ? '#1A211B' : '#E8EDE8'
  const border = isDark ? '#2A342B' : '#C8D2C8'
  const textClr = isDark ? '#D7E4D9' : '#1F2B21'
  const muted = isDark ? '#8CA08E' : '#5E6E60'
  const faint = isDark ? '#59695B' : '#96A497'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#b6a891'
  const secondary = (cfg.secondaryColor as string) || '#E84A8A'

  const repos = data.repos || []
  const layers = repos.slice(0, 10)
  const count = layers.length

  const TEE = `├── `
  const ELBOW = `└── `
  const PIPE = `│   `

  const lines: string[] = []

  lines.push(
    `<tspan fill="${primary}" font-weight="700">$ </tspan><tspan fill="${textClr}">whoami</tspan>`
  )
  lines.push(
    `<tspan fill="${textClr}" font-weight="700">${localEscapeXml(data.user.name || data.user.login || 'USER')}</tspan>`
  )

  lines.push(
    `<tspan fill="${primary}" font-weight="700">$ </tspan><tspan fill="${textClr}">tree projects/</tspan>`
  )
  lines.push(`<tspan fill="${secondary}" font-weight="700">projects/</tspan>`)

  layers.forEach((layer: GitHubRepo, index: number) => {
    const last = index === count - 1
    const branch = last ? ELBOW : TEE
    const name = localEscapeXml(shorten(layer.name, 22))
    const lang = localEscapeXml(shorten(layer.language || 'Code', 15))
    lines.push(
      `<tspan fill="${faint}">${branch}</tspan>` +
        `<tspan fill="${secondary}" font-weight="700">${name}/</tspan>`
    )
    lines.push(
      `<tspan fill="${faint}">${last ? '    ' : PIPE}${ELBOW}</tspan>` +
        `<tspan fill="${primary}" font-weight="700">${lang}</tspan>` +
        `<tspan fill="${muted}"> · ★ ${layer.stargazers_count || 0}</tspan>`
    )
  })

  lines.push(`<tspan fill="${muted}">${count} directories, ${count} projects</tspan>`)

  const text_elements = lines.map((lineHtml, i) => {
    const y = 72 + i * 18
    return `
      <g class="ln-${widget.instanceId}" style="animation-delay: ${i * 45}ms">
        <text x="46" y="${y}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11.5">${lineHtml}</text>
      </g>
    `
  })

  const cursorY = 72 + lines.length * 18
  const cursor_element = `
    <g class="cur-${widget.instanceId}">
      <text x="46" y="${cursorY}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11.5" fill="${primary}" font-weight="700">$</text>
      <rect x="61" y="${cursorY - 10}" width="7" height="13" fill="${primary}"/>
    </g>
  `

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          @keyframes reveal { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes blink { 50% { opacity: 0; } }
          .ln-${widget.instanceId} { animation: reveal .3s ease-out forwards; opacity: 0; }
          .cur-${widget.instanceId} { animation: blink 1.1s steps(1) infinite; }
        </style>
      </defs>

      <rect width="800" height="520" fill="${bg}"/>
      <rect x="14" y="14" width="772" height="492" rx="10" fill="${panel}" stroke="${border}" stroke-width="1.2"/>

      <!-- Chrome Bar -->
      <path d="M14 48V24 a10 10 0 0 1 10-10 h752 a10 10 0 0 1 10 10 v24 Z" fill="${chrome}"/>
      <path d="M14 48 h772" stroke="${border}" stroke-width="1"/>

      <!-- Control Circles -->
      <circle cx="38" cy="31" r="5.5" fill="#FF5F57"/>
      <circle cx="57" cy="31" r="5.5" fill="#FEBC2E"/>
      <circle cx="76" cy="31" r="5.5" fill="#28C840"/>

      <text x="400" y="35" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11" letter-spacing=".5" fill="${muted}">${localEscapeXml(data.user.login)}@github: ~/projects</text>

      <!-- Terminal Body -->
      <g>
        ${text_elements.join('\n')}
        ${cursor_element}
      </g>
    </svg>
  `
}
