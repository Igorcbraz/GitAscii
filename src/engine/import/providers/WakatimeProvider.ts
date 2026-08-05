import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class WakatimeProvider extends BaseProvider {
  id = 'wakatime-provider'
  name = 'Wakatime Coding Stats Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('wakatime') || src.includes('wakatime-readme-stats')) {
      return {
        confidence: 0.95,
        widgetId: 'stats',
        width: 390,
        height: 210,
        extractedCategory: 'stats',
        config: {
          customTitle: '[ WAKATIME CODING STATS ]',
          imageUrl: src,
        },
      }
    }
    return null
  }
}
