import { expect, test } from '@playwright/test'

for (const [path, endpoint, interval] of [
  ['/pro', '/api/pro/overview', 30_000],
  ['/pro/analytics', '/api/pro/analytics', 15_000],
] as const) {
  test(`${path}: hidden page sends no periodic requests and resumes when visible`, async ({
    page,
  }) => {
    let requests = 0
    page.on('pageerror', (error) => console.error('Browser error:', error.message))
    await page.clock.install()
    await page.addInitScript(() => {
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        localStorage.setItem('gitascii_analytics_consent', 'denied')
        localStorage.setItem('gitascii_lang', 'pt')
      }
      let state = 'visible'
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
      Object.assign(window, {
        setTestVisibility: (value: string) => {
          state = value
        },
      })
    })
    await page.route('**/api/**', async (route) => {
      const pathname = new URL(route.request().url()).pathname
      if (pathname === endpoint) {
        requests++
        // Exercise the real mounted dashboard's refresh behavior, including error handling.
        await route.fulfill({ status: 503, json: { error: 'Test response; no backend access' } })
      } else if (pathname === '/api/auth/session') {
        await route.fulfill({
          json: { session: { username: 'cache-test', githubId: 1, tier: 'pro', isPro: true } },
        })
      } else {
        await route.fulfill({
          json: { profiles: [], errors: [], count: 0, usernames: [], installed: true },
        })
      }
    })
    await page.goto(path)
    await expect.poll(() => requests, { timeout: 60_000 }).toBeGreaterThan(0)
    await expect(page.locator('h1').first()).toBeAttached()
    await page.clock.runFor(2 * interval)
    const beforeHidden = requests
    expect(beforeHidden).toBeGreaterThan(1)

    await page.evaluate(() => {
      ;(window as unknown as { setTestVisibility: (state: string) => void }).setTestVisibility(
        'hidden'
      )
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await page.clock.fastForward(10 * 60_000)
    expect(requests).toBe(beforeHidden)

    await page.evaluate(() => {
      ;(window as unknown as { setTestVisibility: (state: string) => void }).setTestVisibility(
        'visible'
      )
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await page.clock.runFor(interval)
    await expect.poll(() => requests).toBeGreaterThan(beforeHidden)

    // Even a visible tab must become idle without user interaction.
    await page.clock.fastForward(3 * 60_000)
    const afterIdle = requests
    await page.clock.fastForward(60 * 60_000)
    expect(requests).toBe(afterIdle)
    await page.evaluate(() => document.dispatchEvent(new Event('pointerdown')))
    await page.clock.runFor(interval)
    await expect.poll(() => requests).toBeGreaterThan(afterIdle)

    await page.goto('about:blank')
    const afterUnmount = requests
    await page.clock.runFor(2 * interval)
    expect(requests).toBe(afterUnmount)
  })
}
