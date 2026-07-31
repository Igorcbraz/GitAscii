import type { NormalizedGitHubData } from '@/features/github/types/github'

import { createConfiguration } from '../core/TemplateRenderer'
import type { SavedConfiguration } from '../types'

export interface ProfileScore {
  suggestedTemplate: string
  hasRichBio: boolean
  hasHighStars: boolean
  hasManyRepos: boolean
  dominantLanguage: string | null
  recommendedWidgets: string[]
}

export function analyzeProfile(data: NormalizedGitHubData): ProfileScore {
  const { user, languages, totalStars } = data

  const hasRichBio = Boolean(user.bio && user.bio.length > 20)
  const hasHighStars = totalStars > 50
  const hasManyRepos = user.public_repos >= 10

  let dominantLanguage: string | null = null
  let maxLangCount = 0

  Object.entries(languages).forEach(([lang, count]) => {
    if (count > maxLangCount) {
      maxLangCount = count
      dominantLanguage = lang
    }
  })

  let suggestedTemplate = 'terminal'

  if (hasManyRepos && hasHighStars) {
    suggestedTemplate = 'minimal'
  } else if (hasRichBio) {
    suggestedTemplate = 'terminal'
  } else if (dominantLanguage === 'TypeScript' || dominantLanguage === 'JavaScript') {
    suggestedTemplate = 'cyberpunk'
  }

  const recommendedWidgets = [
    'header',
    'ascii-art',
    'bio',
    'stats',
    'languages',
    'repositories',
    'footer',
  ]

  return {
    suggestedTemplate,
    hasRichBio,
    hasHighStars,
    hasManyRepos,
    dominantLanguage,
    recommendedWidgets,
  }
}

export function generateBestProfile(data: NormalizedGitHubData): SavedConfiguration {
  const analysis = analyzeProfile(data)
  const config = createConfiguration(
    data.user.id,
    data.user.login,
    analysis.suggestedTemplate,
    'default',
    'Default Profile'
  )

  config.metadata.generatedBy = 'auto'

  return config
}
