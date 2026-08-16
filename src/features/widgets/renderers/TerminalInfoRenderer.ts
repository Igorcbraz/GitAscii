import { escapeXml, formatUptime } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderTerminalInfo(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  _globalStyles: GlobalStyles
): string {
  const { width } = widget.size
  const cfg = widget.config

  const showMainSection = cfg.showMainSection !== false
  const showContactSection = cfg.showContactSection !== false
  const showStatsSection = cfg.showStatsSection !== false

  const showUptime = cfg.showUptime !== false
  const showLocation = cfg.showLocation !== false
  const showCompany = cfg.showCompany !== false
  const showLanguages = cfg.showLanguages !== false
  const showJoined = Boolean(cfg.showJoined)
  const showStatus = Boolean(cfg.showStatus)
  const showPronouns = Boolean(cfg.showPronouns)
  const showTimezone = Boolean(cfg.showTimezone)
  const showAchievements = Boolean(cfg.showAchievements)
  const showHighlights = Boolean(cfg.showHighlights)

  const showWebsite = cfg.showWebsite !== false
  const showGithub = cfg.showGithub !== false
  const showTwitter = Boolean(cfg.showTwitter)
  const showEmail = Boolean(cfg.showEmail)
  const showOrgs = Boolean(cfg.showOrgs)

  const showRepos = cfg.showRepos !== false
  const showStars = cfg.showStars !== false
  const showCommits = cfg.showCommits !== false
  const showFollowers = cfg.showFollowers !== false
  const showFollowing = Boolean(cfg.showFollowing)
  const showGists = Boolean(cfg.showGists)

  const dotLeaders = cfg.dotLeaders !== false

  const headerClr = (cfg.headerColor as string) || '#58a6ff'
  const labelClr = (cfg.labelColor as string) || '#ffa657'
  const dotClr = (cfg.dotColor as string) || '#484f58'
  const valClr = (cfg.valueColor as string) || '#c9d1d9'
  const statsValClr = (cfg.statsValColor as string) || '#79c0ff'
  const dividerClr = (cfg.dividerColor as string) || '#3d444d'

  const fontSize = 14
  const fontCharWidth = fontSize * 0.6
  const paddingX = 24
  const totalChars = Math.max(26, Math.floor((width - paddingX * 2) / fontCharWidth))
  const lineHeight = Math.max(18, Math.floor(fontSize * 1.35))

  const lines: string[] = []
  let currentY = 28

  if (showMainSection) {
    const titleStr = (cfg.customTitle as string) || `${data.user.login}@github`
    const dashesCount = Math.max(2, totalChars - 1 - (titleStr.length + 2))
    const dashesStr = '─'.repeat(dashesCount)

    lines.push(
      `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${dividerClr}">─</tspan><tspan fill="${headerClr}"> ${escapeXml(titleStr)} </tspan><tspan fill="${dividerClr}">${dashesStr}</tspan></text>`
    )
    currentY += lineHeight

    const mainItems: Array<{ label: string; val: string }> = []

    if (showUptime) {
      const uptimeVal = (cfg.customUptime as string) || formatUptime(data.user.created_at)
      if (uptimeVal) mainItems.push({ label: '. Uptime: ', val: ` ${uptimeVal}` })
    }
    if (showLocation) {
      const locVal = (cfg.customLocation as string) || data.user.location
      if (locVal) mainItems.push({ label: '. Location: ', val: ` ${locVal}` })
    }
    if (showCompany) {
      const compVal = (cfg.customCompany as string) || data.user.company
      if (compVal) mainItems.push({ label: '. Company: ', val: ` ${compVal}` })
    }
    if (showLanguages) {
      const topLangs =
        (cfg.customLanguages as string) ||
        (Object.keys(data.languages).length > 0
          ? Object.keys(data.languages).slice(0, 5).join(', ')
          : '')
      if (topLangs) mainItems.push({ label: '. Languages: ', val: ` ${topLangs}` })
    }
    if (showJoined) {
      const joinedVal =
        (cfg.customJoined as string) ||
        (data.user.created_at
          ? new Date(data.user.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })
          : '')
      if (joinedVal) mainItems.push({ label: '. Joined: ', val: ` ${joinedVal}` })
    }
    if (showStatus) {
      const statusVal = cfg.customStatus as string
      if (statusVal) mainItems.push({ label: '. Status: ', val: ` ${statusVal}` })
    }
    if (showPronouns) {
      const pronounsVal = cfg.customPronouns as string
      if (pronounsVal) mainItems.push({ label: '. Pronouns: ', val: ` ${pronounsVal}` })
    }
    if (showTimezone) {
      const tzVal = cfg.customTimezone as string
      if (tzVal) mainItems.push({ label: '. Timezone: ', val: ` ${tzVal}` })
    }
    if (showAchievements) {
      const achVal = cfg.customAchievements as string
      if (achVal) mainItems.push({ label: '. Achievements: ', val: ` ${achVal}` })
    }
    if (showHighlights) {
      const hlVal = cfg.customHighlights as string
      if (hlVal) mainItems.push({ label: '. Highlights: ', val: ` ${hlVal}` })
    }

    for (const item of mainItems) {
      const dotCount = dotLeaders
        ? Math.max(2, totalChars - item.label.length - item.val.length)
        : 2
      const dotsStr = dotLeaders ? '.'.repeat(dotCount) : '  '

      lines.push(
        `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${labelClr}">${escapeXml(item.label)}</tspan><tspan fill="${dotClr}">${dotsStr}</tspan><tspan fill="${valClr}">${escapeXml(item.val)}</tspan></text>`
      )
      currentY += lineHeight
    }
    currentY += 12
  }

  if (showContactSection) {
    const contactTitleStr = (cfg.customContactTitle as string) || 'Contact'
    const dashesCount = Math.max(2, totalChars - 1 - (contactTitleStr.length + 2))
    const dashesStr = '─'.repeat(dashesCount)

    lines.push(
      `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${dividerClr}">─</tspan><tspan fill="${headerClr}"> ${escapeXml(contactTitleStr)} </tspan><tspan fill="${dividerClr}">${dashesStr}</tspan></text>`
    )
    currentY += lineHeight

    const contactItems: Array<{ label: string; val: string }> = []

    if (showWebsite) {
      const webVal = (cfg.customWebsite as string) || data.user.blog
      if (webVal) contactItems.push({ label: '. Website: ', val: ` ${webVal}` })
    }
    if (showGithub) {
      const ghVal = (cfg.customGithub as string) || `github.com/${data.user.login}`
      if (ghVal) contactItems.push({ label: '. GitHub: ', val: ` ${ghVal}` })
    }
    if (showTwitter) {
      const twVal =
        (cfg.customTwitter as string) ||
        (data.user.twitter_username ? `@${data.user.twitter_username}` : '')
      if (twVal) contactItems.push({ label: '. Twitter: ', val: ` ${twVal}` })
    }
    if (showEmail) {
      const emVal = (cfg.customEmail as string) || data.user.email
      if (emVal) contactItems.push({ label: '. Email: ', val: ` ${emVal}` })
    }
    if (showOrgs) {
      const orgsVal = cfg.customOrgs as string
      if (orgsVal) contactItems.push({ label: '. Orgs: ', val: ` ${orgsVal}` })
    }

    for (const item of contactItems) {
      const dotCount = dotLeaders
        ? Math.max(2, totalChars - item.label.length - item.val.length)
        : 2
      const dotsStr = dotLeaders ? '.'.repeat(dotCount) : '  '

      lines.push(
        `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${labelClr}">${escapeXml(item.label)}</tspan><tspan fill="${dotClr}">${dotsStr}</tspan><tspan fill="${valClr}">${escapeXml(item.val)}</tspan></text>`
      )
      currentY += lineHeight
    }
    currentY += 12
  }

  if (showStatsSection) {
    const statsTitleStr = (cfg.customStatsTitle as string) || 'GitHub Stats'
    const dashesCount = Math.max(2, totalChars - 1 - (statsTitleStr.length + 2))
    const dashesStr = '─'.repeat(dashesCount)

    lines.push(
      `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${dividerClr}">─</tspan><tspan fill="${headerClr}"> ${escapeXml(statsTitleStr)} </tspan><tspan fill="${dividerClr}">${dashesStr}</tspan></text>`
    )
    currentY += lineHeight

    const statFields: Array<{ label: string; val: string }> = []

    if (showRepos) {
      statFields.push({ label: '. Repos: ', val: ` ${data.user.public_repos}` })
    }
    if (showStars) {
      statFields.push({ label: '. Stars: ', val: ` ${data.totalStars}` })
    }
    if (showCommits) {
      const commitCount =
        (cfg.customCommits as string) ||
        (data.contributions ? data.contributions.totalContributions.toLocaleString() : '')
      if (commitCount) statFields.push({ label: '. Commits: ', val: ` ${commitCount}` })
    }
    if (showFollowers) {
      statFields.push({ label: '. Followers: ', val: ` ${data.user.followers}` })
    }
    if (showFollowing) {
      const followingCount =
        (cfg.customFollowing as string) ||
        (data.user.following !== undefined ? data.user.following.toLocaleString() : '')
      if (followingCount) statFields.push({ label: '. Following: ', val: ` ${followingCount}` })
    }
    if (showGists) {
      const gistsCount =
        (cfg.customGists as string) ||
        (data.user.public_gists !== undefined ? data.user.public_gists.toLocaleString() : '')
      if (gistsCount) statFields.push({ label: '. Gists: ', val: ` ${gistsCount}` })
    }

    for (let i = 0; i < statFields.length; i += 2) {
      const item1 = statFields[i]
      const item2 = statFields[i + 1]

      if (item1 && item2) {
        const halfChars = Math.floor((totalChars - 3) / 2)
        const dots1 = dotLeaders
          ? Math.max(2, halfChars - item1.label.length - item1.val.length)
          : 2
        const dots2 = dotLeaders
          ? Math.max(2, halfChars - item2.label.length - item2.val.length)
          : 2

        lines.push(
          `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${labelClr}">${escapeXml(item1.label)}</tspan><tspan fill="${dotClr}">${'.'.repeat(dots1)}</tspan><tspan fill="${statsValClr}">${escapeXml(item1.val)}</tspan><tspan fill="${dividerClr}"> | </tspan><tspan fill="${labelClr}">${escapeXml(item2.label)}</tspan><tspan fill="${dotClr}">${'.'.repeat(dots2)}</tspan><tspan fill="${statsValClr}">${escapeXml(item2.val)}</tspan></text>`
        )
      } else if (item1) {
        const dots1 = dotLeaders
          ? Math.max(2, totalChars - item1.label.length - item1.val.length)
          : 2
        lines.push(
          `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${labelClr}">${escapeXml(item1.label)}</tspan><tspan fill="${dotClr}">${'.'.repeat(dots1)}</tspan><tspan fill="${statsValClr}">${escapeXml(item1.val)}</tspan></text>`
        )
      }
      currentY += lineHeight
    }
  }

  return lines.join('\n')
}
