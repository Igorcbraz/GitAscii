import { ASSISTANT_CONFIG } from '../constants/assistant'
import { ASSISTANT_TIPS } from '../constants/assistantCatalog'
import { reportStrobiStorageFailure } from '../utils/storageDiagnostics'
import type { AssistantScene, TipId } from './types'

export function readSeenTips(scene: AssistantScene): TipId[] {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(ASSISTANT_CONFIG.seenStoragePrefix + scene) || '[]'
    )
    if (!Array.isArray(stored)) return []
    return stored.filter(
      (id): id is TipId => typeof id === 'string' && Object.hasOwn(ASSISTANT_TIPS, id)
    )
  } catch (error) {
    reportStrobiStorageFailure('Unable to restore session tip history', error)
    return []
  }
}

export function writeSeenTips(scene: AssistantScene, ids: string[]) {
  try {
    sessionStorage.setItem(ASSISTANT_CONFIG.seenStoragePrefix + scene, JSON.stringify(ids))
  } catch (error) {
    reportStrobiStorageFailure('Unable to persist session tip history', error)
  }
}
