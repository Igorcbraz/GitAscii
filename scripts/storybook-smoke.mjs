import { chromium } from 'playwright'

const origin =
  process.argv.find((arg) => arg.startsWith('--url='))?.slice(6) ??
  process.env.STORYBOOK_URL ??
  'http://localhost:6006'
const representativeCases = [
  ['landing-hero--anonymous', ''],
  ['brand-gitascii-avatar--animated', ''],
  ['ui-visual-primitives--spotlight', 'Interactive surface'],
  ['landing-sections--mini-editor', ''],
  ['pages-content--widget-detail', ''],
  ['pro-analytics-sections--geography-with-data', ''],
  ['pro-layout-authenticated-shell--pro-member', 'Overview'],
  ['emails-daily-digest--with-activity', ''],
]

const explicitIds = process.argv
  .filter((arg) => arg.startsWith('--id='))
  .map((arg) => [arg.slice(5), ''])

const cases =
  explicitIds.length > 0
    ? explicitIds
    : process.argv.includes('--all') ||
        process.argv.includes('--dashboards') ||
        process.argv.includes('--emails') ||
        process.argv.includes('--catalog')
      ? Object.values((await (await fetch(`${origin}/index.json`)).json()).entries)
          .filter(
            (entry) =>
              entry.type === 'story' &&
              (process.argv.includes('--catalog')
                ? true
                : process.argv.includes('--dashboards')
                  ? /^Pro\/Dashboards\//.test(entry.title)
                  : process.argv.includes('--emails')
                    ? /^Emails\//.test(entry.title)
                    : /^(?:Brand\/GitAscii Avatar|UI\/Visual Primitives|Landing\/(?:Hero|Sections)|Pages\/Content|Mascot\/Landing Companion|Pro\/(?:Analytics\/Sections|Layout\/Authenticated Shell|Dashboards\/.*)|Emails\/.*)$/.test(
                        entry.title
                      ))
          )
          .map((entry) => [entry.id, ''])
      : representativeCases

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
let failures = 0

for (const [id, expected] of cases) {
  const errors = []
  const onError = (error) => errors.push(error.message)
  page.on('pageerror', onError)
  try {
    await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story`, {
      waitUntil: 'domcontentloaded',
    })
    await page.locator('#storybook-root > *').first().waitFor({ state: 'attached', timeout: 8000 })
    if (expected)
      await page.getByText(expected, { exact: false }).first().waitFor({ timeout: 8000 })
    if (id === 'pro-modals-profileversionhistorymodal--default')
      await page.getByText('Improved project layout').waitFor({ timeout: 8000 })
    if (id === 'pro-modals-profileversionhistorymodal--no-snapshots')
      await page
        .getByText(/No Version Checkpoints Yet|Nenhum Ponto de Controle Encontrado/)
        .waitFor({ timeout: 8000 })
    if (id.startsWith('emails-')) {
      await page.waitForFunction(
        (threshold) =>
          (document.querySelector('iframe[title="Email preview"]')?.contentDocument?.body?.innerText
            .length ?? 0) > threshold,
        id.startsWith('emails-components-') ? 0 : 80,
        { timeout: 8000 }
      )
    }
    await page.waitForTimeout(400)
    if (
      (await page.locator('body').innerText()).includes('The component failed to render properly')
    ) {
      throw new Error('Storybook displayed its rendering error panel')
    }
    if (id === 'landing-hero--anonymous') {
      const family = await page
        .locator('.font-pt-serif')
        .first()
        .evaluate((element) => getComputedStyle(element).fontFamily)
      await page.evaluate(() => document.fonts.ready)
      const loaded = await page.evaluate(() => document.fonts.check('16px "GitAscii PT Serif"'))
      if (!family.includes('GitAscii PT Serif') || !loaded)
        errors.push(`PT Serif unavailable: ${family}; loaded=${loaded}`)
    }
    if (errors.length > 0) throw new Error(errors.join(' | '))
    process.stdout.write(`PASS ${id}\n`)
  } catch (error) {
    failures += 1
    const body = (await page.locator('body').innerText()).slice(0, 400)
    process.stderr.write(
      `FAIL ${id}: ${error.message}; body=${JSON.stringify(body)}; errors=${JSON.stringify(errors)}\n`
    )
  } finally {
    page.off('pageerror', onError)
  }
}

await browser.close()
if (failures > 0) process.exitCode = 1
