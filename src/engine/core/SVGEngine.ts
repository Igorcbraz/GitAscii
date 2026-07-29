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

  const minY = targetWidgetIds && visibleWidgets.length > 0
    ? Math.min(...visibleWidgets.map((w) => w.position.y))
    : 0;

  const adjustedWidgets = visibleWidgets.map((w) => ({
    ...w,
    position: {
      ...w.position,
      y: w.position.y - minY,
    },
  }));

  let maxY = 100;
  adjustedWidgets.forEach((w) => {
    const bottom = w.position.y + w.size.height;
    if (bottom > maxY) maxY = bottom;
  });

  const width = options.width || 800;
  const height = options.height || maxY + 16;

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
