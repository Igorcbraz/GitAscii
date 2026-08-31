export type HealthTabKey =
  'overview' | 'widgets' | 'uptime' | 'alerts' | 'badges' | 'incidents' | 'diagnostics'

export interface HealthNavTab {
  id: HealthTabKey
  label: string
  iconName: string
  description: string
}

export const HEALTH_NAV_TABS: readonly HealthNavTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    iconName: 'Activity',
    description: 'System-wide health matrix & key reliability metrics',
  },
  {
    id: 'widgets',
    label: 'Widgets Matrix',
    iconName: 'LayoutGrid',
    description: 'Real-time per-widget uptime, error rates and response times',
  },
  {
    id: 'uptime',
    label: 'Uptime & Latency',
    iconName: 'Clock',
    description: 'Historical 90-day uptime bars and p95/p99 latency breakdowns',
  },
  {
    id: 'alerts',
    label: 'Alert Rules',
    iconName: 'BellRing',
    description: 'Automated threshold notification triggers & webhook settings',
  },
  {
    id: 'badges',
    label: 'Embed Badges',
    iconName: 'ShieldCheck',
    description: 'Live SVG badges to showcase 99.9% uptime on your profile',
  },
  {
    id: 'incidents',
    label: 'Incident Log',
    iconName: 'AlertTriangle',
    description: 'Chronological timeline of widget anomalies and recoveries',
  },
  {
    id: 'diagnostics',
    label: 'Live Diagnostics',
    iconName: 'Terminal',
    description: 'Interactive pipeline test runner & synthetic request probe',
  },
] as const

export const HEALTH_STATUS_COLORS = {
  healthy: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]',
  },
  degraded: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]',
  },
  failing: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-400',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
  },
} as const

export const BADGE_STYLES = [
  { id: 'flat-square', label: 'Flat Square' },
  { id: 'for-the-badge', label: 'For The Badge' },
  { id: 'plastic', label: 'Plastic' },
] as const
