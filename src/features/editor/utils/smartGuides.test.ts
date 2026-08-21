import { describe, expect, it } from 'vitest'

import {
  clamp,
  COMMON_GAPS,
  computeResizeSmartGuides,
  computeSmartGuides,
  snapToGrid,
} from './smartGuides'

describe('smartGuides utility', () => {
  it('correctly clamps values within bounds', () => {
    expect(clamp(10, 0, 100)).toBe(10)
    expect(clamp(-5, 0, 100)).toBe(0)
    expect(clamp(150, 0, 100)).toBe(100)
  })

  it('correctly snaps to grid when close to multiples of 8', () => {
    expect(snapToGrid(15, 8, 6)).toBe(16)
    expect(snapToGrid(17, 8, 6)).toBe(16)
    expect(snapToGrid(20, 8, 2)).toBe(20) // Outside threshold 2
  })

  it('snaps to object edges (left, right, center)', () => {
    const result = computeSmartGuides({
      activeRect: { x: 98, y: 150, width: 200, height: 100 },
      otherRects: [{ id: 'widget-1', rect: { x: 100, y: 0, width: 200, height: 100 } }],
      snapThreshold: 6,
    })

    expect(result.snappedX).toBe(100)
    expect(result.alignmentGuides.some((g) => g.x === 100)).toBe(true)
  })

  it('snaps to common vertical gaps (e.g. 16px)', () => {
    // other is at y=0, height=100 (bottom is 100).
    // Target 16px gap -> y should be 116.
    // Active is at y=114 (within threshold 6 of 116).
    const result = computeSmartGuides({
      activeRect: { x: 0, y: 114, width: 800, height: 100 },
      otherRects: [{ id: 'widget-top', rect: { x: 0, y: 0, width: 800, height: 100 } }],
      snapThreshold: 6,
    })

    expect(result.snappedY).toBe(116)
    expect(result.spacingGuides.length).toBeGreaterThan(0)
    const spacingGuide = result.spacingGuides.find((g) => g.distance === 16)
    expect(spacingGuide).toBeDefined()
    expect(spacingGuide?.axis).toBe('vertical')
    expect(spacingGuide?.start.y).toBe(100)
    expect(spacingGuide?.end.y).toBe(116)
  })

  it('snaps to common horizontal gaps (e.g. 24px)', () => {
    // other is at x=0, width=200 (right is 200).
    // Target 24px gap -> x should be 224.
    // Active is at x=222 (within threshold 6 of 224).
    const result = computeSmartGuides({
      activeRect: { x: 222, y: 0, width: 200, height: 100 },
      otherRects: [{ id: 'widget-left', rect: { x: 0, y: 0, width: 200, height: 100 } }],
      snapThreshold: 6,
    })

    expect(result.snappedX).toBe(224)
    const spacingGuide = result.spacingGuides.find((g) => g.distance === 24)
    expect(spacingGuide).toBeDefined()
  })

  it('snaps right edge to matching other widget right edge during resize', () => {
    const result = computeResizeSmartGuides({
      activePos: { x: 0, y: 0 },
      rawWidth: 398,
      rawHeight: 100,
      resizeType: 'resize-r',
      otherRects: [{ id: 'w1', rect: { x: 0, y: 150, width: 400, height: 100 } }],
      snapThreshold: 6,
    })

    expect(result.snappedWidth).toBe(400)
    expect(result.alignmentGuides.some((g) => g.x === 400)).toBe(true)
  })

  it('snaps bottom edge to matching other widget bottom edge during resize', () => {
    const result = computeResizeSmartGuides({
      activePos: { x: 0, y: 0 },
      rawWidth: 200,
      rawHeight: 298,
      resizeType: 'resize-b',
      otherRects: [{ id: 'w1', rect: { x: 300, y: 0, width: 200, height: 300 } }],
      snapThreshold: 6,
    })

    expect(result.snappedHeight).toBe(300)
    expect(result.alignmentGuides.some((g) => g.y === 300)).toBe(true)
  })

  it('detects equal spacing (equidistance) between two widgets', () => {
    // Widget 1 at y=0, height=100 (bottom = 100)
    // Widget 2 at y=300, height=100 (top = 300)
    // Active height = 100.
    // Available space between = 300 - 100 = 200.
    // Remaining space for 2 gaps = 200 - 100 = 100 -> gap = 50px each.
    // Ideal Active Y = 100 + 50 = 150.
    // Raw Y is at 148 (close to 150).
    const result = computeSmartGuides({
      activeRect: { x: 0, y: 148, width: 800, height: 100 },
      otherRects: [
        { id: 'top-widget', rect: { x: 0, y: 0, width: 800, height: 100 } },
        { id: 'bottom-widget', rect: { x: 0, y: 300, width: 800, height: 100 } },
      ],
      snapThreshold: 6,
    })

    expect(result.snappedY).toBe(150)
    expect(result.spacingGuides.length).toBe(2)
    expect(result.spacingGuides[0].isEqualSpacing).toBe(true)
    expect(result.spacingGuides[1].isEqualSpacing).toBe(true)
    expect(result.spacingGuides[0].distance).toBe(50)
    expect(result.spacingGuides[1].distance).toBe(50)
  })

  it('handles empty otherRects without crashing and falls back to grid/bounds snap', () => {
    const result = computeSmartGuides({
      activeRect: { x: 15, y: 25, width: 200, height: 100 },
      otherRects: [],
      snapThreshold: 6,
    })

    expect(result.snappedX).toBe(16) // Grid snap to 16
    expect(result.snappedY).toBe(24) // Grid snap to 24
    expect(result.alignmentGuides).toEqual([])
  })

  it('snaps for all defined COMMON_GAPS [8, 16, 24, 32, 48]', () => {
    for (const gap of COMMON_GAPS) {
      const result = computeSmartGuides({
        activeRect: { x: 0, y: 100 + gap - 2, width: 800, height: 50 },
        otherRects: [{ id: 'top-item', rect: { x: 0, y: 0, width: 800, height: 100 } }],
        snapThreshold: 6,
      })

      expect(result.snappedY).toBe(100 + gap)
      const guide = result.spacingGuides.find((g) => g.distance === gap)
      expect(guide).toBeDefined()
      expect(guide?.axis).toBe('vertical')
    }
  })

  it('snaps when active widget is positioned above another widget', () => {
    // Other widget is at y=200.
    // Active widget height=50.
    // With 16px gap, active widget top should be 200 - 50 - 16 = 134.
    // Raw Y is 135.
    const result = computeSmartGuides({
      activeRect: { x: 0, y: 135, width: 800, height: 50 },
      otherRects: [{ id: 'bottom-item', rect: { x: 0, y: 200, width: 800, height: 100 } }],
      snapThreshold: 6,
    })

    expect(result.snappedY).toBe(134)
    const guide = result.spacingGuides.find((g) => g.distance === 16)
    expect(guide).toBeDefined()
  })

  it('snaps when active widget is positioned to the left of another widget', () => {
    // Other widget at x=300, y=0, width=100, height=100.
    // Active widget width=100.
    // With 32px gap, active widget left should be 300 - 100 - 32 = 168.
    // Raw X is 169.
    const result = computeSmartGuides({
      activeRect: { x: 169, y: 0, width: 100, height: 100 },
      otherRects: [{ id: 'right-item', rect: { x: 300, y: 0, width: 100, height: 100 } }],
      snapThreshold: 6,
    })

    expect(result.snappedX).toBe(168)
    const guide = result.spacingGuides.find((g) => g.distance === 32)
    expect(guide).toBeDefined()
    expect(guide?.axis).toBe('horizontal')
  })

  it('detects 3-in-a-row sequence and suggests matching 16px gap when dragging a 3rd widget', () => {
    // Widget 1: x=0, width=100
    // Widget 2: x=116, width=100 (gap between 1 and 2 = 16px)
    // Widget 3 (Active): width=100. Moving near x = 116 + 100 + 16 = 232 (e.g. at raw x=230)
    const result = computeSmartGuides({
      activeRect: { x: 230, y: 0, width: 100, height: 100 },
      otherRects: [
        { id: 'widget-1', rect: { x: 0, y: 0, width: 100, height: 100 } },
        { id: 'widget-2', rect: { x: 116, y: 0, width: 100, height: 100 } },
      ],
      snapThreshold: 6,
    })

    expect(result.snappedX).toBe(232)
    expect(result.spacingGuides.length).toBe(2)
    expect(result.spacingGuides[0].distance).toBe(16)
    expect(result.spacingGuides[1].distance).toBe(16)
    expect(result.spacingGuides[0].isEqualSpacing).toBe(true)
    expect(result.spacingGuides[1].isEqualSpacing).toBe(true)
  })

  it('detects 3-in-a-column vertical sequence and suggests matching 20px gap', () => {
    // Widget 1: y=0, height=80
    // Widget 2: y=100, height=80 (gap between 1 and 2 = 20px)
    // Widget 3 (Active): height=80. Moving near y = 100 + 80 + 20 = 200 (e.g. raw y=198)
    const result = computeSmartGuides({
      activeRect: { x: 0, y: 198, width: 200, height: 80 },
      otherRects: [
        { id: 'widget-1', rect: { x: 0, y: 0, width: 200, height: 80 } },
        { id: 'widget-2', rect: { x: 0, y: 100, width: 200, height: 80 } },
      ],
      snapThreshold: 6,
    })

    expect(result.snappedY).toBe(200)
    expect(result.spacingGuides.length).toBe(2)
    expect(result.spacingGuides[0].distance).toBe(20)
    expect(result.spacingGuides[1].distance).toBe(20)
  })
})
