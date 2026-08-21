'use client'

import { Plus } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

interface GitFutCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function GitFutCardItem({ item, onAdd, onHover, onLeave }: GitFutCardItemProps) {
  const [overall, setOverall] = useState<number>(98)
  const [scale, setScale] = useState<number>(1)
  const [isLeveling, setIsLeveling] = useState<boolean>(false)
  const [isComplete, setIsComplete] = useState<boolean>(false)

  const animFrameRef = useRef<number | null>(null)
  const animIdRef = useRef<number>(0)
  const currentValRef = useRef<number>(98)

  useEffect(() => {
    currentValRef.current = overall
  }, [overall])

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  const animateTo = (target: number, duration = 400) => {
    const currentAnim = ++animIdRef.current
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
    }

    const startVal = currentValRef.current
    if (startVal === target) return

    const startTime = performance.now()
    setIsLeveling(true)
    setIsComplete(false)

    const frame = (now: number) => {
      if (currentAnim !== animIdRef.current) return

      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)
      const value = Math.round(startVal + (target - startVal) * eased)

      setOverall(value)
      setScale(progress < 1 ? (target > startVal ? 1.08 : 0.94) : 1)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(frame)
      } else {
        setOverall(target)
        setScale(1)
        setIsLeveling(false)
        if (target === 99) {
          setIsComplete(true)
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(frame)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    onHover(item, e.currentTarget.getBoundingClientRect())
    animateTo(99, 450)
  }

  const handleMouseLeave = () => {
    onLeave()
    animateTo(98, 350)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Teko:wght@500;600;700&display=swap');
      `}</style>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onAdd(item.id)}
        data-testid="add-widget-gitfut-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative w-full h-[4.7rem] my-1.5 cursor-pointer select-none transition-all duration-300 transform hover:-translate-y-0.5"
        style={{
          filter:
            'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.45)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      >
        <svg
          viewBox="17 2 326 136"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gitfut-gold-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff0a2" />
              <stop offset="18%" stopColor="#c7a34b" />
              <stop offset="38%" stopColor="#f5dc83" />
              <stop offset="65%" stopColor="#aa8430" />
              <stop offset="84%" stopColor="#eed98a" />
              <stop offset="100%" stopColor="#795d22" />
            </linearGradient>

            <linearGradient id="gitfut-ivory-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffef5" />
              <stop offset="28%" stopColor="#faf5df" />
              <stop offset="68%" stopColor="#f2eacd" />
              <stop offset="100%" stopColor="#dfd3ad" />
            </linearGradient>

            <linearGradient id="gitfut-gold-edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff0a0" />
              <stop offset="35%" stopColor="#b48c36" />
              <stop offset="60%" stopColor="#f5dd88" />
              <stop offset="100%" stopColor="#73571e" />
            </linearGradient>

            <linearGradient id="gitfut-ornament-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8d6b25" />
              <stop offset="40%" stopColor="#e0c36c" />
              <stop offset="70%" stopColor="#a27e2e" />
              <stop offset="100%" stopColor="#684c18" />
            </linearGradient>

            <radialGradient id="gitfut-center-light" cx="50%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity=".75" />
              <stop offset="48%" stopColor="#fffdf0" stopOpacity=".2" />
              <stop offset="100%" stopColor="#c8b46f" stopOpacity=".15" />
            </radialGradient>

            <filter id="gitfut-gold-glow" x="-30%" y="-40%" width="160%" height="180%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0.95 0 1 0 0 0.68 0 0 1 0 0.15 0 0 0 .8 0"
              />
            </filter>

            <path
              id="gitfut-outer-shape"
              d="M 18 15 L 29 7 L 74 3 L 92 9 L 268 9 L 286 3 L 331 7 L 342 15 L 342 82 L 334 93 L 312 99 L 264 108 L 215 117 L 188 129 L 180 134 L 172 129 L 145 117 L 96 108 L 48 99 L 26 93 L 18 82 Z"
            />

            <path
              id="gitfut-inner-shape"
              d="M 22 17 L 32 11 L 75 7 L 94 13 L 266 13 L 285 7 L 328 11 L 338 17 L 338 80 L 330 90 L 308 96 L 262 105 L 213 114 L 188 125 L 180 130 L 172 125 L 147 114 L 98 105 L 52 96 L 30 90 L 22 80 Z"
            />
          </defs>

          <use href="#gitfut-outer-shape" fill="#59451a" transform="translate(0 2.5)" />

          <use href="#gitfut-outer-shape" fill="url(#gitfut-gold-body)" />

          <use
            href="#gitfut-outer-shape"
            fill="none"
            stroke="#f7d96d"
            strokeWidth="2"
            filter="url(#gitfut-gold-glow)"
            className="opacity-0 group-hover:opacity-80 transition-opacity duration-350"
          />

          <use href="#gitfut-inner-shape" fill="url(#gitfut-ivory-body)" />
          <use href="#gitfut-inner-shape" fill="url(#gitfut-center-light)" />

          <use
            href="#gitfut-outer-shape"
            fill="none"
            stroke="url(#gitfut-gold-edge)"
            strokeWidth="1.1"
          />
          <use
            href="#gitfut-outer-shape"
            fill="none"
            stroke="#fff2aa"
            strokeWidth=".55"
            opacity=".8"
            transform="scale(.992) translate(1.4 1)"
          />
          <use
            href="#gitfut-inner-shape"
            fill="none"
            stroke="#96742c"
            strokeWidth=".8"
            opacity=".72"
          />
          <use
            href="#gitfut-inner-shape"
            fill="none"
            stroke="#fff8cf"
            strokeWidth="0.55"
            opacity="0.8"
            transform="scale(.985) translate(2.7 1.7)"
          />

          <g
            fill="none"
            stroke="url(#gitfut-ornament-gold)"
            strokeWidth="0.65"
            className="opacity-70 group-hover:opacity-95 transition-all duration-500 group-hover:-translate-y-0.5"
          >
            <path d="M 34 17 L 77 12 L 94 18 L 266 18 L 283 12 L 326 17" />
            <path d="M 48 22 L 78 18 L 92 23 L 268 23 L 282 18 L 312 22" />
            <path d="M 83 12 L 91 7 L 99 13" />
            <path d="M 277 12 L 269 7 L 261 13" />
          </g>

          <g
            fill="none"
            stroke="url(#gitfut-ornament-gold)"
            strokeWidth="0.65"
            className="opacity-70 group-hover:opacity-95 transition-all duration-500 group-hover:-translate-x-0.5"
          >
            <path d="M 31 27 L 58 23 L 67 29 L 57 37 L 33 40" />
            <path d="M 29 43 L 54 39 L 62 45 L 53 53 L 29 56" />
            <path d="M 29 60 L 53 56 L 61 63 L 53 70 L 29 67" />
            <path d="M 30 75 L 55 72 L 65 79 L 54 86 L 33 82" />
          </g>

          <g
            fill="none"
            stroke="url(#gitfut-ornament-gold)"
            strokeWidth="0.65"
            className="opacity-70 group-hover:opacity-95 transition-all duration-500 group-hover:translate-x-0.5"
          >
            <path d="M 329 27 L 302 23 L 293 29 L 303 37 L 327 40" />
            <path d="M 331 43 L 306 39 L 298 45 L 307 53 L 331 56" />
            <path d="M 331 60 L 307 56 L 299 63 L 307 70 L 331 67" />
            <path d="M 330 75 L 305 72 L 295 79 L 306 86 L 327 82" />
          </g>

          <g fill="none" stroke="#a38437" strokeWidth="0.45" opacity="0.35">
            <path d="M 42 29 L 42 82" />
            <path d="M 48 27 L 48 88" />
            <path d="M 318 29 L 318 82" />
            <path d="M 312 27 L 312 88" />
          </g>

          <g
            fill="none"
            stroke="url(#gitfut-ornament-gold)"
            strokeWidth="0.65"
            className="opacity-70 group-hover:opacity-95 transition-all duration-500 group-hover:translate-y-0.5"
          >
            <path d="M 52 91 L 96 101 L 146 111 L 172 123" />
            <path d="M 308 91 L 264 101 L 214 111 L 188 123" />
            <path d="M 84 96 L 119 104 L 151 111" />
            <path d="M 276 96 L 241 104 L 209 111" />
          </g>

          <g
            fill="none"
            stroke="url(#gitfut-ornament-gold)"
            className="transition-transform duration-500 group-hover:scale-110"
            style={{ transformOrigin: '180px 20px' }}
          >
            <path
              d="M 172 17 L 180 12 L 188 17 L 185 25 L 180 29 L 175 25 Z"
              strokeWidth=".7"
              opacity=".65"
            />
            <circle cx="180" cy="20" r="2" strokeWidth=".55" />
          </g>

          <path
            d="M 22 17 Q 22 13 29 11 L 73 7"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.15"
            opacity=".75"
          />
          <path
            d="M 338 17 Q 338 13 331 11 L 287 7"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            opacity=".48"
          />
        </svg>

        <div
          className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
          style={{
            clipPath:
              'polygon(0% 10%, 4% 4%, 18% 1%, 23% 5%, 77% 5%, 82% 1%, 96% 4%, 100% 10%, 100% 60%, 97% 69%, 76% 78%, 61% 85%, 52% 96%, 50% 100%, 48% 96%, 39% 85%, 24% 78%, 3% 69%, 0% 60%)',
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 via-amber-200/40 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>

        <div className="relative z-20 w-full h-full flex items-center justify-between px-4 pointer-events-none -translate-y-2">
          <div className="flex items-center justify-center h-10 w-11 shrink-0 pl-1 translate-y-0.5">
            <span
              className="leading-none transition-all duration-150 inline-block text-center select-none"
              style={{
                fontFamily: "'Teko', sans-serif",
                fontSize: '38px',
                fontWeight: 600,
                letterSpacing: '-0.5px',
                lineHeight: '1',
                transform: `scale(${scale})`,
                color: isComplete ? '#624914' : isLeveling ? '#70551b' : '#554318',
                textShadow: isComplete
                  ? '0 0 6px rgba(255, 218, 103, 0.6), 0 1px 0 #fffef0'
                  : '0 1px 0 #fffef0, 0 2px 0 rgba(105, 78, 19, 0.14)',
              }}
            >
              {overall}
            </span>
          </div>

          <div className="absolute left-[51.5%] -translate-x-1/2 flex items-center justify-center h-10">
            <span
              className="leading-none uppercase inline-block select-none transition-colors duration-300"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '25px',
                fontWeight: 800,
                letterSpacing: '2.5px',
                lineHeight: '1',
                color: '#57461b',
                textShadow: '0 1px 0 #fffef2, 0 2px 0 rgba(111, 81, 19, 0.12)',
              }}
            >
              GITFUT
            </span>
          </div>

          <div className="text-[#8d6b25] group-hover:text-[#57461b] group-hover:scale-115 transition-all duration-300 p-1 mr-1 shrink-0 drop-shadow-[0_1px_0_#fffef2]">
            <Plus size={16} />
          </div>
        </div>
      </div>
    </>
  )
}
