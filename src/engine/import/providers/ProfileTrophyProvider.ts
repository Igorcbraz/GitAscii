import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class ProfileTrophyProvider extends BaseProvider {
  id = 'profile-trophy-provider'
  name = 'GitHub Profile Trophy Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('github-profile-trophy')) {
      return {
        confidence: 0.95,
        widgetId: 'profile-trophy',
        width: 800,
        height: 200,
        extractedCategory: 'stats',
        config: {
          showTitle: true,
          customTitle: '[ PROFILE TROPHIES ]',
        },
      }
    }
    return null
  }
}
