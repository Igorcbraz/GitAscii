import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderRepositories(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width } = widget.size
  const cfg = widget.config
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#c5ff4a'

  const selectedRepos: string[] = Array.isArray(cfg.selectedRepos)
    ? (cfg.selectedRepos as string[])
    : []
  const maxRepos = Number(cfg.maxRepos) || 3
  const repoViewMode = (cfg.repoViewMode as string) || 'list'
  const repoSortBy = (cfg.repoSortBy as string) || 'stars'
  const showRepoLanguage = cfg.showRepoLanguage !== false
  const showRepoForks = Boolean(cfg.showRepoForks)

  let repoList = [...data.repos].filter((r) => !r.fork)

  if (selectedRepos.length > 0) {
    const ordered = selectedRepos
      .map((name) => repoList.find((r) => r.name === name))
      .filter(Boolean) as typeof repoList
    const rest = repoList.filter((r) => !selectedRepos.includes(r.name))
    repoList = [...ordered, ...rest]
  } else {
    if (repoSortBy === 'updated') {
      repoList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    } else if (repoSortBy === 'forks') {
      repoList.sort((a, b) => b.forks_count - a.forks_count)
    } else if (repoSortBy === 'name') {
      repoList.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      repoList.sort((a, b) => b.stargazers_count - a.stargazers_count)
    }
  }

  const repos = repoList.slice(0, maxRepos)

  if (repoViewMode === 'grid') {
    const cols = 2
    const cardW = Math.floor((width - 48 - 12) / cols)
    const cardH = 80
    const gapY = 12

    return `
      <text x="24" y="32" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ FEATURED REPOSITORIES ]</text>
      ${repos
        .map(
          (repo, i) => `
        <g transform="translate(${24 + (i % cols) * (cardW + 12)}, ${50 + Math.floor(i / cols) * (cardH + gapY)})">
          <rect x="0" y="0" width="${cardW}" height="${cardH}" fill="#1e1e1e" rx="4" />
          <rect x="0" y="0" width="4" height="${cardH}" fill="${accent}" rx="2" />
          <text x="12" y="20" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="500" fill="${accent}">${escapeXml(repo.name.length > 18 ? repo.name.slice(0, 16) + '…' : repo.name)}</text>
          <text x="${cardW - 8}" y="20" text-anchor="end" font-family="'Inter Tight', sans-serif" font-size="11" fill="#7a7a7a">★ ${repo.stargazers_count}</text>
          <text x="12" y="38" font-family="'Inter Tight', sans-serif" font-size="10" fill="#7a7a7a">${escapeXml((repo.description || 'No description.').slice(0, 40) + ((repo.description || '').length > 40 ? '…' : ''))}</text>
          ${showRepoLanguage && repo.language ? `<text x="12" y="${cardH - 10}" font-family="'Inter Tight', sans-serif" font-size="10" fill="${accent}">${escapeXml(repo.language)}</text>` : ''}
          ${showRepoForks ? `<text x="${cardW - 8}" y="${cardH - 10}" text-anchor="end" font-family="'Inter Tight', sans-serif" font-size="10" fill="#7a7a7a">⑂ ${repo.forks_count}</text>` : ''}
        </g>
      `
        )
        .join('')}
    `
  }

  const showRepoStars = cfg.showRepoStars !== false
  const showRepoDesc = cfg.showRepoDesc !== false
  const showRepoUpdated = Boolean(cfg.showRepoUpdated)

  const metaLineNeeded = showRepoLanguage || showRepoForks || showRepoStars || showRepoUpdated
  const cardH = 24 + (showRepoDesc ? 18 : 0) + (metaLineNeeded ? 18 : 0) + 8
  const rowSpacing = cardH + 8

  return `
    <text x="24" y="32" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ FEATURED REPOSITORIES ]</text>
    ${repos
      .map((repo, i) => {
        const gy = 50 + i * rowSpacing
        const metaParts: string[] = []
        if (showRepoLanguage && repo.language) metaParts.push(repo.language)
        if (showRepoStars) metaParts.push(`\u2605 ${repo.stargazers_count}`)
        if (showRepoForks) metaParts.push(`\u2442 ${repo.forks_count}`)
        if (showRepoUpdated) {
          const d = new Date(repo.updated_at)
          metaParts.push(
            `Updated ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          )
        }
        const metaStr = escapeXml(metaParts.join('  '))

        let yOff = 20
        const nameRow = `<text x="12" y="${yOff}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="500" fill="${accent}">${escapeXml(repo.name.length > 36 ? repo.name.slice(0, 34) + '\u2026' : repo.name)}</text>`
        yOff += showRepoDesc ? 18 : 0
        const descRow = showRepoDesc
          ? `<text x="12" y="${yOff}" font-family="'Inter Tight', sans-serif" font-size="10" fill="#7a7a7a">${escapeXml((repo.description || 'No description.').slice(0, 68) + ((repo.description || '').length > 68 ? '\u2026' : ''))}</text>`
          : ''
        yOff += metaLineNeeded ? 18 : 0
        const metaRow = metaLineNeeded
          ? `<text x="12" y="${yOff}" font-family="'Inter Tight', sans-serif" font-size="10" fill="${accent}">${metaStr}</text>`
          : ''

        return `
      <g transform="translate(24, ${gy})">
        <rect x="0" y="0" width="${width - 48}" height="${cardH}" fill="#1e1e1e" rx="4" />
        <rect x="0" y="0" width="3" height="${cardH}" fill="${accent}" rx="1" />
        ${nameRow}${descRow}${metaRow}
      </g>`
      })
      .join('')}
  `
}
