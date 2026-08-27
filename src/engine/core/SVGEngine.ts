import {
  EXTERNAL_LINKS,
  GITHUB_THEME_KEYS,
  isGitHubAdaptiveTheme,
  WIDGET_ALIASES,
} from '@/constants'

import type {
  GlobalStyles,
  NormalizedGitHubData,
  RenderOptions,
  SavedConfiguration,
  WidgetInstance,
} from '../types'
import { renderWidgetSvg } from './WidgetRenderer'

export function normalizeProfileData(
  data: NormalizedGitHubData | null | undefined
): NormalizedGitHubData {
  const user = data?.user || ({} as any)

  return {
    user: {
      id: Number(user.id) || 0,
      login: typeof user.login === 'string' && user.login ? user.login : 'user',
      name: typeof user.name === 'string' ? user.name : user.login || 'User',
      avatar_url: typeof user.avatar_url === 'string' ? user.avatar_url : '',
      bio: typeof user.bio === 'string' ? user.bio : '',
      company: typeof user.company === 'string' ? user.company : null,
      blog: typeof user.blog === 'string' ? user.blog : '',
      location: typeof user.location === 'string' ? user.location : null,
      email: typeof user.email === 'string' ? user.email : null,
      twitter_username: typeof user.twitter_username === 'string' ? user.twitter_username : null,
      public_repos: Number(user.public_repos) || 0,
      public_gists: Number(user.public_gists) || 0,
      followers: Number(user.followers) || 0,
      following: Number(user.following) || 0,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
    },

    repos: Array.isArray(data?.repos) ? data!.repos.filter(Boolean) : [],
    languages: data?.languages && typeof data.languages === 'object' ? data.languages : {},
    totalStars: Number(data?.totalStars) || 0,
    totalForks: Number(data?.totalForks) || 0,
    readmeContent: typeof data?.readmeContent === 'string' ? data.readmeContent : null,
    socialAccounts: Array.isArray(data?.socialAccounts) ? data!.socialAccounts.filter(Boolean) : [],
    contributions: data?.contributions || {
      totalContributions: 0,
      weeks: [],
    },
  }
}

function resolveTargetWidgetIds(targetWidgetIds?: string[]): string[] | undefined {
  if (!targetWidgetIds || targetWidgetIds.length === 0) return undefined
  const resolved = new Set<string>()
  for (const id of targetWidgetIds) {
    const cleanId = id.trim().toLowerCase()
    if (!cleanId) continue
    resolved.add(cleanId)
    const aliases = WIDGET_ALIASES[cleanId]
    if (aliases) {
      aliases.forEach((a) => resolved.add(a))
    }
  }
  return resolved.size > 0 ? Array.from(resolved) : undefined
}

