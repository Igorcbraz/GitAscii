import type { NormalizedGitHubData } from '@/features/github/types/github';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface WidgetConfig {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  opacity?: number;
  title?: string;
  showBorder?: boolean;
  accentColor?: string;

  charset?: string;
  density?: number;
  contrast?: number;
  invert?: boolean;
  monochrome?: boolean;
  asciiScale?: number;
  avatarUrl?: string;
  layoutStyle?: 'horizontal' | 'vertical' | 'grid';
  maxItems?: number;
  customText?: string;
  [key: string]: unknown;
}

export interface WidgetInstance {
  instanceId: string;
  widgetId: string;
  name?: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

export interface GlobalStyles {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  fontFamily: string;
  borderRadius: number;
  padding: number;
  themeMode: 'dark' | 'light' | 'auto';
  templateStyle?: string;
}

export interface SavedConfiguration {
  version: number;
  githubId: number;
  username: string;
  profileSlug: string;
  profileName: string;
  templateId: string;
  widgets: WidgetInstance[];
  globalStyles: GlobalStyles;
  metadata: {
    createdAt: string;
    updatedAt: string;
    schemaVersion: number;
    generatedBy?: 'manual' | 'auto';
  };
}

export interface RenderOptions {
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
  embedFonts?: boolean;
  optimize?: boolean;
  widgets?: string[];
}

export type { NormalizedGitHubData };
