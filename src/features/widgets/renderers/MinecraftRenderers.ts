import { escapeXml } from '@/engine/core/xmlUtils'
import { NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_')
}

const MC_COLOR_MAP: Record<string, string> = {
  '0': '#000000',
  '1': '#0000aa',
  '2': '#00aa00',
  '3': '#00aaaa',
  '4': '#aa0000',
  '5': '#aa00aa',
  '6': '#ffaa00', // Gold
  '7': '#aaaaaa', // Gray
  '8': '#555555', // Dark Gray
  '9': '#5555ff', // Blue
  a: '#55ff55', // Bright Green
  b: '#55ffff', // Aqua
  c: '#ff5555', // Red
  d: '#ff55ff', // Light Purple
  e: '#ffff55', // Yellow
  f: '#ffffff', // White
}

function parseMinecraftFormatting(text: string, shadow = false): string {
  const parts = text.split(/(§[0-9a-fk-or])/gi)
  let currentColor = shadow ? '#222222' : '#aaaaaa'
  let isBold = false
  let result = ''

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue
    if (part.startsWith('§')) {
      const code = part.charAt(1).toLowerCase()
      if (code === 'l') {
        isBold = true
      } else if (code === 'r') {
        currentColor = shadow ? '#222222' : '#aaaaaa'
        isBold = false
      } else if (MC_COLOR_MAP[code]) {
        currentColor = shadow ? '#222222' : MC_COLOR_MAP[code]
      }
    } else {
      const weight = isBold ? 'font-weight="bold"' : ''
      result += `<tspan fill="${currentColor}" ${weight}>${escapeXml(part)}</tspan>`
    }
  }

  return result
}

function renderMcHeart(x: number, y: number, isFull = true): string {
  if (!isFull) {
    return `
      <!-- Empty Heart -->
      <g transform="translate(${x}, ${y})">
        <path d="M1,2 h2 v-1 h3 v1 h2 v2 h-1 v2 h-1 v2 h-1 v1 h-1 v-1 h-1 v-2 h-1 v-2 h-1 Z" fill="#000000" />
        <path d="M2,2 h1 v-1 h1 v1 h-1 v1 h-1 Z M5,2 h1 v-1 h1 v1 h-1 v1 h-1 Z" fill="#444444" />
      </g>
    `
  }
  return `
    <!-- Hardcore / Survival Heart -->
    <g transform="translate(${x}, ${y})">
      <path d="M0,2 h1 v-1 h3 v1 h1 v-1 h3 v1 h1 v3 h-1 v2 h-1 v2 h-1 v1 h-2 v-1 h-1 v-2 h-1 v-2 h-1 Z" fill="#000000" />
      <path d="M1,2 h2 v1 h-2 Z M5,2 h2 v1 h-2 Z M1,3 h7 v2 h-7 Z M2,5 h5 v2 h-5 Z M3,7 h3 v1 h-3 Z M4,8 h1 v1 h-1 Z" fill="#b01010" />
      <path d="M1,2 h1 v1 h-1 Z M2,1 h1 v1 h-1 Z M5,2 h1 v1 h-1 Z M6,1 h1 v1 h-1 Z" fill="#ff4040" />
      <rect x="2" y="2" width="1" height="1" fill="#ffffff" />
    </g>
  `
}

function renderMcArmor(x: number, y: number, isFull = true): string {
  if (!isFull) return ''
  return `
    <!-- Armor Shield Icon -->
    <g transform="translate(${x}, ${y})">
      <path d="M0,1 h9 v4 h-1 v2 h-1 v2 h-1 v1 h-2 v-1 h-1 v-2 h-1 v-2 h-1 Z M1,0 h7 v1 h-7 Z" fill="#000000" />
      <path d="M1,1 h7 v3 h-1 v2 h-1 v2 h-1 v1 h-1 v-1 h-1 v-2 h-1 v-2 h-1 Z" fill="#888899" />
      <path d="M2,1 h2 v5 h-1 v-3 h-1 Z" fill="#ffffff" opacity="0.8" />
      <path d="M5,2 h2 v3 h-1 v2 h-1 Z" fill="#444455" />
    </g>
  `
}

function renderMcDrumstick(x: number, y: number, isFull = true): string {
  if (!isFull) {
    return `
      <g transform="translate(${x}, ${y})">
        <path d="M2,0 h4 v2 h2 v4 h-2 v2 h-4 v-2 h-2 v-4 h2 Z" fill="#000000" opacity="0.6" />
      </g>
    `
  }
  return `
    <!-- Food / Hunger Drumstick -->
    <g transform="translate(${x}, ${y})">
      <path d="M2,0 h4 v1 h2 v4 h-1 v2 h-2 v1 h-4 v-1 h-1 v-4 h1 v-2 h1 Z" fill="#000000" />
      <path d="M3,1 h2 v1 h2 v3 h-1 v2 h-2 v-1 h-1 v-4 h-1 v-1 h1 Z" fill="#a05218" />
      <path d="M4,1 h1 v1 h2 v2 h-1 v-1 h-2 Z" fill="#d98236" />
      <rect x="0" y="6" width="3" height="3" fill="#000000" />
      <rect x="1" y="6" width="2" height="2" fill="#ffffff" />
    </g>
  `
}

