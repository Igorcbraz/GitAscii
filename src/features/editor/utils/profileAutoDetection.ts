import { SOCIAL_PLATFORMS } from '@/constants'
import { TECH_CATALOG } from '@/data/techCatalog'
import type { NormalizedGitHubData } from '@/engine/types'

export const DEFAULT_SELECTED_SOCIALS = [
  'github',
  'linkedin',
  'twitter',
  'discord',
  'youtube',
  'website',
]

export const DEFAULT_SELECTED_TECHS = [
  'js',
  'ts',
  'react',
  'nextjs',
  'nodejs',
  'tailwind',
  'python',
  'docker',
  'git',
  'postgres',
]

const IGNORED_DOMAINS = [
  'github.com',
  'githubusercontent.com',
  'shields.io',
  'skillicons.dev',
  'badge.fury.io',
  'travis-ci.com',
  'travis-ci.org',
  'circleci.com',
  'codecov.io',
  'coveralls.io',
  'vercel.app',
  'netlify.app',
  'herokuapp.com',
  'wakatime.com',
  'demolab.com',
  'lecoq.io',
  'komarev.com',
  'giphy.com',
  'imgur.com',
  'gravatar.com',
  'jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'img.shields.io',
  'raw.githubusercontent.com',
  'github-readme-stats',
  'streak-stats',
  'profile-trophy',
  'quotes-github-readme',
  'github-profile-trophy',
  'github-readme-activity-graph',
  'readme-jokes',
  'spotify-github-profile',
]

export interface DetectedSocialResult {
  selectedSocials: string[]
  socialUrls: Record<string, string>
}

export function detectSocialsFromProfile(
  data: NormalizedGitHubData | null | undefined
): DetectedSocialResult {
  if (!data || !data.user) {
    return {
      selectedSocials: [...DEFAULT_SELECTED_SOCIALS],
      socialUrls: {},
    }
  }

  const username = data.user.login
  const foundSocials = new Set<string>()
  const socialUrls: Record<string, string> = {
    github: `https://github.com/${username}`,
  }

  foundSocials.add('github')

  // 1. Check official GitHub social accounts (from /users/{username}/social_accounts & GraphQL)
  if (Array.isArray(data.socialAccounts)) {
    for (const acc of data.socialAccounts) {
      if (acc && acc.url) {
        let accUrl = acc.url.trim()
        if (!/^https?:\/\//i.test(accUrl) && !accUrl.startsWith('mailto:')) {
          accUrl = `https://${accUrl}`
        }
        classifyAndStoreUrl(accUrl, foundSocials, socialUrls, username)
        if (acc.provider) {
          const provLower = acc.provider.toLowerCase()
          if (provLower === 'linkedin') foundSocials.add('linkedin')
          else if (provLower === 'twitter' || provLower === 'x') foundSocials.add('twitter')
          else if (provLower === 'youtube') foundSocials.add('youtube')
          else if (provLower === 'instagram') foundSocials.add('instagram')
          else if (provLower === 'twitch') foundSocials.add('twitch')
          else if (provLower === 'mastodon') foundSocials.add('mastodon')
          else if (provLower === 'bluesky') foundSocials.add('bluesky')
          else if (provLower === 'reddit') foundSocials.add('reddit')
        }
      }
    }
  }

  // 2. Check direct GitHub profile fields
  if (data.user.twitter_username) {
    const handle = data.user.twitter_username.replace(/^@/, '').trim()
    if (handle) {
      foundSocials.add('twitter')
      socialUrls.twitter = `https://x.com/${handle}`
    }
  }

  if (data.user.email) {
    const email = data.user.email.trim()
    if (email) {
      foundSocials.add('email')
      socialUrls.email = `mailto:${email}`
    }
  }

  if (data.user.blog) {
    let blog = data.user.blog.trim()
    if (blog) {
      if (!/^https?:\/\//i.test(blog) && !blog.startsWith('mailto:')) {
        blog = `https://${blog}`
      }
      classifyAndStoreUrl(blog, foundSocials, socialUrls, username)
    }
  }

  // 3. Scan bio and readme content
  const textsToScan: string[] = []
  if (data.user.bio) textsToScan.push(data.user.bio)
  if (data.readmeContent) textsToScan.push(data.readmeContent)

  const combinedContent = textsToScan.join('\n\n')

  if (combinedContent) {
    // Regex for standard URLs & mailto links inside markdown [text](url), <a href="url">, or plain text
    const urlPattern =
      /(?:href=["']|src=["']|\]\(|\b)(https?:\/\/[^\s"'<>)\]]+|mailto:[^\s"'<>)\]]+|[a-zA-Z0-9_-]+\.dev|[a-zA-Z0-9_-]+\.me|[a-zA-Z0-9_-]+\.io)(?:["'\)]|\b|\s|$)/gi

    let match: RegExpExecArray | null
    while ((match = urlPattern.exec(combinedContent)) !== null) {
      let matchedUrl = match[1]
      if (matchedUrl) {
        matchedUrl = matchedUrl.replace(/[.,;!?:)>\]'"]+$/, '')
        if (!/^https?:\/\//i.test(matchedUrl) && !matchedUrl.startsWith('mailto:')) {
          matchedUrl = `https://${matchedUrl}`
        }
        classifyAndStoreUrl(matchedUrl, foundSocials, socialUrls, username)
      }
    }

    scanShieldsBadgesForSocials(combinedContent, foundSocials, socialUrls, username)
  }

  const nonGithubSocials = Array.from(foundSocials).filter((s) => s !== 'github')
  if (nonGithubSocials.length === 0) {
    return {
      selectedSocials: [...DEFAULT_SELECTED_SOCIALS],
      socialUrls,
    }
  }

  const orderedSocials = SOCIAL_PLATFORMS.filter((p) => foundSocials.has(p.id)).map((p) => p.id)

  return {
    selectedSocials: orderedSocials,
    socialUrls,
  }
}

