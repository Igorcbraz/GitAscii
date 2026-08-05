import { ActivityGraphProvider } from './ActivityGraphProvider'
import { AwesomeBadgeProvider } from './AwesomeBadgeProvider'
import { CapsuleRenderProvider } from './CapsuleRenderProvider'
import { ContributionSnakeProvider } from './ContributionSnakeProvider'
import { DeviconsProvider } from './DeviconsProvider'
import { GithubStatsProvider } from './GithubStatsProvider'
import { HolopinProvider } from './HolopinProvider'
import { MetricsCardProvider } from './MetricsCardProvider'
import { ProfileTrophyProvider } from './ProfileTrophyProvider'
import { ProviderRegistry } from './ProviderRegistry'
import { ReadmeQuotesProvider } from './ReadmeQuotesProvider'
import { ShieldsProvider } from './ShieldsProvider'
import { SkillIconsProvider } from './SkillIconsProvider'
import { SpotifyProvider } from './SpotifyProvider'
import { StreakStatsProvider } from './StreakStatsProvider'
import { TypingSvgProvider } from './TypingSvgProvider'
import { ViewsCounterProvider } from './ViewsCounterProvider'
import { WakatimeProvider } from './WakatimeProvider'

export function registerDefaultProviders(): ProviderRegistry {
  const registry = ProviderRegistry.getInstance()

  registry.register(new GithubStatsProvider())
  registry.register(new StreakStatsProvider())
  registry.register(new ActivityGraphProvider())
  registry.register(new SkillIconsProvider())
  registry.register(new DeviconsProvider())
  registry.register(new ShieldsProvider())
  registry.register(new CapsuleRenderProvider())
  registry.register(new TypingSvgProvider())
  registry.register(new SpotifyProvider())
  registry.register(new WakatimeProvider())
  registry.register(new HolopinProvider())
  registry.register(new ProfileTrophyProvider())
  registry.register(new ContributionSnakeProvider())
  registry.register(new ViewsCounterProvider())
  registry.register(new ReadmeQuotesProvider())
  registry.register(new MetricsCardProvider())
  registry.register(new AwesomeBadgeProvider())

  return registry
}
