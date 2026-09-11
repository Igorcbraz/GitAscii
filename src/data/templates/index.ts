import { GENERATED_TEMPLATES } from './generated'

export interface RawTemplateData {
  id?: string
  templateId?: string
  name?: string
  description?: string
  category?: string
  categoryUrl?: string
  widgetCategory?: string
  author?: string
  authorUrl?: string
  widgets: Array<{
    widgetId: string
    position?: { x: number; y: number }
    size?: { width: number; height: number }
    config?: Record<string, unknown>
    locked?: boolean
    visible?: boolean
    zIndex?: number
  }>
  globalStyles?: {
    backgroundColor?: string
    textColor?: string
    accentColor?: string
    borderColor?: string
    fontFamily?: string
    borderRadius?: number
    padding?: number
    themeMode?: 'dark' | 'light' | 'auto'
    templateStyle?: string
  }
}

const loadedTemplates: RawTemplateData[] = GENERATED_TEMPLATES.map(({ file, template }) => {
  const rawTemplate = template as unknown as RawTemplateData
  return {
    ...rawTemplate,
    id: rawTemplate.id || rawTemplate.templateId || file,
  }
})

const templateIds = loadedTemplates.map((template) => template.id)
const duplicateTemplateIds = templateIds.filter((id, index) => templateIds.indexOf(id) !== index)

if (duplicateTemplateIds.length > 0) {
  throw new Error(`Duplicate template ID(s): ${[...new Set(duplicateTemplateIds)].join(', ')}`)
}

export const RAW_TEMPLATES = loadedTemplates
