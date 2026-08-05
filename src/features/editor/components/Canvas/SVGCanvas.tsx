'use client'

import { Layers, Lock, Move, X } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { convertImageToAsciiCanvas } from '@/engine/ascii/converter'
import { renderSvg } from '@/engine/core/SVGEngine'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'
import { LayersPanel } from '../Sidebar/LayersPanel'

export function SVGCanvas() {
  const { t } = useI18n()
  const {
    config,
    githubData,
    selectedInstanceId,
    selectedInstanceIds,
    setSelection,
    updateWidgetPositions,
    selectWidget,
    updateWidgetPosition,
    updateWidgetSize,
    updateWidgetConfig,
    recordHistorySnapshot,
    zoom,
  } = useEditorStore()

  const [isLayersOpen, setIsLayersOpen] = useState(false)

  const [activeDrag, setActiveDrag] = useState<{
    instanceId: string
    type: 'move' | 'resize-r' | 'resize-b' | 'resize-br'
    startX: number
    startY: number
    initialPos: { x: number; y: number }
    initialSize: { width: number; height: number }
  } | null>(null)

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
  const isDraggingRef = useRef(false)
  const dragPosRef = useRef({ x: 0, y: 0 })

  const renderedSvgString = useMemo(() => {
    if (!config || !githubData) return ''
    return renderSvg(config, githubData, { theme: 'dark' })
  }, [config, githubData])

  const [alignmentGuides, setAlignmentGuides] = useState<{ x?: number; y?: number }[]>([])

  const [playingPreviews, setPlayingPreviews] = useState<Record<string, boolean>>({})

  // Watch for changes in animationPreviewKey of widgets to trigger temporary play mode
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
        // Enable live preview play for 2.5 seconds
        setPlayingPreviews((prev) => ({ ...prev, [instanceId]: true }))
        setTimeout(() => {
          setPlayingPreviews((prev) => ({ ...prev, [instanceId]: false }))
        }, 2500)
      }
    })

    prevKeysRef.current = widgetPreviewKeys
  }, [widgetPreviewKeys, config])

  // Style block to inject into the canvas editor that forces static state (opacity 1, no anim) for any widget not actively previewing
  const editorAnimOverrideStyle = useMemo(() => {
    if (!config) return ''
    return config.widgets
      .map((w) => {
        const isPlaying = playingPreviews[w.instanceId]
        if (!isPlaying) {
          return `
            .static-anim-${w.instanceId} #widget-${w.instanceId} .anim-target,
            .static-anim-${w.instanceId} #widget-${w.instanceId} .typewriter-target {
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

      let imgSrc = githubData.user.avatar_url || 'https://github.com/github.png'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!activeDrag) return

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY

      const deltaX = Math.round((clientX - activeDrag.startX) / zoom)
      const deltaY = Math.round((clientY - activeDrag.startY) / zoom)

      const targetWidget = config?.widgets.find((w) => w.instanceId === activeDrag.instanceId)
      const isAspectLocked = targetWidget
        ? targetWidget.widgetId === 'avatar' ||
          targetWidget.widgetId === 'ascii-art' ||
          Boolean(
            targetWidget.config.lockAspectRatio !== false &&
            (targetWidget.widgetId === 'avatar' || targetWidget.widgetId === 'ascii-art')
          ) ||
          Boolean(targetWidget.config.lockAspectRatio)
        : false

      if (activeDrag.type === 'move') {
        const rawX = activeDrag.initialPos.x + deltaX
        const rawY = activeDrag.initialPos.y + deltaY

        const SNAP_THRESHOLD = 8
        const width = activeDrag.initialSize.width
        const height = activeDrag.initialSize.height

        let snapX: number | undefined
        let snapY: number | undefined
        const newGuides: { x?: number; y?: number }[] = []

        if (config?.widgets) {
          for (const other of config.widgets) {
            if (other.instanceId === activeDrag.instanceId || !other.visible) continue

            const otherLeft = other.position.x
            const otherRight = other.position.x + other.size.width
            const otherCenterX = other.position.x + other.size.width / 2
            const otherTop = other.position.y
            const otherBottom = other.position.y + other.size.height
            const otherCenterY = other.position.y + other.size.height / 2

            const left = rawX
            const right = rawX + width
            const centerX = rawX + width / 2
            const top = rawY
            const bottom = rawY + height
            const centerY = rawY + height / 2

            if (Math.abs(left - otherLeft) < SNAP_THRESHOLD) {
              snapX = otherLeft
              newGuides.push({ x: otherLeft })
            } else if (Math.abs(left - otherRight) < SNAP_THRESHOLD) {
              snapX = otherRight
              newGuides.push({ x: otherRight })
            } else if (Math.abs(right - otherLeft) < SNAP_THRESHOLD) {
              snapX = otherLeft - width
              newGuides.push({ x: otherLeft })
            } else if (Math.abs(right - otherRight) < SNAP_THRESHOLD) {
              snapX = otherRight - width
              newGuides.push({ x: otherRight })
            } else if (Math.abs(centerX - otherCenterX) < SNAP_THRESHOLD) {
              snapX = otherCenterX - width / 2
              newGuides.push({ x: otherCenterX })
            }

            if (Math.abs(top - otherTop) < SNAP_THRESHOLD) {
              snapY = otherTop
              newGuides.push({ y: otherTop })
            } else if (Math.abs(top - otherBottom) < SNAP_THRESHOLD) {
              snapY = otherBottom
              newGuides.push({ y: otherBottom })
            } else if (Math.abs(bottom - otherTop) < SNAP_THRESHOLD) {
              snapY = otherTop - height
              newGuides.push({ y: otherTop })
            } else if (Math.abs(bottom - otherBottom) < SNAP_THRESHOLD) {
              snapY = otherBottom - height
              newGuides.push({ y: otherBottom })
            } else if (Math.abs(centerY - otherCenterY) < SNAP_THRESHOLD) {
              snapY = otherCenterY - height / 2
              newGuides.push({ y: otherCenterY })
            }
          }
        }

        const snappedX =
          snapX !== undefined ? snapX : Math.max(0, Math.min(800 - width, Math.round(rawX / 4) * 4))
        const snappedY = snapY !== undefined ? snapY : Math.max(0, Math.round(rawY / 4) * 4)

        setAlignmentGuides(newGuides)
        if (
          selectedInstanceIds &&
          selectedInstanceIds.length > 1 &&
          selectedInstanceIds.includes(activeDrag.instanceId)
        ) {
          const dx = snappedX - activeDrag.initialPos.x
          const dy = snappedY - activeDrag.initialPos.y
          const deltas = selectedInstanceIds
            .map((id) => {
              if (id === activeDrag.instanceId)
                return { instanceId: id, position: { x: snappedX, y: snappedY } }
              const w = config?.widgets.find((w) => w.instanceId === id)
              if (!w) return null
              return { instanceId: id, position: { x: w.position.x + dx, y: w.position.y + dy } }
            })
            .filter((d): d is { instanceId: string; position: { x: number; y: number } } =>
              Boolean(d)
            )
          if (updateWidgetPositions) updateWidgetPositions(deltas, false)
        } else {
          updateWidgetPosition(activeDrag.instanceId, { x: snappedX, y: snappedY }, false)
        }
      } else if (activeDrag.type === 'resize-r') {
        const newWidth = Math.max(
          40,
          Math.min(
            800 - activeDrag.initialPos.x,
            Math.round((activeDrag.initialSize.width + deltaX) / 4) * 4
          )
        )
        const newHeight = isAspectLocked ? newWidth : activeDrag.initialSize.height
        updateWidgetSize(activeDrag.instanceId, { width: newWidth, height: newHeight }, false)
      } else if (activeDrag.type === 'resize-b') {
        const newHeight = Math.max(40, Math.round((activeDrag.initialSize.height + deltaY) / 4) * 4)
        const newWidth = isAspectLocked
          ? Math.min(800 - activeDrag.initialPos.x, newHeight)
          : activeDrag.initialSize.width
        updateWidgetSize(
          activeDrag.instanceId,
          { width: isAspectLocked ? newHeight : newWidth, height: newHeight },
          false
        )
      } else if (activeDrag.type === 'resize-br') {
        let newWidth = Math.max(
          40,
          Math.min(
            800 - activeDrag.initialPos.x,
            Math.round((activeDrag.initialSize.width + deltaX) / 4) * 4
          )
        )
        let newHeight = Math.max(40, Math.round((activeDrag.initialSize.height + deltaY) / 4) * 4)

        if (isAspectLocked) {
          const side = Math.min(newWidth, Math.min(800 - activeDrag.initialPos.x, newHeight))
          newWidth = side
          newHeight = side
        }

        updateWidgetSize(activeDrag.instanceId, { width: newWidth, height: newHeight }, false)
      }
    }

    const handleMouseUp = () => {
      setActiveDrag(null)
      setAlignmentGuides([])
      recordHistorySnapshot()
    }

    const doAutoScroll = () => {
      if (!isDraggingRef.current || !containerRef.current?.parentElement) return

      const parent = containerRef.current.parentElement
      const rect = parent.getBoundingClientRect()
      const mouse = dragPosRef.current

      let scrollX = 0
      let scrollY = 0
      const threshold = 50
      const maxSpeed = 15

      if (mouse.x < rect.left + threshold) {
        scrollX = -((rect.left + threshold - mouse.x) / threshold) * maxSpeed
      } else if (mouse.x > rect.right - threshold) {
        scrollX = ((mouse.x - (rect.right - threshold)) / threshold) * maxSpeed
      }

      if (mouse.y < rect.top + threshold) {
        scrollY = -((rect.top + threshold - mouse.y) / threshold) * maxSpeed
      } else if (mouse.y > rect.bottom - threshold) {
        scrollY = ((mouse.y - (rect.bottom - threshold)) / threshold) * maxSpeed
      }

      if (scrollX !== 0 || scrollY !== 0) {
        parent.scrollBy(scrollX, scrollY)
      }

      scrollRafRef.current = requestAnimationFrame(doAutoScroll)
    }

    const startAutoScroll = () => {
      isDraggingRef.current = true
      if (scrollRafRef.current === null) {
        scrollRafRef.current = requestAnimationFrame(doAutoScroll)
      }
    }

    const stopAutoScroll = () => {
      isDraggingRef.current = false
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current)
        scrollRafRef.current = null
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY

      dragPosRef.current = { x: clientX, y: clientY }
      if (activeDrag || marquee) startAutoScroll()

      if (marquee) {
        setMarquee((prev) => (prev ? { ...prev, currentX: clientX, currentY: clientY } : null))
      }
      if (activeDrag) handleMouseMove(e)
    }

    const handleGlobalMouseUp = (e: MouseEvent | TouchEvent) => {
      stopAutoScroll()

      if (marquee && containerRef.current && config) {
        const rect = containerRef.current.getBoundingClientRect()
        const startX = (marquee.startX - rect.left) / zoom
        const startY = (marquee.startY - rect.top) / zoom
        const endX = (marquee.currentX - rect.left) / zoom
        const endY = (marquee.currentY - rect.top) / zoom

        const minX = Math.min(startX, endX)
        const maxX = Math.max(startX, endX)
        const minY = Math.min(startY, endY)
        const maxY = Math.max(startY, endY)

        const selectedIds: string[] = []
        config.widgets.forEach((w) => {
          if (!w.visible) return
          const wLeft = w.position.x
          const wRight = w.position.x + w.size.width
          const wTop = w.position.y
          const wBottom = w.position.y + w.size.height

          if (wRight >= minX && wLeft <= maxX && wBottom >= minY && wTop <= maxY) {
            selectedIds.push(w.instanceId)
          }
        })

        if (selectedIds.length > 0) {
          if (e.ctrlKey || e.metaKey || e.shiftKey) {
            const newSet = new Set(selectedInstanceIds)
            selectedIds.forEach((id) => {
              if (newSet.has(id)) newSet.delete(id)
              else newSet.add(id)
            })
            if (setSelection) setSelection(Array.from(newSet))
          } else {
            if (setSelection) setSelection(selectedIds)
          }
        }
        setMarquee(null)
      }

      if (activeDrag) handleMouseUp()
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
    }
  }, [
    activeDrag,
    zoom,
    updateWidgetPosition,
    updateWidgetSize,
    recordHistorySnapshot,
    config,
    config?.widgets,
    marquee,
    selectedInstanceIds,
    setSelection,
    updateWidgetPositions,
  ])

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
      className="flex-1 h-full bg-carbon overflow-auto p-8 flex flex-col items-center justify-start relative select-none touch-none"
      onMouseDown={(e) => {
        const target = e.target as HTMLElement
        if (
          target === e.currentTarget ||
          target === containerRef.current ||
          target.classList.contains('pointer-events-none') ||
          target.classList.contains('pointer-events-auto')
        ) {
          setMarquee({
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
          })
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
          setMarquee({
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
          })
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
          dangerouslySetInnerHTML={{ __html: renderedSvgString }}
          data-testid="canvas-svg-container"
          className={`w-full h-full pointer-events-none ${config.widgets
            .map((w) =>
              playingPreviews[w.instanceId]
                ? `play-anim-${w.instanceId}`
                : `static-anim-${w.instanceId}`
            )
            .join(' ')}`}
        />

        {alignmentGuides.map((guide, idx) => {
          if (guide.x !== undefined) {
            return (
              <div
                key={`v-guide-${idx}`}
                className="absolute top-0 bottom-0 w-px bg-signal-lime/80 shadow-[0_0_4px_rgba(197,255,74,0.8)] pointer-events-none z-50"
                style={{ left: guide.x }}
              />
            )
          }
          if (guide.y !== undefined) {
            return (
              <div
                key={`h-guide-${idx}`}
                className="absolute left-0 right-0 h-px bg-signal-lime/80 shadow-[0_0_4px_rgba(197,255,74,0.8)] pointer-events-none z-50"
                style={{ top: guide.y }}
              />
            )
          }
          return null
        })}

        <div className="absolute inset-0 pointer-events-auto">
          {marquee && containerRef.current && (
            <div
              className="absolute bg-signal-lime/20 border border-signal-lime z-50 pointer-events-none"
              style={{
                left:
                  (Math.min(marquee.startX, marquee.currentX) -
                    containerRef.current.getBoundingClientRect().left) /
                  zoom,
                top:
                  (Math.min(marquee.startY, marquee.currentY) -
                    containerRef.current.getBoundingClientRect().top) /
                  zoom,
                width: Math.abs(marquee.currentX - marquee.startX) / zoom,
                height: Math.abs(marquee.currentY - marquee.startY) / zoom,
              }}
            />
          )}
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
                data-testid={`canvas-widget-${widget.widgetId}`}
                data-selected={isSelected}
                data-x={widget.position.x}
                data-y={widget.position.y}
                data-width={widget.size.width}
                data-height={widget.size.height}
                onClick={(e) => {
                  e.stopPropagation()
                  selectWidget(widget.instanceId, e.ctrlKey || e.metaKey, e.shiftKey)
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  useEditorStore.getState().setActiveMobilePanel('properties')
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  if (!selectedInstanceIds.includes(widget.instanceId)) {
                    selectWidget(widget.instanceId, e.ctrlKey || e.metaKey, e.shiftKey)
                  }
                  if (!widget.locked) {
                    setActiveDrag({
                      instanceId: widget.instanceId,
                      type: 'move',
                      startX: e.clientX,
                      startY: e.clientY,
                      initialPos: { ...widget.position },
                      initialSize: { ...widget.size },
                    })
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  if (!selectedInstanceIds.includes(widget.instanceId)) {
                    selectWidget(widget.instanceId, false, false)
                  }
                  if (!widget.locked) {
                    const touch = e.touches[0]
                    setActiveDrag({
                      instanceId: widget.instanceId,
                      type: 'move',
                      startX: touch.clientX,
                      startY: touch.clientY,
                      initialPos: { ...widget.position },
                      initialSize: { ...widget.size },
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
                    <span className="font-jetbrains-mono opacity-60">
                      ({widget.size.width}x{widget.size.height})
                    </span>
                  </div>
                )}

                {isSelected && !widget.locked && (
                  <>
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setActiveDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-r',
                          startX: e.clientX,
                          startY: e.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                        })
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        const touch = e.touches[0]
                        setActiveDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-r',
                          startX: touch.clientX,
                          startY: touch.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                        })
                      }}
                      className="absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-signal-lime/60 z-30 flex items-center justify-center"
                      title="Arraste para ajustar largura (Width)"
                    >
                      <div className="w-1 h-6 bg-signal-lime rounded-[1px] shadow-sm" />
                    </div>

                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setActiveDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-b',
                          startX: e.clientX,
                          startY: e.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                        })
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        const touch = e.touches[0]
                        setActiveDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-b',
                          startX: touch.clientX,
                          startY: touch.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                        })
                      }}
                      className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-signal-lime/60 z-30 flex items-center justify-center"
                      title="Arraste para ajustar altura (Height)"
                    >
                      <div className="h-1 w-6 bg-signal-lime rounded-[1px] shadow-sm" />
                    </div>

                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setActiveDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-br',
                          startX: e.clientX,
                          startY: e.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                        })
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        const touch = e.touches[0]
                        setActiveDrag({
                          instanceId: widget.instanceId,
                          type: 'resize-br',
                          startX: touch.clientX,
                          startY: touch.clientY,
                          initialPos: { ...widget.position },
                          initialSize: { ...widget.size },
                        })
                      }}
                      className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-signal-lime border-2 border-black rounded-xs cursor-nwse-resize hover:scale-125 transition-transform z-40 shadow-sm"
                      title={t('editor.canvas.resize_drag', 'Arraste para redimensionar ambos')}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div
        className="fixed bottom-20 right-4 lg:bottom-6 lg:left-81 lg:right-auto z-40 flex flex-col items-end lg:items-start select-none"
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
