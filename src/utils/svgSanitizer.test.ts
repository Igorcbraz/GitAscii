import { describe, expect, it } from 'vitest'

import { sanitizeSvg } from './svgSanitizer'

describe('SVG attribute boundaries', () => {
  it('preserves technical text, quoted attribute text and publication comments', () => {
    const svg =
      '<text title="example onload=ready">Working onload=ready href=javascript: example</text><!-- EXTERNAL_WIDGET_JSON: example onload=ready -->'
    expect(sanitizeSvg(svg)).toBe(svg)
  })
  it('removes executable attributes without removing safe SVG images', () => {
    const svg =
      '<image href="https://example.com/image.svg" onload="/* inert fixture */" width="100"/>'
    expect(sanitizeSvg(svg)).toContain('href="https://example.com/image.svg"')
    expect(sanitizeSvg(svg)).not.toContain('onload=')
  })
})
