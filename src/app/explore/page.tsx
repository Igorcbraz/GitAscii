import { getStoredProfiles } from '@/features/explore/getCommunityProfiles'

import ExploreClientPage from './ExploreClientPage'

export default async function ExplorePage() {
  const profiles = await getStoredProfiles()

  return <ExploreClientPage profiles={profiles} />
}
