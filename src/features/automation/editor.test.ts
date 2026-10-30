import { describe, expect, it } from 'vitest'

import { createConfiguration, TEMPLATE_PRESETS } from '@/engine/core/TemplateRenderer'
import { createEditorStore } from '@/features/editor/store/editorStore'
import { getMockGitHubData } from '@/features/github/api/mockProfile'

import { applyEditorOperations, operationSchema, validateLayout } from './editor'

const data = getMockGitHubData('alice')
const base = () => createConfiguration(data.user.id, 'alice', 'blank')

describe('shared browser and automation editor', () => {
  it('uses identical alignment and style operations, without mutating the input or another store', () => {
    const browser = createEditorStore(() => {})
    browser.getState().initEditor(base(), data)
    browser.getState().addWidget('header')
    browser.getState().addWidget('bio', { x: 20, y: 180 })
    const original = structuredClone(browser.getState().config!)
    const ids = original.widgets.map((w) => w.instanceId)
    const result = applyEditorOperations(original, data, [
      { type: 'align', instanceIds: ids, alignment: 'left' },
      {
        type: 'configure',
        instanceIds: ids,
        patch: { textColor: '#ffcc00', animationType: 'fade-in' },
      },
    ])
    browser.getState().alignWidgets(ids, 'left')
    browser.getState().updateWidgetsConfig(ids, { textColor: '#ffcc00', animationType: 'fade-in' })
    expect(result.widgets).toEqual(browser.getState().config!.widgets)
    expect(original.widgets[1].config.textColor).not.toBe('#ffcc00')
    expect(createEditorStore(() => {}).getState().config).toBeNull()
  })

  it('validates all editor template layouts', () => {
    const invalid = Object.keys(TEMPLATE_PRESETS).flatMap((id) => {
      const config = createConfiguration(data.user.id, 'alice', id)
      try {
        validateLayout({
          widgets: config.widgets,
          globalStyles: config.globalStyles,
          templateId: config.templateId,
        })
        return []
      } catch (error) {
        return [`${id}: ${String(error)}`]
      }
    })
    expect(invalid).toEqual([])
  })

  it('fails atomic batches without changing the original configuration', () => {
    const config = base()
    expect(() =>
      applyEditorOperations(config, data, [
        { type: 'add', widgetId: 'header' },
        { type: 'remove', instanceIds: ['missing'] },
      ])
    ).toThrow('Widget not found')
    expect(config.widgets).toHaveLength(0)
  })

  it('rejects prototype keys, unknown widgets, duplicate IDs and unsafe URI schemes', () => {
    expect(() =>
      applyEditorOperations(base(), data, [{ type: 'add', widgetId: 'unknown' }])
    ).toThrow()
    const config = applyEditorOperations(base(), data, [{ type: 'add', widgetId: 'header' }])
    const instanceId = config.widgets[0].instanceId
    for (const patch of [
      JSON.parse('{"__proto__":{"polluted":true}}'),
      { avatarUrl: 'javascript:alert(1)' },
    ]) {
      expect(() =>
        applyEditorOperations(config, data, [
          { type: 'configure', instanceIds: [instanceId], patch },
        ])
      ).toThrow()
    }
    expect(() =>
      validateLayout({
        widgets: [config.widgets[0], config.widgets[0]],
        globalStyles: config.globalStyles,
        templateId: config.templateId,
      })
    ).toThrow('unique')
    expect(
      operationSchema.safeParse({
        type: 'resize',
        instanceIds: [instanceId],
        size: { width: Infinity },
      }).success
    ).toBe(false)
  })

  it('requires explicit unlocking before editing a locked widget', () => {
    let config = applyEditorOperations(base(), data, [{ type: 'add', widgetId: 'header' }])
    const instanceId = config.widgets[0].instanceId
    config = applyEditorOperations(config, data, [
      { type: 'lock', instanceIds: [instanceId], locked: true },
    ])
    expect(() =>
      applyEditorOperations(config, data, [{ type: 'rename', instanceId, name: 'Renamed' }])
    ).toThrow('Unlock')
    expect(
      applyEditorOperations(config, data, [
        { type: 'lock', instanceIds: [instanceId], locked: false },
        { type: 'rename', instanceId, name: 'Renamed' },
      ]).widgets[0].name
    ).toBe('Renamed')
  })
})
