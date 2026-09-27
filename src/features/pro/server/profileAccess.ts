import { getProEntitlements } from './entitlements'
import { getUserProfiles } from './profileManagerStore'

export class ProfileLimitError extends Error {}

export async function assertProfileWriteAllowed(username: string, slug: string): Promise<void> {
  const [entitlements, profiles] = await Promise.all([
    getProEntitlements(username),
    getUserProfiles(username, { includeSyncStatus: false }),
  ])
  if (profiles.some((profile) => profile.slug === slug.toLowerCase().trim())) return
  if (profiles.length >= entitlements.maxProfiles) {
    throw new ProfileLimitError(
      `You have reached the maximum number of profiles (${entitlements.maxProfiles}) for your plan.`
    )
  }
}
