import { WIDGET_IDS } from '@/constants'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { renderAsciiArt } from '@/features/widgets/renderers/AsciiArtRenderer'
import { renderAsciiHeatmap } from '@/features/widgets/renderers/AsciiHeatmapRenderer'
import { renderAsciiInfoCard } from '@/features/widgets/renderers/AsciiInfoCardRenderer'
import { renderAsciiPortrait } from '@/features/widgets/renderers/AsciiPortraitRenderer'
import { renderAsciiText } from '@/features/widgets/renderers/AsciiTextRenderer'
import { renderAvatar } from '@/features/widgets/renderers/AvatarRenderer'
import { renderBentoGrid } from '@/features/widgets/renderers/BentoGridRenderer'
import { renderBio } from '@/features/widgets/renderers/BioRenderer'
import { renderBlueprint } from '@/features/widgets/renderers/BlueprintRenderer'
import { renderCartograph } from '@/features/widgets/renderers/CartographRenderer'
import { renderCipherPrint } from '@/features/widgets/renderers/CipherPrintRenderer'
import { renderCodewebHeroOrbit } from '@/features/widgets/renderers/CodewebHeroOrbitRenderer'
import { renderCodewebMinimalBadge } from '@/features/widgets/renderers/CodewebMinimalBadgeRenderer'
import { renderCodewebRetroGrid } from '@/features/widgets/renderers/CodewebRetroGridRenderer'
import { renderCodewebShowcaseCards } from '@/features/widgets/renderers/CodewebShowcaseCardsRenderer'
import { renderCodewebSocialBadge } from '@/features/widgets/renderers/CodewebSocialBadgeRenderer'
import { renderCommandDeck } from '@/features/widgets/renderers/CommandDeckRenderer'
import { renderConstellation } from '@/features/widgets/renderers/ConstellationRenderer'
import { renderDivider, renderFooter } from '@/features/widgets/renderers/DividerFooterRenderer'
import { renderEditorial } from '@/features/widgets/renderers/EditorialRenderer'
import { renderExternalWidgets } from '@/features/widgets/renderers/ExternalWidgetsRenderer'
import { renderFieldSpecimen } from '@/features/widgets/renderers/FieldSpecimenRenderer'
import { renderFoundry } from '@/features/widgets/renderers/FoundryRenderer'
import { renderGlobe } from '@/features/widgets/renderers/GlobeRenderer'
import { renderHeader } from '@/features/widgets/renderers/HeaderRenderer'
import { renderInterlace } from '@/features/widgets/renderers/InterlaceRenderer'
import { renderLanguages } from '@/features/widgets/renderers/LanguagesRenderer'
import { renderMarquee } from '@/features/widgets/renderers/MarqueeRenderer'
import { renderMetroMap } from '@/features/widgets/renderers/MetroMapRenderer'
import { renderMonolith } from '@/features/widgets/renderers/MonolithRenderer'
import { renderNeural } from '@/features/widgets/renderers/NeuralRenderer'
import { renderPatchbay } from '@/features/widgets/renderers/PatchbayRenderer'
import { renderPokemonCard } from '@/features/widgets/renderers/PokemonCardRenderer'
import { renderRepositories } from '@/features/widgets/renderers/RepositoriesRenderer'
import { renderSignalGrid } from '@/features/widgets/renderers/SignalGridRenderer'
import { renderSocialMedia } from '@/features/widgets/renderers/SocialMediaRenderer'
import { renderStats } from '@/features/widgets/renderers/StatsRenderer'
import { renderSystemLoop } from '@/features/widgets/renderers/SystemLoopRenderer'
import { renderTechStack } from '@/features/widgets/renderers/TechStackRenderer'
import { renderTerminalInfo } from '@/features/widgets/renderers/TerminalInfoRenderer'
import { renderTerminal } from '@/features/widgets/renderers/TerminalRenderer'
import { renderTrophies } from '@/features/widgets/renderers/TrophiesRenderer'
import { renderWakaTime } from '@/features/widgets/renderers/WakaTimeRenderer'

