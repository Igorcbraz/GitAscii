import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class AwesomeBadgeProvider extends BaseProvider {
  id = 'awesome-badge-provider'
  name = 'Awesome Badge Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('awesome') || src.includes('badge.svg')) {
      const linkUrl = this.extractLinkHref(node, _contextFrame)
      return {
        confidence: 0.9,
        widgetId: 'awesome-badge',
        width: 160,
        height: 40,
        extractedCategory: _contextFrame.sectionCategory,
        config: {
          badgeUrl: src,
          targetUrl: linkUrl || undefined,
          customTitle: '[ AWESOME BADGE ]',
        },
      }
    }
    return null
  }
}