function renderItemIcon(type: string, x = 0, y = 0): string {
  switch (type) {
    case 'sword':
    case 'netherite_sword':
      return `
        <g transform="translate(${x + 2}, ${y + 2})">
          <line x1="2" y1="16" x2="4" y2="14" stroke="#4a2c0f" stroke-width="2.5" />
          <line x1="3" y1="15" x2="7" y2="11" stroke="#332233" stroke-width="2" />
          <line x1="5" y1="13" x2="16" y2="2" stroke="#1c181f" stroke-width="3.5" />
          <line x1="5" y1="13" x2="16" y2="2" stroke="#4a424e" stroke-width="2" />
          <line x1="6" y1="12" x2="15" y2="3" stroke="#877d8c" stroke-width="0.8" />
        </g>
      `
    case 'diamond_sword':
      return `
        <g transform="translate(${x + 2}, ${y + 2})">
          <line x1="2" y1="16" x2="4" y2="14" stroke="#4a2c0f" stroke-width="2.5" />
          <line x1="3" y1="15" x2="7" y2="11" stroke="#2cb3b3" stroke-width="2" />
          <line x1="5" y1="13" x2="16" y2="2" stroke="#0e4b4b" stroke-width="3.5" />
          <line x1="5" y1="13" x2="16" y2="2" stroke="#5bf2f2" stroke-width="2" />
          <line x1="6" y1="12" x2="15" y2="3" stroke="#ffffff" stroke-width="0.8" />
        </g>
      `
    case 'pickaxe':
      return `
        <g transform="translate(${x + 2}, ${y + 2})">
          <line x1="3" y1="16" x2="13" y2="6" stroke="#4a2c0f" stroke-width="2.5" />
          <path d="M6,3 Q14,1 17,6 Q15,11 12,13 Q12,8 9,6 Z" fill="#20a3a3" stroke="#0e4b4b" stroke-width="0.8" />
          <path d="M7,4 Q13,3 15,7 Q14,10 12,11 Q11,7 9,5 Z" fill="#5bf2f2" />
        </g>
      `
    case 'apple':
      return `
        <g transform="translate(${x + 2}, ${y + 2})">
          <circle cx="9" cy="10" r="7" fill="#000000" />
          <circle cx="9" cy="10" r="6" fill="#f5bc00" />
          <path d="M5,7 Q9,4 13,7 Q14,13 9,15 Q4,13 5,7 Z" fill="#ffee55" />
          <rect x="8" y="2" width="2" height="3" fill="#8b5a2b" />
          <rect x="9" y="1" width="3" height="2" fill="#4d7e26" />
        </g>
      `
    case 'book':
    case 'enchanted_book':
      return `
        <g transform="translate(${x + 2}, ${y + 2})">
          <rect x="2" y="2" width="14" height="15" rx="1" fill="#85361e" stroke="#220a04" stroke-width="1" />
          <rect x="4" y="3" width="10" height="13" fill="#eae3d2" />
          <rect x="8" y="1" width="2" height="16" fill="#c62828" />
          <polygon points="2,2 6,2 2,6" fill="#f5bc00" />
          <rect x="5" y="6" width="3" height="1" fill="#9c27b0" />
        </g>
      `
    case 'redstone':
      return `
        <g transform="translate(${x + 3}, ${y + 4})">
          <circle cx="7" cy="6" r="5" fill="#000000" />
          <circle cx="7" cy="6" r="4" fill="#cc0000" />
          <circle cx="6" cy="5" r="2" fill="#ff4d4d" />
          <rect x="5" y="4" width="1.5" height="1.5" fill="#ffffff" />
        </g>
      `
    case 'pearl':
      return `
        <g transform="translate(${x + 3}, ${y + 3})">
          <circle cx="7" cy="7" r="6" fill="#07221e" stroke="#000000" stroke-width="0.8" />
          <circle cx="7" cy="7" r="5" fill="#0e4a42" />
          <circle cx="6" cy="6" r="3" fill="#20a390" />
          <circle cx="5" cy="5" r="1.5" fill="#a4f2e8" />
        </g>
      `
    case 'totem':
      return `
        <g transform="translate(${x + 3}, ${y + 2})">
          <rect x="3" y="1" width="9" height="15" fill="#f5bc00" stroke="#000000" stroke-width="0.8" />
          <rect x="1" y="5" width="13" height="3" fill="#e6a100" />
          <rect x="4" y="4" width="2" height="2" fill="#2e7d32" />
          <rect x="9" y="4" width="2" height="2" fill="#2e7d32" />
        </g>
      `
    case 'lapis':
      return `
        <g transform="translate(${x + 3}, ${y + 3})">
          <polygon points="7,1 13,5 11,13 4,13 1,6" fill="#15368a" stroke="#000000" stroke-width="0.8" />
          <polygon points="7,2 11,5 10,11 5,11 3,6" fill="#2959c2" />
          <rect x="5" y="4" width="2" height="2" fill="#6d95eb" />
        </g>
      `
    case 'nether_star':
      return `
        <g transform="translate(${x + 2}, ${y + 2})">
          <path d="M8,0 L11,5 L16,8 L11,11 L8,16 L5,11 L0,8 L5,5 Z" fill="#e0f7fa" stroke="#006064" stroke-width="0.8" />
          <circle cx="8" cy="8" r="3" fill="#80deea" />
          <circle cx="8" cy="8" r="1.5" fill="#ffffff" />
        </g>
      `
    case 'emerald':
      return `
        <g transform="translate(${x + 3}, ${y + 3})">
          <polygon points="7,1 12,4 12,11 7,14 2,11 2,4" fill="#00b341" stroke="#004d1a" stroke-width="0.8" />
          <polygon points="7,3 10,5 10,9 7,12 4,9 4,5" fill="#55ff55" />
          <rect x="5" y="5" width="2" height="2" fill="#ffffff" />
        </g>
      `
    default:
      return `
        <g transform="translate(${x + 3}, ${y + 2})">
          <rect x="3" y="3" width="12" height="12" fill="#888888" stroke="#000000" stroke-width="0.8" />
        </g>
      `
  }
}

