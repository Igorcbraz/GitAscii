export const ANALYTICS_TIME_RANGES = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'custom', label: 'Custom' },
] as const

export const REALTIME_REFRESH_INTERVAL = 15_000

export const ANALYTICS_COLORS = {
  primary: '#00e5ff',
  secondary: '#a855f7',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  muted: '#6b7280',
  grid: '#ffffff15',
} as const

export const HTTP_STATUS_COLORS: Record<string, string> = {
  '200': '#22c55e',
  '304': '#38bdf8',
  '404': '#f59e0b',
  '500': '#ef4444',
  '502': '#f43f5e',
}

export const REFERRER_PRETTY_NAMES: Record<string, string> = {
  'github.com': 'GitHub Profile / README',
  'linkedin.com': 'LinkedIn',
  'twitter.com': 'Twitter / X',
  'x.com': 'Twitter / X',
  'dev.to': 'DEV Community',
  'hashnode.dev': 'Hashnode',
  'medium.com': 'Medium',
  'google.com': 'Google Search',
  direct: 'Direct / Markdown Embed',
}
