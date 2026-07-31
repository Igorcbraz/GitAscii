import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GitAscii — GitHub Profile README & ASCII Art Generator',
    short_name: 'GitAscii',
    description:
      'Build stunning GitHub Profile READMEs with live SVG stats, custom ASCII art engine, and visual editor.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060606',
    theme_color: '#c5ff4a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
