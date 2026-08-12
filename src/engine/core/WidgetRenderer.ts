import { APP_DOMAIN } from '../../constants'
import { generateAsciiArt } from '../ascii/converter'
import { type AsciiFontName, convertTextToAscii } from '../ascii/textConverter'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '../types'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatUptime(createdAtStr?: string): string {
  if (!createdAtStr) return '5 years, 3 months, 13 days'
  const created = new Date(createdAtStr)
  if (isNaN(created.getTime())) return '5 years, 3 months, 13 days'
  const now = new Date()

  let years = now.getFullYear() - created.getFullYear()
  let months = now.getMonth() - created.getMonth()
  let days = now.getDate() - created.getDate()

  if (days < 0) {
    months -= 1
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }

  if (months < 0) {
    years -= 1
    months += 12
  }

  const parts = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)

  return parts.join(', ')
}

function renderExternalWidgetSvg(
  url: string,
  width: number,
  height: number,
  title: string,
  showTitle: boolean,
  globalStyles: GlobalStyles,
  accent: string,
  mode: 'contain' | 'badge' = 'contain',
  targetUrl?: string,
  fallbackUrl?: string
): string {
  let processedUrl = url
  try {
    const parsed = new URL(processedUrl)
    if (parsed.hostname.toLowerCase() === 'github.com' && parsed.pathname.includes('/blob/')) {
      processedUrl = processedUrl.replace(
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/i,
        'https://raw.githubusercontent.com/$1/$2/$3'
      )
    }
  } catch {
    // Ignore invalid URL
  }

  const imgY = showTitle ? 44 : 16
  const paddingX = 16
  const imgW = width - paddingX * 2
  const imgH = Math.max(28, height - imgY - 16)

  const imgStyle =
    mode === 'badge'
      ? 'height:32px; width:auto; max-width:100%; object-fit:contain; object-position:left center;'
      : 'width:100%; height:100%; max-width:100%; max-height:100%; object-fit:contain; object-position:left top;'

  const imgHtml = fallbackUrl
    ? `<img src="${escapeXml(processedUrl)}" alt="${escapeXml(title)}" style="${imgStyle}" onerror="this.onerror=null;this.src='${escapeXml(fallbackUrl)}';" />`
    : `<img src="${escapeXml(processedUrl)}" alt="${escapeXml(title)}" style="${imgStyle}" />`
  const innerContentHtml = targetUrl
    ? `<a href="${escapeXml(targetUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;max-width:100%;max-height:100%;">${imgHtml}</a>`
    : imgHtml

  return `
    ${showTitle ? `<text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(title)}</text>` : ''}
    <!-- EXTERNAL_WIDGET_START: ${escapeXml(processedUrl)} | ${paddingX} | ${imgY} | ${imgW} | ${imgH} | ${mode} | ${fallbackUrl ? escapeXml(fallbackUrl) : ''} -->
    <foreignObject x="${paddingX}" y="${imgY}" width="${imgW}" height="${imgH}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:flex-start;justify-content:flex-start;overflow:hidden;">
        ${innerContentHtml}
      </div>
    </foreignObject>
    <!-- EXTERNAL_WIDGET_END -->
  `
}

export function getWidgetMinSize(
  widget: WidgetInstance,
  data: NormalizedGitHubData
): { width: number; height: number } | null {
  if (widget.widgetId === 'bio') {
    const width = widget.size.width
    const cfg = widget.config
    const customBio =
      cfg.customBio !== undefined ? (cfg.customBio as string) : data.user.bio || 'No bio provided.'
    const maxCharsPerLine = Math.max(20, Math.floor((width - 72) / 8.5))
    const wrappedLines: string[] = []
    for (const p of customBio.split('\n')) {
      if (p.length <= maxCharsPerLine) {
        wrappedLines.push(p)
        continue
      }
      let remaining = p
      while (remaining.length > 0) {
        if (remaining.length <= maxCharsPerLine) {
          wrappedLines.push(remaining)
          break
        }
        let breakPoint = remaining.lastIndexOf(' ', maxCharsPerLine)
        if (breakPoint === -1) {
          breakPoint = maxCharsPerLine
        }
        wrappedLines.push(remaining.substring(0, breakPoint))
        remaining = remaining.substring(breakPoint + 1).trimStart()
      }
    }
    const requiredHeight = 60 + (Math.max(1, wrappedLines.length) - 1) * 20 + 48
    return { width, height: requiredHeight }
  }
  return null
}

