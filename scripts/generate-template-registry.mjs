import { readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const templatesDir = join(projectRoot, 'src', 'data', 'templates')
const outputPath = join(templatesDir, 'generated.ts')
const files = readdirSync(templatesDir)
  .filter((file) => extname(file) === '.json')
  .sort((a, b) => a.localeCompare(b))

const imports = files.map((file, index) => {
  const variable = `template${index}`
  return `import ${variable} from './${basename(file, '.json')}.json'`
})
const entries = files.map((file, index) => {
  const variable = `template${index}`
  return `  { file: '${basename(file, '.json')}', template: ${variable} }`
})

writeFileSync(
  outputPath,
  `${imports.join('\n')}\n\nexport const GENERATED_TEMPLATES = [\n${entries.join(',\n')}\n] as const\n`
)
