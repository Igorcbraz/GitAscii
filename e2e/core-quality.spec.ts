import type { SavedConfiguration } from '../src/engine/types'
import { expect, test } from './fixtures/customFixture'

const config: SavedConfiguration = {
  version: 1,
  githubId: 0,
  username: 'Igorcbraz',
  profileSlug: 'default',
  profileName: 'Quality profile',
  templateId: 'blank',
  widgets: [],
  globalStyles: {
    backgroundColor: '#060606',
    textColor: '#ffffff',
    accentColor: '#c5ff4a',
    borderColor: '#333333',
    borderRadius: 0,
    padding: 16,
    fontFamily: 'monospace',
    themeMode: 'dark',
  },
  metadata: {
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    schemaVersion: 1,
  },
}
config.widgets = [
  {
    instanceId: 'bio',
    widgetId: 'bio',
    position: { x: 0, y: 0 },
    size: { width: 600, height: 150 },
    visible: true,
    locked: false,
    zIndex: 1,
    config: {
      customBio: 'Core profile content',
      backgroundColor: '#060606" onpointerenter="/* inert fixture */',
    },
  },
  {
    instanceId: 'external',
    widgetId: 'custom-image',
    position: { x: 0, y: 160 },
    size: { width: 300, height: 140 },
    visible: true,
    locked: false,
    zIndex: 2,
    config: { imageUrl: 'https://fixture.test/widget.svg' },
  },
]
const profiles = ['default', 'work'].map((slug) => ({
  id: slug,
  slug,
  name: slug === 'default' ? 'Primary quality profile' : 'Work quality profile',
  status: slug === 'default' ? 'active' : 'draft',
  isDefault: slug === 'default',
  isSynced: slug === 'default',
  widgetsCount: 2,
  totalViews: 0,
  versionCount: 1,
  createdAt: '2026-09-01T00:00:00Z',
  lastUpdated: '2026-09-01T00:00:00Z',
  publicUrl: 'https://fixture.test/widget.svg',
  rawSvgUrl: 'https://fixture.test/widget.svg',
}))

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gitascii_analytics_consent', 'denied')
    localStorage.setItem('gitascii_has_seen_tour', 'true')
    localStorage.setItem('gitascii_has_seen_v2_migration_tour', 'true')
    const state = window as typeof window & { loadedSvgImages: string[] }
    state.loadedSvgImages = []
    const originalSetAttribute = SVGImageElement.prototype.setAttribute
    SVGImageElement.prototype.setAttribute = function (name, value) {
      if (name === 'href' && value === 'https://fixture.test/widget.svg') {
        state.loadedSvgImages.push(value)
      }
      return originalSetAttribute.call(this, name, value)
    }
  })
  await page.route('https://fixture.test/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect width="100" height="50" fill="green"/></svg>',
    })
  )
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      json: { session: { username: 'Igorcbraz', githubId: 40432351, isPro: true, tier: 'pro' } },
    })
  )
  await page.route('**/api/config/**', (route) => route.fulfill({ json: config }))
  await page.route('**/api/pro/**', (route) => route.fulfill({ json: {} }))
  await page.route('**/api/pro/profiles', (route) => route.fulfill({ json: { profiles } }))
})

test('editor renders editable core widgets and external images through the safe SVG path', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/Igorcbraz')
  const bio = page.getByTestId('canvas-svg-container').getByTestId('canvas-widget-bio')
  await expect(bio).toContainText('Core profile content')
  await expect(bio.locator('[onpointerenter]')).toHaveCount(0)
  const image = page.getByTestId('canvas-widget-custom-image').locator('image')
  await expect(image).toHaveAttribute('href', 'https://fixture.test/widget.svg')
  await expect(image).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as typeof window & { loadedSvgImages: string[] }).loadedSvgImages.includes(
          'https://fixture.test/widget.svg'
        )
      )
    )
    .toBe(true)
  await page.locator('#overlay-widget-bio').dispatchEvent('dblclick')
  const editor = page.getByTestId('widget-bio-input')
  await expect(editor).toBeVisible()
  await editor.fill('Edited core profile')
  await expect(bio).toContainText('Edited core profile')
  await page.reload()
  await expect(
    page.getByTestId('canvas-svg-container').getByTestId('canvas-widget-bio')
  ).toContainText('Edited core profile')
  expect(errors).toEqual([])
})

test('Pro and editor show the same profiles, preserving draft publication status', async ({
  page,
}) => {
  await page.goto('/pro/profiles')
  await expect(page.getByRole('heading', { name: 'Work quality profile' })).toBeVisible()
  await expect(page.locator('a[href="/Igorcbraz/work"]').first()).toBeVisible()
  await page.goto('/Igorcbraz/work')
  await expect(
    page.getByTestId('canvas-svg-container').getByTestId('canvas-widget-bio')
  ).toBeVisible()
  await page.getByTestId('profile-switcher-trigger').click()
  const list = page.getByTestId('profile-switcher-list')
  await expect(list.getByRole('button', { name: /Work quality profile/ })).toContainText('draft')
  await expect(list.getByRole('button', { name: /Primary quality profile/ })).toContainText(
    'synced'
  )
})