export function renderMinecraftHud(widget: WidgetInstance, data: NormalizedGitHubData): string {
  const rawId = widget?.instanceId || 'mc-hud'
  const id = sanitizeId(rawId)

  const w = Math.max(480, widget.size?.width || 500)
  const h = Math.max(180, widget.size?.height || 210)

  const followers = data?.user?.followers || 0
  const totalStars = data?.totalStars || 0
  const reposCount = data?.user?.public_repos || (data?.repos ? data.repos.length : 0) || 0
  const totalCommits = data?.contributions?.totalContributions || reposCount * 14 || 240

  const langs = Object.entries(data?.languages || {})
  const topLang = langs[0] ? langs[0][0] : 'TypeScript'
  const topPct = langs[0] ? Math.round((Number(langs[0][1]) / 1000) * 10) / 10 : 54.2

  const streakDays = Math.min(365, data?.contributions?.totalContributions || 42)
  const armorCount = Math.min(10, Math.max(3, Math.floor(reposCount / 2) || 4))
  const foodCount = Math.min(10, Math.max(4, Math.floor(followers / 10) || 8))

  const xpLevel = totalCommits
  const xpBarWidth = Math.min(w - 120, 320)
  const xpProgress = Math.min(xpBarWidth, Math.floor(((totalCommits % 100) / 100) * xpBarWidth))

  const hotbarStartX = Math.floor((w - 9 * 24) / 2)
  const hudCenterY = h - 54

  return `
    <svg id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          #${id} .mc-font {
            font-family: 'Minecraft', 'Courier New', monospace, sans-serif;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }
          #${id} .boss-title { fill: #ff55ff; font-weight: bold; font-size: 11px; text-shadow: 1px 1px 0 #3f153f; }
          #${id} .f3-shadow { fill: #000000; font-size: 9.5px; }
          #${id} .f3-text { fill: #ffffff; font-size: 9.5px; }
          #${id} .xp-level-shadow { fill: #000000; font-size: 14px; font-weight: bold; }
          #${id} .xp-level { fill: #80ff20; font-size: 14px; font-weight: bold; }
          #${id} .stack-shadow { fill: #000000; font-size: 8.5px; font-weight: bold; }
          #${id} .stack-num { fill: #ffffff; font-size: 8.5px; font-weight: bold; }
          #${id} .effect-name { fill: #ffff55; font-size: 9px; font-weight: bold; }
          #${id} .effect-val { fill: #aaaaaa; font-size: 8px; }
        </style>
      </defs>

      <!-- Viewport / In-game Dimension Backdrop -->
      <rect width="${w}" height="${h}" fill="#0c0c12" rx="2" />

      <!-- TOP: WITHER / ENDER DRAGON RAID BOSS BAR (Production Outage / Bug Slaying) -->
      <g transform="translate(${Math.floor((w - 340) / 2)}, 10)">
        <!-- Boss Title -->
        <text class="mc-font boss-title" x="170" y="0" text-anchor="middle">§d§l[BOSS] Production Outage §f(HP: 100% | ${reposCount} Open Repos)</text>
        <!-- Boss Bar Frame -->
        <rect x="0" y="4" width="340" height="9" fill="#000000" />
        <rect x="1" y="5" width="338" height="7" fill="#2d052d" />
        <!-- Purple Boss Health Gradient -->
        <rect x="2" y="6" width="280" height="5" fill="#cc33cc" />
        <rect x="2" y="6" width="280" height="2" fill="#ff66ff" opacity="0.6" />
        <!-- Health Segments (6 ticks) -->
        ${[1, 2, 3, 4, 5]
          .map(
            (i) =>
              `<line x1="${(340 / 6) * i}" y1="5" x2="${(340 / 6) * i}" y2="12" stroke="#000000" stroke-width="1.5" />`
          )
          .join('')}
      </g>

      <!-- F3 DEBUG TELEMETRY (Left) -->
      <g transform="translate(14, 34)">
        <text class="mc-font f3-shadow" x="1" y="1">Minecraft 1.21.4 (Java/V8) · Git Branch: main*</text>
        <text class="mc-font f3-text" x="0" y="0">Minecraft 1.21.4 (Java/V8) · Git Branch: <tspan fill="#55ff55">main*</tspan></text>

        <text class="mc-font f3-shadow" x="1" y="13">XYZ: ${totalCommits}.000 / ${totalStars}.000 / ${reposCount}.000</text>
        <text class="mc-font f3-text" x="0" y="12">XYZ: <tspan fill="#80ff20">${totalCommits}</tspan> Commits / <tspan fill="#ffd700">${totalStars}</tspan> Stars / <tspan fill="#55ffff">${reposCount}</tspan> Repos</text>

        <text class="mc-font f3-shadow" x="1" y="25">Biome: Production US-East · Chunk: [${escapeXml(topLang)}] (${topPct}%)</text>
        <text class="mc-font f3-text" x="0" y="24">Biome: <tspan fill="#ffaa00">Production US-East</tspan> · Chunk: <tspan fill="#55ffff">[${escapeXml(topLang)}]</tspan> (${topPct}%)</text>
      </g>

      <!-- ACTIVE STATUS BUFFS (Right Corner) -->
      <g transform="translate(${w - 145}, 28)">
        <!-- Buff 1: Haste III (Streak) -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="135" height="18" fill="#14141c" stroke="#2a2a38" stroke-width="1" />
          <rect x="2" y="2" width="14" height="14" fill="#3a2e0a" />
          ${renderItemIcon('pickaxe', 0, -1)}
          <text class="mc-font effect-name" x="22" y="9">Haste III</text>
          <text class="mc-font effect-val" x="22" y="16">Streak: ${streakDays}d</text>
        </g>
        <!-- Buff 2: Hero of Village (Stars/Followers) -->
        <g transform="translate(0, 20)">
          <rect x="0" y="0" width="135" height="18" fill="#14141c" stroke="#2a2a38" stroke-width="1" />
          <rect x="2" y="2" width="14" height="14" fill="#0a3a14" />
          ${renderItemIcon('emerald', 0, -1)}
          <text class="mc-font effect-name" x="22" y="9">Hero of Village</text>
          <text class="mc-font effect-val" x="22" y="16">Followers: ${followers}</text>
        </g>
      </g>

      <!-- HARDCORE HEARTS, ARMOR & HUNGER BAR -->
      <g transform="translate(${Math.floor((w - xpBarWidth) / 2)}, ${hudCenterY - 26})">
        <!-- Armor Shields (Public Repos) -->
        <g transform="translate(0, 0)">
          ${Array.from({ length: 10 })
            .map((_, i) => renderMcArmor(i * 9, 0, i < armorCount))
            .join('')}
        </g>

        <!-- Hardcore Hearts (Commit Streak) -->
        <g transform="translate(0, 11)">
          ${Array.from({ length: 10 })
            .map((_, i) => renderMcHeart(i * 9, 0, true))
            .join('')}
        </g>

        <!-- Hunger Drumsticks (Followers Fuel) -->
        <g transform="translate(${xpBarWidth - 90}, 11)">
          ${Array.from({ length: 10 })
            .map((_, i) => renderMcDrumstick(i * 9, 0, i < foodCount))
            .join('')}
        </g>
      </g>

      <!-- XP EXPERIENCE GAUGE & LEVEL -->
      <g transform="translate(${Math.floor((w - xpBarWidth) / 2)}, ${hudCenterY - 4})">
        <rect x="0" y="0" width="${xpBarWidth}" height="5" fill="#000000" />
        <rect x="1" y="1" width="${xpBarWidth - 2}" height="3" fill="#1b3802" />
        <rect x="1" y="1" width="${xpProgress}" height="3" fill="#80ff20" />
        <!-- XP Notch Lines -->
        ${Array.from({ length: 10 })
          .map(
            (_, i) =>
              `<line x1="${(xpBarWidth / 10) * (i + 1)}" y1="1" x2="${(xpBarWidth / 10) * (i + 1)}" y2="4" stroke="#000000" stroke-width="1" />`
          )
          .join('')}

        <!-- Center Glowing Level Number -->
        <text class="mc-font xp-level-shadow" x="${xpBarWidth / 2 + 1}" y="-3" text-anchor="middle">${xpLevel}</text>
        <text class="mc-font xp-level-shadow" x="${xpBarWidth / 2 - 1}" y="-3" text-anchor="middle">${xpLevel}</text>
        <text class="mc-font xp-level-shadow" x="${xpBarWidth / 2}" y="-2" text-anchor="middle">${xpLevel}</text>
        <text class="mc-font xp-level-shadow" x="${xpBarWidth / 2}" y="-4" text-anchor="middle">${xpLevel}</text>
        <text class="mc-font xp-level" x="${xpBarWidth / 2}" y="-3" text-anchor="middle">${xpLevel}</text>
      </g>

      <!-- 9-SLOT IN-GAME HOTBAR -->
      <g transform="translate(${hotbarStartX}, ${hudCenterY + 6})">
        <rect x="-1" y="-1" width="${9 * 24 + 2}" height="26" fill="#000000" />
        <rect x="0" y="0" width="${9 * 24}" height="24" fill="#8f8f8f" />

        ${[
          { icon: 'sword', stack: '1', durability: 95 },
          { icon: 'pickaxe', stack: '64', durability: 80 },
          { icon: 'apple', stack: `${Math.min(64, totalStars || 12)}`, durability: 0 },
          { icon: 'enchanted_book', stack: `${Math.min(64, reposCount || 8)}`, durability: 0 },
          { icon: 'totem', stack: '1', durability: 0 },
          { icon: 'redstone', stack: '64', durability: 0 },
          { icon: 'pearl', stack: '16', durability: 0 },
          { icon: 'lapis', stack: `${Math.min(64, followers || 32)}`, durability: 0 },
          { icon: 'emerald', stack: '42', durability: 0 },
        ]
          .map((item, i) => {
            const slotX = i * 24
            return `
              <g transform="translate(${slotX}, 0)">
                <rect x="1" y="1" width="22" height="22" fill="#8b8b8b" />
                <line x1="1" y1="1" x2="23" y2="1" stroke="#373737" stroke-width="1.5" />
                <line x1="1" y1="1" x2="1" y2="23" stroke="#373737" stroke-width="1.5" />
                <line x1="1" y1="23" x2="23" y2="23" stroke="#ffffff" stroke-width="1.5" />
                <line x1="23" y1="1" x2="23" y2="23" stroke="#ffffff" stroke-width="1.5" />
                <rect x="2" y="2" width="20" height="20" fill="#8b8b8b" />

                <!-- Item Icon -->
                ${renderItemIcon(item.icon, 1, 1)}

                <!-- Durability Bar (Coverage/Health) -->
                ${
                  item.durability > 0
                    ? `<rect x="4" y="20" width="16" height="2" fill="#000000" /><rect x="4" y="20" width="${(16 * item.durability) / 100}" height="2" fill="#55ff55" />`
                    : ''
                }

                <!-- Item Stack Count -->
                ${
                  item.stack && item.durability === 0
                    ? `<text class="mc-font stack-shadow" x="21" y="21" text-anchor="end">${item.stack}</text><text class="mc-font stack-num" x="20" y="20" text-anchor="end">${item.stack}</text>`
                    : ''
                }
              </g>
            `
          })
          .join('')}

        <!-- Active Selected Slot 1 Highlight Frame -->
        <rect x="-2" y="-2" width="28" height="28" fill="none" stroke="#ffffff" stroke-width="2" />
        <rect x="-3" y="-3" width="30" height="30" fill="none" stroke="#000000" stroke-width="1" />
      </g>
    </svg>
  `
}

