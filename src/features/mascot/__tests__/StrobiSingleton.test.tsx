import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { StrobiAnchor } from '../components/StrobiAnchor'
import { StrobiHost } from '../components/StrobiHost'
import { StrobiProvider } from '../core/StrobiContext'

describe('Strobi Singleton & Architecture Integrity', () => {
  it('guarantees exactly ONE visual actor instance is mounted even with multiple section anchors', () => {
    const html = renderToStaticMarkup(
      <StrobiProvider initialAnchor="hero">
        <StrobiHost />
        {/* Multiple landing page anchors registered simultaneously */}
        <div id="hero-section">
          <StrobiAnchor id="hero" size={96} />
        </div>
        <div id="features-section">
          <StrobiAnchor id="features" size={80} />
        </div>
        <div id="pricing-section">
          <StrobiAnchor id="pricing" size={80} />
        </div>
        <div id="cta-section">
          <StrobiAnchor id="cta" size={84} />
        </div>
      </StrobiProvider>
    )

    // Verify exactly ONE persistent actor element in the DOM
    const matches = html.match(/id="strobi-persistent-actor"/g)
    expect(matches).not.toBeNull()
    expect(matches?.length).toBe(1)
  })

  it('includes proper ARIA landmark and accessibility semantics', () => {
    const html = renderToStaticMarkup(
      <StrobiProvider initialAnchor="hero">
        <StrobiHost />
      </StrobiProvider>
    )

    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="GitAscii Mascote Strobi"')
    expect(html).toContain('tabindex="0"')
  })

  it('does not render duplicate avatar SVG paths inside StrobiAnchor landmarks', () => {
    const html = renderToStaticMarkup(
      <StrobiProvider initialAnchor="hero">
        <StrobiAnchor id="features" size={80} />
        <StrobiAnchor id="pricing" size={80} />
      </StrobiProvider>
    )

    // StrobiAnchor by itself only marks landmarks and never renders SVG avatars
    expect(html).not.toContain('<svg')
    expect(html).toContain('data-strobi-anchor="features"')
    expect(html).toContain('data-strobi-anchor="pricing"')
  })
})
