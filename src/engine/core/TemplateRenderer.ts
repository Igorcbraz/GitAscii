import { RAW_TEMPLATES } from '@/data/templates'
import {
  detectSocialsFromProfile,
  detectTechStackFromProfile,
} from '@/features/editor/utils/profileAutoDetection'

import type {
  GlobalStyles,
  NormalizedGitHubData,
  SavedConfiguration,
  WidgetInstance,
} from '../types'

export interface TemplatePreset {
  id: string
  name: string
  description: string
  category?: string
  widgetCategory?: string
  author?: string
  colors: {
    background: string
    cardBackground: string
    text: string
    accent: string
    border: string
  }
  fontFamily: string
  borderRadius: number
  layout: Array<Omit<WidgetInstance, 'instanceId'>>
}

const BLANK_PRESET: TemplatePreset = {
  id: 'blank',
  name: 'Blank Canvas',
  description: 'Empty canvas for complete creative freedom.',
  category: 'Starter',
  widgetCategory: 'essential',
  colors: {
    background: '#060606',
    cardBackground: '#121212',
    text: '#e5e5e5',
    accent: '#c5ff4a',
    border: '#252525',
  },
  fontFamily: "'Inter Tight', sans-serif",
  borderRadius: 0,
  layout: [],
}

function loadAllTemplatePresets(): Record<string, TemplatePreset> {
  const presets: Record<string, TemplatePreset> = {}

  // 1. Blank canvas is always first
  presets.blank = BLANK_PRESET

  // 2. Explicit priority order for the native templates
  const PRIORITY_IDS = ['native', 'native_simple', 'native_advanced']

  // Find priority templates
  for (const priorityId of PRIORITY_IDS) {
    const raw = RAW_TEMPLATES.find((t) => (t.id || t.templateId) === priorityId)
    if (raw) {
      const id = raw.id || raw.templateId || priorityId
      const name = raw.name || id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, ' ')
      const description = raw.description || `Template ${name}`
      const styles = raw.globalStyles || {}

      presets[id] = {
        id,
        name,
        description,
        category: raw.category,
        widgetCategory: raw.widgetCategory,
        author: raw.author,
        colors: {
          background: styles.backgroundColor || '#060606',
          cardBackground: '#121212',
          text: styles.textColor || '#e5e5e5',
          accent: styles.accentColor || '#c5ff4a',
          border: styles.borderColor || '#252525',
        },
        fontFamily: styles.fontFamily || "'Inter Tight', sans-serif",
        borderRadius: typeof styles.borderRadius === 'number' ? styles.borderRadius : 0,
        layout: (raw.widgets || []).map((w) => ({
          widgetId: w.widgetId,
          name: (w as { name?: string }).name,
          position: w.position || { x: 0, y: 0 },
          size: w.size || { width: 400, height: 200 },
          config: (w.config || {}) as Record<string, unknown>,
          locked: Boolean(w.locked),
          visible: w.visible !== false,
          zIndex: typeof w.zIndex === 'number' ? w.zIndex : 1,
        })),
      }
    }
  }

  // 3. Add all other templates from RAW_TEMPLATES
  for (const raw of RAW_TEMPLATES) {
    const id = raw.id || raw.templateId || 'template'
    if (presets[id]) continue

    const name = raw.name || id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, ' ')
    const description = raw.description || `Template ${name}`
    const styles = raw.globalStyles || {}

    presets[id] = {
      id,
      name,
      description,
      category: raw.category,
      widgetCategory: raw.widgetCategory,
      author: raw.author,
      colors: {
        background: styles.backgroundColor || '#060606',
        cardBackground: '#121212',
        text: styles.textColor || '#e5e5e5',
        accent: styles.accentColor || '#c5ff4a',
        border: styles.borderColor || '#252525',
      },
      fontFamily: styles.fontFamily || "'Inter Tight', sans-serif",
      borderRadius: typeof styles.borderRadius === 'number' ? styles.borderRadius : 0,
      layout: (raw.widgets || []).map((w) => ({
        widgetId: w.widgetId,
        name: (w as { name?: string }).name,
        position: w.position || { x: 0, y: 0 },
        size: w.size || { width: 400, height: 200 },
        config: (w.config || {}) as Record<string, unknown>,
        locked: Boolean(w.locked),
        visible: w.visible !== false,
        zIndex: typeof w.zIndex === 'number' ? w.zIndex : 1,
      })),
    }
  }

  return presets
}

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = loadAllTemplatePresets()

export function createConfiguration(
  githubId: number,
  username: string,
  templateId = 'native',
  profileSlug = 'default',
  profileName = 'Default',
  githubData?: NormalizedGitHubData | null
): SavedConfiguration {
  const defaultFallback =
    TEMPLATE_PRESETS.native || Object.values(TEMPLATE_PRESETS)[0] || BLANK_PRESET
  const preset = TEMPLATE_PRESETS[templateId] || defaultFallback

  const detectedSocials = githubData ? detectSocialsFromProfile(githubData) : null
  const detectedTechs = githubData ? detectTechStackFromProfile(githubData) : null

  const widgets: WidgetInstance[] = preset.layout.map((item, index) => {
    let autoConfig: Record<string, unknown> = {}

    if (item.widgetId === 'social-media' && detectedSocials) {
      autoConfig = {
        selectedSocials: detectedSocials.selectedSocials,
        socialUrls: detectedSocials.socialUrls,
      }
    } else if (
      (item.widgetId === 'tech-stack' || item.widgetId === 'codeweb-retro-grid') &&
      detectedTechs
    ) {
      autoConfig = {
        selectedTechs: detectedTechs,
      }
    } else if (item.widgetId === 'codeweb-social-badge' && detectedSocials) {
      autoConfig = {
        platforms: detectedSocials.selectedSocials,
      }
    }

    return {
      ...item,
      config: {
        ...autoConfig,
        ...item.config,
      },
      instanceId: `widget_${Date.now()}_${index}`,
      name: `${item.widgetId.charAt(0).toUpperCase() + item.widgetId.slice(1)} Widget`,
    }
  })

  const globalStyles: GlobalStyles = {
    backgroundColor: preset.colors.background,
    textColor: preset.colors.text,
    accentColor: preset.colors.accent,
    borderColor: preset.colors.border,
    fontFamily: preset.fontFamily,
    borderRadius: preset.borderRadius,
    padding: 24,
    themeMode: 'dark',
    templateStyle: preset.id,
  }

  return {
    version: 1,
    githubId,
    username,
    profileSlug,
    profileName,
    templateId,
    widgets,
    globalStyles,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1,
    },
  }
}
