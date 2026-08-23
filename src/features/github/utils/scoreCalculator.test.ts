import { describe, expect, it } from 'vitest'

import type { GitHubRepo, GitHubUser } from '../types/github'
import {
  calculateDerivedInsights,
  calculateLanguageBreakdown,
  calculateTemporalHabits,
} from './insightsCalculator'
import {
  calculateCodingVelocity,
  calculateDeveloperDNA,
  calculateDeveloperScores,
} from './scoreCalculator'

const mockUser: GitHubUser = {
  id: 12345,
  login: 'PedroFnseca',
  name: 'Pedro Fonseca',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345',
  bio: 'Full Stack Developer',
  company: null,
  blog: 'https://pedrofnseca.me',
  location: 'São Paulo - Brazil',
  twitter_username: null,
  public_repos: 24,
  public_gists: 4,
  followers: 150,
  following: 80,
  created_at: '2022-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

const mockRepos: GitHubRepo[] = [
  {
    id: 1,
    name: 'rest-api-C',
    full_name: 'PedroFnseca/rest-api-C',
    description: 'High performance REST API in C',
    html_url: 'https://github.com/PedroFnseca/rest-api-C',
    stargazers_count: 120,
    forks_count: 18,
    language: 'C',
    fork: false,
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'esp32-http-client',
    full_name: 'PedroFnseca/esp32-http-client',
    description: 'Embedded HTTP client for ESP32',
    html_url: 'https://github.com/PedroFnseca/esp32-http-client',
    stargazers_count: 25,
    forks_count: 5,
    language: 'C++',
    fork: false,
    updated_at: new Date().toISOString(),
  },
]

describe('Developer Score & Insights Engine', () => {
  it('calculates deterministic scores between 0 and 100', () => {
    const scores = calculateDeveloperScores(
      mockUser,
      mockRepos,
      350,
      [{ contributionDays: [{ contributionCount: 5, date: '2023-08-01' }] }],
      145,
      23
    )

    expect(scores.activityScore).toBeGreaterThanOrEqual(0)
    expect(scores.activityScore).toBeLessThanOrEqual(100)
    expect(scores.openSourceScore).toBeGreaterThanOrEqual(0)
    expect(scores.openSourceScore).toBeLessThanOrEqual(100)
    expect(scores.communityScore).toBeGreaterThanOrEqual(0)
    expect(scores.consistencyScore).toBeGreaterThanOrEqual(0)
    expect(scores.impactScore).toBeGreaterThanOrEqual(0)
    expect(scores.growthScore).toBeGreaterThanOrEqual(0)
    expect(scores.totalDeveloperScore).toBeGreaterThanOrEqual(0)
    expect(scores.totalDeveloperScore).toBeLessThanOrEqual(100)
    expect(['S+', 'S', 'A+', 'A', 'B', 'C']).toContain(scores.tierGrade)
  })

  it('calculates temporal habits and derived insights', () => {
    const weeks = [
      {
        contributionDays: [
          { contributionCount: 10, date: '2023-08-10' },
          { contributionCount: 20, date: '2023-08-11' },
        ],
      },
    ]
    const habits = calculateTemporalHabits(weeks)
    expect(habits.peakMonth).toBeDefined()
    expect(
      habits.morningPercent + habits.afternoonPercent + habits.eveningPercent + habits.nightPercent
    ).toBe(100)

    const insights = calculateDerivedInsights(
      mockUser,
      mockRepos,
      { C: 50000, TypeScript: 20000 },
      habits,
      145
    )

    expect(insights.length).toBeGreaterThan(0)
    expect(insights.some((i) => i.id === 'night-owl' || i.id === 'early-bird')).toBe(true)
    expect(insights.some((i) => i.id === 'top-impact')).toBe(true)
  })

  it('calculates language breakdown accurately', () => {
    const breakdown = calculateLanguageBreakdown({ C: 80000, TypeScript: 20000 }, mockRepos)
    expect(breakdown.dominantLanguage).toBe('C')
    expect(breakdown.ranking[0].percentage).toBe(80)
    expect(breakdown.ranking[1].percentage).toBe(20)
  })

  it('calculates Developer DNA and primary archetype', () => {
    const dna = calculateDeveloperDNA(mockUser, mockRepos, 500, 145, {
      C: 50000,
      TypeScript: 20000,
    })
    expect(dna.traits.length).toBe(5)
    expect(dna.traits.every((t) => t.percentage >= 0 && t.percentage <= 100)).toBe(true)
    expect(dna.primaryArchetype).toBeDefined()
    expect(dna.primaryArchetype.startsWith('> THE ')).toBe(true)
  })

  it('calculates Coding Velocity monthly and daily cadence', () => {
    const velocity = calculateCodingVelocity(
      { totalCommits: 600, totalPullRequests: 120, totalIssues: 36, totalReviews: 24 },
      600
    )
    expect(velocity.commitsPerMonth).toBe(50)
    expect(velocity.prsPerMonth).toBe(10)
    expect(velocity.issuesPerMonth).toBe(3)
    expect(velocity.avgCommitsPerDay).toBeGreaterThan(0)
    expect(velocity.metrics.length).toBe(3)
  })
})