export function renderMinecraftInventory(
  widget: WidgetInstance,
  data: NormalizedGitHubData
): string {
  const rawId = widget?.instanceId || 'mc-inv'
  const id = sanitizeId(rawId)

  const w = Math.max(480, widget.size?.width || 500)
  const h = Math.max(280, widget.size?.height || 310)

  const user = data?.user?.login || 'Developer'
  const repos = (data?.repos || []).slice(0, 9)
  const langs = Object.entries(data?.languages || {})
  const topLang = langs[0] ? langs[0][0] : 'TypeScript'
  const totalStars = data?.totalStars || 0
  const totalCommits = data?.contributions?.totalContributions || 240
  const xpCost = Math.min(99, Math.max(7, Math.floor(totalCommits / 20)))

  return `
    <svg id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          #${id} .mc-font {
            font-family: 'Minecraft', 'Courier New', monospace, sans-serif;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }
          #${id} .gui-title { fill: #3f3f3f; font-weight: bold; font-size: 11px; }
          #${id} .anvil-input { fill: #ffffff; font-size: 11px; }
          #${id} .xp-cost { fill: #55ff55; font-size: 11px; font-weight: bold; text-shadow: 1px 1px 0 #1b4408; }
          #${id} .stack-shadow { fill: #000000; font-size: 8.5px; font-weight: bold; }
          #${id} .stack-num { fill: #ffffff; font-size: 8.5px; font-weight: bold; }
          #${id} .repo-name { fill: #55ffff; font-size: 9px; font-weight: bold; }
          #${id} .repo-meta { fill: #aaaaaa; font-size: 8px; }
        </style>
      </defs>

      <!-- GUI Stone Slate Container -->
      <rect x="0" y="0" width="${w}" height="${h}" fill="#c6c6c6" rx="2" />
      <line x1="0" y1="0" x2="${w}" y2="0" stroke="#ffffff" stroke-width="3" />
      <line x1="0" y1="0" x2="0" y2="${h}" stroke="#ffffff" stroke-width="3" />
      <line x1="0" y1="${h}" x2="${w}" y2="${h}" stroke="#555555" stroke-width="3" />
      <line x1="${w}" y1="0" x2="${w}" y2="${h}" stroke="#555555" stroke-width="3" />

      <!-- TOP: ANVIL STATION HEADER -->
      <g transform="translate(16, 14)">
        <text class="mc-font gui-title" x="0" y="0">Repair &amp; Name (Reforge Pull Request)</text>

        <!-- Custom Rename Input Box -->
        <g transform="translate(40, 10)">
          <rect x="0" y="0" width="220" height="24" fill="#373737" />
          <rect x="1" y="1" width="218" height="22" fill="#8b8b8b" />
          <rect x="2" y="2" width="216" height="20" fill="#1e1e1e" />
          <text class="mc-font anvil-input" x="8" y="15">feat/production-v3.0.0<tspan fill="#55ff55">_</tspan></text>
        </g>
      </g>

      <!-- ANVIL CRAFTING INGREDIENTS ROW -->
      <g transform="translate(24, 60)">
        <!-- Slot 1: Raw Branch Feature (Sword) -->
        <g transform="translate(20, 0)">
          <rect x="0" y="0" width="36" height="36" fill="#373737" />
          <rect x="1" y="1" width="34" height="34" fill="#ffffff" />
          <rect x="2" y="2" width="32" height="32" fill="#8b8b8b" />
          ${renderItemIcon('diamond_sword', 6, 6)}
        </g>

        <!-- Plus Sign '+' -->
        <text class="mc-font" x="72" y="24" fill="#444444" font-size="20" font-weight="bold">+</text>

        <!-- Slot 2: Enchanted Book (Type Safety IV) -->
        <g transform="translate(98, 0)">
          <rect x="0" y="0" width="36" height="36" fill="#373737" />
          <rect x="1" y="1" width="34" height="34" fill="#ffffff" />
          <rect x="2" y="2" width="32" height="32" fill="#8b8b8b" />
          ${renderItemIcon('enchanted_book', 6, 6)}
        </g>

        <!-- Anvil Arrow '->' -->
        <polygon points="152,14 170,14 170,8 184,18 170,28 170,22 152,22" fill="#8b8b8b" stroke="#373737" stroke-width="1.5" />

        <!-- Output Result Slot (Netherite Artifact) with purple glint glow -->
        <g transform="translate(202, 0)">
          <rect x="-2" y="-2" width="40" height="40" fill="#9c27b0" opacity="0.4" rx="2" />
          <rect x="0" y="0" width="36" height="36" fill="#373737" />
          <rect x="1" y="1" width="34" height="34" fill="#ffffff" />
          <rect x="2" y="2" width="32" height="32" fill="#584860" />
          ${renderItemIcon('netherite_sword', 6, 6)}
        </g>

        <!-- Enchantment Cost Readout -->
        <g transform="translate(254, 18)">
          <text class="mc-font xp-cost" x="0" y="0">Enchantment Cost: ${xpCost} Commits</text>
          <text class="mc-font" x="0" y="13" fill="#3f3f3f" font-size="9">2 Review Approvals and CI Green</text>
        </g>
      </g>

      <!-- REPOSITORY VAULT CHEST (Bottom Grid) -->
      <g transform="translate(16, 120)">
        <text class="mc-font gui-title" x="0" y="0">Public Repositories Vault (@${escapeXml(user)})</text>

        <!-- 9 Repo Inset Item Slots -->
        <g transform="translate(0, 10)">
          ${Array.from({ length: 9 })
            .map((_, i) => {
              const rx = (i % 9) * Math.floor((w - 40) / 9)
              const repo = repos[i]
              const stars = repo?.stargazers_count || 0
              return `
                <g transform="translate(${rx}, 0)">
                  <rect x="0" y="0" width="44" height="44" fill="#373737" />
                  <rect x="1" y="1" width="42" height="42" fill="#ffffff" />
                  <rect x="2" y="2" width="40" height="40" fill="#8b8b8b" />
                  ${repo ? renderItemIcon(i % 2 === 0 ? 'enchanted_book' : 'emerald', 10, 8) : ''}
                  ${
                    repo
                      ? `<text class="mc-font stack-shadow" x="38" y="38" text-anchor="end">${stars > 0 ? stars : '1'}</text><text class="mc-font stack-num" x="37" y="37" text-anchor="end">${stars > 0 ? stars : '1'}</text>`
                      : ''
                  }
                </g>
              `
            })
            .join('')}
        </g>

        <!-- Repository Details Card Overlay below -->
        <g transform="translate(0, 64)">
          <rect x="0" y="0" width="${w - 32}" height="64" fill="#1b120c" stroke="#373737" stroke-width="1.5" />
          <text class="mc-font repo-name" x="12" y="18">Main Project: ${escapeXml(repos[0]?.name || `${user}/core-service`)}</text>
          <text class="mc-font repo-meta" x="12" y="34">${escapeXml(repos[0]?.description || 'High-performance cloud architecture &amp; distributed backend')}</text>
          <text class="mc-font" x="12" y="50" fill="#ffd700" font-size="9">${totalStars} Stars · <tspan fill="#55ff55">${topLang}</tspan> · <tspan fill="#55ffff">${repos.length} Pinned Repos</tspan></text>
        </g>
      </g>
    </svg>
  `
}

