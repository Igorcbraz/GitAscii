'use client'

/**
 * Strobi Mascote - Landing Page Disney-Grade Scroll Journey
 * Guides Strobi as a living, funny, navigation assistant across every landing section:
 * - Hero: welcoming developer near login/username input
 * - Video/Demo: 3D glasses + popcorn bucket, hopping on play button
 * - Traction: professor glasses with hilarious jokes about numbers
 * - Community Profiles: detective magnifying glass encouraging clicks on profiles
 * - Templates: French artist beret & palette encouraging layout exploration
 * - GitAscii Pro: serious businessman with tie, shades & briefcase pitching the deal
 * - Widgets Showcase: dizzy spiral eyes, overwhelmed, wandering gaze distraction joke
 * - Ecosystem: astronaut headset praising zero-database Edge CDN architecture
 * - FAQ: detective thinker nudging user to open questions
 * - Final CTA: party hat & confetti bouncing on "Comece Grátis Agora"
 */

import { useEffect, useRef } from 'react'

import { useStrobiContext } from '../core/StrobiContext'
import type { LocomotionStyle, StrobiAccessory, StrobiAnchorId, StrobiMood } from '../core/types'

interface JourneyLandmark {
  id: string
  sectionId: string
  anchorId: StrobiAnchorId
  mood: StrobiMood
  accessory: StrobiAccessory
  style: LocomotionStyle
  tips: Array<{
    id: string
    message: string
    duration: number
    mood: StrobiMood
  }>
  onEnter?: (context: {
    controller: ReturnType<typeof useStrobiContext>['controller']
    gazeController: ReturnType<typeof useStrobiContext>['gazeController']
  }) => void
}

