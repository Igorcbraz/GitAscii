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
  return str.replace(/<[^>]+>/g, '').length
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
  const height = Math.max(200, Number(widget?.size?.height) || 480)
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
      : typeof cfg.customRoles === 'string' && cfg.customRoles.trim()
        ? (cfg.customRoles as string)
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean)
        : ['Full Stack Developer', 'Software Architecture', 'Embedded Systems']
  ) as string[]

  const showRoles = cfg.showRoles !== false
  const showLocation = cfg.showLocation !== false
  const showWebsite = cfg.showWebsite !== false
  const showUptime = cfg.showUptime !== false

  const showMetrics = cfg.showMetrics !== false
  const hideMetricsArr = Array.isArray(cfg.hideMetrics) ? (cfg.hideMetrics as string[]) : []
  const showStars = !hideMetricsArr.includes('stars') && cfg.showStars !== false
  const showRepos = !hideMetricsArr.includes('repos') && cfg.showRepos !== false
  const showFollowers = !hideMetricsArr.includes('followers') && cfg.showFollowers !== false
  const showActivity = !hideMetricsArr.includes('activity') && cfg.showActivity !== false

  const totalStars = data?.totalStars ?? 0
  const publicRepos = data?.user?.public_repos ?? data?.repos?.length ?? 0
  const followers = data?.user?.followers ?? 0
  const totalContributions =
    typeof data?.contributions?.totalContributions === 'number'
      ? data.contributions.totalContributions
      : typeof data?.activityMetrics?.totalCommits === 'number'
        ? data.activityMetrics.totalCommits
        : 500

  const showTopRepos = cfg.showTopRepos !== false
  const maxRepos = Math.max(1, Math.min(10, Number(cfg.maxRepos) || 3))
  const selectedRepos = Array.isArray(cfg.selectedRepos) ? (cfg.selectedRepos as string[]) : []
  const hideReposList = Array.isArray(cfg.hideReposList) ? (cfg.hideReposList as string[]) : []
  const repoSortBy = (cfg.repoSortBy as string) || 'stars'

  let filteredRepos = (data?.repos || []).filter((r) => !r.fork && !hideReposList.includes(r.name))

  if (selectedRepos.length > 0) {
    const selectedSet = new Set(selectedRepos)
    const selected = filteredRepos.filter((r) => selectedSet.has(r.name))
    selected.sort((a, b) => selectedRepos.indexOf(a.name) - selectedRepos.indexOf(b.name))
    filteredRepos = selected
  } else {
    if (repoSortBy === 'updated') {
      filteredRepos.sort(
        (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      )
    } else if (repoSortBy === 'forks') {
      filteredRepos.sort((a, b) => (b.forks_count || 0) - (a.forks_count || 0))
    } else if (repoSortBy === 'name') {
      filteredRepos.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      filteredRepos.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    }
  }
  const topRepos = filteredRepos.slice(0, maxRepos)

  const showLanguages = cfg.showLanguages !== false
  const langsCount = Math.max(1, Math.min(10, Number(cfg.langsCount) || 5))
  const hideLangsArr = Array.isArray(cfg.hideLangsArr)
    ? (cfg.hideLangsArr as string[]).map((l) => l.toLowerCase())
    : typeof cfg.hideLangs === 'string' && cfg.hideLangs
      ? (cfg.hideLangs as string)
          .split(',')
          .map((l) => l.trim().toLowerCase())
          .filter(Boolean)
      : []

  const langEntries = Object.entries(data?.languages || {})
    .filter(([lang]) => !hideLangsArr.includes(lang.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
  const topLanguages = langEntries.slice(0, langsCount)
  const totalBytes = topLanguages.reduce((sum, [, bytes]) => sum + bytes, 0)

  const showTerminalPrompt = cfg.showTerminalPrompt !== false

  const isDark = globalStyles?.themeMode !== 'light'
  const bg =
    (cfg.backgroundColor as string) ||
    globalStyles?.backgroundColor ||
    (isDark ? '#0d1117' : '#f6f8fa')
  const borderColor = (cfg.borderColor as string) || (isDark ? '#30363d' : '#d0d7de')
  const textChalk =
    (cfg.textColor as string) || globalStyles?.textColor || (isDark ? '#c9d1d9' : '#24292f')
  const textAsh = isDark ? '#8b949e' : '#57606a'
  const accentLime = (cfg.accentColor as string) || globalStyles?.accentColor || '#3fb950'
  const accentCyan = (cfg.secondaryColor as string) || '#39c5cf'
  const accentYellow = '#ffbd2e'
  const accentBlue = '#58a6ff'

  const isTransparent =
    !cfg.backgroundColor ||
    cfg.backgroundColor === 'transparent' ||
    cfg.backgroundColor === 'none' ||
    Boolean(cfg.transparentBackground) ||
    bg === 'transparent' ||
    bg === 'none'

  const BASE_WIDTH = 520
  const FONT_SIZE = 12
  const CHAR_W = 7.2
  const INNER_W = 64
  const BAR_W = 18
  const LINE_H = 17

  function buildCardLines(p: number): string[] {
    const namePad = Math.max(0, Math.floor((INNER_W - displayName.length) / 2))
    const centeredName =
      ' '.repeat(namePad) +
      `<tspan fill="${accentLime}" font-weight="bold">${escapeXml(displayName)}</tspan>`
    const centeredDash =
      ' '.repeat(namePad) + `<tspan fill="${textAsh}">${'─'.repeat(displayName.length)}</tspan>`

    const lines: string[] = [centeredName, centeredDash]

    if (showRoles && roles.length > 0) {
      roles.slice(0, 3).forEach((role) => {
        lines.push(`<tspan fill="${accentCyan}">${escapeXml(truncate(role, INNER_W - 2))}</tspan>`)
      })
    }

    const hasMeta = showLocation || showWebsite || showUptime
    if (hasMeta) {
      lines.push('')
      if (showLocation) {
        lines.push(
          `<tspan fill="${textAsh}">Location: </tspan><tspan fill="${accentYellow}">${escapeXml(truncate(location, INNER_W - 12))}</tspan>`
        )
      }
      if (showWebsite) {
        lines.push(
          `<tspan fill="${textAsh}">Website:  </tspan><tspan fill="${accentBlue}">${escapeXml(truncate(website, INNER_W - 12))}</tspan>`
        )
      }
      if (showUptime) {
        lines.push(
          `<tspan fill="${textAsh}">Uptime:   </tspan><tspan fill="${accentLime}">${escapeXml(truncate(uptime, INNER_W - 12))}</tspan>`
        )
      }
    }

    if (showMetrics) {
      const activeMetrics: Array<{ label: string; val: number; color: string }> = []
      if (showStars)
        activeMetrics.push({ label: 'Stars', val: Math.round(totalStars * p), color: accentYellow })
      if (showRepos)
        activeMetrics.push({ label: 'Repos', val: Math.round(publicRepos * p), color: textChalk })
      if (showFollowers)
        activeMetrics.push({ label: 'Followers', val: Math.round(followers * p), color: textChalk })
      if (showActivity)
        activeMetrics.push({
          label: 'Activity',
          val: Math.round(totalContributions * p),
          color: accentLime,
        })

      if (activeMetrics.length > 0) {
        lines.push('')
        lines.push(`<tspan fill="${accentCyan}" font-weight="bold">GITHUB METRICS</tspan>`)
        const colW = Math.max(8, Math.floor(INNER_W / activeMetrics.length))

        let headerStr = ''
        let valStr = ''
        activeMetrics.forEach((m, idx) => {
          const isLast = idx === activeMetrics.length - 1
          const labelPadded = isLast ? m.label : vPad(m.label, colW)
          const valPadded = isLast ? String(m.val) : vPad(String(m.val), colW)
          headerStr += `<tspan fill="${textAsh}">${labelPadded}</tspan>`
          valStr += `<tspan fill="${m.color}">${valPadded}</tspan>`
        })
        lines.push(headerStr)
        lines.push(valStr)
      }
    }

    if (showTopRepos) {
      lines.push('')
      lines.push(`<tspan fill="${accentCyan}" font-weight="bold">TOP REPOSITORIES</tspan>`)
      if (topRepos.length > 0) {
        topRepos.forEach((repo, i) => {
          const num = `<tspan fill="${textAsh}">0${i + 1}</tspan>`
          const repoNameW = Math.max(10, INNER_W - 20)
          const name = `<tspan fill="${accentBlue}">${vPad(truncate(repo.name, repoNameW), repoNameW + 1)}</tspan>`
          const repoStars = Math.round((repo.stargazers_count || 0) * p)
          const repoForks = Math.round((repo.forks_count || 0) * p)
          const star = `<tspan fill="${accentYellow}">★ ${repoStars}</tspan>`
          const fork = `<tspan fill="${textAsh}"> ⑂ ${repoForks}</tspan>`
          lines.push(`${num} ${name} ${vPad(star, 7)}${fork}`)
        })
      } else {
        lines.push(`<tspan fill="${textAsh}">No repositories selected</tspan>`)
      }
    }

    if (showLanguages) {
      lines.push('')
      lines.push(`<tspan fill="${accentCyan}" font-weight="bold">LANGUAGES</tspan>`)
      if (topLanguages.length > 0) {
        topLanguages.forEach(([lang, bytes]) => {
          const rawPct = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0
          const currentPct = rawPct * p
          const pctStr = `${Math.round(currentPct)}%`.padStart(4)
          const filled = Math.round((Math.min(currentPct, 100) / 100) * BAR_W)
          const bar = `[<tspan fill="${accentLime}">${'#'.repeat(filled)}</tspan><tspan fill="${textAsh}">${'─'.repeat(BAR_W - filled)}</tspan>]`
          const langW = Math.max(8, INNER_W - BAR_W - 10)
          const name = vPad(truncate(lang, langW), langW)
          lines.push(
            `<tspan fill="${accentCyan}">${name}</tspan> ${bar} <tspan fill="${accentLime}">${pctStr}</tspan>`
          )
        })
      } else {
        lines.push(`<tspan fill="${textAsh}">No language data</tspan>`)
      }
    }

    if (showTerminalPrompt) {
      lines.push('')
      lines.push(
        `<tspan fill="${accentLime}">@${escapeXml(username)}</tspan><tspan fill="${textAsh}">:~$</tspan> <tspan class="cursor" fill="${accentLime}">█</tspan>`
      )
    }

    return lines
  }

  const finalLines = buildCardLines(1)
  const totalContentHeight = (finalLines.length + 2) * LINE_H
  const BASE_HEIGHT = Math.max(440, totalContentHeight + 24)
  const startY = Math.max(16, Math.round((BASE_HEIGHT - totalContentHeight) / 2) + 12)
  const bottomY = startY + (finalLines.length + 1) * LINE_H

  const actualContentWidth = (INNER_W + 4) * CHAR_W
  const padX = Math.max(8, Math.round((BASE_WIDTH - actualContentWidth) / 2))

  const rawId = widget?.instanceId || 'premium-ascii-profile'
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '_')

  const isAnimated = cfg.animated !== false && !forceStatic

  let framesCss = `
    #${id} text {
      font-family: 'JetBrains Mono', 'Courier New', Consolas, monospace;
      font-size: ${FONT_SIZE}px;
      fill: ${textChalk};
      white-space: pre;
    }
    #${id} .cursor { animation: blink-${id} 0.8s infinite; }
    @keyframes blink-${id} {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
  `
  let framesXml = ''

  if (!isAnimated) {
    const rowsXml: string[] = []
    rowsXml.push(
      `<text x="${padX}" y="${startY}"><tspan fill="${borderColor}">┌${'─'.repeat(INNER_W + 2)}┐</tspan></text>`
    )
    finalLines.forEach((text, i) => {
      const y = startY + (i + 1) * LINE_H
      const visualLen = vLen(text)
      const paddingRight = ' '.repeat(Math.max(0, INNER_W + 1 - visualLen))
      rowsXml.push(
        `<text x="${padX}" y="${y}"><tspan fill="${borderColor}">│</tspan> ${text}${paddingRight}<tspan fill="${borderColor}">│</tspan></text>`
      )
    })
    rowsXml.push(
      `<text x="${padX}" y="${bottomY}"><tspan fill="${borderColor}">└${'─'.repeat(INNER_W + 2)}┘</tspan></text>`
    )
    framesXml = `<g>${rowsXml.join('\n    ')}</g>`
  } else {
    const FRAMES = 16
    const DUR = 1.6

    for (let f = 0; f < FRAMES; f++) {
      const p = f === FRAMES - 1 ? 1 : f / (FRAMES - 1)
      const currentLines = buildCardLines(p)
      const rowsXml: string[] = []

      rowsXml.push(
        `<text x="${padX}" y="${startY}"><tspan fill="${borderColor}">┌${'─'.repeat(INNER_W + 2)}┐</tspan></text>`
      )
      currentLines.forEach((text, i) => {
        const y = startY + (i + 1) * LINE_H
        const visualLen = vLen(text)
        const paddingRight = ' '.repeat(Math.max(0, INNER_W + 1 - visualLen))
        rowsXml.push(
          `<text x="${padX}" y="${y}"><tspan fill="${borderColor}">│</tspan> ${text}${paddingRight}<tspan fill="${borderColor}">│</tspan></text>`
        )
      })
      rowsXml.push(
        `<text x="${padX}" y="${bottomY}"><tspan fill="${borderColor}">└${'─'.repeat(INNER_W + 2)}┘</tspan></text>`
      )

      if (f === FRAMES - 1) {
        const startPct = ((f / FRAMES) * 100).toFixed(1)
        framesCss += `
    #${id} .frame-${f} { opacity: 0; animation: show-${id}-${f} ${DUR}s forwards; }
    @keyframes show-${id}-${f} { 0%, ${Number(startPct) - 0.01}% { opacity: 0; } ${startPct}%, 100% { opacity: 1; } }`
      } else {
        const startPct = ((f / FRAMES) * 100).toFixed(1)
        const endPct = (((f + 1) / FRAMES) * 100).toFixed(1)
        if (f === 0) {
          framesCss += `
    #${id} .frame-${f} { animation: show-${id}-${f} ${DUR}s forwards; }
    @keyframes show-${id}-${f} { 0%, ${Number(endPct) - 0.01}% { opacity: 1; } ${endPct}%, 100% { opacity: 0; } }`
        } else {
          framesCss += `
    #${id} .frame-${f} { opacity: 0; animation: show-${id}-${f} ${DUR}s forwards; }
    @keyframes show-${id}-${f} { 0%, ${Number(startPct) - 0.01}% { opacity: 0; } ${startPct}%, ${Number(endPct) - 0.01}% { opacity: 1; } ${endPct}%, 100% { opacity: 0; } }`
        }
      }

      framesXml += `  <g class="frame-${f}">\n    ${rowsXml.join('\n    ')}\n  </g>\n`
    }
  }

  const bgRect = isTransparent ? '' : `<rect width="100%" height="100%" fill="${bg}" rx="6"/>`

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  id="${id}"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}"
  preserveAspectRatio="xMidYMid meet"
  fill="none"
>
  <style>
    ${framesCss}
  </style>
  ${bgRect}
  ${framesXml}
</svg>`
}
