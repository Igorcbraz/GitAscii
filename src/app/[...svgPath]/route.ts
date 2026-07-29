import { NextResponse } from 'next/server';
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile';
import { createConfiguration } from '@/engine/core/TemplateRenderer';
import { renderSvg, embedExternalImages } from '@/engine/core/SVGEngine';
import { loadProfileConfig } from '@/lib/profileStorage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ svgPath: string[] }> }
) {
  try {
    const { svgPath } = await params;

    if (!svgPath || svgPath.length === 0) {
      return new NextResponse('Invalid SVG route', { status: 400 });
    }

    let pathSegments = [...svgPath];
    if (pathSegments[0] === 'api') {
      pathSegments.shift();
    }

    if (pathSegments.length === 0) {
      return new NextResponse('Invalid SVG route', { status: 400 });
    }

    let username = '';
    let profileSlug = 'default';
    let theme: 'dark' | 'light' = 'dark';

    const { searchParams } = new URL(request.url);
    const queryTheme = searchParams.get('theme');
    if (queryTheme === 'light' || queryTheme === 'dark') {
      theme = queryTheme;
    }

    if (pathSegments.length === 1) {
      const file = pathSegments[0];
      if (file.endsWith('.svg')) {
        const parts = file.split('.');
        username = parts[0];
      } else {
        username = file;
      }
    } else if (pathSegments.length === 2) {
      username = pathSegments[0];
      const file = pathSegments[1];
      if (file.endsWith('.svg')) {
        const variant = file.replace('.svg', '');
        if (variant === 'light') theme = 'light';
        else if (variant === 'dark') theme = 'dark';
        else profileSlug = variant;
      } else {
        profileSlug = file;
      }
    } else if (pathSegments.length >= 3) {
      username = pathSegments[0];
      profileSlug = pathSegments[1];
      const file = pathSegments[2];
      if (file.endsWith('.svg')) {
        const variant = file.replace('.svg', '');
        theme = variant === 'light' ? 'light' : 'dark';
      }
    }

    const widgetsParam = searchParams.get('widgets');
    const widgets = widgetsParam ? widgetsParam.split(',') : undefined;

    const data = await fetchGitHubProfile(username);

    let config = await loadProfileConfig(username, profileSlug);
    if (!config) {
      config = createConfiguration(data.user.id, data.user.login, 'terminal', profileSlug);
    }

    const rawSvgContent = renderSvg(config, data, { theme, widgets });
    const svgContent = await embedExternalImages(rawSvgContent);

    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error rendering SVG';
    return new NextResponse(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="10" y="35" fill="red">${message}</text></svg>`, {
      status: 500,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }
}
