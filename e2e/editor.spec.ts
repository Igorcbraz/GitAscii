import { expect, test } from './fixtures/customFixture'

test.describe('GitAscii Visual Editor E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the editor for the default mocked user
    await page.goto('/Igorcbraz')
  })

  test('1. Application Loading: should load the editor with editor canvas and panels', async ({
    page,
  }) => {
    // Verify toolbar, sidebar, canvas, and properties panel are visible
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('aside').first()).toBeVisible() // Widget Library sidebar
    await expect(page.locator('main')).toBeVisible() // Canvas main area
    await expect(page.locator('[data-testid="canvas-svg-container"] > svg')).toBeVisible() // SVG preview rendered in canvas
  })

  test('2. Widget Creation: should allow adding a new widget from the library', async ({
    page,
  }) => {
    // Check templates tab and widgets tab buttons are available
    const widgetsTab = page.locator('[data-testid="widgets-tab-btn"]')
    await expect(widgetsTab).toBeVisible()

    // Bio widget is in our WIDGET_CATALOG. Let's add it.
    const addBioBtn = page.locator('[data-testid="add-widget-bio"]')
    await expect(addBioBtn).toBeVisible()
    await addBioBtn.click()

    // Check that the canvas now contains a bio widget
    const bioOnCanvas = page.locator('[data-testid="canvas-widget-bio"]')
    await expect(bioOnCanvas).toBeVisible()
  })

  test('3. Drag-and-drop & Position: should allow selecting and moving widgets via coordinates', async ({
    page,
  }) => {
    // Select the existing header widget in the canvas
    const headerOnCanvas = page.locator('[data-testid="canvas-widget-header"]')
    await expect(headerOnCanvas).toBeVisible()
    await headerOnCanvas.click()

    // Verify properties panel coordinates inputs are visible
    const xInput = page.locator('[data-testid="widget-x-input"]')
    const yInput = page.locator('[data-testid="widget-y-input"]')
    await expect(xInput).toBeVisible()
    await expect(yInput).toBeVisible()

    // Change position using input fields
    const initialXAttr = await headerOnCanvas.getAttribute('data-x')

    await xInput.fill('20')
    await xInput.press('Enter')
    await yInput.fill('30')
    await yInput.press('Enter')

    // Verify coordinates updated
    await expect(xInput).toHaveValue('20')
    await expect(yInput).toHaveValue('30')

    // Validate actual canvas state: data-x should have updated
    await expect(headerOnCanvas).toHaveAttribute('data-x', '20')
    await expect(headerOnCanvas).toHaveAttribute('data-y', '30')
  })

  test('4. Property Editing: should allow modifying widget specific options', async ({ page }) => {
    // Add bio widget
    await page.locator('[data-testid="add-widget-bio"]').click()

    // Select the bio widget in the canvas
    const bioOnCanvas = page.locator('[data-testid="canvas-widget-bio"]')
    await bioOnCanvas.click()

    // Verify custom bio textarea is visible in properties panel
    const bioInput = page.locator('[data-testid="widget-bio-input"]')
    await expect(bioInput).toBeVisible()

    // Fill bio information
    await bioInput.fill('Senior DevOps & Rust Builder')
    await bioInput.press('Tab')

    // Fill location
    const locationInput = page.locator('[data-testid="widget-location-input"]')
    await expect(locationInput).toBeVisible()
    await locationInput.fill('Tokyo, Japan')
    await locationInput.press('Tab')

    // Verify values remain populated
    await expect(bioInput).toHaveValue('Senior DevOps & Rust Builder')
    await expect(locationInput).toHaveValue('Tokyo, Japan')
    
    // Verify actual canvas rendering
    await expect(bioOnCanvas).toContainText('Senior DevOps & Rust Builder')
  })

  test('5. Templates: should allow changing layouts by applying templates', async ({ page }) => {
    // Switch to templates tab
    const templatesTab = page.locator('[data-testid="templates-tab-btn"]')
    await templatesTab.click()

    // Click preset minimal template
    const templateMinimal = page.locator('[data-testid="template-minimal"]')
    await expect(templateMinimal).toBeVisible()
    await templateMinimal.click()

    // Verify template shows as active
    await expect(templateMinimal.locator('text=Active')).toBeVisible()
  })

  test('6. Themes & Style customization: should allow customizing dimensions', async ({ page }) => {
    // Select the header widget
    const headerOnCanvas = page.locator('[data-testid="canvas-widget-header"]')
    await headerOnCanvas.click()

    // Custom width adjustments
    const widthInput = page.locator('[data-testid="widget-width-input"]')
    await expect(widthInput).toBeVisible()

    await widthInput.fill('600')
    await widthInput.press('Enter')

    // Verify width modified
    await expect(widthInput).toHaveValue('600')
    
    // Verify actual canvas state changed using DOM attribute
    await expect(headerOnCanvas).toHaveAttribute('data-width', '600')
  })

  test('7. Exporting: should trigger JSON layout download', async ({ page }) => {
    // Wait for download event when clicking export layout
    const downloadPromise = page.waitForEvent('download')

    const exportBtn = page.locator('[data-testid="export-layout-btn"]')
    await expect(exportBtn).toBeVisible()
    await exportBtn.click()

    const download = await downloadPromise

    // Verify download occurs and check name
    expect(download.suggestedFilename()).toContain('gitascii_layout_')
    expect(download.suggestedFilename()).toContain('.json')
  })

  test('8. Accessibility Audit: visual editor layout semantic and ARIA compliance', async ({
    checkAccessibility,
  }) => {
    await checkAccessibility()
  })

  test('9. Visual Snapshot Check: visual editor workspace consistency', async ({ page }) => {
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('editor-workspace.png', {
      maxDiffPixelRatio: 0.1,
      mask: [page.locator('iframe'), page.locator('video')],
    })
  })
})
