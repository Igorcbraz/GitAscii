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
  const imgY = showTitle ? 44 : 16
  const paddingX = 16
  const imgW = width - paddingX * 2
  const imgH = Math.max(28, height - imgY - 16)

  const imgStyle =
    mode === 'badge'
      ? 'height:32px; width:auto; max-width:100%; object-fit:contain; object-position:left center;'
      : 'width:100%; height:100%; max-width:100%; max-height:100%; object-fit:contain; object-position:left top;'

  const imgHtml = fallbackUrl
    ? `<img src="${escapeXml(url)}" alt="${escapeXml(title)}" style="${imgStyle}" onerror="this.onerror=null;this.src='${escapeXml(fallbackUrl)}';" />`
    : `<img src="${escapeXml(url)}" alt="${escapeXml(title)}" style="${imgStyle}" />`
  const innerContentHtml = targetUrl
    ? `<a href="${escapeXml(targetUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;max-width:100%;max-height:100%;">${imgHtml}</a>`
    : imgHtml

  return `
    ${showTitle ? `<text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(title)}</text>` : ''}
    <!-- EXTERNAL_WIDGET_START: ${escapeXml(url)} | ${paddingX} | ${imgY} | ${imgW} | ${imgH} | ${mode} | ${fallbackUrl ? escapeXml(fallbackUrl) : ''} -->
    <foreignObject x="${paddingX}" y="${imgY}" width="${imgW}" height="${imgH}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:flex-start;justify-content:flex-start;overflow:hidden;">
        ${innerContentHtml}
      </div>
    </foreignObject>
    <image href="${escapeXml(url)}" x="${paddingX}" y="${imgY}" width="${imgW}" height="${imgH}" preserveAspectRatio="${mode === 'badge' ? 'xMinYMid meet' : 'xMinYMin meet'}" opacity="0" />
    <!-- EXTERNAL_WIDGET_END -->
  `
}