function classifyAndStoreUrl(
  url: string,
  foundSocials: Set<string>,
  socialUrls: Record<string, string>,
  _currentUsername: string
) {
  try {
    const cleanUrl = url.trim()
    const lower = cleanUrl.toLowerCase()

    if (lower.startsWith('mailto:')) {
      const email = cleanUrl.replace(/^mailto:/i, '').trim()
      if (email && email.includes('@')) {
        foundSocials.add('email')
        socialUrls.email = `mailto:${email}`
      }
      return
    }

    // LinkedIn
    if (lower.includes('linkedin.com')) {
      foundSocials.add('linkedin')
      if (!socialUrls.linkedin) socialUrls.linkedin = cleanUrl
      return
    }

    if (lower.includes('twitter.com/') || lower.includes('x.com/')) {
      if (!lower.includes('/intent/') && !lower.includes('/share')) {
        foundSocials.add('twitter')
        if (!socialUrls.twitter) socialUrls.twitter = cleanUrl
      }
      return
    }

    if (
      lower.includes('discord.gg/') ||
      lower.includes('discord.com/invite/') ||
      lower.includes('discord.com/users/')
    ) {
      foundSocials.add('discord')
      if (!socialUrls.discord) socialUrls.discord = cleanUrl
      return
    }

    if (
      lower.includes('youtube.com/@') ||
      lower.includes('youtube.com/c/') ||
      lower.includes('youtube.com/channel/') ||
      lower.includes('youtube.com/user/')
    ) {
      foundSocials.add('youtube')
      if (!socialUrls.youtube) socialUrls.youtube = cleanUrl
      return
    }

    if (lower.includes('instagram.com/')) {
      if (!lower.includes('/p/') && !lower.includes('/reel/')) {
        foundSocials.add('instagram')
        if (!socialUrls.instagram) socialUrls.instagram = cleanUrl
      }
      return
    }

    if (lower.includes('twitch.tv/')) {
      foundSocials.add('twitch')
      if (!socialUrls.twitch) socialUrls.twitch = cleanUrl
      return
    }

    if (lower.includes('dev.to/')) {
      foundSocials.add('devto')
      if (!socialUrls.devto) socialUrls.devto = cleanUrl
      return
    }

    if (lower.includes('medium.com/@') || /https?:\/\/[a-zA-Z0-9_-]+\.medium\.com/i.test(lower)) {
      foundSocials.add('medium')
      if (!socialUrls.medium) socialUrls.medium = cleanUrl
      return
    }

    if (lower.includes('stackoverflow.com/users/')) {
      foundSocials.add('stackoverflow')
      if (!socialUrls.stackoverflow) socialUrls.stackoverflow = cleanUrl
      return
    }

    if (lower.includes('bsky.app/profile/')) {
      foundSocials.add('bluesky')
      if (!socialUrls.bluesky) socialUrls.bluesky = cleanUrl
      return
    }

    if (
      lower.includes('mastodon.social/@') ||
      lower.includes('fosstodon.org/@') ||
      lower.includes('mstdn.social/@') ||
      /https?:\/\/[a-zA-Z0-9.-]+\/@[a-zA-Z0-9_]+/i.test(lower)
    ) {
      foundSocials.add('mastodon')
      if (!socialUrls.mastodon) socialUrls.mastodon = cleanUrl
      return
    }

    if (lower.includes('reddit.com/user/')) {
      foundSocials.add('reddit')
      if (!socialUrls.reddit) socialUrls.reddit = cleanUrl
      return
    }

    if (lower.includes('spotify.com/user/') || lower.includes('spotify.com/artist/')) {
      foundSocials.add('spotify')
      if (!socialUrls.spotify) socialUrls.spotify = cleanUrl
      return
    }

    if (lower.includes('t.me/') || lower.includes('telegram.me/')) {
      foundSocials.add('telegram')
      if (!socialUrls.telegram) socialUrls.telegram = cleanUrl
      return
    }

    if (lower.includes('tiktok.com/@')) {
      foundSocials.add('tiktok')
      if (!socialUrls.tiktok) socialUrls.tiktok = cleanUrl
      return
    }

    if (
      lower.includes('steamcommunity.com/id/') ||
      lower.includes('steamcommunity.com/profiles/')
    ) {
      foundSocials.add('steam')
      if (!socialUrls.steam) socialUrls.steam = cleanUrl
      return
    }

    if (
      lower.includes('hashnode.com/@') ||
      /https?:\/\/[a-zA-Z0-9_-]+\.hashnode\.dev/i.test(lower)
    ) {
      foundSocials.add('hashnode')
      if (!socialUrls.hashnode) socialUrls.hashnode = cleanUrl
      return
    }

    if (!foundSocials.has('website') && /^https?:\/\/[a-zA-Z0-9.-]+/i.test(cleanUrl)) {
      const isIgnored = IGNORED_DOMAINS.some((domain) => lower.includes(domain))
      if (!isIgnored) {
        foundSocials.add('website')
        socialUrls.website = cleanUrl
      }
    }
  } catch {}
}

