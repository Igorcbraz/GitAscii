'use client'

import { useCallback, useEffect } from 'react'

import { EDITOR_EVENTS } from '@/constants/editorEvents'
import { useEditorStore } from '@/features/editor/store/editorStore'
import { useViewModeStore } from '@/features/editor/store/viewModeStore'
import { useWidgetDragStore } from '@/features/editor/store/widgetDragStore'

import {
  ASSISTANT_ACTION,
  ASSISTANT_SELECTORS,
  ASSISTANT_TIP,
  EDITOR_VIEW,
} from '../constants/assistant'
import { STROBI_SCENE } from '../constants/strobi'
import { editorSuggestion, editorTransition } from './context'
import type { AssistantAction } from './types'
import { useAssistant } from './useAssistant'

export function useEditorAssistant() {
  const assistant = useAssistant(STROBI_SCENE.EDITOR)
  const { offer, blocked, invalidate } = assistant

  useEffect(() => {
    if (!blocked)
      offer(
        useEditorStore.getState().config?.widgets.length
          ? ASSISTANT_TIP.WELCOME
          : ASSISTANT_TIP.EMPTY
      )
  }, [offer, blocked])

  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe((next, previous) => {
      if (useWidgetDragStore.getState().isDragging) return
      const tip = editorTransition(next, previous)
      if (tip) {
        invalidate()
        offer(tip)
      }
    })
    const unsubscribeView = useViewModeStore.subscribe((next, previous) => {
      if (next.viewMode !== previous.viewMode) {
        invalidate()
        offer(
          next.viewMode === EDITOR_VIEW.GITHUB
            ? ASSISTANT_TIP.PREVIEWING
            : editorSuggestion(useEditorStore.getState())
        )
      }
    })
    const copy = () => offer(ASSISTANT_TIP.COPIED)
    const undo = () => offer(ASSISTANT_TIP.UNDO)
    const saved = () => offer(ASSISTANT_TIP.PUBLISHED, true)
    const failed = () => offer(ASSISTANT_TIP.PUBLISH_ERROR, true)
    const context = (event: Event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(ASSISTANT_SELECTORS.editorContext)
          : null
      const area = target?.dataset.strobiContext
      if (area === ASSISTANT_ACTION.TEMPLATES) offer(ASSISTANT_TIP.TEMPLATES)
      if (area === ASSISTANT_ACTION.WIDGETS)
        offer(
          useEditorStore.getState().config?.widgets.length
            ? ASSISTANT_TIP.LIBRARY
            : ASSISTANT_TIP.EMPTY
        )
      if (area === ASSISTANT_ACTION.PROPERTIES) offer(editorSuggestion(useEditorStore.getState()))
      if (area === ASSISTANT_ACTION.EXPORT) offer(ASSISTANT_TIP.EXPORT)
    }
    window.addEventListener(EDITOR_EVENTS.COPY, copy)
    window.addEventListener(EDITOR_EVENTS.UNDO, undo)
    window.addEventListener(EDITOR_EVENTS.SAVED, saved)
    window.addEventListener(EDITOR_EVENTS.PUBLISH_ERROR, failed)
    document.addEventListener('focusin', context)
    document.addEventListener('click', context)
    return () => {
      unsubscribe()
      unsubscribeView()
      window.removeEventListener(EDITOR_EVENTS.COPY, copy)
      window.removeEventListener(EDITOR_EVENTS.UNDO, undo)
      window.removeEventListener(EDITOR_EVENTS.SAVED, saved)
      window.removeEventListener(EDITOR_EVENTS.PUBLISH_ERROR, failed)
      document.removeEventListener('focusin', context)
      document.removeEventListener('click', context)
    }
  }, [offer, invalidate])

  const act = useCallback((action: AssistantAction) => {
    const store = useEditorStore.getState()
    if (action === ASSISTANT_ACTION.PREVIEW) {
      useViewModeStore.getState().setViewMode(EDITOR_VIEW.GITHUB)
      return
    }
    if (action === ASSISTANT_ACTION.EXPORT) {
      window.dispatchEvent(new CustomEvent(EDITOR_EVENTS.EXPORT_GUIDE))
      return
    }
    if (action === ASSISTANT_ACTION.TOUR) {
      window.dispatchEvent(new CustomEvent(EDITOR_EVENTS.START_TOUR))
      return
    }
    if (action === ASSISTANT_ACTION.UNDO) {
      store.undo()
      return
    }
    useViewModeStore.getState().setViewMode(EDITOR_VIEW.GITASCII)
    if (action === ASSISTANT_ACTION.STYLES) store.selectWidget(null)
    const library = action === ASSISTANT_ACTION.TEMPLATES || action === ASSISTANT_ACTION.WIDGETS
    store.setActiveMobilePanel(library ? ASSISTANT_ACTION.WIDGETS : ASSISTANT_ACTION.PROPERTIES)
    requestAnimationFrame(() => {
      const selector = library
        ? `[data-testid="${action}-tab-btn"]`
        : ASSISTANT_SELECTORS.properties
      const target = document.querySelector<HTMLElement>(selector)
      if (library) target?.click()
      const focusable = library
        ? target
        : target?.querySelector<HTMLElement>(ASSISTANT_SELECTORS.propertyControl)
      focusable?.focus({ preventScroll: true })
      target?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    })
  }, [])

  return { assistant, act }
}
