import { createConfiguration } from '@/engine/core/TemplateRenderer'
import type { SavedConfiguration } from '@/engine/types'

import { getMockGitHubData } from '../../../github/api/mockProfile'

export const mockGithubData = getMockGitHubData('Igorcbraz')

export const mockConfig: SavedConfiguration = createConfiguration(
  mockGithubData.user.id,
  mockGithubData.user.login,
  'terminal',
  'default',
  'Default'
)
