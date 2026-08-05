import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class ContributionSnakeProvider extends BaseProvider {
  id = 'contribution-snake-provider'
  name = 'Contribution Snake Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (
      src.includes('snake') ||
      src.includes('snk') ||
      src.includes('github-contribution-grid-snake')
    ) {
      return {
        confidence: 0.95,
        widgetId: 'contribution-snake',
        width: 800,
        height: 200,
        extractedCategory: 'stats',
        config: {
          showTitle: true,
          customTitle: '[ CONTRIBUTION SNAKE ]',
        },
      }
    }
    return null
  }
}
