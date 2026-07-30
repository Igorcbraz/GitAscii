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

function getAttributeValue(attrsString: string, name: string): string | null {
  const regex = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = attrsString.match(regex);
  if (!match) return null;
  return match[1] || match[2] || match[3] || null;
}

function removeAttributes(attrsString: string, names: string[]): string {
  let cleaned = attrsString;
  for (const name of names) {
    const regex = new RegExp(`\\b${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }
  return cleaned;
}

function inlineSvg(fetchedSvg: string, x: string, y: string, width: string, height: string, preserve: string): string {
  let svg = fetchedSvg.replace(/<\?xml[\s\S]*?\?>/i, '').trim();
  svg = svg.replace(/<!DOCTYPE[\s\S]*?>/i, '').trim();

  // Extract all <style> blocks
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let extractedStyles = '';
  const styleMatches = [...svg.matchAll(styleRegex)];
  for (const match of styleMatches) {
    extractedStyles += match[1] + '\n';
  }
  // Strip style tags from the SVG content
  svg = svg.replace(styleRegex, '');

  const svgTagRegex = /<svg([^>]*)>/i;
  const match = svg.match(svgTagRegex);
  if (!match) {
    throw new Error('No opening <svg> tag found in fetched content');
  }

  let attributesString = match[1];

  const originalWidth = getAttributeValue(attributesString, 'width');
  const originalHeight = getAttributeValue(attributesString, 'height');
  let viewBox = getAttributeValue(attributesString, 'viewBox');

  if (!viewBox && originalWidth && originalHeight) {
    const w = parseFloat(originalWidth);
    const h = parseFloat(originalHeight);
    if (!isNaN(w) && !isNaN(h)) {
      viewBox = `0 0 ${w} ${h}`;
    }
  }

  attributesString = removeAttributes(attributesString, ['x', 'y', 'width', 'height', 'preserveAspectRatio', 'viewBox']);

  let newAttrs = ` x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}"`;
  if (viewBox) {
    newAttrs += ` viewBox="${viewBox}"`;
  }

  attributesString = attributesString.replace(/\s+/g, ' ').trim();
  const newSvgTag = `<svg ${attributesString} ${newAttrs}>`.replace(/\s+/g, ' ');

  const inlinedSvgContent = svg.replace(svgTagRegex, newSvgTag);

  // If we have extracted styles, wrap them in a <style> block and prepend to the inlined SVG
  if (extractedStyles.trim()) {
    return `<style>\n${extractedStyles.trim()}\n</style>\n${inlinedSvgContent}`;
  }

  return inlinedSvgContent;
}

async function fetchAndProcessExternalImage(
  url: string,
  x: string,
  y: string,
  width: string,
  height: string,
  preserve: string
): Promise<string> {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
    const hostname = parsedUrl.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.local') ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.')
    ) {
      throw new Error('Forbidden hostname');
    }
  } catch (e) {
    throw new Error('Invalid URL');
  }

  const response = await fetch(url, { headers: { accept: 'image/svg+xml, */*' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentType = response.headers.get('content-type') || '';
  const buffer = await response.arrayBuffer();

  const isSvg = contentType.includes('image/svg+xml') ||
    contentType.includes('xml') ||
    url.toLowerCase().split('?')[0].endsWith('.svg');

  if (isSvg) {
    try {
      const text = Buffer.from(buffer).toString('utf-8');
      return inlineSvg(text, x, y, width, height, preserve);
    } catch (inlineErr) {
      console.error('Failed to inline SVG, falling back to base64 image tag:', inlineErr);
      const base64 = Buffer.from(buffer).toString('base64');
      return `<image href="data:image/svg+xml;base64,${base64}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" />`;
    }
  } else {
    const base64 = Buffer.from(buffer).toString('base64');
    let mimeType = contentType.split(';')[0].trim();
    if (!mimeType) mimeType = 'image/png';
    return `<image href="data:${mimeType};base64,${base64}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserve}" />`;
  }
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
      const replacement = await fetchAndProcessExternalImage(url, x, y, width, height, preserve);
      finalSvg = finalSvg.replace(fullMatch, replacement);
    } catch (err) {
      console.error('Failed to fetch external widget:', url, err);

      if (fallbackUrl) {
        try {
          const replacement = await fetchAndProcessExternalImage(fallbackUrl, x, y, width, height, preserve);
          finalSvg = finalSvg.replace(fullMatch, replacement);
          continue;
        } catch (fbErr) {
          console.error('Failed to fetch fallback widget:', fallbackUrl, fbErr);
        }
      }

      finalSvg = finalSvg.replace(fullMatch, `<text x="${x}" y="${Number(y) + 12}" font-family="monospace" font-size="10" fill="red">Failed to load external widget</text>`);
    }
  }

  const imageRegex = /<image\s+([^>]*?)href="((?:https?:\/\/|www\.)[^"]+?)"([^>]*?)(\/?)>/g;
  const imageMatches = [...finalSvg.matchAll(imageRegex)];

  for (const m of imageMatches) {
    const fullMatch = m[0];
    const beforeAttr = m[1];
    const url = m[2].replace(/&amp;/g, '&');
    const afterAttr = m[3];
    const selfClosing = m[4];

    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
      const hostname = parsedUrl.hostname;
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname === '169.254.169.254' ||
        hostname.endsWith('.local') ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.')
      ) {
        throw new Error('Forbidden hostname');
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      let contentType = response.headers.get('content-type') || 'image/svg+xml';
      contentType = contentType.split(';')[0].trim();

      const dataUri = `data:${contentType};base64,${base64}`;
      const replacement = `<image ${beforeAttr}href="${dataUri}"${afterAttr}${selfClosing}>`;
      finalSvg = finalSvg.replace(fullMatch, replacement);
    } catch (err) {
      console.error('Failed to embed inline image:', url, err);
    }
  }

  return finalSvg;
}
