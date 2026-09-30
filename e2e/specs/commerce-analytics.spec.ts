import { expect, test } from '../fixtures/customFixture'

test('checkout cancellation asks for an optional reason only once', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gitascii_analytics_consent', 'granted')
  })
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ session: { username: 'tester', githubId: 123, tier: 'free' } }),
    })
  )
  await page.route('**/api/pro/social-proof', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"count":0,"usernames":[]}',
    })
  )

  await page.goto('/pro?checkout=cancelled')
  const dialog = page.getByRole('dialog', { name: /stopped your purchase|impediu sua compra/i })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: /preço|price/i })).toBeFocused()
  await dialog.getByRole('button', { name: /preço|price/i }).click()
  await expect(dialog).toBeHidden()

  await page.reload()
  await expect(dialog).toBeHidden()
})