import { escapeXml } from './xmlUtils'

export type WidgetRendererFn = (
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic?: boolean
) => string

export const REGISTRY_MAP = new Map<string, WidgetRendererFn>([
  // Core Profile Widgets
  ['header', (w, d, g) => renderHeader(w, d, g)],
  ['avatar', (w, d, g) => renderAvatar(w, d, g)],
  ['ascii-art', (w, d, g) => renderAsciiArt(w, d, g)],
  ['ascii-text', (w, d, g) => renderAsciiText(w, d, g)],
  ['bio', (w, d, g) => renderBio(w, d, g)],
  ['stats', (w, d, g) => renderStats(w, d, g)],
  ['languages', (w, d, g) => renderLanguages(w, d, g)],
  ['repositories', (w, d, g) => renderRepositories(w, d, g)],
  ['divider', (w, d, g) => renderDivider(w, d, g)],
  ['footer', (w, d, g) => renderFooter(w, d, g)],
  ['tech-stack', (w, d, g) => renderTechStack(w, d, g)],
  ['social-media', (w, d, g) => renderSocialMedia(w, d, g)],
  ['terminal-info', (w, d, g) => renderTerminalInfo(w, d, g)],
  ['terminal-card', (w, d, g) => renderTerminalInfo(w, d, g)],
  ['pokemon-card', (w, d, g) => renderPokemonCard(w, d, g, w.size.width, w.size.height)],

  // GodProfile & Specialized
  ['godprofile-terminal', (w, d, g) => renderTerminal(w, d, g)],
  ['godprofile-marquee', (w, d, g) => renderMarquee(w, d, g)],
  ['godprofile-neural', (w, d, g) => renderNeural(w, d, g)],
  ['godprofile-trophies', (w, d, g) => renderTrophies(w, d, g)],
  [WIDGET_IDS.GODPROFILE_WAKATIME, (w, d, g) => renderWakaTime(w, d, g)],
  [WIDGET_IDS.GODPROFILE_GLOBE, (w, d, g) => renderGlobe(w, d, g)],

  // ASCII Variants
  [WIDGET_IDS.ASCII_PORTRAIT, (w, d, g, s) => renderAsciiPortrait(w, d, g, s)],
  [WIDGET_IDS.ASCII_INFO, (w, d, g, s) => renderAsciiInfoCard(w, d, g, s)],
  [WIDGET_IDS.ASCII_HEATMAP, (w, d, g, s) => renderAsciiHeatmap(w, d, g, s)],

  // ControlPlane Variants
  [WIDGET_IDS.CONTROLPLANE_SYSTEM_LOOP, (w, d, g) => renderSystemLoop(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_COMMAND_DECK, (w, d, g) => renderCommandDeck(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_SIGNAL_GRID, (w, d, g) => renderSignalGrid(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_METRO, (w, d, g) => renderMetroMap(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_BENTO, (w, d, g) => renderBentoGrid(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_EDITORIAL, (w, d, g) => renderEditorial(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_BLUEPRINT, (w, d, g) => renderBlueprint(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_CONSTELLATION, (w, d, g) => renderConstellation(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_MONOLITH, (w, d, g) => renderMonolith(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_INTERLACE, (w, d, g) => renderInterlace(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_CIPHER, (w, d, g) => renderCipherPrint(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_SPECIMEN, (w, d, g) => renderFieldSpecimen(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_PATCHBAY, (w, d, g) => renderPatchbay(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_CARTOGRAPH, (w, d, g) => renderCartograph(w, d, g)],
  [WIDGET_IDS.CONTROLPLANE_FOUNDRY, (w, d, g) => renderFoundry(w, d, g)],

  // Codeweb Variants
  [WIDGET_IDS.CODEWEB_HERO_ORBIT, (w, d, g, s) => renderCodewebHeroOrbit(w, d, g, s)],
  [WIDGET_IDS.CODEWEB_RETRO_GRID, (w, d, g, s) => renderCodewebRetroGrid(w, d, g, s)],
  [WIDGET_IDS.CODEWEB_SHOWCASE_CARDS, (w, d, g, s) => renderCodewebShowcaseCards(w, d, g, s)],
  [WIDGET_IDS.CODEWEB_SOCIAL_BADGE, (w, d, g, s) => renderCodewebSocialBadge(w, d, g, s)],
  [WIDGET_IDS.CODEWEB_MINIMAL_BADGE, (w, d, g, s) => renderCodewebMinimalBadge(w, d, g, s)],

  // External Integration Widgets
  ['gitfest-lineup', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['github-readme-stats', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['ghstats', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['streak-stats', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['profile-trophy', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['activity-graph', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['contribution-snake', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['metrics-card', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['views-counter', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['readme-quotes', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['awesome-badge', (w, d, g) => renderExternalWidgets(w, d, g)],
  ['custom-image', (w, d, g) => renderExternalWidgets(w, d, g)],
])

export function renderFallbackWidget(widget: WidgetInstance, globalStyles: GlobalStyles): string {
  const cfg = widget?.config || {}
  const textClr = (cfg.textColor as string) || globalStyles?.textColor || '#ffffff'
  const wid = String(widget?.widgetId || 'WIDGET').toUpperCase()
  return `<text x="24" y="36" font-family="'Inter Tight', sans-serif" font-size="14" fill="${textClr}">${escapeXml(wid)}</text>`
}

export function renderErrorWidget(
  widget: WidgetInstance,
  globalStyles: GlobalStyles,
  error?: unknown
): string {
  const cfg = widget?.config || {}
  const textClr = (cfg.textColor as string) || globalStyles?.textColor || '#ff7b72'
  const wid = String(widget?.widgetId || 'widget')
  const width = Math.max(100, Number(widget?.size?.width) || 200)
  const height = Math.max(40, Number(widget?.size?.height) || 60)
  const errMessage = error instanceof Error ? error.message : 'Render failed'

  return `
    <rect x="0" y="0" width="${width}" height="${height}" fill="#161b22" rx="4" stroke="#f85149" stroke-width="1" stroke-dasharray="4 4" opacity="0.85" />
    <text x="16" y="24" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="${textClr}">[ WIDGET ERROR: ${escapeXml(wid)} ]</text>
    <text x="16" y="42" font-family="'JetBrains Mono', monospace" font-size="9" fill="#8b949e">${escapeXml(errMessage.slice(0, 60))}</text>
  `
}

export function renderWidgetContent(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles,
  forceStatic?: boolean
): string {
  if (!widget) return ''
  const wid = typeof widget.widgetId === 'string' ? widget.widgetId : ''
  const renderer = REGISTRY_MAP.get(wid)
  if (typeof renderer === 'function') {
    try {
      return renderer(widget, data, globalStyles, forceStatic)
    } catch (err) {
      console.warn('[GitAscii Engine] Error rendering widget:', wid, err)
      return renderErrorWidget(widget, globalStyles, err)
    }
  }
  return renderFallbackWidget(widget, globalStyles)
}

export function getRenderer(widgetId: string): WidgetRendererFn {
  const wid = typeof widgetId === 'string' ? widgetId : ''
  const renderer = REGISTRY_MAP.get(wid)
  if (typeof renderer === 'function') {
    return (widget, data, globalStyles, forceStatic) => {
      try {
        return renderer(widget, data, globalStyles, forceStatic)
      } catch (err) {
        console.warn('[GitAscii Engine] Error rendering widget:', wid, err)
        return renderErrorWidget(widget, globalStyles, err)
      }
    }
  }
  return (widget, _, globalStyles) => renderFallbackWidget(widget, globalStyles)
}

export function registerWidget(widgetId: string, renderer: WidgetRendererFn): void {
  REGISTRY_MAP.set(widgetId, renderer)
}
