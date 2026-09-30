import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

const root = path.resolve('src')

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(filename) : [filename]
  })
}

const sources = walk(root).filter(
  (file) => /\.tsx?$/.test(file) && !/\.(test|spec)\.tsx?$/.test(file)
)
const stories = sources.filter((file) => /\.stories\.tsx?$/.test(file))
const sourceSet = new Set(sources)
const nonVisual = new Set([
  'src/features/mascot/components/StrobiProvider.tsx',
  'src/lib/analytics/ConsentControlledScripts.tsx',
  'src/lib/analytics/web-vitals.tsx',
])

function resolveImport(from, specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return undefined
  const base = specifier.startsWith('@/')
    ? path.join(root, specifier.slice(2))
    : path.resolve(path.dirname(from), specifier)
  return [
    base + '.tsx',
    base + '.ts',
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ].find((candidate) => sourceSet.has(candidate) && existsSync(candidate))
}

const imports = new Map()
for (const file of sources) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const dependencies = new Set()
  for (const statement of source.statements) {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const dependency = resolveImport(file, statement.moduleSpecifier.text)
      if (dependency) dependencies.add(dependency)
    }
  }
  function inspect(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      const dependency = resolveImport(file, node.arguments[0].text)
      if (dependency) dependencies.add(dependency)
    }
    ts.forEachChild(node, inspect)
  }
  inspect(source)
  imports.set(file, dependencies)
}

const composed = new Set()
function visit(file) {
  if (composed.has(file)) return
  composed.add(file)
  for (const dependency of imports.get(file) ?? []) visit(dependency)
}
stories.forEach(visit)

const candidates = sources.filter(
  (file) =>
    file.endsWith('.tsx') &&
    !file.endsWith('.stories.tsx') &&
    !/[\\/]app[\\/].*[\\/](?:page|layout|loading|error|not-found|template|opengraph-image|icon)\.tsx$/.test(
      file
    ) &&
    !/[\\/]app[\\/](?:page|layout|global-error|not-found|opengraph-image)\.tsx$/.test(file) &&
    !nonVisual.has(path.relative(process.cwd(), file).replaceAll('\\', '/'))
)

const direct = candidates.filter((file) => sourceSet.has(file.replace(/\.tsx$/, '.stories.tsx')))
const inherited = candidates.filter((file) => !direct.includes(file) && composed.has(file))
const missing = candidates.filter((file) => !composed.has(file))
const relative = (file) => path.relative(process.cwd(), file).replaceAll('\\', '/')

const report = {
  stories: stories.length,
  components: candidates.length,
  direct: direct.length,
  composed: inherited.length,
  uncovered: missing.length,
  files: missing.map(relative),
}

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
} else {
  process.stdout.write(
    `Stories: ${report.stories}; components: ${report.components}; direct: ${report.direct}; composed: ${report.composed}; uncovered: ${report.uncovered}\n`
  )
  missing.forEach((file) => process.stdout.write(`${relative(file)}\n`))
}

if (process.argv.includes('--check') && missing.length > 0) process.exitCode = 1
