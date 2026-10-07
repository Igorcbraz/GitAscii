'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import {
  ASSISTANT_ACTION,
  ASSISTANT_CONFIG,
  ASSISTANT_SELECTORS,
  ASSISTANT_TIP,
  PRO_ASSISTANT_ROUTES,
} from '../constants/assistant'
import { REDUCED_MOTION_QUERY, STROBI_SCENE } from '../constants/strobi'
import { proSuggestion } from './context'
import type { AssistantAction } from './types'
import { useAssistant } from './useAssistant'

export function useProAssistant({ isPro }: { isPro: boolean }) {
  const assistant = useAssistant(STROBI_SCENE.PRO)
  const { offer, blocked, invalidate } = assistant
  const pathname = usePathname()
  const router = useRouter()
  const routeTip = proSuggestion(pathname)

  useEffect(() => {
    invalidate()
  }, [isPro, routeTip, invalidate])

  useEffect(() => {
    if (!blocked) offer(isPro ? routeTip : ASSISTANT_TIP.PRO_WELCOME)
  }, [offer, isPro, routeTip, blocked])

  useEffect(() => {
    if (isPro) return
    const targets = document.querySelectorAll<HTMLElement>(ASSISTANT_SELECTORS.proContext)
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries
          .filter((observedSection) => observedSection.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const area =
          entry?.target instanceof HTMLElement ? entry.target.dataset.strobiPro : undefined
        if (area === ASSISTANT_ACTION.COMPARE) offer(ASSISTANT_TIP.PRO_PROFILES)
        if (area === ASSISTANT_ACTION.FAQ) offer(ASSISTANT_TIP.PRO_FAQ)
      },
      { threshold: ASSISTANT_CONFIG.proVisibilityThreshold }
    )
    targets.forEach((target) => observer.observe(target))
    const focus = (event: FocusEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest(`[data-strobi-pro="${ASSISTANT_ACTION.PRICING}"]`)
      )
        offer(ASSISTANT_TIP.PRO_PRICE)
    }
    document.addEventListener('focusin', focus)
    return () => {
      observer.disconnect()
      document.removeEventListener('focusin', focus)
    }
  }, [offer, isPro])

  const act = useCallback(
    (action: AssistantAction) => {
      if (isPro) {
        if (
          action === ASSISTANT_ACTION.ANALYTICS ||
          action === ASSISTANT_ACTION.PROFILES ||
          action === ASSISTANT_ACTION.HEALTH
        )
          router.push(PRO_ASSISTANT_ROUTES[action])
        return
      }
      const target = document.querySelector<HTMLElement>(`[data-strobi-pro="${action}"]`)
      target?.scrollIntoView({
        block: 'center',
        behavior: window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'instant' : 'smooth',
      })
      if (target) {
        target.tabIndex = -1
        target.focus({ preventScroll: true })
      }
    },
    [isPro, router]
  )

  return { assistant, act }
}