export function renderMinecraftChat(widget: WidgetInstance, data: NormalizedGitHubData): string {
  const rawId = widget?.instanceId || 'mc-chat'
  const id = sanitizeId(rawId)

  const w = Math.max(460, widget.size?.width || 480)
  const h = Math.max(220, widget.size?.height || 240)

  const user = data?.user?.login || 'Steve'
  const repos = (data?.repos || []).slice(0, 3)
  const langs = Object.keys(data?.languages || {})
  const topLang = langs[0] || 'TypeScript'
  const topRepo = repos[0]?.name || 'gitascii'
  const totalCommits = data?.contributions?.totalContributions || 240
  const followers = data?.user?.followers || 0

  const chatMessages = [
    `§7[Server] §ePlayer §a@${user}§e joined the game §7(Client: ${topLang})`,
    `§f<§a@${user}§f> Merged PR #42 into §6${topRepo}§f: "Fix memory leak in production"`,
    `§d§l[Advancement] §a@${user} §ehas completed the challenge §d[Polyglot Enchanter]`,
    `§c[!] A wild Bug was slain by §a@${user} §cusing §bStrict Type Checking`,
    `§b[STAR] GitHub Star Event: §6${followers} players§b are now watching this repository!`,
    `§7[System] Server uptime: 100% · Total Commits this season: §a${totalCommits}`,
  ]

  return `
    <svg id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          #${id} .mc-font {
            font-family: 'Minecraft', 'Courier New', monospace, sans-serif;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }
          #${id} .chat-line { font-size: 11px; }
          #${id} .prompt-text { fill: #ffffff; font-size: 11.5px; }
        </style>
      </defs>

      <!-- Chat Viewport HUD Background -->
      <rect width="${w}" height="${h}" fill="rgba(8, 8, 12, 0.94)" rx="2" />

      <!-- Chat Stream Messages -->
      <g transform="translate(12, 22)">
        ${chatMessages
          .map((msg, i) => {
            const y = i * 26
            return `
              <g transform="translate(0, ${y})">
                <text class="mc-font chat-line" x="1" y="1">${parseMinecraftFormatting(msg, true)}</text>
                <text class="mc-font chat-line" x="0" y="0">${parseMinecraftFormatting(msg, false)}</text>
              </g>
            `
          })
          .join('')}
      </g>

      <!-- Bottom Chat Prompt Input Bar -->
      <g transform="translate(10, ${h - 32})">
        <rect x="0" y="0" width="${w - 20}" height="22" fill="rgba(0, 0, 0, 0.75)" stroke="#3a3a3a" stroke-width="1" />
        <text class="mc-font prompt-text" x="8" y="15">&gt; /deploy --branch main --env production<tspan fill="#55ff55">_</tspan></text>
      </g>
    </svg>
  `
}

