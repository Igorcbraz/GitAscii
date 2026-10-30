export function reserveChunkReload(
  error: Error,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  now = Date.now()
): boolean {
  if (
    !/Failed to fetch dynamically imported module|Loading chunk .+ failed|ChunkLoadError/.test(
      error.message
    )
  )
    return false
  try {
    const key = 'gitascii:chunk-reload'
    const previous = Number(storage.getItem(key))
    if (previous > 0 && now - previous < 300_000) return false
    storage.setItem(key, String(now))
    return true
  } catch {
    return false
  }
}
