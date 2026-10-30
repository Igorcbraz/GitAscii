import { spawn } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'

// Prevent Next's automatic .env loading from reaching production in browser tests.
const env = { ...process.env }
for (const name of readdirSync('.').filter((file) => /^\.env(?:\.|$)/.test(file))) {
  for (const line of readFileSync(name, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=/)
    if (match) env[match[1]] = ''
  }
}
for (const key of Object.keys(env)) {
  if (
    /^(DATABASE_|TEST_DATABASE_|UPSTASH_|GITHUB_|STRIPE_|RESEND_|SENTRY_|NEXT_PUBLIC_)/.test(key)
  ) {
    env[key] = ''
  }
}
env.NEXT_TELEMETRY_DISABLED = '1'
env.NODE_ENV = process.argv.includes('--build') ? 'production' : 'development'
const child = spawn(
  process.execPath,
  [
    process.argv.includes('--vinext')
      ? 'node_modules/vinext/dist/cli.js'
      : 'node_modules/next/dist/bin/next',
    ...(process.argv.includes('--build')
      ? process.argv.includes('--vinext')
        ? ['build']
        : ['build', '--webpack']
      : ['dev', '--webpack', '--port', '3107']),
  ],
  {
    env,
    stdio: 'inherit',
    windowsHide: true,
  }
)
child.on('exit', (code) => process.exit(code ?? 1))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
