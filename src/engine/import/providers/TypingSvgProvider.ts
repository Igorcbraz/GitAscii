import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { extractUrlParams } from '../url/UrlNormalizer'
import { BaseProvider } from './BaseProvider'

export class TypingSvgProvider extends BaseProvider {
  id = 'typing-svg-provider'
  name = 'Readme Typing SVG Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('readme-typing-svg')) {
      const params = extractUrlParams(src)
      const lines = params['lines'] || params['text'] || ''

      return {
        confidence: 0.95,
        widgetId: 'ascii-text',
        width: 800,
        height: 100,
        extractedCategory: 'hero',
        config: {
          customText: lines ? lines.split(';').join(' | ') : undefined,
          imageUrl: src,
        },
      }
    }
    return null
  }
}
