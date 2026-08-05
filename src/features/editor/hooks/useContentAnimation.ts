import { useEffect, useRef } from 'react'

import type { AnimationEasing, AnimationType } from '../components/Properties/AnimationControls'

const SPRING_CUBIC = 'cubic-bezier(0.34,1.56,0.64,1)'

function easingToCss(easing: AnimationEasing): string {
  if (easing === 'spring') return SPRING_CUBIC
  return easing
}

const CONTENT_KEYFRAMES = `
@keyframes ga-c-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ga-c-slide-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ga-c-slide-down {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ga-c-slide-left {
  from { opacity: 0; transform: translateX(12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ga-c-slide-right {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ga-c-zoom {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes ga-c-glitch {
  0%   { opacity: 0; clip-path: inset(50% 0 50% 0); }
  20%  { opacity: 0.7; clip-path: inset(30% 0 30% 0); }
  40%  { opacity: 0.85; clip-path: inset(10% 0 10% 0); }
  60%  { opacity: 0.9; clip-path: inset(5% 0 5% 0); }
  100% { opacity: 1; clip-path: inset(0 0 0 0); }
}
@keyframes ga-c-scan {
  from { opacity: 0; clip-path: inset(0 100% 0 0); }
  to   { opacity: 1; clip-path: inset(0 0% 0 0); }
}
@keyframes ga-c-flip {
  from { opacity: 0; transform: perspective(300px) rotateX(60deg); }
  to   { opacity: 1; transform: perspective(300px) rotateX(0deg); }
}
@keyframes ga-c-typewriter {
  from { clip-path: inset(0 100% 0 0); opacity: 1; }
  to   { clip-path: inset(0 0% 0 0); opacity: 1; }
}
`

function ensureContentKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById('ga-content-keyframes')) return
  const style = document.createElement('style')
  style.id = 'ga-content-keyframes'
  style.textContent = CONTENT_KEYFRAMES
  document.head.appendChild(style)
}

function getContentKeyframe(type: AnimationType): string {
  switch (type) {
    case 'fade-in':
      return 'ga-c-fade'
    case 'slide-up':
      return 'ga-c-slide-up'
    case 'slide-down':
      return 'ga-c-slide-down'
    case 'slide-left':
      return 'ga-c-slide-left'
    case 'slide-right':
      return 'ga-c-slide-right'
    case 'zoom-in':
    case 'zoom-out':
      return 'ga-c-zoom'
    case 'flip-x':
    case 'flip-y':
      return 'ga-c-flip'
    case 'glitch':
      return 'ga-c-glitch'
    case 'scan-lines':
      return 'ga-c-scan'
    case 'typewriter':
      return 'ga-c-typewriter'
    default:
      return 'ga-c-fade'
  }
}

export interface ContentAnimationTarget {
  instanceId: string
  widgetId: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  animationType: AnimationType
  animationDuration: number
  animationDelay: number
  animationEasing: AnimationEasing
  previewKey: number
}

export function useContentAnimation(
  svgContainerRef: React.RefObject<HTMLElement | null>,
  targets: ContentAnimationTarget[],
  svgKey: string
) {
  const prevKeysRef = useRef<Record<string, number>>({})

  useEffect(() => {
    ensureContentKeyframes()
  }, [])

  useEffect(() => {
    const container = svgContainerRef.current
    if (!container || targets.length === 0) return

    const raf = requestAnimationFrame(() => {
      const svgEl = container.querySelector('svg')
      if (!svgEl) return

      for (const target of targets) {
        const { instanceId, widgetId, position, size, animationType } = target
        if (animationType === 'none') continue

        const prevKey = prevKeysRef.current[instanceId] ?? -1
        const currKey = target.previewKey
        if (prevKey === currKey && prevKey !== -1) continue
        prevKeysRef.current[instanceId] = currKey

        const elements = getWidgetSvgElements(svgEl, position, size, widgetId)
        if (elements.length === 0) continue

        animateElements(elements, target)
      }
    })

    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgKey, targets])
}

function getWidgetSvgElements(
  svgEl: SVGSVGElement,
  position: { x: number; y: number },
  size: { width: number; height: number },
  widgetId: string
): SVGElement[] {
  const px = position.x
  const py = position.y
  const pw = size.width
  const ph = size.height
  const margin = 4

  if (widgetId === 'ascii-art' || widgetId === 'ascii-text') {
    const nestedSvgs = Array.from(svgEl.querySelectorAll('svg > svg, svg svg')) as SVGElement[]
    for (const ns of nestedSvgs) {
      const absPos = getAbsolutePosition(ns)
      if (Math.abs(absPos.x - px) < 40 && Math.abs(absPos.y - py) < 40) {
        const rows = Array.from(ns.querySelectorAll('text')) as SVGElement[]
        return rows.length > 0 ? rows : [ns]
      }
    }
    return []
  }

  const allTexts = Array.from(svgEl.querySelectorAll('text, line, rect, image, g')) as SVGElement[]
  const matched: SVGElement[] = []

  for (const el of allTexts) {
    if (el.tagName === 'g') continue
    try {
      const bbox = (el as SVGGraphicsElement).getBBox?.()
      if (!bbox) continue
      if (
        bbox.x >= px - margin &&
        bbox.y >= py - margin &&
        bbox.x + bbox.width <= px + pw + margin &&
        bbox.y + bbox.height <= py + ph + margin
      ) {
        matched.push(el)
      }
    } catch {
      // getBBox can fail for invisible elements
    }
  }

  return matched
}

function getAbsolutePosition(el: SVGElement): { x: number; y: number } {
  let x = parseFloat(el.getAttribute('x') || '0')
  let y = parseFloat(el.getAttribute('y') || '0')
  let parent = el.parentElement
  while (parent && parent.tagName !== 'svg') {
    x += parseFloat(parent.getAttribute('x') || '0')
    y += parseFloat(parent.getAttribute('y') || '0')
    parent = parent.parentElement
  }
  return { x, y }
}

function animateElements(elements: SVGElement[], target: ContentAnimationTarget) {
  const { animationType, animationDuration, animationDelay, animationEasing, widgetId } = target

  const keyframe = getContentKeyframe(animationType)
  const easing = easingToCss(animationEasing)

  const count = elements.length

  const isCharLevel = animationType === 'typewriter' || animationType === 'glitch'
  const isAscii = widgetId === 'ascii-art' || widgetId === 'ascii-text'

  let totalStaggerBudget = Math.min(animationDuration * 0.6, isAscii ? 1200 : 600)
  if (widgetId === 'ascii-art' && animationType === 'typewriter') {
    totalStaggerBudget = animationDuration * 0.85
  }

  const staggerPerElement = count > 1 ? totalStaggerBudget / count : 0
  const perElementDuration = isAscii
    ? Math.max(80, animationDuration - totalStaggerBudget)
    : Math.max(120, animationDuration - totalStaggerBudget)

  elements.forEach((el, i) => {
    el.style.animation = 'none'
    el.style.opacity = '0'
    void (el as unknown as HTMLElement).offsetWidth

    const delay = animationDelay + i * staggerPerElement
    el.style.animation = `${keyframe} ${perElementDuration}ms ${easing} ${delay}ms both 1`

    if (isCharLevel && (el.tagName === 'text' || el.tagName === 'tspan')) {
      el.style.overflow = 'hidden'
    }
  })

  const lastDelay = animationDelay + (count - 1) * staggerPerElement
  const totalMs = lastDelay + perElementDuration + 50
  setTimeout(() => {
    elements.forEach((el) => {
      el.style.opacity = '1'
    })
  }, totalMs)
}
