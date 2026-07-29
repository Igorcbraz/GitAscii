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
      { widgetId: 'bio', position: { x: 0, y: 112 }, size: { width: 800, height: 120 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'tech-stack', position: { x: 0, y: 248 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'repositories', position: { x: 0, y: 404 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'social-media', position: { x: 0, y: 600 }, size: { width: 800, height: 120 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 736 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 6 },
    ],
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Pro',
    description: 'Classic dark IDE style with OS control dots (🔴🟡🟢) and a vibrant violet/pink palette.',
    colors: {
      background: '#1e1f29',
      cardBackground: '#282a36',
      text: '#f8f8f2',
      accent: '#ff79c6',
      border: '#44475a',
    },
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: 8,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'avatar', position: { x: 0, y: 112 }, size: { width: 160, height: 160 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'bio', position: { x: 176, y: 112 }, size: { width: 624, height: 160 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'tech-stack', position: { x: 0, y: 288 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'github-readme-stats', position: { x: 0, y: 444 }, size: { width: 390, height: 210 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'streak-stats', position: { x: 410, y: 444 }, size: { width: 390, height: 210 }, config: {}, locked: false, visible: true, zIndex: 6 },
      { widgetId: 'footer', position: { x: 0, y: 670 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 7 },
    ],
  },
  nord: {
    id: 'nord',
    name: 'Nord Frost',
    description: 'Arctic frost color palette with polar night cards, ice blue accents, and mountain badges.',
    colors: {
      background: '#2e3440',
      cardBackground: '#3b4252',
      text: '#d8dee9',
      accent: '#88c0d0',
      border: '#4c566a',
    },
    fontFamily: "'Inter Tight', sans-serif",
    borderRadius: 6,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 92 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'bio', position: { x: 0, y: 108 }, size: { width: 800, height: 130 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'stats', position: { x: 0, y: 254 }, size: { width: 800, height: 110 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'languages', position: { x: 0, y: 380 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'tech-stack', position: { x: 0, y: 536 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 692 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 6 },
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
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futuristic neon aesthetic with electric magenta, cyan glows, and angular cut cards.',
    colors: {
      background: '#0c0c14',
      cardBackground: '#161625',
      text: '#00f0ff',
      accent: '#ff007f',
      border: '#ff007f',
    },
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: 0,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'ascii-art', position: { x: 0, y: 112 }, size: { width: 280, height: 210 }, config: { charset: 'matrix' }, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'bio', position: { x: 296, y: 112 }, size: { width: 504, height: 210 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'tech-stack', position: { x: 0, y: 338 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'languages', position: { x: 0, y: 494 }, size: { width: 800, height: 145 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'repositories', position: { x: 0, y: 655 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 6 },
      { widgetId: 'footer', position: { x: 0, y: 851 }, size: { width: 800, height: 50 }, config: {}, locked: false, visible: true, zIndex: 7 },
    ],
  },
  tokyonight: {
    id: 'tokyonight',
    name: 'Tokyo Night',
    description: 'Sleek developer theme with deep blue/purple night sky, cool cyan and neon blue accents.',
    colors: {
      background: '#1a1b26',
      cardBackground: '#24283b',
      text: '#a9b1d6',
      accent: '#7aa2f7',
      border: '#383e5a',
    },
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: 6,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'ascii-art', position: { x: 0, y: 112 }, size: { width: 280, height: 240 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'bio', position: { x: 296, y: 112 }, size: { width: 504, height: 240 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'tech-stack', position: { x: 0, y: 368 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'github-readme-stats', position: { x: 0, y: 524 }, size: { width: 390, height: 210 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'streak-stats', position: { x: 410, y: 524 }, size: { width: 390, height: 210 }, config: {}, locked: false, visible: true, zIndex: 6 },
      { widgetId: 'footer', position: { x: 0, y: 750 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 7 },
    ],
  },
  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox Retro',
    description: 'Warm, cozy retro theme with high-contrast earthy colors and vintage pumpkin accents.',
    colors: {
      background: '#282828',
      cardBackground: '#3c3836',
      text: '#ebdbb2',
      accent: '#fe8019',
      border: '#504945',
    },
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: 4,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'bio', position: { x: 0, y: 112 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'tech-stack', position: { x: 0, y: 268 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'repositories', position: { x: 0, y: 424 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'social-media', position: { x: 0, y: 620 }, size: { width: 800, height: 120 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 756 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 6 },
    ],
  },
  bento: {
    id: 'bento',
    name: 'Bento Grid',
    description: 'Clean space-saving grid layout using varying card dimensions to showcase your profile.',
    colors: {
      background: '#09090b',
      cardBackground: '#18181b',
      text: '#f4f4f5',
      accent: '#a1a1aa',
      border: '#27272a',
    },
    fontFamily: "'Inter Tight', sans-serif",
    borderRadius: 12,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 90 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'avatar', position: { x: 0, y: 106 }, size: { width: 150, height: 150 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'bio', position: { x: 166, y: 106 }, size: { width: 634, height: 150 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'tech-stack', position: { x: 0, y: 272 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'github-readme-stats', position: { x: 0, y: 428 }, size: { width: 390, height: 210 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'streak-stats', position: { x: 410, y: 428 }, size: { width: 390, height: 210 }, config: {}, locked: false, visible: true, zIndex: 6 },
      { widgetId: 'footer', position: { x: 0, y: 654 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 7 },
    ],
  },
  neobrutalism: {
    id: 'neobrutalism',
    name: 'Neo Brutalism',
    description: 'High-contrast design style featuring bold dark outlines and solid offset shadows.',
    colors: {
      background: '#fef08a',
      cardBackground: '#ffffff',
      text: '#000000',
      accent: '#2563eb',
      border: '#000000',
    },
    fontFamily: "'Inter Tight', sans-serif",
    borderRadius: 0,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'bio', position: { x: 0, y: 120 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'tech-stack', position: { x: 0, y: 276 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'stats', position: { x: 0, y: 432 }, size: { width: 800, height: 110 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'repositories', position: { x: 0, y: 558 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 5 },
      { widgetId: 'footer', position: { x: 0, y: 754 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 6 },
    ],
  },
  githubdark: {
    id: 'githubdark',
    name: 'GitHub Dark Pro',
    description: 'Native developer dashboard layout styling with a clean dark-mode interface.',
    colors: {
      background: '#0d1117',
      cardBackground: '#161b22',
      text: '#c9d1d9',
      accent: '#58a6ff',
      border: '#30363d',
    },
    fontFamily: "'Inter Tight', sans-serif",
    borderRadius: 6,
    layout: [
      { widgetId: 'header', position: { x: 0, y: 0 }, size: { width: 800, height: 96 }, config: {}, locked: false, visible: true, zIndex: 1 },
      { widgetId: 'bio', position: { x: 0, y: 112 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 2 },
      { widgetId: 'tech-stack', position: { x: 0, y: 268 }, size: { width: 800, height: 140 }, config: {}, locked: false, visible: true, zIndex: 3 },
      { widgetId: 'repositories', position: { x: 0, y: 424 }, size: { width: 800, height: 180 }, config: {}, locked: false, visible: true, zIndex: 4 },
      { widgetId: 'footer', position: { x: 0, y: 620 }, size: { width: 800, height: 48 }, config: {}, locked: false, visible: true, zIndex: 5 },
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
