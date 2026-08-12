import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function localEscapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderMarquee(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const selectedMarqueeLangs = Array.isArray(cfg.marqueeLangs)
    ? (cfg.marqueeLangs as string[])
    : ['react', 'ts', 'js', 'html', 'css', 'nodejs', 'python', 'git', 'docker', 'linux']

  const techNameMap: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    html: 'HTML5',
    css: 'CSS3',
    py: 'Python',
    rust: 'Rust',
    go: 'Go',
    cpp: 'C++',
    cs: 'C#',
    c: 'C',
    java: 'Java',
    php: 'PHP',
    ruby: 'Ruby',
    kotlin: 'Kotlin',
    swift: 'Swift',
    dart: 'Dart',
    bash: 'Bash',
    graphql: 'GraphQL',
    r: 'R',
    elixir: 'Elixir',
    solidity: 'Solidity',
    haskell: 'Haskell',
    react: 'React',
    nextjs: 'Next.js',
    vue: 'Vue.js',
    nuxt: 'Nuxt',
    angular: 'Angular',
    svelte: 'Svelte',
    tailwind: 'Tailwind',
    bootstrap: 'Bootstrap',
    sass: 'Sass',
    flutter: 'Flutter',
    reactnative: 'React Native',
    redux: 'Redux',
    threejs: 'Three.js',
    vite: 'Vite',
    astro: 'Astro',
    solidjs: 'SolidJS',
    remix: 'Remix',
    recoil: 'Recoil',
    zustand: 'Zustand',
    nodejs: 'Node.js',
    express: 'Express',
    nest: 'NestJS',
    django: 'Django',
    fastapi: 'FastAPI',
    flask: 'Flask',
    spring: 'Spring',
    laravel: 'Laravel',
    postgres: 'PostgreSQL',
    mongodb: 'MongoDB',
    mysql: 'MySQL',
    redis: 'Redis',
    supabase: 'Supabase',
    firebase: 'Firebase',
    prisma: 'Prisma',
    bun: 'Bun',
    deno: 'Deno',
    sqlite: 'SQLite',
    git: 'Git',
    github: 'GitHub',
    gitlab: 'GitLab',
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    aws: 'AWS',
    gcp: 'GCP',
    azure: 'Azure',
    vercel: 'Vercel',
    netlify: 'Netlify',
    linux: 'Linux',
    figma: 'Figma',
    postman: 'Postman',
    vscode: 'VS Code',
    terraform: 'Terraform',
    githubactions: 'GitHub Actions',
    jest: 'Jest',
    vitest: 'Vitest',
  }

  const icons = selectedMarqueeLangs.map((id) => techNameMap[id] || id)
  const bg1 = '#0b0f14'
  const bg2 = '#151c25'
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#b6a891'
  const text_color = (cfg.textColor as string) || globalStyles.textColor || '#eceff4'
  const border = '#2b303a'
  const font_data = 'Consolas, monospace'

  const PILL_H = 28
  const PILL_PADDING_X = 14
  const PILL_GAP = 10
  const FONT_SIZE = 12
  const STRIP_Y = Math.floor((60 - PILL_H) / 2)

  const estimateTextWidth = (text: string) => text.length * Math.floor(FONT_SIZE * 0.62)
  const pillWidth = (label: string) => estimateTextWidth(label) + PILL_PADDING_X * 2

  const hexToRgba = (hex: string, alpha: number) => {
    let h = hex.replace('#', '')
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    }
    // Support non-hex strings safely
    if (!/^[0-9A-F]{6}$/i.test(h)) {
      return hex
    }
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  const pill_bg = hexToRgba(accent, 0.15)
  const pill_stroke = hexToRgba(accent, 0.45)

  const renderPillGroup = (pills: string[], xOffset: number) => {
    const parts: string[] = []
    let x = xOffset
    for (const label of pills) {
      const pw = pillWidth(label)
      const ph = PILL_H
      const py = STRIP_Y
      const text_x = x + Math.floor(pw / 2)
      const text_y = py + Math.floor(ph / 2) + Math.floor(FONT_SIZE / 2) - 1

      parts.push(
        `<rect x="${x}" y="${py}" width="${pw}" height="${ph}" rx="${Math.floor(ph / 2)}" fill="${pill_bg}" stroke="${pill_stroke}" stroke-width="1"/>`
      )
      parts.push(
        `<text x="${text_x}" y="${text_y}" font-family="${font_data}" font-size="${FONT_SIZE}" fill="${text_color}" text-anchor="middle" dominant-baseline="auto" font-weight="500">${localEscapeXml(label)}</text>`
      )
      x += pw + PILL_GAP
    }
    const total_width = x - xOffset - PILL_GAP
    return { svg: parts.join('\n'), width: total_width }
  }

  const single_width = Math.max(
    1,
    icons.reduce((sum, ic) => sum + pillWidth(ic) + PILL_GAP, 0)
  )
  const repeat = Math.max(2, Math.ceil(800 / single_width) + 1)

  const icons_repeated: string[] = []
  for (let r = 0; r < repeat; r++) {
    icons_repeated.push(...icons)
  }

  const group1 = renderPillGroup(icons_repeated, 0)
  const group2 = renderPillGroup([...icons, ...icons], single_width)

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 60" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="mqBg-${widget.instanceId}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
        <clipPath id="mqClip-${widget.instanceId}">
          <rect width="800" height="60" rx="10"/>
        </clipPath>
        <style>
          @keyframes mqScroll-${widget.instanceId} {
            0% { transform: translateX(0px); }
            100% { transform: translateX(-${single_width}px); }
          }
          .mq-track-${widget.instanceId} {
            animation: mqScroll-${widget.instanceId} 30s linear infinite;
            will-change: transform;
          }
        </style>
      </defs>
      <rect width="800" height="60" rx="10" fill="url(#mqBg-${widget.instanceId})"/>
      <rect width="800" height="60" rx="10" fill="none" stroke="${border}" stroke-width="1" opacity="0.5"/>
      <g clip-path="url(#mqClip-${widget.instanceId})">
        <g class="mq-track-${widget.instanceId}">
          ${group1.svg}
          ${group2.svg}
        </g>
      </g>
    </svg>
  `
}
