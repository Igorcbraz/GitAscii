import type { DynamicRuleConditionType } from '../types/profiles'

export const RULE_TRIGGER_OPTIONS: {
  value: DynamicRuleConditionType
  label: string
  description: string
}[] = [
  {
    value: 'time_of_day',
    label: 'Time of Day',
    description: 'Switch profiles based on viewer local hour',
  },
  { value: 'day_of_week', label: 'Day of Week', description: 'Display weekend vs weekday layouts' },
  {
    value: 'visitor_theme',
    label: 'Dark / Light Mode',
    description: 'Match the viewer system theme',
  },
  {
    value: 'geo_country',
    label: 'Viewer Country',
    description: 'Target visitors by geographic country code',
  },
  {
    value: 'device_type',
    label: 'Device Platform',
    description: 'Tailor SVG dimensions to Mobile vs Desktop',
  },
  {
    value: 'referrer',
    label: 'Traffic Referrer',
    description: 'Customize layout for LinkedIn, GitHub, or direct',
  },
]

export const DAYS_OF_WEEK = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
] as const

export const DEVICE_TYPES = [
  { value: 'desktop', label: 'Desktop / Laptop' },
  { value: 'mobile', label: 'Mobile Device' },
  { value: 'tablet', label: 'Tablet' },
] as const
