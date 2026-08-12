export const CHARSETS: Record<string, string> = {
  dense:
    " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@",
  standard: ' .,:;irsXA253hMHGS#9B&@',
  blocks: ' ░▒▓█',
  dots: ' ⠁⠃⠇⡇⣇⣿',
  braille: 'braille',
  matrix: ' 0123456789ABCDEF',
  minimal: ' .*#',
  ascii: " .',:;!|/>(){}",
  binary: ' 01',
  slash: ' \\/|',
  retro: ' .oO@',
}

export interface AsciiConvertOptions {
  charset?: string
  customCharset?: string
  detail?: 'lowest' | 'low' | 'medium' | 'high' | 'ultra' | number
  cols?: number
  rows?: number
  density?: number
  contrast?: number
  brightness?: number
  gamma?: number
  invert?: boolean
  edgeEnhance?: boolean
  autoContrast?: boolean
  dithering?: boolean
  colorMode?: 'monochrome' | 'color'
  width?: number
  height?: number
  fontSize?: number
  asciiText?: string[]
  asciiColors?: string[][]
  imageUrl?: string
  sourceType?: 'avatar' | 'url' | 'upload'
}

export interface AsciiConvertResult {
  lines: string[]
  colorMatrix?: string[][]
  cols: number
  rows: number
}

function sRGBtoLinear(c: number): number {
  const norm = c / 255
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4)
}

