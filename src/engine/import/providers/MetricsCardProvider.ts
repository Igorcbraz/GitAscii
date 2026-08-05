import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class MetricsCardProvider extends BaseProvider {
  id = 'metrics-card-provider'
  name = 'Metrics Card Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    let hostname: string
    try {
      hostname = new URL(src).hostname.toLowerCase()
    } catch {
      return null
    }

    const isMetricsHost = hostname === 'metrics.lecoq.io'
    const isGithubMetricsHost =
      hostname === 'github-metrics' || hostname.endsWith('.github-metrics')

    if (isMetricsHost || isGithubMetricsHost) {
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
