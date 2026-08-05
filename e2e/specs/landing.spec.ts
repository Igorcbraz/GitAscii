import { expect, test } from '../fixtures/customFixture'

test.describe('GitAscii Landing Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display primary layout sections and title', async ({ page }) => {
    // Check main elements
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Create')
    await expect(page.locator('#features')).toBeVisible()
    await expect(page.locator('#faq')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('should allow user to enter username in Hero input and redirect to Editor', async ({
    page,
  }) => {
    // Wait for hydration so onSubmit is registered
    await page.waitForTimeout(1000)

    const usernameInput = page.locator('#hero-username-input')
    await expect(usernameInput).toBeVisible()

    // Fill username
    await usernameInput.fill('tester-user')

    // Submit form by pressing Enter to avoid clicking the wrong submit button
    await usernameInput.press('Enter')

    // Verify it navigates to the visual editor path
    await expect(page).toHaveURL(/\/tester-user/)
  })

  test('should verify landing page basic accessibility standards', async ({
    checkAccessibility,
  }) => {
    await checkAccessibility()
  })

  test('should support language toggling', async ({ page }) => {
    // Wait for hydration to complete to ensure onClick handlers are active
    await page.waitForTimeout(1000)

    // Locate the visible language selector button in the desktop navbar by its globe icon
    const langBtn = page.locator('button:has(svg.lucide-globe)').first()
    await expect(langBtn).toBeVisible()
    await langBtn.click()

    // Select Portuguese from the visible dropdown options
    const ptBtn = page
      .locator('[role="menuitem"]')
      .filter({ hasText: /portug/i })
      .first()
    await expect(ptBtn).toBeVisible()
    await ptBtn.click()

    // Verify text updates
    await expect(page.locator('h1')).toContainText('Crie')
  })

  test('should display GitHub star count fetched from API', async ({ page }) => {
    // The fixture redirects API requests. Stargazers count is 563 in mocks.
    const starCountText = page.locator('a:has-text("Star")').locator('span').last()
    await expect(starCountText).toContainText('563')
  })

  test('should take a homepage visual snapshot', async ({ page }) => {
    // Wait for the hands canvas animation to start/mount to prevent race conditions
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('landing-page.png', {
      maxDiffPixelRatio: 0.1,
      mask: [page.locator('canvas'), page.locator('video')], // mask animated elements
    })
  })
})
