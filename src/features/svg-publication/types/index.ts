import type { SavedConfiguration } from '@/engine/types'
import type { DynamicRulesConfig } from '@/features/pro/types/profiles'

export interface SvgVariant {
  username: string
  profileSlug: string
  theme: 'dark' | 'light'
  template: string | null
  widgets: string[]
}

export interface PublishedImage {
  key: string
  revision: string
  publishedAt: string
  sourceRevision: string
  degraded?: boolean
}

export interface RenderedPublication {
  svg: string
  degraded: boolean
}

export interface PublishedProfile {
  slug: string
  isDefault: boolean
  images: Record<string, PublishedImage>
}

export interface PublicationManifest {
  schemaVersion: 1
  username: string
  updatedAt: string
  profiles: PublishedProfile[]
  rules: DynamicRulesConfig
}

export interface PublicationSource {
  username: string
  profiles: Array<{ slug: string; isDefault: boolean; config: SavedConfiguration | null }>
  rules: DynamicRulesConfig
}

export interface PublicationStore {
  readJson<T>(key: string): Promise<T | null>
  writeJson(key: string, value: unknown): Promise<void>
  writeSvg(key: string, svg: string): Promise<void>
  remove?(key: string): Promise<void>
}
