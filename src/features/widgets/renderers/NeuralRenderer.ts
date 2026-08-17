import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function localEscapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderNeural(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const neuralTechs =
    typeof cfg.neuralTechs === 'object' && cfg.neuralTechs !== null
      ? (cfg.neuralTechs as Record<string, string[]>)
      : {
          Frontend: ['react', 'nextjs', 'tailwind'],
          Backend: ['nodejs', 'postgres', 'docker'],
          DevOps: ['git', 'github', 'linux'],
        }

  const techNameMap: Record<string, string> = {
    js: 'JS',
    ts: 'TS',
    html: 'HTML',
    css: 'CSS',
    py: 'Python',
    rust: 'Rust',
    go: 'Go',
    react: 'React',
    nextjs: 'Next.js',
    nodejs: 'Node.js',
    postgres: 'Postgres',
    docker: 'Docker',
    git: 'Git',
    github: 'GitHub',
    linux: 'Linux',
    tailwind: 'Tailwind',
  }

  const categories = Object.entries(neuralTechs).map(([cat, list]) => ({
    cat,
    techs: Array.isArray(list)
      ? list.map((id) => (typeof id === 'string' ? techNameMap[id] || id.toUpperCase() : 'TECH'))
      : [],
  }))

  const bg1 = '#0b0f14'
  const bg2 = '#151c25'
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#b6a891'
  const text_col = (cfg.textColor as string) || globalStyles.textColor || '#eceff4'
  const font = 'Consolas, monospace'

  const n_cols = categories.length
  const col_xs = Array.from({ length: n_cols }, (_, i) =>
    Math.floor((800 * (i + 1)) / (n_cols + 1))
  )

  const node_positions: { x: number; y: number; tech: string }[][] = []
  categories.forEach((c, col_i) => {
    const cx = col_xs[col_i]
    const n = c.techs.length
    const ys = Array.from({ length: n }, (_, j) => Math.floor((260 * (j + 1)) / (n + 1)))
    node_positions.push(ys.map((y, idx) => ({ x: cx, y, tech: c.techs[idx] })))
  })

  const svgPaths: string[] = []
  const edge_paths: string[] = []
  for (let col_i = 0; col_i < n_cols - 1; col_i++) {
    for (const node1 of node_positions[col_i]) {
      for (const node2 of node_positions[col_i + 1]) {
        const cp1x = node1.x + Math.floor((node2.x - node1.x) / 3)
        const cp2x = node2.x - Math.floor((node2.x - node1.x) / 3)
        const path = `M${node1.x} ${node1.y} C${cp1x} ${node1.y},${cp2x} ${node2.y},${node2.x} ${node2.y}`
        edge_paths.push(path)
        svgPaths.push(
          `  <path d="${path}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.2"/>`
        )
      }
    }
  }

  edge_paths.forEach((path, i) => {
    const dur = (2.5 + (i % 3) * 0.7).toFixed(1)
    svgPaths.push(`
      <circle r="2.5" fill="${accent}" opacity="0.9" filter="url(#glow-${widget.instanceId})">
        <animateMotion dur="${dur}s" repeatCount="indefinite" path="${path}"/>
      </circle>
    `)
  })

  categories.forEach((c, col_i) => {
    const cx = col_xs[col_i]
    const safeCategory = localEscapeXml(c.cat.toUpperCase())
    svgPaths.push(`
      <text x="${cx}" y="18" text-anchor="middle" font-family="${font}" font-size="10" fill="${accent}" opacity="0.7" font-weight="bold" letter-spacing="2">${safeCategory}</text>
    `)
    node_positions[col_i].forEach((node) => {
      svgPaths.push(`
        <circle cx="${node.x}" cy="${node.y}" r="22" fill="url(#nglow-${widget.instanceId})" opacity="0.5"/>
        <circle cx="${node.x}" cy="${node.y}" r="14" fill="${bg2}" stroke="${accent}" stroke-width="1.5" opacity="0.9"/>
        <circle cx="${node.x}" cy="${node.y}" r="5" fill="${accent}" filter="url(#glow-${widget.instanceId})"/>
        <text x="${node.x}" y="${node.y + 28}" text-anchor="middle" font-family="${font}" font-size="11" fill="${text_col}" opacity="0.9">${node.tech}</text>
      `)
    })
  })

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="nbg-${widget.instanceId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
        <radialGradient id="nglow-${widget.instanceId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="${accent}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow-${widget.instanceId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="800" height="260" fill="url(#nbg-${widget.instanceId})" rx="12"/>
      ${svgPaths.join('\n')}
    </svg>
  `
}
