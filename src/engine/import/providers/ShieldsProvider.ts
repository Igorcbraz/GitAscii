import type { ASTNode, ContextFrame, ProviderMatchResult } from '../types'
import { BaseProvider } from './BaseProvider'

export class ShieldsProvider extends BaseProvider {
  id = 'shields-provider'
  name = 'Shields.io Badges Provider'

  match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    const src = this.extractImageSrc(node)
    if (!src) return null

    let isShieldsHost = false
    try {
      const hostname = new URL(src).hostname.toLowerCase()
      isShieldsHost =
        hostname === 'shields.io' ||
        hostname.endsWith('.shields.io') ||
        hostname === 'img.shields.io'
    } catch {
      isShieldsHost = false
    }

    if (isShieldsHost) {
      const linkUrl = this.extractLinkHref(node, _contextFrame)
      const labelMatch = src.match(/badge\/(?:-|%2D)?([^-]+)-/i)
      const label = labelMatch ? labelMatch[1].toLowerCase().replace(/%20/g, ' ') : ''

      // Social platforms check
      const socialPlatforms: Record<string, string> = {
        linkedin: 'linkedin',
        twitter: 'twitter',
        x: 'twitter',
        youtube: 'youtube',
        email: 'email',
        gmail: 'email',
        telegram: 'telegram',
        instagram: 'instagram',
        discord: 'discord',
        twitch: 'twitch',
        'dev.to': 'devto',
        devto: 'devto',
        medium: 'medium',
        spotify: 'spotify',
        reddit: 'reddit',
        website: 'website',
        blog: 'website',
        portfolio: 'website',
      }

      for (const [key, platform] of Object.entries(socialPlatforms)) {
        if (label.includes(key) || (linkUrl && linkUrl.includes(key))) {
          return {
            confidence: 0.9,
            widgetId: 'social-media',
            extractedCategory: 'contact',
            config: {
              selectedSocials: [platform],
              socialUrls: linkUrl ? { [platform]: linkUrl } : {},
            },
            metadata: {
              isClusterableSocial: true,
              socialItem: { platform, url: linkUrl || undefined },
            },
          }
        }
      }

      // Tech Stack mappings
      const techMappings: Record<string, string> = {
        'c#': 'cs',
        'c%23': 'cs',
        'c++': 'cpp',
        'asp.net': 'dotnet',
        html5: 'html',
        html: 'html',
        css3: 'css',
        css: 'css',
        angular: 'angular',
        sql: 'mysql',
        mysql: 'mysql',
        postgres: 'postgresql',
        python: 'python',
        aws: 'aws',
        git: 'git',
        github: 'github',
        docker: 'docker',
        react: 'react',
        reactnative: 'react',
        node: 'nodejs',
        nodejs: 'nodejs',
        java: 'java',
        js: 'js',
        javascript: 'js',
        ts: 'ts',
        typescript: 'ts',
        go: 'golang',
        golang: 'golang',
        rust: 'rust',
        flutter: 'flutter',
        vue: 'vue',
        nextjs: 'nextjs',
        tail: 'tailwind',
        tailwind: 'tailwind',
        linux: 'linux',
      }

      for (const [key, tech] of Object.entries(techMappings)) {
        if (label.includes(key)) {
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
      }

      // Generic shields / awesome badge fallback
      return {
        confidence: 0.8,
        widgetId: 'awesome-badge',
        width: 140,
        height: 35,
        extractedCategory: _contextFrame.sectionCategory,
        config: {
          badgeUrl: src,
          targetUrl: linkUrl || undefined,
          customTitle: label ? label.toUpperCase() : '[ BADGE ]',
        },
      }
    }

    return null
  }
}
