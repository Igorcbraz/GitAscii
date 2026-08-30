'use client'

import { Layers, Lock, Move, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { EXTERNAL_LINKS, GITHUB_THEME_KEYS, isGitHubAdaptiveTheme } from '@/constants'
import { convertImageToAsciiCanvas } from '@/engine/ascii/converter'
import { getWidgetMinSize } from '@/engine/core/WidgetRenderer'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'
import {
  type AlignmentGuide,
  CANVAS_WIDTH,
  clamp,
  computeResizeSmartGuides,
  computeSmartGuides,
  DEFAULT_SNAP_THRESHOLD as SNAP_THRESHOLD,
  type SpacingGuide,
} from '../../utils/smartGuides'
import { LayersPanel } from '../Sidebar/LayersPanel'
import { CanvasAlignmentGuides } from './CanvasAlignmentGuides'
import { CanvasMarquee } from './CanvasMarquee'
import { WidgetNode } from './WidgetNode'

type Position = { x: number; y: number }
type Size = { width: number; height: number }
type DragType = 'move' | 'resize-r' | 'resize-b' | 'resize-br'

type DragState = {
  instanceId: string
  type: DragType
  startX: number
  startY: number
  initialPos: Position
  initialSize: Size
  initialPositions: Record<string, Position>
  selectedInstanceIds: string[]
}

type DragPreview = {
  positions: Record<string, Position>
  sizes: Record<string, Size>
  guides: AlignmentGuide[]
  spacingGuides: SpacingGuide[]
}

export function SVGCanvas() {
  const { t } = useI18n()
  const {
    config,
    githubData,
    selectedInstanceId,
    selectedInstanceIds,
    selectWidget,
    updateWidgetConfig,
    zoom,
    showGrid,
    gridMode,
  } = useEditorStore()

  const [isLayersOpen, setIsLayersOpen] = useState(false)

  const activeDragRef = useRef<DragState | null>(null)
  const dragPreviewRef = useRef<DragPreview | null>(null)
  const dragRafRef = useRef<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const lastTapRef = useRef<{ id: string; time: number }>({ id: '', time: 0 })

  const [marquee, setMarquee] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const scrollRafRef = useRef<number | null>(null)
  const marqueeRafRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const dragPosRef = useRef({ x: 0, y: 0 })
  const suppressClickRef = useRef(false)
  const marqueeRef = useRef<typeof marquee>(null)
  const configRef = useRef(config)
  const selectedInstanceIdsRef = useRef(selectedInstanceIds)
  const zoomRef = useRef(zoom)

  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([])
  const [spacingGuides, setSpacingGuides] = useState<SpacingGuide[]>([])

  const [playingPreviews, setPlayingPreviews] = useState<Record<string, boolean>>({})

  const [editingText, setEditingText] = useState<{
    instanceId: string
    field: string
    initialValue: string
  } | null>(null)

  const widgetPreviewKeys = useMemo(() => {
    if (!config) return ''
    return config.widgets
      .map((w) => `${w.instanceId}:${w.config.animationPreviewKey || 0}`)
      .join(',')
  }, [config])

  const prevKeysRef = useRef<string>('')

  useEffect(() => {
    if (!config) return
    if (!prevKeysRef.current) {
      prevKeysRef.current = widgetPreviewKeys
      return
    }

    const oldParts = prevKeysRef.current.split(',')
    const newParts = widgetPreviewKeys.split(',')

    newParts.forEach((part, idx) => {
      if (part !== oldParts[idx]) {
        const [instanceId] = part.split(':')
        setPlayingPreviews((prev) => ({ ...prev, [instanceId]: true }))
        setTimeout(() => {
          setPlayingPreviews((prev) => ({ ...prev, [instanceId]: false }))
        }, 2500)
      }
    })

    prevKeysRef.current = widgetPreviewKeys
  }, [widgetPreviewKeys, config])

  const editorAnimOverrideStyle = useMemo(() => {
    if (!config) return ''
    return config.widgets
      .map((w) => {
        const isPlaying = playingPreviews[w.instanceId]
        const safeId = (w.instanceId || '').replace(/[^a-zA-Z0-9_-]/g, '')
        if (!safeId) return ''
        if (!isPlaying) {
          return `
            .static-anim-${safeId} #widget-${safeId} .anim-target,
            .static-anim-${safeId} #widget-${safeId} .typewriter-target {
              animation: none !important;
              opacity: 1 !important;
              clip-path: none !important;
            }
          `
        }
        return ''
      })
      .join('\n')
  }, [config, playingPreviews])

  const asciiParamsStr = useMemo(() => {
    if (!config) return ''
    return config.widgets
      .filter((w) => w.widgetId === 'ascii-art')
      .map((w) => {
        const cfg = w.config
        const sourceType = (cfg.sourceType as 'avatar' | 'url' | 'upload') || 'avatar'
        const customImageUrl = (cfg.imageUrl as string) || ''
        const uploadedImageData = (cfg.uploadedImageData as string) || ''
        return `${w.instanceId}:${sourceType}:${customImageUrl}:${uploadedImageData}:${cfg.charset || 'dense'}:${cfg.customCharset || ''}:${cfg.invert || false}:${cfg.detail || 'medium'}:${cfg.cols || 0}:${cfg.contrast || 10}:${cfg.brightness || 0}:${cfg.edgeEnhance !== false}:${cfg.autoContrast !== false}:${cfg.dithering !== false}:${cfg.colorMode || 'monochrome'}:${cfg.asciiText ? 'hasText' : 'noText'}`
      })
      .join('|')
  }, [config])

  useEffect(() => {
    if (!config || !githubData) return

    const asciiWidgets = config.widgets.filter(
      (w) => w.widgetId === 'ascii-art' && !w.config.asciiText
    )

    if (asciiWidgets.length === 0) return

    asciiWidgets.forEach(async (widget) => {
      const cfg = widget.config
      const sourceType = (cfg.sourceType as 'avatar' | 'url' | 'upload') || 'avatar'
      const customImageUrl = (cfg.imageUrl as string) || ''
      const uploadedImageData = (cfg.uploadedImageData as string) || ''

      let imgSrc = githubData.user.avatar_url || EXTERNAL_LINKS.DEFAULT_GITHUB_AVATAR
      if (sourceType === 'upload' && uploadedImageData) {
        imgSrc = uploadedImageData
      } else if (sourceType === 'url' && customImageUrl) {
        imgSrc = customImageUrl
      }

      const charset = (cfg.charset as string) || 'dense'
      const customCharset = (cfg.customCharset as string) || ''
      const invert = Boolean(cfg.invert)
      const detail = (cfg.detail as 'low' | 'medium' | 'high' | 'ultra' | 'custom') || 'medium'
      const cols =
        Number(cfg.cols) ||
        (detail === 'low' ? 28 : detail === 'medium' ? 45 : detail === 'high' ? 85 : 150)

      const contrast = Number(cfg.contrast !== undefined ? cfg.contrast : 10)
      const brightness = Number(cfg.brightness !== undefined ? cfg.brightness : 0)
      const edgeEnhance = Boolean(cfg.edgeEnhance !== undefined ? cfg.edgeEnhance : true)
      const autoContrast = Boolean(cfg.autoContrast !== false)
      const dithering = Boolean(cfg.dithering !== false)
      const colorMode = (cfg.colorMode as 'monochrome' | 'color') || 'monochrome'

      try {
        const options = {
          charset,
          customCharset,
          invert,
          cols,
          contrast,
          brightness,
          edgeEnhance,
          autoContrast,
          dithering,
          colorMode,
        }

        const result = await convertImageToAsciiCanvas(imgSrc, options)

        updateWidgetConfig(widget.instanceId, {
          asciiText: result.lines,
          asciiColors: result.colorMatrix,
          cols: result.cols,
          rows: result.rows,
        })
      } catch (err) {
        console.warn('Background ASCII Conversion Warning:', err)
      }
    })
  }, [asciiParamsStr, githubData, updateWidgetConfig])

  useEffect(() => {
    if (!isLayersOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLayersOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLayersOpen])

  const previousWidgetsLength = useRef(config?.widgets.length || 0)

  useEffect(() => {
    configRef.current = config

    if (config && config.widgets.length > previousWidgetsLength.current) {
      const newWidget = config.widgets[config.widgets.length - 1]
      if (containerRef.current?.parentElement && newWidget) {
        const parent = containerRef.current.parentElement
        const targetY = newWidget.position.y * zoomRef.current - 100

        const startY = parent.scrollTop
        const distance = targetY - startY
        const duration = 400 // ms
        let start: number | null = null

        const step = (timestamp: number) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)

          const ease = 1 - Math.pow(1 - progress, 3)
          parent.scrollTop = startY + distance * ease
          if (progress < 1) {
            requestAnimationFrame(step)
          }
        }
        requestAnimationFrame(step)
      }
    }
    if (config) {
      previousWidgetsLength.current = config.widgets.length
    }
  }, [config])

  useEffect(() => {
    selectedInstanceIdsRef.current = selectedInstanceIds
  }, [selectedInstanceIds])

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  const applyPreviewToCanvas = useCallback((preview: DragPreview) => {
    const currentConfig = configRef.current
    if (!currentConfig || !svgContainerRef.current) return

    for (const [instanceId, position] of Object.entries(preview.positions)) {
      const widget = currentConfig.widgets.find((item) => item.instanceId === instanceId)
      if (!widget) continue

      const widgetElementId = 'widget-' + instanceId
      const widgetElement = svgContainerRef.current.querySelector<SVGGElement>(
        `g#${widgetElementId}`
      )
      const size = preview.sizes[instanceId] || widget.size
      const scaleX = size.width / widget.size.width
      const scaleY = size.height / widget.size.height

      if (widgetElement) {
        widgetElement.setAttribute(
          'transform',
          `translate(${position.x}, ${position.y}) scale(${scaleX} ${scaleY})`
        )
      }

      const overlayEl = document.getElementById('overlay-widget-' + instanceId)
      if (overlayEl) {
        overlayEl.style.left = `${position.x}px`
        overlayEl.style.top = `${position.y}px`
        overlayEl.style.width = `${size.width}px`
        overlayEl.style.height = `${size.height}px`

        const sizeBadge = overlayEl.querySelector<HTMLElement>('.widget-size-badge')
        if (sizeBadge) {
          sizeBadge.textContent = `(${size.width}x${size.height})`
        }
      }
    }

    for (const [instanceId, size] of Object.entries(preview.sizes)) {
      if (preview.positions[instanceId]) continue
      const overlayEl = document.getElementById('overlay-widget-' + instanceId)
      if (overlayEl) {
        overlayEl.style.width = `${size.width}px`
        overlayEl.style.height = `${size.height}px`

        const sizeBadge = overlayEl.querySelector<HTMLElement>('.widget-size-badge')
        if (sizeBadge) {
          sizeBadge.textContent = `(${size.width}x${size.height})`
        }
      }
    }
  }, [])

  const scheduleDragPreview = useCallback(
    (preview: DragPreview) => {
      dragPreviewRef.current = preview
      if (dragRafRef.current !== null) return

      dragRafRef.current = requestAnimationFrame(() => {
        dragRafRef.current = null
        const nextPreview = dragPreviewRef.current
        if (!nextPreview) return
        applyPreviewToCanvas(nextPreview)
        setAlignmentGuides(nextPreview.guides)
        setSpacingGuides(nextPreview.spacingGuides || [])
      })
    },
    [applyPreviewToCanvas]
  )

  const startDrag = (drag: DragState) => {
    activeDragRef.current = drag
    dragPreviewRef.current = null
    setAlignmentGuides([])
    setSpacingGuides([])

    if (svgContainerRef.current) {
      svgContainerRef.current.classList.add('canvas-is-dragging')
      svgContainerRef.current.querySelectorAll('svg').forEach((svg) => {
        if (typeof svg.pauseAnimations === 'function') {
          try {
            svg.pauseAnimations()
          } catch (err) {
            console.debug('SVG pauseAnimations not supported in current environment', err)
          }
        }
      })
    }
  }

  useEffect(() => {
    const buildDragPreview = (event: MouseEvent | TouchEvent) => {
      const activeDrag = activeDragRef.current
      const currentConfig = configRef.current
      if (!activeDrag || !currentConfig) return

      const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY

      const deltaX = Math.round((clientX - activeDrag.startX) / zoomRef.current)
      const deltaY = Math.round((clientY - activeDrag.startY) / zoomRef.current)
      const targetWidget = currentConfig.widgets.find(
        (widget) => widget.instanceId === activeDrag.instanceId
      )
      if (!targetWidget) return

      const isAspectLocked =
        targetWidget.widgetId === 'avatar' ||
        targetWidget.widgetId === 'ascii-art' ||
        Boolean(
          targetWidget.config.lockAspectRatio !== false &&
          (targetWidget.widgetId === 'avatar' || targetWidget.widgetId === 'ascii-art')
        ) ||
        Boolean(targetWidget.config.lockAspectRatio)

      if (activeDrag.type === 'move') {
        const movingWidgets = activeDrag.selectedInstanceIds
          .map((instanceId) =>
            currentConfig.widgets.find((widget) => widget.instanceId === instanceId)
          )
          .filter((widget): widget is NonNullable<typeof widget> => Boolean(widget))
        const minGroupX = Math.min(...movingWidgets.map((widget) => widget.position.x))
        const maxGroupRight = Math.max(
          ...movingWidgets.map((widget) => widget.position.x + widget.size.width)
        )
        const minGroupY = Math.min(...movingWidgets.map((widget) => widget.position.y))
        const minX = activeDrag.initialPos.x - minGroupX
        const maxX = activeDrag.initialPos.x + CANVAS_WIDTH - maxGroupRight
        const minY = activeDrag.initialPos.y - minGroupY
        const width = activeDrag.initialSize.width
        const height = activeDrag.initialSize.height
        const rawX = clamp(activeDrag.initialPos.x + deltaX, minX, maxX)
        const rawY = Math.max(minY, activeDrag.initialPos.y + deltaY)

        const movingIds = new Set(activeDrag.selectedInstanceIds)
        const otherRects = currentConfig.widgets
          .filter((w) => w.visible && !movingIds.has(w.instanceId))
          .map((w) => ({
            id: w.instanceId,
            rect: {
              x: w.position.x,
              y: w.position.y,
              width: w.size.width,
              height: w.size.height,
            },
          }))

        const currentGridMode = useEditorStore.getState().showGrid
          ? useEditorStore.getState().gridMode
          : 'off'

        const smartResult = computeSmartGuides({
          activeRect: { x: rawX, y: rawY, width, height },
          otherRects,
          minX,
          maxX,
          minY,
          snapThreshold: SNAP_THRESHOLD,
          canvasWidth: CANVAS_WIDTH,
          gridMode: currentGridMode,
        })

        const x = smartResult.snappedX
        const y = smartResult.snappedY
        const offsetX = x - activeDrag.initialPos.x
        const offsetY = y - activeDrag.initialPos.y
        const positions = Object.fromEntries(
          Object.entries(activeDrag.initialPositions).map(([instanceId, position]) => [
            instanceId,
            { x: position.x + offsetX, y: position.y + offsetY },
          ])
        )

        scheduleDragPreview({
          positions,
          sizes: {},
          guides: smartResult.alignmentGuides,
          spacingGuides: smartResult.spacingGuides,
        })
        return
      }

      const maxWidth = CANVAS_WIDTH - activeDrag.initialPos.x
      const rawWidth =
        activeDrag.type === 'resize-r' || activeDrag.type === 'resize-br'
          ? activeDrag.initialSize.width + deltaX
          : activeDrag.initialSize.width
      const rawHeight =
        activeDrag.type === 'resize-b' || activeDrag.type === 'resize-br'
          ? activeDrag.initialSize.height + deltaY
          : activeDrag.initialSize.height

      const otherRects = currentConfig.widgets
        .filter((w) => w.visible && w.instanceId !== activeDrag.instanceId)
        .map((w) => ({
          id: w.instanceId,
          rect: {
            x: w.position.x,
            y: w.position.y,
            width: w.size.width,
            height: w.size.height,
          },
        }))

      const resizeResult = computeResizeSmartGuides({
        activePos: activeDrag.initialPos,
        rawWidth,
        rawHeight,
        resizeType: activeDrag.type as 'resize-r' | 'resize-b' | 'resize-br',
        otherRects,
        minWidth: 40,
        maxWidth,
        minHeight: 40,
        snapThreshold: SNAP_THRESHOLD,
        canvasWidth: CANVAS_WIDTH,
      })

      let width = resizeResult.snappedWidth
      let height = resizeResult.snappedHeight

      if (isAspectLocked) {
        const side =
          activeDrag.type === 'resize-b'
            ? Math.min(maxWidth, height)
            : activeDrag.type === 'resize-r'
              ? width
              : Math.min(maxWidth, width, height)
        width = side
        height = side
      }

      const activeWidget = currentConfig.widgets.find((w) => w.instanceId === activeDrag.instanceId)
      if (activeWidget && githubData) {
        const tempWidget = { ...activeWidget, size: { width, height } }
        const minSize = getWidgetMinSize(tempWidget, githubData)
        if (minSize && height < minSize.height) {
          height = minSize.height
        }
      }

      scheduleDragPreview({
        positions: { [activeDrag.instanceId]: activeDrag.initialPos },
        sizes: { [activeDrag.instanceId]: { width, height } },
        guides: resizeResult.alignmentGuides,
        spacingGuides: [],
      })
    }

    const stopAutoScroll = () => {
      isDraggingRef.current = false
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current)
        scrollRafRef.current = null
      }
    }

    const doAutoScroll = () => {
      if (!isDraggingRef.current || !containerRef.current?.parentElement) return

      const parent = containerRef.current.parentElement
      const rect = parent.getBoundingClientRect()
      const mouse = dragPosRef.current
      const threshold = 50
      const maxSpeed = 15
      const scrollX =
        mouse.x < rect.left + threshold
          ? -((rect.left + threshold - mouse.x) / threshold) * maxSpeed
          : mouse.x > rect.right - threshold
            ? ((mouse.x - (rect.right - threshold)) / threshold) * maxSpeed
            : 0
      const scrollY =
        mouse.y < rect.top + threshold
          ? -((rect.top + threshold - mouse.y) / threshold) * maxSpeed
          : mouse.y > rect.bottom - threshold
            ? ((mouse.y - (rect.bottom - threshold)) / threshold) * maxSpeed
            : 0

      if (scrollX !== 0 || scrollY !== 0) parent.scrollBy(scrollX, scrollY)
      scrollRafRef.current = requestAnimationFrame(doAutoScroll)
    }

    const startAutoScroll = () => {
      isDraggingRef.current = true
      if (scrollRafRef.current === null) {
        scrollRafRef.current = requestAnimationFrame(doAutoScroll)
      }
    }

    const finishDrag = () => {
      const activeDrag = activeDragRef.current
      const preview = dragPreviewRef.current
      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current)
        dragRafRef.current = null
      }

      if (activeDrag && preview) {
        const store = useEditorStore.getState()
        if (activeDrag.type === 'move') {
          const positions = Object.entries(preview.positions)
            .filter(([instanceId, position]) => {
              const initialPosition = activeDrag.initialPositions[instanceId]
              return (
                initialPosition &&
                (initialPosition.x !== position.x || initialPosition.y !== position.y)
              )
            })
            .map(([instanceId, position]) => ({ instanceId, position }))
          if (positions.length > 0) store.updateWidgetPositions(positions, false)
        } else {
          const size = preview.sizes[activeDrag.instanceId]
          if (
            size &&
            (size.width !== activeDrag.initialSize.width ||
              size.height !== activeDrag.initialSize.height)
          ) {
            store.updateWidgetSize(activeDrag.instanceId, size, false)
          }
        }
        store.recordHistorySnapshot()
      }

      if (configRef.current) {
        for (const widget of configRef.current.widgets) {
          if (svgContainerRef.current) {
            const el = svgContainerRef.current.querySelector<SVGGElement>(
              `g#widget-${widget.instanceId}`
            )
            if (el) {
              el.setAttribute('transform', `translate(${widget.position.x}, ${widget.position.y})`)
            }
          }
          const overlayEl = document.getElementById('overlay-widget-' + widget.instanceId)
          if (overlayEl) {
            overlayEl.style.left = `${widget.position.x}px`
            overlayEl.style.top = `${widget.position.y}px`
            overlayEl.style.width = `${widget.size.width}px`
            overlayEl.style.height = `${widget.size.height}px`
            const sizeBadge = overlayEl.querySelector<HTMLElement>('.widget-size-badge')
            if (sizeBadge) {
              sizeBadge.textContent = `(${widget.size.width}x${widget.size.height})`
            }
          }
        }
      }

      if (svgContainerRef.current) {
        svgContainerRef.current.classList.remove('canvas-is-dragging')
        svgContainerRef.current.querySelectorAll('svg').forEach((svg) => {
          if (typeof svg.unpauseAnimations === 'function') {
            try {
              svg.unpauseAnimations()
            } catch (err) {
              console.debug('SVG unpauseAnimations not supported in current environment', err)
            }
          }
        })
      }

      activeDragRef.current = null
      dragPreviewRef.current = null
      setAlignmentGuides([])
      setSpacingGuides([])
    }

    const handleGlobalMouseMove = (event: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY

      dragPosRef.current = { x: clientX, y: clientY }
      if (activeDragRef.current || marqueeRef.current) startAutoScroll()

      if (marqueeRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        marqueeRef.current = {
          ...marqueeRef.current,
          currentX: (clientX - rect.left) / zoomRef.current,
          currentY: (clientY - rect.top) / zoomRef.current,
        }
        if (marqueeRafRef.current === null) {
          marqueeRafRef.current = requestAnimationFrame(() => {
            marqueeRafRef.current = null
            setMarquee(marqueeRef.current)
          })
        }
      }
      if (activeDragRef.current) buildDragPreview(event)
    }

    const handleGlobalMouseUp = (event: MouseEvent | TouchEvent) => {
      stopAutoScroll()

      const currentMarquee = marqueeRef.current
      const currentConfig = configRef.current
      if (currentMarquee && currentConfig) {
        const minX = Math.min(currentMarquee.startX, currentMarquee.currentX)
        const maxX = Math.max(currentMarquee.startX, currentMarquee.currentX)
        const minY = Math.min(currentMarquee.startY, currentMarquee.currentY)
        const maxY = Math.max(currentMarquee.startY, currentMarquee.currentY)
        const selectedIds = currentConfig.widgets
          .filter(
            (widget) =>
              widget.visible &&
              widget.position.x + widget.size.width >= minX &&
              widget.position.x <= maxX &&
              widget.position.y + widget.size.height >= minY &&
              widget.position.y <= maxY
          )
          .map((widget) => widget.instanceId)

        if (selectedIds.length > 0) {
          const store = useEditorStore.getState()
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            const nextSelection = new Set(store.selectedInstanceIds)
            selectedIds.forEach((instanceId) => {
              if (nextSelection.has(instanceId)) nextSelection.delete(instanceId)
              else nextSelection.add(instanceId)
            })
            store.setSelection(Array.from(nextSelection))
          } else {
            store.setSelection(selectedIds)
          }
        }
      }

      marqueeRef.current = null
      setMarquee(null)
      finishDrag()
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchmove', handleGlobalMouseMove, { passive: false })
    window.addEventListener('touchend', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchmove', handleGlobalMouseMove)
      window.removeEventListener('touchend', handleGlobalMouseUp)
      stopAutoScroll()
      if (dragRafRef.current !== null) cancelAnimationFrame(dragRafRef.current)
      if (marqueeRafRef.current !== null) cancelAnimationFrame(marqueeRafRef.current)
    }
  }, [githubData, scheduleDragPreview])

  if (!config || !githubData) {
    return (
      <div className="flex-1 h-full bg-carbon flex items-center justify-center text-ash">
        Carregando canvas...
      </div>
    )
  }

  let canvasHeight = 400
  config.widgets.forEach((w) => {
    if (w.visible) {
      const bottom = w.position.y + w.size.height + 40
      if (bottom > canvasHeight) canvasHeight = bottom
    }
  })

  return (
    <main
      id="svg-canvas-viewport"
      data-canvas-container="true"
      className="flex-1 h-full bg-carbon overflow-auto p-4 sm:p-8 flex flex-col items-center justify-start relative select-none touch-none"
      onMouseDown={(e) => {
        const target = e.target as HTMLElement
        if (
          target === e.currentTarget ||
          target === containerRef.current ||
          target.classList.contains('pointer-events-none') ||
          target.classList.contains('pointer-events-auto')
        ) {
          const rect = containerRef.current?.getBoundingClientRect()
          const nextMarquee = {
            startX: rect ? (e.clientX - rect.left) / zoom : e.clientX,
            startY: rect ? (e.clientY - rect.top) / zoom : e.clientY,
            currentX: rect ? (e.clientX - rect.left) / zoom : e.clientX,
            currentY: rect ? (e.clientY - rect.top) / zoom : e.clientY,
          }
          marqueeRef.current = nextMarquee
          setMarquee(nextMarquee)
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            selectWidget(null)
          }
        }
      }}
      onTouchStart={(e) => {
        const target = e.target as HTMLElement
        if (
          target === e.currentTarget ||
          target === containerRef.current ||
          target.classList.contains('pointer-events-none') ||
          target.classList.contains('pointer-events-auto')
        ) {
          const touch = e.touches[0]
          const rect = containerRef.current?.getBoundingClientRect()
          const nextMarquee = {
            startX: rect ? (touch.clientX - rect.left) / zoom : touch.clientX,
            startY: rect ? (touch.clientY - rect.top) / zoom : touch.clientY,
            currentX: rect ? (touch.clientX - rect.left) / zoom : touch.clientX,
            currentY: rect ? (touch.clientY - rect.top) / zoom : touch.clientY,
          }
          marqueeRef.current = nextMarquee
          setMarquee(nextMarquee)
          selectWidget(null)
        }
      }}
    >
      <div
        ref={containerRef}
        data-zoom={zoom}
        data-canvas-width={800}
        data-canvas-height={canvasHeight}
        className={`relative transition-transform origin-top duration-150 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-graphite rounded-none overflow-hidden shrink-0 mb-16 ${
          config.globalStyles.transparentBackground ? '' : 'bg-void-black'
        }`}
        style={{
          transform: `scale(${zoom})`,
          width: 800,
          height: canvasHeight,
          ...(config.globalStyles.transparentBackground
            ? {
                backgroundImage:
                  'repeating-linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a), repeating-linear-gradient(45deg, #1a1a1a 25%, #0f0f0f 25%, #0f0f0f 75%, #1a1a1a 75%, #1a1a1a)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px',
              }
            : {}),
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: editorAnimOverrideStyle }} />
        <div
          ref={svgContainerRef}
          data-testid="canvas-svg-container"
          tabIndex={-1}
          className={`w-full h-full pointer-events-none ${config.widgets
            .map((w) => {
              const safeId = (w.instanceId || '').replace(/[^a-zA-Z0-9_-]/g, '')
              return playingPreviews[w.instanceId] ? `play-anim-${safeId}` : `static-anim-${safeId}`
            })
            .join(' ')}`}
        >
          {config && githubData && (
            <svg
              width="800"
              height={canvasHeight}
              viewBox={`0 0 800 ${canvasHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <style>
                {`
                  @import url('${EXTERNAL_LINKS.GOOGLE_FONTS_CSS}');
                  * { box-sizing: border-box; }

                  text { user-select: none; }
                  .canvas-is-dragging * {
                    animation: none !important;
                    transition: none !important;
                  }

                  .gitascii-canvas-bg {
                    fill: #0d1117;
                    transition: fill 0.3s ease;
                  }

                  @media (prefers-color-scheme: light) {
                    .gitascii-canvas-bg {
                      fill: #ffffff !important;
                    }
                  }

                  @media (prefers-color-scheme: dark) {
                    .gitascii-canvas-bg {
                      fill: #0d1117 !important;
                    }
                  }
                `}
              </style>
              {!config.globalStyles.transparentBackground && (
                <rect
                  className={
                    isGitHubAdaptiveTheme(config.globalStyles.backgroundColor) ||
                    config.globalStyles.themeMode === 'auto'
                      ? 'gitascii-canvas-bg'
                      : undefined
                  }
                  width="800"
                  height={canvasHeight}
                  fill={
                    isGitHubAdaptiveTheme(config.globalStyles.backgroundColor)
                      ? GITHUB_THEME_KEYS.DARK
                      : config.globalStyles.backgroundColor || '#060606'
                  }
                  rx={config.globalStyles.borderRadius || 0}
                />
              )}
              {(() => {
                const sortedWidgets = [...config.widgets].sort((a, b) => a.zIndex - b.zIndex)
                return sortedWidgets.map((widget) => (
                  <WidgetNode
                    key={widget.instanceId}
                    widget={widget}
                    githubData={githubData}
                    globalStyles={config.globalStyles}
                    isSelected={selectedInstanceIds.includes(widget.instanceId)}
                    isStatic={false}
                  />
                ))
              })()}
            </svg>
          )}
        </div>

        <CanvasAlignmentGuides guides={alignmentGuides} spacingGuides={spacingGuides} />

        {showGrid && gridMode !== 'off' && (
          <div
            data-testid="canvas-grid-overlay"
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
            style={{
              backgroundImage:
                gridMode === 'basic'
                  ? `
                    linear-gradient(to right, rgba(197, 255, 74, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(197, 255, 74, 0.15) 1px, transparent 1px)
                  `
                  : gridMode === 'dense'
                    ? `
                    linear-gradient(to right, rgba(197, 255, 74, 0.07) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(197, 255, 74, 0.07) 1px, transparent 1px),
                    linear-gradient(to right, rgba(197, 255, 74, 0.18) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(197, 255, 74, 0.18) 1px, transparent 1px)
                  `
                    : undefined,
              backgroundSize:
                gridMode === 'basic'
                  ? '100px 100px, 100px 100px'
                  : gridMode === 'dense'
                    ? '20px 20px, 20px 20px, 100px 100px, 100px 100px'
                    : undefined,
            }}
          >
            {(gridMode === 'axes' || gridMode === 'basic') && (
              <>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-signal-lime/40 border-r border-dashed border-signal-lime/60 shadow-[0_0_8px_rgba(197,255,74,0.3)]" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-signal-lime/40 border-b border-dashed border-signal-lime/60 shadow-[0_0_8px_rgba(197,255,74,0.3)]" />
              </>
            )}

            {gridMode === 'thirds' && (
              <>
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-cyan-400/40 border-r border-dashed border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-cyan-400/40 border-r border-dashed border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                <div className="absolute left-0 right-0 top-1/3 h-px bg-cyan-400/40 border-b border-dashed border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                <div className="absolute left-0 right-0 top-2/3 h-px bg-cyan-400/40 border-b border-dashed border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
              </>
            )}
          </div>
        )}

        <div className="absolute inset-0 pointer-events-auto">
          <CanvasMarquee marquee={marquee && containerRef.current ? marquee : null} />
          {config.widgets.map((widget) => {
            if (!widget.visible) return null

            const isSelected =
              (selectedInstanceIds && selectedInstanceIds.includes(widget.instanceId)) ||
              widget.instanceId === selectedInstanceId
            const displayName =
              widget.name || `${widget.widgetId.charAt(0).toUpperCase() + widget.widgetId.slice(1)}`

            return (
              <div
                key={widget.instanceId}
                id={`overlay-widget-${widget.instanceId}`}
                data-testid={`canvas-widget-${widget.widgetId}`}
                data-selected={isSelected}
                data-x={widget.position.x}
                data-y={widget.position.y}
                data-width={widget.size.width}
                data-height={widget.size.height}
                onClick={(e) => {
                  e.stopPropagation()
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false
                    return
                  }
                  selectWidget(widget.instanceId, e.ctrlKey || e.metaKey, e.shiftKey)
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation()

                  if (widget.widgetId === 'ascii-text') {
                    setEditingText({
                      instanceId: widget.instanceId,
                      field: 'customText',
                      initialValue: (widget.config.customText as string) || 'GitAscii',
                    })
                  } else if (widget.widgetId === 'bio') {
                    setEditingText({
                      instanceId: widget.instanceId,
                      field: 'customBio',
                      initialValue:
                        (widget.config.customBio as string) ||
                        githubData.user.bio ||
                        'No bio provided.',
                    })
                  } else {
                    useEditorStore.getState().setActiveMobilePanel('properties')
                  }
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  if (!selectedInstanceIdsRef.current.includes(widget.instanceId)) {
                    selectWidget(widget.instanceId, e.ctrlKey || e.metaKey, e.shiftKey)
                  }
                  if (!widget.locked) {
                    const currentSelection = useEditorStore.getState().selectedInstanceIds
                    const draggableIds = currentSelection.includes(widget.instanceId)
                      ? currentSelection
                      : [widget.instanceId]
                    const initialPositions = Object.fromEntries(
                      draggableIds
                        .map((instanceId) => {
                          const selectedWidget = config.widgets.find(
                            (item) => item.instanceId === instanceId
                          )
                          return selectedWidget
                            ? [instanceId, { ...selectedWidget.position }]
                            : null
                        })
                        .filter((entry): entry is [string, Position] => Boolean(entry))
                    )
                    suppressClickRef.current = true
                    startDrag({
                      instanceId: widget.instanceId,
                      type: 'move',
                      startX: e.clientX,
                      startY: e.clientY,
                      initialPos: { ...widget.position },
                      initialSize: { ...widget.size },
                      initialPositions,
                      selectedInstanceIds: Object.keys(initialPositions),
                    })
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  if (!selectedInstanceIdsRef.current.includes(widget.instanceId)) {
                    selectWidget(widget.instanceId, false, false)
                  }
                  if (!widget.locked) {
                    const touch = e.touches[0]
                    const currentSelection = useEditorStore.getState().selectedInstanceIds
                    const draggableIds = currentSelection.includes(widget.instanceId)
                      ? currentSelection
                      : [widget.instanceId]
                    const initialPositions = Object.fromEntries(
                      draggableIds
                        .map((instanceId) => {
                          const selectedWidget = config.widgets.find(
                            (item) => item.instanceId === instanceId
                          )
                          return selectedWidget
                            ? [instanceId, { ...selectedWidget.position }]
                            : null
                        })
                        .filter((entry): entry is [string, Position] => Boolean(entry))
                    )
                    suppressClickRef.current = true
                    startDrag({
                      instanceId: widget.instanceId,
                      type: 'move',
                      startX: touch.clientX,
                      startY: touch.clientY,
                      initialPos: { ...widget.position },
                      initialSize: { ...widget.size },
                      initialPositions,
                      selectedInstanceIds: Object.keys(initialPositions),
                    })
                  }
                }}
                onTouchEnd={() => {
                  const now = Date.now()
                  const lastTap = lastTapRef.current
                  if (lastTap.id === widget.instanceId && now - lastTap.time < 300) {
                    useEditorStore.getState().setActiveMobilePanel('properties')
                    lastTapRef.current = { id: '', time: 0 }
                  } else {
                    lastTapRef.current = { id: widget.instanceId, time: now }
                  }
                }}
                style={{
                  position: 'absolute',
                  left: widget.position.x,
                  top: widget.position.y,
                  width: widget.size.width,
                  height: widget.size.height,
                  zIndex: widget.zIndex,
                }}
                className={`group transition-all ${
                  widget.locked
                    ? 'cursor-not-allowed'
                    : isSelected
                      ? 'cursor-grab active:cursor-grabbing ring-2 ring-signal-lime ring-offset-2 ring-offset-carbon'
                      : 'cursor-grab hover:ring-1 hover:ring-ash/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-7 left-0 flex items-center gap-1.5 bg-signal-lime text-black font-inter-tight text-caption uppercase tracking-wider font-semibold px-2 py-0.5 rounded-xs shadow-md z-30">
                    {widget.locked ? <Lock size={10} className="text-black" /> : <Move size={10} />}
                    <span>{displayName}</span>
                    <span className="font-jetbrains-mono opacity-60 widget-size-badge">
                      ({widget.size.width}x{widget.size.height})
                    </span>
                  </div>
                )}

                {isSelected && !widget.locked && (
                  <>
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        suppressClickRef.current = true
                        startDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-r',
                          startX: e.clientX,
                          startY: e.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                          initialPositions: { [widget.instanceId]: { ...widget.position } },
                          selectedInstanceIds: [widget.instanceId],
                        })
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        const touch = e.touches[0]
                        suppressClickRef.current = true
                        startDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-r',
                          startX: touch.clientX,
                          startY: touch.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                          initialPositions: { [widget.instanceId]: { ...widget.position } },
                          selectedInstanceIds: [widget.instanceId],
                        })
                      }}
                      className="absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-signal-lime/60 z-30 flex items-center justify-center"
                      title={t(
                        'editor.canvas.resize_width',
                        'Arraste para ajustar largura (Width)'
                      )}
                    >
                      <div className="w-1 h-6 bg-signal-lime rounded-[1px] shadow-sm" />
                    </div>

                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        suppressClickRef.current = true
                        startDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-b',
                          startX: e.clientX,
                          startY: e.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                          initialPositions: { [widget.instanceId]: { ...widget.position } },
                          selectedInstanceIds: [widget.instanceId],
                        })
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        const touch = e.touches[0]
                        suppressClickRef.current = true
                        startDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-b',
                          startX: touch.clientX,
                          startY: touch.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                          initialPositions: { [widget.instanceId]: { ...widget.position } },
                          selectedInstanceIds: [widget.instanceId],
                        })
                      }}
                      className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-signal-lime/60 z-30 flex items-center justify-center"
                      title={t(
                        'editor.canvas.resize_height',
                        'Arraste para ajustar altura (Height)'
                      )}
                    >
                      <div className="h-1 w-6 bg-signal-lime rounded-[1px] shadow-sm" />
                    </div>

                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        suppressClickRef.current = true
                        startDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-br',
                          startX: e.clientX,
                          startY: e.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                          initialPositions: { [widget.instanceId]: { ...widget.position } },
                          selectedInstanceIds: [widget.instanceId],
                        })
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        const touch = e.touches[0]
                        suppressClickRef.current = true
                        startDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-br',
                          startX: touch.clientX,
                          startY: touch.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                          initialPositions: { [widget.instanceId]: { ...widget.position } },
                          selectedInstanceIds: [widget.instanceId],
                        })
                      }}
                      className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-signal-lime border-2 border-black rounded-xs cursor-nwse-resize hover:scale-125 transition-transform z-40 shadow-sm"
                      title={t('editor.canvas.resize_drag', 'Arraste para redimensionar ambos')}
                    />
                  </>
                )}

                {editingText?.instanceId === widget.instanceId && (
                  <div
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-carbon/95 p-4 rounded-sm shadow-2xl"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      autoFocus
                      defaultValue={editingText.initialValue}
                      className="w-full h-full bg-transparent text-white font-jetbrains-mono outline-none resize-none p-2 border border-graphite rounded focus:border-signal-lime/50"
                      style={{ fontSize: '14px' }}
                      onBlur={(e) => {
                        const val = e.target.value
                        useEditorStore
                          .getState()
                          .updateWidgetConfig(widget.instanceId, { [editingText.field]: val })
                        setEditingText(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation()
                          setEditingText(null)
                        } else if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          e.stopPropagation()
                          e.currentTarget.blur()
                        }
                      }}
                    />
                    <div className="text-center text-xs text-ash font-inter-tight mt-2">
                      {t(
                        'editor.canvas.edit_hint',
                        'Enter para salvar, Shift+Enter para nova linha, Esc para cancelar'
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div
        className="fixed bottom-20 right-4 lg:bottom-14 lg:left-81 lg:right-auto z-40 flex flex-col items-end lg:items-start select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {isLayersOpen && (
          <div className="mb-3 w-[320px] max-h-130 bg-onyx/95 backdrop-blur-xl border border-graphite rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-void-black border-b border-graphite">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-signal-lime" />
                <span className="font-inter-tight text-eyebrow font-semibold text-chalk uppercase tracking-[0.12em]">
                  {t('editor.canvas.layers', 'Camadas')}
                </span>
                <span className="text-caption font-jetbrains-mono bg-graphite text-ash px-1.5 py-0.5 rounded-xs">
                  {config.widgets.length}
                </span>
              </div>
              <button
                onClick={() => setIsLayersOpen(false)}
                className="text-ash hover:text-chalk p-1 rounded hover:bg-graphite transition-colors cursor-pointer"
                title={t('editor.canvas.close_layers', 'Fechar painel de camadas')}
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3.5 overflow-y-auto flex-1 max-h-110">
              <LayersPanel />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsLayersOpen((prev) => !prev)
          }}
          className={`group relative flex items-center justify-center w-12 h-12 rounded-full border shadow-2xl transition-all cursor-pointer ${
            isLayersOpen
              ? 'bg-signal-lime text-black border-signal-lime shadow-[0_0_20px_rgba(204,255,0,0.4)] scale-105'
              : 'bg-onyx/90 text-ash border-graphite hover:border-signal-lime hover:text-signal-lime hover:scale-105 backdrop-blur-md'
          }`}
          title={
            isLayersOpen
              ? t('editor.canvas.close_layers', 'Fechar camadas')
              : t('editor.canvas.view_reorder_layers', 'Camadas (Ver e reordenar)')
          }
        >
          <Layers size={20} className="transition-transform group-hover:scale-110" />

          {!isLayersOpen && config.widgets.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-signal-lime text-[9px] font-bold font-jetbrains-mono text-black shadow-md">
              {config.widgets.length}
            </span>
          )}
        </button>
      </div>
    </main>
  )
}