export function renderMinecraftAchievement(
  widget: WidgetInstance,
  data: NormalizedGitHubData
): string {
  const rawId = widget?.instanceId || 'mc-achieve'
  const id = sanitizeId(rawId)

  const w = Math.max(360, widget.size?.width || 480)
  const h = Math.max(80, widget.size?.height || 96)

  const totalContributions = data?.contributions?.totalContributions || 240
  const languagesCount = Object.keys(data?.languages || {}).length || 5

  let headerText = 'Advancement Made!'
  let headerColor = '#ffff55'
  let headerShadow = '#3f3f15'
  let title = 'Hot Topic'
  let description = 'Construct and maintain public repositories'
  let icon = 'pickaxe'

  if (totalContributions >= 100) {
    headerText = 'Challenge Complete!'
    headerColor = '#ff55ff'
    headerShadow = '#3f153f'
    title = 'The Ultimate Contributor'
    description = `Craft over ${totalContributions.toLocaleString()} commits & contributions`
    icon = 'nether_star'
  } else if (languagesCount >= 4) {
    headerText = 'Goal Reached!'
    headerColor = '#55ffff'
    headerShadow = '#153f3f'
    title = 'Polyglot Enchanter'
    description = `Master ${languagesCount} distinct programming languages`
    icon = 'enchanted_book'
  }

  const boxW = Math.min(w - 20, 360)
  const boxH = 68
  const startX = Math.max(10, Math.floor((w - boxW) / 2))
  const startY = Math.max(10, Math.floor((h - boxH) / 2))

  return `
    <svg id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          #${id} .mc-font {
            font-family: 'Minecraft', 'Courier New', monospace, sans-serif;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }
          #${id} .header-text { fill: ${headerColor}; font-weight: bold; font-size: 13px; text-shadow: 1px 1px 0 ${headerShadow}; }
          #${id} .title-text { fill: #ffffff; font-weight: bold; font-size: 13px; text-shadow: 1px 1px 0 #222222; }
          #${id} .desc-text { fill: #aaaaaa; font-size: 10px; text-shadow: 1px 1px 0 #1a1a1a; }
        </style>
      </defs>

      <g transform="translate(${startX}, ${startY})">
        <!-- Stepped Toast Frame -->
        <rect x="2" y="0" width="${boxW - 4}" height="${boxH}" fill="#000000" />
        <rect x="0" y="2" width="${boxW}" height="${boxH - 4}" fill="#000000" />
        <rect x="3" y="1" width="${boxW - 6}" height="2" fill="#555555" />
        <rect x="1" y="3" width="2" height="${boxH - 6}" fill="#555555" />
        <rect x="3" y="${boxH - 3}" width="${boxW - 6}" height="2" fill="#141414" />
        <rect x="${boxW - 3}" y="3" width="2" height="${boxH - 6}" fill="#141414" />
        <rect x="3" y="3" width="${boxW - 6}" height="${boxH - 6}" fill="#212121" />

        <!-- Icon Inset Slot -->
        <g transform="translate(10, 18)">
          <rect x="0" y="0" width="32" height="32" fill="#141414" />
          <rect x="1" y="1" width="30" height="30" fill="#1a1a1a" />
          ${renderItemIcon(icon, 6, 6)}
        </g>

        <!-- Typography -->
        <g transform="translate(50, 22)">
          <text class="mc-font header-text" x="0" y="0">${escapeXml(headerText)}</text>
          <text class="mc-font title-text" x="0" y="17">[${escapeXml(title)}]</text>
          <text class="mc-font desc-text" x="0" y="32">${escapeXml(description.length > 38 ? description.slice(0, 36) + '…' : description)}</text>
        </g>
      </g>
    </svg>
  `
}

