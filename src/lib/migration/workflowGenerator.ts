import { MIGRATION_TEMPLATES } from '@/constants'
import type { SavedConfiguration } from '@/engine/types'

export const DEFAULT_ACTION_SHA = process.env.GITASCII_ACTION_SHA || 'main'

const DYNAMIC_WIDGET_IDS = new Set([
  'stats-cards',
  'streak-graph',
  'top-languages',
  'recent-activity',
  'contribution-heatmap',
  'contribution-snake',
  'repositories',
  'trophy',
  'github-readme-stats',
])

export function shouldIncludeSchedule(config: SavedConfiguration | null | undefined): boolean {
  if (!config || !Array.isArray(config.widgets)) return false
  return config.widgets.some(
    (w) => w && w.visible && (DYNAMIC_WIDGET_IDS.has(w.widgetId) || w.widgetId?.includes('stats'))
  )
}

function getPseudoHash(str: string) {
  let h1 = 0xdeadbeef ^ str.length,
    h2 = 0x41c6ce57 ^ str.length
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return [h1 >>> 0, h2 >>> 0]
}

export function computeDeterministicCron(username: string): string {
  const [h1, h2] = getPseudoHash(username.toLowerCase())
  const minute = h1 % 60
  const hour = h2 % 24
  return `${minute} ${hour} * * *`
}

export function computeProCron(username: string): string {
  const [h1] = getPseudoHash(username.toLowerCase())
  return `${h1 % 60} * * * *`
}

export function generateWorkflowYaml(
  username: string,
  config: SavedConfiguration | null | undefined,
  options: {
    actionSha?: string
    isPro?: boolean
    profileSlug?: string
    forceSchedule?: boolean
  } = {}
): string {
  const actionSha = options.actionSha || DEFAULT_ACTION_SHA
  const hasDynamicWidgets = options.forceSchedule || shouldIncludeSchedule(config)
  const cronExpression = options.isPro
    ? computeProCron(username)
    : computeDeterministicCron(username)

  const scheduleBlock = hasDynamicWidgets
    ? `
  schedule:
    - cron: '${cronExpression}'`
    : ''

  const idTokenPermission = options.isPro ? '\n  id-token: write' : ''
  const proTelemetryParam = options.isPro
    ? '\n          pro_telemetry: true\n          refresh_minutes: 60'
    : ''
  const profileSlugParam =
    options.profileSlug && options.profileSlug !== 'default'
      ? `\n          profile_slug: ${options.profileSlug}`
      : ''

  return `name: ${MIGRATION_TEMPLATES.WORKFLOW.NAME}

on:
  workflow_dispatch:${scheduleBlock}

permissions:
  contents: write${idTokenPermission}

concurrency:
  group: ${MIGRATION_TEMPLATES.WORKFLOW.CONCURRENCY_GROUP}
  cancel-in-progress: true

jobs:
  publish:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: ${MIGRATION_TEMPLATES.WORKFLOW.STEP_NAME}
        uses: ${MIGRATION_TEMPLATES.WORKFLOW.ACTION_REPO}@${actionSha}
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}${profileSlugParam}${proTelemetryParam}
`
}
