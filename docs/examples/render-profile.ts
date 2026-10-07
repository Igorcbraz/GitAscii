import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { NormalizedGitHubData, SavedConfiguration } from '@/engine'
import { createConfiguration, processExternalAssets, renderSvg } from '@/engine'

const [configPath, dataPath, outputPath = 'scratch/docs-render'] = process.argv.slice(2)
if (!configPath || !dataPath) {
  throw new Error(
    'Usage: tsx docs/examples/render-profile.ts <config.json> <data.json> [output-dir]'
  )
}

// Inputs are trusted local files. Type assertions do not validate arbitrary JSON.
const input = JSON.parse(await readFile(configPath, 'utf8')) as Partial<SavedConfiguration>
const data = JSON.parse(await readFile(dataPath, 'utf8')) as NormalizedGitHubData
const base = createConfiguration(data.user.id, data.user.login, input.templateId || 'native')
const config: SavedConfiguration = {
  ...base,
  ...input,
  globalStyles: { ...base.globalStyles, ...input.globalStyles },
  metadata: { ...base.metadata, ...input.metadata },
}

const outputDir = resolve(outputPath)
await mkdir(outputDir, { recursive: true })
for (const theme of ['dark', 'light'] as const) {
  const result = await processExternalAssets(renderSvg(config, data, { theme }))
  if (result.hasErrors) throw new Error(`External assets failed: ${result.failedUrls?.join(', ')}`)
  const target = resolve(outputDir, `${theme}.svg`)
  await writeFile(target, result.svg)
  console.log(target)
}
