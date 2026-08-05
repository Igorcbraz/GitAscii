import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class HolopinProvider extends BaseProvider {
  id = 'holopin-provider'
  name = 'Holopin Badges Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    let hostname: string
    try {
      hostname = new URL(src).hostname.toLowerCase()
    } catch {
      return null
    }

    if (
      hostname === 'holopin.io' ||
      hostname.endsWith('.holopin.io') ||
      hostname === 'holopin.me' ||
      hostname.endsWith('.holopin.me')
    ) {
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
