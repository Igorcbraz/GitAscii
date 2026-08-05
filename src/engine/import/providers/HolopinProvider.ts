import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class HolopinProvider extends BaseProvider {
  id = 'holopin-provider'
  name = 'Holopin Badges Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('holopin.io') || src.includes('holopin.me')) {
      return {
        confidence: 0.95,
        widgetId: 'awesome-badge',
        width: 400,
        height: 140,
        extractedCategory: 'custom',
        config: {
          badgeUrl: src,
          customTitle: '[ HOLOPIN BADGES ]',
        },
      }
    }
    return null
  }
}
