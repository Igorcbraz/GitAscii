import { APP_URL } from '../../../constants'
import type { NormalizedGitHubData } from '../types/github'

export function getMockGitHubData(username: string): NormalizedGitHubData {
  return {
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
      TypeScript: 14,
      JavaScript: 8,
      Rust: 4,
      CSS: 3,
      Python: 2,
    },
    totalStars: 563,
    totalForks: 75,
    contributions: generateMockContributions(),
  }
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
