import type { DeveloperScores, GitHubRepo, GitHubUser, NormalizedGitHubData } from '../types/github'

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)))
}

export function calculateDeveloperScores(
  user: GitHubUser,
  repos: GitHubRepo[] = [],
  contributionsTotal = 0,
  weeks: Array<{ contributionDays: Array<{ contributionCount: number; date: string }> }> = [],
  totalStars = 0,
  totalForks = 0,
  activityMetrics?: NormalizedGitHubData['activityMetrics']
): DeveloperScores {
  const publicRepos = Number(user?.public_repos) || repos.length || 0
  const followers = Number(user?.followers) || 0
  const following = Number(user?.following) || 0
  const commits = activityMetrics?.totalCommits || contributionsTotal || 0
  const prs = activityMetrics?.totalPullRequests || 0
  const issues = activityMetrics?.totalIssues || 0
  const reviews = activityMetrics?.totalReviews || 0
  const discussions = activityMetrics?.totalDiscussions || 0

  const activeDaysCount = weeks.reduce((acc, w) => {
    return acc + (w.contributionDays || []).filter((d) => (d?.contributionCount || 0) > 0).length
  }, 0)
  const commitWeight = Math.min(60, (commits / 500) * 60)
  const activeDaysWeight = Math.min(40, (activeDaysCount / 120) * 40)
  const activityScore = clamp(commitWeight + activeDaysWeight)

  const repoScore = Math.min(40, (publicRepos / 25) * 40)
  const forkScore = Math.min(30, (totalForks / 20) * 30)
  const prScore = Math.min(30, (prs / 15) * 30)
  const openSourceScore = clamp(repoScore + forkScore + prScore + (publicRepos > 0 ? 15 : 0))

  const followerWeight = Math.min(45, Math.log10(Math.max(1, followers)) * 22.5)
  const reviewWeight = Math.min(30, (reviews / 10) * 30)
  const issueDiscWeight = Math.min(25, ((issues + discussions) / 15) * 25)
  const communityScore = clamp(
    followerWeight + reviewWeight + issueDiscWeight + (following > 0 ? 5 : 0)
  )

  const activeWeeks = weeks.filter((w) =>
    (w.contributionDays || []).some((d) => (d?.contributionCount || 0) > 0)
  ).length
  const totalWeeks = Math.max(1, weeks.length)
  const consistencyScore = clamp((activeWeeks / totalWeeks) * 100)

  const starWeight = Math.min(60, Math.log10(Math.max(1, totalStars + 1)) * 25)
  const topRepo = repos.reduce((max, r) => Math.max(max, r.stargazers_count || 0), 0)
  const topRepoWeight = Math.min(40, Math.log10(Math.max(1, topRepo + 1)) * 20)
  const impactScore = clamp(starWeight + topRepoWeight + (totalStars > 0 ? 10 : 0))

  const createdAt = user?.created_at ? new Date(user.created_at) : new Date()
  const ageYears = Math.max(
    0.1,
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )
  const yearlyVelocity = commits / Math.max(1, Math.min(ageYears, 3))
  const growthScore = clamp(Math.min(100, (yearlyVelocity / 300) * 85 + (totalStars > 10 ? 15 : 5)))

  const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000
  const activeRecentlyRepos = repos.filter((r) => {
    const updated = r.updated_at ? new Date(r.updated_at).getTime() : 0
    return updated > sixMonthsAgo
  }).length
  const maintenanceScore = clamp(
    publicRepos === 0
      ? 50
      : (activeRecentlyRepos / Math.min(publicRepos, 10)) * 70 + (publicRepos > 0 ? 30 : 0)
  )

  const healthyRepos = repos.filter(
    (r) => (r.description && r.description.trim().length > 5) || (r.topics && r.topics.length > 0)
  ).length
  const projectHealthScore = clamp(
    publicRepos === 0 ? 60 : (healthyRepos / Math.min(publicRepos, 10)) * 100
  )

  const contributionDiversity = [
    commits > 0 ? 25 : 0,
    prs > 0 ? 25 : 0,
    issues > 0 ? 25 : 0,
    reviews > 0 ? 25 : 0,
  ].reduce((a, b) => a + b, 0)
  const contributionScore = clamp(
    contributionDiversity * 0.4 + activityScore * 0.4 + openSourceScore * 0.2
  )

  const totalDeveloperScore = clamp(
    activityScore * 0.2 +
      openSourceScore * 0.15 +
      communityScore * 0.1 +
      consistencyScore * 0.15 +
      impactScore * 0.2 +
      growthScore * 0.1 +
      maintenanceScore * 0.1
  )

  let tierGrade: DeveloperScores['tierGrade'] = 'B'
  if (totalDeveloperScore >= 95) tierGrade = 'S+'
  else if (totalDeveloperScore >= 90) tierGrade = 'S'
  else if (totalDeveloperScore >= 85) tierGrade = 'A+'
  else if (totalDeveloperScore >= 75) tierGrade = 'A'
  else if (totalDeveloperScore >= 60) tierGrade = 'B'
  else tierGrade = 'C'

  return {
    activityScore,
    openSourceScore,
    communityScore,
    consistencyScore,
    impactScore,
    growthScore,
    maintenanceScore,
    projectHealthScore,
    contributionScore,
    totalDeveloperScore,
    tierGrade,
  }
}

