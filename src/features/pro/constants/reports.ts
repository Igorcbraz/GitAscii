export const REPORT_FORMATS = [
  { id: 'csv', label: 'CSV Spreadsheet', icon: 'FileSpreadsheet', ext: '.csv' },
  { id: 'json', label: 'JSON Dataset', icon: 'FileCode', ext: '.json' },
] as const

export const REPORT_SCHEDULES = [
  { id: 'weekly', label: 'Every Monday (Weekly)' },
  { id: 'monthly', label: '1st of Every Month (Monthly)' },
  { id: 'never', label: 'Manual On-Demand Only' },
] as const
