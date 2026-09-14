export const PUBLICATION = {
  refreshMs: 6 * 60 * 60 * 1000,
  imageCacheSeconds: 300,
  maxSvgBytes: 8 * 1024 * 1024,
  maxRequestedVariants: 16,
  maxWidgets: 12,
  maxProfilesPerRun: 200,
  maxRunMs: 20 * 60 * 1000,
  profileTimeoutMs: 90_000,
  maxSnapshotBytes: 512 * 1024 * 1024,
  maxSnapshotFiles: 18_000,
} as const

export const DEFAULT_PUBLICATION_RULES = {
  enabled: false,
  fallbackProfileSlug: 'default',
  defaultTimezone: 'UTC',
  rules: [],
}

export const publicationKeys = {
  manifest: (username: string) => `__publication/manifests/${username}.json`,
  requests: (username: string) => `__publication/requests/${username}.json`,
  image: (username: string, slug: string, variantId: string) =>
    `profiles/${username}/${slug}/${variantId}.svg`,
}
