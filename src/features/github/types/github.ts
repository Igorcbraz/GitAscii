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
  topics?: string[]
  languages?: string[]
  fork: boolean
  updated_at: string
}

export interface GitHubOrganization {
  id?: number
  login: string
  avatar_url?: string
  description?: string | null
}

export interface ActivityMetrics {
  totalCommits: number
  totalPullRequests: number
  totalIssues: number
  totalReviews: number
  totalDiscussions: number
  repositoriesCreated: number
  totalForks: number
}

export interface LanguageStatItem {
  name: string
  bytes: number
  percentage: number
  repoCount: number
}

export interface LanguageBreakdown {
  ranking: LanguageStatItem[]
  dominantLanguage: string
  fastestGrowing?: string
  recentLanguage?: string
}

export interface TemporalHabits {
  peakDayOfWeek: string
  peakMonth: string
  peakHour: number
  averageCommitHour: number
  morningPercent: number
  afternoonPercent: number
  eveningPercent: number
  nightPercent: number
  isNightOwl: boolean
  mostProductiveDay: string
  mostProductiveWeek: string
  mostProductiveMonth: string
}

export interface DerivedInsight {
  id: string
  title: string
  subtitle?: string
  icon?: string
  category: 'behavior' | 'impact' | 'language' | 'growth' | 'longevity'
}

export interface DeveloperScores {
  activityScore: number
  openSourceScore: number
  communityScore: number
  consistencyScore: number
  impactScore: number
  growthScore: number
  maintenanceScore: number
  projectHealthScore: number
  contributionScore: number
  totalDeveloperScore: number
  tierGrade: 'S+' | 'S' | 'A+' | 'A' | 'B' | 'C'
}

export interface NormalizedGitHubData {
  user: GitHubUser
  repos: GitHubRepo[]
  languages: Record<string, number>
  totalStars: number
  totalForks: number
  readmeContent?: string | null
  socialAccounts?: Array<{ provider: string; url: string }>
  organizations?: GitHubOrganization[]
  activityMetrics?: ActivityMetrics
  languageBreakdown?: LanguageBreakdown
  habits?: TemporalHabits
  derivedInsights?: DerivedInsight[]
  developerScores?: DeveloperScores
  developerDna?: DeveloperDNA
  codingVelocity?: CodingVelocity
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

export interface DNATrait {
  name: string
  percentage: number
}

export interface DeveloperDNA {
  traits: DNATrait[]
  primaryArchetype: string
  archetypeDescription: string
}

export interface VelocityMetric {
  label: string
  value: number
  max: number
}

export interface CodingVelocity {
  commitsPerMonth: number
  prsPerMonth: number
  issuesPerMonth: number
  reviewsPerMonth: number
  avgCommitsPerDay: number
  metrics: VelocityMetric[]
}
