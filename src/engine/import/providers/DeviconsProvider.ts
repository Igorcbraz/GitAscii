import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class DeviconsProvider extends BaseProvider {
  id = 'devicons-provider'
  name = 'Devicons & VectorLogo Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    let techName = ''

    if (src.includes('devicon') || src.includes('devicons')) {
      const match = src.match(/icons\/([^\/]+)\//i)
      if (match) techName = match[1].toLowerCase()
    } else if (src.includes('vectorlogo.zone')) {
      const match = src.match(/logos\/([^\/]+)\//i)
      if (match) {
        techName = match[1].toLowerCase()
        if (techName === 'git-scm') techName = 'git'
      }
    }

    if (techName) {
      const normalizedMap: Record<string, string> = {
        nodejs: 'nodejs',
        css3: 'css',
        html5: 'html',
        javascript: 'js',
        typescript: 'ts',
        python: 'python',
        react: 'react',
        docker: 'docker',
        git: 'git',
        github: 'github',
        aws: 'aws',
        linux: 'linux',
      }
      const tech = normalizedMap[techName] || techName

      return {
        confidence: 0.9,
        widgetId: 'tech-stack',
        extractedCategory: 'tech-stack',
        config: {
          selectedTechs: [tech],
        },
        metadata: {
          isClusterableTech: true,
          techItems: [tech],
        },
      }
    }

    return null
  }
}
