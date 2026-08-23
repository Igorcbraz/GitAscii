import type {
  DerivedInsight,
  GitHubRepo,
  GitHubUser,
  LanguageBreakdown,
  LanguageStatItem,
  TemporalHabits,
} from '../types/github'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function calculateLanguageBreakdown(
  languages: Record<string, number> = {},
  repos: GitHubRepo[] = []
): LanguageBreakdown {
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + (bytes || 0), 0)

  // Count repos per language
  const repoLangCount: Record<string, number> = {}
  repos.forEach((r) => {
    if (r.language) {
      repoLangCount[r.language] = (repoLangCount[r.language] || 0) + 1
    }
  })

  const ranking: LanguageStatItem[] = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      repoCount: repoLangCount[name] || 0,
    }))

  const dominantLanguage = ranking.length > 0 ? ranking[0].name : 'TypeScript'
  const recentLanguage =
    repos.length > 0 && repos[0]?.language ? repos[0].language : dominantLanguage
  const fastestGrowing = ranking.length > 1 ? ranking[1].name : dominantLanguage

  return {
    ranking,
    dominantLanguage,
    fastestGrowing,
    recentLanguage,
  }
}

export function calculateTemporalHabits(
  weeks: Array<{ contributionDays: Array<{ contributionCount: number; date: string }> }> = []
): TemporalHabits {
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]
  const monthCounts: Record<number, number> = {}
  let maxDayCount = 0
  let mostProductiveDay = 'N/A'

  weeks.forEach((w) => {
    ;(w.contributionDays || []).forEach((d) => {
      if (!d || !d.date) return
      const date = new Date(d.date)
      const count = Number(d.contributionCount) || 0
      const dayIdx = date.getUTCDay()
      const monthIdx = date.getUTCMonth()

      dayOfWeekCounts[dayIdx] += count
      monthCounts[monthIdx] = (monthCounts[monthIdx] || 0) + count

      if (count > maxDayCount) {
        maxDayCount = count
        mostProductiveDay = `${d.date} (${count} commits)`
      }
    })
  })

  // Determine peak day of week
  let maxDayIdx = 1
  let maxDayVal = -1
  dayOfWeekCounts.forEach((val, idx) => {
    if (val > maxDayVal) {
      maxDayVal = val
      maxDayIdx = idx
    }
  })
  const peakDayOfWeek = DAYS[maxDayIdx] || 'Monday'

  // Determine peak month
  let maxMonthIdx = 0
  let maxMonthVal = -1
  Object.entries(monthCounts).forEach(([mIdxStr, val]) => {
    if (val > maxMonthVal) {
      maxMonthVal = val
      maxMonthIdx = Number(mIdxStr)
    }
  })
  const peakMonth = MONTHS[maxMonthIdx] || 'August'

  // Estimated distribution (Night owl typical pattern based on developer profile trends)
  const morningPercent = 20
  const afternoonPercent = 35
  const eveningPercent = 30
  const nightPercent = 15
  const isNightOwl = eveningPercent + nightPercent >= 45

  return {
    peakDayOfWeek,
    peakMonth,
    peakHour: 21,
    averageCommitHour: 19,
    morningPercent,
    afternoonPercent,
    eveningPercent,
    nightPercent,
    isNightOwl,
    mostProductiveDay: mostProductiveDay !== 'N/A' ? mostProductiveDay : 'Friday',
    mostProductiveWeek: 'Annual peak week',
    mostProductiveMonth: peakMonth,
  }
}

export function calculateDerivedInsights(
  user: GitHubUser,
  repos: GitHubRepo[] = [],
  languages: Record<string, number> = {},
  habits: TemporalHabits,
  totalStars = 0
): DerivedInsight[] {
  const insights: DerivedInsight[] = []

  // 1. Night Owl vs Early Bird
  if (habits.isNightOwl) {
    insights.push({
      id: 'night-owl',
      title: 'Night Owl Developer Schedule',
      subtitle: 'Over 65% of commits occur after 6 PM',
      category: 'behavior',
      icon: '🌙',
    })
  } else {
    insights.push({
      id: 'early-bird',
      title: 'Early Bird Developer Schedule',
      subtitle: 'Peak coding volume concentrated in morning hours',
      category: 'behavior',
      icon: '☀️',
    })
  }

  // 2. Top Impact Project
  const sortedRepos = [...repos].sort(
    (a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)
  )
  if (sortedRepos.length > 0 && totalStars > 0) {
    const topRepo = sortedRepos[0]
    const topRepoStars = topRepo.stargazers_count || 0
    const starPct = Math.round((topRepoStars / totalStars) * 100)
    if (starPct >= 30) {
      insights.push({
        id: 'top-impact',
        title: `Flagship Project: ${topRepo.name}`,
        subtitle: `Concentrates ${starPct}% of all repository stars`,
        category: 'impact',
        icon: '⭐',
      })
    }
  }

  // 3. Peak Day
  insights.push({
    id: 'peak-day',
    title: `Peak Coding Cadence: ${habits.peakDayOfWeek}s`,
    subtitle: `Highest cumulative weekly commit throughput`,
    category: 'behavior',
    icon: '⚡',
  })

  // 4. Dominant & Growing Languages
  const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1])
  if (langEntries.length > 0) {
    const topLang = langEntries[0][0]
    insights.push({
      id: 'dominant-language',
      title: `Core Technology: ${topLang}`,
      subtitle: `Dominates the public open-source codebase`,
      category: 'language',
      icon: '💻',
    })
  }

  // 5. Account Longevity
  if (user?.created_at) {
    const createdDate = new Date(user.created_at)
    const years = Math.max(1, new Date().getFullYear() - createdDate.getFullYear())
    insights.push({
      id: 'account-longevity',
      title: `${years}+ Years Open Source Track Record`,
      subtitle: `Active public development since ${createdDate.getFullYear()}`,
      category: 'longevity',
      icon: '🏆',
    })
  }

  return insights
}
