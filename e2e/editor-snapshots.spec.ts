import { test, expect } from './fixtures/customFixture'

test.describe('GitAscii Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Igorcbraz')
    await page.waitForLoadState('networkidle')
    // Hide standard elements that could cause flakiness (videos/iframes)
    await page.addStyleTag({ content: 'iframe, video { visibility: hidden !important; }' })
  })

  test.skip('Layers Panel Snapshot', async ({ page }) => {
    // Open layers panel
    await page.locator('[data-testid="layers-tab-btn"]').click({ force: true })
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('layers-panel.png', {
      maxDiffPixelRatio: 0.1,
    })
  })

  test('Canvas States - Single Selection', async ({ page }) => {
    // Select the first widget
    const firstWidget = page.locator('[data-testid="canvas-widget-header"]')
    await firstWidget.click({ force: true })
    await page.waitForTimeout(500)
    
    // Snapshot only the canvas area
    await expect(page.locator('[data-testid="canvas-svg-container"]')).toHaveScreenshot('canvas-single-selection.png', {
      maxDiffPixelRatio: 0.1,
    })
  })

  test('Canvas States - Empty Canvas', async ({ page }) => {
    // We can clear the canvas by deleting all widgets
    // Click header and delete
    await page.locator('[data-testid="canvas-widget-header"]').click({ force: true })
    await page.keyboard.press('Delete')
    
    // Find all other widgets and delete them if there are any default ones
    const widgets = page.locator('g[data-widget-id]')
    const count = await widgets.count()
    for (let i = 0; i < count; i++) {
      await widgets.first().click({ force: true })
      await page.keyboard.press('Delete')
    }
    
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="canvas-svg-container"]')).toHaveScreenshot('canvas-empty.png', {
      maxDiffPixelRatio: 0.1,
    })
  })

  test('Dark Theme Snapshot', async ({ page }) => {
    // Toggle dark theme if there is a button, or force class on html/body
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('dark-theme.png', {
      maxDiffPixelRatio: 0.1,
    })
  })

  test('Drag and Resize Scenarios', async ({ page }) => {
    const widget = page.locator('[data-testid="canvas-widget-header"]')
    
    // Simulate drag via evaluate to store since userEvent mouse moves are flaky in E2E sometimes
    // But we'll try native first
    await widget.hover({ force: true })
    await page.mouse.down()
    await page.mouse.move(500, 500)
    await page.mouse.up()
    
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="canvas-svg-container"]')).toHaveScreenshot('canvas-drag-moved.png', {
      maxDiffPixelRatio: 0.1,
    })
    
    // Simulate resize
    await widget.click({ force: true })
    const resizeHandle = page.locator('.react-resizable-handle').first()
    if (await resizeHandle.isVisible()) {
      await resizeHandle.hover({ force: true })
      await page.mouse.down()
      await page.mouse.move(800, 800)
      await page.mouse.up()
      
      await page.waitForTimeout(500)
      await expect(page.locator('[data-testid="canvas-svg-container"]')).toHaveScreenshot('canvas-drag-resized.png', {
        maxDiffPixelRatio: 0.1,
      })
    }
  })
})
