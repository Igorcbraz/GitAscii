import type { NormalizedGitHubData } from '@/features/github/types/github'

import { createConfiguration } from '../core/TemplateRenderer'
import type { SavedConfiguration, WidgetInstance } from '../types'
import { clusterCandidates } from './cluster/ClusterEngine'
import { ContextStack } from './context/ContextBuilder'
import { generateWidgetsFromLayout } from './generator/WidgetGenerator'
import { computeLayout } from './layout/LayoutEngine'
import { parseReadmeToAST } from './parser/ASTParser'
import { initProviders } from './providers'
import { ProviderRegistry } from './providers/ProviderRegistry'
import { detectSectionCategory, getSemanticStandardTitle } from './semantics/SemanticAnalyzer'
import type { ASTNode, ImportEngineOptions, ParsedCandidate } from './types'

export function importReadme(
  data: NormalizedGitHubData,
  templateId = 'terminal',
  options: ImportEngineOptions = {}
): SavedConfiguration {
  const confidenceThreshold = options.confidenceThreshold ?? 0.6

  // Ensure default providers are registered
  initProviders()

  const config = createConfiguration(
    data.user.id,
    data.user.login,
    templateId,
    'default',
    'Imported from README'
  )

  const rawReadme = data.readmeContent || ''

  // Stage 1: Parse README into AST (Markdown + HTML hybrid)
  const astRoot = parseReadmeToAST(rawReadme)

  // Stage 2 & 3 & 4 & 5: Context Stack + Semantic Analyzer + Provider Matcher
  const contextStack = new ContextStack()
  const candidateList: ParsedCandidate[] = []

  let currentTextBuffer: string[] = []

  const flushTextBuffer = () => {
    const text = currentTextBuffer.join('\n').trim()
    if (text) {
      const cleanText = text.replace(/[<>]/g, '').trim()

      if (cleanText) {
        const frame = contextStack.current()
        let customTitle = '[ BIO ]'
        const firstLine = cleanText.split('\n')[0]
        if (firstLine.startsWith('#')) {
          const rawHeader = firstLine.replace(/^#+\s*/, '')
          const sec = detectSectionCategory(rawHeader)
          customTitle = getSemanticStandardTitle(sec, rawHeader)
        } else if (frame.sectionTitle) {
          customTitle = frame.sectionTitle
        }

        const estHeight = Math.max(120, cleanText.split('\n').length * 20 + 60)

        candidateList.push({
          id: `cand_bio_${candidateList.length}`,
          nodeId: frame.nodeId,
          widgetId: 'bio',
          confidence: 1.0,
          align: frame.align,
          sectionCategory: frame.sectionCategory,
          sectionTitle: frame.sectionTitle,
          width: 800,
          height: estHeight,
          config: {
            customBio: cleanText.substring(0, 2000),
            customTitle,
            customLocation: '',
            customBlog: '',
          },
          sourceNode: {
            id: frame.nodeId,
            type: 'paragraph',
            attributes: {},
            children: [],
            textContent: cleanText,
            indexInParent: 0,
          },
        })
      }
    }
    currentTextBuffer = []
  }

  const traverseNode = (node: ASTNode) => {
    let sectionCategory = contextStack.current().sectionCategory
    let sectionTitle = contextStack.current().sectionTitle

    // Detect section category on headings
    if (node.type === 'heading') {
      const detected = detectSectionCategory(node.textContent)
      sectionCategory = detected
      sectionTitle = getSemanticStandardTitle(detected, node.textContent)
    }

    const frame = contextStack.push(node, sectionCategory, sectionTitle)

    // Stage 5: Match node with Provider Registry
    const providerMatch = ProviderRegistry.getInstance().matchNode(node, frame)

    if (providerMatch && providerMatch.confidence >= confidenceThreshold) {
      flushTextBuffer()

      const isClusterableTech = Boolean(providerMatch.metadata?.isClusterableTech)
      const isClusterableSocial = Boolean(providerMatch.metadata?.isClusterableSocial)
      const techItems = providerMatch.metadata?.techItems as string[] | undefined
      const socialItem = providerMatch.metadata?.socialItem as
        { platform: string; url?: string } | undefined

      candidateList.push({
        id: `cand_${node.id}_${candidateList.length}`,
        nodeId: node.id,
        widgetId: providerMatch.widgetId,
        confidence: providerMatch.confidence,
        align: frame.align,
        sectionCategory: providerMatch.extractedCategory || frame.sectionCategory,
        sectionTitle: frame.sectionTitle,
        width: providerMatch.width || 800,
        height: providerMatch.height || 160,
        config: providerMatch.config,
        sourceNode: node,
        isClusterableTech,
        isClusterableSocial,
        techItems,
        socialItem,
      })
    } else if (node.type === 'divider') {
      flushTextBuffer()
      candidateList.push({
        id: `cand_div_${node.id}`,
        nodeId: node.id,
        widgetId: 'divider',
        confidence: 1.0,
        align: 'center',
        sectionCategory: frame.sectionCategory,
        width: 800,
        height: 40,
        config: {},
        sourceNode: node,
      })
    } else if (node.type === 'image') {
      // Unknown image fallback (confidence low or unmatched provider) -> preserve as custom-image
      flushTextBuffer()
      const src = (node.attributes.src as string) || ''
      if (src) {
        let h = 200
        if (src.includes('typing-svg')) h = 100

        candidateList.push({
          id: `cand_img_${node.id}`,
          nodeId: node.id,
          widgetId: 'custom-image',
          confidence: 0.5,
          align: frame.align,
          sectionCategory: frame.sectionCategory,
          width: 800,
          height: h,
          config: { imageUrl: src },
          sourceNode: node,
        })
      }
    } else {
      // Process children
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          traverseNode(child)
        }
      } else if (node.textContent) {
        currentTextBuffer.push(node.textContent)
      }
    }

    contextStack.pop()
  }

  // Traversal of AST
  for (const child of astRoot.children) {
    traverseNode(child)
  }
  flushTextBuffer()

  // Stage 6: Cluster Engine (Group badges, tech, socials, stats)
  const clusterGroups = clusterCandidates(candidateList)

  // Stage 7: Layout Engine (Infer grids, columns, rows, spacing)
  const layoutBlocks = computeLayout(clusterGroups, { canvasWidth: 800, spacingX: 20 })

  // Stage 8: Widget Generator (Produce WidgetInstance[])
  const widgets: WidgetInstance[] = generateWidgetsFromLayout(layoutBlocks, {
    canvasWidth: 800,
    spacingX: 20,
    spacingY: 20,
  })

  config.widgets = widgets
  config.metadata.generatedBy = 'auto'

  return config
}