function scanShieldsBadgesForSocials(
  content: string,
  foundSocials: Set<string>,
  socialUrls: Record<string, string>,
  username: string
) {
  const badgeRegex = /img\.shields\.io\/badge\/([a-zA-Z0-9_%+-]+)/gi
  let match: RegExpExecArray | null
  while ((match = badgeRegex.exec(content)) !== null) {
    const rawLabel = decodeURIComponent(match[1]).toLowerCase()
    for (const p of SOCIAL_PLATFORMS) {
      if (p.id === 'github' || p.id === 'website') continue
      if (rawLabel.includes(p.id) || rawLabel.includes(p.label.toLowerCase())) {
        foundSocials.add(p.id)
        if (!socialUrls[p.id]) {
          socialUrls[p.id] = p.defaultUrl.replace('{username}', username)
        }
      }
    }
  }
}

const GITHUB_LANGUAGE_TO_TECH: Record<string, string> = {
  TypeScript: 'ts',
  JavaScript: 'js',
  Python: 'py',
  HTML: 'html',
  CSS: 'css',
  SCSS: 'sass',
  Sass: 'sass',
  Rust: 'rust',
  Go: 'go',
  'C++': 'cpp',
  'C#': 'cs',
  C: 'c',
  Java: 'java',
  PHP: 'php',
  Ruby: 'ruby',
  Kotlin: 'kotlin',
  Swift: 'swift',
  Dart: 'dart',
  Shell: 'bash',
  Bash: 'bash',
  GraphQL: 'graphql',
  R: 'r',
  Elixir: 'elixir',
  Solidity: 'solidity',
  Haskell: 'haskell',
  Lua: 'lua',
  Scala: 'scala',
  Clojure: 'clojure',
  Julia: 'julia',
  Zig: 'zig',
  Perl: 'perl',
  OCaml: 'ocaml',
  Erlang: 'erlang',
  Nim: 'nim',
  MATLAB: 'matlab',
  Vue: 'vue',
  Svelte: 'svelte',
  Astro: 'astro',
  Dockerfile: 'docker',
}

