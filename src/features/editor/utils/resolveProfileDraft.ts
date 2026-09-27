import type { SavedConfiguration } from '@/engine/types'

export function resolveProfileDraft(
  rawDraft: string | null,
  serverConfig: SavedConfiguration | null
): SavedConfiguration | null {
  if (!rawDraft) return serverConfig
  try {
    const draft = JSON.parse(rawDraft) as SavedConfiguration
    if (!draft || !Array.isArray(draft.widgets) || !draft.globalStyles) return serverConfig
    const draftTime = Date.parse(draft.metadata?.updatedAt || '')
    const serverTime = Date.parse(serverConfig?.metadata?.updatedAt || '')
    if (
      serverConfig &&
      Number.isFinite(serverTime) &&
      (!Number.isFinite(draftTime) || serverTime > draftTime)
    ) {
      return serverConfig
    }
    return draft
  } catch {
    return serverConfig
  }
}
