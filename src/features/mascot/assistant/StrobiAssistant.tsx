'use client'

import { ArrowRight, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'

import { useI18n } from '@/i18n'

import { StrobiAnchor } from '../components/StrobiAnchor'
import { ASSISTANT_CONFIG, ASSISTANT_LANGUAGE, ASSISTANT_SELECTORS } from '../constants/assistant'
import { ASSISTANT_ACTION_LABELS } from '../constants/assistantCatalog'
import { STROBI_MOTION, STROBI_REACTION } from '../constants/motion'
import { STROBI_ACCESSORY, STROBI_LOCOMOTION, STROBI_MOOD, STROBI_SCENE } from '../constants/strobi'
import { useStrobiContext } from '../core/StrobiContext'
import { getTip } from './tips'
import type { AssistantAction, AssistantScene } from './types'
import type { useAssistant } from './useAssistant'

interface Props {
  scene: AssistantScene
  assistant: ReturnType<typeof useAssistant>
  onAction: (action: AssistantAction) => void
}

export function StrobiAssistant({ scene, assistant, onAction }: Props) {
  const { language, t } = useI18n()
  const { controller, state, physics } = useStrobiContext()
  const reduce = useReducedMotion()
  const panel = useRef<HTMLDivElement>(null)
  const text = (key: string, pair: readonly [string, string]) =>
    t(`mascot.assistant.${key}`, pair[language === ASSISTANT_LANGUAGE.PORTUGUESE ? 1 : 0])
  const tip = useMemo(() => (assistant.tipId ? getTip(assistant.tipId) : null), [assistant.tipId])
  const { dismiss, setEngaged } = assistant

  useEffect(() => {
    controller.goTo(scene, {
      style: STROBI_LOCOMOTION.SETTLE,
      immediate: Boolean(reduce),
      accessory:
        scene === STROBI_SCENE.EDITOR ? STROBI_ACCESSORY.DEVELOPER : STROBI_ACCESSORY.BUSINESSMAN,
    })
  }, [scene, controller, reduce])

  useEffect(() => {
    if (!tip) return
    controller.setAccessory(tip.accessory)
    controller.react(
      tip.mood,
      tip.mood === STROBI_MOOD.CELEBRATING
        ? STROBI_REACTION.celebrationDurationMs
        : STROBI_REACTION.tipDurationMs
    )
    if (!reduce) {
      const squash =
        tip.mood === STROBI_MOOD.CELEBRATING
          ? STROBI_REACTION.celebrationSquash
          : STROBI_REACTION.squash
      physics.triggerSquash(squash.x, squash.y)
    }
  }, [tip, controller, physics, reduce])

  const close = () => {
    if (panel.current?.contains(document.activeElement))
      document.getElementById(ASSISTANT_SELECTORS.actorId)?.focus({ preventScroll: true })
    dismiss()
  }

  if (assistant.blocked) return null

  return (
    <div
      data-testid="strobi-assistant"
      className={`fixed right-3 sm:right-5 z-[90] flex items-end gap-2 pointer-events-none ${scene === STROBI_SCENE.EDITOR ? 'bottom-[calc(env(safe-area-inset-bottom)+8rem)] lg:bottom-10' : 'bottom-5 lg:left-[272px] lg:right-auto'}`}
    >
      <div className="relative pointer-events-auto w-16 h-16">
        <AnimatePresence mode="wait">
          {tip && state.visible && (
            <motion.div
              ref={panel}
              id="strobi-assistant-panel"
              key={tip.id}
              role="region"
              aria-label={text('conversation', ['Strobi’s suggestion', 'Sugestão do Strobi'])}
              initial={reduce ? { opacity: 0 } : STROBI_MOTION.panelInitial}
              animate={STROBI_MOTION.panelAnimate}
              exit={{
                opacity: 0,
                y: reduce ? 0 : 5,
                transition: { duration: STROBI_MOTION.panelExitDuration },
              }}
              transition={reduce ? { duration: 0 } : STROBI_MOTION.panelSpring}
              className={`absolute bottom-full right-0 mb-4 w-[min(340px,calc(100vw-24px))] max-h-[min(520px,calc(100dvh-228px))] overflow-y-auto rounded-xl bg-onyx text-bone shadow-[0_12px_40px_rgba(0,0,0,0.5)] origin-bottom-right ${scene === STROBI_SCENE.PRO ? 'lg:left-0 lg:right-auto' : ''}`}
              onPointerEnter={() => setEngaged(true)}
              onPointerLeave={() => {
                if (!panel.current?.contains(document.activeElement)) setEngaged(false)
              }}
              onFocusCapture={() => setEngaged(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false)
              }}
              onKeyDown={(event) => {
                event.stopPropagation()
                if (event.key === 'Escape') close()
              }}
            >
              <div className="px-4 pt-3 flex items-center justify-between">
                <span className="font-inter-tight text-sm font-semibold text-chalk">
                  Strobi
                  <span className="text-smoke font-normal">
                    {' '}
                    /{' '}
                    {scene === STROBI_SCENE.EDITOR
                      ? text('studio', ['Studio assistant', 'Assistente de criação'])
                      : text('pro', ['Pro guide', 'Guia Pro'])}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => close()}
                  aria-label={text('close', ['Dismiss suggestion', 'Dispensar sugestão'])}
                  className="w-9 h-9 -mr-2 flex items-center justify-center rounded-sm text-pearl hover:text-white hover:bg-graphite focus-visible:outline-2 focus-visible:outline-signal-lime"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-4 pb-4" aria-live="polite" aria-atomic="true">
                <h2 className="font-pt-serif text-[23px] leading-tight text-chalk mt-2 mb-3">
                  {text(`${tip.id}.title`, tip.title)}
                </h2>
                <p className="font-inter-tight text-sm leading-relaxed text-pearl">
                  {text(`${tip.id}.body`, tip.body)}
                </p>
              </div>
              <div className="px-4 pb-4 space-y-3">
                {tip.action && (
                  <motion.button
                    data-strobi-primary
                    type="button"
                    whileTap={reduce ? undefined : { scale: 0.98 }}
                    onClick={() => {
                      if (tip.action) onAction(tip.action)
                      close()
                    }}
                    className="w-full min-h-11 flex items-center justify-between gap-3 rounded-sm bg-signal-lime px-3 py-2 text-carbon font-inter-tight font-semibold text-sm hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-lime"
                  >
                    {text(`action.${tip.action}`, ASSISTANT_ACTION_LABELS[tip.action])}
                    <ArrowRight size={16} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <StrobiAnchor
          id={scene}
          scene={scene}
          size={ASSISTANT_CONFIG.anchorSize}
          float={!reduce}
          accessory={
            scene === STROBI_SCENE.EDITOR
              ? STROBI_ACCESSORY.DEVELOPER
              : STROBI_ACCESSORY.BUSINESSMAN
          }
        />
      </div>
    </div>
  )
}
