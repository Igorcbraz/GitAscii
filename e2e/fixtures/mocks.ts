import { getMockGitHubData } from '../../src/features/github/api/mockProfile'

export const DEFAULT_USERNAME = 'Igorcbraz'

export const MOCK_GITHUB_DATA = getMockGitHubData(DEFAULT_USERNAME)

export const MOCK_SESSION_ANONYMOUS = { session: null }

export const MOCK_SESSION_LOGGED_IN = {
  session: {
    username: DEFAULT_USERNAME,
    githubId: 40432351,
  },
}