const LANDMARKS: JourneyLandmark[] = [
  {
    id: 'hero-landmark',
    sectionId: 'hero',
    anchorId: 'hero-cta',
    mood: 'idle',
    accessory: 'none',
    style: 'float',
    tips: [],
  },
  {
    id: 'demo-landmark',
    sectionId: 'editor-sandbox',
    anchorId: 'demo-play',
    mood: 'excited',
    accessory: 'popcorn',
    style: 'flight',
    tips: [
      {
        id: 'tip-demo-play',
        message: 'Clique no play para ver a renderização do GitAscii em tempo real.',
        duration: 5500,
        mood: 'excited',
      },
      {
        id: 'tip-demo-cinema',
        message: 'Inicie a demonstração para explorar os recursos interativos do editor.',
        duration: 5000,
        mood: 'playful',
      },
    ],
  },
  {
    id: 'traction-landmark',
    sectionId: 'traction',
    anchorId: 'traction',
    mood: 'focused',
    accessory: 'professor',
    style: 'hop',
    tips: [
      {
        id: 'tip-traction-stats',
        message: 'Mais de 1.000 desenvolvedores já criaram perfis dinâmicos no GitAscii.',
        duration: 5500,
        mood: 'proud',
      },
      {
        id: 'tip-traction-calc',
        message: '100% SVG vetorial puro, direto na Edge CDN sem dependência de banco de dados.',
        duration: 5000,
        mood: 'focused',
      },
    ],
  },
  {
    id: 'community-landmark',
    sectionId: 'community-showcase',
    anchorId: 'community',
    mood: 'curious',
    accessory: 'detective',
    style: 'flight',
    tips: [
      {
        id: 'tip-community-click',
        message: 'Inspecione os perfis da comunidade para conferir os layouts e módulos ativos.',
        duration: 5500,
        mood: 'curious',
      },
      {
        id: 'tip-community-stars',
        message: 'Clique nos perfis dos desenvolvedores para ver os cartões SVG em tempo real.',
        duration: 5500,
        mood: 'playful',
      },
    ],
  },
  {
    id: 'templates-landmark',
    sectionId: 'templates-preview',
    anchorId: 'templates',
    mood: 'playful',
    accessory: 'artist',
    style: 'flight',
    tips: [
      {
        id: 'tip-templates-artist',
        message: 'Explore os presets disponíveis e personalize a paleta de cores do seu layout.',
        duration: 5500,
        mood: 'happy',
      },
      {
        id: 'tip-templates-vibe',
        message: 'Selecione um layout predefinido para carregar automaticamente seus módulos.',
        duration: 5000,
        mood: 'curious',
      },
    ],
  },
  {
    id: 'pro-landmark',
    sectionId: 'pricing',
    anchorId: 'pricing',
    mood: 'focused',
    accessory: 'businessman',
    style: 'flight',
    tips: [
      {
        id: 'tip-pro-pitch',
        message:
          'Conheça o GitAscii Pro: analytics em tempo real, múltiplos perfis e suporte contínuo.',
        duration: 6000,
        mood: 'proud',
      },
      {
        id: 'tip-pro-deal',
        message: 'Acesso vitalício com pagamento único. Sem mensalidades recorrentes.',
        duration: 5500,
        mood: 'playful',
      },
    ],
  },
  {
    id: 'widgets-landmark',
    sectionId: 'widgets-showcase',
    anchorId: 'widgets',
    mood: 'surprised',
    accessory: 'dizzy',
    style: 'flight',
    tips: [
      {
        id: 'tip-widgets-overwhelmed',
        message: 'Mais de 70 widgets modulares prontos para o seu perfil.',
        duration: 4500,
        mood: 'surprised',
      },
      {
        id: 'tip-widgets-filter',
        message: 'Filtre os widgets por categoria para encontrar o componente ideal.',
        duration: 5000,
        mood: 'playful',
      },
    ],
  },
  {
    id: 'ecosystem-landmark',
    sectionId: 'ecosystem',
    anchorId: 'ecosystem',
    mood: 'excited',
    accessory: 'astronaut',
    style: 'flight',
    tips: [
      {
        id: 'tip-ecosystem-cdn',
        message: 'Arquitetura Edge CDN serverless com carregamento ultra-rápido no GitHub.',
        duration: 5500,
        mood: 'excited',
      },
      {
        id: 'tip-ecosystem-serverless',
        message: 'Renderização dinâmica em milissegundos sem cache stale.',
        duration: 5000,
        mood: 'happy',
      },
    ],
  },
  {
    id: 'faq-landmark',
    sectionId: 'faq',
    anchorId: 'faq',
    mood: 'thinking',
    accessory: 'detective',
    style: 'hop',
    tips: [
      {
        id: 'tip-faq-questions',
        message: 'Dúvidas sobre o funcionamento? Abra as perguntas para ver as respostas.',
        duration: 5500,
        mood: 'thinking',
      },
      {
        id: 'tip-faq-answers',
        message: 'Perguntas frequentes sobre integração, licença e renderização.',
        duration: 5000,
        mood: 'playful',
      },
    ],
  },
  {
    id: 'cta-landmark',
    sectionId: 'final-cta',
    anchorId: 'cta',
    mood: 'celebrating',
    accessory: 'party',
    style: 'flight',
    tips: [
      {
        id: 'tip-cta-hurry',
        message: 'Pronto para criar seu README? Comece agora de forma gratuita.',
        duration: 6000,
        mood: 'celebrating',
      },
      {
        id: 'tip-cta-editor',
        message: 'Abra o editor visual e monte seu perfil personalizado.',
        duration: 5500,
        mood: 'excited',
      },
    ],
  },
]

