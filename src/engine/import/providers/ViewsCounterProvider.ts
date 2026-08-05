import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class ViewsCounterProvider extends BaseProvider {
  id = 'views-counter-provider'
  name = 'Profile Views Counter Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (
      src.includes('komarev.com/ghpvc') ||
      src.includes('hits.seeyoufarm.org') ||
      src.includes('visitors.now.sh') ||
      src.includes('profile-counter')
    ) {
      return {
        confidence: 0.95,
        widgetId: 'views-counter',
        width: 300,
        height: 80,
        extractedCategory: 'stats',
        config: {
          showTitle: true,
          customTitle: '[ PROFILE VIEWS ]',
        },
      }
    }
    return null
  }
}