export function renderSvg(
  config: SavedConfiguration,
  data: NormalizedGitHubData,
  options: RenderOptions = {}
): string {
  const safeData = normalizeProfileData(data)
  const isLight = options.theme === 'light'

  const safeConfig: SavedConfiguration = config || {
    version: 1,
    githubId: safeData.user.id,
    username: safeData.user.login,
    profileSlug: 'default',
    profileName: 'Default',
    templateId: 'terminal',
    widgets: [],
    globalStyles: {
      backgroundColor: '#060606',
      textColor: '#ffffff',
      accentColor: '#c5ff4a',
      borderColor: '#252525',
      fontFamily: "'JetBrains Mono', monospace",
      borderRadius: 0,
      padding: 24,
      themeMode: 'dark',
      templateStyle: 'terminal',
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1,
    },
  }

  const globalStyles = safeConfig.globalStyles || ({} as GlobalStyles)
  const isAdaptiveBg =
    isGitHubAdaptiveTheme(globalStyles.backgroundColor) || globalStyles.themeMode === 'auto'
  const bg = isAdaptiveBg
    ? isLight
      ? GITHUB_THEME_KEYS.LIGHT
      : GITHUB_THEME_KEYS.DARK
    : isLight
      ? GITHUB_THEME_KEYS.LIGHT
      : globalStyles.backgroundColor || '#060606'
  const isTransparent = Boolean(globalStyles.transparentBackground)

  const rawTargetWidgetIds = options.widgets
  const targetWidgetIds = resolveTargetWidgetIds(rawTargetWidgetIds)
  const allWidgets = Array.isArray(safeConfig.widgets) ? safeConfig.widgets : []

  let visibleWidgets = allWidgets.filter(
    (w) =>
      w &&
      w.visible &&
      (!targetWidgetIds ||
        targetWidgetIds.includes(w.instanceId) ||
        targetWidgetIds.includes(w.widgetId?.toLowerCase()))
  )

  if (targetWidgetIds && visibleWidgets.length === 0) {
    const primaryTarget = rawTargetWidgetIds?.[0]?.toLowerCase()
    if (primaryTarget) {
      const aliasTarget = (WIDGET_ALIASES[primaryTarget] || [primaryTarget])[0]
      const synthesizedWidget: WidgetInstance = {
        widgetId: aliasTarget,
        instanceId: `standalone_${primaryTarget}`,
        name: primaryTarget,
        position: { x: 0, y: 0 },
        size: { width: 800, height: 240 },
        config: {},
        locked: false,
        visible: true,
        zIndex: 1,
      }
      visibleWidgets = [synthesizedWidget]
    } else {
      visibleWidgets = allWidgets.filter((w) => w && w.visible)
    }
  }

  const shrinkWrap = Boolean(targetWidgetIds && visibleWidgets.length > 0)

  const minX =
    shrinkWrap && visibleWidgets.length > 0
      ? Math.min(...visibleWidgets.map((w) => Number(w?.position?.x) || 0))
      : 0

  const minY =
    shrinkWrap && visibleWidgets.length > 0
      ? Math.min(...visibleWidgets.map((w) => Number(w?.position?.y) || 0))
      : 0

  const adjustedWidgets = visibleWidgets.map((w) => ({
    ...w,
    position: {
      x: (Number(w?.position?.x) || 0) - minX,
      y: (Number(w?.position?.y) || 0) - minY,
    },
    size: {
      width: Math.max(1, Number(w?.size?.width) || 800),
      height: Math.max(1, Number(w?.size?.height) || 100),
    },
  }))

  let maxX = shrinkWrap ? 0 : 800
  let maxY = shrinkWrap ? 0 : 100

  adjustedWidgets.forEach((w) => {
    const right = w.position.x + w.size.width
    const bottom = w.position.y + w.size.height
    if (right > maxX) maxX = right
    if (bottom > maxY) maxY = bottom
  })

  const width = options.width || (shrinkWrap ? Math.max(maxX, 1) : 800)
  const height = options.height || (shrinkWrap ? Math.max(maxY, 1) : maxY + 16)

  const widgetsSvg = adjustedWidgets
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    .map((widget) => renderWidgetSvg(widget, safeData, globalStyles))
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <style>
    @import url('${EXTERNAL_LINKS.GOOGLE_FONTS_CSS.replace(/&/g, '&amp;')}');

    * {
      box-sizing: border-box;
    }

    text {
      user-select: none;
    }

    .gitascii-canvas-bg {
      fill: #0d1117;
      transition: fill 0.3s ease;
    }

    @media (prefers-color-scheme: light) {
      .gitascii-canvas-bg {
        fill: #ffffff !important;
      }
    }

    @media (prefers-color-scheme: dark) {
      .gitascii-canvas-bg {
        fill: #0d1117 !important;
      }
    }
  </style>

  ${!isTransparent ? `<rect class="${isAdaptiveBg ? 'gitascii-canvas-bg' : ''}" width="${width}" height="${height}" fill="${bg}" rx="${globalStyles.borderRadius || 0}" />` : ''}

  ${widgetsSvg}
</svg>`
}
