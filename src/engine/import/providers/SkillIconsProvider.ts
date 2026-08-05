import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { extractUrlParams } from '../url/UrlNormalizer'
import { BaseProvider } from './BaseProvider'

export class SkillIconsProvider extends BaseProvider {
  id = 'skill-icons-provider'
  name = 'Skill Icons Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    if (src.includes('skillicons.dev')) {
      const params = extractUrlParams(src)
      const iconsStr = params['i'] || params['icons'] || ''
      const techs = iconsStr
        ? iconsStr
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : []

      if (techs.length > 0) {
        return {
          confidence: 0.95,
          widgetId: 'tech-stack',
          width: Math.min(800, techs.length * 52 + 48),
          height: 140,
          extractedCategory: 'tech-stack',
          config: {
            selectedTechs: techs,
            showTitle: true,
            customTitle: '[ SKILLS & TOOLS ]',
          },
          metadata: {
            isClusterableTech: true,
            techItems: techs,
          },
        }
      }
    }
    return null
  }
}
