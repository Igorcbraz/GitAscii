import type { NormalizedGitHubData, SavedConfiguration } from '../src/engine/types'
import { renderPublishedProfile } from '../src/features/svg-publication/server/renderProfile'
import type { SvgVariant } from '../src/features/svg-publication/types'

process.once(
  'message',
  async (input: {
    config: SavedConfiguration | null
    data: NormalizedGitHubData
    variant: SvgVariant
  }) => {
    try {
      const result = await renderPublishedProfile(input.config, input.data, input.variant)
      process.send?.({ result })
    } catch (error) {
      process.send?.({ error: error instanceof Error ? error.message : 'SVG rendering failed' })
    }
  }
)
