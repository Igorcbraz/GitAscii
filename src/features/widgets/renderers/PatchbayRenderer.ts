import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import type { GitHubRepo } from '@/features/github/types/github'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function shorten(value: string, maximumLength: number): string {
  return value.length <= maximumLength ? value : `${value.slice(0, maximumLength - 1).trimEnd()}…`
}

export function renderPatchbay(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  const isDark = true
  const background = isDark ? '#090B0F' : '#C7CBC8'
  const panel = isDark ? '#10151C' : '#D9DCD7'
  const faceplate = isDark ? '#161C26' : '#E7E9E3'
  const ink = isDark ? '#F2EFE3' : '#1E242A'
  const muted = isDark ? '#9BA7B5' : '#5A6470'
  const rule = isDark ? '#2B3543' : '#AFB5AC'
  const brass = isDark ? '#F2B23E' : '#8A6708'
  const coral = isDark ? '#F26A3D' : '#B8431F'
  const steel = isDark ? '#7F96AC' : '#41586F'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  if (layoutType === 'hero') {
    const repos = data.repos || []
    const heroLayers = repos.slice(0, 6)
    const count = heroLayers.length
    const username = escapeXml(
      ((cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'USER').toUpperCase()
    )
    const bioText = escapeXml(
      shorten(
        (cfg.customBio ? String(cfg.customBio) : data.user?.bio) ||
          'Building the systems around coding agents...',
        75
      )
    )
    const locText = escapeXml((data.user?.location || 'EARTH').toUpperCase())

    const rows = heroLayers
      .map((repo, i) => {
        const accent = i < 2 ? brass : coral
        return `
      <g class="patch-rise" style="animation-delay:${100 + i * 55}ms">
        <path d="M585 ${151.5 + i * 9}C622 ${151.5 + i * 9} 644 ${70 + i * 44} 686 ${70 + i * 44}" fill="none" stroke="${accent}" stroke-opacity=".72"/><path class="patch-flow" d="M585 ${151.5 + i * 9}C622 ${151.5 + i * 9} 644 ${70 + i * 44} 686 ${70 + i * 44}" fill="none" stroke="${brass}" stroke-width="1.5"/>
        <use href="#patch-jack-${widget.instanceId}" transform="translate(694 ${70 + i * 44})"/><circle class="patch-led" style="animation-delay:${(i * 0.41).toFixed(2)}s" cx="710" cy="${62 + i * 44}" r="2.4" fill="${coral}"/>
        <text x="724" y="${66 + i * 44}" class="patch-label" font-size="12" font-weight="800" fill="${ink}">${escapeXml(shorten(repo.name, 35))}</text><text x="1142" y="${66 + i * 44}" text-anchor="end" class="patch-mono" font-size="7.5" letter-spacing="1.3" fill="${accent}">${escapeXml(shorten(repo.language || 'CODE', 12).toUpperCase())}</text>
        <text x="724" y="${83 + i * 44}" class="patch-label" font-size="8.7" fill="${muted}">${escapeXml(shorten(repo.description || '', 65))}</text><path d="M724 ${92 + i * 44}H1142" stroke="${rule}"/>
      </g>`
      })
      .join('')

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" role="img" aria-label="patch bay profile" data-mode="dark">
      <defs>
        <pattern id="patch-grid-${widget.instanceId}" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="${rule}" fill-opacity=".35"/></pattern>
        <g id="patch-jack-${widget.instanceId}"><circle r="7.5" fill="none" stroke="${steel}" stroke-width="2"/><circle r="3.1" fill="${background}"/></g>
      </defs><style>
        .patch-label{font-family:Avenir Next Condensed,Arial Narrow,sans-serif}.patch-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .patch-flow{stroke-dasharray:10 14;animation:patch-flow 6s linear infinite}.patch-led{animation:patch-led 2.6s ease-in-out infinite}.patch-vu{transform-box:fill-box;transform-origin:bottom;animation:patch-vu 1.9s ease-in-out infinite}.patch-rise{animation:patch-rise .6s cubic-bezier(.2,.75,.2,1) both}
        @keyframes patch-flow{to{stroke-dashoffset:-120}}@keyframes patch-led{50%{opacity:.2}}@keyframes patch-vu{0%,100%{transform:scaleY(.25)}45%{transform:scaleY(1)}70%{transform:scaleY(.55)}}@keyframes patch-rise{from{opacity:.15;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){.patch-flow,.patch-led,.patch-vu,.patch-rise{animation:none}}
      </style><rect width="1200" height="360" fill="${background}"/><rect x="14" y="14" width="1172" height="332" fill="${panel}" stroke="${rule}"/><rect x="14" y="14" width="1172" height="332" fill="url(#patch-grid-${widget.instanceId})"/>
      <rect x="30" y="30" width="500" height="300" fill="${faceplate}" fill-opacity=".62" stroke="${rule}"/><circle cx="42" cy="42" r="2.6" fill="${steel}"/><circle cx="518" cy="42" r="2.6" fill="${steel}"/><circle cx="42" cy="318" r="2.6" fill="${steel}"/><circle cx="518" cy="318" r="2.6" fill="${steel}"/><path d="M545 30V330" stroke="${rule}"/><path d="M585 58V322" stroke="${steel}" stroke-opacity=".6"/>
      <g class="patch-rise"><text x="50" y="49" class="patch-mono" font-size="8" letter-spacing="2.3" fill="${brass}">PATCH BAY / SIGNAL ROUTING</text><circle class="patch-led" cx="510" cy="46" r="3" fill="${coral}"/><text x="50" y="82" class="patch-label" font-size="12" font-weight="800" letter-spacing="2" fill="${ink}">${username}</text>
      <text x="48" y="133" class="patch-label" font-size="36" font-weight="800" fill="${ink}">AI AGENT</text><text x="48" y="169" class="patch-label" font-size="36" font-weight="800" fill="${brass}">INFRASTRUCTURE</text>
      <path d="M50 210H132" stroke="${brass}" stroke-width="4"/><text x="50" y="238" class="patch-label" font-size="11" fill="${muted}">${bioText}</text>
      <text x="50" y="276" class="patch-mono" font-size="8" letter-spacing="1.5" fill="${ink}">${String(count).padStart(2, '0')} CHANNELS · 08 BUS LINES</text><text x="50" y="304" class="patch-mono" font-size="8" letter-spacing="1.6" fill="${muted}">RACK / ${locText} · UTC+8</text></g>
      <rect class="patch-vu" style="animation-delay:0.00s" x="440" y="266" width="5" height="34" rx="1" fill="${brass}"/><rect class="patch-vu" style="animation-delay:0.23s" x="449" y="278" width="5" height="22" rx="1" fill="${brass}"/><rect class="patch-vu" style="animation-delay:0.46s" x="458" y="272" width="5" height="28" rx="1" fill="${coral}"/><rect class="patch-vu" style="animation-delay:0.69s" x="467" y="284" width="5" height="16" rx="1" fill="${brass}"/><rect class="patch-vu" style="animation-delay:0.92s" x="476" y="270" width="5" height="30" rx="1" fill="${brass}"/><rect class="patch-vu" style="animation-delay:1.15s" x="485" y="280" width="5" height="20" rx="1" fill="${coral}"/><rect class="patch-vu" style="animation-delay:1.38s" x="494" y="274" width="5" height="26" rx="1" fill="${brass}"/><rect class="patch-vu" style="animation-delay:1.61s" x="503" y="286" width="5" height="14" rx="1" fill="${brass}"/>
      <text x="660" y="47" class="patch-label" font-size="15" font-weight="800" fill="${ink}">Patched channels</text><text x="1142" y="47" text-anchor="end" class="patch-mono" font-size="8" letter-spacing="1.4" fill="${muted}">BUS / MAJIAYU000</text>
      ${rows}
      <circle cx="500" cy="315" r="3" fill="${primary}"/><circle cx="512" cy="315" r="3" fill="${secondary}"/>
    </svg>`
  }

  const repos = data.repos || []
  const layers = repos.slice(0, 8)
  const count = layers.length

  const rows = layers
    .map((layer: GitHubRepo, index: number) => {
      const column = Math.floor(index / 4)
      const row = index % 4
      const x = 250 + column * 270
      const y = 85 + row * 50
      const accent = index % 2 === 0 ? brass : coral
      const name = escapeXml(shorten(layer.name, 16))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          15
        )
      )

      return `
        <g class="patch-rise" style="animation-delay:${index * 42}ms">
          <circle cx="${x}" cy="${y - 4}" r="8" fill="none" stroke="${steel}" stroke-width="1.5"/>
          <circle cx="${x}" cy="${y - 4}" r="3.1" fill="${background}"/>
          <text x="${x + 18}" y="${y - 8}" font-family="ui-monospace, monospace" font-size="7.5" letter-spacing="1.3" fill="${accent}">${String(index + 1).padStart(2, '0')} / ${name.toUpperCase()}</text>
          <text x="${x + 18}" y="${y + 8}" font-family="sans-serif" font-size="11" font-weight="800" fill="${ink}">${lang}</text>
          <text x="${x + 18}" y="${y + 20}" font-family="sans-serif" font-size="8.5" fill="${muted}">★ ${layer.stargazers_count || 0}</text>
          <path d="M${x + 18} ${y + 26} H${x + 250}" stroke="${rule}" stroke-width="0.5"/>
        </g>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          .patch-label { font-family: sans-serif; }
          .patch-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
        <pattern id="patch-grid-${widget.instanceId}" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="${rule}" fill-opacity="0.35"/>
        </pattern>
      </defs>

      <rect width="800" height="330" fill="${background}"/>
      <rect x="10" y="10" width="780" height="310" fill="${panel}" stroke="${rule}" stroke-width="1"/>
      <rect x="10" y="10" width="780" height="310" fill="url(#patch-grid-${widget.instanceId})"/>

      <!-- VU Meter strip & faceplate -->
      <g>
        <rect x="25" y="25" width="165" height="280" fill="${faceplate}" fill-opacity="0.66" stroke="${rule}"/>
        <text x="107" y="54" text-anchor="middle" class="patch-mono" font-size="8" letter-spacing="2.1" fill="${brass}">CHANNEL STRIP</text>
        <text x="107" y="90" text-anchor="middle" class="patch-label" font-size="20" font-weight="800" fill="${ink}">Cable routing</text>
        
        <!-- Large number patched -->
        <text x="107" y="180" text-anchor="middle" class="patch-label" font-size="52" font-weight="800" fill="${ink}">${String(count).padStart(2, '0')}</text>
        <text x="107" y="210" text-anchor="middle" class="patch-mono" font-size="8" letter-spacing="1.8" fill="${coral}">CHANNELS PATCHED</text>
      </g>

      <!-- Patch bay titles -->
      <g>
        <text x="210" y="40" class="patch-mono" font-size="10" letter-spacing="2" fill="${brass}">PATCH BAY / CABLE ROUTING</text>
        <text x="770" y="40" text-anchor="end" class="patch-mono" font-size="8" letter-spacing="1.4" fill="${muted}">LEDGER // VOL. 01</text>
        <path d="M210 52 H770" stroke="${rule}" stroke-width="1"/>
        <path d="M480 60 V300" stroke="${rule}" stroke-width="1"/>
      </g>

      <!-- Rendered jack channels -->
      ${rows}
    </svg>
  `
}
