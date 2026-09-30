import type { LandingMetrics } from '../src/constants/metrics'
import { WIDGET_IDS } from '../src/constants/widgetIds'
import { templateList } from '../src/data/templatesData'

export type { LandingMetrics } from '../src/constants/metrics'

export const TEMPLATES_COUNT = templateList.length
export const WIDGETS_COUNT = Object.keys(WIDGET_IDS).length

export const DEFAULT_LANDING_METRICS: LandingMetrics = {
  stars: 173,
  users: 37,
  readmes: 37,
  templates: TEMPLATES_COUNT,
  widgets: WIDGETS_COUNT,
  profiles: 37,
  proCustomers: 0,
  proUsernames: [],
  loggedInUsers: 287,
}

export async function fetchLandingMetrics(): Promise<LandingMetrics> {
  return DEFAULT_LANDING_METRICS
}
