'use client'

import { StrobiAssistant } from './assistant/StrobiAssistant'
import { useEditorAssistant } from './assistant/useEditorAssistant'
import { STROBI_SCENE } from './constants/strobi'

export function EditorMascot() {
  const { assistant, act } = useEditorAssistant()
  return <StrobiAssistant scene={STROBI_SCENE.EDITOR} assistant={assistant} onAction={act} />
}
