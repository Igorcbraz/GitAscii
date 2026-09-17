import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

if (process.env.CI || process.env.CF_PAGES || process.env.NODE_ENV === 'production') {
  process.exit(0)
}

try {
  require.resolve('husky')
  execFileSync('husky', { stdio: 'inherit' })
} catch {
  // Production build environments may omit devDependencies.
}