export function renderMinecraftServer(widget: WidgetInstance, data: NormalizedGitHubData): string {
  const rawId = widget?.instanceId || 'mc-server'
  const id = sanitizeId(rawId)

  const w = Math.max(380, widget.size?.width || 480)
  const h = Math.max(90, widget.size?.height || 110)

  const user = data?.user?.login || 'Player'
  const rawBio = data?.user?.bio || 'Fullstack Developer & Open Source Builder'
  const cleanBio = rawBio.replace(/[\r\n]+/g, ' ').trim()
  const truncatedBio = cleanBio.length > 34 ? cleanBio.slice(0, 32) + '…' : cleanBio

  const totalStars = data?.totalStars || 0
  const followers = data?.user?.followers || 0
  const maxPlayers = Math.max(followers + 20, 100)
  const topLang = Object.keys(data?.languages || {})[0] || 'TypeScript'
  const avatarUrl = data?.user?.avatar_url || ''

  const motdLine1 = `§6§l* §e${truncatedBio} §6*`
  const motdLine2 = `§a[OK] main §7| §e${topLang} §7| §b${totalStars} Stars`

  return `
    <svg id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          #${id} .mc-font {
            font-family: 'Minecraft', 'Courier New', monospace, sans-serif;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }
          #${id} .server-title { fill: #ffffff; font-weight: bold; font-size: 14px; text-shadow: 1px 1px 0 #222222; }
          #${id} .version-text { fill: #777777; font-size: 10px; }
          #${id} .players-text { fill: #aaaaaa; font-size: 11px; text-shadow: 1px 1px 0 #222222; }
        </style>
      </defs>

      <!-- Background: Dark Stone Multiplayer Server List Entry -->
      <rect width="${w}" height="${h}" fill="#111111" />
      <line x1="0" y1="0" x2="${w}" y2="0" stroke="#2a2a2a" stroke-width="1" />
      <line x1="0" y1="${h}" x2="${w}" y2="${h}" stroke="#000000" stroke-width="1" />

      <!-- Server Icon (64x64) -->
      <g transform="translate(10, ${Math.floor((h - 64) / 2)})">
        <rect x="0" y="0" width="64" height="64" fill="#000000" />
        <rect x="1" y="1" width="62" height="62" fill="#6d4624" />
        <rect x="2" y="2" width="60" height="18" fill="#4d7e26" />
        ${
          avatarUrl
            ? `<image x="2" y="2" width="60" height="60" href="${escapeXml(avatarUrl)}" preserveAspectRatio="xMidYMid slice" />`
            : ''
        }
      </g>

      <!-- Server Info & MOTD -->
      <g transform="translate(84, 18)">
        <text class="mc-font server-title" x="0" y="0">${escapeXml(user)}'s Production SMP</text>
        <text class="mc-font version-text" x="${Math.min(w - 210, 240)}" y="-1">Paper 1.21.4</text>
        <text class="mc-font" x="0" y="22">${parseMinecraftFormatting(motdLine1, false)}</text>
        <text class="mc-font" x="0" y="40">${parseMinecraftFormatting(motdLine2, false)}</text>
      </g>

      <!-- Ping Signal & Players -->
      <g transform="translate(${w - 88}, 16)">
        <text class="mc-font players-text" x="-9" y="0" text-anchor="end">${followers}/${maxPlayers}</text>
        <g transform="translate(0, -6)">
          <rect x="0" y="10" width="2" height="2" fill="#55ff55" />
          <rect x="3" y="8" width="2" height="4" fill="#55ff55" />
          <rect x="6" y="6" width="2" height="6" fill="#55ff55" />
          <rect x="9" y="4" width="2" height="8" fill="#55ff55" />
          <rect x="12" y="2" width="2" height="10" fill="#55ff55" />
        </g>
      </g>
    </svg>
  `
}