export function renderWidgetSvg(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  includeWrapper: boolean = true
): string {
  if (!widget.visible) return ''

  const { x, y } = widget.position
  const { width, height } = widget.size
  const cfg = widget.config

  const bg = (cfg.backgroundColor as string) || globalStyles.backgroundColor || '#1f1f1f'
  const border = (cfg.borderColor as string) || globalStyles.borderColor || '#252525'
  const textClr = (cfg.textColor as string) || globalStyles.textColor || '#ffffff'
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#c5ff4a'
  const rx = cfg.borderRadius !== undefined ? cfg.borderRadius : globalStyles.borderRadius || 0

  let contentSvg = ''

  switch (widget.widgetId) {
    case 'header': {
      const name = escapeXml(data.user.name || data.user.login)
      const handle = escapeXml(`@${data.user.login}`)
      const company = data.user.company ? escapeXml(data.user.company) : ''

      contentSvg = `
        <text x="24" y="44" font-family="${globalStyles.fontFamily}" font-size="28" font-weight="300" fill="${textClr}">${name}</text>
        <text x="24" y="72" font-family="'JetBrains Mono', monospace" font-size="14" fill="${accent}">${handle}</text>
        ${company ? `<text x="${width - 24}" y="44" text-anchor="end" font-family="'Inter Tight', sans-serif" font-size="12" fill="#7a7a7a">[ ${company} ]</text>` : ''}
      `
      break
    }

    case 'avatar': {
      const sourceType = (cfg.sourceType as 'avatar' | 'url' | 'upload') || 'avatar'
      let avatarUrl = data.user.avatar_url

      if (sourceType === 'upload' && cfg.uploadedImageData) {
        avatarUrl = cfg.uploadedImageData as string
      } else if (sourceType === 'url' && cfg.imageUrl) {
        avatarUrl = cfg.imageUrl as string
      } else if (cfg.avatarUrl && !cfg.sourceType) {
        avatarUrl = cfg.avatarUrl as string
      }

      contentSvg = `
        <clipPath id="avatar-clip-${widget.instanceId}">
          <rect class="no-anim" x="16" y="16" width="${width - 32}" height="${height - 32}" rx="${Math.max(4, rx)}" />
        </clipPath>
        <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="${Math.max(4, rx)}" fill="#060606" stroke="${accent}" stroke-width="1.5" />
        <image href="${escapeXml(avatarUrl)}" x="16" y="16" width="${width - 32}" height="${height - 32}" preserveAspectRatio="xMidYMid meet" clip-path="url(#avatar-clip-${widget.instanceId})" />
      `
      break
    }

    case 'ascii-art': {
      const fontSize = Number(cfg.fontSize) || 9
      const charWidth = fontSize * 0.58
      const lineHeight = Math.max(7, Math.round(fontSize * 1.12))
      const colorMode = (cfg.colorMode as string) || 'monochrome'
      const asciiText = Array.isArray(cfg.asciiText) ? (cfg.asciiText as string[]) : undefined
      const asciiColors = Array.isArray(cfg.asciiColors)
        ? (cfg.asciiColors as string[][])
        : undefined

      const asciiLines =
        asciiText ||
        generateAsciiArt(data.user.login, {
          charset: (cfg.charset as string) || 'dense',
          customCharset: cfg.customCharset as string,
          invert: Boolean(cfg.invert),
          cols: Math.floor((width - 32) / charWidth),
          rows: Math.floor((height - 32) / lineHeight),
        })

      const maxCols = Math.max(...asciiLines.map((l) => l.length), 12)
      const viewW = maxCols * charWidth
      const viewH = asciiLines.length * lineHeight

      const xCoords = Array.from({ length: maxCols }, (_, i) => (i * charWidth).toFixed(2)).join(
        ' '
      )
      const fontFamily =
        "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"

      let innerContent = ''

      if (colorMode === 'color' && asciiColors && asciiColors.length === asciiLines.length) {
        innerContent = asciiLines
          .map((line, rowIndex) => {
            const rowColors = asciiColors[rowIndex] || []
            let rowSvg = ''

            for (let charIndex = 0; charIndex < line.length;) {
              let chunk = line[charIndex]
              const charColor = rowColors[charIndex] || accent
              let nextIndex = charIndex + 1
              while (nextIndex < line.length && (rowColors[nextIndex] || accent) === charColor) {
                chunk += line[nextIndex]
                nextIndex++
              }
              rowSvg += `<tspan fill="${charColor}">${escapeXml(chunk)}</tspan>`
              charIndex = nextIndex
            }

            const yPos = (rowIndex + 0.85) * lineHeight
            return `<text x="${xCoords}" y="${yPos}" font-family="${fontFamily}" font-size="${fontSize}" xml:space="preserve">${rowSvg}</text>`
          })
          .join('\n')
      } else {
        innerContent = asciiLines
          .map((line, rowIndex) => {
            const yPos = (rowIndex + 0.85) * lineHeight
            return `<text x="${xCoords}" y="${yPos}" font-family="${fontFamily}" font-size="${fontSize}" fill="${accent}" xml:space="preserve">${escapeXml(line)}</text>`
          })
          .join('\n')
      }

      contentSvg = `
        <svg x="16" y="16" width="${width - 32}" height="${height - 32}" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet">
          ${innerContent}
        </svg>
      `
      break
    }

    case 'ascii-text': {
      const fontSize = Number(cfg.fontSize) || 12
      const charWidth = fontSize * 0.6
      const lineHeight = fontSize * 1.2
      const asciiLines = Array.isArray(cfg.asciiLines)
        ? (cfg.asciiLines as string[])
        : convertTextToAscii(
            (cfg.customText as string) || 'GitAscii',
            (cfg.asciiFont as AsciiFontName) || 'block',
            cfg.charSpacing !== undefined ? Number(cfg.charSpacing) : 1,
            (cfg.charset as string) || 'default',
            (cfg.customCharset as string) || ''
          )

      const maxCols = Math.max(...asciiLines.map((l) => l.length), 1)
      const viewW = maxCols * charWidth
      const viewH = asciiLines.length * lineHeight

      const xCoords = Array.from({ length: maxCols }, (_, i) => (i * charWidth).toFixed(2)).join(
        ' '
      )
      const fontFamily =
        "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace"

      const linesContent = asciiLines
        .map((line, rowIndex) => {
          const yPos = (rowIndex + 0.85) * lineHeight
          return `<text x="${xCoords}" y="${yPos}" font-family="${fontFamily}" font-size="${fontSize}" fill="${accent}" xml:space="preserve">${escapeXml(line)}</text>`
        })
        .join('\n')

      contentSvg = `
        <svg x="16" y="16" width="${width - 32}" height="${height - 32}" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet">
          ${linesContent}
        </svg>
      `
      break
    }

    case 'bio': {
      const customBio =
        cfg.customBio !== undefined
          ? (cfg.customBio as string)
          : data.user.bio || 'No bio provided.'
      const customLocation =
        cfg.customLocation !== undefined ? (cfg.customLocation as string) : data.user.location || ''
      const customBlog =
        cfg.customBlog !== undefined ? (cfg.customBlog as string) : data.user.blog || ''

      const maxCharsPerLine = Math.max(20, Math.floor((width - 72) / 8.5))
      const wrappedLines: string[] = []

      for (const p of customBio.split('\n')) {
        if (p.length <= maxCharsPerLine) {
          wrappedLines.push(p)
          continue
        }
        let remaining = p
        while (remaining.length > 0) {
          if (remaining.length <= maxCharsPerLine) {
            wrappedLines.push(remaining)
            break
          }
          let breakPoint = remaining.lastIndexOf(' ', maxCharsPerLine)
          if (breakPoint === -1) {
            breakPoint = maxCharsPerLine
          }
          wrappedLines.push(remaining.substring(0, breakPoint))
          remaining = remaining.substring(breakPoint + 1).trimStart()
        }
      }

      const bioSvg = wrappedLines
        .map((line, i) => `<tspan x="24" dy="${i === 0 ? 0 : 20}">${escapeXml(line)}</tspan>`)
        .join('')

      const requiredHeight = 60 + (Math.max(1, wrappedLines.length) - 1) * 20 + 48
      const finalHeight = Math.max(height, requiredHeight)

      let blogHref = customBlog
      if (blogHref && !blogHref.startsWith('http://') && !blogHref.startsWith('https://')) {
        blogHref = `https://${blogHref}`
      }

      const locationSvg = customLocation
        ? `<text x="0" y="0" font-family="${globalStyles.fontFamily}" font-size="12" fill="#7a7a7a">📍 ${escapeXml(customLocation)}</text>`
        : ''

      const blogSvg = customBlog
        ? `<a href="${escapeXml(blogHref)}" target="_blank" rel="noopener noreferrer" cursor="pointer">
             <text x="${customLocation ? 180 : 0}" y="0" font-family="${globalStyles.fontFamily}" font-size="12" fill="${accent}" text-decoration="underline">🌐 ${escapeXml(customBlog)}</text>
           </a>`
        : ''

      contentSvg = `
        <text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ BIOGRAPHY ]</text>
        <text x="24" y="60" font-family="${globalStyles.fontFamily}" font-size="14" fill="${textClr}">
          ${bioSvg}
        </text>
        <g transform="translate(24, ${finalHeight - 24})">
          ${locationSvg}
          ${blogSvg}
        </g>
      `
      break
    }

    case 'stats': {
      const hideMetrics: string[] = Array.isArray(cfg.hideMetrics)
        ? (cfg.hideMetrics as string[])
        : []

      const allMetrics = [
        { id: 'stars', label: 'STARS', val: data.totalStars.toLocaleString() },
        { id: 'repos', label: 'REPOS', val: data.user.public_repos.toLocaleString() },
        { id: 'followers', label: 'FOLLOWERS', val: data.user.followers.toLocaleString() },
        { id: 'following', label: 'FOLLOWING', val: data.user.following.toLocaleString() },
        { id: 'forks', label: 'FORKS', val: data.totalForks.toLocaleString() },
        { id: 'gists', label: 'GISTS', val: data.user.public_gists.toLocaleString() },
      ]

      const statItems = allMetrics.filter((m) => !hideMetrics.includes(m.id))
      const statsLayout = (cfg.statsLayout as string) || 'horizontal'
      const statsStyle = (cfg.statsStyle as string) || 'default'
      const labelStyle = (cfg.labelStyle as string) || 'label'
      const valueFontSize = Number(cfg.valueFontSize) || 28

      const getLabel = (m: { label: string }) => (labelStyle === 'none' ? '' : m.label)

      let statsSvg = ''

      if (statsStyle === 'terminal') {
        // Monospaced bracket style: [ 1.2k ]  STARS
        const rowH = 28
        const startY = 48
        const monoFont = `'JetBrains Mono', monospace`
        if (statsLayout === 'horizontal') {
          const itemW = statItems.length > 0 ? (width - 48) / statItems.length : width - 48
          statsSvg = statItems
            .map(
              (m, i) => `
            <g transform="translate(${24 + i * itemW}, ${startY})">
              <text x="0" y="18" font-family="${monoFont}" font-size="13" fill="${accent}">[ ${m.val} ]</text>
              ${labelStyle !== 'none' ? `<text x="0" y="32" font-family="${monoFont}" font-size="9" fill="#7a7a7a" letter-spacing="2">${getLabel(m)}</text>` : ''}
            </g>`
            )
            .join('')
        } else if (statsLayout === 'vertical') {
          statsSvg = statItems
            .map(
              (m, i) => `
            <g transform="translate(24, ${startY + i * 32})">
              <text x="0" y="18" font-family="${monoFont}" font-size="13" fill="${accent}">[ ${m.val} ]</text>
              ${labelStyle !== 'none' ? `<text x="${(m.val.length + 4) * 8 + 4}" y="18" font-family="${monoFont}" font-size="9" fill="#7a7a7a" letter-spacing="2">${getLabel(m)}</text>` : ''}
            </g>`
            )
            .join('')
        } else {
          const colW = (width - 48) / 2
          statsSvg = statItems
            .map(
              (m, i) => `
            <g transform="translate(${24 + (i % 2) * colW}, ${startY + Math.floor(i / 2) * 40})">
              <text x="0" y="18" font-family="${monoFont}" font-size="13" fill="${accent}">[ ${m.val} ]</text>
              ${labelStyle !== 'none' ? `<text x="0" y="30" font-family="${monoFont}" font-size="9" fill="#7a7a7a" letter-spacing="2">${getLabel(m)}</text>` : ''}
            </g>`
            )
            .join('')
        }
      } else if (statsStyle === 'minimal') {
        // Pure values, no decoration
        const fs = valueFontSize
        if (statsLayout === 'horizontal') {
          const itemW = statItems.length > 0 ? (width - 48) / statItems.length : width - 48
          statsSvg = statItems
            .map(
              (m, i) => `
            <text x="${24 + i * itemW}" y="${48 + fs}" font-family="${globalStyles.fontFamily}" font-size="${fs}" font-weight="200" fill="${textClr}">${m.val}</text>`
            )
            .join('')
        } else if (statsLayout === 'vertical') {
          statsSvg = statItems
            .map(
              (m, i) => `
            <text x="24" y="${48 + i * (fs + 12) + fs}" font-family="${globalStyles.fontFamily}" font-size="${Math.min(fs, 22)}" font-weight="200" fill="${textClr}">${m.val}</text>`
            )
            .join('')
        } else {
          const colW = (width - 48) / 2
          statsSvg = statItems
            .map(
              (m, i) => `
            <text x="${24 + (i % 2) * colW}" y="${48 + Math.floor(i / 2) * (Math.min(fs, 24) + 8) + Math.min(fs, 24)}" font-family="${globalStyles.fontFamily}" font-size="${Math.min(fs, 24)}" font-weight="200" fill="${textClr}">${m.val}</text>`
            )
            .join('')
        }
      } else if (statsStyle === 'cards') {
        // Each metric in a pill card
        const cardH = 52
        const gap = 8
        const cols = statsLayout === 'vertical' ? 1 : 2
        const cardW = cols === 1 ? width - 48 : Math.floor((width - 48 - gap) / 2)
        statsSvg = statItems
          .map((m, i) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            const cx = 24 + col * (cardW + gap)
            const cy = 44 + row * (cardH + gap)
            return `
            <g transform="translate(${cx}, ${cy})">
              <rect x="0" y="0" width="${cardW}" height="${cardH}" fill="#1e1e1e" rx="6" />
              <rect x="0" y="0" width="3" height="${cardH}" fill="${accent}" rx="1" />
              <text x="12" y="22" font-family="${globalStyles.fontFamily}" font-size="${Math.min(valueFontSize, 22)}" font-weight="300" fill="${accent}">${m.val}</text>
              ${labelStyle !== 'none' ? `<text x="12" y="42" font-family="${globalStyles.fontFamily}" font-size="9" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
            </g>`
          })
          .join('')
      } else {
        // default: big numbers
        if (statsLayout === 'horizontal') {
          const itemWidth = statItems.length > 0 ? (width - 48) / statItems.length : width - 48
          statsSvg = statItems
            .map(
              (m, i) => `
            <g transform="translate(${24 + i * itemWidth}, 48)">
              <text x="0" y="${valueFontSize}" font-family="${globalStyles.fontFamily}" font-size="${valueFontSize}" font-weight="300" fill="${accent}">${m.val}</text>
              ${labelStyle !== 'none' ? `<text x="0" y="${valueFontSize + 18}" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
            </g>`
            )
            .join('')
        } else if (statsLayout === 'vertical') {
          statsSvg = statItems
            .map(
              (m, i) => `
            <g transform="translate(24, ${48 + i * 52})">
              <text x="0" y="28" font-family="${globalStyles.fontFamily}" font-size="${Math.min(valueFontSize, 24)}" font-weight="300" fill="${accent}">${m.val}</text>
              ${labelStyle !== 'none' ? `<text x="${Math.min(valueFontSize, 24) * (m.val.length * 0.6) + 8}" y="28" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
            </g>`
            )
            .join('')
        } else {
          const colW = (width - 48) / 2
          statsSvg = statItems
            .map(
              (m, i) => `
            <g transform="translate(${24 + (i % 2) * colW}, ${48 + Math.floor(i / 2) * 60})">
              <text x="0" y="${Math.min(valueFontSize, 26)}" font-family="${globalStyles.fontFamily}" font-size="${Math.min(valueFontSize, 26)}" font-weight="300" fill="${accent}">${m.val}</text>
              ${labelStyle !== 'none' ? `<text x="0" y="${Math.min(valueFontSize, 26) + 16}" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${getLabel(m)}</text>` : ''}
            </g>`
            )
            .join('')
        }
      }

      contentSvg = `
        <text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ GITHUB METRICS ]</text>
        ${statsSvg}
      `
      break
    }

    case 'languages': {
      const hideLangsArr: string[] = Array.isArray(cfg.hideLangsArr)
        ? (cfg.hideLangsArr as string[])
        : []
      const hideLangsStr =
        typeof cfg.hideLangs === 'string'
          ? (cfg.hideLangs as string)
              .split(',')
              .map((l) => l.trim().toLowerCase())
              .filter(Boolean)
          : []
      const hideLangs = [...hideLangsArr.map((l) => l.toLowerCase()), ...hideLangsStr]

      let filteredLangs = Object.entries(data.languages)
      if (hideLangs.length > 0) {
        filteredLangs = filteredLangs.filter(([lang]) => !hideLangs.includes(lang.toLowerCase()))
      }

      const maxLangs = Number(cfg.langsCount) || 5
      const topLangs = filteredLangs.slice(0, maxLangs)
      const totalCount = topLangs.reduce((sum, [_, count]) => sum + count, 0) || 1
      const showPercentage = cfg.showPercentage !== false
      const langsLayout = (cfg.langsLayout as string) || 'bars'

      const langColors: Record<string, string> = {
        TypeScript: '#3178c6',
        JavaScript: '#f1e05a',
        Rust: '#dea584',
        Python: '#3572A5',
        CSS: '#563d7c',
        HTML: '#e34c26',
        Go: '#00ADD8',
        Java: '#b07219',
        Ruby: '#701516',
        'C++': '#f34b7d',
        'C#': '#239120',
        PHP: '#4F5D95',
        Swift: '#F05138',
        Kotlin: '#A97BFF',
        Dart: '#00B4AB',
        Shell: '#89e051',
        Vue: '#41b883',
        Svelte: '#ff3e00',
      }

      const getColor = (lang: string) => langColors[lang] || accent

      let langsSvg = ''

      if (langsLayout === 'bars' || langsLayout === undefined) {
        let currentX = 24
        const barWidth = width - 48
        const barSvg = topLangs
          .map(([lang, count]) => {
            const w = (count / totalCount) * barWidth
            const rect = `<rect x="${currentX}" y="52" width="${w}" height="8" fill="${getColor(lang)}" rx="2" />`
            currentX += w
            return rect
          })
          .join('')

        const legendSvg = topLangs
          .map(([lang, count], i) => {
            const pct = Math.round((count / totalCount) * 100)
            return `
          <g transform="translate(${24 + (i % 2) * (barWidth / 2)}, ${80 + Math.floor(i / 2) * 24})">
            <circle cx="6" cy="-4" r="4" fill="${getColor(lang)}" />
            <text x="16" y="0" font-family="'Inter Tight', sans-serif" font-size="12" fill="${textClr}">${lang} ${showPercentage ? `<tspan fill="#7a7a7a">${pct}%</tspan>` : ''}</text>
          </g>
        `
          })
          .join('')

        langsSvg = `${barSvg}${legendSvg}`
      } else if (langsLayout === 'list') {
        const barW = width - 48
        langsSvg = topLangs
          .map(([lang, count], i) => {
            const pct = Math.round((count / totalCount) * 100)
            const fillW = (count / totalCount) * (barW - 100)
            return `
          <g transform="translate(24, ${48 + i * 26})">
            <circle cx="6" cy="8" r="4" fill="${getColor(lang)}" />
            <text x="18" y="14" font-family="'Inter Tight', sans-serif" font-size="12" fill="${textClr}">${escapeXml(lang)}</text>
            ${showPercentage ? `<text x="${barW - 36}" y="14" text-anchor="end" font-family="'Inter Tight', sans-serif" font-size="11" fill="#7a7a7a">${pct}%</text>` : ''}
            <rect x="0" y="20" width="${barW - 36}" height="3" fill="#252525" rx="1" />
            <rect x="0" y="20" width="${fillW}" height="3" fill="${getColor(lang)}" rx="1" />
          </g>
        `
          })
          .join('')
      } else if (langsLayout === 'compact') {
        const itemW = (width - 48) / Math.min(topLangs.length, 3)
        langsSvg = topLangs
          .map(([lang, count], i) => {
            const pct = Math.round((count / totalCount) * 100)
            return `
          <g transform="translate(${24 + (i % 3) * itemW}, ${48 + Math.floor(i / 3) * 52})">
            <circle cx="6" cy="8" r="5" fill="${getColor(lang)}" />
            <text x="16" y="14" font-family="'Inter Tight', sans-serif" font-size="11" fill="${textClr}">${escapeXml(lang)}</text>
            ${showPercentage ? `<text x="16" y="30" font-family="'Inter Tight', sans-serif" font-size="10" fill="#7a7a7a">${pct}%</text>` : ''}
          </g>
        `
          })
          .join('')
      } else if (langsLayout === 'donut') {
        const donutLegendPos = (cfg.donutLegendPos as string) || 'bottom'
        const donutShowPct = cfg.donutShowPct !== false
        const donutCenterLabel = Boolean(cfg.donutCenterLabel)

        const donutR =
          donutLegendPos === 'side' ? Math.min(width / 4, 60) : Math.min((width - 48) / 2, 60)
        const donutRi = Math.round(donutR * 0.52)
        const donutCx = donutLegendPos === 'side' ? 24 + donutR + 4 : width / 2
        const donutCy = 44 + donutR

        let startAngle = -Math.PI / 2
        const arcsSvg = topLangs
          .map(([lang, count]) => {
            const fraction = count / totalCount
            const angle = fraction * 2 * Math.PI
            const endAngle = startAngle + angle
            const x1 = donutCx + donutR * Math.cos(startAngle)
            const y1 = donutCy + donutR * Math.sin(startAngle)
            const x2 = donutCx + donutR * Math.cos(endAngle)
            const y2 = donutCy + donutR * Math.sin(endAngle)
            const xi1 = donutCx + donutRi * Math.cos(startAngle)
            const yi1 = donutCy + donutRi * Math.sin(startAngle)
            const xi2 = donutCx + donutRi * Math.cos(endAngle)
            const yi2 = donutCy + donutRi * Math.sin(endAngle)
            const large = angle > Math.PI ? 1 : 0
            const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${donutR} ${donutR} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${xi2.toFixed(1)} ${yi2.toFixed(1)} A ${donutRi} ${donutRi} 0 ${large} 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z`
            startAngle = endAngle
            return `<path d="${path}" fill="${getColor(lang)}" />`
          })
          .join('')

        // Center label — biggest language
        const centerSvg =
          donutCenterLabel && topLangs.length > 0
            ? `<text x="${donutCx}" y="${donutCy + 4}" text-anchor="middle" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="600" fill="${textClr}">${escapeXml(topLangs[0][0])}</text>`
            : ''

        // Legend
        let legendSvg = ''
        if (donutLegendPos === 'bottom') {
          const legendStartY = donutCy + donutR + 16
          const lW = width - 48
          legendSvg = topLangs
            .map(([lang, count], i) => {
              const pct = Math.round((count / totalCount) * 100)
              return `
              <g transform="translate(${24 + (i % 2) * (lW / 2)}, ${legendStartY + Math.floor(i / 2) * 22})">
                <circle cx="6" cy="-4" r="4" fill="${getColor(lang)}" />
                <text x="16" y="0" font-family="'Inter Tight', sans-serif" font-size="11" fill="${textClr}">${escapeXml(lang)}${donutShowPct ? ` <tspan fill="#7a7a7a">${pct}%</tspan>` : ''}</text>
              </g>`
            })
            .join('')
        } else if (donutLegendPos === 'side') {
          const legendX = donutCx + donutR + 16
          legendSvg = topLangs
            .slice(0, 6)
            .map(([lang, count], i) => {
              const pct = Math.round((count / totalCount) * 100)
              return `
              <g transform="translate(${legendX}, ${donutCy - donutR + i * 22})">
                <circle cx="6" cy="-4" r="4" fill="${getColor(lang)}" />
                <text x="16" y="0" font-family="'Inter Tight', sans-serif" font-size="10" fill="${textClr}">${escapeXml(lang.length > 10 ? lang.slice(0, 9) + '…' : lang)}${donutShowPct ? ` <tspan fill="#7a7a7a">${pct}%</tspan>` : ''}</text>
              </g>`
            })
            .join('')
        }

        langsSvg = `${arcsSvg}${centerSvg}${legendSvg}`
      }

      contentSvg = `
        <text x="24" y="32" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ TOP LANGUAGES ]</text>
        ${langsSvg}
      `
      break
    }

    case 'repositories': {
      const selectedRepos: string[] = Array.isArray(cfg.selectedRepos)
        ? (cfg.selectedRepos as string[])
        : []
      const maxRepos = Number(cfg.maxRepos) || 3
      const repoViewMode = (cfg.repoViewMode as string) || 'list'
      const repoSortBy = (cfg.repoSortBy as string) || 'stars'
      const showRepoLanguage = cfg.showRepoLanguage !== false
      const showRepoForks = Boolean(cfg.showRepoForks)

      // Resolve repo list
      let repoList = [...data.repos].filter((r) => !r.fork)

      if (selectedRepos.length > 0) {
        // Use user-specified order
        const ordered = selectedRepos
          .map((name) => repoList.find((r) => r.name === name))
          .filter(Boolean) as typeof repoList
        const rest = repoList.filter((r) => !selectedRepos.includes(r.name))
        repoList = [...ordered, ...rest]
      } else {
        // Auto sort
        if (repoSortBy === 'updated') {
          repoList.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
        } else if (repoSortBy === 'forks') {
          repoList.sort((a, b) => b.forks_count - a.forks_count)
        } else if (repoSortBy === 'name') {
          repoList.sort((a, b) => a.name.localeCompare(b.name))
        } else {
          repoList.sort((a, b) => b.stargazers_count - a.stargazers_count)
        }
      }

      const repos = repoList.slice(0, maxRepos)

      if (repoViewMode === 'grid') {
        const cols = 2
        const cardW = Math.floor((width - 48 - 12) / cols)
        const cardH = 80
        const gapY = 12

        contentSvg = `
          <text x="24" y="32" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ FEATURED REPOSITORIES ]</text>
          ${repos
            .map(
              (repo, i) => `
            <g transform="translate(${24 + (i % cols) * (cardW + 12)}, ${50 + Math.floor(i / cols) * (cardH + gapY)})">
              <rect x="0" y="0" width="${cardW}" height="${cardH}" fill="#1e1e1e" rx="4" />
              <rect x="0" y="0" width="4" height="${cardH}" fill="${accent}" rx="2" />
              <text x="12" y="20" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="500" fill="${accent}">${escapeXml(repo.name.length > 18 ? repo.name.slice(0, 16) + '…' : repo.name)}</text>
              <text x="${cardW - 8}" y="20" text-anchor="end" font-family="'Inter Tight', sans-serif" font-size="11" fill="#7a7a7a">★ ${repo.stargazers_count}</text>
              <text x="12" y="38" font-family="'Inter Tight', sans-serif" font-size="10" fill="#7a7a7a">${escapeXml((repo.description || 'No description.').slice(0, 40) + ((repo.description || '').length > 40 ? '…' : ''))}</text>
              ${showRepoLanguage && repo.language ? `<text x="12" y="${cardH - 10}" font-family="'Inter Tight', sans-serif" font-size="10" fill="${accent}">${escapeXml(repo.language)}</text>` : ''}
              ${showRepoForks ? `<text x="${cardW - 8}" y="${cardH - 10}" text-anchor="end" font-family="'Inter Tight', sans-serif" font-size="10" fill="#7a7a7a">⑂ ${repo.forks_count}</text>` : ''}
            </g>
          `
            )
            .join('')}
        `
      } else {
        // list mode — adaptive card height based on enabled fields
        const showRepoStars = cfg.showRepoStars !== false
        const showRepoDesc = cfg.showRepoDesc !== false
        const showRepoUpdated = Boolean(cfg.showRepoUpdated)

        // Compute card height: name row always shown (20px top)
        // desc line: +18, language/meta line: +14, updated: +14
        const metaLineNeeded = showRepoLanguage || showRepoForks || showRepoStars || showRepoUpdated
        const cardH = 24 + (showRepoDesc ? 18 : 0) + (metaLineNeeded ? 18 : 0) + 8
        const rowSpacing = cardH + 8

        contentSvg = `
          <text x="24" y="32" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ FEATURED REPOSITORIES ]</text>
          ${repos
            .map((repo, i) => {
              const gy = 50 + i * rowSpacing
              const metaParts: string[] = []
              if (showRepoLanguage && repo.language) metaParts.push(repo.language)
              if (showRepoStars) metaParts.push(`\u2605 ${repo.stargazers_count}`)
              if (showRepoForks) metaParts.push(`\u2442 ${repo.forks_count}`)
              if (showRepoUpdated) {
                const d = new Date(repo.updated_at)
                metaParts.push(
                  `Updated ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                )
              }
              const metaStr = escapeXml(metaParts.join('  '))

              let yOff = 20
              const nameRow = `<text x="12" y="${yOff}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="500" fill="${accent}">${escapeXml(repo.name.length > 36 ? repo.name.slice(0, 34) + '\u2026' : repo.name)}</text>`
              yOff += showRepoDesc ? 18 : 0
              const descRow = showRepoDesc
                ? `<text x="12" y="${yOff}" font-family="'Inter Tight', sans-serif" font-size="10" fill="#7a7a7a">${escapeXml((repo.description || 'No description.').slice(0, 68) + ((repo.description || '').length > 68 ? '\u2026' : ''))}</text>`
                : ''
              yOff += metaLineNeeded ? 18 : 0
              const metaRow = metaLineNeeded
                ? `<text x="12" y="${yOff}" font-family="'Inter Tight', sans-serif" font-size="10" fill="${accent}">${metaStr}</text>`
                : ''

              return `
            <g transform="translate(24, ${gy})">
              <rect x="0" y="0" width="${width - 48}" height="${cardH}" fill="#1e1e1e" rx="4" />
              <rect x="0" y="0" width="3" height="${cardH}" fill="${accent}" rx="1" />
              ${nameRow}${descRow}${metaRow}
            </g>`
            })
            .join('')}
        `
      }
      break
    }

    case 'divider': {
      contentSvg = `<line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="${accent}" stroke-width="4" />`
      break
    }

    case 'footer': {
      contentSvg = `
        <rect x="0" y="0" width="${width}" height="${height}" fill="#000000" />
        <text x="24" y="${height / 2 + 4}" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ GENERATED BY GITASCII ]</text>
        <text x="${width - 24}" y="${height / 2 + 4}" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="11" fill="${accent}">${APP_DOMAIN}/${data.user.login}</text>
      `
      break
    }

    case 'tech-stack': {
      const selectedTechs =
        Array.isArray(cfg.selectedTechs) && cfg.selectedTechs.length > 0
          ? (cfg.selectedTechs as string[])
          : [
              'js',
              'ts',
              'react',
              'nextjs',
              'nodejs',
              'tailwind',
              'python',
              'docker',
              'git',
              'postgres',
            ]

      const theme = (cfg.theme as string) || 'dark'
      const perLine = Number(cfg.perLine) || 12
      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ TECHNOLOGIES & SKILLS ]'

      const mappedTechs = selectedTechs.map((t) => (t === 'reactnative' ? 'react' : t))
      const uniqueTechs = Array.from(new Set(mappedTechs))
      const techString = uniqueTechs.join(',')
      const skillIconsUrl = `https://skillicons.dev/icons?i=${techString}&theme=${theme}&perline=${perLine}`

      const titleY = 32
      const imageY = showTitle ? 44 : 16
      const imageWidth = width - 48
      const imageHeight = Math.max(40, height - imageY - 16)

      contentSvg = `
        ${showTitle ? `<text x="24" y="${titleY}" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(customTitle)}</text>` : ''}
        <image href="${escapeXml(skillIconsUrl)}" x="24" y="${imageY}" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="xMinYMin meet" />
      `
      break
    }

    case 'social-media': {
      const selectedSocials =
        Array.isArray(cfg.selectedSocials) && cfg.selectedSocials.length > 0
          ? (cfg.selectedSocials as string[])
          : ['github', 'linkedin', 'twitter', 'discord', 'youtube', 'website']

      const socialUrls = (cfg.socialUrls as Record<string, string>) || {}
      const badgeStyle = (cfg.badgeStyle as string) || 'for-the-badge'
      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ SOCIAL MEDIA ]'
      const theme = (cfg.theme as string) || 'dark'

      const titleY = 32
      const startY = showTitle ? 44 : 16

      if (badgeStyle === 'skillicons') {
        const socialTechString = selectedSocials.join(',')
        const skillIconsUrl = `https://skillicons.dev/icons?i=${socialTechString}&theme=${theme}&perline=12`
        const imageWidth = width - 48
        const imageHeight = Math.max(40, height - startY - 16)

        contentSvg = `
          ${showTitle ? `<text x="24" y="${titleY}" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(customTitle)}</text>` : ''}
          <image href="${escapeXml(skillIconsUrl)}" x="24" y="${startY}" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="xMinYMin meet" />
        `
      } else {
        const socialPlatformsMap: Record<
          string,
          { label: string; logo: string; color: string; defaultUrl: string }
        > = {
          github: {
            label: 'GitHub',
            logo: 'github',
            color: '181717',
            defaultUrl: 'https://github.com/{username}',
          },
          linkedin: {
            label: 'LinkedIn',
            logo: 'linkedin',
            color: '0A66C2',
            defaultUrl: 'https://linkedin.com/in/{username}',
          },
          twitter: {
            label: 'X',
            logo: 'x',
            color: '000000',
            defaultUrl: 'https://x.com/{username}',
          },
          discord: {
            label: 'Discord',
            logo: 'discord',
            color: '5865F2',
            defaultUrl: 'https://discord.gg/yourserver',
          },
          youtube: {
            label: 'YouTube',
            logo: 'youtube',
            color: 'FF0000',
            defaultUrl: 'https://youtube.com/@{username}',
          },
          instagram: {
            label: 'Instagram',
            logo: 'instagram',
            color: 'E4405F',
            defaultUrl: 'https://instagram.com/{username}',
          },
          twitch: {
            label: 'Twitch',
            logo: 'twitch',
            color: '9146FF',
            defaultUrl: 'https://twitch.tv/{username}',
          },
          devto: {
            label: 'Dev.to',
            logo: 'devto',
            color: '0A0A0A',
            defaultUrl: 'https://dev.to/{username}',
          },
          medium: {
            label: 'Medium',
            logo: 'medium',
            color: '000000',
            defaultUrl: 'https://medium.com/@{username}',
          },
          email: {
            label: 'Email',
            logo: 'gmail',
            color: 'EA4335',
            defaultUrl: 'mailto:user@example.com',
          },
          website: {
            label: 'Portfolio',
            logo: 'googlechrome',
            color: '2563EB',
            defaultUrl: 'https://{username}.dev',
          },
          stackoverflow: {
            label: 'StackOverflow',
            logo: 'stackoverflow',
            color: 'F48024',
            defaultUrl: 'https://stackoverflow.com/users/{username}',
          },
          bluesky: {
            label: 'Bluesky',
            logo: 'bluesky',
            color: '1185FE',
            defaultUrl: 'https://bsky.app/profile/{username}',
          },
          mastodon: {
            label: 'Mastodon',
            logo: 'mastodon',
            color: '6364FF',
            defaultUrl: 'https://mastodon.social/@{username}',
          },
          reddit: {
            label: 'Reddit',
            logo: 'reddit',
            color: 'FF4500',
            defaultUrl: 'https://reddit.com/user/{username}',
          },
          spotify: {
            label: 'Spotify',
            logo: 'spotify',
            color: '1DB954',
            defaultUrl: 'https://open.spotify.com/user/{username}',
          },
          telegram: {
            label: 'Telegram',
            logo: 'telegram',
            color: '26A5E4',
            defaultUrl: 'https://t.me/{username}',
          },
          tiktok: {
            label: 'TikTok',
            logo: 'tiktok',
            color: '000000',
            defaultUrl: 'https://tiktok.com/@{username}',
          },
          steam: {
            label: 'Steam',
            logo: 'steam',
            color: '000000',
            defaultUrl: 'https://steamcommunity.com/id/{username}',
          },
          hashnode: {
            label: 'Hashnode',
            logo: 'hashnode',
            color: '2962FF',
            defaultUrl: 'https://hashnode.com/@{username}',
          },
        }

        const badgeH = badgeStyle === 'for-the-badge' ? 28 : 22
        const gapX = 10
        const gapY = 10
        const maxX = width - 24

        let currentX = 24
        let currentY = startY

        const badgesSvg = selectedSocials
          .map((platformId) => {
            const p = socialPlatformsMap[platformId]
            if (!p) return ''

            const label = p.label
            const badgeW =
              badgeStyle === 'for-the-badge'
                ? Math.max(64, Math.round(54 + label.length * 7.6))
                : Math.max(50, Math.round(40 + label.length * 6.2))

            if (currentX + badgeW > maxX && currentX > 24) {
              currentX = 24
              currentY += badgeH + gapY
            }

            const posX = currentX
            currentX += badgeW + gapX

            const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(label)}-${p.color}?style=${badgeStyle}&logo=${p.logo}&logoColor=white`
            const targetUrl =
              socialUrls[platformId] || p.defaultUrl.replace('{username}', data.user.login)

            return `
            <a href="${escapeXml(targetUrl)}" target="_blank" rel="noopener noreferrer" cursor="pointer">
              <image href="${escapeXml(badgeUrl)}" x="${posX}" y="${currentY}" width="${badgeW}" height="${badgeH}" preserveAspectRatio="xMinYMid meet" />
            </a>
          `
          })
          .join('')

        contentSvg = `
          ${showTitle ? `<text x="24" y="${titleY}" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(customTitle)}</text>` : ''}
          ${badgesSvg}
        `
      }
      break
    }

    case 'terminal-info':
    case 'terminal-card': {
      const showMainSection = cfg.showMainSection !== false
      const showContactSection = cfg.showContactSection !== false
      const showStatsSection = cfg.showStatsSection !== false

      const showUptime = cfg.showUptime !== false
      const showLocation = cfg.showLocation !== false
      const showCompany = cfg.showCompany !== false
      const showLanguages = cfg.showLanguages !== false
      const showJoined = Boolean(cfg.showJoined)
      const showStatus = Boolean(cfg.showStatus)
      const showPronouns = Boolean(cfg.showPronouns)
      const showTimezone = Boolean(cfg.showTimezone)
      const showAchievements = Boolean(cfg.showAchievements)
      const showHighlights = Boolean(cfg.showHighlights)

      const showWebsite = cfg.showWebsite !== false
      const showGithub = cfg.showGithub !== false
      const showTwitter = Boolean(cfg.showTwitter)
      const showEmail = Boolean(cfg.showEmail)
      const showOrgs = Boolean(cfg.showOrgs)

      const showRepos = cfg.showRepos !== false
      const showStars = cfg.showStars !== false
      const showCommits = cfg.showCommits !== false
      const showFollowers = cfg.showFollowers !== false
      const showFollowing = Boolean(cfg.showFollowing)
      const showGists = Boolean(cfg.showGists)

      const dotLeaders = cfg.dotLeaders !== false

      const headerClr = (cfg.headerColor as string) || '#58a6ff'
      const labelClr = (cfg.labelColor as string) || '#ffa657'
      const dotClr = (cfg.dotColor as string) || '#484f58'
      const valClr = (cfg.valueColor as string) || '#c9d1d9'
      const statsValClr = (cfg.statsValColor as string) || '#79c0ff'
      const dividerClr = (cfg.dividerColor as string) || '#3d444d'

      const fontSize = 14
      const fontCharWidth = fontSize * 0.6
      const paddingX = 24
      const totalChars = Math.max(26, Math.floor((width - paddingX * 2) / fontCharWidth))
      const lineHeight = Math.max(18, Math.floor(fontSize * 1.35))

      const lines: string[] = []
      let currentY = 28

      if (showMainSection) {
        const titleStr = (cfg.customTitle as string) || `${data.user.login}@github`
        const dashesCount = Math.max(2, totalChars - 1 - (titleStr.length + 2))
        const dashesStr = '─'.repeat(dashesCount)

        lines.push(
          `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${dividerClr}">─</tspan><tspan fill="${headerClr}"> ${escapeXml(titleStr)} </tspan><tspan fill="${dividerClr}">${dashesStr}</tspan></text>`
        )
        currentY += lineHeight

        const mainItems: Array<{ label: string; val: string }> = []

        if (showUptime) {
          const uptimeVal = (cfg.customUptime as string) || formatUptime(data.user.created_at)
          if (uptimeVal) mainItems.push({ label: '. Uptime: ', val: ` ${uptimeVal}` })
        }
        if (showLocation) {
          const locVal = (cfg.customLocation as string) || data.user.location
          if (locVal) mainItems.push({ label: '. Location: ', val: ` ${locVal}` })
        }
        if (showCompany) {
          const compVal = (cfg.customCompany as string) || data.user.company
          if (compVal) mainItems.push({ label: '. Company: ', val: ` ${compVal}` })
        }
        if (showLanguages) {
          const topLangs =
            (cfg.customLanguages as string) ||
            (Object.keys(data.languages).length > 0
              ? Object.keys(data.languages).slice(0, 5).join(', ')
              : '')
          if (topLangs) mainItems.push({ label: '. Languages: ', val: ` ${topLangs}` })
        }
        if (showJoined) {
          const joinedVal =
            (cfg.customJoined as string) ||
            (data.user.created_at
              ? new Date(data.user.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : '')
          if (joinedVal) mainItems.push({ label: '. Joined: ', val: ` ${joinedVal}` })
        }
        if (showStatus) {
          const statusVal = cfg.customStatus as string
          if (statusVal) mainItems.push({ label: '. Status: ', val: ` ${statusVal}` })
        }
        if (showPronouns) {
          const pronounsVal = cfg.customPronouns as string
          if (pronounsVal) mainItems.push({ label: '. Pronouns: ', val: ` ${pronounsVal}` })
        }
        if (showTimezone) {
          const tzVal = cfg.customTimezone as string
          if (tzVal) mainItems.push({ label: '. Timezone: ', val: ` ${tzVal}` })
        }
        if (showAchievements) {
          const achVal = cfg.customAchievements as string
          if (achVal) mainItems.push({ label: '. Achievements: ', val: ` ${achVal}` })
        }
        if (showHighlights) {
          const hlVal = cfg.customHighlights as string
          if (hlVal) mainItems.push({ label: '. Highlights: ', val: ` ${hlVal}` })
        }

        for (const item of mainItems) {
          const dotCount = dotLeaders
            ? Math.max(2, totalChars - item.label.length - item.val.length)
            : 2
          const dotsStr = dotLeaders ? '.'.repeat(dotCount) : '  '

          lines.push(
            `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${labelClr}">${escapeXml(item.label)}</tspan><tspan fill="${dotClr}">${dotsStr}</tspan><tspan fill="${valClr}">${escapeXml(item.val)}</tspan></text>`
          )
          currentY += lineHeight
        }
        currentY += 12
      }

      if (showContactSection) {
        const contactTitleStr = (cfg.customContactTitle as string) || 'Contact'
        const dashesCount = Math.max(2, totalChars - 1 - (contactTitleStr.length + 2))
        const dashesStr = '─'.repeat(dashesCount)

        lines.push(
          `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${dividerClr}">─</tspan><tspan fill="${headerClr}"> ${escapeXml(contactTitleStr)} </tspan><tspan fill="${dividerClr}">${dashesStr}</tspan></text>`
        )
        currentY += lineHeight

        const contactItems: Array<{ label: string; val: string }> = []

        if (showWebsite) {
          const webVal = (cfg.customWebsite as string) || data.user.blog
          if (webVal) contactItems.push({ label: '. Website: ', val: ` ${webVal}` })
        }
        if (showGithub) {
          const ghVal = (cfg.customGithub as string) || `github.com/${data.user.login}`
          if (ghVal) contactItems.push({ label: '. GitHub: ', val: ` ${ghVal}` })
        }
        if (showTwitter) {
          const twVal =
            (cfg.customTwitter as string) ||
            (data.user.twitter_username ? `@${data.user.twitter_username}` : '')
          if (twVal) contactItems.push({ label: '. Twitter: ', val: ` ${twVal}` })
        }
        if (showEmail) {
          const emVal = (cfg.customEmail as string) || data.user.email
          if (emVal) contactItems.push({ label: '. Email: ', val: ` ${emVal}` })
        }
        if (showOrgs) {
          const orgsVal = cfg.customOrgs as string
          if (orgsVal) contactItems.push({ label: '. Orgs: ', val: ` ${orgsVal}` })
        }

        for (const item of contactItems) {
          const dotCount = dotLeaders
            ? Math.max(2, totalChars - item.label.length - item.val.length)
            : 2
          const dotsStr = dotLeaders ? '.'.repeat(dotCount) : '  '

          lines.push(
            `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${labelClr}">${escapeXml(item.label)}</tspan><tspan fill="${dotClr}">${dotsStr}</tspan><tspan fill="${valClr}">${escapeXml(item.val)}</tspan></text>`
          )
          currentY += lineHeight
        }
        currentY += 12
      }

      if (showStatsSection) {
        const statsTitleStr = (cfg.customStatsTitle as string) || 'GitHub Stats'
        const dashesCount = Math.max(2, totalChars - 1 - (statsTitleStr.length + 2))
        const dashesStr = '─'.repeat(dashesCount)

        lines.push(
          `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${dividerClr}">─</tspan><tspan fill="${headerClr}"> ${escapeXml(statsTitleStr)} </tspan><tspan fill="${dividerClr}">${dashesStr}</tspan></text>`
        )
        currentY += lineHeight

        const statFields: Array<{ label: string; val: string }> = []

        if (showRepos) {
          statFields.push({ label: '. Repos: ', val: ` ${data.user.public_repos}` })
        }
        if (showStars) {
          statFields.push({ label: '. Stars: ', val: ` ${data.totalStars}` })
        }
        if (showCommits) {
          const commitCount =
            (cfg.customCommits as string) ||
            (data.contributions ? data.contributions.totalContributions.toLocaleString() : '')
          if (commitCount) statFields.push({ label: '. Commits: ', val: ` ${commitCount}` })
        }
        if (showFollowers) {
          statFields.push({ label: '. Followers: ', val: ` ${data.user.followers}` })
        }
        if (showFollowing) {
          const followingCount =
            (cfg.customFollowing as string) ||
            (data.user.following !== undefined ? data.user.following.toLocaleString() : '')
          if (followingCount) statFields.push({ label: '. Following: ', val: ` ${followingCount}` })
        }
        if (showGists) {
          const gistsCount =
            (cfg.customGists as string) ||
            (data.user.public_gists !== undefined ? data.user.public_gists.toLocaleString() : '')
          if (gistsCount) statFields.push({ label: '. Gists: ', val: ` ${gistsCount}` })
        }

        for (let i = 0; i < statFields.length; i += 2) {
          const item1 = statFields[i]
          const item2 = statFields[i + 1]

          if (item1 && item2) {
            const halfChars = Math.floor((totalChars - 3) / 2)
            const dots1 = dotLeaders
              ? Math.max(2, halfChars - item1.label.length - item1.val.length)
              : 2
            const dots2 = dotLeaders
              ? Math.max(2, halfChars - item2.label.length - item2.val.length)
              : 2

            lines.push(
              `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${labelClr}">${escapeXml(item1.label)}</tspan><tspan fill="${dotClr}">${'.'.repeat(dots1)}</tspan><tspan fill="${statsValClr}">${escapeXml(item1.val)}</tspan><tspan fill="${dividerClr}"> | </tspan><tspan fill="${labelClr}">${escapeXml(item2.label)}</tspan><tspan fill="${dotClr}">${'.'.repeat(dots2)}</tspan><tspan fill="${statsValClr}">${escapeXml(item2.val)}</tspan></text>`
            )
          } else if (item1) {
            const dots1 = dotLeaders
              ? Math.max(2, totalChars - item1.label.length - item1.val.length)
              : 2
            lines.push(
              `<text x="${paddingX}" y="${currentY}" font-family="'Consolas', 'Menlo', 'DejaVu Sans Mono', 'JetBrains Mono', monospace" xml:space="preserve" font-size="${fontSize}"><tspan fill="${labelClr}">${escapeXml(item1.label)}</tspan><tspan fill="${dotClr}">${'.'.repeat(dots1)}</tspan><tspan fill="${statsValClr}">${escapeXml(item1.val)}</tspan></text>`
            )
          }
          currentY += lineHeight
        }
      }

      contentSvg = lines.join('\n')
      break
    }

    case 'gitfest-lineup': {
      const username = (cfg.username as string) || data.user.login
      const theme = (cfg.theme as string) || 'dark'
      const sort = (cfg.sort as string) || 'stars'
      const order = (cfg.order as string) || 'asc'
      const type = (cfg.type as string) || 'owner'
      const invertColors = Boolean(cfg.invertColors)
      const hideRepos = (cfg.hideRepos as string) || ''

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ GITFEST LINEUP ]'

      const baseUrl = process.env.NEXT_PUBLIC_GITFEST_URL || 'http://localhost:3000'
      const statsUrl = `${baseUrl}/api/lineup?username=${encodeURIComponent(username)}&theme=${theme}&sort=${sort}&order=${order}&type=${type}${invertColors ? '&invertColors=true' : ''}${hideRepos ? `&hideRepos=${encodeURIComponent(hideRepos)}` : ''}`

      contentSvg = renderExternalWidgetSvg(
        statsUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        globalStyles.accentColor || '',
        'contain'
      )
      break
    }

    case 'github-readme-stats': {
      const username = (cfg.username as string) || data.user.login
      const statType = (cfg.statType as string) || 'stats'
      const theme = (cfg.theme as string) || 'dark'
      const showIcons = cfg.showIcons !== false
      const countPrivate = Boolean(cfg.countPrivate)
      const includeAllCommits = Boolean(cfg.includeAllCommits)
      const hideRank = Boolean(cfg.hideRank)
      const hideBorder = Boolean(cfg.hideBorder)
      const repoName = (cfg.repoName as string) || data.repos[0]?.name || 'gitascii'
      const layout = (cfg.layout as string) || 'compact'
      const langsCount = Number(cfg.langsCount) || 5
      const hideLangs = (cfg.hideLangs as string) || ''

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ GITHUB README STATS ]'

      let statsUrl = `https://github-readme-stats-fast.vercel.app/api?username=${encodeURIComponent(username)}&show_icons=${showIcons}&theme=${theme}${countPrivate ? '&count_private=true' : ''}${includeAllCommits ? '&include_all_commits=true' : ''}${hideRank ? '&hide_rank=true' : ''}${hideBorder ? '&hide_border=true' : ''}`
      if (statType === 'top-langs') {
        statsUrl = `https://github-readme-stats-fast.vercel.app/api/top-langs/?username=${encodeURIComponent(username)}&layout=${layout}&langs_count=${langsCount}&theme=${theme}${hideLangs ? `&hide=${encodeURIComponent(hideLangs)}` : ''}${hideBorder ? '&hide_border=true' : ''}`
      } else if (statType === 'pin') {
        statsUrl = `https://github-readme-stats-fast.vercel.app/api/pin/?username=${encodeURIComponent(username)}&repo=${encodeURIComponent(repoName)}&theme=${theme}${hideBorder ? '&hide_border=true' : ''}`
      }

      contentSvg = renderExternalWidgetSvg(
        statsUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
      break
    }

    case 'godprofile-terminal': {
      const commands = Array.isArray(cfg.terminalCommands)
        ? (cfg.terminalCommands as string[])
        : ['$ whoami', 'user', '$ uname -a', 'Linux GitAscii']

      const bg1 = '#0b0f14'
      const bg2 = '#151c25'
      const accent = '#b6a891'
      const text_color = '#eceff4'
      const font = 'Consolas, monospace'

      const line_height = 22
      const font_size = 14
      const pad_x = 20
      const pad_y = 60

      const delay_per_line = 0.8
      const css_rules: string[] = []
      for (let i = 0; i < commands.length; i++) {
        const delay = i * delay_per_line
        css_rules.push(
          `.line${i} { opacity: 0; animation: reveal 0.1s ${delay.toFixed(2)}s forwards; }`
        )
      }

      const css_keyframes = '@keyframes reveal { from { opacity: 0; } to { opacity: 1; } }'
      const cursor_delay = commands.length * delay_per_line
      const css_cursor = `.cursor { opacity: 0; animation: reveal 0.1s ${cursor_delay.toFixed(2)}s forwards, blink 1s ${cursor_delay.toFixed(2)}s step-end infinite; }`
      const css_blink = '@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }'

      const full_css = `
        ${css_keyframes}
        ${css_blink}
        ${css_rules.join('\n    ')}
        ${css_cursor}
        .terminal-bg { font-family: ${font}, 'Courier New', monospace; font-size: ${font_size}px; }
      `

      const text_elements: string[] = []
      for (let i = 0; i < commands.length; i++) {
        const line = commands[i]
        const y = pad_y + i * line_height
        const is_command =
          line.trim().startsWith('$') || line.trim().startsWith('#') || line.trim().startsWith('>')
        const color = is_command ? accent : text_color
        const safe_line = escapeXml(line)
        text_elements.push(
          `  <text x="${pad_x}" y="${y}" fill="${color}" class="line${i}">${safe_line}</text>`
        )
      }

      const cursor_y = pad_y + commands.length * line_height
      const cursor_element = `  <rect x="${pad_x}" y="${cursor_y - font_size}" width="8" height="${font_size + 2}" fill="${accent}" class="cursor"/>`

      contentSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid meet">
          <defs>
            <style>
            ${full_css}
            </style>
            <clipPath id="terminal-clip">
              <rect width="600" height="340" rx="12" ry="12"/>
            </clipPath>
            <linearGradient id="termBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${bg1}"/>
              <stop offset="100%" stop-color="${bg2}"/>
            </linearGradient>
          </defs>
          <rect width="600" height="340" rx="12" ry="12" fill="url(#termBg)" stroke="${bg2}" stroke-width="1.5"/>
          <rect width="600" height="36" rx="12" ry="12" fill="#151c25"/>
          <rect y="24" width="600" height="12" fill="#151c25"/>
          <circle cx="20" cy="18" r="6" fill="#ff5f57"/>
          <circle cx="40" cy="18" r="6" fill="#febc2e"/>
          <circle cx="60" cy="18" r="6" fill="#28c840"/>
          <text x="300" y="23" text-anchor="middle" fill="#888" font-size="12" font-family="${font}">terminal</text>
          <g class="terminal-bg" clip-path="url(#terminal-clip)">
            ${text_elements.join('\n')}
            ${cursor_element}
          </g>
        </svg>
      `
      break
    }

    case 'godprofile-marquee': {
      const selectedMarqueeLangs = Array.isArray(cfg.marqueeLangs)
        ? (cfg.marqueeLangs as string[])
        : ['react', 'ts', 'js', 'html', 'css', 'nodejs', 'python', 'git', 'docker', 'linux']

      const techNameMap: Record<string, string> = {
        js: 'JavaScript',
        ts: 'TypeScript',
        html: 'HTML5',
        css: 'CSS3',
        py: 'Python',
        rust: 'Rust',
        go: 'Go',
        cpp: 'C++',
        cs: 'C#',
        c: 'C',
        java: 'Java',
        php: 'PHP',
        ruby: 'Ruby',
        kotlin: 'Kotlin',
        swift: 'Swift',
        dart: 'Dart',
        bash: 'Bash',
        graphql: 'GraphQL',
        r: 'R',
        elixir: 'Elixir',
        solidity: 'Solidity',
        haskell: 'Haskell',
        react: 'React',
        nextjs: 'Next.js',
        vue: 'Vue.js',
        nuxt: 'Nuxt',
        angular: 'Angular',
        svelte: 'Svelte',
        tailwind: 'Tailwind',
        bootstrap: 'Bootstrap',
        sass: 'Sass',
        flutter: 'Flutter',
        reactnative: 'React Native',
        redux: 'Redux',
        threejs: 'Three.js',
        vite: 'Vite',
        astro: 'Astro',
        solidjs: 'SolidJS',
        remix: 'Remix',
        recoil: 'Recoil',
        zustand: 'Zustand',
        nodejs: 'Node.js',
        express: 'Express',
        nest: 'NestJS',
        django: 'Django',
        fastapi: 'FastAPI',
        flask: 'Flask',
        spring: 'Spring',
        laravel: 'Laravel',
        postgres: 'PostgreSQL',
        mongodb: 'MongoDB',
        mysql: 'MySQL',
        redis: 'Redis',
        supabase: 'Supabase',
        firebase: 'Firebase',
        prisma: 'Prisma',
        bun: 'Bun',
        deno: 'Deno',
        sqlite: 'SQLite',
        git: 'Git',
        github: 'GitHub',
        gitlab: 'GitLab',
        docker: 'Docker',
        kubernetes: 'Kubernetes',
        aws: 'AWS',
        gcp: 'GCP',
        azure: 'Azure',
        vercel: 'Vercel',
        netlify: 'Netlify',
        linux: 'Linux',
        figma: 'Figma',
        postman: 'Postman',
        vscode: 'VS Code',
        terraform: 'Terraform',
        githubactions: 'GitHub Actions',
        jest: 'Jest',
        vitest: 'Vitest',
      }

      const icons = selectedMarqueeLangs.map((id) => techNameMap[id] || id)
      const bg1 = '#0b0f14'
      const bg2 = '#151c25'
      const accent = '#b6a891'
      const text_color = '#eceff4'
      const border = '#2b303a'
      const font_data = 'Consolas, monospace'

      const PILL_H = 28
      const PILL_PADDING_X = 14
      const PILL_GAP = 10
      const FONT_SIZE = 12
      const STRIP_Y = Math.floor((60 - PILL_H) / 2)

      const estimateTextWidth = (text: string) => text.length * Math.floor(FONT_SIZE * 0.62)
      const pillWidth = (label: string) => estimateTextWidth(label) + PILL_PADDING_X * 2

      const hexToRgba = (hex: string, alpha: number) => {
        let h = hex.replace('#', '')
        if (h.length === 3)
          h = h
            .split('')
            .map((c) => c + c)
            .join('')
        const r = parseInt(h.substring(0, 2), 16)
        const g = parseInt(h.substring(2, 4), 16)
        const b = parseInt(h.substring(4, 6), 16)
        return `rgba(${r},${g},${b},${alpha})`
      }

      const pill_bg = hexToRgba(accent, 0.15)
      const pill_stroke = hexToRgba(accent, 0.45)

      const renderPillGroup = (pills: string[], xOffset: number) => {
        const parts: string[] = []
        let x = xOffset
        for (const label of pills) {
          const pw = pillWidth(label)
          const ph = PILL_H
          const py = STRIP_Y
          const text_x = x + Math.floor(pw / 2)
          const text_y = py + Math.floor(ph / 2) + Math.floor(FONT_SIZE / 2) - 1

          parts.push(
            `<rect x="${x}" y="${py}" width="${pw}" height="${ph}" rx="${Math.floor(ph / 2)}" fill="${pill_bg}" stroke="${pill_stroke}" stroke-width="1"/>`
          )
          parts.push(
            `<text x="${text_x}" y="${text_y}" font-family="${font_data}" font-size="${FONT_SIZE}" fill="${text_color}" text-anchor="middle" dominant-baseline="auto" font-weight="500">${escapeXml(label)}</text>`
          )
          x += pw + PILL_GAP
        }
        const total_width = x - xOffset - PILL_GAP
        return { svg: parts.join('\n'), width: total_width }
      }

      const single_width = icons.reduce((sum, ic) => sum + pillWidth(ic) + PILL_GAP, 0)
      const repeat = Math.max(2, Math.ceil(800 / single_width) + 1)

      const icons_repeated: string[] = []
      for (let r = 0; r < repeat; r++) {
        icons_repeated.push(...icons)
      }

      const group1 = renderPillGroup(icons_repeated, 0)
      const group2 = renderPillGroup([...icons, ...icons], single_width)

      contentSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 60" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="mqBg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="${bg1}"/>
              <stop offset="100%" stop-color="${bg2}"/>
            </linearGradient>
            <clipPath id="mqClip">
              <rect width="800" height="60" rx="10"/>
            </clipPath>
            <style>
              @keyframes mqScroll {
                0% { transform: translateX(0px); }
                100% { transform: translateX(-${single_width}px); }
              }
              .mq-track {
                animation: mqScroll 30s linear infinite;
                will-change: transform;
              }
            </style>
          </defs>
          <rect width="800" height="60" rx="10" fill="url(#mqBg)"/>
          <rect width="800" height="60" rx="10" fill="none" stroke="${border}" stroke-width="1" opacity="0.5"/>
          <g clip-path="url(#mqClip)">
            <g class="mq-track">
              ${group1.svg}
              ${group2.svg}
            </g>
          </g>
        </svg>
      `
      break
    }

    case 'godprofile-neural': {
      const neuralTechs =
        typeof cfg.neuralTechs === 'object' && cfg.neuralTechs !== null
          ? (cfg.neuralTechs as Record<string, string[]>)
          : {
              Frontend: ['react', 'nextjs', 'tailwind'],
              Backend: ['nodejs', 'postgres', 'docker'],
              DevOps: ['git', 'github', 'linux'],
            }

      const techNameMap: Record<string, string> = {
        js: 'JS',
        ts: 'TS',
        html: 'HTML',
        css: 'CSS',
        py: 'Python',
        rust: 'Rust',
        go: 'Go',
        react: 'React',
        nextjs: 'Next.js',
        nodejs: 'Node.js',
        postgres: 'Postgres',
        docker: 'Docker',
        git: 'Git',
        github: 'GitHub',
        linux: 'Linux',
        tailwind: 'Tailwind',
      }

      const categories = Object.entries(neuralTechs).map(([cat, list]) => ({
        cat,
        techs: list.map((id) => techNameMap[id] || id.toUpperCase()),
      }))

      const bg1 = '#0b0f14'
      const bg2 = '#151c25'
      const accent = '#b6a891'
      const text_col = '#eceff4'
      const font = 'Consolas, monospace'

      const n_cols = categories.length
      const col_xs = Array.from({ length: n_cols }, (_, i) =>
        Math.floor((800 * (i + 1)) / (n_cols + 1))
      )

      const node_positions: { x: number; y: number; tech: string }[][] = []
      categories.forEach((c, col_i) => {
        const cx = col_xs[col_i]
        const n = c.techs.length
        const ys = Array.from({ length: n }, (_, j) => Math.floor((260 * (j + 1)) / (n + 1)))
        node_positions.push(ys.map((y, idx) => ({ x: cx, y, tech: c.techs[idx] })))
      })

      const svgPaths: string[] = []
      const edge_paths: string[] = []
      for (let col_i = 0; col_i < n_cols - 1; col_i++) {
        for (const node1 of node_positions[col_i]) {
          for (const node2 of node_positions[col_i + 1]) {
            const cp1x = node1.x + Math.floor((node2.x - node1.x) / 3)
            const cp2x = node2.x - Math.floor((node2.x - node1.x) / 3)
            const path = `M${node1.x} ${node1.y} C${cp1x} ${node1.y},${cp2x} ${node2.y},${node2.x} ${node2.y}`
            edge_paths.push(path)
            svgPaths.push(
              `  <path d="${path}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.2"/>`
            )
          }
        }
      }

      edge_paths.forEach((path, i) => {
        const dur = (2.5 + (i % 3) * 0.7).toFixed(1)
        svgPaths.push(`
          <circle r="2.5" fill="${accent}" opacity="0.9" filter="url(#glow)">
            <animateMotion dur="${dur}s" repeatCount="indefinite" path="${path}"/>
          </circle>
        `)
      })

      categories.forEach((c, col_i) => {
        const cx = col_xs[col_i]
        svgPaths.push(`
          <text x="${cx}" y="18" text-anchor="middle" font-family="${font}" font-size="10" fill="${accent}" opacity="0.7" font-weight="bold" letter-spacing="2">${c.cat.toUpperCase()}</text>
        `)
        node_positions[col_i].forEach((node) => {
          svgPaths.push(`
            <circle cx="${node.x}" cy="${node.y}" r="22" fill="url(#nglow)" opacity="0.5"/>
            <circle cx="${node.x}" cy="${node.y}" r="14" fill="${bg2}" stroke="${accent}" stroke-width="1.5" opacity="0.9"/>
            <circle cx="${node.x}" cy="${node.y}" r="5" fill="${accent}" filter="url(#glow)"/>
            <text x="${node.x}" y="${node.y + 28}" text-anchor="middle" font-family="${font}" font-size="11" fill="${text_col}" opacity="0.9">${node.tech}</text>
          `)
        })
      })

      contentSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="nbg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${bg1}"/>
              <stop offset="100%" stop-color="${bg2}"/>
            </linearGradient>
            <radialGradient id="nglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="${accent}" stop-opacity="0.9"/>
              <stop offset="60%" stop-color="${accent}" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect width="800" height="260" fill="url(#nbg)" rx="12"/>
          ${svgPaths.join('\n')}
        </svg>
      `
      break
    }

    case 'godprofile-trophies': {
      const username = data.user.login
      const disabledTrophies = Array.isArray(cfg.disabledTrophies)
        ? (cfg.disabledTrophies as string[])
        : []

      const stars = (data.user as any).stars || 15
      const commits = (data.user as any).commits || 420
      const prs = (data.user as any).prs || 45
      const issues = (data.user as any).issues || 8
      const repos = data.repos?.length || 12
      const followers = data.user.followers || 50

      const stats = { stars, commits, prs, issues, repos, followers }

      const RANK_THRESHOLDS: Record<string, [number, number, number]> = {
        Stars: [1000, 200, 50],
        Commits: [3000, 1000, 300],
        PRs: [200, 50, 10],
        Issues: [200, 50, 10],
        Repos: [100, 30, 10],
        Followers: [500, 100, 20],
      }

      const RANK_COLORS: Record<string, string | null> = {
        S: '#ffd700',
        A: '#c0c0c0',
        B: '#cd7f32',
        C: null,
      }

      const TROPHY_CUP_PATH =
        'M-16,-24 L16,-24 L20,-8 C20,4 12,12 4,14 L4,20 L10,20 L10,26 ' +
        'L-10,26 L-10,20 L-4,20 L-4,14 C-12,12 -20,4 -20,-8 Z ' +
        'M-22,-24 L-16,-24 L-16,-10 C-20,-12 -22,-18 -22,-24 Z ' +
        'M22,-24 L16,-24 L16,-10 C20,-12 22,-18 22,-24 Z'

      const STAR_PATH =
        'M0,-10 L2.4,-3.1 L9.5,-3.1 L3.8,1.2 L6.2,8.1 ' +
        'L0,4.5 L-6.2,8.1 L-3.8,1.2 L-9.5,-3.1 L-2.4,-3.1 Z'

      const rankFor = (trophyName: string, val: number) => {
        const [s, a, b] = RANK_THRESHOLDS[trophyName] || [9999, 999, 99]
        if (val >= s) return 'S'
        if (val >= a) return 'A'
        if (val >= b) return 'B'
        return 'C'
      }

      const formatValue = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
        if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
        return String(val)
      }

      const bg1 = '#0b0f14'
      const bg2 = '#151c25'
      const accent_color = '#b6a891'
      const text_color = '#eceff4'
      const font_header = 'Segoe UI, Inter, sans-serif'
      const font_data = 'Consolas, monospace'

      const rawTrophies: [string, number][] = [
        ['Stars', stats.stars],
        ['Commits', stats.commits],
        ['PRs', stats.prs],
        ['Issues', stats.issues],
        ['Repos', stats.repos],
        ['Followers', stats.followers],
      ]

      const trophies = rawTrophies.filter(([name]) => !disabledTrophies.includes(name))

      const header_h = 36
      const card_w = 120
      const card_h = 170
      const padding_x = Math.floor((800 - trophies.length * card_w) / (trophies.length + 1))
      const start_y = header_h + Math.floor((230 - header_h - card_h) / 2)

      const card_groups: string[] = []
      const filter_defs: string[] = []

      trophies.forEach(([name, value], idx) => {
        const rank = rankFor(name, value)
        const rank_color = RANK_COLORS[rank] || text_color
        const cx = padding_x + idx * (card_w + padding_x) + Math.floor(card_w / 2)
        const cy = start_y

        let glow_filter = ''
        let anim_inside_rect = ''
        const filter_def_id = `sglow${idx}`
        if (rank === 'S') {
          glow_filter = `filter="url(#${filter_def_id})"`
          anim_inside_rect = `
            <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"/>
          `
          filter_defs.push(`
            <filter id="${filter_def_id}" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feFlood flood-color="${rank_color}" flood-opacity="0.4" result="color"/>
              <feComposite in="color" in2="blur" operator="in" result="shadow"/>
              <feMerge>
                <feMergeNode in="shadow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          `)
        }

        let star_el = ''
        if (rank === 'S') {
          star_el = `
            <g transform="translate(${Math.floor(card_w / 2)},20)" fill="${rank_color}" opacity="0.9">
              <path d="${STAR_PATH}"/>
            </g>
          `
        }

        card_groups.push(`
          <!-- Trophy: ${name} (rank ${rank}) -->
          <g transform="translate(${cx - Math.floor(card_w / 2)},${cy})">
            <rect width="${card_w}" height="${card_h}" rx="10" ry="10" fill="${bg2}" fill-opacity="0.8" stroke="${rank_color}" stroke-width="1.5" ${glow_filter}>
              ${anim_inside_rect}
            </rect>
            ${star_el}
            <!-- Cup icon -->
            <g transform="translate(${Math.floor(card_w / 2)},62)" fill="${rank_color}" opacity="0.9">
              <path d="${TROPHY_CUP_PATH}"/>
            </g>
            <!-- Title -->
            <text x="${Math.floor(card_w / 2)}" y="${card_h - 55}" text-anchor="middle" font-family="${font_data}" font-size="11" fill="${text_color}">${name}</text>
            <!-- Value -->
            <text x="${Math.floor(card_w / 2)}" y="${card_h - 38}" text-anchor="middle" font-family="${font_header}" font-size="15" font-weight="bold" fill="${rank_color}">${formatValue(value)}</text>
            <!-- Rank badge -->
            <rect x="${Math.floor(card_w / 2) - 13}" y="${card_h - 28}" width="26" height="18" rx="5" fill="${rank_color}" opacity="0.18"/>
            <text x="${Math.floor(card_w / 2)}" y="${card_h - 14}" text-anchor="middle" font-family="${font_header}" font-size="12" font-weight="bold" fill="${rank_color}">${rank}</text>
          </g>
        `)
      })

      contentSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 230" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${bg1}"/>
              <stop offset="100%" stop-color="${bg2}"/>
            </linearGradient>
            ${filter_defs.join('\n')}
          </defs>
          <rect width="800" height="230" fill="url(#bgGrad)" rx="12"/>
          <text x="16" y="24" font-family="${font_header}" font-size="12" font-weight="bold" fill="${accent_color}" opacity="0.7" letter-spacing="1">TROPHY CASE</text>
          <text x="200" y="24" font-family="${font_data}" font-size="11" fill="${text_color}" opacity="0.4">@${username}</text>
          <line x1="16" y1="32" x2="784" y2="32" stroke="${accent_color}" stroke-width="0.5" opacity="0.2"/>
          ${card_groups.join('\n')}
        </svg>
      `
      break
    }

    case 'godprofile-wakatime': {
      const hiddenWakatimeLangs = Array.isArray(cfg.hiddenWakatimeLangs)
        ? (cfg.hiddenWakatimeLangs as string[])
        : []

      const bg1 = '#0b0f14'
      const bg2 = '#151c25'
      const accent = '#b6a891'
      const text_color = '#eceff4'
      const border_color = '#2b303a'
      const font = 'Segoe UI, Inter, sans-serif'
      const mono = 'Consolas, monospace'

      let filteredLangs = Object.entries(data.languages || {})
      if (hiddenWakatimeLangs.length > 0) {
        const lowerHidden = hiddenWakatimeLangs.map((l) => l.toLowerCase())
        filteredLangs = filteredLangs.filter(([lang]) => !lowerHidden.includes(lang.toLowerCase()))
      }

      const totalBytes = filteredLangs.reduce((sum, [_, count]) => sum + (count as number), 0) || 1
      const filteredItems = filteredLangs
        .map(([name, count]) => [name, ((count as number) / totalBytes) * 100] as [string, number])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)

      const BAR_OPACITIES = [1.0, 0.78, 0.58, 0.42, 0.3, 0.22]
      const bar_area_left = 100
      const bar_area_right = 340
      const bar_max_width = bar_area_right - bar_area_left
      const row_height = 28
      const chart_top = 44
      const label_max_chars = 13

      const rows_svg: string[] = []
      filteredItems.forEach(([lang, pct], i) => {
        const y = chart_top + i * row_height
        const bar_w = Math.max(4, Math.floor((pct / 100.0) * bar_max_width))
        const opacity = BAR_OPACITIES[i % BAR_OPACITIES.length]
        const label =
          lang.substring(0, label_max_chars) + (lang.length > label_max_chars ? '.' : '')
        const pct_str = `${pct.toFixed(1)}%`

        rows_svg.push(`
          <rect x="${bar_area_left}" y="${y}" width="${bar_max_width}" height="14" rx="4" fill="${border_color}" opacity="0.18"/>
          <rect x="${bar_area_left}" y="${y}" width="0" height="14" rx="4" fill="${accent}" opacity="${opacity}">
            <animate attributeName="width" from="0" to="${bar_w}" dur="0.8s" begin="${(0.1 + i * 0.12).toFixed(2)}s" fill="freeze"/>
          </rect>
          <text x="${bar_area_left - 6}" y="${y + 11}" font-family="${font}" font-size="10" fill="${text_color}" text-anchor="end">${label}</text>
          <text x="${bar_area_left + bar_w + 5}" y="${y + 11}" font-family="${mono}" font-size="9" fill="${accent}" opacity="0.85">${pct_str}</text>
        `)
      })

      const chart_height = chart_top + filteredItems.length * row_height + 18

      contentSvg = `
        <svg width="${width}" height="${height}" viewBox="0 0 400 ${chart_height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="wkBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${bg1}"/>
              <stop offset="100%" stop-color="${bg2}"/>
            </linearGradient>
          </defs>
          <rect width="400" height="${chart_height}" rx="12" fill="url(#wkBg)" stroke="${border_color}" stroke-width="1"/>
          <text x="16" y="24" font-family="${font}" font-size="13" font-weight="700" fill="${text_color}">WakaTime — Weekly Coding Activity</text>
          <line x1="16" y1="32" x2="384" y2="32" stroke="${accent}" stroke-width="1" opacity="0.3"/>
          ${rows_svg.join('\n')}
        </svg>
      `
      break
    }

    case 'godprofile-globe': {
      const bg1 = '#0b0f14'
      const bg2 = '#151c25'
      const border_color = '#2b303a'
      const accent_color = '#b6a891'
      const text_color = '#eceff4'
      const font_data = 'Consolas, monospace'

      const cx = 200
      const cy = 200
      const scale = 100

      const cos30 = Math.cos(Math.PI / 6)
      const sin30 = Math.sin(Math.PI / 6)

      const lon_path_els: string[] = []
      for (let i = 0; i < 12; i++) {
        const theta = (i * 30 * Math.PI) / 180
        const pts = []
        for (let j = 0; j <= 60; j++) {
          const phi = (j * 3 * Math.PI) / 180
          const x = Math.sin(phi) * Math.cos(theta)
          const y = Math.cos(phi)
          const z = Math.sin(phi) * Math.sin(theta)

          const sx = (x - z) * cos30
          const sy = y + (x + z) * sin30
          pts.push(`${(cx + sx * scale).toFixed(2)},${(cy - sy * scale).toFixed(2)}`)
        }
        lon_path_els.push(
          `<path d="M ${pts.join(' L ')}" fill="none" stroke="${border_color}" stroke-width="0.8" opacity="0.55"/>`
        )
      }

      const lat_path_els: string[] = []
      for (let i = 1; i < 9; i++) {
        const phi = (i * 20 * Math.PI) / 180
        const pts = []
        for (let j = 0; j <= 72; j++) {
          const theta = (j * 5 * Math.PI) / 180
          const x = Math.sin(phi) * Math.cos(theta)
          const y = Math.cos(phi)
          const z = Math.sin(phi) * Math.sin(theta)

          const sx = (x - z) * cos30
          const sy = y + (x + z) * sin30
          pts.push(`${(cx + sx * scale).toFixed(2)},${(cy - sy * scale).toFixed(2)}`)
        }
        lat_path_els.push(
          `<path d="M ${pts.join(' L ')}" fill="none" stroke="${border_color}" stroke-width="0.8" opacity="0.55"/>`
        )
      }

      contentSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="${bg1}"/>
              <stop offset="100%" stop-color="${bg2}"/>
            </radialGradient>
            <radialGradient id="globeGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="${bg1}" stop-opacity="0.55"/>
              <stop offset="100%" stop-color="${bg2}" stop-opacity="0.92"/>
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <clipPath id="globeClip">
              <circle cx="${cx}" cy="${cy}" r="${scale}"/>
            </clipPath>
          </defs>
          <rect width="400" height="400" fill="url(#bgGrad)" rx="12"/>
          <g id="globe-group">
            <circle cx="${cx}" cy="${cy}" r="${scale}" fill="url(#globeGrad)" stroke="${border_color}" stroke-width="1.5" filter="url(#glow)"/>
            <g clip-path="url(#globeClip)">
              ${lon_path_els.join('\n')}
              ${lat_path_els.join('\n')}
            </g>
            <circle cx="${cx}" cy="${cy}" r="${scale}" fill="none" stroke="${accent_color}" stroke-width="1.5" opacity="0.25"/>
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="30s" repeatCount="indefinite"/>
          </g>
          <text x="${cx}" y="384" text-anchor="middle" font-family="${font_data}" font-size="11" fill="${text_color}" opacity="0.55">GodProfile Globe</text>
        </svg>
      `
      break
    }

    case 'ghstats': {
      const username = data.user.login
      const embedType = (cfg.embedType as string) || 'card'

      const theme = (cfg.theme as string) || 'default'
      const showIcons = cfg.showIcons !== false
      const showRing = cfg.showRing !== false
      const hideBorder = Boolean(cfg.hideBorder)
      const hideTitle = Boolean(cfg.hideTitle)
      const size = (cfg.size as string) || 'default'
      const compactCount = (cfg.compactCount as string) || '4'
      const hideStats = (cfg.hideStats as string) || ''

      const customTitle = (cfg.customTitle as string) || ''
      const layout = (cfg.layout as string) || 'bar'
      const maxLangs = Number(cfg.maxLangs) || 8
      const badgeStyle = (cfg.badgeStyle as string) || 'flat'

      let statsUrl = `https://ghstats.dev/api/${embedType}?username=${encodeURIComponent(username)}&theme=${theme}`

      const bgColor = cfg.backgroundColor as string
      if (bgColor) statsUrl += `&bg=${bgColor.replace('#', '')}`

      const textColor = cfg.textColor as string
      if (textColor) statsUrl += `&text=${textColor.replace('#', '')}`

      const accentColor = cfg.accentColor as string
      if (accentColor) {
        statsUrl += `&icon_color=${accentColor.replace('#', '')}`
        statsUrl += `&title_color=${accentColor.replace('#', '')}`
      }

      const borderColor = cfg.borderColor as string
      if (borderColor) statsUrl += `&border_color=${borderColor.replace('#', '')}`

      if (embedType === 'card') {
        if (!showIcons) statsUrl += `&show_icons=false`
        if (!showRing) statsUrl += `&show_ring=false`
        if (hideBorder) statsUrl += `&hide_border=true`
        if (hideTitle) statsUrl += `&hide_title=true`
        if (size === 'compact') statsUrl += `&size=compact&compact_count=${compactCount}`
        if (customTitle) statsUrl += `&custom_title=${encodeURIComponent(customTitle)}`
        if (hideStats) statsUrl += `&hide=${encodeURIComponent(hideStats)}`
      } else if (embedType === 'langs') {
        if (layout !== 'bar') statsUrl += `&layout=${layout}`
        if (maxLangs !== 8) statsUrl += `&max_langs=${maxLangs}`
        if (hideBorder) statsUrl += `&hide_border=true`
      } else if (embedType === 'mini' || embedType === 'badge') {
        if (badgeStyle !== 'flat') statsUrl += `&style=${badgeStyle}`
      }

      contentSvg = renderExternalWidgetSvg(
        statsUrl,
        width,
        height,
        customTitle || '[ GHSTATS.DEV ]',
        !hideTitle && embedType !== 'card',
        globalStyles,
        accent,
        'contain'
      )

      break
    }

    case 'streak-stats': {
      const username = (cfg.username as string) || data.user.login
      const theme = (cfg.theme as string) || 'dark'
      const mode = (cfg.mode as string) || 'daily'
      const dateFormat = (cfg.dateFormat as string) || 'M j, Y'
      const streakBorderRadius = Number(cfg.streakBorderRadius) || 4
      const hideBorder = Boolean(cfg.hideBorder)

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ GITHUB STREAK STATS ]'

      const streakUrl = `https://streak-stats.demolab.com/?user=${encodeURIComponent(username)}&theme=${theme}&mode=${mode}&date_format=${encodeURIComponent(dateFormat)}&border_radius=${streakBorderRadius}${hideBorder ? '&hide_border=true' : ''}`

      contentSvg = renderExternalWidgetSvg(
        streakUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
      break
    }

    case 'profile-trophy': {
      const username = (cfg.username as string) || data.user.login
      const theme = (cfg.theme as string) || 'flat'
      const column = Number(cfg.column) || 6
      const row = Number(cfg.row) || 1
      const noFrame = Boolean(cfg.noFrame)
      const noBg = Boolean(cfg.noBg)

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ PROFILE TROPHIES ]'

      const trophyUrl = `https://github-profile-trophy-fast.vercel.app/?username=${encodeURIComponent(username)}&theme=${theme}&column=${column}&row=${row}${noFrame ? '&margin-w=0' : ''}${noBg ? '&no-bg=true' : ''}`

      contentSvg = renderExternalWidgetSvg(
        trophyUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
      break
    }

    case 'activity-graph': {
      const username = (cfg.username as string) || data.user.login
      const theme = (cfg.theme as string) || 'github-dark'
      const days = Number(cfg.days) || 31
      const showArea = cfg.showArea !== false
      const hideBorder = Boolean(cfg.hideBorder)

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ ACTIVITY GRAPH ]'

      const graphUrl = `https://github-readme-activity-graph.vercel.app/graph?username=${encodeURIComponent(username)}&theme=${theme}&days=${days}&area=${showArea}${hideBorder ? '&hide_border=true' : ''}`

      contentSvg = renderExternalWidgetSvg(
        graphUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
      break
    }

    case 'contribution-snake': {
      const username = (cfg.username as string) || data.user.login
      const theme = (cfg.theme as string) || 'dark'
      const branch = (cfg.branch as string) || 'output'

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ CONTRIBUTION SNAKE ]'

      const snakeFileName =
        theme === 'light'
          ? 'github-contribution-grid-snake.svg'
          : 'github-contribution-grid-snake-dark.svg'
      const snakeUrl = `https://cdn.jsdelivr.net/gh/${encodeURIComponent(username)}/${encodeURIComponent(username)}@${encodeURIComponent(branch)}/${snakeFileName}`
      const fallbackSnakeUrl = `https://cdn.jsdelivr.net/gh/platane/platane@output/${snakeFileName}`

      contentSvg = renderExternalWidgetSvg(
        snakeUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain',
        undefined,
        fallbackSnakeUrl
      )
      break
    }

    case 'metrics-card': {
      const username = (cfg.username as string) || data.user.login
      const template = (cfg.template as string) || 'classic'
      const baseSections = (cfg.baseSections as string) || 'header,activity,community,repositories'

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ GITHUB METRICS CARD ]'

      const metricsUrl = `https://metrics.lecoq.io/${encodeURIComponent(username)}?template=${encodeURIComponent(template)}&base=${encodeURIComponent(baseSections)}`

      contentSvg = renderExternalWidgetSvg(
        metricsUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
      break
    }

    case 'views-counter': {
      const username = (cfg.username as string) || data.user.login
      const color = (cfg.color as string) || '00f0ff'
      const style = (cfg.style as string) || 'for-the-badge'
      const label = (cfg.label as string) || 'PROFILE VIEWS'
      const baseVal = Number(cfg.baseVal) || 0

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ VIEWS COUNTER ]'

      const viewsUrl = `https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=${color}&style=${style}&label=${encodeURIComponent(label)}${baseVal > 0 ? `&base=${baseVal}` : ''}`

      contentSvg = renderExternalWidgetSvg(
        viewsUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'badge'
      )
      break
    }

    case 'readme-quotes': {
      const quoteType = (cfg.quoteType as string) || 'random'
      const theme = (cfg.theme as string) || 'dark'
      const layout = (cfg.layout as string) || 'horizontal'

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ DEVELOPER QUOTE ]'

      const quoteUrl = `https://quotes-github-readme.vercel.app/api?type=${quoteType === 'quote-day' ? 'quote-day' : layout}&theme=${theme}`

      contentSvg = renderExternalWidgetSvg(
        quoteUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
      break
    }

    case 'awesome-badge': {
      const badgeStyle = (cfg.badgeStyle as string) || 'for-the-badge'
      const badgeColor = (cfg.badgeColor as string) || 'brightgreen'
      const label = (cfg.label as string) || 'Awesome GitHub Profile'
      const logo = (cfg.logo as string) || 'github'

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ AWESOME PROFILE BADGE ]'

      const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(label)}-Featured-${badgeColor}?style=${badgeStyle}&logo=${encodeURIComponent(logo)}`
      const targetUrl = 'https://github.com/abhisheknaiidu/awesome-github-profile-readme'

      contentSvg = renderExternalWidgetSvg(
        badgeUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'badge',
        targetUrl
      )
      break
    }

    case 'custom-image': {
      const imageUrl = (cfg.imageUrl as string) || (cfg.src as string) || (cfg.url as string) || ''
      const targetUrl = (cfg.targetUrl as string) || (cfg.href as string) || undefined
      const showTitle = cfg.showTitle === true
      const customTitle = (cfg.customTitle as string) || '[ IMAGE ]'
      const mode = (cfg.mode as 'contain' | 'badge') || 'contain'

      if (!imageUrl) {
        contentSvg = `
          <rect width="${width}" height="${height}" fill="#18181b" rx="4" opacity="0.6" stroke="${border}" stroke-width="1" />
          <text x="${width / 2}" y="${height / 2 - 6}" text-anchor="middle" font-family="${globalStyles.fontFamily}" font-size="12" fill="${accent}">📷 [ IMAGEM CUSTOMIZADA ]</text>
          <text x="${width / 2}" y="${height / 2 + 14}" text-anchor="middle" font-family="${globalStyles.fontFamily}" font-size="10" fill="#71717a">Cole a URL ou faça upload no painel de propriedades</text>
        `
      } else {
        contentSvg = renderExternalWidgetSvg(
          imageUrl,
          width,
          height,
          customTitle,
          showTitle,
          globalStyles,
          accent,
          mode,
          targetUrl
        )
      }
      break
    }

    default: {
      contentSvg = `
        <text x="24" y="36" font-family="'Inter Tight', sans-serif" font-size="14" fill="${textClr}">${escapeXml(widget.widgetId.toUpperCase())}</text>
      `
    }
  }

  let templateDecorationSvg = ''
  const tmplStyle = globalStyles.templateStyle || 'terminal'
  let strokeWidth = 1
  let shadowRect = ''

  if (tmplStyle === 'dracula') {
    templateDecorationSvg = `
      <circle cx="16" cy="16" r="4" fill="#ff5555" />
      <circle cx="28" cy="16" r="4" fill="#f1fa8c" />
      <circle cx="40" cy="16" r="4" fill="#50fa7b" />
    `
  } else if (tmplStyle === 'cyberpunk') {
    templateDecorationSvg = `
      <path d="M0,10 L0,0 L10,0" stroke="${accent}" stroke-width="2" fill="none" />
      <path d="M${width},${height - 10} L${width},${height} L${width - 10},${height}" stroke="${textClr}" stroke-width="2" fill="none" />
      <line x1="0" y1="0" x2="${width}" y2="0" stroke="${accent}" stroke-width="1.5" stroke-dasharray="8 4" />
    `
  } else if (tmplStyle === 'nord') {
    templateDecorationSvg = `
      <rect x="0" y="0" width="${width}" height="3" fill="#88c0d0" rx="1" />
    `
  } else if (tmplStyle === 'synthwave') {
    templateDecorationSvg = `
      <rect x="0" y="0" width="${width}" height="3" fill="url(#synthwave-grad-${widget.instanceId})" rx="1" />
      <defs>
        <linearGradient id="synthwave-grad-${widget.instanceId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff6b6b" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
      </defs>
    `
  } else if (tmplStyle === 'terminal') {
    templateDecorationSvg = `
      <text x="6" y="14" font-family="'JetBrains Mono', monospace" font-size="10" fill="${accent}">+</text>
      <text x="${width - 12}" y="14" font-family="'JetBrains Mono', monospace" font-size="10" fill="${accent}">+</text>
    `
  } else if (tmplStyle === 'tokyonight') {
    templateDecorationSvg = `
      <rect x="0" y="0" width="${width}" height="3" fill="#7aa2f7" rx="1" />
      <circle cx="${width - 16}" cy="16" r="3" fill="#bb9af7" opacity="0.8" />
    `
  } else if (tmplStyle === 'gruvbox') {
    templateDecorationSvg = `
      <rect x="0" y="0" width="${width}" height="3" fill="#fe8019" rx="1" />
      <line x1="12" y1="12" x2="24" y2="12" stroke="#b8bb26" stroke-width="1.5" />
      <line x1="12" y1="16" x2="20" y2="16" stroke="#fb4934" stroke-width="1.5" />
    `
  } else if (tmplStyle === 'githubdark') {
    templateDecorationSvg = `
      <rect x="0" y="0" width="${width}" height="3" fill="#30363d" rx="1" />
    `
  } else if (tmplStyle === 'neobrutalism') {
    strokeWidth = 2.5
    shadowRect = `<rect x="6" y="6" width="${width}" height="${height}" fill="#000000" rx="${rx}" />`
  }

  if (cfg.hideDecorations) {
    templateDecorationSvg = ''
    shadowRect = ''
  }

  if (cfg.hideBorder) {
    strokeWidth = 0
  }

  let styleBlock = ''
  const animType = (cfg.animationType as string) || 'none'
  const animDuration = (cfg.animationDuration as number) || 1500
  const animDelay = (cfg.animationDelay as number) || 0
  const animEasing = (cfg.animationEasing as string) || 'ease-out'
  const previewKey = (cfg.animationPreviewKey as number) || 0

  if (animType !== 'none') {
    const easing = animEasing === 'spring' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : animEasing

    if (animType === 'typewriter') {
      if (
        widget.widgetId === 'ascii-art' ||
        widget.widgetId === 'ascii-text' ||
        widget.widgetId.startsWith('terminal-')
      ) {
        let rectsHtml = ''
        let rectAnimations = ''

        if (widget.widgetId.startsWith('terminal-')) {
          const yMatches = [...contentSvg.matchAll(/<text[^>]*y="([0-9.]+)"/g)]
          const yValues = yMatches.map((m) => parseFloat(m[1]))
          const linesCount = yValues.length
          const lineTime = animDuration / Math.max(1, linesCount)

          yValues.forEach((y, i) => {
            rectsHtml += `<rect class="typewriter-line-${widget.instanceId}-${previewKey}-${i}" x="0" y="${y - 16}" width="0" height="22" />\n          `
            rectAnimations += `
            #widget-${widget.instanceId} .typewriter-line-${widget.instanceId}-${previewKey}-${i} {
              animation: typewriter-clip-${widget.instanceId}-${previewKey} ${lineTime}ms linear ${animDelay + i * lineTime}ms both;
            }`
          })
        } else {
          const fontSize = Number(cfg.fontSize) || (widget.widgetId === 'ascii-text' ? 12 : 9)
          const lineHeight =
            widget.widgetId === 'ascii-text'
              ? fontSize * 1.2
              : Math.max(7, Math.round(fontSize * 1.12))

          let linesCount = 1
          if (widget.widgetId === 'ascii-art') {
            linesCount = Array.isArray(cfg.asciiText)
              ? cfg.asciiText.length
              : Math.floor(height / lineHeight)
          } else {
            linesCount = Array.isArray(cfg.asciiLines)
              ? cfg.asciiLines.length
              : Math.floor(height / lineHeight)
          }

          const lineTime = animDuration / Math.max(1, linesCount)

          for (let i = 0; i < linesCount; i++) {
            rectsHtml += `<rect class="typewriter-line-${widget.instanceId}-${previewKey}-${i}" x="0" y="${i * lineHeight}" width="0" height="${lineHeight + 2}" />\n          `
            rectAnimations += `
            #widget-${widget.instanceId} .typewriter-line-${widget.instanceId}-${previewKey}-${i} {
              animation: typewriter-clip-${widget.instanceId}-${previewKey} ${lineTime}ms linear ${animDelay + i * lineTime}ms both;
            }`
          }
        }

        styleBlock = `
          <style>
            @keyframes typewriter-clip-${widget.instanceId}-${previewKey} {
              from { width: 0; }
              to { width: ${width}px; }
            }
            ${rectAnimations}
          </style>
        `

        contentSvg = `
          <clipPath id="typewriter-clip-${widget.instanceId}-${previewKey}">
            ${rectsHtml}
          </clipPath>
          <g clip-path="url(#typewriter-clip-${widget.instanceId}-${previewKey})">
            ${contentSvg}
          </g>
        `
      } else {
        styleBlock = `
          <style>
            @keyframes typewriter-clip-${widget.instanceId}-${previewKey} {
              from { width: 0; }
              to { width: ${width}px; }
            }
            #widget-${widget.instanceId} .typewriter-target {
              animation: typewriter-clip-${widget.instanceId}-${previewKey} ${animDuration}ms linear ${animDelay}ms both;
            }
          </style>
        `

        contentSvg = `
          <clipPath id="typewriter-clip-${widget.instanceId}-${previewKey}">
            <rect class="typewriter-target" x="0" y="0" width="0" height="${height}" />
          </clipPath>
          <g clip-path="url(#typewriter-clip-${widget.instanceId}-${previewKey})">
            ${contentSvg}
          </g>
        `
      }
    } else {
      styleBlock = `
        <style>
          @keyframes svg-fade-in-${widget.instanceId}-${previewKey} {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes svg-slide-up-${widget.instanceId}-${previewKey} {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes svg-slide-down-${widget.instanceId}-${previewKey} {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes svg-slide-left-${widget.instanceId}-${previewKey} {
            from { opacity: 0; transform: translateX(12px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes svg-slide-right-${widget.instanceId}-${previewKey} {
            from { opacity: 0; transform: translateX(-12px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes svg-zoom-in-${widget.instanceId}-${previewKey} {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes svg-zoom-out-${widget.instanceId}-${previewKey} {
            from { opacity: 0; transform: scale(1.1); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes svg-flip-x-${widget.instanceId}-${previewKey} {
            from { opacity: 0; transform: perspective(400px) rotateX(90deg); }
            to { opacity: 1; transform: perspective(400px) rotateX(0deg); }
          }
          @keyframes svg-flip-y-${widget.instanceId}-${previewKey} {
            from { opacity: 0; transform: perspective(400px) rotateY(90deg); }
            to { opacity: 1; transform: perspective(400px) rotateY(0deg); }
          }
          @keyframes svg-glitch-${widget.instanceId}-${previewKey} {
            0% { opacity: 0; transform: skewX(10deg); }
            20% { opacity: 0.8; transform: skewX(-10deg); }
            40% { opacity: 0.5; transform: skewX(5deg); }
            60% { opacity: 0.9; transform: skewX(0deg); }
            100% { opacity: 1; }
          }
          @keyframes svg-scan-lines-${widget.instanceId}-${previewKey} {
            0% { opacity: 0; clip-path: inset(100% 0 0 0); }
            100% { opacity: 1; clip-path: inset(0 0 0 0); }
          }

          #widget-${widget.instanceId} .anim-target {
            animation-name: svg-${animType}-${widget.instanceId}-${previewKey};
            animation-duration: ${animDuration}ms;
            animation-timing-function: ${easing};
            animation-fill-mode: both;
          }
        </style>
      `

      let animIndex = 0
      const isAscii = widget.widgetId === 'ascii-art' || widget.widgetId === 'ascii-text'
      const totalStaggerBudget = Math.min(animDuration * 0.6, isAscii ? 1200 : 600)

      const tagsToMatch = 'text|tspan|rect|path|image|circle|line|polygon|polyline'
      const matchRegex = new RegExp(`<(${tagsToMatch})\\b`, 'gi')
      const replaceRegex = new RegExp(`<(${tagsToMatch})\\b([^>]*)`, 'gi')

      const elementCount = (contentSvg.match(matchRegex) || []).length
      const staggerDelay = elementCount > 1 ? totalStaggerBudget / elementCount : 0

      contentSvg = contentSvg.replace(replaceRegex, (match, tag, attrs) => {
        if (attrs.includes('id=') && (attrs.includes('clip') || attrs.includes('grad')))
          return match
        if (attrs.includes('class="no-anim"') || attrs.includes('fill="none"')) return match

        const delay = animDelay + animIndex++ * staggerDelay

        let isSelfClosing = false
        if (attrs.trim().endsWith('/')) {
          isSelfClosing = true
          attrs = attrs.substring(0, attrs.lastIndexOf('/'))
        }

        let newAttrs = attrs
        if (attrs.includes('class=')) {
          newAttrs = attrs.replace(/class="([^"]*)"/i, 'class="$1 anim-target"')
        } else {
          newAttrs = ` class="anim-target"${attrs}`
        }

        return `<${tag}${newAttrs} style="animation-delay: ${Math.round(delay)}ms; transform-origin: center;"${isSelfClosing ? ' /' : ''}`
      })
    }
  }

  const innerHtml = `
      ${styleBlock}
      ${shadowRect}
      <rect x="0" y="0" width="${width}" height="${height}" fill="${bg}" stroke="${border}" stroke-width="${strokeWidth}" rx="${rx}" />
      ${templateDecorationSvg}
      ${contentSvg}
  `

  if (!includeWrapper) return innerHtml

  return `
    <g transform="translate(${x}, ${y})" id="widget-${widget.instanceId}">
${innerHtml}
    </g>
  `
}
