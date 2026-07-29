import { NextResponse } from 'next/server';
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile';
import { createConfiguration } from '@/engine/core/TemplateRenderer';
import { renderSvg, embedExternalImages } from '@/engine/core/SVGEngine';
import { loadProfileConfig } from '@/lib/profileStorage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username) {
      return new NextResponse('Username is required', { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    let theme: 'dark' | 'light' = 'dark';
    const queryTheme = searchParams.get('theme');
    if (queryTheme === 'light' || queryTheme === 'dark') {
      theme = queryTheme;
    }

    const widgetsParam = searchParams.get('widgets');
    const widgets = widgetsParam ? widgetsParam.split(',') : undefined;

    const data = await fetchGitHubProfile(username);
    
    let config = await loadProfileConfig(username, 'default');
    if (!config) {
      config = createConfiguration(data.user.id, data.user.login, 'terminal', 'default');
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
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="10" y="35" fill="red">${message}</text></svg>`,
      {
        status: 500,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }
}
