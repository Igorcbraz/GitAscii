import { expect, test } from '../fixtures/customFixture'

test.describe('GitAscii Widgets Directory E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/widgets')
  })

  test('should load playground and display widgets catalog list', async ({ page }) => {
    await expect(page.locator('text=Test Live SVG Widgets with Any GitHub Username')).toBeVisible()

    const count = await page.locator('article').count()
    expect(count).toBeGreaterThan(0)
  })

  test('should allow changing username in playground to update preview endpoints', async ({
    page,
  }) => {
    const usernameInput = page.locator('form input[type="text"]')
    await expect(usernameInput).toBeVisible()

    // Type a new test username
    await usernameInput.fill('special-developer')
    await usernameInput.press('Enter')

    // Wait for the UI text update
    await page.waitForTimeout(200)

    // Check code snippet blocks contain the updated username
    const snippetCode = page.locator('article').first().locator('code').first()
    await expect(snippetCode).toContainText('special-developer')
  })

  test('should trigger toast confirmation when copying widget markdown', async ({ page }) => {
    const copyBtn = page.locator('article').first().locator('button[title*="Copy Markdown"]')
    await expect(copyBtn).toBeVisible()

    await copyBtn.click()

    // Toast alert should be rendered
    await expect(page.locator('text=Copied')).toBeVisible()
  })

  test('should check accessibility on widgets page', async ({ checkAccessibility }) => {
    await checkAccessibility()
  })

  test('should check visual regressions with screenshot', async ({ page }) => {
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('widgets-page.png', {
      maxDiffPixelRatio: 0.1,
      mask: [page.locator('img')], // mask dynamically-rendered SVGs
    })
  })
})
