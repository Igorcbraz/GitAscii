import { useEffect, useRef } from 'react'

import type { AnimationEasing, AnimationType } from '../components/Properties/AnimationControls'

const KEYFRAMES = `
@keyframes ga-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ga-slide-up {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ga-slide-down {
  from { opacity: 0; transform: translateY(-32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ga-slide-left {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ga-slide-right {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ga-zoom-in {
  from { opacity: 0; transform: scale(0.72); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes ga-zoom-out {
  from { opacity: 0; transform: scale(1.28); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes ga-flip-x {
  from { opacity: 0; transform: perspective(600px) rotateY(90deg); }
  to   { opacity: 1; transform: perspective(600px) rotateY(0deg); }
}
@keyframes ga-flip-y {
  from { opacity: 0; transform: perspective(600px) rotateX(90deg); }
  to   { opacity: 1; transform: perspective(600px) rotateX(0deg); }
}
@keyframes ga-glitch {
  0%   { opacity: 0; clip-path: inset(0 100% 0 0); transform: skewX(12deg); }
  15%  { clip-path: inset(0 60% 0 0);  transform: skewX(-8deg); opacity: 0.6; }
  30%  { clip-path: inset(0 30% 0 0);  transform: skewX(5deg);  opacity: 0.8; }
  50%  { clip-path: inset(0 10% 0 0);  transform: skewX(-2deg); opacity: 0.9; }
  70%  { clip-path: inset(0 3%  0 0);  transform: skewX(1deg);  opacity: 0.95; }
  100% { clip-path: inset(0 0   0 0);  transform: skewX(0deg);  opacity: 1; }
}
@keyframes ga-scan-lines {
  0%   { opacity: 0; clip-path: inset(100% 0 0 0); }
  20%  { opacity: 0.6; clip-path: inset(80% 0 0 0); }
  40%  { opacity: 0.8; clip-path: inset(60% 0 0 0); }
  60%  { clip-path: inset(35% 0 0 0); opacity: 0.9; }
  80%  { clip-path: inset(10% 0 0 0); }
  100% { clip-path: inset(0 0 0 0);   opacity: 1; }
}
@keyframes ga-typewriter-wrapper {
  from { opacity: 1; }
  to   { opacity: 1; }
}
`

const ANIMATION_NAME_MAP: Record<AnimationType, string> = {
  none: '',
  'fade-in': 'ga-fade-in',
  'slide-up': 'ga-slide-up',
  'slide-down': 'ga-slide-down',
  'slide-left': 'ga-slide-left',
  'slide-right': 'ga-slide-right',
  'zoom-in': 'ga-zoom-in',
  'zoom-out': 'ga-zoom-out',
  'flip-x': 'ga-flip-x',
  'flip-y': 'ga-flip-y',
  glitch: 'ga-glitch',
  'scan-lines': 'ga-scan-lines',
  typewriter: 'ga-typewriter-wrapper',
}

const SPRING_CUBIC = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

function easingToCss(easing: AnimationEasing): string {
  if (easing === 'spring') return SPRING_CUBIC
  return easing
}

function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById('ga-widget-keyframes')) return
  const style = document.createElement('style')
  style.id = 'ga-widget-keyframes'
  style.textContent = KEYFRAMES
  document.head.appendChild(style)
}

interface UseWidgetAnimationOptions {
  animationType: AnimationType
  animationDuration: number
  animationDelay: number
  animationEasing: AnimationEasing
  previewKey?: number
}

export function useWidgetAnimation(
  elRef: React.RefObject<HTMLElement | null>,
  opts: UseWidgetAnimationOptions
) {
  const { animationType, animationDuration, animationDelay, animationEasing, previewKey } = opts

  const mountedRef = useRef(false)

  useEffect(() => {
    ensureKeyframes()
  }, [])

  useEffect(() => {
    const el = elRef.current
    if (!el || animationType === 'none') {
      if (el) {
        el.style.opacity = '1'
        el.style.animation = ''
      }
      return
    }

    const animName = ANIMATION_NAME_MAP[animationType] || 'ga-fade-in'
    const easing = easingToCss(animationEasing)
    const duration = `${animationDuration}ms`
    const delay = `${animationDelay}ms`

    el.style.animation = 'none'
    el.style.opacity = '0'

    void el.offsetWidth

    el.style.animation = `${animName} ${duration} ${easing} ${delay} both 1`

    const cleanup = () => {
      if (el) {
        el.style.opacity = '1'
      }
    }

    const totalMs = animationDuration + animationDelay
    const timer = setTimeout(cleanup, totalMs + 50)
    return () => clearTimeout(timer)
  }, [animationType, animationDuration, animationDelay, animationEasing, previewKey, elRef])

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
  }, [])
}
