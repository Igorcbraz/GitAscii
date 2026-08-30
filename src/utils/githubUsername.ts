const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/

const RESERVED_PATHS = new Set([
  'index.html',
  'index.php',
  'index',
  'home',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.webmanifest',
  'manifest.json',
  'apple-icon.png',
  'icon.png',
  'icon.svg',
  'icon-16.png',
  'icon-32.png',
  'icon-192.png',
  'icon-512.png',
  'icon',
  'example.svg',
  'og-image.png',
  'og-image-pt-br.png',
  'opengraph-image',
  'explore',
  'templates',
  'widgets',
  'guides',
  'vs',
  'privacy',
  'terms',
  'pro',
  'r',
  'unsubscribe',
  'api',
  'feed.xml',
  'feed.json',
  'llms.txt',
  'llms-full.txt',
  'admin',
  'login',
  'logout',
  'auth',
])

export function isValidGitHubUsername(username: string): boolean {
  if (!username) return false
  const clean = username.trim().toLowerCase()
  if (RESERVED_PATHS.has(clean)) return false
  if (clean.includes('.') || clean.includes('/') || clean.includes('\\')) return false
  return GITHUB_USERNAME_REGEX.test(username.trim())
}