export function renderWidgetSvg(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
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
      const avatarUrl = (cfg.avatarUrl as string) || data.user.avatar_url
      contentSvg = `
        <clipPath id="avatar-clip-${widget.instanceId}">
          <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="${Math.max(4, rx)}" />
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
              while (
                nextIndex < line.length &&
                (rowColors[nextIndex] || accent) === charColor &&
                nextIndex - charIndex < Math.max(1, Math.floor(maxCols / 25))
              ) {
                chunk += line[nextIndex]
                nextIndex++
              }
              rowSvg += `<tspan fill="${charColor}">${escapeXml(chunk)}</tspan>`
              charIndex = nextIndex
            }

            const yPos = (rowIndex + 0.85) * lineHeight
            return `<text x="0" y="${yPos}" font-family="'JetBrains Mono', monospace" font-size="${fontSize}" xml:space="preserve">${rowSvg}</text>`
          })
          .join('\n')
      } else {
        const linesContent = asciiLines
          .map((line, i) => {
            let rowSvg = ''
            for (let charIndex = 0; charIndex < line.length;) {
              let chunk = line[charIndex]
              let nextIndex = charIndex + 1
              while (
                nextIndex < line.length &&
                nextIndex - charIndex < Math.max(1, Math.floor(maxCols / 25))
              ) {
                chunk += line[nextIndex]
                nextIndex++
              }
              rowSvg += `<tspan>${escapeXml(chunk)}</tspan>`
              charIndex = nextIndex
            }
            return `<tspan x="0" dy="${i === 0 ? 0 : lineHeight}">${rowSvg}</tspan>`
          })
          .join('')

        innerContent = `
          <text x="0" y="${fontSize * 0.85}" font-family="'JetBrains Mono', monospace" font-size="${fontSize}" fill="${accent}" xml:space="preserve">
            ${linesContent}
          </text>
        `
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

      const linesContent = asciiLines
        .map((line, i) => {
          let rowSvg = ''
          for (let charIndex = 0; charIndex < line.length;) {
            let chunk = line[charIndex]
            let nextIndex = charIndex + 1
            while (
              nextIndex < line.length &&
              nextIndex - charIndex < Math.max(1, Math.floor(maxCols / 25))
            ) {
              chunk += line[nextIndex]
              nextIndex++
            }
            rowSvg += `<tspan>${escapeXml(chunk)}</tspan>`
            charIndex = nextIndex
          }
          return `<tspan x="0" dy="${i === 0 ? 0 : lineHeight}">${rowSvg}</tspan>`
        })
        .join('')

      contentSvg = `
        <svg x="16" y="16" width="${width - 32}" height="${height - 32}" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet">
          <text x="0" y="${fontSize * 0.85}" font-family="'JetBrains Mono', monospace" font-size="${fontSize}" fill="${accent}" xml:space="preserve">
            ${linesContent}
          </text>
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

      const bioLines = customBio.split('\n')
      const bioSvg = bioLines
        .map((line, i) => `<tspan x="24" dy="${i === 0 ? 0 : 20}">${escapeXml(line)}</tspan>`)
        .join('')

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
        <g transform="translate(24, ${height - 24})">
          ${locationSvg}
          ${blogSvg}
        </g>
      `
      break
    }

    case 'stats': {
      const stars = data.totalStars
      const repos = data.user.public_repos
      const followers = data.user.followers
      const following = data.user.following

      const statItems = [
        { label: 'STARS', val: stars.toLocaleString() },
        { label: 'REPOS', val: repos.toLocaleString() },
        { label: 'FOLLOWERS', val: followers.toLocaleString() },
        { label: 'FOLLOWING', val: following.toLocaleString() },
      ]

      const itemWidth = (width - 48) / statItems.length

      contentSvg = `
        <text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ GITHUB METRICS ]</text>
        ${statItems
          .map(
            (item, i) => `
          <g transform="translate(${24 + i * itemWidth}, 56)">
            <text x="0" y="24" font-family="${globalStyles.fontFamily}" font-size="28" font-weight="300" fill="${accent}">${item.val}</text>
            <text x="0" y="44" font-family="${globalStyles.fontFamily}" font-size="10" font-weight="500" fill="#7a7a7a" letter-spacing="1.5">${item.label}</text>
          </g>
        `
          )
          .join('')}
      `
      break
    }

    case 'languages': {
      const hideLangs =
        typeof cfg.hideLangs === 'string'
          ? cfg.hideLangs
              .split(',')
              .map((l) => l.trim().toLowerCase())
              .filter(Boolean)
          : []

      let filteredLangs = Object.entries(data.languages)
      if (hideLangs.length > 0) {
        filteredLangs = filteredLangs.filter(([lang]) => !hideLangs.includes(lang.toLowerCase()))
      }

      const maxLangs = Number(cfg.langsCount) || 5
      const topLangs = filteredLangs.slice(0, maxLangs)
      const totalCount = topLangs.reduce((sum, [_, count]) => sum + count, 0) || 1

      const colors: Record<string, string> = {
        TypeScript: '#3178c6',
        JavaScript: '#f1e05a',
        Rust: '#dea584',
        Python: '#3572A5',
        CSS: '#563d7c',
        HTML: '#e34c26',
      }

      let currentX = 24
      const barWidth = width - 48
      const barSvg = topLangs
        .map(([lang, count]) => {
          const w = (count / totalCount) * barWidth
          const rect = `<rect x="${currentX}" y="52" width="${w}" height="8" fill="${colors[lang] || accent}" rx="2" />`
          currentX += w
          return rect
        })
        .join('')

      const legendSvg = topLangs
        .map(([lang, count], i) => {
          const pct = Math.round((count / totalCount) * 100)
          return `
          <g transform="translate(${24 + (i % 2) * (barWidth / 2)}, ${80 + Math.floor(i / 2) * 24})">
            <circle cx="6" cy="-4" r="4" fill="${colors[lang] || accent}" />
            <text x="16" y="0" font-family="'Inter Tight', sans-serif" font-size="12" fill="${textClr}">${lang} <tspan fill="#7a7a7a">${pct}%</tspan></text>
          </g>
        `
        })
        .join('')

      contentSvg = `
        <text x="24" y="32" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ TOP LANGUAGES ]</text>
        ${barSvg}
        ${legendSvg}
      `
      break
    }

    case 'repositories': {
      const repos = data.repos.slice(0, 2)
      contentSvg = `
        <text x="24" y="32" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">[ FEATURED REPOSITORIES ]</text>
        ${repos
          .map(
            (repo, i) => `
          <g transform="translate(24, ${50 + i * 64})">
            <rect x="0" y="0" width="${width - 48}" height="52" fill="#252525" border="1px solid #313131" rx="4" />
            <text x="16" y="24" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="500" fill="${accent}">${escapeXml(repo.name)}</text>
            <text x="${width - 64}" y="24" font-family="'Inter Tight', sans-serif" font-size="12" fill="#7a7a7a" text-anchor="end">★ ${repo.stargazers_count}</text>
            <text x="16" y="42" font-family="'Inter Tight', sans-serif" font-size="11" fill="#7a7a7a">${escapeXml(repo.description || 'No description.')}</text>
          </g>
        `
          )
          .join('')}
      `
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

  let styleBlock = ''
  const animType = (cfg.animationType as string) || 'none'
  const animDuration = (cfg.animationDuration as number) || 600
  const animDelay = (cfg.animationDelay as number) || 0
  const animEasing = (cfg.animationEasing as string) || 'ease-out'
  const previewKey = (cfg.animationPreviewKey as number) || 0

  if (animType !== 'none') {
    const easing = animEasing === 'spring' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : animEasing

    if (animType === 'typewriter') {
      if (widget.widgetId === 'ascii-art' || widget.widgetId === 'ascii-text') {
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

        let rectsHtml = ''
        let rectAnimations = ''
        const lineTime = animDuration / Math.max(1, linesCount)

        for (let i = 0; i < linesCount; i++) {
          rectsHtml += `<rect class="typewriter-line-${widget.instanceId}-${previewKey}-${i}" x="0" y="${i * lineHeight}" width="0" height="${lineHeight + 2}" />\n          `
          rectAnimations += `
            #widget-${widget.instanceId} .typewriter-line-${widget.instanceId}-${previewKey}-${i} {
              animation: typewriter-clip-${widget.instanceId}-${previewKey} ${lineTime}ms linear ${animDelay + i * lineTime}ms both;
            }`
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

      const tagsToMatch = 'text|tspan|rect|path|image'
      const matchRegex = new RegExp(`<(${tagsToMatch})\\b`, 'gi')
      const replaceRegex = new RegExp(`<(${tagsToMatch})\\b([^>]*)`, 'gi')

      const elementCount = (contentSvg.match(matchRegex) || []).length
      const staggerDelay = elementCount > 1 ? totalStaggerBudget / elementCount : 0

      contentSvg = contentSvg.replace(replaceRegex, (match, tag, attrs) => {
        if (attrs.includes('id=') && (attrs.includes('clip') || attrs.includes('grad')))
          return match
        if (attrs.includes('class="no-anim"') || attrs.includes('fill="none"')) return match

        const delay = animDelay + animIndex++ * staggerDelay

        let newAttrs = attrs
        if (attrs.includes('class=')) {
          newAttrs = attrs.replace(/class="([^"]*)"/i, 'class="$1 anim-target"')
        } else {
          newAttrs = ` class="anim-target"${attrs}`
        }

        return `<${tag}${newAttrs} style="animation-delay: ${Math.round(delay)}ms; transform-origin: center;"`
      })
    }
  }

  return `
    <g transform="translate(${x}, ${y})" id="widget-${widget.instanceId}">
      ${styleBlock}
      ${shadowRect}
      <rect x="0" y="0" width="${width}" height="${height}" fill="${bg}" stroke="${border}" stroke-width="${strokeWidth}" rx="${rx}" />
      ${templateDecorationSvg}
      ${contentSvg}
    </g>
  `
}
