import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class ViewsCounterProvider extends BaseProvider {
  id = 'views-counter-provider'
  name = 'Profile Views Counter Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    let hostname = ''
    let pathname = ''
    try {
      const parsed = new URL(src)
      hostname = parsed.hostname.toLowerCase()
      pathname = parsed.pathname.toLowerCase()
    } catch {
      return null
    }

    if (
      (hostname === 'komarev.com' && pathname.includes('/ghpvc')) ||
      hostname === 'hits.seeyoufarm.org' ||
      hostname.endsWith('.seeyoufarm.org') ||
      hostname === 'visitors.now.sh' ||
      hostname.endsWith('.now.sh') ||
      hostname.includes('profile-counter')
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
