import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'

import type { AnalyticsSummary } from '../../types'
import { AnalyticsProfilesSection } from './AnalyticsProfilesSection'

vi.mock('@/i18n', () => ({ useI18n: () => ({ t: (_key: string, fallback: string) => fallback }) }))

it('renders legacy profile rows without numeric counters and preserves real zero counts', () => {
  const summary = {
    topProfiles: [
      { slug: 'legacy', name: 'Legacy' },
      { slug: 'zero', name: 'Zero', views: 0, uniques: 0 },
    ],
  } as unknown as AnalyticsSummary
  const html = renderToStaticMarkup(<AnalyticsProfilesSection summary={summary} />)
  expect(html).toContain('Legacy')
  expect(html).toContain('—')
  expect(html).toContain('>0</td>')
})
