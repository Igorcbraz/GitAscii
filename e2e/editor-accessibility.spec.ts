import AxeBuilder from '@axe-core/playwright'

import { expect, test } from './fixtures/customFixture'

const disabledRules = [
  'color-contrast',
  'button-name',
  'landmark-unique',
  'page-has-heading-one',
  'region',
  'heading-order',
  'link-name',
  'empty-heading',
  'image-alt',
  'label',
]

test.describe('GitAscii Accessibility Tests', () => {
  test('Editor Page Accessibility', async ({ page }) => {
    await page.goto('/Igorcbraz')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(disabledRules)
      .analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Landing Page Accessibility', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(disabledRules)
      .analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Templates Tab Accessibility', async ({ page }) => {
    await page.goto('/Igorcbraz')
    await page.waitForLoadState('networkidle')
    await page.locator('[data-testid="templates-tab-btn"]').click()

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(disabledRules)
      .analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Explore Tab Accessibility', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(disabledRules)
      .analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})
