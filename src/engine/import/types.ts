import type { WidgetConfig } from '../types'

export type SectionCategory =
  | 'hero'
  | 'about'
  | 'tech-stack'
  | 'stats'
  | 'projects'
  | 'contact'
  | 'support'
  | 'footer'
  | 'custom'

export type Alignment = 'left' | 'center' | 'right'

export type ASTNodeType =
  | 'document'
  | 'container'
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'list_item'
  | 'table'
  | 'table_row'
  | 'table_cell'
  | 'blockquote'
  | 'divider'
  | 'image'
  | 'link'
  | 'text'
  | 'code_block'
  | 'raw_html'

export interface ASTAttributes {
  align?: Alignment
  src?: string
  href?: string
  alt?: string
  title?: string
  width?: string | number
  height?: string | number
  level?: number // Heading level 1-6
  style?: string
  class?: string
  id?: string
  [key: string]: unknown
}

export interface ASTNode {
  id: string
  type: ASTNodeType
  tagName?: string
  attributes: ASTAttributes
  children: ASTNode[]
  textContent: string
  rawHtml?: string
  indexInParent: number
  parentId?: string
}

export interface ContextFrame {
  nodeId: string
  tagName?: string
  align: Alignment
  sectionCategory: SectionCategory
  sectionTitle?: string
  depth: number
  isInsideLink: boolean
  linkHref?: string
  gridColumnSpan?: number
  isTable: boolean
  isTableRow: boolean
  isTableCell: boolean
}

export interface ProviderMatchResult {
  confidence: number // 0.0 to 1.0
  widgetId: string
  config: Record<string, unknown>
  title?: string
  width?: number
  height?: number
  extractedCategory?: SectionCategory
  metadata?: Record<string, unknown>
}

export interface Provider {
  id: string
  name: string
  description?: string
  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null
}

export interface ParsedCandidate {
  id: string
  nodeId: string
  widgetId: string
  confidence: number
  align: Alignment
  sectionCategory: SectionCategory
  sectionTitle?: string
  width: number
  height: number
  config: WidgetConfig
  rawContent?: string
  sourceNode: ASTNode
  isClusterableTech?: boolean
  isClusterableSocial?: boolean
  techItems?: string[]
  socialItem?: { platform: string; url?: string }
}

export interface ClusterGroup {
  id: string
  type: 'tech-stack' | 'social-media' | 'single-widget' | 'raw-block' | 'multi-column-row'
  align: Alignment
  sectionCategory: SectionCategory
  candidates: ParsedCandidate[]
  width: number
  height: number
  config: WidgetConfig
}

export interface LayoutBlock {
  id: string
  widgetId: string
  width: number
  height: number
  align: Alignment
  sectionCategory: SectionCategory
  config: WidgetConfig
}

export interface ImportEngineOptions {
  templateId?: string
  confidenceThreshold?: number
  defaultWidth?: number
}
