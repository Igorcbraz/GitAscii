export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface AlignmentGuide {
  x?: number
  y?: number
}

export interface SpacingGuide {
  id: string
  axis: 'horizontal' | 'vertical'
  start: { x: number; y: number }
  end: { x: number; y: number }
  distance: number
  isEqualSpacing?: boolean
}

export interface SmartGuidesResult {
  snappedX: number
  snappedY: number
  alignmentGuides: AlignmentGuide[]
  spacingGuides: SpacingGuide[]
}

export const COMMON_GAPS = [8, 16, 24, 32, 48]
export const DEFAULT_SNAP_THRESHOLD = 6
export const CANVAS_WIDTH = 800
export const GRID_SIZE = 8

export function snapToGrid(
  value: number,
  gridSize = GRID_SIZE,
  threshold = DEFAULT_SNAP_THRESHOLD
): number {
  const gridValue = Math.round(value / gridSize) * gridSize
  return Math.abs(gridValue - value) <= threshold ? gridValue : value
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

interface ComputeSmartGuidesOptions {
  activeRect: Rect
  otherRects: { id: string; rect: Rect }[]
  minX?: number
  maxX?: number
  minY?: number
  snapThreshold?: number
  canvasWidth?: number
}

function hasOverlap(minA: number, maxA: number, minB: number, maxB: number): boolean {
  return Math.max(minA, minB) <= Math.min(maxA, maxB)
}

export function computeSmartGuides({
  activeRect,
  otherRects,
  minX = 0,
  maxX = CANVAS_WIDTH - activeRect.width,
  minY = 0,
  snapThreshold = DEFAULT_SNAP_THRESHOLD,
  canvasWidth = CANVAS_WIDTH,
}: ComputeSmartGuidesOptions): SmartGuidesResult {
  const rawX = activeRect.x
  const rawY = activeRect.y
  const width = activeRect.width
  const height = activeRect.height

  interface SnapCandidate {
    value: number
    guide: number
    distance: number
  }

  const xAlignCandidates: SnapCandidate[] = []
  const yAlignCandidates: SnapCandidate[] = []

  const considerXAlign = (value: number, guide: number) => {
    if (value < minX || value > maxX) return
    const distance = Math.abs(value - rawX)
    if (distance <= snapThreshold) {
      xAlignCandidates.push({ value, guide, distance })
    }
  }

  const considerYAlign = (value: number, guide: number) => {
    if (value < minY) return
    const distance = Math.abs(value - rawY)
    if (distance <= snapThreshold) {
      yAlignCandidates.push({ value, guide, distance })
    }
  }

  considerXAlign(0, 0)
  considerXAlign(canvasWidth - width, canvasWidth)
  considerXAlign(canvasWidth / 2 - width / 2, canvasWidth / 2)
  considerYAlign(0, 0)

  for (let i = 0; i < otherRects.length; i++) {
    const other = otherRects[i].rect
    const otherLeft = other.x
    const otherRight = other.x + other.width
    const otherCenterX = otherLeft + other.width / 2
    const otherTop = other.y
    const otherBottom = other.y + other.height
    const otherCenterY = otherTop + other.height / 2

    considerXAlign(otherLeft, otherLeft)
    considerXAlign(otherRight, otherRight)
    considerXAlign(otherLeft - width, otherLeft)
    considerXAlign(otherRight - width, otherRight)
    considerXAlign(otherCenterX - width / 2, otherCenterX)

    considerYAlign(otherTop, otherTop)
    considerYAlign(otherBottom, otherBottom)
    considerYAlign(otherTop - height, otherTop)
    considerYAlign(otherBottom - height, otherBottom)
    considerYAlign(otherCenterY - height / 2, otherCenterY)
  }

  interface SequenceSpacingResult {
    snappedPos: number
    guides: SpacingGuide[]
    distance: number
  }

  let bestSeqX: SequenceSpacingResult | null = null
  let bestSeqY: SequenceSpacingResult | null = null

  if (otherRects.length >= 2) {
    for (let i = 0; i < otherRects.length; i++) {
      for (let j = 0; j < otherRects.length; j++) {
        if (i === j) continue
        const itemA = otherRects[i]
        const itemB = otherRects[j]

        if (
          itemA.rect.x + itemA.rect.width <= itemB.rect.x &&
          hasOverlap(
            itemA.rect.y,
            itemA.rect.y + itemA.rect.height,
            itemB.rect.y,
            itemB.rect.y + itemB.rect.height
          )
        ) {
          const staticGap = itemB.rect.x - (itemA.rect.x + itemA.rect.width)
          if (staticGap > 0 && staticGap <= 250) {
            const midY_AB =
              (Math.max(itemA.rect.y, itemB.rect.y) +
                Math.min(itemA.rect.y + itemA.rect.height, itemB.rect.y + itemB.rect.height)) /
              2

            const candidateX_Right = itemB.rect.x + itemB.rect.width + staticGap
            const diffRight = Math.abs(candidateX_Right - rawX)
            if (
              diffRight <= snapThreshold &&
              candidateX_Right >= minX &&
              candidateX_Right <= maxX
            ) {
              if (!bestSeqX || diffRight < bestSeqX.distance) {
                const midY_BActive =
                  (Math.max(rawY, itemB.rect.y) +
                    Math.min(rawY + height, itemB.rect.y + itemB.rect.height)) /
                    2 || rawY + height / 2
                bestSeqX = {
                  snappedPos: candidateX_Right,
                  distance: diffRight,
                  guides: [
                    {
                      id: `seq-h-${itemA.id}-${itemB.id}-static`,
                      axis: 'horizontal',
                      start: { x: itemA.rect.x + itemA.rect.width, y: midY_AB },
                      end: { x: itemB.rect.x, y: midY_AB },
                      distance: staticGap,
                      isEqualSpacing: true,
                    },
                    {
                      id: `seq-h-${itemB.id}-active`,
                      axis: 'horizontal',
                      start: { x: itemB.rect.x + itemB.rect.width, y: midY_BActive },
                      end: { x: candidateX_Right, y: midY_BActive },
                      distance: staticGap,
                      isEqualSpacing: true,
                    },
                  ],
                }
              }
            }

            const candidateX_Left = itemA.rect.x - width - staticGap
            const diffLeft = Math.abs(candidateX_Left - rawX)
            if (diffLeft <= snapThreshold && candidateX_Left >= minX && candidateX_Left <= maxX) {
              if (!bestSeqX || diffLeft < bestSeqX.distance) {
                const midY_ActiveA =
                  (Math.max(rawY, itemA.rect.y) +
                    Math.min(rawY + height, itemA.rect.y + itemA.rect.height)) /
                    2 || rawY + height / 2
                bestSeqX = {
                  snappedPos: candidateX_Left,
                  distance: diffLeft,
                  guides: [
                    {
                      id: `seq-h-active-${itemA.id}`,
                      axis: 'horizontal',
                      start: { x: candidateX_Left + width, y: midY_ActiveA },
                      end: { x: itemA.rect.x, y: midY_ActiveA },
                      distance: staticGap,
                      isEqualSpacing: true,
                    },
                    {
                      id: `seq-h-${itemA.id}-${itemB.id}-static`,
                      axis: 'horizontal',
                      start: { x: itemA.rect.x + itemA.rect.width, y: midY_AB },
                      end: { x: itemB.rect.x, y: midY_AB },
                      distance: staticGap,
                      isEqualSpacing: true,
                    },
                  ],
                }
              }
            }
            const availableSpaceX = itemB.rect.x - (itemA.rect.x + itemA.rect.width) - width
            if (availableSpaceX > 0) {
              const targetGap = Math.round(availableSpaceX / 2)
              const candidateX_Mid = itemA.rect.x + itemA.rect.width + targetGap
              const diffMid = Math.abs(candidateX_Mid - rawX)
              if (diffMid <= snapThreshold && candidateX_Mid >= minX && candidateX_Mid <= maxX) {
                if (!bestSeqX || diffMid < bestSeqX.distance) {
                  const midY1 =
                    (Math.max(rawY, itemA.rect.y) +
                      Math.min(rawY + height, itemA.rect.y + itemA.rect.height)) /
                      2 || rawY + height / 2
                  const midY2 =
                    (Math.max(rawY, itemB.rect.y) +
                      Math.min(rawY + height, itemB.rect.y + itemB.rect.height)) /
                      2 || rawY + height / 2
                  bestSeqX = {
                    snappedPos: candidateX_Mid,
                    distance: diffMid,
                    guides: [
                      {
                        id: `seq-h-${itemA.id}-active`,
                        axis: 'horizontal',
                        start: { x: itemA.rect.x + itemA.rect.width, y: midY1 },
                        end: { x: candidateX_Mid, y: midY1 },
                        distance: targetGap,
                        isEqualSpacing: true,
                      },
                      {
                        id: `seq-h-active-${itemB.id}`,
                        axis: 'horizontal',
                        start: { x: candidateX_Mid + width, y: midY2 },
                        end: { x: itemB.rect.x, y: midY2 },
                        distance: targetGap,
                        isEqualSpacing: true,
                      },
                    ],
                  }
                }
              }
            }
          }
        }

        if (
          itemA.rect.y + itemA.rect.height <= itemB.rect.y &&
          hasOverlap(
            itemA.rect.x,
            itemA.rect.x + itemA.rect.width,
            itemB.rect.x,
            itemB.rect.x + itemB.rect.width
          )
        ) {
          const staticGap = itemB.rect.y - (itemA.rect.y + itemA.rect.height)
          if (staticGap > 0 && staticGap <= 250) {
            const midX_AB =
              (Math.max(itemA.rect.x, itemB.rect.x) +
                Math.min(itemA.rect.x + itemA.rect.width, itemB.rect.x + itemB.rect.width)) /
              2

            const candidateY_Below = itemB.rect.y + itemB.rect.height + staticGap
            const diffBelow = Math.abs(candidateY_Below - rawY)
            if (diffBelow <= snapThreshold && candidateY_Below >= minY) {
              if (!bestSeqY || diffBelow < bestSeqY.distance) {
                const midX_BActive =
                  (Math.max(rawX, itemB.rect.x) +
                    Math.min(rawX + width, itemB.rect.x + itemB.rect.width)) /
                    2 || rawX + width / 2
                bestSeqY = {
                  snappedPos: candidateY_Below,
                  distance: diffBelow,
                  guides: [
                    {
                      id: `seq-v-${itemA.id}-${itemB.id}-static`,
                      axis: 'vertical',
                      start: { x: midX_AB, y: itemA.rect.y + itemA.rect.height },
                      end: { x: midX_AB, y: itemB.rect.y },
                      distance: staticGap,
                      isEqualSpacing: true,
                    },
                    {
                      id: `seq-v-${itemB.id}-active`,
                      axis: 'vertical',
                      start: { x: midX_BActive, y: itemB.rect.y + itemB.rect.height },
                      end: { x: midX_BActive, y: candidateY_Below },
                      distance: staticGap,
                      isEqualSpacing: true,
                    },
                  ],
                }
              }
            }

            const candidateY_Above = itemA.rect.y - height - staticGap
            const diffAbove = Math.abs(candidateY_Above - rawY)
            if (diffAbove <= snapThreshold && candidateY_Above >= minY) {
              if (!bestSeqY || diffAbove < bestSeqY.distance) {
                const midX_ActiveA =
                  (Math.max(rawX, itemA.rect.x) +
                    Math.min(rawX + width, itemA.rect.x + itemA.rect.width)) /
                    2 || rawX + width / 2
                bestSeqY = {
                  snappedPos: candidateY_Above,
                  distance: diffAbove,
                  guides: [
                    {
                      id: `seq-v-active-${itemA.id}`,
                      axis: 'vertical',
                      start: { x: midX_ActiveA, y: candidateY_Above + height },
                      end: { x: midX_ActiveA, y: itemA.rect.y },
                      distance: staticGap,
                      isEqualSpacing: true,
                    },
                    {
                      id: `seq-v-${itemA.id}-${itemB.id}-static`,
                      axis: 'vertical',
                      start: { x: midX_AB, y: itemA.rect.y + itemA.rect.height },
                      end: { x: midX_AB, y: itemB.rect.y },
                      distance: staticGap,
                      isEqualSpacing: true,
                    },
                  ],
                }
              }
            }

            const availableSpaceY = itemB.rect.y - (itemA.rect.y + itemA.rect.height) - height
            if (availableSpaceY > 0) {
              const targetGap = Math.round(availableSpaceY / 2)
              const candidateY_Mid = itemA.rect.y + itemA.rect.height + targetGap
              const diffMid = Math.abs(candidateY_Mid - rawY)
              if (diffMid <= snapThreshold && candidateY_Mid >= minY) {
                if (!bestSeqY || diffMid < bestSeqY.distance) {
                  const midX1 =
                    (Math.max(rawX, itemA.rect.x) +
                      Math.min(rawX + width, itemA.rect.x + itemA.rect.width)) /
                      2 || rawX + width / 2
                  const midX2 =
                    (Math.max(rawX, itemB.rect.x) +
                      Math.min(rawX + width, itemB.rect.x + itemB.rect.width)) /
                      2 || rawX + width / 2
                  bestSeqY = {
                    snappedPos: candidateY_Mid,
                    distance: diffMid,
                    guides: [
                      {
                        id: `seq-v-${itemA.id}-active`,
                        axis: 'vertical',
                        start: { x: midX1, y: itemA.rect.y + itemA.rect.height },
                        end: { x: midX1, y: candidateY_Mid },
                        distance: targetGap,
                        isEqualSpacing: true,
                      },
                      {
                        id: `seq-v-active-${itemB.id}`,
                        axis: 'vertical',
                        start: { x: midX2, y: candidateY_Mid + height },
                        end: { x: midX2, y: itemB.rect.y },
                        distance: targetGap,
                        isEqualSpacing: true,
                      },
                    ],
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  interface SpacingSnapCandidate {
    snappedPos: number
    distance: number
    gap: number
    guide: SpacingGuide
  }

  const xSpacingCandidates: SpacingSnapCandidate[] = []
  const ySpacingCandidates: SpacingSnapCandidate[] = []

  for (let i = 0; i < otherRects.length; i++) {
    const otherId = otherRects[i].id
    const other = otherRects[i].rect

    const rawGapBelow = rawY - (other.y + other.height)
    if (rawGapBelow >= -snapThreshold && rawGapBelow <= 160) {
      for (let g = 0; g < COMMON_GAPS.length; g++) {
        const targetGap = COMMON_GAPS[g]
        const candidateY = other.y + other.height + targetGap
        const diff = Math.abs(candidateY - rawY)
        if (diff <= snapThreshold && candidateY >= minY) {
          const midX = hasOverlap(rawX, rawX + width, other.x, other.x + other.width)
            ? (Math.max(rawX, other.x) + Math.min(rawX + width, other.x + other.width)) / 2
            : rawX + width / 2
          ySpacingCandidates.push({
            snappedPos: candidateY,
            distance: diff,
            gap: targetGap,
            guide: {
              id: `v-gap-${otherId}-below-${targetGap}`,
              axis: 'vertical',
              start: { x: midX, y: other.y + other.height },
              end: { x: midX, y: candidateY },
              distance: targetGap,
            },
          })
        }
      }
    }

    const rawGapAbove = other.y - (rawY + height)
    if (rawGapAbove >= -snapThreshold && rawGapAbove <= 160) {
      for (let g = 0; g < COMMON_GAPS.length; g++) {
        const targetGap = COMMON_GAPS[g]
        const candidateY = other.y - height - targetGap
        const diff = Math.abs(candidateY - rawY)
        if (diff <= snapThreshold && candidateY >= minY) {
          const midX = hasOverlap(rawX, rawX + width, other.x, other.x + other.width)
            ? (Math.max(rawX, other.x) + Math.min(rawX + width, other.x + other.width)) / 2
            : rawX + width / 2
          ySpacingCandidates.push({
            snappedPos: candidateY,
            distance: diff,
            gap: targetGap,
            guide: {
              id: `v-gap-${otherId}-above-${targetGap}`,
              axis: 'vertical',
              start: { x: midX, y: candidateY + height },
              end: { x: midX, y: other.y },
              distance: targetGap,
            },
          })
        }
      }
    }

    const rawGapRight = rawX - (other.x + other.width)
    if (rawGapRight >= -snapThreshold && rawGapRight <= 160) {
      for (let g = 0; g < COMMON_GAPS.length; g++) {
        const targetGap = COMMON_GAPS[g]
        const candidateX = other.x + other.width + targetGap
        const diff = Math.abs(candidateX - rawX)
        if (diff <= snapThreshold && candidateX >= minX && candidateX <= maxX) {
          const midY = hasOverlap(rawY, rawY + height, other.y, other.y + other.height)
            ? (Math.max(rawY, other.y) + Math.min(rawY + height, other.y + other.height)) / 2
            : rawY + height / 2
          xSpacingCandidates.push({
            snappedPos: candidateX,
            distance: diff,
            gap: targetGap,
            guide: {
              id: `h-gap-${otherId}-right-${targetGap}`,
              axis: 'horizontal',
              start: { x: other.x + other.width, y: midY },
              end: { x: candidateX, y: midY },
              distance: targetGap,
            },
          })
        }
      }
    }

    const rawGapLeft = other.x - (rawX + width)
    if (rawGapLeft >= -snapThreshold && rawGapLeft <= 160) {
      for (let g = 0; g < COMMON_GAPS.length; g++) {
        const targetGap = COMMON_GAPS[g]
        const candidateX = other.x - width - targetGap
        const diff = Math.abs(candidateX - rawX)
        if (diff <= snapThreshold && candidateX >= minX && candidateX <= maxX) {
          const midY = hasOverlap(rawY, rawY + height, other.y, other.y + other.height)
            ? (Math.max(rawY, other.y) + Math.min(rawY + height, other.y + other.height)) / 2
            : rawY + height / 2
          xSpacingCandidates.push({
            snappedPos: candidateX,
            distance: diff,
            gap: targetGap,
            guide: {
              id: `h-gap-${otherId}-left-${targetGap}`,
              axis: 'horizontal',
              start: { x: candidateX + width, y: midY },
              end: { x: other.x, y: midY },
              distance: targetGap,
            },
          })
        }
      }
    }
  }

  const bestXAlign = xAlignCandidates.sort((a, b) => a.distance - b.distance)[0]
  const bestXSpacing = xSpacingCandidates.sort((a, b) => a.distance - b.distance)[0]

  let snappedX = rawX
  const alignmentGuides: AlignmentGuide[] = []
  const spacingGuides: SpacingGuide[] = []

  if (bestSeqX && (!bestXAlign || bestSeqX.distance < bestXAlign.distance)) {
    snappedX = bestSeqX.snappedPos
    spacingGuides.push(...bestSeqX.guides)
  } else if (bestXAlign && (!bestXSpacing || bestXAlign.distance <= bestXSpacing.distance)) {
    snappedX = bestXAlign.value
    alignmentGuides.push({ x: bestXAlign.guide })
  } else if (bestXSpacing) {
    snappedX = bestXSpacing.snappedPos
    spacingGuides.push(bestXSpacing.guide)
  } else {
    snappedX = clamp(snapToGrid(rawX, GRID_SIZE, snapThreshold), minX, maxX)
  }

  const bestYAlign = yAlignCandidates.sort((a, b) => a.distance - b.distance)[0]
  const bestYSpacing = ySpacingCandidates.sort((a, b) => a.distance - b.distance)[0]

  let snappedY = rawY

  if (bestSeqY && (!bestYAlign || bestSeqY.distance < bestYAlign.distance)) {
    snappedY = bestSeqY.snappedPos
    spacingGuides.push(...bestSeqY.guides)
  } else if (bestYAlign && (!bestYSpacing || bestYAlign.distance <= bestYSpacing.distance)) {
    snappedY = bestYAlign.value
    alignmentGuides.push({ y: bestYAlign.guide })
  } else if (bestYSpacing) {
    snappedY = bestYSpacing.snappedPos
    spacingGuides.push(bestYSpacing.guide)
  } else {
    snappedY = Math.max(minY, snapToGrid(rawY, GRID_SIZE, snapThreshold))
  }

  return {
    snappedX,
    snappedY,
    alignmentGuides,
    spacingGuides,
  }
}

export interface ComputeResizeSmartGuidesOptions {
  activePos: { x: number; y: number }
  rawWidth: number
  rawHeight: number
  resizeType: 'resize-r' | 'resize-b' | 'resize-br'
  otherRects: { id: string; rect: Rect }[]
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  snapThreshold?: number
  canvasWidth?: number
}

export interface ResizeSmartGuidesResult {
  snappedWidth: number
  snappedHeight: number
  alignmentGuides: AlignmentGuide[]
}

export function computeResizeSmartGuides({
  activePos,
  rawWidth,
  rawHeight,
  resizeType,
  otherRects,
  minWidth = 40,
  maxWidth = CANVAS_WIDTH - activePos.x,
  minHeight = 40,
  maxHeight = 3000,
  snapThreshold = DEFAULT_SNAP_THRESHOLD,
  canvasWidth = CANVAS_WIDTH,
}: ComputeResizeSmartGuidesOptions): ResizeSmartGuidesResult {
  const currentRight = activePos.x + rawWidth
  const currentBottom = activePos.y + rawHeight

  interface SnapCandidate {
    size: number
    guide: number
    distance: number
  }

  const widthCandidates: SnapCandidate[] = []
  const heightCandidates: SnapCandidate[] = []

  const considerWidth = (targetRight: number) => {
    const targetWidth = targetRight - activePos.x
    if (targetWidth < minWidth || targetWidth > maxWidth) return
    const distance = Math.abs(targetRight - currentRight)
    if (distance <= snapThreshold) {
      widthCandidates.push({ size: targetWidth, guide: targetRight, distance })
    }
  }

  const considerHeight = (targetBottom: number) => {
    const targetHeight = targetBottom - activePos.y
    if (targetHeight < minHeight || targetHeight > maxHeight) return
    const distance = Math.abs(targetBottom - currentBottom)
    if (distance <= snapThreshold) {
      heightCandidates.push({ size: targetHeight, guide: targetBottom, distance })
    }
  }

  if (resizeType === 'resize-r' || resizeType === 'resize-br') {
    // Canvas bounds
    considerWidth(canvasWidth)
    considerWidth(canvasWidth / 2)

    // Other rects
    for (let i = 0; i < otherRects.length; i++) {
      const other = otherRects[i].rect
      const otherLeft = other.x
      const otherRight = other.x + other.width
      const otherCenterX = otherLeft + other.width / 2

      considerWidth(otherLeft)
      considerWidth(otherRight)
      considerWidth(otherCenterX)

      // Common gaps to the right
      for (let g = 0; g < COMMON_GAPS.length; g++) {
        considerWidth(otherLeft - COMMON_GAPS[g])
      }
    }
  }

  if (resizeType === 'resize-b' || resizeType === 'resize-br') {
    for (let i = 0; i < otherRects.length; i++) {
      const other = otherRects[i].rect
      const otherTop = other.y
      const otherBottom = other.y + other.height
      const otherCenterY = otherTop + other.height / 2

      considerHeight(otherTop)
      considerHeight(otherBottom)
      considerHeight(otherCenterY)

      // Common gaps below
      for (let g = 0; g < COMMON_GAPS.length; g++) {
        considerHeight(otherTop - COMMON_GAPS[g])
      }
    }
  }

  const alignmentGuides: AlignmentGuide[] = []
  let snappedWidth = rawWidth
  let snappedHeight = rawHeight

  if (resizeType === 'resize-r' || resizeType === 'resize-br') {
    const bestWidth = widthCandidates.sort((a, b) => a.distance - b.distance)[0]
    if (bestWidth) {
      snappedWidth = bestWidth.size
      alignmentGuides.push({ x: bestWidth.guide })
    } else {
      snappedWidth = Math.max(
        minWidth,
        Math.min(maxWidth, Math.round(rawWidth / GRID_SIZE) * GRID_SIZE)
      )
    }
  }

  if (resizeType === 'resize-b' || resizeType === 'resize-br') {
    const bestHeight = heightCandidates.sort((a, b) => a.distance - b.distance)[0]
    if (bestHeight) {
      snappedHeight = bestHeight.size
      alignmentGuides.push({ y: bestHeight.guide })
    } else {
      snappedHeight = Math.max(minHeight, Math.round(rawHeight / GRID_SIZE) * GRID_SIZE)
    }
  }

  return {
    snappedWidth,
    snappedHeight,
    alignmentGuides,
  }
}
