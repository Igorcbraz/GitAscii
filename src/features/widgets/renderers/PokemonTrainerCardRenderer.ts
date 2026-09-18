import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderPokemonTrainerCard(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  _globalStyles?: GlobalStyles,
  _theme?: any
): string {
  const width = widget.size.width || 380
  const height = widget.size.height || 240

  const rawId = widget.instanceId || 'pokemon-trainer'
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '_')

  const login = data.user.login || 'trainer'
  const idNum = login.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffffff, 0)
  const idStr = String(idNum).padStart(6, '0').slice(0, 6)

  const stars = data.totalStars || 0
  const repos = data.repos ? data.repos.length : 0
  const money = stars * 100

  const avatarUrl = data.user.avatar_url || ''

  const badges = [
    stars > 10 ? '#ff5252' : '#111',
    stars > 50 ? '#448aff' : '#111',
    stars > 100 ? '#ffb300' : '#111',
    stars > 500 ? '#69f0ae' : '#111',
    stars > 1000 ? '#e040fb' : '#111',
    stars > 2000 ? '#1de9b6' : '#111',
    stars > 5000 ? '#ff4081' : '#111',
    stars > 10000 ? '#ffee58' : '#111',
  ]

  const langs = Object.keys(data.languages || {})
  const topLang = (langs[0] || 'JavaScript').toLowerCase()
  const typeColors: Record<string, [string, string]> = {
    python: ['#ffd700', '#ff8f00'],
    javascript: ['#1565c0', '#0d47a1'],
    typescript: ['#00838f', '#006064'],
    rust: ['#e64a19', '#bf360c'],
    go: ['#1b5e20', '#0a3e00'],
    java: ['#b71c1c', '#7f0000'],
    kotlin: ['#4a148c', '#290a59'],
    swift: ['#e65100', '#bf360c'],
  }
  const [cardTop, cardBot] = typeColors[topLang] || ['#1a237e', '#283593']

  const seen = data.user.followers || 0
  const caught = data.user.following || 0
  const pokedexProgress =
    caught > 0 ? Math.min(100, Math.floor((caught / Math.max(seen, 1)) * 100)) : 0

  const css = `
    #${id} {
      font-family: monospace;
      color: #e3f2fd;
    }
    #${id} .bg {
      fill: url(#grad-${id});
      stroke: #ffd700;
      stroke-width: 3;
      rx: 4;
    }
    #${id} .inner-bg {
      fill: none;
      stroke: #4fc3f7;
      stroke-width: 1;
      rx: 2;
    }
    #${id} .title {
      font-weight: bold;
      font-size: 14px;
      fill: #ffffff;
      letter-spacing: 1px;
    }
    #${id} .label {
      fill: #bbdefb;
      font-size: 10px;
    }
    #${id} .value {
      fill: #ffffff;
      font-size: 12px;
      font-weight: bold;
    }
    #${id} .star {
      fill: #ffd700;
    }
    #${id} .avatar {
      filter: url(#pixelate-${id});
    }
    #${id} .avatar-bg {
      fill: rgba(0,0,0,0.3);
      stroke: #4fc3f7;
      stroke-width: 1;
    }
    #${id} .badge-case {
      fill: rgba(0,0,0,0.3);
      stroke: #4fc3f7;
      stroke-width: 1;
      rx: 2;
    }
    #${id} .pokedex-bg {
      fill: rgba(0,0,0,0.5);
      stroke: #4fc3f7;
      stroke-width: 1;
    }
    #${id} .pokedex-bar {
      fill: #ffd700;
    }
  `

  return `
    <svg id="${id}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <style>${css}</style>
        <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${cardTop}" />
          <stop offset="100%" stop-color="${cardBot}" />
        </linearGradient>
        <filter id="pixelate-${id}" x="0" y="0">
          <feColorMatrix type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 1 0
          "/>
        </filter>
      </defs>
      
      <!-- Backgrounds -->
      <rect class="bg" x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" />
      <rect class="inner-bg" x="6" y="6" width="${width - 12}" height="${height - 12}" />

      <!-- Header -->
      <text class="title" x="15" y="25">POKEMON TRAINER CARD</text>
      <!-- Star -->
      <polygon class="star" points="350,15 354,23 363,24 356,30 358,39 350,34 342,39 344,30 337,24 346,23" />

      <!-- Details -->
      <text class="label" x="15" y="55">NAME:</text>
      <text class="value" x="60" y="55">${escapeXml(login)}</text>
      
      <text class="label" x="15" y="75">ID NO:</text>
      <text class="value" x="60" y="75">${idStr}</text>
      
      <text class="label" x="15" y="95">MONEY:</text>
      <text class="value" x="60" y="95">${money}P</text>
      
      <text class="label" x="15" y="115">TIME:</text>
      <text class="value" x="60" y="115">${repos} hrs</text>

      <!-- Avatar section -->
      <rect class="avatar-bg" x="15" y="130" width="60" height="80" />
      <image class="avatar" x="15" y="130" width="60" height="80" crossorigin="anonymous" href="${escapeXml(avatarUrl)}" preserveAspectRatio="xMidYMid slice" />

      <!-- Badges -->
      <rect class="badge-case" x="90" y="130" width="275" height="40" />
      ${badges
        .map(
          (color, i) => `
        <circle cx="${110 + i * 33}" cy="150" r="12" fill="${color}" stroke="#fff" stroke-width="0.5" />
      `
        )
        .join('')}

      <!-- Extra Info -->
      <text class="label" x="90" y="195">RIVAL:</text>
      <text class="value" x="135" y="195">${escapeXml(topLang.toUpperCase())}</text>

      <!-- Pokedex Bar -->
      <text class="label" x="90" y="215">POKEDEX SEEN / CAUGHT:</text>
      <rect class="pokedex-bg" x="230" y="206" width="135" height="10" />
      <rect class="pokedex-bar" x="231" y="207" width="${(pokedexProgress / 100) * 133}" height="8" />
      <text class="value" x="235" y="200" font-size="10px">${seen} / ${caught}</text>
      
    </svg>
  `
}
