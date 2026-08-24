import { APP_URL } from '../../../constants'
import type { NormalizedGitHubData } from '../types/github'

export function getMockGitHubData(username: string): NormalizedGitHubData {
  const result: NormalizedGitHubData = {
    user: {
      id: 40432351,
      login: username || 'Igorcbraz',
      name: 'Igor Braz',
      avatar_url: 'https://avatars.githubusercontent.com/u/40432351?v=4',
      bio: 'Full Stack Software Engineer & Open Source Creator. Building high performance tools.',
      company: '@GitAscii',
      location: 'Brazil',
      blog: APP_URL,
      twitter_username: 'igorcbraz',
      public_repos: 38,
      public_gists: 12,
      followers: 420,
      following: 180,
      created_at: '2018-06-15T00:00:00Z',
      updated_at: new Date().toISOString(),
    },
    repos: [
      {
        id: 101,
        name: 'GitAscii',
        full_name: `${username}/GitAscii`,
        description: 'Platform for creating GitHub profile READMEs through SVG and ASCII art.',
        html_url: `https://github.com/${username}/GitAscii`,
        stargazers_count: 340,
        forks_count: 45,
        language: 'TypeScript',
        fork: false,
        updated_at: new Date().toISOString(),
      },
      {
        id: 102,
        name: 'antigravity-ui',
        full_name: `${username}/antigravity-ui`,
        description:
          'Design system tokens and components for high aesthetic dark web applications.',
        html_url: `https://github.com/${username}/antigravity-ui`,
        stargazers_count: 128,
        forks_count: 18,
        language: 'TypeScript',
        fork: false,
        updated_at: new Date().toISOString(),
      },
      {
        id: 103,
        name: 'ascii-engine',
        full_name: `${username}/ascii-engine`,
        description: 'High performance image to ASCII art converter for Web and Node.',
        html_url: `https://github.com/${username}/ascii-engine`,
        stargazers_count: 95,
        forks_count: 12,
        language: 'Rust',
        fork: false,
        updated_at: new Date().toISOString(),
      },
    ],
    languages: {
      TypeScript: 887796,
      JavaScript: 509219,
      Rust: 178925,
      CSS: 92848,
      Python: 80274,
    },
    totalStars: 563,
    totalForks: 75,
    activityMetrics: {
      totalCommits: 450,
      totalPullRequests: 28,
      totalIssues: 14,
      totalReviews: 9,
      totalDiscussions: 5,
      repositoriesCreated: 38,
      totalForks: 75,
    },
    contributions: generateMockContributions(),
  }

  const contributions = result.contributions || generateMockContributions()
  const habits = {
    peakDayOfWeek: 'Thursday',
    peakMonth: 'August',
    peakHour: 21,
    averageCommitHour: 19,
    morningPercent: 20,
    afternoonPercent: 35,
    eveningPercent: 30,
    nightPercent: 15,
    isNightOwl: true,
    mostProductiveDay: 'Friday (35 commits)',
    mostProductiveWeek: 'Annual peak week',
    mostProductiveMonth: 'August',
  }
  const languageBreakdown = {
    ranking: [
      { name: 'TypeScript', bytes: 887796, percentage: 51, repoCount: 22 },
      { name: 'JavaScript', bytes: 509219, percentage: 29, repoCount: 10 },
      { name: 'Rust', bytes: 178925, percentage: 10, repoCount: 4 },
      { name: 'CSS', bytes: 92848, percentage: 5, repoCount: 3 },
      { name: 'Python', bytes: 80274, percentage: 5, repoCount: 2 },
    ],
    dominantLanguage: 'TypeScript',
    fastestGrowing: 'Rust',
    recentLanguage: 'TypeScript',
  }
  const derivedInsights = [
    {
      id: 'night-owl',
      title: 'Night Owl Developer Schedule',
      subtitle: 'Over 65% of commits occur after 6 PM',
      category: 'behavior' as const,
      icon: '▸',
    },
    {
      id: 'top-impact',
      title: 'Flagship Project: GitAscii',
      subtitle: 'Concentrates 60% of all repository stars',
      category: 'impact' as const,
      icon: '★',
    },
    {
      id: 'peak-day',
      title: 'Peak Coding Cadence: Thursdays',
      subtitle: 'Highest cumulative weekly commit throughput',
      category: 'behavior' as const,
      icon: '>',
    },
    {
      id: 'dominant-language',
      title: 'Core Technology: TypeScript',
      subtitle: 'Dominates 51% of all public open-source code',
      category: 'language' as const,
      icon: '#',
    },
    {
      id: 'account-longevity',
      title: '8+ Years Open Source Track Record',
      subtitle: 'Active public development since 2018',
      category: 'longevity' as const,
      icon: '★',
    },
  ]
  const developerScores = {
    activityScore: 87,
    openSourceScore: 92,
    communityScore: 71,
    consistencyScore: 94,
    impactScore: 83,
    growthScore: 89,
    maintenanceScore: 85,
    projectHealthScore: 90,
    contributionScore: 88,
    totalDeveloperScore: 86,
    tierGrade: 'A+' as const,
  }
  const developerDna = {
    traits: [
      { name: 'Builder', percentage: 92 },
      { name: 'Maintainer', percentage: 84 },
      { name: 'Open Source', percentage: 79 },
      { name: 'Community', percentage: 61 },
      { name: 'Explorer', percentage: 88 },
    ],
    primaryArchetype: '> THE BUILDER',
    archetypeDescription:
      'Specialized in transforming ideas into architecture and production systems.',
  }
  const codingVelocity = {
    commitsPerMonth: 143,
    prsPerMonth: 37,
    issuesPerMonth: 18,
    reviewsPerMonth: 8,
    avgCommitsPerDay: 4.7,
    metrics: [
      { id: 'commits', label: 'Commits/month', value: 143, max: 150 },
      { id: 'prs', label: 'PRs/month', value: 37, max: 45 },
      { id: 'issues', label: 'Issues/month', value: 18, max: 25 },
    ],
  }

  result.habits = habits
  result.languageBreakdown = languageBreakdown
  result.derivedInsights = derivedInsights
  result.developerScores = developerScores
  result.developerDna = developerDna
  result.codingVelocity = codingVelocity

  return result
}

export function generateMockContributions() {
  const weeks = []
  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  const start = new Date(oneYearAgo)
  start.setDate(start.getDate() - start.getDay())

  const currentDate = new Date(start)
  let totalContributions = 0

  for (let w = 0; w < 53; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const rand = Math.random()
      let count = 0
      if (rand > 0.45) count = Math.floor(Math.random() * 4)
      if (rand > 0.82) count = Math.floor(Math.random() * 12)
      if (rand > 0.96) count = Math.floor(Math.random() * 35)

      let color = '#161b22'
      if (count > 0) color = '#0e4429'
      if (count > 4) color = '#006d32'
      if (count > 10) color = '#26a641'
      if (count > 20) color = '#39d353'

      totalContributions += count
      days.push({
        color,
        contributionCount: count,
        date: dateStr,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push({ contributionDays: days })
  }

  return {
    totalContributions,
    weeks,
  }
}