export async function convertImageToAsciiCanvas(
  imageSrc: string,
  options: AsciiConvertOptions = {}
): Promise<AsciiConvertResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Canvas conversion can only be run in browser environment'))
      return
    }

    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      try {
        let cols = options.cols || 150
        if (typeof options.detail === 'number') {
          cols = options.detail
        } else if (options.detail === 'lowest') {
          cols = 50
        } else if (options.detail === 'low') {
          cols = 100
        } else if (options.detail === 'medium') {
          cols = 150
        } else if (options.detail === 'high') {
          cols = 200
        } else if (options.detail === 'ultra') {
          cols = 250
        }

        const charAspectRatio = 0.5
        let rows = options.rows || Math.max(8, Math.round(cols * charAspectRatio))

        cols = Math.max(12, Math.min(300, cols))
        rows = Math.max(8, Math.min(300, rows))

        const isBraille = options.charset === 'braille'
        const cCols = isBraille ? cols * 2 : cols
        const cRows = isBraille ? rows * 4 : rows

        const size = Math.min(img.width, img.height)
        const startX = (img.width - size) / 2
        const startY = (img.height - size) / 2

        let curCanvas = document.createElement('canvas')
        curCanvas.width = size
        curCanvas.height = size
        const curCtx = curCanvas.getContext('2d', { willReadFrequently: true })
        if (!curCtx) {
          reject(new Error('Canvas 2D context creation failed'))
          return
        }
        curCtx.drawImage(img, startX, startY, size, size, 0, 0, size, size)

        let curSize = size
        while (curSize * 0.5 > Math.max(cCols, cRows)) {
          curSize = Math.floor(curSize * 0.5)
          const nextCanvas = document.createElement('canvas')
          nextCanvas.width = curSize
          nextCanvas.height = curSize
          const nextCtx = nextCanvas.getContext('2d', { willReadFrequently: true })
          if (!nextCtx) break
          nextCtx.imageSmoothingEnabled = true
          nextCtx.imageSmoothingQuality = 'high'
          nextCtx.drawImage(
            curCanvas,
            0,
            0,
            curCanvas.width,
            curCanvas.height,
            0,
            0,
            curSize,
            curSize
          )
          curCanvas = nextCanvas
        }

        const canvas = document.createElement('canvas')
        canvas.width = cCols
        canvas.height = cRows
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          reject(new Error('Canvas 2D context creation failed'))
          return
        }

        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, cCols, cRows)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(curCanvas, 0, 0, curCanvas.width, curCanvas.height, 0, 0, cCols, cRows)

        const imgData = ctx.getImageData(0, 0, cCols, cRows)
        const pixels = imgData.data

        const charsetKey = options.charset || 'dense'
        let rawCharset =
          options.customCharset && options.charset === 'custom'
            ? options.customCharset
            : CHARSETS[charsetKey] || CHARSETS.dense

        if (!rawCharset || rawCharset.length === 0) {
          rawCharset = CHARSETS.dense
        }

        const chars = options.invert ? rawCharset.split('').reverse().join('') : rawCharset
        const len = chars.length

        const contrast = options.contrast !== undefined ? options.contrast : 10
        const brightness = options.brightness !== undefined ? options.brightness : 0
        const gamma = options.gamma !== undefined ? Math.max(0.2, options.gamma) : 1.1
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
        const autoContrast = options.autoContrast !== false
        const dithering = options.dithering !== false

        const pixelCount = cCols * cRows
        const lumMatrix = new Float32Array(pixelCount)
        const alphaMatrix = new Uint8Array(pixelCount)
        const hexColors = new Array<string>(pixelCount)

        for (let y = 0; y < cRows; y++) {
          for (let x = 0; x < cCols; x++) {
            const i = y * cCols + x
            const idx = i * 4
            let r = pixels[idx]
            let g = pixels[idx + 1]
            let b = pixels[idx + 2]
            const a = pixels[idx + 3]

            if (a < 30) {
              alphaMatrix[i] = 0
              hexColors[i] = 'transparent'
              continue
            }
            alphaMatrix[i] = 1

            const hexR = r.toString(16).padStart(2, '0')
            const hexG = g.toString(16).padStart(2, '0')
            const hexB = b.toString(16).padStart(2, '0')
            hexColors[i] = `#${hexR}${hexG}${hexB}`

            r = Math.min(255, Math.max(0, r + brightness))
            g = Math.min(255, Math.max(0, g + brightness))
            b = Math.min(255, Math.max(0, b + brightness))

            r = Math.min(255, Math.max(0, factor * (r - 128) + 128))
            g = Math.min(255, Math.max(0, factor * (g - 128) + 128))
            b = Math.min(255, Math.max(0, factor * (b - 128) + 128))

            const linR = sRGBtoLinear(r)
            const linG = sRGBtoLinear(g)
            const linB = sRGBtoLinear(b)

            let luminance = 0.2126 * linR + 0.7152 * linG + 0.0722 * linB

            if (gamma !== 1.0) {
              luminance = Math.pow(luminance, 1 / gamma)
            }

            lumMatrix[i] = luminance * 255
          }
        }

        if (options.edgeEnhance) {
          const tempLum = new Float32Array(lumMatrix)
          for (let y = 1; y < cRows - 1; y++) {
            for (let x = 1; x < cCols - 1; x++) {
              const i = y * cCols + x
              if (!alphaMatrix[i]) continue

              const lumLeft = tempLum[y * cCols + (x - 1)]
              const lumRight = tempLum[y * cCols + (x + 1)]
              const lumTop = tempLum[(y - 1) * cCols + x]
              const lumBottom = tempLum[(y + 1) * cCols + x]

              const dx = lumRight - lumLeft
              const dy = lumBottom - lumTop
              const edgeVal = Math.sqrt(dx * dx + dy * dy)

              lumMatrix[i] = Math.min(255, Math.max(0, tempLum[i] * 0.6 + edgeVal * 0.5))
            }
          }
        }

        let minLum = 255
        let maxLum = 0
        for (let i = 0; i < pixelCount; i++) {
          if (alphaMatrix[i]) {
            if (lumMatrix[i] < minLum) minLum = lumMatrix[i]
            if (lumMatrix[i] > maxLum) maxLum = lumMatrix[i]
          }
        }

        if (autoContrast && maxLum > minLum) {
          const range = maxLum - minLum
          for (let i = 0; i < pixelCount; i++) {
            if (alphaMatrix[i]) {
              lumMatrix[i] = Math.min(255, Math.max(0, ((lumMatrix[i] - minLum) / range) * 255))
            }
          }
        }

        if (dithering) {
          for (let y = 0; y < cRows; y++) {
            for (let x = 0; x < cCols; x++) {
              const i = y * cCols + x
              if (!alphaMatrix[i]) continue

              const oldLum = lumMatrix[i]
              let newLum = 0
              if (isBraille) {
                newLum = oldLum > 128 ? 255 : 0
              } else {
                const charIdx = Math.min(
                  len - 1,
                  Math.max(0, Math.round((oldLum / 255) * (len - 1)))
                )
                newLum = len > 1 ? (charIdx / (len - 1)) * 255 : 0
              }
              lumMatrix[i] = newLum

              const error = oldLum - newLum

              if (x + 1 < cCols && alphaMatrix[i + 1]) {
                lumMatrix[i + 1] = Math.min(255, Math.max(0, lumMatrix[i + 1] + error * (7 / 16)))
              }
              if (y + 1 < cRows) {
                if (x > 0 && alphaMatrix[i + cCols - 1]) {
                  lumMatrix[i + cCols - 1] = Math.min(
                    255,
                    Math.max(0, lumMatrix[i + cCols - 1] + error * (3 / 16))
                  )
                }
                if (alphaMatrix[i + cCols]) {
                  lumMatrix[i + cCols] = Math.min(
                    255,
                    Math.max(0, lumMatrix[i + cCols] + error * (5 / 16))
                  )
                }
                if (x + 1 < cCols && alphaMatrix[i + cCols + 1]) {
                  lumMatrix[i + cCols + 1] = Math.min(
                    255,
                    Math.max(0, lumMatrix[i + cCols + 1] + error * (1 / 16))
                  )
                }
              }
            }
          }
        }

        const lines: string[] = []
        const colorMatrix: string[][] = Array.from({ length: rows }, () =>
          new Array(cols).fill('#ffffff')
        )

        if (isBraille) {
          const threshold = dithering ? 128 : minLum + (maxLum - minLum) * 0.4

          for (let y = 0; y < rows; y++) {
            let line = ''
            for (let x = 0; x < cols; x++) {
              const cx = x * 2
              const cy = y * 4

              let b = 0
              if (cy < cRows && cx < cCols && lumMatrix[cy * cCols + cx] > threshold) b |= 1
              if (cy + 1 < cRows && cx < cCols && lumMatrix[(cy + 1) * cCols + cx] > threshold)
                b |= 2
              if (cy + 2 < cRows && cx < cCols && lumMatrix[(cy + 2) * cCols + cx] > threshold)
                b |= 4

              if (cx + 1 < cCols) {
                if (cy < cRows && lumMatrix[cy * cCols + cx + 1] > threshold) b |= 8
                if (cy + 1 < cRows && lumMatrix[(cy + 1) * cCols + cx + 1] > threshold) b |= 16
                if (cy + 2 < cRows && lumMatrix[(cy + 2) * cCols + cx + 1] > threshold) b |= 32
              }

              if (cy + 3 < cRows) {
                if (cx < cCols && lumMatrix[(cy + 3) * cCols + cx] > threshold) b |= 64
                if (cx + 1 < cCols && lumMatrix[(cy + 3) * cCols + cx + 1] > threshold) b |= 128
              }

              line += String.fromCharCode(0x2800 + b)
              colorMatrix[y][x] = hexColors[cy * cCols + cx] || '#ffffff'
            }
            lines.push(line)
          }
        } else {
          for (let y = 0; y < rows; y++) {
            let line = ''
            for (let x = 0; x < cols; x++) {
              const i = y * cCols + x
              if (!alphaMatrix[i]) {
                line += ' '
                colorMatrix[y][x] = 'transparent'
                continue
              }
              const lum = Math.min(255, Math.max(0, lumMatrix[i]))
              const charIdx = Math.min(len - 1, Math.max(0, Math.round((lum / 255) * (len - 1))))
              line += chars[charIdx]
              colorMatrix[y][x] = hexColors[i] || '#ffffff'
            }
            lines.push(line)
          }
        }

        resolve({ lines, colorMatrix, cols, rows })
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for ASCII conversion (CORS or invalid URL)'))
    }

    img.src = imageSrc
  })
}