const TECH_SYNONYMS: Record<string, string> = {
  js: 'js',
  javascript: 'js',
  ts: 'ts',
  typescript: 'ts',
  py: 'py',
  python: 'py',
  html: 'html',
  html5: 'html',
  css: 'css',
  css3: 'css',
  rust: 'rust',
  go: 'go',
  golang: 'go',
  cpp: 'cpp',
  'c++': 'cpp',
  cs: 'cs',
  'c#': 'cs',
  csharp: 'cs',
  c: 'c',
  java: 'java',
  php: 'php',
  ruby: 'ruby',
  kotlin: 'kotlin',
  swift: 'swift',
  dart: 'dart',
  bash: 'bash',
  shell: 'bash',
  graphql: 'graphql',
  r: 'r',
  elixir: 'elixir',
  solidity: 'solidity',
  haskell: 'haskell',
  lua: 'lua',
  scala: 'scala',
  clojure: 'clojure',
  julia: 'julia',
  zig: 'zig',
  perl: 'perl',
  ocaml: 'ocaml',
  erlang: 'erlang',
  nim: 'nim',
  matlab: 'matlab',

  react: 'react',
  reactjs: 'react',
  reactdotjs: 'react',
  nextjs: 'nextjs',
  next: 'nextjs',
  nextdotjs: 'nextjs',
  vue: 'vue',
  vuejs: 'vue',
  vuedotjs: 'vue',
  nuxt: 'nuxt',
  nuxtjs: 'nuxt',
  nuxtdotjs: 'nuxt',
  angular: 'angular',
  angulardotjs: 'angular',
  svelte: 'svelte',
  tailwind: 'tailwind',
  tailwindcss: 'tailwind',
  bootstrap: 'bootstrap',
  sass: 'sass',
  scss: 'sass',
  flutter: 'flutter',
  reactnative: 'reactnative',
  'react-native': 'reactnative',
  redux: 'redux',
  threejs: 'threejs',
  'three.js': 'threejs',
  threedotjs: 'threejs',
  vite: 'vite',
  astro: 'astro',
  solidjs: 'solidjs',
  solid: 'solidjs',
  remix: 'remix',
  recoil: 'recoil',
  zustand: 'zustand',
  electron: 'electron',
  jquery: 'jquery',
  styledcomponents: 'styledcomponents',
  mui: 'mui',
  chakra: 'chakra',
  pinia: 'pinia',
  vuetify: 'vuetify',
  alpinejs: 'alpinejs',
  webpack: 'webpack',
  babel: 'babel',
  gulp: 'gulp',
  rollup: 'rollup',

  nodejs: 'nodejs',
  node: 'nodejs',
  nodedotjs: 'nodejs',
  express: 'express',
  expressjs: 'express',
  nest: 'nest',
  nestjs: 'nest',
  django: 'django',
  fastapi: 'fastapi',
  flask: 'flask',
  spring: 'spring',
  springboot: 'spring',
  laravel: 'laravel',
  postgres: 'postgres',
  postgresql: 'postgres',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  mysql: 'mysql',
  redis: 'redis',
  supabase: 'supabase',
  firebase: 'firebase',
  prisma: 'prisma',
  bun: 'bun',
  deno: 'deno',
  sqlite: 'sqlite',
  rails: 'rails',
  trpc: 'trpc',
  mariadb: 'mariadb',
  dynamodb: 'dynamodb',
  cassandra: 'cassandra',
  couchdb: 'couchdb',
  neo4j: 'neo4j',
  hibernate: 'hibernate',
  symfony: 'symfony',
  koa: 'koa',

  git: 'git',
  github: 'github',
  gitlab: 'gitlab',
  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  aws: 'aws',
  amazonwebservices: 'aws',
  gcp: 'gcp',
  googlecloud: 'gcp',
  azure: 'azure',
  microsoftazure: 'azure',
  vercel: 'vercel',
  netlify: 'netlify',
  linux: 'linux',
  ubuntu: 'linux',
  debian: 'linux',
  archlinux: 'linux',
  figma: 'figma',
  postman: 'postman',
  vscode: 'vscode',
  visualstudiocode: 'vscode',
  terraform: 'terraform',
  githubactions: 'githubactions',
  jest: 'jest',
  vitest: 'vitest',
  playwright: 'playwright',
  cypress: 'cypress',
  storybook: 'storybook',
  cloudflare: 'cloudflare',
  jenkins: 'jenkins',
  ansible: 'ansible',
  nginx: 'nginx',
  apache: 'apache',
  yarn: 'yarn',
  pnpm: 'pnpm',
  npm: 'npm',
  sentry: 'sentry',
  insomnia: 'insomnia',
  grafana: 'grafana',
  prometheus: 'prometheus',
  selenium: 'selenium',
  sonarqube: 'sonarqube',
  bitbucket: 'bitbucket',
  heroku: 'heroku',
  circleci: 'circleci',
  travis: 'travis',
  blender: 'blender',
  notion: 'notion',
}

