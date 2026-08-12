// We will export escapeXml or define it here
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

// Helper to escape XML
function localEscapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderTerminal(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config
  const commands = Array.isArray(cfg.terminalCommands)
    ? (cfg.terminalCommands as string[])
    : ['$ whoami', 'user', '$ uname -a', 'Linux GitAscii']

  const bg1 = '#0b0f14'
  const bg2 = '#151c25'
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#b6a891'
  const text_color = (cfg.textColor as string) || globalStyles.textColor || '#eceff4'
  const font = 'Consolas, monospace'

  const line_height = 22
  const font_size = 14
  const pad_x = 20
  const pad_y = 60

  const delay_per_line = 0.8
  const css_rules: string[] = []
  for (let i = 0; i < commands.length; i++) {
    const delay = i * delay_per_line
    css_rules.push(
      `.line${i}-${widget.instanceId} { opacity: 0; animation: reveal 0.1s ${delay.toFixed(2)}s forwards; }`
    )
  }

  const css_keyframes = '@keyframes reveal { from { opacity: 0; } to { opacity: 1; } }'
  const cursor_delay = commands.length * delay_per_line
  const css_cursor = `.cursor-${widget.instanceId} { opacity: 0; animation: reveal 0.1s ${cursor_delay.toFixed(2)}s forwards, blink 1s ${cursor_delay.toFixed(2)}s step-end infinite; }`
  const css_blink = '@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }'

  const full_css = `
    ${css_keyframes}
    ${css_blink}
    ${css_rules.join('\n    ')}
    ${css_cursor}
    .terminal-bg-${widget.instanceId} { font-family: ${font}, 'Courier New', monospace; font-size: ${font_size}px; }
  `

  const text_elements: string[] = []
  for (let i = 0; i < commands.length; i++) {
    const line = commands[i]
    const y = pad_y + i * line_height
    const is_command =
      line.trim().startsWith('$') || line.trim().startsWith('#') || line.trim().startsWith('>')
    const color = is_command ? accent : text_color
    const safe_line = localEscapeXml(line)
    text_elements.push(
      `  <text x="${pad_x}" y="${y}" fill="${color}" class="line${i}-${widget.instanceId}">${safe_line}</text>`
    )
  }

  const cursor_y = pad_y + commands.length * line_height
  const cursor_element = `  <rect x="${pad_x}" y="${cursor_y - font_size}" width="8" height="${font_size + 2}" fill="${accent}" class="cursor-${widget.instanceId}"/>`

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
        ${full_css}
        </style>
        <clipPath id="terminal-clip-${widget.instanceId}">
          <rect width="600" height="340" rx="12" ry="12"/>
        </clipPath>
        <linearGradient id="termBg-${widget.instanceId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="340" rx="12" ry="12" fill="url(#termBg-${widget.instanceId})" stroke="${bg2}" stroke-width="1.5"/>
      <rect width="600" height="36" rx="12" ry="12" fill="#151c25"/>
      <rect y="24" width="600" height="12" fill="#151c25"/>
      <circle cx="20" cy="18" r="6" fill="#ff5f57"/>
      <circle cx="40" cy="18" r="6" fill="#febc2e"/>
      <circle cx="60" cy="18" r="6" fill="#28c840"/>
      <text x="300" y="23" text-anchor="middle" fill="#888" font-size="12" font-family="${font}">terminal</text>
      <g class="terminal-bg-${widget.instanceId}" clip-path="url(#terminal-clip-${widget.instanceId})">
        ${text_elements.join('\n')}
        ${cursor_element}
      </g>
    </svg>
  `
}
