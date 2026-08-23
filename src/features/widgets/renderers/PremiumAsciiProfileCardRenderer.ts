import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function escapeXml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function truncate(str: string, max: number): string {
  const s = String(str ?? '')
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function getAccountUptime(createdAtStr?: string): string {
  if (!createdAtStr) return 'N/A'
  const created = new Date(createdAtStr)
  const now = new Date()
  let years = now.getFullYear() - created.getFullYear()
  let months = now.getMonth() - created.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  const yPart = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : ''
  const mPart = months > 0 ? `${months} mo${months > 1 ? 's' : ''}` : ''
  if (yPart && mPart) return `${yPart}, ${mPart}`
  return yPart || mPart || '1 month'
}

function vLen(str: string): number {
  let len = 0
  let inTag = false
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    if (char === '<') {
      inTag = true
    } else if (char === '>') {
      inTag = false
    } else if (!inTag) {
      len++
    }
  }
  return len
}

function vPad(str: string, targetWidth: number): string {
  const len = vLen(str)
  return str + ' '.repeat(Math.max(0, targetWidth - len))
}

export function renderPremiumAsciiProfileCard(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic = false
): string {
  const width = Math.max(280, Number(widget?.size?.width) || 520)
  const height = Math.max(200, Number(widget?.size?.height) || 440)
  const cfg = widget?.config || {}

  const username = data?.user?.login || 'developer'
  const displayName = (cfg.customName as string) || data?.user?.name || username
  const location = (cfg.customLocation as string) || data?.user?.location || 'San Francisco, CA'
  const website =
    (cfg.customWebsite as string) ||
    (data?.user?.blog
      ? data.user.blog.replace(/^https?:\/\//, '').replace(/\/$/, '')
      : 'developer.io')
  const uptime = getAccountUptime(data?.user?.created_at)

  const roles = (
    Array.isArray(cfg.roles) && cfg.roles.length > 0
      ? cfg.roles
      : ['Full Stack Developer', 'Software Architecture', 'Embedded Systems']
  ) as string[]

  const totalStars = data?.totalStars ?? 0
  const publicRepos = data?.user?.public_repos ?? data?.repos?.length ?? 0
  const followers = data?.user?.followers ?? 0
  const totalContributions =
    typeof data?.contributions?.totalContributions === 'number'
      ? data.contributions.totalContributions
      : typeof data?.activityMetrics?.totalCommits === 'number'
        ? data.activityMetrics.totalCommits
        : 500

  // Top Repos
  const repos = (data?.repos || []).filter((r) => !r.fork)
  const topRepos = repos
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 3)

  // Top Languages
  const langEntries = Object.entries(data?.languages || {}).sort((a, b) => b[1] - a[1])
  const topLanguages = langEntries.slice(0, 5)
  const totalBytes = topLanguages.reduce((sum, [, bytes]) => sum + bytes, 0)

  // Colors & Theme (Matching card color tone)
  const isDark = globalStyles?.themeMode !== 'light'
  const bg =
    (cfg.backgroundColor as string) ||
    globalStyles?.backgroundColor ||
    (isDark ? '#0d1117' : '#f6f8fa')
  const borderColor = (cfg.borderColor as string) || (isDark ? '#30363d' : '#d0d7de')
  const textChalk = isDark ? '#c9d1d9' : '#24292f'
  const textAsh = isDark ? '#8b949e' : '#57606a'
  const accentLime = (cfg.accentColor as string) || globalStyles?.accentColor || '#3fb950'
  const accentCyan = '#39c5cf'
  const accentYellow = '#ffbd2e'
  const accentBlue = '#58a6ff'

  const FONT_SIZE = 12
  const CHAR_W = 7.2
  const maxChars = Math.floor((width - 32) / CHAR_W)
  const INNER_W = Math.max(38, Math.min(68, maxChars - 2))
  const BAR_W = INNER_W >= 50 ? 18 : 12
  const LINE_H = 17

  function buildCardLines(p: number): string[] {
    const namePad = Math.max(0, Math.floor((INNER_W - displayName.length) / 2))
    const centeredName =
      ' '.repeat(namePad) +
      `<tspan fill="${accentLime}" font-weight="bold">${escapeXml(displayName)}</tspan>`
    const centeredDash =
      ' '.repeat(namePad) + `<tspan fill="${textAsh}">${'─'.repeat(displayName.length)}</tspan>`

    const currentStars = Math.round(totalStars * p)
    const currentRepos = Math.round(publicRepos * p)
    const currentFollowers = Math.round(followers * p)
    const currentContribs = Math.round(totalContributions * p)

    const colW = Math.max(8, Math.floor(INNER_W / 4))
    const lines: string[] = [
      centeredName,
      centeredDash,
      ...roles
        .slice(0, 3)
        .map(
          (role) => `<tspan fill="${accentCyan}">${escapeXml(truncate(role, INNER_W - 2))}</tspan>`
        ),
      '',
      `<tspan fill="${textAsh}">Location: </tspan><tspan fill="${accentYellow}">${escapeXml(truncate(location, INNER_W - 12))}</tspan>`,
      `<tspan fill="${textAsh}">Website:  </tspan><tspan fill="${accentBlue}">${escapeXml(truncate(website, INNER_W - 12))}</tspan>`,
      `<tspan fill="${textAsh}">Uptime:   </tspan><tspan fill="${accentLime}">${escapeXml(truncate(uptime, INNER_W - 12))}</tspan>`,
      '',
      `<tspan fill="${accentCyan}" font-weight="bold">GITHUB METRICS</tspan>`,
      `<tspan fill="${textAsh}">${vPad('Stars', colW)}${vPad('Repos', colW)}${vPad('Followers', colW)}Activity</tspan>`,
      `<tspan fill="${accentYellow}">${vPad(String(currentStars), colW)}</tspan><tspan fill="${textChalk}">${vPad(String(currentRepos), colW)}</tspan><tspan fill="${textChalk}">${vPad(String(currentFollowers), colW)}</tspan><tspan fill="${accentLime}">${String(currentContribs)}</tspan>`,
      '',
      `<tspan fill="${accentCyan}" font-weight="bold">TOP REPOSITORIES</tspan>`,
      ...(topRepos.length > 0
        ? topRepos.map((repo, i) => {
            const num = `<tspan fill="${textAsh}">0${i + 1}</tspan>`
            const repoNameW = Math.max(12, INNER_W - 20)
            const name = `<tspan fill="${accentBlue}">${vPad(truncate(repo.name, repoNameW), repoNameW + 1)}</tspan>`
            const repoStars = Math.round((repo.stargazers_count || 0) * p)
            const repoForks = Math.round((repo.forks_count || 0) * p)
            const star = `<tspan fill="${accentYellow}">★ ${repoStars}</tspan>`
            const fork = `<tspan fill="${textAsh}"> ⑂ ${repoForks}</tspan>`
            return `${num} ${name} ${vPad(star, 7)}${fork}`
          })
        : [`<tspan fill="${textAsh}">No public repositories</tspan>`]),
      '',
      `<tspan fill="${accentCyan}" font-weight="bold">LANGUAGES</tspan>`,
      ...(topLanguages.length > 0
        ? topLanguages.map(([lang, bytes]) => {
            const rawPct = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0
            const currentPct = rawPct * p
            const pctStr = `${Math.round(currentPct)}%`.padStart(4)
            const filled = Math.round((Math.min(currentPct, 100) / 100) * BAR_W)
            const bar = `[<tspan fill="${accentLime}">${'#'.repeat(filled)}</tspan><tspan fill="${textAsh}">${'─'.repeat(BAR_W - filled)}</tspan>]`
            const langW = Math.max(8, INNER_W - BAR_W - 10)
            const name = vPad(truncate(lang, langW), langW)
            return `<tspan fill="${accentCyan}">${name}</tspan> ${bar} <tspan fill="${accentLime}">${pctStr}</tspan>`
          })
        : [`<tspan fill="${textAsh}">No language data</tspan>`]),
      '',
      `<tspan fill="${accentLime}">@${escapeXml(username)}</tspan><tspan fill="${textAsh}">:~$</tspan> <tspan class="cursor" fill="${accentLime}">█</tspan>`,
    ]

    return lines
  }

  const finalLines = buildCardLines(1)
  const bottomY = 24 + (finalLines.length + 1) * LINE_H

  const isAnimated = Boolean(cfg.animated) && !forceStatic

  let framesCss = `
    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    .cursor { animation: blink 0.8s infinite; }
  `
  let framesXml = ''

  if (!isAnimated) {
    const rowsXml: string[] = []
    rowsXml.push(`<text x="16" y="24" fill="${borderColor}">┌${'─'.repeat(INNER_W + 2)}┐</text>`)
    finalLines.forEach((text, i) => {
      const y = 24 + (i + 1) * LINE_H
      const visualLen = vLen(text)
      const paddingRight = ' '.repeat(Math.max(0, INNER_W + 1 - visualLen))
      rowsXml.push(
        `<text x="16" y="${y}"><tspan fill="${borderColor}">│</tspan> ${text}${paddingRight}<tspan fill="${borderColor}">│</tspan></text>`
      )
    })
    rowsXml.push(
      `<text x="16" y="${bottomY}" fill="${borderColor}">└${'─'.repeat(INNER_W + 2)}┘</text>`
    )
    framesXml = `<g>${rowsXml.join('\n    ')}</g>`
  } else {
    const FRAMES = 16
    const DUR = 1.6

    for (let f = 0; f < FRAMES; f++) {
      const p = f === FRAMES - 1 ? 1 : f / (FRAMES - 1)
      const currentLines = buildCardLines(p)
      const rowsXml: string[] = []

      rowsXml.push(`<text x="16" y="24" fill="${borderColor}">┌${'─'.repeat(INNER_W + 2)}┐</text>`)
      currentLines.forEach((text, i) => {
        const y = 24 + (i + 1) * LINE_H
        const visualLen = vLen(text)
        const paddingRight = ' '.repeat(Math.max(0, INNER_W + 1 - visualLen))
        rowsXml.push(
          `<text x="16" y="${y}"><tspan fill="${borderColor}">│</tspan> ${text}${paddingRight}<tspan fill="${borderColor}">│</tspan></text>`
        )
      })
      rowsXml.push(
        `<text x="16" y="${bottomY}" fill="${borderColor}">└${'─'.repeat(INNER_W + 2)}┘</text>`
      )

      if (f === FRAMES - 1) {
        const startPct = ((f / FRAMES) * 100).toFixed(1)
        framesCss += `
    .frame-${f} { opacity: 0; animation: show-${f} ${DUR}s forwards; }
    @keyframes show-${f} { 0%, ${Number(startPct) - 0.01}% { opacity: 0; } ${startPct}%, 100% { opacity: 1; } }`
      } else {
        const startPct = ((f / FRAMES) * 100).toFixed(1)
        const endPct = (((f + 1) / FRAMES) * 100).toFixed(1)
        if (f === 0) {
          framesCss += `
    .frame-${f} { animation: show-${f} ${DUR}s forwards; }
    @keyframes show-${f} { 0%, ${Number(endPct) - 0.01}% { opacity: 1; } ${endPct}%, 100% { opacity: 0; } }`
        } else {
          framesCss += `
    .frame-${f} { opacity: 0; animation: show-${f} ${DUR}s forwards; }
    @keyframes show-${f} { 0%, ${Number(startPct) - 0.01}% { opacity: 0; } ${startPct}%, ${Number(endPct) - 0.01}% { opacity: 1; } ${endPct}%, 100% { opacity: 0; } }`
        }
      }

      framesXml += `  <g class="frame-${f}">\n    ${rowsXml.join('\n    ')}\n  </g>\n`
    }
  }

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${bottomY + 20}"
  fill="none"
>
  <style>
    text {
      font-family: 'JetBrains Mono', 'Courier New', Consolas, monospace;
      font-size: ${FONT_SIZE}px;
      fill: ${textChalk};
      white-space: pre;
    }
    ${framesCss}
  </style>
  <rect width="100%" height="100%" fill="${bg}" rx="6"/>
  ${framesXml}
</svg>`
}
