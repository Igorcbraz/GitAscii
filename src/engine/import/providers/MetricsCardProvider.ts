import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class MetricsCardProvider extends BaseProvider {
  id = 'metrics-card-provider'
  name = 'Metrics Card Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('metrics.lecoq.io') || src.includes('github-metrics')) {
      return {
        confidence: 0.95,
        widgetId: 'metrics-card',
        width: 800,
        height: 300,
        extractedCategory: 'stats',
        config: {
          showTitle: true,
          customTitle: '[ GITHUB METRICS ]',
        },
      }
    }
    return null
  }
}
