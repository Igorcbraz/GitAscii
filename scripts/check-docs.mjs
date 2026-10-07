import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const docs = path.join(root, 'docs')
const config = JSON.parse(fs.readFileSync(path.join(docs, 'docs.json'), 'utf8'))
const legacy = JSON.parse(fs.readFileSync(path.join(docs, 'mint.json'), 'utf8'))
const pages = config.navigation.tabs.flatMap((tab) => tab.groups.flatMap((group) => group.pages))
const legacyPages = legacy.navigation.flatMap((group) => group.pages)
const errors = []
const pageSet = new Set(pages)
if (pageSet.size !== pages.length) errors.push('Duplicate page in docs.json navigation')
if (JSON.stringify(pages) !== JSON.stringify(legacyPages))
  errors.push('Mintlify navigation configurations differ')
for (const page of pages) {
  const file = path.join(docs, `${page}.mdx`)
  if (!fs.existsSync(file)) {
    errors.push(`Missing page: ${page}`)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  if (!/^---\r?\n[\s\S]*?title: [^\n]+[\s\S]*?description: [^\n]+[\s\S]*?\r?\n---/.test(content))
    errors.push(`Missing frontmatter: ${page}`)
  const prose = content.replace(/```[\s\S]*?```/g, '')
  if (/^# /m.test(prose)) errors.push(`Duplicate H1 below frontmatter: ${page}`)
  const links = [...prose.matchAll(/(?:\]\(|href=["'])(\/[^\s)"']+)/g)].map(
    (match) => match[1].split(/[?#]/)[0]
  )
  for (const link of links) {
    if (link === '/') continue
    const target = path.join(docs, link.slice(1))
    if (!pageSet.has(link.slice(1)) && !fs.existsSync(target))
      errors.push(`Unresolved internal link: ${page} -> ${link}`)
  }
}
const ids = [
  ...fs
    .readFileSync(path.join(root, 'src/constants/widgetIds.ts'), 'utf8')
    .split('export const WIDGET_CATEGORIES')[0]
    .matchAll(/^\s+\w+: '([^']+)'/gm),
].map((match) => match[1])
const catalog = fs.readFileSync(path.join(docs, 'widgets/overview.mdx'), 'utf8')
for (const id of ids) {
  if (!catalog.includes(`\`${id}\``)) errors.push(`Catalog missing widget ID: ${id}`)
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    `Documentation structure: ${pages.length} pages, ${ids.length} widget IDs, navigation and local links consistent`
  )
}