export function useScrollJourney(enabled = true) {
  const { controller, registry, state, gazeController, physics } = useStrobiContext()
  const visitedTips = useRef<Set<string>>(new Set())
  const lastActiveLandmarkId = useRef<string | null>(null)
  const lastSpokenTime = useRef<number>(0)

  const isGuidingRef = useRef(state.isGuiding)
  isGuidingRef.current = state.isGuiding
  const isMutedRef = useRef(state.muted)
  isMutedRef.current = state.muted

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let rafId: number | null = null

    const checkActiveSection = () => {
      if (isGuidingRef.current) return

      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight

      // 1. Collect all registered/rendered landmarks with their live bounding rects
      const measuredLandmarks: Array<{
        landmark: JourneyLandmark
        el: HTMLElement
        rect: DOMRect
        centerDocY: number
      }> = []

      for (const lm of LANDMARKS) {
        const el = document.getElementById(lm.sectionId)
        if (el) {
          const rect = el.getBoundingClientRect()
          const centerDocY = scrollY + rect.top + rect.height / 2
          measuredLandmarks.push({ landmark: lm, el, rect, centerDocY })
        }
      }

      if (measuredLandmarks.length === 0) return

      // Sort by vertical position in document
      measuredLandmarks.sort((a, b) => a.centerDocY - b.centerDocY)

      const focalDocY = scrollY + winHeight * 0.42

      // 2. Find closest landmark for mood/accessory & speech triggers
      let closestLandmark = measuredLandmarks[0].landmark
      let minDistance = Infinity

      for (const item of measuredLandmarks) {
        const dist = Math.abs(item.centerDocY - focalDocY)
        if (dist < minDistance) {
          minDistance = dist
          closestLandmark = item.landmark
        }
      }

      // 3. Continuous Scroll Interpolation across sections
      // Find pair of surrounding landmarks (prev & next) to interpolate smooth target coordinates
      let resolvedTargetCoords: { x: number; y: number; scale: number } | null = null

      if (focalDocY <= measuredLandmarks[0].centerDocY) {
        // At or above the first section (Hero)
        const first = measuredLandmarks[0].landmark
        const coords = registry.resolveCoordinates(first.anchorId, true)
        resolvedTargetCoords = { x: coords.x, y: coords.y, scale: coords.scale }
      } else if (focalDocY >= measuredLandmarks[measuredLandmarks.length - 1].centerDocY) {
        // At or below the last section (CTA)
        const last = measuredLandmarks[measuredLandmarks.length - 1].landmark
        const coords = registry.resolveCoordinates(last.anchorId, true)
        resolvedTargetCoords = { x: coords.x, y: coords.y, scale: coords.scale }
      } else {
        // Between two landmarks: interpolate target coords smoothly as user scrolls
        for (let i = 0; i < measuredLandmarks.length - 1; i++) {
          const a = measuredLandmarks[i]
          const b = measuredLandmarks[i + 1]

          if (focalDocY >= a.centerDocY && focalDocY <= b.centerDocY) {
            const span = b.centerDocY - a.centerDocY

            // Limit the transition distance so he doesn't drift slowly across massive sections
            const maxTransition = window.innerHeight * 0.8
            const mid = a.centerDocY + span / 2
            const start = mid - maxTransition / 2
            const end = mid + maxTransition / 2

            let tRaw = 0
            if (focalDocY <= start) {
              tRaw = 0
            } else if (focalDocY >= end) {
              tRaw = 1
            } else {
              tRaw = (focalDocY - start) / maxTransition
            }

            // Smooth hermite / smoothstep interpolation
            const t = tRaw * tRaw * (3 - 2 * tRaw)

            // Resolve clamped viewport positions for fluid continuous trajectory without getting stuck at edges
            const coordsA = registry.resolveCoordinates(a.landmark.anchorId, true)
            const coordsB = registry.resolveCoordinates(b.landmark.anchorId, true)

            const interX = coordsA.x + (coordsB.x - coordsA.x) * t
            const interY = coordsA.y + (coordsB.y - coordsA.y) * t
            const interScale = coordsA.scale + (coordsB.scale - coordsA.scale) * t

            // Final safe clamping to visible viewport so Strobi glides naturally without getting cut off
            const mascotSize = 80 * interScale
            const maxX = Math.max(0, window.innerWidth - mascotSize)
            const maxY = Math.max(0, window.innerHeight - mascotSize)

            const safeX = Math.max(12, Math.min(maxX - 12, interX))
            const safeY = Math.max(12, Math.min(maxY - 12, interY))

            resolvedTargetCoords = { x: safeX, y: safeY, scale: interScale }
            break
          }
        }
      }

      // Update physics target continuously with scroll
      if (resolvedTargetCoords && !physics.isDraggingActive()) {
        physics.updateAnchorTarget(
          resolvedTargetCoords.x,
          resolvedTargetCoords.y,
          resolvedTargetCoords.scale,
          false
        )
      }

      // 4. Update discrete landmark transitions (mood, accessory, contextual speech tips)
      if (closestLandmark.id !== lastActiveLandmarkId.current) {
        const landmark = closestLandmark
        lastActiveLandmarkId.current = landmark.id

        // Guarantee accessory and mood update
        controller.setAccessory(landmark.accessory)
        controller.setMood(landmark.mood)

        // Custom onEnter handler (e.g. widgets distraction sequence)
        if (landmark.onEnter) {
          landmark.onEnter({ controller, gazeController })
        }

        // Deliver contextual tip
        const now = performance.now()
        const timeSinceLastSpoken = now - lastSpokenTime.current
        const minCooldownMs = 4500

        if (
          timeSinceLastSpoken > minCooldownMs &&
          !isMutedRef.current &&
          landmark.tips.length > 0
        ) {
          const unvisited = landmark.tips.find((t) => !visitedTips.current.has(t.id))
          const tipToSpeak =
            unvisited || landmark.tips[Math.floor(Math.random() * landmark.tips.length)]

          if (tipToSpeak) {
            visitedTips.current.add(tipToSpeak.id)
            lastSpokenTime.current = now

            setTimeout(() => {
              const anchorConfig = registry.get(landmark.anchorId)
              if (anchorConfig?.element) {
                gazeController.setLookTarget(anchorConfig.element)
                setTimeout(() => {
                  gazeController.setLookTarget(null)
                }, 2000)
              }

              controller.speak(tipToSpeak)
            }, 450)
          }
        }
      }
    }

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        checkActiveSection()
        rafId = null
      })
    }

    // Initial check
    checkActiveSection()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled, controller, registry, gazeController, physics])

  // ─── INTERACTIVE USER CLICK LISTENERS ────────────────────────────────────────
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      // 1. Clicked on a Community Profile item card
      const profileCard = target.closest('[data-profile-item]')
      if (profileCard) {
        const username = profileCard.getAttribute('data-profile-item')
        controller.react('excited', 2200)
        controller.speak({
          id: `react-profile-${Date.now()}`,
          message: `Inspecionando a configuração de @${username || 'dev'}. Layout dinâmico carregado.`,
          duration: 4000,
          mood: 'happy',
        })
        return
      }

      // 2. Clicked on a Template preset item card
      const templateCard = target.closest('[data-template-item]')
      if (templateCard) {
        const tpl = templateCard.getAttribute('data-template-item')
        controller.react('playful', 2200)
        controller.speak({
          id: `react-template-${Date.now()}`,
          message: `Layout ${tpl || ''} selecionado. Renderizando preview dos componentes.`,
          duration: 4000,
          mood: 'happy',
        })
        return
      }

      // 3. Clicked on FAQ accordion question
      const faqTrigger =
        target.closest('[data-faq-trigger]') || target.closest('button[aria-expanded]')
      if (faqTrigger && faqTrigger.closest('#faq')) {
        controller.react('thinking', 2000)
        controller.speak({
          id: `react-faq-${Date.now()}`,
          message: 'Confira os detalhes da resposta no painel.',
          duration: 4000,
          mood: 'happy',
        })
        return
      }

      // 4. Clicked on Video Play Button
      if (target.closest('button[aria-label*="Play"]') || target.closest('[data-video-play]')) {
        controller.react('celebrating', 2500)
        controller.setAccessory('popcorn')
        controller.speak({
          id: `react-video-play-${Date.now()}`,
          message: 'Demonstração iniciada.',
          duration: 4500,
          mood: 'celebrating',
        })
      }
    }

    window.addEventListener('click', handleClick, { capture: true })
    return () => {
      window.removeEventListener('click', handleClick, { capture: true })
    }
  }, [enabled, controller])
}
