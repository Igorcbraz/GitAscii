import type { ASSISTANT_ACTION, ASSISTANT_TIP } from '../constants/assistant'
import type { StrobiAccessory, StrobiMood } from '../core/types'

export type AssistantAction = (typeof ASSISTANT_ACTION)[keyof typeof ASSISTANT_ACTION]
export type TipId = (typeof ASSISTANT_TIP)[keyof typeof ASSISTANT_TIP]
export type AssistantScene = 'editor' | 'pro'

export interface AssistantTip {
  id: TipId
  title: [string, string]
  body: [string, string]
  action?: AssistantAction
  mood: StrobiMood
  accessory: StrobiAccessory
}
