import { ASSISTANT_TIPS } from '../constants/assistantCatalog'
import type { AssistantTip, TipId } from './types'

export function getTip(id: TipId): AssistantTip {
  return { id, ...ASSISTANT_TIPS[id] }
}