export function generateAsciiArt(username: string, options: AsciiConvertOptions = {}): string[] {
  if (options.asciiText && Array.isArray(options.asciiText) && options.asciiText.length > 0) {
    return options.asciiText
  }

  const charsetName = options.charset || 'blocks'
  const rawCharset = options.customCharset || CHARSETS[charsetName] || CHARSETS.blocks
  const chars = options.invert ? rawCharset.split('').reverse().join('') : rawCharset

  const width = options.cols || options.width || 36
  const height = options.rows || options.height || 18

  const lines: string[] = []
  const len = chars.length

  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i)
    hash |= 0
  }

  for (let y = 0; y < height; y++) {
    let line = ''
    const ny = (y / height) * 2 - 1

    for (let x = 0; x < width; x++) {
      const nx = (x / width) * 2 - 1

      const dist = Math.sqrt(nx * nx + ny * ny)
      let v = 0

      if (dist < 0.85) {
        v = (1 - dist) * 0.8 + Math.sin(nx * 4 + ny * 4 + hash) * 0.2
        if (Math.abs(ny + 0.2) < 0.15 && Math.abs(Math.abs(nx) - 0.3) < 0.12) {
          v = 0.95
        }
        if (ny > 0.2 && ny < 0.45 && Math.abs(nx) < 0.4 && ny - 0.2 > nx * nx * 0.8) {
          v = 0.9
        }
      } else {
        v = 0
      }

      const idx = Math.min(len - 1, Math.max(0, Math.floor(v * len)))
      line += chars[idx]
    }
    lines.push(line)
  }

  return lines
}
