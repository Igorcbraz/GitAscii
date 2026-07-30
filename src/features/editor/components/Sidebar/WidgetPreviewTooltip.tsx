'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useI18n } from '@/i18n';
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types';
import { renderWidgetSvg } from '@/engine/core/WidgetRenderer';
import { getMockGitHubData } from '@/features/github/api/fetchProfile';
import { convertImageToAsciiCanvas } from '@/engine/ascii/converter';

export type WidgetBadgeType = 'popular' | 'essential' | 'highlight' | 'interactive' | 'trending';

export interface WidgetBadge {
  text: string;
  type: WidgetBadgeType;
}

export interface WidgetCatalogItem {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  isExternal?: boolean;
  badge?: WidgetBadge;
  category?: 'essential' | 'interactive' | 'stats' | 'external' | 'misc';
}

interface WidgetPreviewTooltipProps {
  widgetItem: WidgetCatalogItem | null;
  targetRect: DOMRect | null;
  globalStyles: GlobalStyles;
  githubData: NormalizedGitHubData | null;
}

const DEFAULT_SIZE_MAP: Record<string, { width: number; height: number }> = {
  header: { width: 800, height: 90 },
  avatar: { width: 160, height: 160 },
  'ascii-art': { width: 280, height: 280 },
  'ascii-text': { width: 800, height: 120 },
  'terminal-info': { width: 504, height: 280 },
  'tech-stack': { width: 800, height: 140 },
  'social-media': { width: 800, height: 120 },
  bio: { width: 800, height: 160 },
  stats: { width: 800, height: 120 },
  languages: { width: 800, height: 140 },
  repositories: { width: 800, height: 180 },
  'gitfest-lineup': { width: 500, height: 650 },
  'github-readme-stats': { width: 500, height: 210 },
  'streak-stats': { width: 500, height: 210 },
  'profile-trophy': { width: 800, height: 160 },
  'activity-graph': { width: 800, height: 300 },
  'contribution-snake': { width: 800, height: 200 },
  'metrics-card': { width: 800, height: 380 },
  'views-counter': { width: 320, height: 80 },
  'readme-quotes': { width: 500, height: 180 },
  'awesome-badge': { width: 360, height: 80 },
  divider: { width: 800, height: 30 },
  footer: { width: 800, height: 50 },
};

export function WidgetPreviewTooltip({
  widgetItem,
  targetRect,
  globalStyles,
  githubData,
}: WidgetPreviewTooltipProps) {
  const { t } = useI18n();
  const [asciiArtCache, setAsciiArtCache] = useState<{ lines: string[]; colors?: string[][] } | null>(null);

  const size = widgetItem ? DEFAULT_SIZE_MAP[widgetItem.id] || { width: 800, height: 120 } : { width: 800, height: 120 };
  const data = githubData || getMockGitHubData('Igorcbraz');

  useEffect(() => {
    if (widgetItem?.id !== 'ascii-art' || asciiArtCache) return;

    let isCurrent = true;
    async function loadPreviewAscii() {
      const avatarUrl = data.user.avatar_url || 'https://github.com/github.png';
      try {
        const result = await convertImageToAsciiCanvas(avatarUrl, {
          charset: 'dense',
          cols: 45,
          colorMode: 'monochrome',
        });
        if (isCurrent) {
          setAsciiArtCache({
            lines: result.lines,
            colors: result.colorMatrix,
          });
        }
      } catch (err) {
        console.warn('Preview ASCII art generation failed:', err);
      }
    }

    loadPreviewAscii();
    return () => {
      isCurrent = false;
    };
  }, [widgetItem?.id, data.user.avatar_url, asciiArtCache]);

  if (!widgetItem || !targetRect) return null;

  const translatedName = t(`widget.catalog.${widgetItem.id}.name`, widgetItem.name);
  const translatedDesc = t(`widget.catalog.${widgetItem.id}.desc`, widgetItem.desc);
  const translatedBadgeText = widgetItem.badge
    ? t(`widget.badge.${widgetItem.badge.text.toLowerCase().replace(/\s+/g, '_')}`, widgetItem.badge.text)
    : '';

  const previewWidget: WidgetInstance = {
    instanceId: `preview_${widgetItem.id}`,
    widgetId: widgetItem.id,
    name: translatedName,
    position: { x: 0, y: 0 },
    size,
    config: {
      ...(widgetItem.id === 'avatar' || widgetItem.id === 'ascii-art' ? { lockAspectRatio: true } : {}),
      ...(widgetItem.id === 'ascii-art' && asciiArtCache ? {
        asciiText: asciiArtCache.lines,
        asciiColors: asciiArtCache.colors,
      } : {}),
    },
    locked: false,
    visible: true,
    zIndex: 1,
  };

  const svgContent = renderWidgetSvg(previewWidget, data, globalStyles);

  const leftPosition = targetRect.right + 12;
  const rawTop = targetRect.top - 20;
  const topPosition = typeof window !== 'undefined'
    ? Math.max(16, Math.min(window.innerHeight - 300, rawTop))
    : rawTop;

  const arrowTop = targetRect.top - topPosition + targetRect.height / 2 - 6;
  const clampedArrowTop = Math.max(12, Math.min(arrowTop, 270));

  return (
    <div
      className="fixed z-100 w-87.5 bg-onyx border border-signal-lime/40 rounded-xs shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(197,255,74,0.12)] p-3.5 animate-fade-in pointer-events-none"
      style={{
        left: `${leftPosition}px`,
        top: `${topPosition}px`,
      }}
    >
      <div
        className="absolute -left-1.75 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-signal-lime/50"
        style={{
          top: `${clampedArrowTop}px`,
        }}
      />

      <div className="flex items-center justify-between pb-2 mb-2 border-b border-graphite gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-lime animate-pulse shrink-0" />
          <span className="font-inter-tight text-caption font-medium uppercase tracking-[0.16em] text-signal-lime truncate">
            [ {t('editor.sidebar.preview', 'PREVIEW')}: {translatedName} ]
          </span>
          {widgetItem.badge && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase tracking-wider shrink-0">
              {translatedBadgeText}
            </span>
          )}
        </div>
        <span className="font-jetbrains-mono text-caption text-ash bg-carbon px-1.5 py-0.5 rounded-xs border border-graphite shrink-0">
          {size.width}×{size.height}px
        </span>
      </div>

      <div className="bg-carbon border border-graphite/80 rounded-xs p-2 overflow-hidden flex items-center justify-center min-h-22.5">
        <svg
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="w-full h-auto max-h-42.5 rounded object-contain"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-eyebrow">
        <p className="text-ash font-inter-tight line-clamp-1 flex-1 mr-2">
          {translatedDesc}
        </p>
        <div className="text-signal-lime font-inter-tight font-medium flex items-center gap-1 shrink-0 bg-signal-lime/10 px-2 py-0.5 rounded-xs border border-signal-lime/20">
          <Plus size={12} />
          <span>{t('editor.sidebar.insert', 'Inserir')}</span>
        </div>
      </div>
    </div>
  );
}
