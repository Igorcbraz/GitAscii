import { expect, test } from '../fixtures/customFixture'

test.describe('GitAscii Templates Showcase E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates')
  })

  test('should display stack directory links and category filters', async ({ page }) => {
    await expect(page.locator('text=Language & Framework Specific Templates')).toBeVisible()
    await expect(page.locator('button:has-text("All Templates")')).toBeVisible()

    const count = await page.locator('article').count()
    expect(count).toBeGreaterThan(0)
  })

  test('should allow filtering templates by search query', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('minimal')
    await page.waitForTimeout(200)

    const cards = page.locator('article')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText(/minimal|light/i)
    }
  })

  test('should allow copying template markdown snippet', async ({ page }) => {
    const copyBtn = page.locator('article').first().locator('button:has-text("Copy SVG Snippet")')
    await expect(copyBtn).toBeVisible()

    // Click to copy
    await copyBtn.click()

    // Verify button text changes to reflect copy success
    await expect(page.locator('text=Copied Markdown').first()).toBeVisible()
  })

  test('should redirect to visual editor when using in visual editor', async ({ page }) => {
    const useBtn = page.locator('article').first().locator('a:has-text("Use in Visual Editor")')
    await expect(useBtn).toBeVisible()

    await useBtn.click()

    // Navigates to index editor with template param
    await expect(page).toHaveURL(/\/\?template=.+/)
  })

  test('should verify templates basic accessibility', async ({ checkAccessibility }) => {
    await checkAccessibility()
  })

  test('should take templates visual snapshot', async ({ page }) => {
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('templates-gallery.png', {
      maxDiffPixelRatio: 0.1,
    })
  })
})