export function detectTechStackFromProfile(
  data: NormalizedGitHubData | null | undefined
): string[] {
  if (!data) {
    return [...DEFAULT_SELECTED_TECHS]
  }

  const validCatalogIds = new Set(TECH_CATALOG.map((t) => t.id))
  const detected = new Set<string>()

  // 1. Language frequency from repositories
  if (data.languages && Object.keys(data.languages).length > 0) {
    const sortedLangs = Object.entries(data.languages)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => GITHUB_LANGUAGE_TO_TECH[lang] || TECH_SYNONYMS[lang.toLowerCase().trim()])
      .filter((id): id is string => Boolean(id && validCatalogIds.has(id)))

    sortedLangs.forEach((id) => detected.add(id))
  }

  // 2. Scan profile README.md
  if (data.readmeContent) {
    const readme = data.readmeContent

    // A. Parse skillicons URLs: skillicons.dev/icons?i=...
    const skillIconsRegex = /skillicons\.dev\/icons\?[^"'\s)]*i=([a-zA-Z0-9,_-]+)/gi
    let skillMatch: RegExpExecArray | null
    while ((skillMatch = skillIconsRegex.exec(readme)) !== null) {
      const iconList = skillMatch[1].split(',')
      for (const icon of iconList) {
        const norm = TECH_SYNONYMS[icon.toLowerCase().trim()]
        if (norm && validCatalogIds.has(norm)) {
          detected.add(norm)
        }
      }
    }

    // B. Parse shields.io logo query parameters: logo=...
    const logoRegex = /[?&]logo=([a-zA-Z0-9%._+-]+)/gi
    let logoMatch: RegExpExecArray | null
    while ((logoMatch = logoRegex.exec(readme)) !== null) {
      const rawLogo = decodeURIComponent(logoMatch[1])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
      const norm = TECH_SYNONYMS[rawLogo]
      if (norm && validCatalogIds.has(norm)) {
        detected.add(norm)
      }
    }

    // C. Parse devicon / badge URLs
    const deviconRegex = /devicon\/icons\/([a-zA-Z0-9_-]+)/gi
    let deviconMatch: RegExpExecArray | null
    while ((deviconMatch = deviconRegex.exec(readme)) !== null) {
      const raw = deviconMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '')
      const norm = TECH_SYNONYMS[raw]
      if (norm && validCatalogIds.has(norm)) {
        detected.add(norm)
      }
    }

    // D. Scan for prominent keywords throughout the README
    scanTextForKeywords(readme, detected, validCatalogIds)
  }

  // 3. Scan repo names, descriptions, topics, and individual repo languages
  if (Array.isArray(data.repos)) {
    for (const repo of data.repos) {
      if (repo.language) {
        const langId =
          GITHUB_LANGUAGE_TO_TECH[repo.language] ||
          TECH_SYNONYMS[repo.language.toLowerCase().trim()]
        if (langId && validCatalogIds.has(langId)) {
          detected.add(langId)
        }
      }
      if (Array.isArray(repo.languages)) {
        for (const l of repo.languages) {
          const langId = GITHUB_LANGUAGE_TO_TECH[l] || TECH_SYNONYMS[l.toLowerCase().trim()]
          if (langId && validCatalogIds.has(langId)) {
            detected.add(langId)
          }
        }
      }
      if (Array.isArray(repo.topics)) {
        for (const topic of repo.topics) {
          const normTopic = TECH_SYNONYMS[topic.toLowerCase().replace(/[^a-z0-9]/g, '')]
          if (normTopic && validCatalogIds.has(normTopic)) {
            detected.add(normTopic)
          }
        }
      }
      const repoText = `${repo.name} ${repo.description || ''}`
      scanTextForKeywords(repoText, detected, validCatalogIds)
    }
  }

  if (detected.size === 0) {
    return [...DEFAULT_SELECTED_TECHS]
  }

  return Array.from(detected)
}

