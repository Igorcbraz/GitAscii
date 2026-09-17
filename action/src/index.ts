import * as core from '@actions/core'
import * as github from '@actions/github'

import { renderSvg } from '@/engine/core/SVGEngine'
import { processExternalAssets } from '@/engine/inliner/externalAssetInliner'

import { fetchGitHubDataForAction } from './dataFetcher'
import { GitOpsService } from './gitOps'
import {
  DEFAULT_PUBLISH_INTERVAL_MINUTES,
  DEFAULT_TELEMETRY_URL,
  getPublishPolicy,
  sendProTelemetry,
} from './oidcTelemetry'

const ACTION_BRANCH_NAME = 'gitascii'
const ACTION_INPUT_ENABLED = 'true'

function getPublishStatus(result: {
  committed: boolean
  staleSkipped: boolean
}): 'published' | 'skipped_stale' | 'svg_unchanged' {
  if (result.committed) return 'published'
  if (result.staleSkipped) return 'skipped_stale'
  return 'svg_unchanged'
}

async function run(): Promise<void> {
  const startTime = Date.now()
  let hasErrors = false
  const failedUrls: string[] = []
  const profileResults: Array<{
    slug: string
    hasErrors: boolean
    failedUrls?: string[]
  }> = []

  try {
    const token = core.getInput('github_token') || process.env.GITHUB_TOKEN
    if (!token) {
      throw new Error('Missing GITHUB_TOKEN input or environment variable')
    }

    const targetProfileSlug = core.getInput('profile_slug') || ''
    const proTelemetry = core.getInput('pro_telemetry') === ACTION_INPUT_ENABLED
    const telemetryUrl = core.getInput('telemetry_url') || DEFAULT_TELEMETRY_URL
    const requestedRefreshMinutes = Math.max(
      1,
      Number(core.getInput('refresh_minutes')) || DEFAULT_PUBLISH_INTERVAL_MINUTES
    )

    const { owner, repo } = github.context.repo
    const branchName = ACTION_BRANCH_NAME

    console.log(`[GitAscii Action] Initializing publication for ${owner}/${repo}...`)

    const gitOps = new GitOpsService(owner, repo, token)
    const { exists, configs, branchState } = await gitOps.getAllProfileConfigs(branchName)

    if (!exists) {
      throw new Error(
        `Branch '${branchName}' not found in ${owner}/${repo}. Please complete onboarding via GitAscii Studio first.`
      )
    }

    const minimumIntervalMinutes = await getPublishPolicy(telemetryUrl)
    const effectiveIntervalMinutes = Math.max(requestedRefreshMinutes, minimumIntervalMinutes)
    const lastPublishedAt = configs.length > 0 ? branchState.latestCommitDate : undefined
    const isScheduledRun = github.context.eventName === 'schedule'
    if (isScheduledRun && lastPublishedAt) {
      const elapsedMinutes = (Date.now() - new Date(lastPublishedAt).getTime()) / 60_000
      if (elapsedMinutes < effectiveIntervalMinutes) {
        core.setOutput('status', 'skipped_interval')
        core.setOutput('svg_changed', 'false')
        console.log(
          `[GitAscii Action] Refresh skipped; effective interval is ${effectiveIntervalMinutes} minutes.`
        )
        return
      }
    }

    if (configs.length === 0) {
      throw new Error(
        `No valid configuration files (gitascii*.json) found on branch '${branchName}'.`
      )
    }

    const targetConfigs = targetProfileSlug
      ? configs.filter((c) => c.slug.toLowerCase() === targetProfileSlug.toLowerCase())
      : configs

    if (targetConfigs.length === 0) {
      throw new Error(
        `Target profile '${targetProfileSlug}' was not found in branch '${branchName}'.`
      )
    }

    console.log(`[GitAscii Action] Fetching fresh GitHub data for @${owner}...`)
    const data = await fetchGitHubDataForAction(owner, token)

    const filesToCommit: Array<{ path: string; content: string }> = []
    let latestRevision = String(Date.now())

    for (const item of targetConfigs) {
      const config = item.config
      const slug = item.slug
      const profileFailedUrls: string[] = []
      const rev = config.metadata?.revision || config.metadata?.updatedAt || String(Date.now())
      latestRevision = rev

      console.log(`[GitAscii Action] Rendering dark & light SVGs for profile '${slug}'...`)

      const rawDarkSvg = renderSvg(config, data, { theme: 'dark' })
      const darkProcessed = await processExternalAssets(rawDarkSvg)

      if (darkProcessed.hasErrors) {
        hasErrors = true
        if (darkProcessed.failedUrls) {
          failedUrls.push(...darkProcessed.failedUrls)
          profileFailedUrls.push(...darkProcessed.failedUrls)
        }
      }

      const rawLightSvg = renderSvg(config, data, { theme: 'light' })
      const lightProcessed = await processExternalAssets(rawLightSvg)

      if (lightProcessed.hasErrors) {
        hasErrors = true
        if (lightProcessed.failedUrls) {
          failedUrls.push(...lightProcessed.failedUrls)
          profileFailedUrls.push(...lightProcessed.failedUrls)
        }
      }

      if (!darkProcessed.svg.includes('<svg') || !darkProcessed.svg.includes('</svg>')) {
        throw new Error(`Dark SVG output is invalid for profile '${slug}'`)
      }
      if (!lightProcessed.svg.includes('<svg') || !lightProcessed.svg.includes('</svg>')) {
        throw new Error(`Light SVG output is invalid for profile '${slug}'`)
      }

      filesToCommit.push(
        {
          path: `profiles/${slug}/dark.svg`,
          content: darkProcessed.svg,
        },
        {
          path: `profiles/${slug}/light.svg`,
          content: lightProcessed.svg,
        }
      )
      profileResults.push({
        slug,
        hasErrors: profileFailedUrls.length > 0,
        failedUrls: profileFailedUrls.length > 0 ? [...new Set(profileFailedUrls)] : undefined,
      })
    }

    console.log(
      `[GitAscii Action] Committing SVGs for ${targetConfigs.length} profile(s) atomically to branch '${branchName}'...`
    )
    const result = await gitOps.publishAtomic(
      branchName,
      filesToCommit,
      targetConfigs.length === 1 && targetConfigs[0].path === 'gitascii.json'
        ? latestRevision
        : undefined,
      `Update GitAscii profiles (${targetConfigs.map((c) => c.slug).join(', ')}) SVGs [skip ci]`
    )

    const status = getPublishStatus(result)
    core.setOutput('published_revision', latestRevision)
    core.setOutput('svg_changed', String(!result.unchanged))
    core.setOutput('status', status)

    const durationMs = Date.now() - startTime
    console.log(`[GitAscii Action] Finished in ${durationMs}ms with status: ${status}`)

    if (proTelemetry) {
      await sendProTelemetry(telemetryUrl, {
        repository: `${owner}/${repo}`,
        workflow: github.context.workflow,
        runId: String(github.context.runId),
        revision: latestRevision,
        durationMs,
        status,
        hasErrors,
        failedUrls: failedUrls.length > 0 ? [...new Set(failedUrls)] : undefined,
        profileSlug: targetConfigs.length === 1 ? targetConfigs[0].slug : undefined,
        profiles: profileResults.map((profile) => ({ ...profile, status })),
      })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    if (core.getInput('pro_telemetry') === ACTION_INPUT_ENABLED) {
      await sendProTelemetry(core.getInput('telemetry_url') || DEFAULT_TELEMETRY_URL, {
        repository: `${github.context.repo.owner}/${github.context.repo.repo}`,
        workflow: github.context.workflow,
        runId: String(github.context.runId),
        revision: String(Date.now()),
        durationMs: Date.now() - startTime,
        status: 'failed',
        hasErrors: true,
        profileSlug: core.getInput('profile_slug') || undefined,
      })
    }
    core.setFailed(message)
  }
}

void run()
