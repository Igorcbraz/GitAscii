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
  }
}
