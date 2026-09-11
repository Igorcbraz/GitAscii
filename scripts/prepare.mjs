import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

try {
  require.resolve('husky')
  execFileSync('husky', { stdio: 'inherit' })
} catch {
  // Production build environments may omit devDependencies.
}
