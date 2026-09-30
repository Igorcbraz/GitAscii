import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import esbuild from 'esbuild'
import prettier from 'prettier'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outfile = path.resolve(__dirname, 'dist/index.js')

async function build() {
  console.log('[Action Build] Building GitAscii standalone action with esbuild...')
  const startTime = Date.now()

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, 'src/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile,
    format: 'esm',
    minify: true,
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
    // Node built-ins are naturally external in platform: 'node'
    external: [],
    logLevel: 'info',
  })

  const prettierConfig = await prettier.resolveConfig(outfile)
  const bundle = await readFile(outfile, 'utf8')
  await writeFile(outfile, await prettier.format(bundle, { ...prettierConfig, filepath: outfile }))

  console.log(`[Action Build] Completed in ${Date.now() - startTime}ms -> action/dist/index.js`)
}

build().catch((err) => {
  console.error('[Action Build] Build failed:', err)
  process.exit(1)
})
