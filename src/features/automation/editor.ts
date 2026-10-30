import { z } from 'zod'

import { TEMPLATE_PRESETS } from '@/engine/core/TemplateRenderer'
import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'
import { WIDGET_CATALOG } from '@/features/editor/config/widgets'
import { createEditorStore } from '@/features/editor/store/editorStore'

import { AutomationError } from './errors'

export const slugSchema = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,49}$/)
const id = z.string().min(1).max(150)
const ids = z.array(id).min(1).max(250)
const position = z
  .object({ x: z.number().finite().min(0).max(10000), y: z.number().finite().min(0).max(100000) })
  .strict()
const size = z
  .object({ width: z.number().positive().max(10000), height: z.number().positive().max(10000) })
  .strict()
const record = z.record(z.string(), z.json())
const styles = z
  .object({
    backgroundColor: z.string().max(150),
    textColor: z.string().max(150),
    accentColor: z.string().max(150),
    borderColor: z.string().max(150),
    fontFamily: z.string().max(200),
    borderRadius: z.number().min(0).max(1000),
    padding: z.number().min(0).max(1000),
    themeMode: z.enum(['dark', 'light', 'auto']),
    transparentBackground: z.boolean().optional(),
    templateStyle: z.string().max(150).optional(),
  })
  .strict()
const widget = z
  .object({
    instanceId: id,
    widgetId: id,
    name: z.string().max(200).optional(),
    position,
    size,
    config: record,
    locked: z.boolean(),
    visible: z.boolean(),
    zIndex: z.number().int().min(0).max(100000),
  })
  .strict()
export const layoutSchema = z
  .object({ widgets: z.array(widget).max(250), globalStyles: styles, templateId: id })
  .strict()

export const operationSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('add'), widgetId: id, position: position.optional() }).strict(),
  z.object({ type: z.literal('configure'), instanceIds: ids, patch: record }).strict(),
  z
    .object({
      type: z.literal('move'),
      positions: z
        .array(z.object({ instanceId: id, position }).strict())
        .min(1)
        .max(250),
    })
    .strict(),
  z.object({ type: z.literal('resize'), instanceIds: ids, size: size.partial() }).strict(),
  z
    .object({ type: z.literal('scale'), instanceIds: ids, factor: z.number().positive().max(10) })
    .strict(),
  z
    .object({
      type: z.literal('align'),
      instanceIds: ids,
      alignment: z.enum(['left', 'center', 'right', 'top', 'middle', 'bottom']),
    })
    .strict(),
  z
    .object({
      type: z.literal('distribute'),
      instanceIds: ids,
      direction: z.enum(['horizontal', 'vertical']),
    })
    .strict(),
  z
    .object({ type: z.literal('rename'), instanceId: id, name: z.string().min(1).max(200) })
    .strict(),
  z.object({ type: z.literal('duplicate'), instanceId: id }).strict(),
  z.object({ type: z.literal('remove'), instanceIds: ids }).strict(),
  z.object({ type: z.literal('visibility'), instanceIds: ids, visible: z.boolean() }).strict(),
  z.object({ type: z.literal('lock'), instanceIds: ids, locked: z.boolean() }).strict(),
  z
    .object({
      type: z.literal('layer'),
      instanceId: id,
      direction: z.enum(['up', 'down', 'top', 'bottom']),
    })
    .strict(),
  z
    .object({
      type: z.literal('reorder'),
      fromIndex: z.number().int().min(0),
      toIndex: z.number().int().min(0),
    })
    .strict(),
  z.object({ type: z.literal('style'), patch: styles.partial() }).strict(),
  z.object({ type: z.literal('template'), templateId: id }).strict(),
  z.object({ type: z.literal('import'), layout: layoutSchema }).strict(),
])
export type EditorOperation = z.infer<typeof operationSchema>

function validateJson(value: unknown, depth = 0): void {
  if (depth > 12)
    throw new AutomationError('INVALID_CONFIGURATION', 'Configuration is too deeply nested.')
  if (
    typeof value === 'string' &&
    (value.length > 50000 ||
      /(?:javascript|vbscript)\s*:|data\s*:\s*(?:text\/html|image\/svg)/i.test(value))
  ) {
    throw new AutomationError('INVALID_CONFIGURATION', 'Unsupported configuration value.')
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key))
        throw new AutomationError('INVALID_CONFIGURATION', 'Unsupported configuration key.')
      validateJson(child, depth + 1)
    }
  }
}

