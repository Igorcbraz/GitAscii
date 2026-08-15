export function calculateFitZoom(availableWidth: number): number {
  if (!availableWidth || availableWidth <= 0) return 1
  const targetWidth = 800 + 40 // 800px canvas width + 40px margin/padding
  const fit = availableWidth / targetWidth
  return Math.max(0.25, Math.min(1.1, Math.round(fit * 100) / 100))
}

export function getCanvasContainerWidth(): number {
  if (typeof window === 'undefined') return 1200
  const container =
    document.getElementById('svg-canvas-viewport') ||
    document.querySelector('[data-canvas-container]')
  if (container && container.clientWidth > 0) {
    return container.clientWidth
  }
  const isMobile = window.innerWidth < 1024
  if (isMobile) {
    return window.innerWidth
  }
  // Desktop with 2 sidebars (approx 300px + 320px = 620px)
  return Math.max(320, window.innerWidth - 620)
}
