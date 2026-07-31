export interface TemplateItem {
  slug: string
  name: string
  vibe: string
  accent: string
  bg: string
  category: 'cli' | 'minimal' | 'themes' | 'pro'
  tags: string[]
  description: string
  featured?: boolean
  popular?: boolean
}

export const templateList: TemplateItem[] = [
  {
    slug: 'terminal',
    name: 'Terminal CLI',
    vibe: 'Classic Hacker & Command Line Interface',
    accent: '#c5ff4a',
    bg: '#000000',
    category: 'cli',
    tags: ['Classic', 'CLI', 'Hacker', 'Popular'],
    description:
      'Emulate a real Linux terminal with prompt indicators, command outputs, and neon lime highlights.',
    popular: true,
  },
  {
    slug: 'minimal',
    name: 'Minimal Light',
    vibe: 'Clean, Sans-Serif, High Contrast',
    accent: '#000000',
    bg: '#ffffff',
    category: 'minimal',
    tags: ['Clean', 'Light', 'Minimal', 'Modern'],
    description:
      'Ultra-clean aesthetic focusing strictly on content, typography, and crisp spacing.',
  },
  {
    slug: 'github-dark',
    name: 'GitHub Native Dark',
    vibe: 'Blends seamlessly into GitHub dark theme',
    accent: '#58a6ff',
    bg: '#0d1117',
    category: 'minimal',
    tags: ['Native', 'Dark', 'Seamless'],
    description:
      'Uses official GitHub dark colors for invisible canvas bounds and seamless profile integration.',
    featured: true,
  },
  {
    slug: 'dracula',
    name: 'Dracula Theme',
    vibe: 'Vibrant purple, pink, and cyan tones',
    accent: '#bd93f9',
    bg: '#282a36',
    category: 'themes',
    tags: ['Theme', 'Vibrant', 'Popular'],
    description:
      'Inspired by the iconic Dracula color palette loved by millions of software engineers.',
    popular: true,
  },
  {
    slug: 'nord',
    name: 'Nord Arctic',
    vibe: 'Cool ice blues, slate gray, elegant elegance',
    accent: '#88c0d0',
    bg: '#2e3440',
    category: 'themes',
    tags: ['Cold', 'Elegant', 'Nordic'],
    description:
      'An arctic, north-bluish color palette focused on readability and calm developer workflows.',
  },
  {
    slug: 'tokyo-night',
    name: 'Tokyo Night',
    vibe: 'Neon indigo, deep navy, vibrant blue',
    accent: '#7aa2f7',
    bg: '#1a1b26',
    category: 'themes',
    tags: ['Neon', 'Modern', 'Sublime'],
    description:
      'A sleek theme celebrating the lights of downtown Tokyo at night with rich contrast.',
    featured: true,
  },
  {
    slug: 'gruvbox',
    name: 'Gruvbox Retro',
    vibe: 'Warm amber, golden yellow, dark sepia',
    accent: '#fabd2f',
    bg: '#282828',
    category: 'themes',
    tags: ['Warm', 'Retro', 'Vim'],
    description:
      'Designed with warm retro colors for maximum eye comfort during long coding sessions.',
  },
  {
    slug: 'cyberpunk',
    name: 'Cyberpunk 2077',
    vibe: 'Sci-fi magenta, glowing neon cyan',
    accent: '#ff00ff',
    bg: '#0a0a0f',
    category: 'themes',
    tags: ['Sci-Fi', 'Glow', 'Futuristic'],
    description:
      'Futuristic theme with glowing neon borders and high-energy contrast for standout profiles.',
  },
  {
    slug: 'matrix',
    name: 'Matrix Digital Rain',
    vibe: 'Phosphor green on pitch black',
    accent: '#00ff00',
    bg: '#000000',
    category: 'cli',
    tags: ['Hacker', 'Green', 'Classic'],
    description:
      'Monochrome phosphor green theme recreating early CRT terminal displays and matrix digital streams.',
  },
  {
    slug: 'japanese',
    name: 'Japanese Zen',
    vibe: 'Crimson red, charcoal, minimal kanji style',
    accent: '#e74c3c',
    bg: '#1a1a1a',
    category: 'minimal',
    tags: ['Minimal', 'Zen', 'Japanese'],
    description:
      'Balanced, minimalist aesthetic inspired by Japanese typography and traditional crimson accents.',
  },
  {
    slug: 'bento',
    name: 'Bento Grid',
    vibe: 'Modular grid layout with sharp borders',
    accent: '#ffffff',
    bg: '#0f0f0f',
    category: 'minimal',
    tags: ['Grid', 'Modern', 'Bento'],
    description:
      'Organizes your stats, bio, and tech stack into clean rectangular bento-box compartments.',
  },
  {
    slug: 'portfolio',
    name: 'Pro Portfolio',
    vibe: 'Executive dark mode with lime signal highlights',
    accent: '#c5ff4a',
    bg: '#0a0a0a',
    category: 'pro',
    tags: ['Pro', 'Lime', 'Portfolio'],
    description: 'Tailored for senior software engineers, open-source maintainers, and tech leads.',
    featured: true,
  },
  {
    slug: 'open-source',
    name: 'Open Source Community',
    vibe: 'GitHub commit green with active badges',
    accent: '#3fb950',
    bg: '#0d1117',
    category: 'pro',
    tags: ['Community', 'Green', 'OSS'],
    description:
      'Emphasizes contribution streaks, merged PRs, open-source repositories, and star counts.',
  },
]

export const languageStacks = [
  { slug: 'react', name: 'React.js', color: '#61dafb' },
  { slug: 'nextjs', name: 'Next.js', color: '#ffffff' },
  { slug: 'python', name: 'Python & AI', color: '#3776ab' },
  { slug: 'node', name: 'Node.js', color: '#339933' },
  { slug: 'go', name: 'Go (Golang)', color: '#00add8' },
  { slug: 'rust', name: 'Rust Systems', color: '#dea584' },
]