function scanTextForKeywords(text: string, detected: Set<string>, validCatalogIds: Set<string>) {
  const keywordMap: Array<{ pattern: RegExp; techId: string }> = [
    // Languages
    { pattern: /\b(?:TypeScript|TS)\b/i, techId: 'ts' },
    { pattern: /\b(?:JavaScript|JS|ES6)\b/i, techId: 'js' },
    { pattern: /\bPython\b/i, techId: 'py' },
    { pattern: /\bHTML5?\b/i, techId: 'html' },
    { pattern: /\bCSS3?\b/i, techId: 'css' },
    { pattern: /\b(?:Sass|SCSS)\b/i, techId: 'sass' },
    { pattern: /\bRust\b/i, techId: 'rust' },
    { pattern: /\b(?:Golang|Go language)\b/i, techId: 'go' },
    { pattern: /\bC\+\+\b/i, techId: 'cpp' },
    { pattern: /\bC#\b/i, techId: 'cs' },
    { pattern: /\bJava\b/i, techId: 'java' },
    { pattern: /\bPHP\b/i, techId: 'php' },
    { pattern: /\bRuby\b/i, techId: 'ruby' },
    { pattern: /\bKotlin\b/i, techId: 'kotlin' },
    { pattern: /\bSwift\b/i, techId: 'swift' },
    { pattern: /\bDart\b/i, techId: 'dart' },
    { pattern: /\b(?:Bash|Shell script)\b/i, techId: 'bash' },
    { pattern: /\bGraphQL\b/i, techId: 'graphql' },
    { pattern: /\bElixir\b/i, techId: 'elixir' },
    { pattern: /\bSolidity\b/i, techId: 'solidity' },
    { pattern: /\bHaskell\b/i, techId: 'haskell' },
    { pattern: /\bLua\b/i, techId: 'lua' },
    { pattern: /\bScala\b/i, techId: 'scala' },
    { pattern: /\bClojure\b/i, techId: 'clojure' },
    { pattern: /\bJulia\b/i, techId: 'julia' },
    { pattern: /\bZig\b/i, techId: 'zig' },
    { pattern: /\bPerl\b/i, techId: 'perl' },
    { pattern: /\bOCaml\b/i, techId: 'ocaml' },
    { pattern: /\bErlang\b/i, techId: 'erlang' },
    { pattern: /\bNim\b/i, techId: 'nim' },
    { pattern: /\bMATLAB\b/i, techId: 'matlab' },

    // Frontend
    { pattern: /\b(?:Next\.?js|Nextjs)\b/i, techId: 'nextjs' },
    { pattern: /\b(?:React\.?js|React)\b/i, techId: 'react' },
    { pattern: /\b(?:Vue\.?js|Vuejs|Vue 3|Vue 2)\b/i, techId: 'vue' },
    { pattern: /\b(?:Nuxt\.?js|Nuxtjs|Nuxt)\b/i, techId: 'nuxt' },
    { pattern: /\b(?:Angular|Angularjs)\b/i, techId: 'angular' },
    { pattern: /\b(?:Svelte|SvelteKit)\b/i, techId: 'svelte' },
    { pattern: /\b(?:Tailwind|TailwindCSS)\b/i, techId: 'tailwind' },
    { pattern: /\bBootstrap\b/i, techId: 'bootstrap' },
    { pattern: /\bFlutter\b/i, techId: 'flutter' },
    { pattern: /\b(?:React Native|ReactNative)\b/i, techId: 'reactnative' },
    { pattern: /\b(?:Three\.?js|Threejs)\b/i, techId: 'threejs' },
    { pattern: /\bVite\b/i, techId: 'vite' },
    { pattern: /\bAstro\b/i, techId: 'astro' },
    { pattern: /\bSolidJS\b/i, techId: 'solidjs' },
    { pattern: /\bRemix\b/i, techId: 'remix' },
    { pattern: /\bZustand\b/i, techId: 'zustand' },
    { pattern: /\bRedux\b/i, techId: 'redux' },
    { pattern: /\bElectron\b/i, techId: 'electron' },
    { pattern: /\bjQuery\b/i, techId: 'jquery' },
    { pattern: /\bStyled[- ]Components\b/i, techId: 'styledcomponents' },
    { pattern: /\b(?:Material[- ]UI|MUI)\b/i, techId: 'mui' },
    { pattern: /\bChakra[- ]UI\b/i, techId: 'chakra' },
    { pattern: /\bPinia\b/i, techId: 'pinia' },
    { pattern: /\bVuetify\b/i, techId: 'vuetify' },
    { pattern: /\bAlpine\.?js\b/i, techId: 'alpinejs' },
    { pattern: /\bWebpack\b/i, techId: 'webpack' },
    { pattern: /\bBabel\b/i, techId: 'babel' },
    { pattern: /\bGulp\b/i, techId: 'gulp' },
    { pattern: /\bRollup\b/i, techId: 'rollup' },

    // Backend & DB
    { pattern: /\b(?:Node\.?js|Nodejs)\b/i, techId: 'nodejs' },
    { pattern: /\bExpress\.?js\b|\bExpress\b/i, techId: 'express' },
    { pattern: /\bNest\.?js\b|\bNestJS\b/i, techId: 'nest' },
    { pattern: /\bDjango\b/i, techId: 'django' },
    { pattern: /\bFastAPI\b/i, techId: 'fastapi' },
    { pattern: /\bFlask\b/i, techId: 'flask' },
    { pattern: /\b(?:Spring Boot|SpringBoot|Spring Framework)\b/i, techId: 'spring' },
    { pattern: /\bLaravel\b/i, techId: 'laravel' },
    { pattern: /\bPostgreSQL\b|\bPostgres\b/i, techId: 'postgres' },
    { pattern: /\bMongoDB\b|\bMongo\b/i, techId: 'mongodb' },
    { pattern: /\bMySQL\b/i, techId: 'mysql' },
    { pattern: /\bRedis\b/i, techId: 'redis' },
    { pattern: /\bSupabase\b/i, techId: 'supabase' },
    { pattern: /\bFirebase\b/i, techId: 'firebase' },
    { pattern: /\bPrisma\b/i, techId: 'prisma' },
    { pattern: /\bBun\b/i, techId: 'bun' },
    { pattern: /\bDeno\b/i, techId: 'deno' },
    { pattern: /\bSQLite\b/i, techId: 'sqlite' },
    { pattern: /\b(?:Ruby on Rails|Rails)\b/i, techId: 'rails' },
    { pattern: /\btRPC\b/i, techId: 'trpc' },
    { pattern: /\bMariaDB\b/i, techId: 'mariadb' },
    { pattern: /\bDynamoDB\b/i, techId: 'dynamodb' },
    { pattern: /\bCassandra\b/i, techId: 'cassandra' },
    { pattern: /\bCouchDB\b/i, techId: 'couchdb' },
    { pattern: /\bNeo4j\b/i, techId: 'neo4j' },
    { pattern: /\bHibernate\b/i, techId: 'hibernate' },
    { pattern: /\bSymfony\b/i, techId: 'symfony' },
    { pattern: /\bKoa\b/i, techId: 'koa' },

    // DevOps & Tools
    { pattern: /\bDocker\b/i, techId: 'docker' },
    { pattern: /\bKubernetes\b|\bK8s\b/i, techId: 'kubernetes' },
    { pattern: /\b(?:AWS|Amazon Web Services)\b/i, techId: 'aws' },
    { pattern: /\b(?:GCP|Google Cloud Platform|Google Cloud)\b/i, techId: 'gcp' },
    { pattern: /\b(?:Microsoft Azure|Azure)\b/i, techId: 'azure' },
    { pattern: /\bVercel\b/i, techId: 'vercel' },
    { pattern: /\bNetlify\b/i, techId: 'netlify' },
    { pattern: /\bLinux\b|\bUbuntu\b/i, techId: 'linux' },
    { pattern: /\bFigma\b/i, techId: 'figma' },
    { pattern: /\bPostman\b/i, techId: 'postman' },
    { pattern: /\b(?:VS Code|VSCode|Visual Studio Code)\b/i, techId: 'vscode' },
    { pattern: /\bTerraform\b/i, techId: 'terraform' },
    { pattern: /\bGitHub Actions\b/i, techId: 'githubactions' },
    { pattern: /\bJest\b/i, techId: 'jest' },
    { pattern: /\bVitest\b/i, techId: 'vitest' },
    { pattern: /\bPlaywright\b/i, techId: 'playwright' },
    { pattern: /\bCypress\b/i, techId: 'cypress' },
    { pattern: /\bStorybook\b/i, techId: 'storybook' },
    { pattern: /\bCloudflare\b/i, techId: 'cloudflare' },
    { pattern: /\bJenkins\b/i, techId: 'jenkins' },
    { pattern: /\bAnsible\b/i, techId: 'ansible' },
    { pattern: /\bNginx\b/i, techId: 'nginx' },
    { pattern: /\bApache\b/i, techId: 'apache' },
    { pattern: /\bYarn\b/i, techId: 'yarn' },
    { pattern: /\bpnpm\b/i, techId: 'pnpm' },
    { pattern: /\bnpm\b/i, techId: 'npm' },
    { pattern: /\bSentry\b/i, techId: 'sentry' },
    { pattern: /\bInsomnia\b/i, techId: 'insomnia' },
    { pattern: /\bGrafana\b/i, techId: 'grafana' },
    { pattern: /\bPrometheus\b/i, techId: 'prometheus' },
    { pattern: /\bSelenium\b/i, techId: 'selenium' },
    { pattern: /\bSonarQube\b/i, techId: 'sonarqube' },
    { pattern: /\bBitbucket\b/i, techId: 'bitbucket' },
    { pattern: /\bHeroku\b/i, techId: 'heroku' },
    { pattern: /\bCircleCI\b/i, techId: 'circleci' },
    { pattern: /\bTravis CI\b/i, techId: 'travis' },
    { pattern: /\bBlender\b/i, techId: 'blender' },
    { pattern: /\bNotion\b/i, techId: 'notion' },
  ]

  for (const { pattern, techId } of keywordMap) {
    if (pattern.test(text) && validCatalogIds.has(techId)) {
      detected.add(techId)
    }
  }
}