export function validateLayout(input: unknown) {
  const layout = layoutSchema.parse(input)
  if (JSON.stringify(layout).length > 250000)
    throw new AutomationError('INVALID_CONFIGURATION', 'Layout is too large.')
  validateJson(layout)
  const known = new Set(WIDGET_CATALOG.map((w) => w.id as string))
  const seen = new Set<string>()
  for (const w of layout.widgets) {
    if (!known.has(w.widgetId))
      throw new AutomationError('UNKNOWN_WIDGET', `Unknown widget: ${w.widgetId}`)
    if (seen.has(w.instanceId))
      throw new AutomationError('DUPLICATE_WIDGET_ID', 'Widget instance IDs must be unique.')
    seen.add(w.instanceId)
  }
  return layout
}

export function applyEditorOperations(
  config: SavedConfiguration,
  data: NormalizedGitHubData,
  operations: EditorOperation[]
) {
  const store = createEditorStore(() => {})
  store.getState().initEditor(structuredClone(config), data)
  for (const op of operations) {
    validateJson(op)
    const state = store.getState()
    const targets =
      'instanceIds' in op
        ? op.instanceIds
        : 'instanceId' in op
          ? [op.instanceId]
          : op.type === 'move'
            ? op.positions.map((p) => p.instanceId)
            : []
    for (const target of targets) {
      const w = state.config!.widgets.find((w) => w.instanceId === target)
      if (!w) throw new AutomationError('WIDGET_NOT_FOUND', `Widget not found: ${target}`)
      if (w.locked && !['lock', 'visibility'].includes(op.type))
        throw new AutomationError('WIDGET_LOCKED', 'Unlock the widget before changing it.')
    }
    switch (op.type) {
      case 'add':
        if (!WIDGET_CATALOG.some((w) => w.id === op.widgetId))
          throw new AutomationError('UNKNOWN_WIDGET', 'Select a widget from the catalog.')
        state.addWidget(op.widgetId, op.position)
        break
      case 'configure':
        state.updateWidgetsConfig(op.instanceIds, op.patch)
        break
      case 'move':
        state.updateWidgetPositions(op.positions)
        break
      case 'resize':
        state.updateWidgetsSize(op.instanceIds, op.size)
        break
      case 'scale':
        state.scaleWidgets(op.instanceIds, op.factor)
        break
      case 'align':
        state.alignWidgets(op.instanceIds, op.alignment)
        break
      case 'distribute':
        state.distributeWidgets(op.instanceIds, op.direction)
        break
      case 'rename':
        state.renameWidget(op.instanceId, op.name)
        break
      case 'duplicate':
        state.duplicateWidget(op.instanceId)
        break
      case 'remove':
        state.removeWidgets(op.instanceIds)
        break
      case 'visibility':
        for (const target of op.instanceIds) {
          if (state.config!.widgets.find((w) => w.instanceId === target)!.visible !== op.visible)
            store.getState().toggleWidgetVisibility(target)
        }
        break
      case 'lock':
        for (const target of op.instanceIds) {
          if (state.config!.widgets.find((w) => w.instanceId === target)!.locked !== op.locked)
            store.getState().toggleWidgetLock(target)
        }
        break
      case 'layer':
        state.moveWidgetLayer(op.instanceId, op.direction)
        break
      case 'reorder':
        if (Math.max(op.fromIndex, op.toIndex) >= state.config!.widgets.length)
          throw new AutomationError('INVALID_INDEX', 'Layer index is out of range.')
        state.reorderWidgets(op.fromIndex, op.toIndex)
        break
      case 'style':
        state.updateGlobalStyles(op.patch)
        break
      case 'template':
        if (!Object.hasOwn(TEMPLATE_PRESETS, op.templateId))
          throw new AutomationError('UNKNOWN_TEMPLATE', 'Select a template from the catalog.')
        state.applyTemplate(op.templateId)
        break
      case 'import': {
        const layout = validateLayout(op.layout)
        state.importLayout(layout.widgets, layout.globalStyles, layout.templateId)
        break
      }
    }
  }
  const result = store.getState().config!
  validateLayout({
    widgets: result.widgets,
    globalStyles: result.globalStyles,
    templateId: result.templateId,
  })
  return result
}
