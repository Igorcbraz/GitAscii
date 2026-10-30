// A visible but abandoned dashboard must not keep the database awake all day.
export const POLLING_IDLE_MS = 2 * 60_000

export function startActivePolling(
  refresh: () => Promise<void>,
  intervalMs: number,
  surface: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'> = document
): () => void {
  let lastActivity = Date.now()
  let pending = false
  const activity = () => {
    if (surface.visibilityState === 'visible') lastActivity = Date.now()
  }
  const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'visibilitychange'] as const
  for (const event of events) surface.addEventListener(event, activity, { passive: true })
  const timer = setInterval(() => {
    if (
      surface.visibilityState !== 'visible' ||
      Date.now() - lastActivity >= POLLING_IDLE_MS ||
      pending
    )
      return
    pending = true
    void Promise.resolve()
      .then(refresh)
      .catch(() => {})
      .finally(() => {
        pending = false
      })
  }, intervalMs)
  return () => {
    clearInterval(timer)
    for (const event of events) surface.removeEventListener(event, activity)
  }
}
