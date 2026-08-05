import { registerDefaultProviders } from './initProviders'

let initialized = false

export function initProviders() {
  if (!initialized) {
    registerDefaultProviders()
    initialized = true
  }
}

export * from './ActivityGraphProvider'
export * from './AwesomeBadgeProvider'
export * from './BaseProvider'
export * from './CapsuleRenderProvider'
export * from './ContributionSnakeProvider'
export * from './DeviconsProvider'
export * from './GithubStatsProvider'
export * from './HolopinProvider'
export * from './initProviders'
export * from './MetricsCardProvider'
export * from './ProfileTrophyProvider'
export * from './ProviderRegistry'
export * from './ReadmeQuotesProvider'
export * from './ShieldsProvider'
export * from './SkillIconsProvider'
export * from './SpotifyProvider'
export * from './StreakStatsProvider'
export * from './TypingSvgProvider'
export * from './ViewsCounterProvider'
export * from './WakatimeProvider'
