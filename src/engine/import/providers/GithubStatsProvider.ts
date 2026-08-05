import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class GithubStatsProvider extends BaseProvider {
  id = 'github-readme-stats-provider'
  name = 'GitHub Readme Stats Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('github-readme-stats') || src.includes('anuraghazra/github-readme-stats')) {
      if (src.includes('/api/top-langs')) {
        return {
          confidence: 0.95,
          widgetId: 'languages',
          width: 390,
          height: 210,
          extractedCategory: 'stats',
          config: {
            layoutStyle: 'grid',
            showTitle: true,
            customTitle: '[ MOST USED LANGUAGES ]',
          },
        }
      }

      if (src.includes('/api/pin')) {
        const repoMatch = src.match(/[?&]repo=([^&]+)/i)
        const repoName = repoMatch ? decodeURIComponent(repoMatch[1]) : ''
        return {
          confidence: 0.95,
          widgetId: 'github-readme-stats',
          width: 390,
          height: 120,
          extractedCategory: 'projects',
          config: {
            statType: 'pin',
            repoName,
            customTitle: `[ PINNED: ${repoName.toUpperCase()} ]`,
          },
        }
      }

      if (src.includes('/api/wakatime')) {
        return {
          confidence: 0.95,
          widgetId: 'stats',
          width: 390,
          height: 210,
          extractedCategory: 'stats',
          config: {
            customTitle: '[ WAKATIME STATS ]',
          },
        }
      }

      // Default GitHub stats card
      return {
        confidence: 0.95,
        widgetId: 'github-readme-stats',
        width: 390,
        height: 210,
        extractedCategory: 'stats',
        config: {
          statType: 'stats',
          showTitle: true,
          customTitle: '[ GITHUB STATS ]',
        },
      }
    }

    return null
  }
}
