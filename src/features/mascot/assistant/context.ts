import { WIDGET_IDS } from '@/constants/widgetIds'
import type { EditorStore } from '@/features/editor/store/editorStore'

import { ASSISTANT_CONFIG, ASSISTANT_TIP, PRO_ASSISTANT_ROUTES } from '../constants/assistant'
import type { TipId } from './types'

export function editorSuggestion(state: EditorStore, preview = false): TipId {
  if (preview) return ASSISTANT_TIP.PREVIEWING
  if (!state.config?.widgets.length) return ASSISTANT_TIP.EMPTY
  if (state.selectedInstanceIds.length > 1) return ASSISTANT_TIP.MULTI
  const selected = state.config.widgets.find(
    (widget) => widget.instanceId === state.selectedInstanceId
  )
  if (selected?.locked) return ASSISTANT_TIP.LOCKED
  if (selected?.widgetId === WIDGET_IDS.BIO) return ASSISTANT_TIP.BIO
  if (selected?.widgetId === WIDGET_IDS.REPOSITORIES) return ASSISTANT_TIP.REPOSITORIES
  if (selected?.widgetId === WIDGET_IDS.TECH_STACK) return ASSISTANT_TIP.TECH
  if (selected?.widgetId === WIDGET_IDS.SOCIAL_MEDIA) return ASSISTANT_TIP.SOCIAL
  if (
    selected?.widgetId === WIDGET_IDS.ASCII_ART ||
    selected?.widgetId === WIDGET_IDS.ASCII_PORTRAIT
  )
    return ASSISTANT_TIP.ASCII
  if (selected) return ASSISTANT_TIP.SELECTED
  if (state.config.widgets.length >= ASSISTANT_CONFIG.crowdedWidgetCount)
    return ASSISTANT_TIP.CROWDED
  if (state.isDirty) return ASSISTANT_TIP.PREVIEW
  return ASSISTANT_TIP.STYLES
}

export function editorTransition(next: EditorStore, previous: EditorStore): TipId | null {
  if (!next.config || !previous.config) return null
  if (next.config.templateId !== previous.config.templateId) return ASSISTANT_TIP.TEMPLATE_APPLIED
  if (next.config.widgets.length > previous.config.widgets.length) return ASSISTANT_TIP.ADDED
  if (next.config.widgets.length < previous.config.widgets.length)
    return next.config.widgets.length ? ASSISTANT_TIP.REMOVED : ASSISTANT_TIP.EMPTY
  if (next.selectedInstanceIds !== previous.selectedInstanceIds && next.selectedInstanceIds.length)
    return editorSuggestion(next)
  if (next.config.globalStyles !== previous.config.globalStyles) return ASSISTANT_TIP.STYLES
  return null
}

export class TipPolicy {
  private seen = new Set<string>()
  private lastAt = -Infinity
  private count = 0
  constructor(ids: string[] = []) {
    this.seen = new Set(ids)
    this.count = ids.length
  }
  accepts(id: string, now: number): boolean {
    return (
      !this.seen.has(id) &&
      this.count < ASSISTANT_CONFIG.sessionTipLimit &&
      now - this.lastAt >= ASSISTANT_CONFIG.cooldownMs
    )
  }
  record(id: string, now: number): string[] {
    this.seen.add(id)
    this.lastAt = now
    this.count += 1
    return [...this.seen]
  }
}

export function proSuggestion(pathname: string | null): TipId {
  const matches = (route: string) => pathname === route || pathname?.startsWith(route + '/')
  if (matches(PRO_ASSISTANT_ROUTES.analytics) || matches(PRO_ASSISTANT_ROUTES.reports))
    return ASSISTANT_TIP.ANALYTICS
  if (matches(PRO_ASSISTANT_ROUTES.profiles)) return ASSISTANT_TIP.PROFILES
  if (matches(PRO_ASSISTANT_ROUTES.health) || matches(PRO_ASSISTANT_ROUTES.errors))
    return ASSISTANT_TIP.HEALTH
  return ASSISTANT_TIP.MEMBER
}
