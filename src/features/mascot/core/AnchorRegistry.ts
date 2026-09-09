import type { AnchorBounds, AnchorConfig, StrobiAnchorId } from './types'

export class AnchorRegistry {
  private static instance: AnchorRegistry | null = null
  private anchors = new Map<StrobiAnchorId, AnchorConfig>()
  private listeners = new Set<() => void>()
  private lastKnownCoordinates = new Map<
    StrobiAnchorId,
    { x: number; y: number; scale: number; size: number; bounds: AnchorBounds | null }
  >()

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize, { passive: true })
    }
  }

  public static getInstance(): AnchorRegistry {
    if (!AnchorRegistry.instance) {
      AnchorRegistry.instance = new AnchorRegistry()
    }
    return AnchorRegistry.instance
  }

  private handleResize = () => {
    this.notify()
  }

  public register(config: AnchorConfig): () => void {
    this.anchors.set(config.id, config)
    this.notify()

    return () => {
      if (this.anchors.get(config.id)?.element === config.element) {
        this.anchors.delete(config.id)
        this.notify()
      }
    }
  }

  public unregister(id: StrobiAnchorId): void {
    if (this.anchors.has(id)) {
      this.anchors.delete(id)
      this.notify()
    }
  }

  public get(id: StrobiAnchorId): AnchorConfig | undefined {
    return this.anchors.get(id)
  }

  public has(id: StrobiAnchorId): boolean {
    return this.anchors.has(id)
  }

  public getAll(): AnchorConfig[] {
    return Array.from(this.anchors.values())
  }

  public resolveCoordinates(
    id: StrobiAnchorId,
    clamp = true
  ): {
    x: number
    y: number
    scale: number
    size: number
    bounds: AnchorBounds | null
  } {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0, scale: 1, size: 80, bounds: null }
    }

    const config = this.anchors.get(id)

    let el = config?.element
    if (!el || !el.isConnected) {
      el =
        (document.querySelector(`[data-strobi-anchor="${id}"]`) as HTMLElement | null) ||
        document.getElementById(id)
      if (el && config) {
        config.element = el
      }
    }

    let isFallbackSection = false
    if (!el) {
      const sectionFallbacks: Record<string, string> = {
        'hero-cta': 'hero',
        hero: 'hero',
        'demo-play': 'editor-sandbox',
        demo: 'editor-sandbox',
        traction: 'traction',
        community: 'community-showcase',
        templates: 'templates-preview',
        pricing: 'pricing',
        widgets: 'widgets-showcase',
        ecosystem: 'ecosystem',
        faq: 'faq',
        cta: 'final-cta',
      }
      const sectionId = sectionFallbacks[id]
      if (sectionId) {
        el = document.getElementById(sectionId)
        isFallbackSection = true
      }
    }

    const size = config?.size ?? 80
    const scale = config?.scale ?? 1
    const align = config?.align ?? 'center'
    const offsetX = config?.offsetX ?? 0
    const offsetY = config?.offsetY ?? 0

    if (el && typeof el.getBoundingClientRect === 'function') {
      const rect = el.getBoundingClientRect()

      let targetX = rect.left + offsetX
      let targetY = rect.top + offsetY

      const isSectionLayout = isFallbackSection || el.tagName.toUpperCase() === 'SECTION'

      if (isSectionLayout) {
        targetX = Math.max(16, window.innerWidth - size * scale - 40)

        const vh = window.innerHeight
        if (rect.height > vh * 1.2) {
          const mascotHeight = size * scale
          const minDocY = rect.top + 100
          const maxDocY = rect.bottom - mascotHeight - 100

          const idealViewportY = vh * 0.45

          targetY = Math.max(minDocY, Math.min(maxDocY, idealViewportY))
        } else {
          targetY = rect.top + 60
        }
      } else {
        switch (align) {
          case 'top-left':
            targetX = rect.left + offsetX
            targetY = rect.top + offsetY
            break
          case 'top-right':
            targetX = rect.right - size * scale + offsetX
            targetY = rect.top + offsetY
            break
          case 'bottom-left':
            targetX = rect.left + offsetX
            targetY = rect.bottom - size * scale + offsetY
            break
          case 'bottom-right':
            targetX = rect.right - size * scale + offsetX
            targetY = rect.bottom - size * scale + offsetY
            break
          case 'center':
          default:
            targetX = rect.left + (rect.width - size * scale) / 2 + offsetX
            targetY = rect.top + (rect.height - size * scale) / 2 + offsetY
            break
        }
      }

      const maxX = Math.max(0, window.innerWidth - size * scale)
      const maxY = Math.max(0, window.innerHeight - size * scale)

      const clampedX = Math.max(8, Math.min(maxX - 8, targetX))
      const clampedY = Math.max(8, Math.min(maxY - 8, targetY))

      const resolved = {
        x: clamp ? clampedX : targetX,
        y: clamp ? clampedY : targetY,
        scale,
        size,
        bounds: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
        },
      }

      this.lastKnownCoordinates.set(id, resolved)
      return resolved
    }

    const cached = this.lastKnownCoordinates.get(id)
    if (cached) {
      return cached
    }

    const defaultSize = size
    return {
      x: window.innerWidth - defaultSize * scale - 24,
      y: window.innerHeight - defaultSize * scale - 24,
      scale,
      size: defaultSize,
      bounds: null,
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch (e) {
        console.error('AnchorRegistry listener error:', e)
      }
    })
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize)
    }
    this.anchors.clear()
    this.listeners.clear()
    AnchorRegistry.instance = null
  }
}
