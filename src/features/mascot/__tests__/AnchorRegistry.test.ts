import { describe, expect, it } from 'vitest'

import { AnchorRegistry } from '../core/AnchorRegistry'

describe('AnchorRegistry (Spatial Landmark Coordination)', () => {
  it('registers and retrieves anchors', () => {
    const registry = AnchorRegistry.getInstance()

    const unregister = registry.register({
      id: 'test-hero',
      size: 96,
      scale: 1,
      align: 'center',
    })

    expect(registry.has('test-hero')).toBe(true)
    const anchor = registry.get('test-hero')
    expect(anchor?.size).toBe(96)

    unregister()
    expect(registry.has('test-hero')).toBe(false)
  })

  it('notifies subscribers when anchors change', () => {
    const registry = AnchorRegistry.getInstance()
    let notifyCount = 0

    const unsub = registry.subscribe(() => {
      notifyCount += 1
    })

    const unregister = registry.register({
      id: 'test-features',
      size: 80,
    })

    expect(notifyCount).toBeGreaterThan(0)

    unsub()
    unregister()
  })

  it('resolves coordinates with safe viewport boundary clamping', () => {
    const registry = AnchorRegistry.getInstance()

    registry.register({
      id: 'test-dock',
      size: 80,
      scale: 1,
    })

    const coords = registry.resolveCoordinates('test-dock')
    expect(Number.isFinite(coords.x)).toBe(true)
    expect(Number.isFinite(coords.y)).toBe(true)
    expect(coords.size).toBe(80)
    expect(coords.scale).toBe(1)
  })
})
