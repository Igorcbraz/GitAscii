import { expect, test } from '../fixtures/customFixture'

test.describe('GitAscii Explore Community Gallery E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore')
  })

  test('should display search input, filter presets and profiles grid', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
    await expect(page.locator('button:has-text("All Community Profiles")')).toBeVisible()

    // Check at least one profile article card is rendered
    const articles = page.locator('article')
    const count = await articles.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should allow filtering profiles by template categories', async ({ page }) => {
    // Click Terminal CLI filter
    const terminalFilter = page.locator('button:has-text("Terminal CLI")')
    await terminalFilter.click()

    // Wait a brief moment for state filtering
    await page.waitForTimeout(200)

    // Check that matching cards are visible
    const cards = page.locator('article')
    const count = await cards.count()

    // Each visible card should list the terminal template
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText(/Template:\s*terminal/i)
    }
  })

  test('should allow searching profiles by username query', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('igorcbraz')
    await page.waitForTimeout(200)

    const cards = page.locator('article')
    const count = await cards.count()

    // Should display matching cards
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText(/igorcbraz/i)
    }
  })

  test('should handle empty search results nicely with a reset action', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('nonexistent-weird-username')
    await page.waitForTimeout(200)

    // Check for empty result block
    await expect(page.locator('text=No community profiles matched your query.')).toBeVisible()

    // Reset filters
    const resetBtn = page.locator('button:has-text("Reset Filters")')
    await expect(resetBtn).toBeVisible()
    await resetBtn.click()

    // Verify search input is cleared and profiles are back
    await expect(searchInput).toHaveValue('')
    const count = await page.locator('article').count()
    expect(count).toBeGreaterThan(0)
  })

  test('should inspect a community profile and load in editor', async ({ page }) => {
    const inspectBtn = page.locator('article').first().locator('button:has-text("Inspect")')
    // Button might only be visible on hover, so force click it
    await inspectBtn.click({ force: true })

    // Verify redirect to editor page
    await expect(page).toHaveURL(/\/[a-zA-Z0-9_-]+/)
    await expect(page.locator('[data-testid="canvas-svg-container"]')).toBeVisible()
  })

  test('should verify explore accessibility standards', async ({ checkAccessibility }) => {
    await checkAccessibility()
  })

  test('should verify explore visual snapshot', async ({ page }) => {
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('explore-gallery.png', {
      maxDiffPixelRatio: 0.1,
      mask: [page.locator('img')], // mask avatars/images that might have network issues
    })
  })
})
