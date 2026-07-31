import { getStoredProfiles } from '@/features/explore/getCommunityProfiles'

import ExploreClientPage from './ExploreClientPage'

export default function ExplorePage() {
  const profiles = getStoredProfiles()

  return <ExploreClientPage profiles={profiles} />
}
