import { GITHUB_THEME_KEYS, isGitHubAdaptiveTheme, WIDGET_IDS } from '@/constants'

import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '../types'
import { renderWidgetContent } from './WidgetRegistry'

export function getWidgetMinSize(
  widget: WidgetInstance,
  data: NormalizedGitHubData
): { width: number; height: number } | null {
  if (!widget) return null
  if (widget.widgetId === WIDGET_IDS.BIO) {
    const width = Math.max(100, Number(widget.size?.width) || 800)
    const cfg = widget.config || {}
    const customBio =
      cfg.customBio !== undefined ? String(cfg.customBio) : data?.user?.bio || 'No bio provided.'
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
  if (widget.widgetId === WIDGET_IDS.REPOSITORIES) {
    const width = Math.max(100, Number(widget.size?.width) || 800)
    const cfg = widget.config || {}
    const maxRepos = Number(cfg.maxRepos) || 3
    const repoViewMode = (cfg.repoViewMode as string) || 'list'
    const showRepoDesc = cfg.showRepoDesc !== false
    const showRepoLanguage = cfg.showRepoLanguage !== false
    const showRepoForks = Boolean(cfg.showRepoForks)
    const showRepoStars = cfg.showRepoStars !== false
    const showRepoUpdated = Boolean(cfg.showRepoUpdated)

    if (repoViewMode === 'grid') {
      const rows = Math.ceil(maxRepos / 2)
      const requiredHeight = 50 + rows * (80 + 12) + 16
      return { width, height: requiredHeight }
    }

    const metaLineNeeded = showRepoLanguage || showRepoForks || showRepoStars || showRepoUpdated
    const cardH = 24 + (showRepoDesc ? 18 : 0) + (metaLineNeeded ? 18 : 0) + 8
    const rowSpacing = cardH + 8
    const requiredHeight = 50 + maxRepos * rowSpacing + 16
    return { width, height: requiredHeight }
  }
  return null
}

export function renderWidgetSvg(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  includeWrapper: boolean = true,
  forceStatic: boolean = false
): string {
  if (!widget || !widget.visible) return ''

  const x = Number(widget.position?.x) || 0
  const y = Number(widget.position?.y) || 0
  const width = Math.max(1, Number(widget.size?.width) || 800)
  const height = Math.max(1, Number(widget.size?.height) || 100)
  const cfg = widget.config || {}
  const globalStylesSafe = globalStyles || ({} as GlobalStyles)

  const rawBg = (cfg.backgroundColor as string) || globalStylesSafe.backgroundColor || '#1f1f1f'
  const isAdaptiveWidgetBg = isGitHubAdaptiveTheme(rawBg)
  const bg = isAdaptiveWidgetBg ? GITHUB_THEME_KEYS.DARK : rawBg
  const border = (cfg.borderColor as string) || globalStylesSafe.borderColor || '#252525'
  const textClr = (cfg.textColor as string) || globalStylesSafe.textColor || '#ffffff'
  const accent = (cfg.accentColor as string) || globalStylesSafe.accentColor || '#c5ff4a'
  const rx =
    cfg.borderRadius !== undefined
      ? Number(cfg.borderRadius) || 0
      : globalStylesSafe.borderRadius || 0

  let contentSvg = renderWidgetContent(widget, data, globalStylesSafe, forceStatic)

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
        widget.widgetId === WIDGET_IDS.ASCII_ART ||
        widget.widgetId === WIDGET_IDS.ASCII_TEXT ||
        widget.widgetId.startsWith('terminal-')
      ) {
        let rectsHtml = ''
        let rectAnimations = ''

        if (widget.widgetId.startsWith('terminal-')) {
          const textTagMatches = contentSvg.match(/<text[^<>]*>/gi) || []
          const yValues: number[] = []
          for (const tag of textTagMatches) {
            const yMatch = tag.match(/\by="([0-9.]+)"/i)
            if (yMatch) {
              yValues.push(parseFloat(yMatch[1]))
            }
          }
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
          const fontSize =
            Number(cfg.fontSize) || (widget.widgetId === WIDGET_IDS.ASCII_TEXT ? 12 : 9)
          const lineHeight =
            widget.widgetId === WIDGET_IDS.ASCII_TEXT
              ? fontSize * 1.2
              : Math.max(7, Math.round(fontSize * 1.12))

          let linesCount = 1
          if (widget.widgetId === WIDGET_IDS.ASCII_ART) {
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
      const isAscii =
        widget.widgetId === WIDGET_IDS.ASCII_ART || widget.widgetId === WIDGET_IDS.ASCII_TEXT
      const totalStaggerBudget = Math.min(animDuration * 0.6, isAscii ? 1200 : 600)

      const tagsToMatch = 'text|tspan|rect|path|image|circle|line|polygon|polyline'
      const matchRegex = new RegExp(`<(${tagsToMatch})\\b`, 'gi')
      const replaceRegex = new RegExp(`<(${tagsToMatch})\\b([^<>]*)`, 'gi')

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

  const isSelfContained =
    contentSvg.trim().startsWith('<svg') ||
    widget.widgetId.startsWith('controlplane-') ||
    widget.widgetId.startsWith('codeweb-') ||
    widget.widgetId === WIDGET_IDS.GITFUT_CARD ||
    widget.widgetId === WIDGET_IDS.POKEMON_CARD ||
    Boolean(cfg.transparentBackground)

  const baseBackgroundRect = isSelfContained
    ? ''
    : `<rect class="${isAdaptiveWidgetBg ? 'gitascii-canvas-bg' : ''}" x="0" y="0" width="${width}" height="${height}" fill="${bg}" stroke="${border}" stroke-width="${strokeWidth}" rx="${rx}" />`

  const innerHtml = `
      ${styleBlock}
      ${shadowRect}
      ${baseBackgroundRect}
      ${isSelfContained ? '' : templateDecorationSvg}
      ${contentSvg}
  `

  if (!includeWrapper) return innerHtml

  return `
    <g transform="translate(${x}, ${y})" id="widget-${widget.instanceId}">
${innerHtml}
    </g>
  `
}
