import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class SpotifyProvider extends BaseProvider {
  id = 'spotify-provider'
  name = 'Spotify Now Playing Provider'

  match(node: ASTNode, contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (
      src.includes('spotify-github-profile') ||
      src.includes('spotify-readme') ||
      src.includes('novatide-spotify') ||
      src.includes('spotify-recently-played')
    ) {
      return {
        confidence: 0.9,
        widgetId: 'custom-image',
        width: 400,
        height: 120,
        extractedCategory: 'custom',
        config: {
          imageUrl: src,
          customTitle: '[ SPOTIFY NOW PLAYING ]',
        },
      }
    }
    return null
  }
}
