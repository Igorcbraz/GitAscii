import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class ReadmeQuotesProvider extends BaseProvider {
  id = 'readme-quotes-provider'
  name = 'Readme Quotes Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('quotes-github-readme')) {
      return {
        confidence: 0.95,
        widgetId: 'readme-quotes',
        width: 800,
        height: 120,
        extractedCategory: 'custom',
        config: {
          showTitle: true,
          customTitle: '[ DAILY QUOTE ]',
        },
      }
    }
    return null
  }
}
