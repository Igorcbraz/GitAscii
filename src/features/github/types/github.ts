export interface GitHubUser {
  id: number
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  twitter_username: string | null
  email?: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  fork: boolean
  updated_at: string
}

export interface NormalizedGitHubData {
  user: GitHubUser
  repos: GitHubRepo[]
  languages: Record<string, number>
  totalStars: number
  totalForks: number
  readmeContent?: string | null
  contributions?: {
    totalContributions: number
    weeks: Array<{
      contributionDays: Array<{
        color: string
        contributionCount: number
        date: string
      }>
    }>
  }
}
