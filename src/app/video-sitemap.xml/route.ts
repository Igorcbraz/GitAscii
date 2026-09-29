import { APP_URL } from '@/constants'

export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${APP_URL}/watch/gitascii-overview</loc>
    <video:video>
      <video:thumbnail_loc>${APP_URL}/editor.webp</video:thumbnail_loc>
      <video:title>GitAscii Overview: GitHub Profile README and ASCII Art Demo</video:title>
      <video:description>Watch a 40-second walkthrough of GitAscii: turn a GitHub profile into ASCII art, choose README templates, and edit live SVG widgets.</video:description>
      <video:content_loc>${APP_URL}/presentation.mp4</video:content_loc>
    </video:video>
  </url>
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
