import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { extractUrlParams } from '../url/UrlNormalizer'
import { BaseProvider } from './BaseProvider'

export class CapsuleRenderProvider extends BaseProvider {
  id = 'capsule-render-provider'
  name = 'Capsule Render Header/Footer Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('capsule-render.vercel.app')) {
      const params = extractUrlParams(src)
      const type = params['type'] || 'header'
      const text = params['text'] || ''

      return {
        confidence: 0.95,
        widgetId: type === 'header' ? 'header' : 'footer',
        width: 800,
        height: 120,
        extractedCategory: type === 'header' ? 'hero' : 'footer',
        config: {
          customTitle: text ? `[ ${text.toUpperCase()} ]` : undefined,
          imageUrl: src,
        },
      }
    }
    return null
  }
}
