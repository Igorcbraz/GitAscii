import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class ActivityGraphProvider extends BaseProvider {
  id = 'activity-graph-provider'
  name = 'Activity Graph Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('activity-graph') || src.includes('github-user-activity-graph')) {
      return {
        confidence: 0.95,
        widgetId: 'activity-graph',
        width: 800,
        height: 200,
        extractedCategory: 'stats',
        config: {
          showTitle: true,
          customTitle: '[ ACTIVITY GRAPH ]',
        },
      }
    }
    return null
  }
}
