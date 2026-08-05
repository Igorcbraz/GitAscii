import type { ClusterGroup, ParsedCandidate } from '../types'

export function clusterCandidates(candidates: ParsedCandidate[]): ClusterGroup[] {
  const groups: ClusterGroup[] = []
  let i = 0

  while (i < candidates.length) {
    const current = candidates[i]

    // 1. Cluster Tech Badges & Icons into single Tech Stack group
    if (current.isClusterableTech || current.widgetId === 'tech-stack') {
      const techSet = new Set<string>(
        current.techItems || (current.config.selectedTechs as string[]) || []
      )
      const clusteredCandidates: ParsedCandidate[] = [current]
      let j = i + 1

      while (j < candidates.length) {
        const next = candidates[j]
        if (
          (next.isClusterableTech || next.widgetId === 'tech-stack') &&
          next.sectionCategory === current.sectionCategory
        ) {
          if (next.techItems) {
            next.techItems.forEach((t) => techSet.add(t))
          } else if (Array.isArray(next.config.selectedTechs)) {
            ;(next.config.selectedTechs as string[]).forEach((t) => techSet.add(t))
          }
          clusteredCandidates.push(next)
          j++
        } else {
          break
        }
      }

      const allTechs = Array.from(techSet)
      const estimatedWidth = Math.min(800, Math.max(300, allTechs.length * 52 + 48))

      groups.push({
        id: `group_tech_${i}`,
        type: 'tech-stack',
        align: current.align,
        sectionCategory: current.sectionCategory,
        candidates: clusteredCandidates,
        width: estimatedWidth,
        height: 140,
        config: {
          selectedTechs: allTechs,
          showTitle: true,
          customTitle: '[ SKILLS & TOOLS ]',
        },
      })

      i = j
      continue
    }

    // 2. Cluster Social Badges & Links into single Social Media group
    if (current.isClusterableSocial || current.widgetId === 'social-media') {
      const socialsSet = new Set<string>()
      const socialUrls: Record<string, string> = {}
      const clusteredCandidates: ParsedCandidate[] = [current]

      if (current.socialItem) {
        socialsSet.add(current.socialItem.platform)
        if (current.socialItem.url) socialUrls[current.socialItem.platform] = current.socialItem.url
      } else if (Array.isArray(current.config.selectedSocials)) {
        ;(current.config.selectedSocials as string[]).forEach((s) => socialsSet.add(s))
        if (current.config.socialUrls) Object.assign(socialUrls, current.config.socialUrls)
      }

      let j = i + 1

      while (j < candidates.length) {
        const next = candidates[j]
        if (
          (next.isClusterableSocial || next.widgetId === 'social-media') &&
          next.sectionCategory === current.sectionCategory
        ) {
          if (next.socialItem) {
            socialsSet.add(next.socialItem.platform)
            if (next.socialItem.url) socialUrls[next.socialItem.platform] = next.socialItem.url
          } else if (Array.isArray(next.config.selectedSocials)) {
            ;(next.config.selectedSocials as string[]).forEach((s) => socialsSet.add(s))
            if (next.config.socialUrls) Object.assign(socialUrls, next.config.socialUrls)
          }
          clusteredCandidates.push(next)
          j++
        } else {
          break
        }
      }

      const allSocials = Array.from(socialsSet)
      const estimatedWidth = Math.min(800, Math.max(260, allSocials.length * 130 + 48))

      groups.push({
        id: `group_social_${i}`,
        type: 'social-media',
        align: current.align,
        sectionCategory: current.sectionCategory,
        candidates: clusteredCandidates,
        width: estimatedWidth,
        height: 120,
        config: {
          selectedSocials: allSocials,
          socialUrls,
          customTitle: '[ CONNECT ]',
        },
      })

      i = j
      continue
    }

    // Single Widget or Raw Block group
    groups.push({
      id: `group_single_${i}`,
      type:
        current.widgetId === 'custom-image' || current.widgetId === 'bio'
          ? 'raw-block'
          : 'single-widget',
      align: current.align,
      sectionCategory: current.sectionCategory,
      candidates: [current],
      width: current.width,
      height: current.height,
      config: current.config,
    })

    i++
  }

  return groups
}
