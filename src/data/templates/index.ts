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

declare const require: {
  context: (
    directory: string,
    useSubdirectories: boolean,
    filePattern: RegExp
  ) => {
    keys: () => string[]
    <T>(path: string): T
  }
}

// Webpack discovers every JSON file in this directory at build time. Adding a
// template only requires dropping the file here; no registry edit is needed.
const templateFiles = require.context('./', false, /\.json$/)

const loadedTemplates = templateFiles
  .keys()
  .sort()
  .map((file) => {
    const template = templateFiles<RawTemplateData>(file)
    const filename = file.replace(/^\.\//, '').replace(/\.json$/, '')

    return {
      ...template,
      // Exported templates may leave `id` empty. Keep IDs stable without
      // requiring contributors to edit a registry by hand.
      id: template.id || template.templateId || filename,
    }
  })

const templateIds = loadedTemplates.map((template) => template.id)
const duplicateTemplateIds = templateIds.filter((id, index) => templateIds.indexOf(id) !== index)

if (duplicateTemplateIds.length > 0) {
  throw new Error(`Duplicate template ID(s): ${[...new Set(duplicateTemplateIds)].join(', ')}`)
}

export const RAW_TEMPLATES: RawTemplateData[] = loadedTemplates
