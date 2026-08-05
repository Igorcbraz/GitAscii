import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class StreakStatsProvider extends BaseProvider {
  id = 'streak-stats-provider'
  name = 'GitHub Streak Stats Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('github-readme-streak-stats') || src.includes('streak-stats')) {
      return {
        confidence: 0.95,
        widgetId: 'streak-stats',
        width: 390,
        height: 210,
        extractedCategory: 'stats',
        config: {
          showTitle: true,
          customTitle: '[ STREAK STATS ]',
        },
      }
    }
    return null
  }
}
