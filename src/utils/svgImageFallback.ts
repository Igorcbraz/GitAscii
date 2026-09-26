import type { SyntheticEvent } from 'react'

import { sanitizeSafeHref } from './svgSanitizer'

export function handleSvgImageError(event: SyntheticEvent): void {
  const target = event.target
  if (!(target instanceof Element) || target.localName !== 'image') return
  const fallback = sanitizeSafeHref(target.getAttribute('data-fallback-url'))
  target.removeAttribute('data-fallback-url')
  if (fallback) target.setAttribute('href', fallback)
}
