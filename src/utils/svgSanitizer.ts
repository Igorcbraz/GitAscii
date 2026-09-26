function decodeXmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);?/gi, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
}

export function sanitizeSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') return ''

  let cleaned = svgContent.replace(/<\?xml[^?]*\?>/gi, '').replace(/<!DOCTYPE[^<>]*>/gi, '')

  const dangerousTags = [
    'script',
    'foreignobject',
    'iframe',
    'object',
    'embed',
    'applet',
    'base',
    'link',
    'meta',
    'handler',
    'listener',
  ]
  for (const tag of dangerousTags) {
    const tagRegex = new RegExp(
      `<(?:[a-zA-Z0-9_-]+:)?${tag}\\b[\\s\\S]*?<\\/(?:[a-zA-Z0-9_-]+:)?${tag}>|<(?:[a-zA-Z0-9_-]+:)?${tag}\\b[^>]*\\/?>`,
      'gi'
    )
    let prev = ''
    while (prev !== cleaned) {
      prev = cleaned
      cleaned = cleaned.replace(tagRegex, '')
    }
  }

  const smilRegex =
    /<(?:[a-zA-Z0-9_-]+:)?(?:animate|set|animatetransform|animatemotion)\b([^>]*)\/?>/gi
  cleaned = cleaned.replace(smilRegex, (match, attrs) => {
    const decodedAttrs = decodeXmlEntities(attrs)
      .replace(/[\u0000-\u001F\u007F-\u009F\s]/g, ' ')
      .toLowerCase()

    if (/attributename\s*=\s*["']?\s*on[a-z0-9_-]+/i.test(decodedAttrs)) {
      return ''
    }

    if (
      /(?:values|to|from|by)\s*=\s*["']?[\s\x00-\x1F]*(?:javascript:|vbscript:|data:)/i.test(
        decodedAttrs
      )
    ) {
      return ''
    }

    if (
      /(?:href|xlink:href)\s*=\s*["']?[\s\x00-\x1F]*(?:javascript:|vbscript:|data:)/i.test(
        decodedAttrs
      )
    ) {
      return ''
    }

    return match
  })

  cleaned = cleaned.replace(
    /<!--[\s\S]*?-->|<[a-zA-Z][^<>"']*(?:(?:"[^"]*"|'[^']*')[^<>"']*)*>/g,
    (tag) => {
      if (tag.startsWith('<!--')) return tag
      return tag.replace(
        /([\s/]+)([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
        (attribute, prefix, name: string, doubleValue, singleValue, unquotedValue) => {
          if (/^(?:[a-zA-Z0-9_-]+:)?on[a-zA-Z0-9_-]+$/i.test(name)) return ''
          if (!/^(?:[a-zA-Z0-9_-]+:)?(?:href|src|action|formaction)$/i.test(name)) return attribute
          const rawValue = doubleValue ?? singleValue ?? unquotedValue ?? ''
          if (rawValue.startsWith('data:image/')) {
            return /^data:image\/(?:png|jpeg|jpg|gif|webp|svg\+xml)(?:;[a-z0-9._=-]+)*;base64,/i.test(
              rawValue.slice(0, 100)
            )
              ? attribute
              : prefix + 'href="#"'
          }
          const decoded = decodeXmlEntities(rawValue)
            .replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '')
            .toLowerCase()
          return /^(?:javascript:|vbscript:|data:|\/\/)/.test(decoded)
            ? prefix + 'href="#"'
            : attribute
        }
      )
    }
  )

  cleaned = cleaned.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, cssContent) => {
    const safeCss = cssContent
      .replace(
        /@import\s+(?:url\(['"]?(?!https:\/\/fonts\.googleapis\.com\/)[^'")]*['"]?\)|'(?!https:\/\/fonts\.googleapis\.com\/)[^']*'|"(?!https:\/\/fonts\.googleapis\.com\/)[^"]*")[^;]*;?/gi,
        ''
      )
      .replace(/expression\s*\([^)]*\)/gi, '')
      .replace(/behavior\s*:\s*url\([^)]*\)/gi, '')
      .replace(/-moz-binding\s*:\s*url\([^)]*\)/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/vbscript\s*:/gi, '')
      .replace(/data\s*:\s*text\/html/gi, '')
    return `<style>${safeCss}</style>`
  })

  return cleaned
}

export function sanitizeSafeHref(url?: string | null, fallback = ''): string {
  if (!url || typeof url !== 'string') return fallback

  const trimmed = url.trim()
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    if (trimmed.startsWith('//') || trimmed.includes('\\')) {
      return fallback
    }
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    if (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' ||
      parsed.protocol === 'mailto:'
    ) {
      return trimmed
    }
    if (
      parsed.protocol === 'data:' &&
      (trimmed.startsWith('data:image/png') ||
        trimmed.startsWith('data:image/jpeg') ||
        trimmed.startsWith('data:image/gif') ||
        trimmed.startsWith('data:image/webp') ||
        trimmed.startsWith('data:image/svg+xml'))
    ) {
      return trimmed
    }
  } catch {
    // Relative or invalid
  }

  return fallback
}

export function sanitizeColor(color?: string | null, fallback = '#ffffff'): string {
  if (!color || typeof color !== 'string') return fallback
  const trimmed = color.trim()

  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return trimmed
  }

  if (/^(?:rgb|rgba|hsl|hsla)\(\s*[0-9.%\s,/-]+\s*\)$/i.test(trimmed)) {
    return trimmed
  }

  if (/^[a-zA-Z]{3,20}$/.test(trimmed)) {
    return trimmed
  }

  return fallback
}

export function sanitizeId(id?: string | null, fallback = 'default'): string {
  if (!id || typeof id !== 'string') return fallback
  const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '')
  return cleaned || fallback
}
