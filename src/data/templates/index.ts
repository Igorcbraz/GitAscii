import ascii_native from './ascii_native.json'
import bento_grid from './bento_grid.json'
import codeweb from './codeweb.json'
import hacker from './hacker.json'
import minimal_luxe from './minimal_luxe.json'
import Native from './Native.json'
import native_advanced from './native_advanced.json'
import native_simple from './native_simple.json'
import rugbedbugg from './rugbedbugg.json'
import windows_xp from './windows_xp.json'

export interface RawTemplateData {
  id?: string
  templateId?: string
  name?: string
  description?: string
  category?: string
  /** Widget tab category this template belongs to (matches WidgetCategory values) */
  widgetCategory?: string
  author?: string
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

export const RAW_TEMPLATES: RawTemplateData[] = [
  Native as unknown as RawTemplateData,
  native_simple as unknown as RawTemplateData,
  native_advanced as unknown as RawTemplateData,
  ascii_native as unknown as RawTemplateData,
  bento_grid as unknown as RawTemplateData,
  codeweb as unknown as RawTemplateData,
  hacker as unknown as RawTemplateData,
  minimal_luxe as unknown as RawTemplateData,
  rugbedbugg as unknown as RawTemplateData,
  windows_xp as unknown as RawTemplateData,
]
