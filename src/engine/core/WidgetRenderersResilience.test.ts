import { describe, expect, it } from 'vitest'

import type {
  GlobalStyles,
  NormalizedGitHubData,
  SavedConfiguration,
  WidgetInstance,
} from '@/engine/types'

import { normalizeProfileData, renderSvg } from './SVGEngine'
import { getRenderer, REGISTRY_MAP, renderWidgetContent } from './WidgetRegistry'
import { renderWidgetSvg } from './WidgetRenderer'

const mockFullData: NormalizedGitHubData = {
  user: {
    id: 12345,
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://avatars.githubusercontent.com/u/12345',
    bio: 'Software engineer building great open source tools.\nSecond line of bio.\nThird line.',
    company: '@acme-corp',
    blog: 'https://testuser.dev',
    location: 'San Francisco, CA',
    email: 'test@example.com',
    twitter_username: 'testuser',
    public_repos: 42,
    public_gists: 7,
    followers: 1250,
    following: 180,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },

  repos: [
    {
      id: 1,
      name: 'awesome-repo',
      full_name: 'testuser/awesome-repo',
      html_url: 'https://github.com/testuser/awesome-repo',
      description: 'An awesome repository for doing great things',
      stargazers_count: 520,
      forks_count: 85,
      language: 'TypeScript',
      topics: ['typescript', 'react', 'nodejs'],
      updated_at: '2023-05-01T12:00:00Z',
      fork: false,
    },
    {
      id: 2,
      name: 'python-service',
      full_name: 'testuser/python-service',
      html_url: 'https://github.com/testuser/python-service',
      description: 'Backend microservice in Python',
      stargazers_count: 120,
      forks_count: 14,
      language: 'Python',
      topics: ['python', 'fastapi'],
      updated_at: '2023-04-10T12:00:00Z',
      fork: false,
    },
  ],
  languages: {
    TypeScript: 65000,
    JavaScript: 25000,
    Python: 15000,
    Rust: 8000,
    HTML: 5000,
  },
  totalStars: 640,
  totalForks: 99,
  readmeContent: '# Hello World\nWelcome to my profile.',
  socialAccounts: [
    { provider: 'twitter', url: 'https://twitter.com/testuser' },
    { provider: 'linkedin', url: 'https://linkedin.com/in/testuser' },
  ],
  contributions: {
    totalContributions: 1420,
    weeks: [
      {
        contributionDays: [
          { date: '2023-01-01', contributionCount: 4, color: '#216e39' },
          { date: '2023-01-02', contributionCount: 0, color: '#161b22' },
          { date: '2023-01-03', contributionCount: 8, color: '#39d353' },
          { date: '2023-01-04', contributionCount: 2, color: '#0e4429' },
          { date: '2023-01-05', contributionCount: 5, color: '#26a641' },
          { date: '2023-01-06', contributionCount: 1, color: '#0e4429' },
          { date: '2023-01-07', contributionCount: 0, color: '#161b22' },
        ],
      },
    ],
  },
}

const mockCorruptedData = {
  user: undefined as any,
  repos: undefined as any,
  languages: null as any,
  totalStars: undefined as any,
  totalForks: undefined as any,
  socialAccounts: null as any,
  contributions: undefined as any,
  readmeContent: null,
} as unknown as NormalizedGitHubData

const mockGlobalStyles: GlobalStyles = {
  backgroundColor: '#0d1117',
  textColor: '#c9d1d9',
  accentColor: '#58a6ff',
  borderColor: '#30363d',
  fontFamily: "'JetBrains Mono', monospace",
  borderRadius: 8,
  padding: 16,
  themeMode: 'dark',
  templateStyle: 'terminal',
}