export function renderMinecraftDeathScreen(
  widget: WidgetInstance,
  data: NormalizedGitHubData
): string {
  const rawId = widget?.instanceId || 'mc-death'
  const id = sanitizeId(rawId)

  const w = Math.max(480, widget.size?.width || 500)
  const h = Math.max(240, widget.size?.height || 260)

  const user = data?.user?.login || 'Player'
  const totalCommits = data?.contributions?.totalContributions || 240
  const totalStars = data?.totalStars || 0
  const score = totalCommits * 10 + totalStars * 50

  return `
    <svg id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          #${id} .mc-font {
            font-family: 'Minecraft', 'Courier New', monospace, sans-serif;
            font-smooth: never;
            -webkit-font-smoothing: none;
          }
          #${id} .death-title { fill: #ff0000; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 0 #550000, 3px 3px 0 #000000; }
          #${id} .death-msg { fill: #ffffff; font-size: 11px; text-shadow: 1px 1px 0 #000000; }
          #${id} .score-text { fill: #ffffff; font-size: 12px; font-weight: bold; text-shadow: 1px 1px 0 #000000; }
          #${id} .btn-text { fill: #ffffff; font-size: 11px; font-weight: bold; text-shadow: 1px 1px 0 #222222; }
        </style>
        <radialGradient id="death-vignette-${id}" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#4a0d0d" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#140202" stop-opacity="0.98" />
        </radialGradient>
      </defs>

      <!-- Crimson Death Vignette Overlay -->
      <rect width="${w}" height="${h}" fill="url(#death-vignette-${id})" rx="2" />

      <!-- CENTER: YOU DIED! TITLE -->
      <g transform="translate(${w / 2}, 54)">
        <text class="mc-font death-title" x="0" y="0" text-anchor="middle">You Died!</text>
      </g>

      <!-- CAUSE OF DEATH STACK TRACE MESSAGE -->
      <g transform="translate(${w / 2}, 86)">
        <text class="mc-font death-msg" x="0" y="0" text-anchor="middle">@${escapeXml(user)} was slain by <tspan fill="#ffff55">Uncaught TypeError</tspan> in Production</text>
        <text class="mc-font score-text" x="0" y="24" text-anchor="middle">Score: <tspan fill="#55ff55">${score.toLocaleString()}</tspan> (${totalCommits} Commits, ${totalStars} Stars)</text>
      </g>

      <!-- DROPPED ITEMS ON FLOOR (PIXEL ART) -->
      <g transform="translate(${w / 2 - 60}, 128)">
        ${renderItemIcon('pickaxe', 0, 0)}
        ${renderItemIcon('enchanted_book', 36, 0)}
        ${renderItemIcon('apple', 72, 0)}
        ${renderItemIcon('emerald', 108, 0)}
      </g>

      <!-- 2 INTERACTIVE MINECRAFT STONE BUTTONS -->
      <g transform="translate(${Math.floor((w - 380) / 2)}, ${h - 58})">
        <!-- Button 1: Respawn (git reset --hard) -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="180" height="32" fill="#585858" />
          <line x1="0" y1="0" x2="180" y2="0" stroke="#8b8b8b" stroke-width="2" />
          <line x1="0" y1="0" x2="0" y2="32" stroke="#8b8b8b" stroke-width="2" />
          <line x1="0" y1="32" x2="180" y2="32" stroke="#373737" stroke-width="2" />
          <line x1="180" y1="0" x2="180" y2="32" stroke="#373737" stroke-width="2" />
          <text class="mc-font btn-text" x="90" y="20" text-anchor="middle">Respawn (git reset)</text>
        </g>

        <!-- Button 2: Title Screen (Exit to Vim) -->
        <g transform="translate(200, 0)">
          <rect x="0" y="0" width="180" height="32" fill="#585858" />
          <line x1="0" y1="0" x2="180" y2="0" stroke="#8b8b8b" stroke-width="2" />
          <line x1="0" y1="0" x2="0" y2="32" stroke="#8b8b8b" stroke-width="2" />
          <line x1="0" y1="32" x2="180" y2="32" stroke="#373737" stroke-width="2" />
          <line x1="180" y1="0" x2="180" y2="32" stroke="#373737" stroke-width="2" />
          <text class="mc-font btn-text" x="90" y="20" text-anchor="middle">Title Screen (Exit to Vim)</text>
        </g>
      </g>
    </svg>
  `
}
