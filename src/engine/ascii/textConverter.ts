import { CHARSETS } from './converter'
import { BLOCK_FONT, SLANT_FONT, THIN_FONT } from './fonts'

export type AsciiFontName = 'block' | 'slant' | 'thin'

const FONTS: Record<AsciiFontName, Record<string, string[]>> = {
  block: BLOCK_FONT,
  slant: SLANT_FONT,
  thin: THIN_FONT,
}

export function convertTextToAscii(
  text: string,
  fontName: AsciiFontName = 'block',
  charSpacing = 1,
  charsetKey = 'default',
  customCharset = ''
): string[] {
  const font = FONTS[fontName] || BLOCK_FONT
  const fontKeys = Object.keys(font)
  const sampleChar = fontKeys[0] || 'A'
  const fontHeight = font[sampleChar]?.length || 5

  if (!text) {
    return Array(fontHeight).fill('')
  }

  const paragraphs = text.split('\n')
  const allResultLines: string[] = []

  paragraphs.forEach((paragraph, paraIdx) => {
    const paraLines: string[] = Array(fontHeight).fill('')

    for (let i = 0; i < paragraph.length; i++) {
      const char = paragraph[i].toUpperCase()
      let charMatrix = font[char]

      if (!charMatrix) {
        charMatrix = font[' '] || Array(fontHeight).fill('    ')
      }

      for (let lineIdx = 0; lineIdx < fontHeight; lineIdx++) {
        const charLine = charMatrix[lineIdx] || ''
        const spacing = i > 0 ? ' '.repeat(charSpacing) : ''
        paraLines[lineIdx] += spacing + charLine
      }
    }

    allResultLines.push(...paraLines)

    if (paraIdx < paragraphs.length - 1) {
      allResultLines.push(...Array(Math.max(1, Math.floor(fontHeight / 2))).fill(''))
    }
  })

  let charsetString = ''
  if (charsetKey === 'custom' && customCharset) {
    charsetString = customCharset
  } else if (charsetKey !== 'default') {
    charsetString = CHARSETS[charsetKey] || ''
  }

  const activeChars = charsetString.replace(/\s/g, '')

  if (activeChars.length > 0) {
    let charCounter = 0
    return allResultLines.map((line) => {
      let newline = ''
      for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (c !== ' ') {
          newline += activeChars[charCounter % activeChars.length]
          charCounter++
        } else {
          newline += ' '
        }
      }
      return newline
    })
  }

  return allResultLines
}
