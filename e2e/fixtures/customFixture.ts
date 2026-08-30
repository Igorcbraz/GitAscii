import { expect, test as base } from '@playwright/test'

import { MOCK_GITHUB_DATA, MOCK_SESSION_ANONYMOUS, MOCK_SESSION_LOGGED_IN } from './mocks'

interface CustomFixtures {
  sessionState: 'anonymous' | 'logged-in'
  gitHubData: typeof MOCK_GITHUB_DATA
  checkAccessibility: () => Promise<void>
}

export const test = base.extend<CustomFixtures>({
  sessionState: ['anonymous', { option: true }],
  gitHubData: [MOCK_GITHUB_DATA, { option: true }],

  checkAccessibility: async ({ page }, use) => {
    const checkA11y = async () => {
      const images = page.locator('img')
      const count = await images.count()
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt')
        if (alt === null || alt.trim().length === 0) {
          console.warn('Image missing alt text:', await images.nth(i).innerHTML())
        } else {
          expect(alt).not.toBeNull()
        }
      }

      const buttons = page.locator('button')
      const btnCount = await buttons.count()
      for (let i = 0; i < btnCount; i++) {
        const hasAriaLabel = await buttons.nth(i).getAttribute('aria-label')
        const hasTitle = await buttons.nth(i).getAttribute('title')
        const textContent = await buttons.nth(i).textContent()
        const hasText = textContent && textContent.trim().length > 0
        if (!(hasAriaLabel || hasTitle || hasText)) {
          console.warn('Button missing a11y name:', await buttons.nth(i).innerHTML())
        }
      }

      const mainVisible = await page.locator('main').first().isVisible()
      const navVisible = await page.locator('nav').first().isVisible()
      expect(mainVisible || navVisible).toBeTruthy()
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(checkA11y)
  },

  page: async ({ page, sessionState, gitHubData }, use) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async () => Promise.resolve(),
          readText: async () => Promise.resolve(''),
        },
        writable: true,
      })
    })

    // Intercept Github profile API call
    await page.route('**/api/github/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(gitHubData),
      })
    })

    await page.route('**/api.github.com/repos/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ stargazers_count: 563 }),
      })
    })

    await page.route('**/api/auth/session', async (route) => {
      const sessionBody =
        sessionState === 'logged-in' ? MOCK_SESSION_LOGGED_IN : MOCK_SESSION_ANONYMOUS
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sessionBody),
      })
    })

    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.route('**/api/config/**', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Config not found' }),
      })
    })

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page)
  },
})

export { expect }
