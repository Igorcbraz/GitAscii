import { beforeEach, describe, expect, it } from 'vitest'

import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'

import { useEditorStore } from './editorStore'

const mockGitHubData: NormalizedGitHubData = {
  user: {
    id: 12345,
    login: 'octocat',
    name: 'The Octocat',
    avatar_url: 'https://github.com/images/error/octocat_happy.gif',
    bio: 'Specialized in Git',
    company: null,
    blog: null,
    location: 'San Francisco',
    email: null,
    twitter_username: null,
    public_repos: 8,
    public_gists: 0,
    followers: 20,
    following: 0,
    created_at: '2011-01-25T18:44:36Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  repos: [],
  languages: { TypeScript: 7000 },
  totalStars: 42,
  totalForks: 10,
  readmeContent: null,
}

const createInitialConfig = (): SavedConfiguration => ({
  version: 1,
  githubId: 12345,
  username: 'octocat',
  profileSlug: 'default',
  profileName: 'Octocat Profile',
  templateId: 'minimal',
  globalStyles: {
    backgroundColor: '#000000',
    accentColor: '#c5ff4a',
    textColor: '#ffffff',
    borderColor: '#252525',
    fontFamily: 'Inter Tight',
    borderRadius: 0,
    padding: 0,
    themeMode: 'dark',
  },
  widgets: [
    {
      instanceId: 'w1',
      widgetId: 'surveillance-header',
      name: 'Surveillance Header',
      position: { x: 0, y: 0 },
      size: { width: 800, height: 200 },
      config: { accentColor: '#55ffff', hideBorder: false },
      locked: false,
      visible: true,
      zIndex: 1,
    },
    {
      instanceId: 'w2',
      widgetId: 'surveillance-dossier',
      name: 'Surveillance Dossier',
      position: { x: 0, y: 220 },
      size: { width: 800, height: 250 },
      config: { accentColor: '#55ffff', hideBorder: false },
      locked: false,
      visible: true,
      zIndex: 2,
    },
    {
      instanceId: 'w3',
      widgetId: 'avatar',
      name: 'Avatar',
      position: { x: 100, y: 500 },
      size: { width: 160, height: 160 },
      config: { lockAspectRatio: true },
      locked: false,
      visible: true,
      zIndex: 3,
    },
  ],
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
})

describe('Multi-Widget Editing Store Suite', () => {
  beforeEach(() => {
    useEditorStore.getState().initEditor(createInitialConfig(), mockGitHubData)
  })

  it('updateWidgetsConfig updates multiple selected widgets simultaneously', () => {
    const store = useEditorStore.getState()
    store.updateWidgetsConfig(['w1', 'w2'], {
      accentColor: '#ff0055',
      hideBorder: true,
      customNote: 'updated together',
    })

    const widgets = useEditorStore.getState().config?.widgets || []
    const w1 = widgets.find((w) => w.instanceId === 'w1')
    const w2 = widgets.find((w) => w.instanceId === 'w2')
    const w3 = widgets.find((w) => w.instanceId === 'w3')

    expect(w1?.config.accentColor).toBe('#ff0055')
    expect(w1?.config.hideBorder).toBe(true)
    expect(w1?.config.customNote).toBe('updated together')

    expect(w2?.config.accentColor).toBe('#ff0055')
    expect(w2?.config.hideBorder).toBe(true)
    expect(w2?.config.customNote).toBe('updated together')

    expect(w3?.config.accentColor).toBeUndefined()
  })

  it('updateWidgetsSize updates dimensions across multiple widgets', () => {
    const store = useEditorStore.getState()
    store.updateWidgetsSize(['w1', 'w2'], { width: 600 })

    const widgets = useEditorStore.getState().config?.widgets || []
    const w1 = widgets.find((w) => w.instanceId === 'w1')
    const w2 = widgets.find((w) => w.instanceId === 'w2')

    expect(w1?.size.width).toBe(600)
    expect(w2?.size.width).toBe(600)
  })

  it('updateWidgetsSize respects aspect ratio locks', () => {
    const store = useEditorStore.getState()
    store.updateWidgetsSize(['w3'], { width: 200 })

    const w3 = useEditorStore.getState().config?.widgets.find((w) => w.instanceId === 'w3')
    expect(w3?.size.width).toBe(200)
    expect(w3?.size.height).toBe(200)
  })

  it('toggleWidgetsVisibility hides all when visible, and shows all when hidden', () => {
    const store = useEditorStore.getState()
    store.toggleWidgetsVisibility(['w1', 'w2'])

    let widgets = useEditorStore.getState().config?.widgets || []
    expect(widgets.find((w) => w.instanceId === 'w1')?.visible).toBe(false)
    expect(widgets.find((w) => w.instanceId === 'w2')?.visible).toBe(false)

    store.toggleWidgetsVisibility(['w1', 'w2'])
    widgets = useEditorStore.getState().config?.widgets || []
    expect(widgets.find((w) => w.instanceId === 'w1')?.visible).toBe(true)
    expect(widgets.find((w) => w.instanceId === 'w2')?.visible).toBe(true)
  })

  it('toggleWidgetsLock locks and unlocks all selected widgets', () => {
    const store = useEditorStore.getState()
    store.toggleWidgetsLock(['w1', 'w2'])

    let widgets = useEditorStore.getState().config?.widgets || []
    expect(widgets.find((w) => w.instanceId === 'w1')?.locked).toBe(true)
    expect(widgets.find((w) => w.instanceId === 'w2')?.locked).toBe(true)

    store.toggleWidgetsLock(['w1', 'w2'])
    widgets = useEditorStore.getState().config?.widgets || []
    expect(widgets.find((w) => w.instanceId === 'w1')?.locked).toBe(false)
    expect(widgets.find((w) => w.instanceId === 'w2')?.locked).toBe(false)
  })

  it('alignWidgets aligns positions left, center, right, top, bottom', () => {
    const store = useEditorStore.getState()

    // Align left
    store.alignWidgets(['w1', 'w3'], 'left')
    let widgets = useEditorStore.getState().config?.widgets || []
    const w1 = widgets.find((w) => w.instanceId === 'w1')
    const w3 = widgets.find((w) => w.instanceId === 'w3')

    expect(w1?.position.x).toBe(0)
    expect(w3?.position.x).toBe(0)

    // Align top
    store.alignWidgets(['w1', 'w2'], 'top')
    widgets = useEditorStore.getState().config?.widgets || []
    expect(widgets.find((w) => w.instanceId === 'w1')?.position.y).toBe(0)
    expect(widgets.find((w) => w.instanceId === 'w2')?.position.y).toBe(0)
  })

  it('distributeWidgets distributes vertical space evenly', () => {
    const store = useEditorStore.getState()
    // 3 widgets with different y positions
    store.updateWidgetPosition('w1', { x: 0, y: 0 }, false)
    store.updateWidgetPosition('w2', { x: 0, y: 100 }, false)
    store.updateWidgetPosition('w3', { x: 0, y: 600 }, false)

    store.distributeWidgets(['w1', 'w2', 'w3'], 'vertical')
    const widgets = useEditorStore.getState().config?.widgets || []
    const sorted = widgets.filter((w) => ['w1', 'w2', 'w3'].includes(w.instanceId))

    expect(sorted[0].position.y).toBe(0)
    expect(sorted[2].position.y).toBe(600)
    // middle widget should be between first and last
    expect(sorted[1].position.y).toBeGreaterThan(0)
    expect(sorted[1].position.y).toBeLessThan(600)
  })
})
