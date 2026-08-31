import { EXTERNAL_LINKS } from '@/constants'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { renderDeveloperQuoteSvg } from '@/features/widgets/renderers/DeveloperQuoteRenderer'
import { renderExternalWidgetSvg } from '@/features/widgets/renderers/externalWidgetHelper'
import { API_ENDPOINTS } from '@/services/endpoints'

export function renderExternalWidgets(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#c5ff4a'
  const border = (cfg.borderColor as string) || globalStyles.borderColor || '#252525'

  switch (widget.widgetId) {
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

      return renderExternalWidgetSvg(
        statsUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        globalStyles.accentColor || '',
        'contain'
      )
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

      let statsUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.README_STATS(
        username,
        `&show_icons=${showIcons}&theme=${theme}${countPrivate ? '&count_private=true' : ''}${includeAllCommits ? '&include_all_commits=true' : ''}${hideRank ? '&hide_rank=true' : ''}${hideBorder ? '&hide_border=true' : ''}`
      )
      if (statType === 'top-langs') {
        statsUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.TOP_LANGS(
          username,
          `&layout=${layout}&langs_count=${langsCount}&theme=${theme}${hideLangs ? `&hide=${encodeURIComponent(hideLangs)}` : ''}${hideBorder ? '&hide_border=true' : ''}`
        )
      } else if (statType === 'pin') {
        statsUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.PIN_REPO(
          username,
          repoName,
          `&theme=${theme}${hideBorder ? '&hide_border=true' : ''}`
        )
      }

      return renderExternalWidgetSvg(
        statsUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
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

      let statsUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.GH_STATS(embedType, username, theme)

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

      return renderExternalWidgetSvg(
        statsUrl,
        width,
        height,
        customTitle || '[ GHSTATS.DEV ]',
        !hideTitle && embedType !== 'card',
        globalStyles,
        accent,
        'contain'
      )
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

      const streakUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.STREAK_STATS(
        username,
        `&theme=${theme}&mode=${mode}&date_format=${encodeURIComponent(dateFormat)}&border_radius=${streakBorderRadius}${hideBorder ? '&hide_border=true' : ''}`
      )

      return renderExternalWidgetSvg(
        streakUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
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

      const trophyUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.PROFILE_TROPHY(
        username,
        `&theme=${theme}&column=${column}&row=${row}${noFrame ? '&margin-w=0' : ''}${noBg ? '&no-bg=true' : ''}`
      )

      return renderExternalWidgetSvg(
        trophyUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
    }

    case 'activity-graph': {
      const username = (cfg.username as string) || data.user.login
      const theme = (cfg.theme as string) || 'github-dark'
      const days = Number(cfg.days) || 31
      const showArea = cfg.showArea !== false
      const hideBorder = Boolean(cfg.hideBorder)

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ ACTIVITY GRAPH ]'

      const graphUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.ACTIVITY_GRAPH(
        username,
        `&theme=${theme}&days=${days}&area=${showArea}${hideBorder ? '&hide_border=true' : ''}`
      )

      return renderExternalWidgetSvg(
        graphUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
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
      const snakeUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.JSDELIVR_GH(
        username,
        username,
        branch,
        snakeFileName
      )
      const fallbackSnakeUrl =
        API_ENDPOINTS.EXTERNAL_RESOURCES.PLATANE_FALLBACK_SNAKE(snakeFileName)

      return renderExternalWidgetSvg(
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
    }

    case 'metrics-card': {
      const username = (cfg.username as string) || data.user.login
      const template = (cfg.template as string) || 'classic'
      const baseSections = (cfg.baseSections as string) || 'header,activity,community,repositories'

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ GITHUB METRICS CARD ]'

      const metricsUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.LECOQ_METRICS(
        username,
        template,
        baseSections
      )

      return renderExternalWidgetSvg(
        metricsUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'contain'
      )
    }

    case 'views-counter': {
      const username = (cfg.username as string) || data.user.login
      const color = (cfg.color as string) || '00f0ff'
      const style = (cfg.style as string) || 'for-the-badge'
      const label = (cfg.label as string) || 'PROFILE VIEWS'
      const baseVal = Number(cfg.baseVal) || 0

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ VIEWS COUNTER ]'

      const viewsUrl = API_ENDPOINTS.EXTERNAL_WIDGETS.KOMAREV_VIEWS(
        username,
        `&color=${color}&style=${style}&label=${encodeURIComponent(label)}${baseVal > 0 ? `&base=${baseVal}` : ''}`
      )

      return renderExternalWidgetSvg(
        viewsUrl,
        width,
        height,
        customTitle,
        showTitle,
        globalStyles,
        accent,
        'badge'
      )
    }

    case 'readme-quotes': {
      return renderDeveloperQuoteSvg(
        cfg,
        width,
        height,
        globalStyles,
        accent,
        data.user?.login || 'user'
      )
    }

    case 'awesome-badge': {
      const badgeStyle = (cfg.badgeStyle as string) || 'for-the-badge'
      const badgeColor = (cfg.badgeColor as string) || 'brightgreen'
      const label = (cfg.label as string) || 'Awesome GitHub Profile'
      const logo = (cfg.logo as string) || 'github'

      const showTitle = cfg.showTitle !== false
      const customTitle = (cfg.customTitle as string) || '[ AWESOME PROFILE BADGE ]'

      const badgeUrl = API_ENDPOINTS.SHIELDS_IO.BADGE(
        label,
        'Featured',
        badgeColor,
        badgeStyle,
        logo
      )
      const targetUrl = EXTERNAL_LINKS.AWESOME_GITHUB_PROFILE_README

      return renderExternalWidgetSvg(
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
    }

    case 'custom-image': {
      const imageUrl = (cfg.imageUrl as string) || (cfg.src as string) || (cfg.url as string) || ''
      const targetUrl = (cfg.targetUrl as string) || (cfg.href as string) || undefined
      const showTitle = cfg.showTitle === true
      const customTitle = (cfg.customTitle as string) || '[ IMAGE ]'
      const mode = (cfg.mode as 'contain' | 'badge') || 'contain'

      if (!imageUrl) {
        return `
          <rect width="${width}" height="${height}" fill="#18181b" rx="4" opacity="0.6" stroke="${border}" stroke-width="1" />
          <text x="${width / 2}" y="${height / 2 - 6}" text-anchor="middle" font-family="${globalStyles.fontFamily}" font-size="12" fill="${accent}">📷 [ IMAGEM CUSTOMIZADA ]</text>
          <text x="${width / 2}" y="${height / 2 + 14}" text-anchor="middle" font-family="${globalStyles.fontFamily}" font-size="10" fill="#71717a">Cole a URL ou faça upload no painel de propriedades</text>
        `
      }

      return renderExternalWidgetSvg(
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

    default:
      return ''
  }
}
