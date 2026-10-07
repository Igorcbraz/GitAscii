'use client'

import { StrobiAssistant } from './assistant/StrobiAssistant'
import { useProAssistant } from './assistant/useProAssistant'
import { STROBI_SCENE } from './constants/strobi'

export function ProMascot({ isPro }: { isPro: boolean }) {
  const { assistant, act } = useProAssistant({ isPro })
  return <StrobiAssistant scene={STROBI_SCENE.PRO} assistant={assistant} onAction={act} />
}
