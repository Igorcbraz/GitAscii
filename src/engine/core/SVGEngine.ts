import type { SavedConfiguration, NormalizedGitHubData, RenderOptions } from '../types';
import { renderWidgetSvg } from './WidgetRenderer';

export function renderSvg(
  config: SavedConfiguration,
  data: NormalizedGitHubData,
  options: RenderOptions = {}
): string {
  const isLight = options.theme === 'light';

  const bg = isLight
    ? '#ffffff'
    : config.globalStyles.backgroundColor || '#060606';

  const targetWidgetIds = options.widgets;
  let visibleWidgets = config.widgets.filter(
    (w) => w.visible && (!targetWidgetIds || targetWidgetIds.includes(w.instanceId))
  );

  if (targetWidgetIds && visibleWidgets.length === 0) {
    visibleWidgets = config.widgets.filter((w) => w.visible);
  }

  const shrinkWrap = Boolean(targetWidgetIds && visibleWidgets.length > 0);

  const minX = shrinkWrap
    ? Math.min(...visibleWidgets.map((w) => w.position.x))
    : 0;

  const minY = shrinkWrap
    ? Math.min(...visibleWidgets.map((w) => w.position.y))
    : 0;

  const adjustedWidgets = visibleWidgets.map((w) => ({
    ...w,
    position: {
      ...w.position,
      x: w.position.x - minX,
      y: w.position.y - minY,
    },
  }));

  let maxX = shrinkWrap ? 0 : 800;
  let maxY = shrinkWrap ? 0 : 100;

  adjustedWidgets.forEach((w) => {
    const right = w.position.x + w.size.width;
    const bottom = w.position.y + w.size.height;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  });

  const width = options.width || (shrinkWrap ? Math.max(maxX, 1) : 800);
  const height = options.height || (shrinkWrap ? Math.max(maxY, 1) : maxY + 16);

  const widgetsSvg = adjustedWidgets
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((widget) => renderWidgetSvg(widget, data, config.globalStyles))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500&amp;family=PT+Serif:ital,wght@0,300;1,300&amp;display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    text {
      user-select: none;
    }
  </style>
 
  <rect width="${width}" height="${height}" fill="${bg}" rx="${config.globalStyles.borderRadius || 0}" />

  ${widgetsSvg}
</svg>`;
}

export async function embedExternalImages(svgContent: string): Promise<string> {
  const regex = /<!-- EXTERNAL_WIDGET_START:\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([\s\S]*?)\s*-->([\s\S]*?)<!-- EXTERNAL_WIDGET_END -->/g;

  let finalSvg = svgContent;
  const matches = [...svgContent.matchAll(regex)];

  for (const m of matches) {
    const fullMatch = m[0];
    const url = m[1].trim().replace(/&amp;/g, '&');
    const x = m[2].trim();
    const y = m[3].trim();
    const width = m[4].trim();
    const height = m[5].trim();
    const mode = m[6].trim();
    const fallbackUrl = m[7].trim().replace(/&amp;/g, '&');

    const preserve = mode === 'badge' ? 'xMinYMid meet' : 'xMinYMin meet';

    try {
      const response = await fetch(url, { headers: { accept: 'image/svg+xml' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUri = `data:image/svg+xml;base64,${base64}`;
      
      const replacement = `<image href="${dataUri}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" />`;
      
      finalSvg = finalSvg.replace(fullMatch, replacement);
    } catch (err) {
      console.error('Failed to fetch external widget:', url, err);
      
      if (fallbackUrl) {
        try {
          const fbResponse = await fetch(fallbackUrl, { headers: { accept: 'image/svg+xml' } });
          if (!fbResponse.ok) throw new Error(`HTTP ${fbResponse.status}`);
          
          const fbBuffer = await fbResponse.arrayBuffer();
          const fbBase64 = Buffer.from(fbBuffer).toString('base64');
          const fbDataUri = `data:image/svg+xml;base64,${fbBase64}`;
          
          const replacement = `<image href="${fbDataUri}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" />`;
          finalSvg = finalSvg.replace(fullMatch, replacement);
          continue;
        } catch (fbErr) {
          console.error('Failed to fetch fallback widget:', fallbackUrl, fbErr);
        }
      }
      
      finalSvg = finalSvg.replace(fullMatch, `<text x="${x}" y="${Number(y) + 12}" font-family="monospace" font-size="10" fill="red">Failed to load external widget</text>`);
    }
  }

  return finalSvg;
}
