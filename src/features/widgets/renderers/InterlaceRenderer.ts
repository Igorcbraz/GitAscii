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

export function renderInterlace(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config
  const layoutType = (cfg.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  const isDark = true
  const canvas = isDark ? '#241F19' : '#F1E5CF'
  const ink = isDark ? '#F1E5CF' : '#28231D'
  const muted = isDark ? '#B7A990' : '#756957'
  const rule = isDark ? '#5B5042' : '#C8B99F'
  const warpColor = isDark ? '#C09A61' : '#B68C53'
  const warpAlternate = isDark ? '#8A6843' : '#80603E'
  const clay = isDark ? '#A84D3B' : '#A94836'
  const indigo = isDark ? '#355969' : '#365C6D'
  const threadInk = isDark ? '#F8EBD4' : '#FFF0D5'
  const fiber = isDark ? '#F4DDAF' : '#FFE7B9'

  const primary = (cfg.accentColor as string) || globalStyles.accentColor || '#EF4B5A'
  const secondary = (cfg.secondaryColor as string) || '#22A447'

  const repos = data.repos || []

  if (layoutType === 'hero') {
    const layers = repos.slice(0, 6)
    const count = layers.length

    const clipId = `interlace-hero-warp-over-${widget.instanceId}`
    const weftRows = [72, 115.2, 158.4, 201.6, 244.8, 288]

    const layerThreads = layers
      .map((layer: GitHubRepo, index: number) => {
        const y = weftRows[index]
        if (y === undefined) return ''
        const color = index % 2 === 0 ? primary : secondary
        const name = escapeXml(shorten(layer.name, 17))
        const lang = escapeXml(
          shorten(
            (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
            15
          ).toUpperCase()
        )

        return `
        <g class="interlace-settle" style="animation-delay:${index * 55}ms">
          <rect x="626" y="${y - 8}" width="4" height="16" fill="${color}"/>
          <text x="643" y="${y + 4}" class="body" font-size="11" font-weight="700" fill="${threadInk}">${name}</text>
          <text x="816" y="${y + 4}" text-anchor="end" class="mono" font-size="7.5" letter-spacing="1.1" fill="${threadInk}">${lang}</text>
          <text x="1155" y="${y + 4}" text-anchor="end" class="mono" font-size="7" fill="${threadInk}">${String(index + 1).padStart(2, '0')}</text>
        </g>`
      })
      .join('')

    const nameText = escapeXml(
      (
        (cfg.customTitle ? String(cfg.customTitle) : data.user?.name) ||
        (cfg.customTitle ? String(cfg.customTitle) : data.user?.login) ||
        'AI AGENT'
      ).toUpperCase()
    )
    const bioText = escapeXml(
      shorten(
        (
          (cfg.customBio ? String(cfg.customBio) : data.user?.bio) || 'INFRASTRUCTURE'
        ).toUpperCase(),
        25
      )
    )
    const loginText = escapeXml(
      (cfg.customTitle ? String(cfg.customTitle) : data.user?.login) || 'USER'
    ).toUpperCase()
    const locText = escapeXml(data.user?.location || 'EARTH').toUpperCase()

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${loginText} interlaced portfolio" data-mode="dark">
      <style>
        .display{font-family:"Iowan Old Style","Palatino Linotype",Palatino,serif}.body{font-family:Optima,Candara,"Avenir Next",sans-serif}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .interlace-shuttle{stroke-dasharray:1 99;animation:interlace-shuttle 7.6s linear infinite}
        .interlace-settle{animation:interlace-settle .7s cubic-bezier(.2,.75,.2,1) both}
        @keyframes interlace-shuttle{to{stroke-dashoffset:-100}}@keyframes interlace-settle{from{opacity:.2;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){.interlace-shuttle,.interlace-settle{animation:none}}
      </style>
      <rect width="1200" height="360" fill="${canvas}"/>
      <path d="M600 24V336" stroke="${rule}"/><path d="M42 45H570" stroke="${rule}"/>
      <g class="interlace-settle">
        <text x="42" y="32" class="mono" font-size="8" letter-spacing="2.6" fill="${clay}">INTERLACE / OPEN LOOM</text>
        <text x="570" y="32" text-anchor="end" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">${loginText}</text>
        <text x="40" y="126" class="display" font-size="52" font-weight="700" letter-spacing="-1.1" fill="${ink}">${nameText}</text>
        <text x="40" y="178" class="display" font-size="52" font-style="italic" letter-spacing="-1.1" fill="${ink}">${bioText}</text>
        <path d="M42 230H86" stroke="${indigo}" stroke-width="6"/>
        <text x="42" y="260" class="body" font-size="12" fill="${muted}">Building the systems around coding agents — from skills and trust…</text>
        <text x="42" y="302" class="mono" font-size="8" letter-spacing="1.8" fill="${ink}">${String(count).padStart(2, '0')} PROOF THREADS</text>
        <text x="238" y="302" class="mono" font-size="8" letter-spacing="1.8" fill="${ink}">08 WARP LAYERS</text>
      </g>
      <text x="624" y="31" class="mono" font-size="8" letter-spacing="2.2" fill="${indigo}">SELVEDGE / SELECTED WORK</text>
      <defs>
        <clipPath id="${clipId}">
          <rect x="818.5" y="56.5" width="31" height="31"/><rect x="818.5" y="142.9" width="31" height="31"/><rect x="818.5" y="229.3" width="31" height="31"/><rect x="887.5" y="99.7" width="31" height="31"/><rect x="887.5" y="186.1" width="31" height="31"/><rect x="887.5" y="272.5" width="31" height="31"/><rect x="956.5" y="56.5" width="31" height="31"/><rect x="956.5" y="142.9" width="31" height="31"/><rect x="956.5" y="229.3" width="31" height="31"/><rect x="1025.5" y="99.7" width="31" height="31"/><rect x="1025.5" y="186.1" width="31" height="31"/><rect x="1025.5" y="272.5" width="31" height="31"/><rect x="1094.5" y="56.5" width="31" height="31"/><rect x="1094.5" y="142.9" width="31" height="31"/><rect x="1094.5" y="229.3" width="31" height="31"/>
        </clipPath>
      </defs>
      <g class="interlace-settle">
        <path d="M834 48C829 130.5 839 228.9 834 314" fill="none" stroke="${warpColor}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M834 48C829 130.5 839 228.9 834 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
        <path d="M903 48C898 130.5 908 228.9 903 314" fill="none" stroke="${warpAlternate}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M903 48C898 130.5 908 228.9 903 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
        <path d="M972 48C967 130.5 977 228.9 972 314" fill="none" stroke="${warpColor}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M972 48C967 130.5 977 228.9 972 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
        <path d="M1041 48C1036 130.5 1046 228.9 1041 314" fill="none" stroke="${warpAlternate}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M1041 48C1036 130.5 1046 228.9 1041 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
        <path d="M1110 48C1105 130.5 1115 228.9 1110 314" fill="none" stroke="${warpColor}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M1110 48C1105 130.5 1115 228.9 1110 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
        <path d="M624 72C776.9 69 1006.2 75 1170 72" fill="none" stroke="${clay}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M624 72C776.9 69 1006.2 75 1170 72" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".24"/>
        <path d="M624 115.2C776.9 112.2 1006.2 118.2 1170 115.2" fill="none" stroke="${indigo}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M624 115.2C776.9 112.2 1006.2 118.2 1170 115.2" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".24"/>
        <path d="M624 158.4C776.9 155.4 1006.2 161.4 1170 158.4" fill="none" stroke="${clay}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M624 158.4C776.9 155.4 1006.2 161.4 1170 158.4" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".24"/>
        <path d="M624 201.6C776.9 198.6 1006.2 204.6 1170 201.6" fill="none" stroke="${indigo}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M624 201.6C776.9 198.6 1006.2 204.6 1170 201.6" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".24"/>
        <path d="M624 244.8C776.9 241.8 1006.2 247.8 1170 244.8" fill="none" stroke="${clay}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M624 244.8C776.9 241.8 1006.2 247.8 1170 244.8" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".24"/>
        <path d="M624 288C776.9 285 1006.2 291 1170 288" fill="none" stroke="${indigo}" stroke-width="27" stroke-linecap="butt"/>
        <path d="M624 288C776.9 285 1006.2 291 1170 288" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".24"/>
        <g clip-path="url(#${clipId})">
          <path d="M834 48C829 130.5 839 228.9 834 314" fill="none" stroke="${warpColor}" stroke-width="27" stroke-linecap="butt"/>
          <path d="M834 48C829 130.5 839 228.9 834 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
          <path d="M903 48C898 130.5 908 228.9 903 314" fill="none" stroke="${warpAlternate}" stroke-width="27" stroke-linecap="butt"/>
          <path d="M903 48C898 130.5 908 228.9 903 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
          <path d="M972 48C967 130.5 977 228.9 972 314" fill="none" stroke="${warpColor}" stroke-width="27" stroke-linecap="butt"/>
          <path d="M972 48C967 130.5 977 228.9 972 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
          <path d="M1041 48C1036 130.5 1046 228.9 1041 314" fill="none" stroke="${warpAlternate}" stroke-width="27" stroke-linecap="butt"/>
          <path d="M1041 48C1036 130.5 1046 228.9 1041 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
          <path d="M1110 48C1105 130.5 1115 228.9 1110 314" fill="none" stroke="${warpColor}" stroke-width="27" stroke-linecap="butt"/>
          <path d="M1110 48C1105 130.5 1115 228.9 1110 314" fill="none" stroke="${fiber}" stroke-width="1" stroke-opacity=".3"/>
        </g>
        <path class="interlace-shuttle" pathLength="100" d="M624 211.85999999999999C776.9 208.85999999999999 1006.2 214.85999999999999 1170 211.85999999999999" fill="none" stroke="${threadInk}" stroke-width="2" stroke-opacity=".82" stroke-linecap="square"/>
      </g>
      ${layerThreads}
      <text x="42" y="334" class="mono" font-size="8" letter-spacing="1.5" fill="${muted}">STUDIO / ${locText} · UTC+8</text>
      <path d="M24 336H1176" stroke="${rule}"/><rect x="1128" y="332" width="48" height="8" fill="${primary}"/><rect x="1096" y="332" width="24" height="8" fill="${secondary}"/>
    </svg>`
  }

  const layers = repos.slice(0, 8)
  const count = layers.length

  const rows = layers.map((_, index) => 60 + index * 30)

  const warpXs = [320, 390, 460, 530, 600, 670, 740]
  const warps = warpXs
    .map((x, index) => {
      const color = index % 2 === 0 ? warpColor : warpAlternate
      return `<path d="M${x} 44 C${x - 5} 130 ${x + 5} 220 ${x} 306" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="butt"/>`
    })
    .join('')

  const wefts = rows
    .map((y, index) => {
      const color = index % 2 === 0 ? clay : indigo
      return `<path d="M300 ${y} C430 ${y - 3} 640 ${y + 3} 770 ${y}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="butt"/>`
    })
    .join('')

  const layerThreads = layers
    .map((layer: GitHubRepo, index: number) => {
      const y = rows[index]
      if (y === undefined) return ''
      const color = index % 2 === 0 ? primary : secondary
      const name = escapeXml(shorten(layer.name, 16))
      const lang = escapeXml(
        shorten(
          (cfg.repoLanguages as Record<string, string>)?.[layer.name] || layer.language || 'Code',
          15
        )
      )

      return `
        <g class="interlace-settle" style="animation-delay:${index * 38}ms">
          <rect x="30" y="${y - 7}" width="4" height="14" fill="${color}"/>
          <text x="48" y="${y + 3}" font-family="Optima, sans-serif" font-size="10.5" font-weight="700" fill="${ink}">${name}</text>
          <text x="180" y="${y + 3}" font-family="Georgia, serif" font-size="10.5" font-style="italic" fill="${muted}">${lang}</text>
          <text x="270" y="${y + 3}" text-anchor="end" font-family="ui-monospace, monospace" font-size="7.5" fill="${muted}">${String(index + 1).padStart(2, '0')}</text>
        </g>
      `
    })
    .join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet">
      <defs>
        <style>
          .display { font-family: "Iowan Old Style", Georgia, serif; }
          .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        </style>
      </defs>

      <rect width="800" height="330" fill="${canvas}"/>
      <text x="30" y="28" class="mono" font-size="8" letter-spacing="2.6" fill="${clay}">INTERLACE / WEAVE MAP</text>
      <text x="770" y="28" text-anchor="end" class="mono" font-size="8" letter-spacing="1.8" fill="${muted}">${String(count).padStart(2, '0')} THREADS / PROJECT WEAVE</text>

      <path d="M30 40 H770" stroke="${rule}" stroke-width="1"/>
      <path d="M285 44 V306" stroke="${rule}" stroke-width="1"/>

      <!-- Loom simulation -->
      <g>
        ${warps}
        ${wefts}
      </g>

      <!-- Text Threads -->
      ${layerThreads}

      <text x="30" y="318" class="mono" font-size="7.5" letter-spacing="1.8" fill="${muted}">PROJECT WEAVE ANALYSIS</text>
    </svg>
  `
}