describe('Engine Robustness & Widget Error Boundary', () => {
  it('normalizes missing or corrupted profile data into guaranteed safe structures', () => {
    const normalized = normalizeProfileData(mockCorruptedData)
    expect(normalized.user.login).toBe('user')
    expect(normalized.user.public_repos).toBe(0)
    expect(normalized.totalStars).toBe(0)
    expect(Array.isArray(normalized.repos)).toBe(true)
    expect(typeof normalized.languages).toBe('object')
    expect(Array.isArray(normalized.contributions?.weeks)).toBe(true)
  })

  it('renders all registered widgets without throwing errors even with full data', () => {
    for (const [widgetId] of REGISTRY_MAP) {
      const widget: WidgetInstance = {
        widgetId,
        instanceId: `inst_${widgetId}`,
        name: widgetId,
        position: { x: 10, y: 10 },
        size: { width: 800, height: 250 },
        config: {},
        locked: false,
        visible: true,
        zIndex: 1,
      }

      expect(() => {
        const svg = renderWidgetContent(widget, mockFullData, mockGlobalStyles)
        expect(typeof svg).toBe('string')
        expect(svg.length).toBeGreaterThan(0)
      }).not.toThrow()
    }
  })

  it('renders all registered widgets without throwing errors even with corrupted/empty data', () => {
    const safeData = normalizeProfileData(mockCorruptedData)
    for (const [widgetId] of REGISTRY_MAP) {
      const widget: WidgetInstance = {
        widgetId,
        instanceId: `inst_corrupted_${widgetId}`,
        name: widgetId,
        position: { x: 0, y: 0 },
        size: { width: 800, height: 200 },
        config: {},
        locked: false,
        visible: true,
        zIndex: 1,
      }

      expect(() => {
        const svg = renderWidgetContent(widget, safeData, mockGlobalStyles)
        expect(typeof svg).toBe('string')
        expect(svg.length).toBeGreaterThan(0)
      }).not.toThrow()
    }
  })

  it('handles extreme and NaN dimensions safely in WidgetRenderer', () => {
    const widget: WidgetInstance = {
      widgetId: 'stats',
      instanceId: 'inst_extreme',
      name: 'Stats',
      position: { x: NaN as any, y: -50 },
      size: { width: NaN as any, height: -100 },
      config: {
        animationType: 'typewriter',
        animationDuration: NaN as any,
      },
      locked: false,
      visible: true,
      zIndex: 1,
    }

    expect(() => {
      const svg = renderWidgetSvg(widget, mockFullData, mockGlobalStyles)
      expect(typeof svg).toBe('string')
      expect(svg).toContain('<g transform="translate(0, -50)"')
    }).not.toThrow()
  })

  it('gracefully catches and isolates runtime exceptions in widget renderers', () => {
    const brokenWidgetId = 'broken-widget-test'
    const widget: WidgetInstance = {
      widgetId: brokenWidgetId,
      instanceId: 'inst_broken',
      name: 'Broken',
      position: { x: 0, y: 0 },
      size: { width: 400, height: 100 },
      config: {},
      locked: false,
      visible: true,
      zIndex: 1,
    }

    const renderer = getRenderer(brokenWidgetId)
    const result = renderer(widget, mockFullData, mockGlobalStyles)
    expect(result).toContain('BROKEN-WIDGET-TEST')
  })

  it('renders SVGEngine with widget aliasing and query params correctly', () => {
    const config: SavedConfiguration = {
      version: 1,
      githubId: 12345,
      username: 'testuser',
      profileSlug: 'default',
      profileName: 'Default',
      templateId: 'terminal',
      widgets: [
        {
          widgetId: 'stats',
          instanceId: 'w_stats',
          name: 'Stats',
          position: { x: 20, y: 20 },
          size: { width: 760, height: 120 },
          config: {},
          locked: false,
          visible: true,
          zIndex: 1,
        },
        {
          widgetId: 'languages',
          instanceId: 'w_langs',
          name: 'Languages',
          position: { x: 20, y: 160 },
          size: { width: 760, height: 140 },
          config: {},
          locked: false,
          visible: true,
          zIndex: 2,
        },
      ],
      globalStyles: mockGlobalStyles,
      metadata: {
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        schemaVersion: 1,
      },
    }

    // Test rendering all widgets
    const fullSvg = renderSvg(config, mockFullData)
    expect(fullSvg).toContain('<svg')
    expect(fullSvg).toContain('GITHUB METRICS')

    // Test light theme
    const lightSvg = renderSvg(config, mockFullData, { theme: 'light' })
    expect(lightSvg).toContain('fill="#ffffff"')
  })

  it('renders Pedro Fonseca widgets collection gracefully', () => {
    const pedroWidgets = [
      'pedro-profile-card',
      'pedro-dev-score',
      'pedro-insights-dossier',
      'pedro-developer-dna',
      'pedro-coding-velocity',
    ]

    pedroWidgets.forEach((widgetId) => {
      const widget: WidgetInstance = {
        widgetId,
        instanceId: `inst_${widgetId}`,
        name: widgetId,
        position: { x: 0, y: 0 },
        size: { width: 800, height: 400 },
        config: {},
        locked: false,
        visible: true,
        zIndex: 1,
      }

      // Test with full data
      const renderer = getRenderer(widgetId)
      const fullOutput = renderer(widget, mockFullData, mockGlobalStyles)
      expect(fullOutput).toContain('<svg')

      // Test with null / empty data resilience
      const emptyData: NormalizedGitHubData = {
        user: {
          id: 0,
          login: 'empty',
          name: null,
          avatar_url: '',
          bio: null,
          company: null,
          blog: null,
          location: null,
          twitter_username: null,
          public_repos: 0,
          public_gists: 0,
          followers: 0,
          following: 0,
          created_at: '',
          updated_at: '',
        },
        repos: [],
        languages: {},
        totalStars: 0,
        totalForks: 0,
      }
      const emptyOutput = renderer(widget, emptyData, mockGlobalStyles)
      expect(emptyOutput).toContain('<svg')
    })
  })
})