export function calculateDeveloperDNA(
  user: GitHubUser,
  repos: GitHubRepo[] = [],
  contributionsTotal = 0,
  totalStars = 0,
  languages: Record<string, number> = {}
): import('../types/github').DeveloperDNA {
  const publicRepos = Number(user?.public_repos) || repos.length || 0
  const nonForkRepos = repos.filter((r) => !r.fork).length
  const langCount = Object.keys(languages || {}).length

  let accountYears = 1
  if (user?.created_at) {
    const created = new Date(user.created_at)
    accountYears = Math.max(1, new Date().getFullYear() - created.getFullYear())
  }

  const builderScore = clamp(60 + nonForkRepos * 2 + Math.min(20, contributionsTotal / 40))
  const maintainerScore = clamp(55 + accountYears * 4 + Math.min(25, repos.length * 1.5))
  const openSourceScore = clamp(50 + Math.min(30, totalStars / 5) + Math.min(20, publicRepos * 1.2))
  const communityScore = clamp(
    45 + Math.min(35, (user?.followers || 0) * 1.5) + Math.min(20, user?.following || 0)
  )
  const explorerScore = clamp(50 + langCount * 7 + Math.min(20, repos.length))

  const traits = [
    { name: 'Builder', percentage: builderScore },
    { name: 'Maintainer', percentage: maintainerScore },
    { name: 'Open Source', percentage: openSourceScore },
    { name: 'Community', percentage: communityScore },
    { name: 'Explorer', percentage: explorerScore },
  ]

  const sorted = [...traits].sort((a, b) => b.percentage - a.percentage)
  const topTrait = sorted[0]?.name || 'Builder'

  let primaryArchetype = '> THE BUILDER'
  let archetypeDescription =
    'Specialized in transforming ideas into architecture and production systems.'

  switch (topTrait) {
    case 'Maintainer':
      primaryArchetype = '> THE MAINTAINER'
      archetypeDescription =
        'Specialized in long-term system stability, refactoring and repository stewardship.'
      break
    case 'Open Source':
      primaryArchetype = '> THE OPEN SOURCE CRAFTSMAN'
      archetypeDescription =
        'Specialized in public collaboration, tooling and community-driven development.'
      break
    case 'Community':
      primaryArchetype = '> THE COMMUNITY LEADER'
      archetypeDescription =
        'Specialized in developer engagement, technical leadership and mentorship.'
      break
    case 'Explorer':
      primaryArchetype = '> THE TECH EXPLORER'
      archetypeDescription =
        'Specialized in polyglot development, emerging frameworks and rapid experimentation.'
      break
    default:
      primaryArchetype = '> THE BUILDER'
      archetypeDescription =
        'Specialized in rapid prototyping, full-stack architecture and feature execution.'
  }

  return {
    traits,
    primaryArchetype,
    archetypeDescription,
  }
}

export function calculateCodingVelocity(
  activityMetrics?: Partial<import('../types/github').ActivityMetrics>,
  contributionsTotal = 0
): import('../types/github').CodingVelocity {
  const annualCommits = activityMetrics?.totalCommits || contributionsTotal || 520
  const annualPrs =
    activityMetrics?.totalPullRequests || Math.max(1, Math.round(annualCommits * 0.12))
  const annualIssues = activityMetrics?.totalIssues || Math.max(1, Math.round(annualCommits * 0.06))
  const annualReviews =
    activityMetrics?.totalReviews || Math.max(0, Math.round(annualCommits * 0.04))

  const commitsPerMonth = Math.max(1, Math.round(annualCommits / 12))
  const prsPerMonth = Math.max(1, Math.round(annualPrs / 12))
  const issuesPerMonth = Math.max(1, Math.round(annualIssues / 12))
  const reviewsPerMonth = Math.max(0, Math.round(annualReviews / 12))

  const avgCommitsPerDay = +(annualCommits / 365).toFixed(1)

  const maxVal = Math.max(commitsPerMonth, 150)
  const metrics = [
    { id: 'commits', label: 'Commits/month', value: commitsPerMonth, max: maxVal },
    { id: 'prs', label: 'PRs/month', value: prsPerMonth, max: Math.max(40, prsPerMonth * 1.2) },
    {
      id: 'issues',
      label: 'Issues/month',
      value: issuesPerMonth,
      max: Math.max(25, issuesPerMonth * 1.2),
    },
  ]

  return {
    commitsPerMonth,
    prsPerMonth,
    issuesPerMonth,
    reviewsPerMonth,
    avgCommitsPerDay,
    metrics,
  }
}
