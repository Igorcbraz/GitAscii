import type { NormalizedGitHubData } from '@/features/github/types/github'

import { createConfiguration } from '../core/TemplateRenderer'
import type { SavedConfiguration, WidgetConfig, WidgetInstance } from '../types'

interface LayoutBlock {
  id: string
  width: number
  height: number
  config?: WidgetConfig
}

export function importReadme(
  data: NormalizedGitHubData,
  templateId = 'terminal'
): SavedConfiguration {
  const config = createConfiguration(
    data.user.id,
    data.user.login,
    templateId,
    'default',
    'Imported from README'
  )

  config.widgets = []

  let rawReadme = data.readmeContent || ''
  rawReadme = rawReadme.replace(/<!--[\s\S]*?-->/g, '')

  const blocks: LayoutBlock[] = []
  let currentTextLines: string[] = []

  const techSet = new Set<string>()
  const socialUrls: Record<string, string> = {}
  const selectedSocials = new Set<string>()

  const flushText = () => {
    const text = currentTextLines.join('\n').trim()
    if (text) {
      const cleanText = text
        .replace(/<div[^>]*>/gi, '')
        .replace(/<\/div>/gi, '')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '')
        .replace(/<br[^>]*>/gi, '')
        .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '$1')
        .replace(/\[(.*?)\]\(.*?\)/gi, '$1')
        .trim()

      if (cleanText) {
        const estHeight = Math.max(120, cleanText.split('\n').length * 20 + 60)
        blocks.push({
          id: 'bio',
          width: 800,
          height: estHeight,
          config: {
            customBio: cleanText.substring(0, 2000),
            customTitle: '[ TEXT ]',
            customLocation: '',
            customBlog: '',
          },
        })
      }
    }
    currentTextLines = []
  }

  const flushTech = () => {
    if (techSet.size > 0) {
      blocks.push({
        id: 'tech-stack',
        width: 800,
        height: 140,
        config: {
          selectedTechs: Array.from(techSet),
          showTitle: true,
          customTitle: '[ SKILLS & TOOLS ]',
        },
      })
      techSet.clear()
    }
  }

  const flushSocial = () => {
    if (selectedSocials.size > 0) {
      blocks.push({
        id: 'social-media',
        width: 800,
        height: 120,
        config: {
          selectedSocials: Array.from(selectedSocials),
          socialUrls,
          customTitle: '[ CONNECT ]',
        },
      })
      selectedSocials.clear()
    }
  }

  const lines = rawReadme.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let processedLine = false

    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>|!\[.*?\]\((.*?)\)/gi
    let imgMatch
    let hasImages = false
    const lineImages = []

    while ((imgMatch = imgRegex.exec(line)) !== null) {
      const src = imgMatch[1] || imgMatch[2]
      if (src) lineImages.push(src)
      hasImages = true
    }

    if (hasImages) {
      for (const src of lineImages) {
        if (src.includes('github-readme-stats.vercel.app/api/top-langs')) {
          flushText()
          flushTech()
          flushSocial()
          blocks.push({ id: 'languages', width: 390, height: 210 })
          processedLine = true
        } else if (src.includes('github-readme-stats.vercel.app/api')) {
          flushText()
          flushTech()
          flushSocial()
          blocks.push({ id: 'github-readme-stats', width: 390, height: 210 })
          processedLine = true
        } else if (src.includes('github-readme-streak-stats')) {
          flushText()
          flushTech()
          flushSocial()
          blocks.push({ id: 'streak-stats', width: 390, height: 210 })
          processedLine = true
        } else if (src.includes('github-profile-trophy')) {
          flushText()
          flushTech()
          flushSocial()
          blocks.push({ id: 'profile-trophy', width: 800, height: 200 })
          processedLine = true
        } else if (src.includes('activity-graph')) {
          flushText()
          flushTech()
          flushSocial()
          blocks.push({ id: 'activity-graph', width: 800, height: 200 })
          processedLine = true
        } else if (src.includes('snake') || src.includes('snk')) {
          flushText()
          flushTech()
          flushSocial()
          blocks.push({ id: 'contribution-snake', width: 800, height: 200 })
          processedLine = true
        } else if (src.includes('skillicons.dev')) {
          const match = src.match(/i=([a-zA-Z0-9_,]+)/i)
          if (match) {
            match[1].split(',').forEach((i) => techSet.add(i))
          }
          processedLine = true
        } else if (src.includes('devicons')) {
          const match = src.match(/icons\/([^\/]+)\//i)
          if (match) {
            let tech = match[1].toLowerCase()
            if (tech === 'nodejs') tech = 'nodejs'
            else if (tech === 'css3') tech = 'css'
            else if (tech === 'html5') tech = 'html'
            techSet.add(tech)
          }
          processedLine = true
        } else if (src.includes('vectorlogo.zone')) {
          const match = src.match(/logos\/([^\/]+)\//i)
          if (match) {
            let tech = match[1].toLowerCase()
            if (tech === 'git-scm') tech = 'git'
            techSet.add(tech)
          }
          processedLine = true
        } else if (src.includes('img.shields.io/badge')) {
          const labelMatch = src.match(/badge\/(?:-|%2D)?([^-]+)-/i)
          const label = labelMatch ? labelMatch[1].toLowerCase().replace(/%20/g, '') : ''
          let platform = ''

          if (label.includes('linkedin')) platform = 'linkedin'
          else if (label.includes('twitter') || label === 'x') platform = 'twitter'
          else if (label.includes('youtube')) platform = 'youtube'
          else if (label.includes('email') || label.includes('gmail')) platform = 'email'
          else if (label.includes('telegram')) platform = 'telegram'
          else if (label.includes('instagram')) platform = 'instagram'
          else if (label.includes('discord')) platform = 'discord'
          else if (label.includes('twitch')) platform = 'twitch'
          else if (label.includes('dev.to')) platform = 'devto'
          else if (label.includes('medium')) platform = 'medium'
          else if (label.includes('spotify')) platform = 'spotify'
          else if (label.includes('reddit')) platform = 'reddit'
          else if (
            label.includes('website') ||
            label.includes('blog') ||
            label.includes('portfolio')
          )
            platform = 'website'

          if (platform) {
            selectedSocials.add(platform)
            const aMatch = new RegExp(
              `<a[^>]*href="([^"]*)"[^>]*>\\s*(<img[^>]*src="${src.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}"|!\\[.*?\\]\\(${src.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\))\\s*<\\/a>`,
              'i'
            ).exec(rawReadme)
            if (aMatch && aMatch[1]) {
              socialUrls[platform] = aMatch[1]
            }
          } else {
            const knownTechs = [
              'c%23',
              'c#',
              'c++',
              'asp.net',
              'html5',
              'css',
              'angular',
              'sql',
              'python',
              'aws',
              'git',
              'github',
              'azure',
              'docker',
              'react',
              'node',
              'javascript',
              'typescript',
            ]
            if (knownTechs.some((t) => label.includes(t))) {
              if (label.includes('c%23') || label.includes('c#')) techSet.add('cs')
              else if (label.includes('asp')) techSet.add('dotnet')
              else if (label.includes('html')) techSet.add('html')
              else if (label.includes('css')) techSet.add('css')
              else if (label.includes('angular')) techSet.add('angular')
              else if (label.includes('sql')) techSet.add('mysql')
              else if (label.includes('python')) techSet.add('python')
              else if (label.includes('aws')) techSet.add('aws')
              else if (label.includes('git')) techSet.add('git')
              else if (label.includes('github')) techSet.add('github')
              else if (label.includes('docker')) techSet.add('docker')
              else if (label.includes('react')) techSet.add('react')
              else if (label.includes('node')) techSet.add('nodejs')
              else if (label.includes('java') && !label.includes('javascript')) techSet.add('java')
              else if (label.includes('javascript')) techSet.add('js')
              else if (label.includes('typescript')) techSet.add('ts')
            }
          }
          processedLine = true
        } else {
          flushText()
          flushTech()
          flushSocial()
          blocks.push({
            id: 'custom-image',
            width: 800,
            height: 200,
            config: { imageUrl: src },
          })
          processedLine = true
        }
      }
    }

    if (!processedLine) {
      if (techSet.size > 0 && line.trim() === '') flushTech()
      if (selectedSocials.size > 0 && line.trim() === '') flushSocial()

      const textLine = line.replace(/<img[^>]*>|!\[.*?\]\(.*?\)/gi, '').trim()
      if (textLine.length > 0) {
        currentTextLines.push(textLine)
      } else if (currentTextLines.length > 0) {
        currentTextLines.push('')
      }
    }
  }

  flushText()
  flushTech()
  flushSocial()

  const widgets: WidgetInstance[] = []
  let currentY = 0
  let currentX = 0
  const canvasWidth = 800
  const spacingX = 20
  const spacingY = 20
  let maxHeightInRow = 0

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    if (currentX + block.width > canvasWidth) {
      currentY += maxHeightInRow + spacingY
      currentX = 0
      maxHeightInRow = 0
    }

    widgets.push({
      instanceId: `widget_${Date.now()}_${i}`,
      widgetId: block.id,
      name: `${block.id} Widget`,
      position: { x: currentX, y: currentY },
      size: { width: block.width, height: block.height },
      config: block.config || {},
      locked: false,
      visible: true,
      zIndex: i + 1,
    })

    currentX += block.width + spacingX
    if (block.height > maxHeightInRow) {
      maxHeightInRow = block.height
    }
  }

  config.widgets = widgets
  config.metadata.generatedBy = 'auto'

  return config
}
