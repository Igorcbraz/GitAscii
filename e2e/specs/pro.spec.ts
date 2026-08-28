import { expect, test } from '../fixtures/customFixture'

const MOCK_PRO_OVERVIEW = {
  totalViews: 42850,
  uniqueVisitors: 8420,
  activeProfilesCount: 3,
  activeErrorsCount: 1,
  emailsSentCount: 4,
  viewsTrendPercent: 18.5,
  uniquesTrendPercent: 12.3,
  cacheHitRatio: 98,
  avgLatencyMs: 24,
  activeViewersLast30m: 14,
  avgDailyViews: 1428,
  peakDay: { day: 'Wednesday', views: 3200 },
  peakHour: { hour: 15, views: 540 },
  topCountry: { code: 'US', name: 'United States', views: 18500 },
  topSource: 'GitHub',
  recentViewsChart: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-08-${String(i + 1).padStart(2, '0')}`,
    views: Math.floor(1000 + Math.sin(i / 3) * 400),
    uniques: Math.floor(400 + Math.sin(i / 3) * 150),
    cacheHits: 900,
    camoViews: 250,
    directViews: 750,
    status200: 750,
    status304: 250,
    avgLatencyMs: 22,
    previousPeriodViews: 900,
  })),
  topProfiles: [
    {
      id: 'prof_default',
      slug: 'default',
      name: 'Primary GitHub Profile',
      description: 'Main README dashboard',
      status: 'active',
      isDefault: true,
      widgetsCount: 5,
      totalViews: 28400,
      createdAt: '2026-08-01T00:00:00Z',
      lastUpdated: '2026-08-27T12:00:00Z',
      publicUrl: 'http://localhost:3000/Igorcbraz',
      rawSvgUrl: 'http://localhost:3000/Igorcbraz.svg',
    },
    {
      id: 'prof_minimal',
      slug: 'minimal',
      name: 'Minimal Dark',
      description: 'Compact README view',
      status: 'active',
      isDefault: false,
      widgetsCount: 3,
      totalViews: 14450,
      createdAt: '2026-08-10T00:00:00Z',
      lastUpdated: '2026-08-26T18:00:00Z',
      publicUrl: 'http://localhost:3000/Igorcbraz/minimal',
      rawSvgUrl: 'http://localhost:3000/Igorcbraz/minimal.svg',
    },
  ],
  recentErrors: [
    {
      id: 'err_default_stats',
      widgetId: 'stats',
      widgetName: 'GitHub Stats Card',
      profileSlug: 'default',
      errorType: 'FETCH_TIMEOUT',
      message: 'Upstream stats provider timed out',
      details: 'HTTP 504 Gateway Timeout',
      status: 'active',
      occurrences: 3,
      firstSeenAt: '2026-08-27T10:00:00Z',
      lastSeenAt: '2026-08-27T18:30:00Z',
      resolvedAt: null,
    },
  ],
  recentEmails: [
    {
      id: 'eml_1',
      recipientEmail: 'igor@gitascii.com',
      templateName: 'ProDigestEmail',
      subject: '⚡ GitAscii Pro Weekly Traffic & Growth Digest',
      reason: 'Weekly profile telemetry digest dispatched to account',
      relatedWidget: null,
      relatedProfile: 'default',
      sentAt: '2026-08-25T08:00:00Z',
      status: 'sent',
    },
  ],
  recentActivity: [
    {
      id: 'act_1',
      type: 'error_detected',
      title: 'Error detected in GitHub Stats Card',
      description: 'Upstream stats provider timed out',
      timestamp: '2026-08-27T18:30:00Z',
    },
    {
      id: 'act_2',
      type: 'email_sent',
      title: 'Notification sent: ProDigestEmail',
      description: '⚡ GitAscii Pro Weekly Traffic & Growth Digest',
      timestamp: '2026-08-25T08:00:00Z',
    },
  ],
}

const MOCK_PRO_ANALYTICS = {
  ...MOCK_PRO_OVERVIEW,
  range: '30d',
  hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    views: Math.floor(20 + Math.sin(hour / 3) * 15),
    camoViews: 5,
    directViews: 15,
  })),
  heatmapGrid: Array.from({ length: 7 * 24 }, (_, idx) => ({
    day: Math.floor(idx / 24),
    dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][Math.floor(idx / 24)],
    hour: idx % 24,
    views: 12,
    intensity: 45,
  })),
  topCountries: [
    {
      code: 'US',
      name: 'United States',
      key: 'US',
      continent: 'North America',
      continentCode: 'NA',
      flagEmoji: '🇺🇸',
      count: 18500,
      percentage: 43,
    },
    {
      code: 'BR',
      name: 'Brazil',
      key: 'BR',
      continent: 'South America',
      continentCode: 'SA',
      flagEmoji: '🇧🇷',
      count: 9800,
      percentage: 23,
    },
  ],
  topContinents: [{ name: 'North America', key: 'NA', count: 18500, percentage: 43 }],
  topLanguages: [{ name: 'English', key: 'en', count: 25000, percentage: 58 }],
  topTimezones: [
    { name: 'America/New_York', key: 'America/New_York', count: 12000, percentage: 28 },
  ],
  topSources: [{ name: 'GitHub', key: 'GitHub', count: 28000, percentage: 65 }],
  topDevices: [{ name: 'Desktop', key: 'Desktop', count: 32000, percentage: 75 }],
  topBrowsers: [{ name: 'Chrome', key: 'Chrome', count: 24000, percentage: 56 }],
  topOs: [{ name: 'macOS', key: 'macOS', count: 20000, percentage: 47 }],
  trafficTypes: [{ name: 'Direct', key: 'direct', count: 30000, percentage: 70 }],
  themes: [{ name: 'dark', key: 'dark', count: 40000, percentage: 93 }],
  statusCodes: [{ name: '200 OK', key: '200', count: 42000, percentage: 98 }],
}

const MOCK_PRO_ERRORS = [
  {
    id: 'err_default_stats',
    widgetId: 'stats',
    widgetName: 'GitHub Stats Card',
    profileSlug: 'default',
    errorType: 'FETCH_TIMEOUT',
    message: 'Upstream stats provider timed out',
    details: 'HTTP 504 Gateway Timeout after 5000ms',
    status: 'active',
    occurrences: 3,
    firstSeenAt: '2026-08-27T10:00:00Z',
    lastSeenAt: '2026-08-27T18:30:00Z',
    resolvedAt: null,
  },
]

const MOCK_PRO_EMAILS = {
  emails: [
    {
      id: 'eml_1',
      recipientEmail: 'igor@gitascii.com',
      templateName: 'ProDigestEmail',
      subject: '⚡ GitAscii Pro Weekly Traffic & Growth Digest',
      reason: 'Weekly profile telemetry digest dispatched to account',
      relatedWidget: null,
      relatedProfile: 'default',
      sentAt: '2026-08-25T08:00:00Z',
      status: 'sent',
      messageId: 'msg_12345',
    },
  ],
  canSendTest: true,
  recipientEmail: 'igor@gitascii.com',
  isFallback: false,
  accountEmail: 'igor@gitascii.com',
  customAlertEmail: null,
}

const MOCK_PRO_PROFILES = [
  {
    id: 'prof_default',
    slug: 'default',
    name: 'Primary GitHub Profile',
    description: 'Main README dashboard',
    status: 'active',
    isDefault: true,
    widgetsCount: 5,
    totalViews: 28400,
    createdAt: '2026-08-01T00:00:00Z',
    lastUpdated: '2026-08-27T12:00:00Z',
    publicUrl: 'http://localhost:3000/Igorcbraz',
    rawSvgUrl: 'http://localhost:3000/Igorcbraz.svg',
  },
  {
    id: 'prof_minimal',
    slug: 'minimal',
    name: 'Minimal Dark',
    description: 'Compact README view',
    status: 'active',
    isDefault: false,
    widgetsCount: 3,
    totalViews: 14450,
    createdAt: '2026-08-10T00:00:00Z',
    lastUpdated: '2026-08-26T18:00:00Z',
    publicUrl: 'http://localhost:3000/Igorcbraz/minimal',
    rawSvgUrl: 'http://localhost:3000/Igorcbraz/minimal.svg',
  },
]

const MOCK_PRO_REPORTS = {
  username: 'Igorcbraz',
  range: '30d',
  generatedAt: new Date().toISOString(),
  periodLabel: 'Last 30 Days',
  summary: {
    totalViews: 42850,
    uniqueVisitors: 8420,
    cacheHitRatio: '98.0%',
    avgLatencyMs: 24,
    viewsGrowth: '+18.5%',
    uniquesGrowth: '+12.3%',
  },
  topProfiles: MOCK_PRO_PROFILES,
  countries: MOCK_PRO_ANALYTICS.topCountries,
  sources: MOCK_PRO_ANALYTICS.topSources,
  timeSeries: MOCK_PRO_OVERVIEW.recentViewsChart,
}

test.describe('GitAscii Pro Area E2E Tests', () => {
  test.use({ sessionState: 'logged-in' })

  test.beforeEach(async ({ page }) => {
    // Intercept Pro API endpoints
    await page.route('**/api/pro/overview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PRO_OVERVIEW),
      })
    })

    await page.route('**/api/pro/analytics*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PRO_ANALYTICS),
      })
    })

    await page.route('**/api/pro/errors', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ errors: MOCK_PRO_ERRORS }),
      })
    })

    await page.route('**/api/pro/errors/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.route('**/api/pro/emails*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PRO_EMAILS),
      })
    })

    await page.route('**/api/pro/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ profiles: MOCK_PRO_PROFILES }),
      })
    })

    await page.route('**/api/pro/reports*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PRO_REPORTS),
      })
    })
  })

  test('should render Pro Overview dashboard with metrics and chart', async ({ page }) => {
    await page.goto('/pro')
    await page.waitForTimeout(500)

    // Check header and titles
    await expect(page.locator('h1')).toContainText(/Overview|Visão Geral/i)
    await expect(page.locator('text=42,850').first()).toBeVisible()
    await expect(page.locator('text=8,420').first()).toBeVisible()

    // Check sidebar navigation links
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.locator('aside a[href="/pro/analytics"]')).toBeVisible()
    await expect(page.locator('aside a[href="/pro/reports"]')).toBeVisible()
    await expect(page.locator('aside a[href="/pro/profiles"]')).toBeVisible()
    await expect(page.locator('aside a[href="/pro/errors"]')).toBeVisible()
    await expect(page.locator('aside a[href="/pro/emails"]')).toBeVisible()
    await expect(page.locator('aside a[href*="docs"]')).toBeVisible()
    const docsLink = page.locator('aside a[href*="docs"]').first()
    await expect(docsLink).toHaveAttribute('target', '_blank')
    await expect(docsLink).toHaveAttribute('href', /docs\.gitascii\.com/)
  })

  test('should navigate to Analytics dashboard and display telemetry dimensions', async ({
    page,
  }) => {
    await page.goto('/pro/analytics')
    await page.waitForTimeout(500)

    await expect(page.locator('h1')).toContainText(/Analytics|Métricas/i)

    // Verify time-series area chart and world map exist
    await expect(page.locator('svg')).not.toHaveCount(0)
    await expect(page.locator('text=United States').first()).toBeVisible()
  })

  test('should navigate to Profiles dashboard and allow creating a profile', async ({ page }) => {
    await page.goto('/pro/profiles')
    await page.waitForTimeout(500)

    await expect(page.locator('h1')).toContainText(/Profiles|Perfis/i)
    await expect(page.locator('text=Primary GitHub Profile').first()).toBeVisible()
    await expect(page.locator('text=Minimal Dark').first()).toBeVisible()

    // Check Create Profile button is visible
    const createBtn = page
      .locator('button:has-text("Create New Profile"), button:has-text("Criar Novo Perfil")')
      .first()
    await expect(createBtn).toBeVisible()
  })

  test('should navigate to Widget Errors dashboard and display active failure', async ({
    page,
  }) => {
    await page.goto('/pro/errors')
    await page.waitForTimeout(500)

    await expect(page.locator('h1')).toContainText(/Widget Errors|Erros de Widgets/i)
    await expect(page.locator('text=GitHub Stats Card').first()).toBeVisible()
    await expect(page.locator('text=FETCH_TIMEOUT').first()).toBeVisible()
  })

  test('should navigate to Email Notifications dashboard and show sent log', async ({ page }) => {
    await page.goto('/pro/emails')
    await page.waitForTimeout(500)

    await expect(page.locator('h1')).toContainText(/Email|Notificações/i)
    await expect(page.locator('text=ProDigestEmail').first()).toBeVisible()
    await expect(page.locator('text=igor@gitascii.com').first()).toBeVisible()
  })

  test('should navigate to Reports dashboard and open Share Report Modal', async ({ page }) => {
    await page.goto('/pro/reports')
    await page.waitForTimeout(500)

    await expect(page.locator('h1')).toContainText(/Reports|Relatórios/i)

    const shareBtn = page
      .locator('button:has-text("Share"), button:has-text("Compartilhar")')
      .first()
    if (await shareBtn.isVisible()) {
      await shareBtn.click()
      await expect(page.locator('canvas')).toBeVisible()
    }
  })

  test('should pass Pro dashboard accessibility checks', async ({ page, checkAccessibility }) => {
    await page.goto('/pro')
    await page.waitForTimeout(500)
    await checkAccessibility()
  })
})
