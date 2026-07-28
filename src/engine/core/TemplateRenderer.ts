import type { SavedConfiguration, WidgetInstance, GlobalStyles } from '../types';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    accent: string;
    border: string;
  };
  fontFamily: string;
  borderRadius: number;
  layout: Array<Omit<WidgetInstance, 'instanceId'>>;
}

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    description: 'Retro hacker aesthetic with crisp green accents, command prompt, and ASCII framing.',
    colors: {
      background: '#060606',
      cardBackground: '#121212',
      text: '#e5e5e5',
      accent: '#c5ff4a',
      border: '#252525',
    },
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: 0,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 90 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'ascii-art', position: { x: 0, y: 106 }, size: { width: 280, height: 280 }, config: { charset: 'dense', edgeEnhance: true, lockAspectRatio: true }, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'terminal-info', position: { x: 296, y: 106 }, size: { width: 504, height: 280 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'languages', position: { x: 0, y: 402 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'repositories', position: { x: 0, y: 558 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 754 }, size: { width: 800, height: 50 }, config: {}, locked: false, visible: true, zIndex: 6 },
    ],
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic neon aesthetic with electric magenta, cyan glows, and angular cut cards.',
    colors: {
      background: '#0a0a0f',
      cardBackground: '#130a24',
      text: '#00ffff',
      accent: '#ff00ff',
      border: '#4a0e68',
    },
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: 0,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'ascii-art', position: { x: 0, y: 112 }, size: { width: 280, height: 210 }, config: { charset: 'matrix' }, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'bio', position: { x: 296, y: 112 }, size: { width: 504, height: 210 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'stats', position: { x: 0, y: 338 }, size: { width: 800, height: 115 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'languages', position: { x: 0, y: 469 }, size: { width: 800, height: 145 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'repositories', position: { x: 0, y: 630 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 6 },
      { widgetId: 'footer', position: { x: 0, y: 826 }, size: { width: 800, height: 50 }, config: {}, locked: false, visible: true, zIndex: 7 },
    ],
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Luxe',
    description: 'Clean editorial presentation with subtle typography, pill badges, and refined spacing.',
    colors: {
      background: '#080808',
      cardBackground: '#121212',
      text: '#ffffff',
      accent: '#f3f4f6',
      border: '#222222',
    },
    fontFamily: "'Inter Tight', sans-serif",
    borderRadius: 8,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'bio', position: { x: 0, y: 112 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'stats', position: { x: 0, y: 268 }, size: { width: 800, height: 110 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'languages', position: { x: 0, y: 394 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'repositories', position: { x: 0, y: 550 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 746 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 6 },
    ],
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Pro',
    description: 'Mac OS IDE style with window dots (🔴🟡🟢), iconic Dracula purple & pink palette.',
    colors: {
      background: '#282a36',
      cardBackground: '#44475a',
      text: '#f8f8f2',
      accent: '#ff79c6',
      border: '#6272a4',
    },
    fontFamily: "'Inter Tight', sans-serif",
    borderRadius: 8,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'bio', position: { x: 0, y: 112 }, size: { width: 800, height: 150 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'stats', position: { x: 0, y: 278 }, size: { width: 800, height: 115 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'languages', position: { x: 0, y: 409 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'repositories', position: { x: 0, y: 565 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 761 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 6 },
    ],
  },
  nord: {
    id: 'nord',
    name: 'Nord Frost',
    description: 'Arctic frost color palette with polar night cards, ice blue accents, and mountain badges.',
    colors: {
      background: '#2e3440',
      cardBackground: '#3b4252',
      text: '#eceff4',
      accent: '#88c0d0',
      border: '#4c566a',
    },
    fontFamily: "'Inter Tight', sans-serif",
    borderRadius: 6,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 92 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'bio', position: { x: 0, y: 108 }, size: { width: 800, height: 150 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'stats', position: { x: 0, y: 274 }, size: { width: 800, height: 110 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'languages', position: { x: 0, y: 400 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'repositories', position: { x: 0, y: 556 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 752 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 6 },
    ],
  },
  synthwave: {
    id: 'synthwave',
    name: 'Synthwave 84',
    description: '80s arcade aesthetic with glowing sunset orange, violet grid lines, and neon borders.',
    colors: {
      background: '#12092b',
      cardBackground: '#211342',
      text: '#fecdd3',
      accent: '#ff6b6b',
      border: '#a855f7',
    },
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: 4,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'ascii-art', position: { x: 0, y: 112 }, size: { width: 280, height: 210 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'bio', position: { x: 296, y: 112 }, size: { width: 504, height: 210 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'stats', position: { x: 0, y: 338 }, size: { width: 800, height: 115 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'repositories', position: { x: 0, y: 469 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 665 }, size: { width: 800, height: 50 }, config: {}, locked: false, visible: true, zIndex: 6 },
    ],
  },
};

export function createConfiguration(
  githubId: number,
  username: string,
  templateId = 'terminal',
  profileSlug = 'default',
  profileName = 'Default'
): SavedConfiguration {
  const preset = TEMPLATE_PRESETS[templateId] || TEMPLATE_PRESETS.terminal;

  const widgets: WidgetInstance[] = preset.layout.map((item, index) => ({
    ...item,
    instanceId: `widget_${Date.now()}_${index}`,
    name: `${item.widgetId.charAt(0).toUpperCase() + item.widgetId.slice(1)} Widget`,
  }));

  const globalStyles: GlobalStyles = {
    backgroundColor: preset.colors.background,
    textColor: preset.colors.text,
    accentColor: preset.colors.accent,
    borderColor: preset.colors.border,
    fontFamily: preset.fontFamily,
    borderRadius: preset.borderRadius,
    padding: 24,
    themeMode: 'dark',
    templateStyle: preset.id,
  };

  return {
    version: 1,
    githubId,
    username,
    profileSlug,
    profileName,
    templateId,
    widgets,
    globalStyles,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1,
    },
  };
}
