import { describe, expect, it } from 'vitest'

import type { NormalizedGitHubData } from '@/engine/types'

import {
  DEFAULT_SELECTED_SOCIALS,
  DEFAULT_SELECTED_TECHS,
  detectSocialsFromProfile,
  detectTechStackFromProfile,
} from './profileAutoDetection'

describe('Profile Auto-Detection (Socials & Tech Stack)', () => {
  const baseUser: NormalizedGitHubData['user'] = {
    id: 123456,
    login: 'testdev',
    name: 'Test Developer',
    avatar_url: 'https://avatars.githubusercontent.com/u/123456',
    bio: 'Fullstack developer passionate about open source.',
    company: 'Acme Corp',
    location: 'San Francisco, CA',
    blog: null,
    twitter_username: null,
    email: null,
    public_repos: 15,
    public_gists: 2,
    followers: 120,
    following: 45,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }

  describe('detectSocialsFromProfile', () => {
    it('returns default fallback socials when no socials or README content are available', () => {
      const data: NormalizedGitHubData = {
        user: { ...baseUser },
        repos: [],
        languages: {},
        totalStars: 0,
        totalForks: 0,
        readmeContent: null,
      }

      const result = detectSocialsFromProfile(data)
      expect(result.selectedSocials).toEqual(DEFAULT_SELECTED_SOCIALS)
      expect(result.socialUrls.github).toBe('https://github.com/testdev')
    })

    it('detects twitter and email from user profile metadata and selects only those with github', () => {
      const data: NormalizedGitHubData = {
        user: {
          ...baseUser,
          twitter_username: 'my_x_handle',
          email: 'dev@example.com',
        },
        repos: [],
        languages: {},
        totalStars: 0,
        totalForks: 0,
        readmeContent: null,
      }

      const result = detectSocialsFromProfile(data)
      expect(result.selectedSocials).toEqual(['github', 'twitter', 'email'])
      expect(result.socialUrls.github).toBe('https://github.com/testdev')
      expect(result.socialUrls.twitter).toBe('https://x.com/my_x_handle')
      expect(result.socialUrls.email).toBe('mailto:dev@example.com')
    })

    it('detects social accounts from GitHub social_accounts API endpoint', () => {
      const data: NormalizedGitHubData = {
        user: { ...baseUser },
        repos: [],
        languages: {},
        totalStars: 0,
        totalForks: 0,
        readmeContent: null,
        socialAccounts: [
          { provider: 'linkedin', url: 'https://www.linkedin.com/in/igorcbraz/' },
          { provider: 'youtube', url: 'https://youtube.com/@igorcbraz' },
          { provider: 'generic', url: 'https://igorcbraz.dev' },
        ],
      }

      const result = detectSocialsFromProfile(data)
      expect(result.selectedSocials).toContain('github')
      expect(result.selectedSocials).toContain('linkedin')
      expect(result.selectedSocials).toContain('youtube')
      expect(result.selectedSocials).toContain('website')
      expect(result.socialUrls.linkedin).toBe('https://www.linkedin.com/in/igorcbraz/')
      expect(result.socialUrls.youtube).toBe('https://youtube.com/@igorcbraz')
      expect(result.socialUrls.website).toBe('https://igorcbraz.dev')
    })

    it('detects linkedin, personal portfolio website, discord, youtube from user.blog and README links', () => {
      const data: NormalizedGitHubData = {
        user: {
          ...baseUser,
          blog: 'https://linkedin.com/in/testdev-pro',
        },
        repos: [],
        languages: {},
        totalStars: 0,
        totalForks: 0,
        readmeContent: `
          # Hi there 👋
          - 🌐 Check out my portfolio: https://testdev.dev
          - 💬 Join my discord server: https://discord.gg/cooldevs
          - 📺 Subscribe to my YouTube: [YouTube Channel](https://youtube.com/@testdev_codes)
          - 🐦 Twitter: [Follow me](https://x.com/testdev_tweet)
        `,
      }

      const result = detectSocialsFromProfile(data)
      expect(result.selectedSocials).toContain('github')
      expect(result.selectedSocials).toContain('linkedin')
      expect(result.selectedSocials).toContain('website')
      expect(result.selectedSocials).toContain('discord')
      expect(result.selectedSocials).toContain('youtube')
      expect(result.selectedSocials).toContain('twitter')

      expect(result.socialUrls.linkedin).toBe('https://linkedin.com/in/testdev-pro')
      expect(result.socialUrls.website).toBe('https://testdev.dev')
      expect(result.socialUrls.discord).toBe('https://discord.gg/cooldevs')
      expect(result.socialUrls.youtube).toBe('https://youtube.com/@testdev_codes')
      expect(result.socialUrls.twitter).toBe('https://x.com/testdev_tweet')
    })

    it('detects shields.io badges in README markdown', () => {
      const data: NormalizedGitHubData = {
        user: { ...baseUser },
        repos: [],
        languages: {},
        totalStars: 0,
        totalForks: 0,
        readmeContent: `
          [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/custom-link)
          [![Twitch](https://img.shields.io/badge/Twitch-9146FF?style=for-the-badge&logo=twitch&logoColor=white)](https://twitch.tv/streamerdev)
        `,
      }

      const result = detectSocialsFromProfile(data)
      expect(result.selectedSocials).toContain('github')
      expect(result.selectedSocials).toContain('linkedin')
      expect(result.selectedSocials).toContain('twitch')
      expect(result.socialUrls.linkedin).toBe('https://linkedin.com/in/custom-link')
      expect(result.socialUrls.twitch).toBe('https://twitch.tv/streamerdev')
    })
  })

  describe('detectTechStackFromProfile', () => {
    it('returns default fallback tech stack when no languages or README are available', () => {
      const data: NormalizedGitHubData = {
        user: { ...baseUser },
        repos: [],
        languages: {},
        totalStars: 0,
        totalForks: 0,
        readmeContent: null,
      }

      const result = detectTechStackFromProfile(data)
      expect(result).toEqual(DEFAULT_SELECTED_TECHS)
    })

    it('detects technologies from repo languages sorted by frequency', () => {
      const data: NormalizedGitHubData = {
        user: { ...baseUser },
        repos: [],
        languages: {
          TypeScript: 12,
          Python: 8,
          Rust: 4,
          Go: 2,
        },
        totalStars: 10,
        totalForks: 2,
        readmeContent: null,
      }

      const result = detectTechStackFromProfile(data)
      expect(result).toEqual(['ts', 'py', 'rust', 'go'])
    })

    it('parses skillicons.dev URL in README', () => {
      const data: NormalizedGitHubData = {
        user: { ...baseUser },
        repos: [],
        languages: { TypeScript: 5 },
        totalStars: 5,
        totalForks: 0,
        readmeContent: `
          ## My Skills
          <img src="https://skillicons.dev/icons?i=react,nextjs,tailwind,nodejs,postgres,docker,git" />
        `,
      }

      const result = detectTechStackFromProfile(data)
      expect(result).toContain('ts')
      expect(result).toContain('react')
      expect(result).toContain('nextjs')
      expect(result).toContain('tailwind')
      expect(result).toContain('nodejs')
      expect(result).toContain('postgres')
      expect(result).toContain('docker')
      expect(result).toContain('git')
    })

    it('parses shields.io logo badges and text keywords from README and repos', () => {
      const data: NormalizedGitHubData = {
        user: { ...baseUser },
        repos: [
          {
            id: 1,
            name: 'fastapi-backend',
            full_name: 'testdev/fastapi-backend',
            description: 'Modern REST API using FastAPI and MongoDB with Redis cache',
            html_url: 'https://github.com/testdev/fastapi-backend',
            stargazers_count: 10,
            forks_count: 1,
            language: 'Python',
            fork: false,
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
        languages: { Python: 3 },
        totalStars: 10,
        totalForks: 1,
        readmeContent: `
          ### Tech Stack
          ![Vue.js](https://img.shields.io/badge/vue.js-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
          ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
          We also build with Spring Boot, Kubernetes and AWS.
        `,
      }

      const result = detectTechStackFromProfile(data)
      expect(result).toContain('py')
      expect(result).toContain('fastapi')
      expect(result).toContain('mongodb')
      expect(result).toContain('redis')
      expect(result).toContain('vue')
      expect(result).toContain('supabase')
      expect(result).toContain('spring')
      expect(result).toContain('kubernetes')
      expect(result).toContain('aws')
    })

    it('detects technologies from repository topics and individual languages', () => {
      const data: NormalizedGitHubData = {
        user: { ...baseUser },
        repos: [
          {
            id: 1,
            name: 'frontend-app',
            full_name: 'testdev/frontend-app',
            description: null,
            html_url: 'https://github.com/testdev/frontend-app',
            stargazers_count: 5,
            forks_count: 0,
            language: 'TypeScript',
            topics: ['react', 'tailwindcss', 'vite', 'storybook', 'playwright', 'cypress'],
            languages: ['TypeScript', 'CSS', 'HTML'],
            fork: false,
            updated_at: '2026-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'backend-service',
            full_name: 'testdev/backend-service',
            description: null,
            html_url: 'https://github.com/testdev/backend-service',
            stargazers_count: 8,
            forks_count: 1,
            language: 'Go',
            topics: ['docker', 'kubernetes', 'postgresql', 'prisma', 'redis', 'graphql'],
            languages: ['Go', 'Dockerfile'],
            fork: false,
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
        languages: { TypeScript: 10, Go: 5 },
        totalStars: 13,
        totalForks: 1,
        readmeContent: null,
      }

      const result = detectTechStackFromProfile(data)
      expect(result).toContain('ts')
      expect(result).toContain('go')
      expect(result).toContain('css')
      expect(result).toContain('html')
      expect(result).toContain('docker')
      expect(result).toContain('react')
      expect(result).toContain('tailwind')
      expect(result).toContain('vite')
      expect(result).toContain('storybook')
      expect(result).toContain('playwright')
      expect(result).toContain('cypress')
      expect(result).toContain('kubernetes')
      expect(result).toContain('postgres')
      expect(result).toContain('prisma')
      expect(result).toContain('redis')
      expect(result).toContain('graphql')
    })
  })
})
