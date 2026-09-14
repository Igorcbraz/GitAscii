import { createHash } from 'node:crypto'

import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'

import { PUBLICATION, publicationKeys } from '../constants'
import type {
  PublicationManifest,
  PublicationSource,
  PublicationStore,
  RenderedPublication,
  SvgVariant,
} from '../types'
import { baseVariants, variantId } from '../utils/variants'

interface PublisherDependencies {
  store: PublicationStore
  fetchData: (username: string) => Promise<NormalizedGitHubData>
  render: (
    config: SavedConfiguration | null,
    data: NormalizedGitHubData,
    variant: SvgVariant
  ) => Promise<RenderedPublication>
  now?: () => number
  rendererRevision: string
  shouldStop?: () => boolean
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export async function publishSource(source: PublicationSource, deps: PublisherDependencies) {
  const { store } = deps
  const now = deps.now?.() ?? Date.now()
  const previous = await store.readJson<PublicationManifest>(
    publicationKeys.manifest(source.username)
  )
  const requested =
    (await store.readJson<SvgVariant[]>(publicationKeys.requests(source.username))) || []
  const manifest: PublicationManifest = {
    schemaVersion: 1,
    username: source.username,
    updatedAt: new Date(now).toISOString(),
    rules: source.rules,
    profiles: [],
  }
  let data: Promise<NormalizedGitHubData> | undefined
  let updated = 0
  const failures: Array<{ profileSlug: string; variant: string; message: string }> = []
  for (const profile of source.profiles) {
    const old = previous?.profiles.find((item) => item.slug === profile.slug)
    const published = {
      slug: profile.slug,
      isDefault: profile.isDefault,
      images: { ...old?.images },
    }
    manifest.profiles.push(published)
    const variants = [
      ...baseVariants(source.username, profile.slug),
      ...requested
        .filter((item) => item.username === source.username && item.profileSlug === profile.slug)
        .slice(0, PUBLICATION.maxRequestedVariants),
    ]
    const seen = new Set<string>()
    for (const variant of variants) {
      if (deps.shouldStop?.()) break
      const id = await variantId(variant)
      if (seen.has(id)) continue
      seen.add(id)
      const revision = hash(JSON.stringify([profile.config, variant, deps.rendererRevision]))
      const current = published.images[id]
      if (
        !current?.degraded &&
        current?.sourceRevision === revision &&
        now - Date.parse(current.publishedAt) < PUBLICATION.refreshMs
      )
        continue
      try {
        data ??= deps.fetchData(source.username)
        const { svg, degraded } = await deps.render(profile.config, await data, variant)
        if (degraded && current)
          throw new Error('External assets incomplete; retaining published SVG')
        const contentRevision = hash(svg)
        const key = publicationKeys.image(source.username, profile.slug, id)
        if (current?.revision !== contentRevision) await store.writeSvg(key, svg)
        published.images[id] = {
          key,
          revision: contentRevision,
          sourceRevision: revision,
          publishedAt: new Date(now).toISOString(),
          degraded,
        }
        updated++
      } catch (error) {
        failures.push({
          profileSlug: profile.slug,
          variant: id,
          message: error instanceof Error ? error.message : 'Publication failed',
        })
      }
    }
  }
  // Publishing the manifest last keeps failed renders and partial uploads out of the serving path.
  await store.writeJson(publicationKeys.manifest(source.username), manifest)
  for (const old of previous?.profiles || []) {
    if (source.profiles.some((profile) => profile.slug === old.slug)) continue
    for (const image of Object.values(old.images)) await store.remove?.(image.key)
  }
  return { updated, failures }
}
