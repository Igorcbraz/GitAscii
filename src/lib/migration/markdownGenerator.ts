export interface EmbedOptions {
  username: string
  profileSlug?: string
  includeBadge?: boolean
}

export function generateV2EmbedCode(options: EmbedOptions): string {
  const username = options.username.toLowerCase()
  const slug = (options.profileSlug || 'default').toLowerCase()
  const darkUrl = `https://raw.githubusercontent.com/${username}/${username}/gitascii/profiles/${slug}/dark.svg`
  const lightUrl = `https://raw.githubusercontent.com/${username}/${username}/gitascii/profiles/${slug}/light.svg`

  const pictureBlock = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${darkUrl}">
  <source media="(prefers-color-scheme: light)" srcset="${lightUrl}">
  <img alt="GitAscii Profile" src="${darkUrl}" width="100%">
</picture>`

  if (options.includeBadge) {
    const badgeBlock = `\n<p align="center">\n  <a href="https://gitascii.com">\n    <img alt="Made with GitAscii" src="https://gitascii.com/api/badge/${username}" width="100%">\n  </a>\n</p>`
    return `${pictureBlock}\n${badgeBlock}`
  }

  return pictureBlock
}

export function updateReadmeContent(
  currentContent: string,
  newEmbedCode: string,
  profileSlug = 'default'
): string {
  const slug = profileSlug.toLowerCase()

  if (slug !== 'default') {
    const markerStart = `<!-- GITASCII:${slug}:START -->`
    const markerEnd = `<!-- GITASCII:${slug}:END -->`

    if (currentContent.includes(markerStart) && currentContent.includes(markerEnd)) {
      const markerRegex = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`, 'g')
      return currentContent.replace(markerRegex, `${markerStart}\n${newEmbedCode}\n${markerEnd}`)
    }

    return `${currentContent.trim()}\n\n${markerStart}\n${newEmbedCode}\n${markerEnd}\n`
  }

  const legacyWidgetRegex =
    /<picture>[\s\S]*?<\/picture>(?:\s*<p align="(?:right|center)">[\s\S]*?<\/p>)*|<p align="(?:right|center)">\s*<a href="https:\/\/gitascii\.com">\s*<img[^>]*api\/badge\/[^>]*>\s*<\/a>\s*<\/p>|!\[(?:GitAscii|Widget)\]\([^)]+\)|<a href="[^"]+">\s*<img\s+src="[^"]+?\/api\/[^"]+"\s+alt="GitAscii Widget"\s+width="100%"\s*\/?>\s*<\/a>/gi

  if (currentContent.match(legacyWidgetRegex)) {
    return currentContent.replace(legacyWidgetRegex, newEmbedCode)
  }

  if (!currentContent.trim()) {
    return `${newEmbedCode}\n`
  }

  return `${currentContent.trim()}\n\n${newEmbedCode}\n`
}
