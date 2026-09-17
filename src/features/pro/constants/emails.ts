export const EMAIL_DIGEST_FREQUENCIES = [
  { id: 'daily', label: 'Daily Digest', description: 'Summary sent every morning at 09:00 UTC' },
  {
    id: 'weekly',
    label: 'Weekly Report',
    description: 'Comprehensive weekly analytics every Monday',
  },
  {
    id: 'monthly',
    label: 'Monthly Recap',
    description: 'High-level performance recap on the 1st of each month',
  },
  { id: 'never', label: 'Disabled', description: 'Do not send recurring digest emails' },
] as const

export const EMAIL_ALERT_TYPES = [
  {
    id: 'error_spike',
    label: 'Widget Errors & Fallbacks',
    description: 'Immediate alert when a GitHub publication or external asset fails',
  },
  {
    id: 'traffic_milestone',
    label: 'Traffic Milestones',
    description: 'Celebration alert when your badge reaches request milestones',
  },
  {
    id: 'downtime_alert',
    label: 'Upstream Provider Outage',
    description: 'Alert when external APIs (e.g. GitHub Stats) fail',
  },
] as const
