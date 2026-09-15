import crypto from 'node:crypto'

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

export function computeDeterministicCron(username: string): string {
  const hash = crypto.createHash('sha256').update(username.toLowerCase()).digest()
  const minute = hash.readUInt8(0) % 60
  const hour = hash.readUInt8(1) % 24
  return `${minute} ${hour} * * *`
}

export function generateWorkflowYaml(
  username: string,
  config: SavedConfiguration | null | undefined,
  options: {
    actionSha?: string
    isPro?: boolean
    profileSlug?: string
  } = {}
): string {
  const actionSha = options.actionSha || DEFAULT_ACTION_SHA
  const hasDynamicWidgets = shouldIncludeSchedule(config)
  const cronExpression = computeDeterministicCron(username)

  const scheduleBlock = hasDynamicWidgets
    ? `
  schedule:
    - cron: '${cronExpression}'`
    : ''

  const idTokenPermission = options.isPro ? '\n  id-token: write' : ''
  const proTelemetryParam = options.isPro ? '\n          pro_telemetry: true' : ''
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
