import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

import { fetchGitHubProfile } from '../src/features/github/api/fetchProfile'
import {
  DEFAULT_PUBLICATION_RULES,
  PUBLICATION,
  publicationKeys,
} from '../src/features/svg-publication/constants'
import { loadGitHubConfiguration } from '../src/features/svg-publication/server/githubConfiguration'
import { publishSource } from '../src/features/svg-publication/server/publishSource'
import { renderInProcess } from '../src/features/svg-publication/server/renderInProcess'
import { SnapshotStore } from '../src/features/svg-publication/server/snapshotStore'
import { loadPublicationSources } from '../src/features/svg-publication/server/sourceRepository'
import type { PublicationSource, SvgVariant } from '../src/features/svg-publication/types'
import { parseImageRequest } from '../src/features/svg-publication/utils/variants'
import { API_ENDPOINTS } from '../src/services/endpoints'

async function main() {
  if (!process.env.GITHUB_TOKEN)
    throw new Error('GITHUB_TOKEN is required; mock GitHub data must never be published')
  const directory = path.resolve('dist/publication')
  await mkdir(directory, { recursive: true })
  if ((await readdir(directory)).length && process.env.PUBLICATION_RESUME_LOCAL !== '1')
    throw new Error('Publication output directory must be empty')
  const store = new SnapshotStore(directory)
  if (process.env.PUBLICATION_RESUME_LOCAL === '1') {
    if (process.env.PUBLICATION_BOOTSTRAP !== '1')
      throw new Error('Local resume is only allowed during bootstrap')
    await store.resumeLocal()
  }
  const origin = process.env.PUBLICATION_ORIGIN
  const token = process.env.PUBLICATION_READ_TOKEN
  if (process.env.PUBLICATION_BOOTSTRAP === '1' && origin) {
    const check = await fetch(
      API_ENDPOINTS.PUBLICATION.ASSET(origin, API_ENDPOINTS.PUBLICATION.HEALTH),
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(15_000),
        redirect: 'error',
      }
    )
    if (check.status !== 404)
      throw new Error('Bootstrap refused: an existing publication must be restored')
  }
  if (process.env.PUBLICATION_BOOTSTRAP !== '1') {
    if (!origin || !token)
      throw new Error('Previous publication origin and read token are required')
    await store.restore(origin, token)
  }
  const started = Date.now()
  let stopping = false
  process.once('SIGINT', () => {
    stopping = true
  })
  const cursor = await store.readJson<{ username: string }>('__publication/cursor.json')
  const pageSize = Number(process.env.PUBLICATION_MAX_PROFILES || PUBLICATION.maxProfilesPerRun)
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > PUBLICATION.maxProfilesPerRun)
    throw new Error('Publication page size must be between 1 and 200')
  let sources = await loadPublicationSources(cursor?.username || '', pageSize)
  if (!sources.length && cursor?.username) sources = await loadPublicationSources('', pageSize)
  const queued: SvgVariant[] = []
  if (origin && token && process.env.PUBLICATION_BOOTSTRAP !== '1') {
    const queueCursor = await store.readJson<{ cursor: string }>('__publication/queue-cursor.json')
    const response = await fetch(
      API_ENDPOINTS.PUBLICATION.QUEUE(origin, queueCursor?.cursor || ''),
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(30_000),
        redirect: 'error',
      }
    )
    if (response.ok) {
      const page = (await response.json()) as { requests: SvgVariant[]; cursor: string }
      queued.push(...page.requests)
      await store.writeJson('__publication/queue-cursor.json', { cursor: page.cursor || '' })
    } else {
      await store.writeJson('__publication/queue-cursor.json', { cursor: '' })
      console.warn(`Publication queue unavailable: HTTP ${response.status}`)
    }
  }
  const sourceMap = new Map(sources.map((source) => [source.username, source]))
  if (process.env.PUBLICATION_SEED_USERNAME) {
    const seed = await loadPublicationSources(
      '',
      1,
      process.env.PUBLICATION_SEED_USERNAME.toLowerCase()
    )
    for (const source of seed) sourceMap.set(source.username, source)
  }
  const external =
    (await store.readJson<PublicationSource[]>('__publication/external-users.json')) || []
  for (const request of queued.slice(0, PUBLICATION.maxProfilesPerRun)) {
    const validationUrl = new URL(
      API_ENDPOINTS.SVG.CARD(request.username, request.profileSlug),
      'https://gitascii.com'
    )
    if (
      !parseImageRequest(validationUrl) ||
      !['dark', 'light'].includes(request.theme) ||
      !Array.isArray(request.widgets) ||
      request.widgets.length > PUBLICATION.maxWidgets
    )
      continue
    const key = publicationKeys.requests(request.username)
    const pending = (await store.readJson<SvgVariant[]>(key)) || []
    if (
      pending.length < PUBLICATION.maxRequestedVariants &&
      !pending.some((item) => JSON.stringify(item) === JSON.stringify(request))
    ) {
      await store.writeJson(key, [...pending, request])
    }
    if (!sourceMap.has(request.username)) {
      // A targeted read prevents a queued user outside this page from losing saved layouts.
      const matches = await loadPublicationSources('', 1, request.username)
      const saved = matches.find((source) => source.username === request.username)
      sourceMap.set(
        request.username,
        saved ||
          external.find((item) => item.username === request.username) || {
            username: request.username,
            profiles: [{ slug: request.profileSlug, isDefault: true, config: null }],
            rules: DEFAULT_PUBLICATION_RULES,
          }
      )
      if (!saved && !external.some((item) => item.username === request.username)) {
        external.push(sourceMap.get(request.username)!)
      }
    }
    const requestedSource = sourceMap.get(request.username)!
    if (!requestedSource.profiles.some((profile) => profile.slug === request.profileSlug)) {
      requestedSource.profiles.push({ slug: request.profileSlug, isDefault: false, config: null })
    }
  }
  const externalCursor = await store.readJson<{ offset: number }>(
    '__publication/external-cursor.json'
  )
  const externalOffset = (externalCursor?.offset || 0) % Math.max(1, external.length)
  const externalPage = [
    ...external.slice(externalOffset),
    ...external.slice(0, externalOffset),
  ].slice(0, PUBLICATION.maxProfilesPerRun)
  for (const source of externalPage) {
    if (!sourceMap.has(source.username)) sourceMap.set(source.username, source)
  }
  await store.writeJson('__publication/external-users.json', external)
  let published = 0
  let failed = 0
  let lastUsername = cursor?.username || ''
  let nextExternalOffset = externalOffset
  const orderedSources = [...sourceMap.values()].sort(
    (a, b) =>
      Number(b.username === process.env.PUBLICATION_SEED_USERNAME) -
      Number(a.username === process.env.PUBLICATION_SEED_USERNAME)
  )
  for (const source of orderedSources) {
    if (stopping || Date.now() - started > PUBLICATION.maxRunMs) break
    if (sources.some((item) => item.username === source.username)) lastUsername = source.username
    const externalIndex = external.findIndex((item) => item.username === source.username)
    if (externalIndex >= 0) nextExternalOffset = externalIndex + 1
    const hydrated = structuredClone(source)
    const requestedVariants = await store.readJson<SvgVariant[]>(
      publicationKeys.requests(source.username)
    )
    for (const request of requestedVariants || []) {
      if (!hydrated.profiles.some((profile) => profile.slug === request.profileSlug))
        hydrated.profiles.push({ slug: request.profileSlug, isDefault: false, config: null })
    }
    try {
      for (const profile of hydrated.profiles) {
        if (!profile.config)
          profile.config = await loadGitHubConfiguration(source.username, profile.slug)
      }
    } catch {
      console.error(
        `Saved configuration unavailable for ${source.username}; previous publication retained`
      )
      continue
    }
    const result = await publishSource(hydrated, {
      store,
      fetchData: (username) => fetchGitHubProfile(username, { publicOnly: true, fresh: true }),
      render: renderInProcess,
      rendererRevision: process.env.GITHUB_SHA || 'local',
      shouldStop: () => stopping || Date.now() - started > PUBLICATION.maxRunMs,
    })
    published += result.updated
    failed += result.failures.length
    console.log(
      JSON.stringify({
        username: source.username,
        published: result.updated,
        failures: result.failures.length,
      })
    )
    for (const failure of result.failures)
      console.error(JSON.stringify({ username: source.username, ...failure }))
  }
  await store.writeJson('__publication/cursor.json', { username: lastUsername })
  await store.writeJson('__publication/external-cursor.json', { offset: nextExternalOffset })
  const totals = await store.finalize()
  console.log(JSON.stringify({ published, failed, ...totals }))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Publication failed')
  process.exitCode = 1
})
