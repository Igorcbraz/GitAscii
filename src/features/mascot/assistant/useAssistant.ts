'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ASSISTANT_CONFIG, ASSISTANT_SELECTORS } from '../constants/assistant'
import { STROBI_ACCESSORY, STROBI_MOOD } from '../constants/strobi'
import { useStrobiContext } from '../core/StrobiContext'
import { useStrobiAvailability } from '../hooks/useStrobiAvailability'
import { TipPolicy } from './context'
import { readSeenTips, writeSeenTips } from './storage'
import type { AssistantScene, TipId } from './types'

export function useAssistant(scene: AssistantScene) {
  const { controller, state, speechQueue } = useStrobiContext()
  const [tipId, setTipId] = useState<TipId | null>(null)
  const { blocked } = useStrobiAvailability(true)
  const [engaged, setEngaged] = useState(false)
  const policy = useRef(new TipPolicy())
  const pointerDown = useRef(false)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef({ blocked, tipId, state, engaged })
  latest.current = { blocked, tipId, state, engaged }

  useEffect(() => {
    policy.current = new TipPolicy(readSeenTips(scene))
    controller.dismissSpeech()
    return () => {
      if (pending.current) clearTimeout(pending.current)
      speechQueue.clear()
      controller.clearLookAt()
      controller.setAccessory(STROBI_ACCESSORY.NONE)
      controller.setMood(STROBI_MOOD.IDLE)
    }
  }, [scene, controller, speechQueue])

  useEffect(() => {
    const down = () => {
      pointerDown.current = true
    }
    const up = () => {
      pointerDown.current = false
    }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('blur', up)
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('blur', up)
    }
  }, [])

  const dismiss = useCallback(() => {
    setTipId(null)
    setEngaged(false)
    if (pending.current) clearTimeout(pending.current)
  }, [])

  const invalidate = dismiss

  const offer = useCallback(
    (id: TipId, outcome = false) => {
      if (pending.current) clearTimeout(pending.current)
      pending.current = setTimeout(
        () => {
          const current = latest.current
          const typing = document.activeElement?.matches(ASSISTANT_SELECTORS.editable)
          if (current.blocked || !current.state.visible || typing || pointerDown.current) return
          if (current.tipId && (!outcome || current.engaged)) return
          if (!outcome && !policy.current.accepts(id, Date.now())) return
          setTipId(id)
          if (!outcome) {
            const seen = policy.current.record(id, Date.now())
            writeSeenTips(scene, seen)
          }
        },
        outcome ? ASSISTANT_CONFIG.outcomeDelayMs : ASSISTANT_CONFIG.tipDelayMs
      )
    },
    [scene]
  )

  useEffect(() => {
    if (!tipId || engaged || blocked) return
    const timer = setTimeout(() => setTipId(null), ASSISTANT_CONFIG.tipDurationMs)
    return () => clearTimeout(timer)
  }, [tipId, engaged, blocked])

  useEffect(() => {
    if (blocked) dismiss()
  }, [blocked, dismiss])

  return { tipId, blocked, offer, dismiss, invalidate, setEngaged }
}
