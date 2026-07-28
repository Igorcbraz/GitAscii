export const CHARSETS: Record<string, string> = {
  dense: ' "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  dots: ' ⠁⠃⠇⡇⣇⣿',
  matrix: ' 0123456789ABCDEF',
  minimal: ' .*#',
  ascii: " .',:;!|/>(){}",
  binary: ' 01',
  slash: ' \\/|',
  retro: ' .oO@',
};

export interface AsciiConvertOptions {
  charset?: string;
  customCharset?: string;
  detail?: 'low' | 'medium' | 'high' | 'ultra' | number;
  cols?: number;
  rows?: number;
  density?: number;
  contrast?: number;
  brightness?: number;
  gamma?: number;
  invert?: boolean;
  edgeEnhance?: boolean;
  autoContrast?: boolean;
  dithering?: boolean;
  colorMode?: 'monochrome' | 'color';
  width?: number;
  height?: number;
  fontSize?: number;
  asciiText?: string[];
  asciiColors?: string[][];
  imageUrl?: string;
  sourceType?: 'avatar' | 'url' | 'upload';
}

export interface AsciiConvertResult {
  lines: string[];
  colorMatrix?: string[][];
  cols: number;
  rows: number;
}

export async function convertImageToAsciiCanvas(
  imageSrc: string,
  options: AsciiConvertOptions = {}
): Promise<AsciiConvertResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Canvas conversion can only be run in browser environment'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        let cols = options.cols || 45;
        if (typeof options.detail === 'number') {
          cols = options.detail;
        } else if (options.detail === 'low') {
          cols = 28;
        } else if (options.detail === 'medium') {
          cols = 45;
        } else if (options.detail === 'high') {
          cols = 85;
        } else if (options.detail === 'ultra') {
          cols = 150;
        }

        const charAspectRatio = 0.55;
        const imgAspectRatio = img.height / img.width;
        let rows = options.rows || Math.max(8, Math.round(cols * imgAspectRatio * charAspectRatio));

        cols = Math.max(12, Math.min(150, cols));
        rows = Math.max(8, Math.min(120, rows));

        const canvas = document.createElement('canvas');
        canvas.width = cols;
        canvas.height = rows;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('Canvas 2D context creation failed'));
          return;
        }

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, cols, rows);
        ctx.drawImage(img, 0, 0, cols, rows);

        const imgData = ctx.getImageData(0, 0, cols, rows);
        const pixels = imgData.data;

        const charsetKey = options.charset || 'dense';
        let rawCharset = options.customCharset && options.charset === 'custom'
          ? options.customCharset
          : CHARSETS[charsetKey] || CHARSETS.dense;

        if (!rawCharset || rawCharset.length === 0) {
          rawCharset = CHARSETS.dense;
        }

        const chars = options.invert ? rawCharset.split('').reverse().join('') : rawCharset;
        const len = chars.length;

        const contrast = options.contrast !== undefined ? options.contrast : 10;
        const brightness = options.brightness !== undefined ? options.brightness : 0;
        const gamma = options.gamma !== undefined ? Math.max(0.2, options.gamma) : 1.1;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const autoContrast = options.autoContrast !== false;
        const dithering = options.dithering !== false;

        const lumMatrix: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
        const colorMatrix: string[][] = Array.from({ length: rows }, () => new Array(cols).fill('#ffffff'));
        const alphaMatrix: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(true));

        let minLum = 255;
        let maxLum = 0;

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = (y * cols + x) * 4;
            let r = pixels[idx];
            let g = pixels[idx + 1];
            let b = pixels[idx + 2];
            const a = pixels[idx + 3];

            if (a < 30) {
              alphaMatrix[y][x] = false;
              colorMatrix[y][x] = 'transparent';
              continue;
            }

            r = Math.min(255, Math.max(0, r + brightness));
            g = Math.min(255, Math.max(0, g + brightness));
            b = Math.min(255, Math.max(0, b + brightness));

            r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, factor * (b - 128) + 128));

            if (gamma !== 1.0) {
              r = Math.min(255, Math.max(0, Math.pow(r / 255, 1 / gamma) * 255));
              g = Math.min(255, Math.max(0, Math.pow(g / 255, 1 / gamma) * 255));
              b = Math.min(255, Math.max(0, Math.pow(b / 255, 1 / gamma) * 255));
            }

            let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            if (options.edgeEnhance && x > 0 && y > 0 && x < cols - 1 && y < rows - 1) {
              const leftIdx = (y * cols + (x - 1)) * 4;
              const rightIdx = (y * cols + (x + 1)) * 4;
              const topIdx = ((y - 1) * cols + x) * 4;
              const bottomIdx = ((y + 1) * cols + x) * 4;

              const lumLeft = 0.2126 * pixels[leftIdx] + 0.7152 * pixels[leftIdx + 1] + 0.0722 * pixels[leftIdx + 2];
              const lumRight = 0.2126 * pixels[rightIdx] + 0.7152 * pixels[rightIdx + 1] + 0.0722 * pixels[rightIdx + 2];
              const lumTop = 0.2126 * pixels[topIdx] + 0.7152 * pixels[topIdx + 1] + 0.0722 * pixels[topIdx + 2];
              const lumBottom = 0.2126 * pixels[bottomIdx] + 0.7152 * pixels[bottomIdx + 1] + 0.0722 * pixels[bottomIdx + 2];

              const dx = lumRight - lumLeft;
              const dy = lumBottom - lumTop;
              const edgeVal = Math.sqrt(dx * dx + dy * dy);

              luminance = Math.min(255, Math.max(0, luminance * 0.6 + edgeVal * 0.5));
            }

            lumMatrix[y][x] = luminance;
            if (luminance < minLum) minLum = luminance;
            if (luminance > maxLum) maxLum = luminance;

            const hexR = Math.round(r).toString(16).padStart(2, '0');
            const hexG = Math.round(g).toString(16).padStart(2, '0');
            const hexB = Math.round(b).toString(16).padStart(2, '0');
            colorMatrix[y][x] = `#${hexR}${hexG}${hexB}`;
          }
        }

        if (autoContrast && maxLum > minLum) {
          const range = maxLum - minLum;
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              if (!alphaMatrix[y][x]) continue;
              lumMatrix[y][x] = Math.min(255, Math.max(0, ((lumMatrix[y][x] - minLum) / range) * 255));
            }
          }
        }

        if (dithering) {
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              if (!alphaMatrix[y][x]) continue;
              const oldLum = lumMatrix[y][x];
              const charIdx = Math.min(len - 1, Math.max(0, Math.floor((oldLum / 256) * len)));
              const newLum = (charIdx / len) * 255;
              const error = oldLum - newLum;

              if (x + 1 < cols && alphaMatrix[y][x + 1]) {
                lumMatrix[y][x + 1] = Math.min(255, Math.max(0, lumMatrix[y][x + 1] + error * (7 / 16)));
              }
              if (y + 1 < rows) {
                if (x > 0 && alphaMatrix[y + 1][x - 1]) {
                  lumMatrix[y + 1][x - 1] = Math.min(255, Math.max(0, lumMatrix[y + 1][x - 1] + error * (3 / 16)));
                }
                if (alphaMatrix[y + 1][x]) {
                  lumMatrix[y + 1][x] = Math.min(255, Math.max(0, lumMatrix[y + 1][x] + error * (5 / 16)));
                }
                if (x + 1 < cols && alphaMatrix[y + 1][x + 1]) {
                  lumMatrix[y + 1][x + 1] = Math.min(255, Math.max(0, lumMatrix[y + 1][x + 1] + error * (1 / 16)));
                }
              }
            }
          }
        }

        const lines: string[] = [];
        for (let y = 0; y < rows; y++) {
          let line = '';
          for (let x = 0; x < cols; x++) {
            if (!alphaMatrix[y][x]) {
              line += ' ';
              continue;
            }
            const lum = Math.min(255, Math.max(0, lumMatrix[y][x]));
            const charIdx = Math.min(len - 1, Math.max(0, Math.floor((lum / 256) * len)));
            line += chars[charIdx];
          }
          lines.push(line);
        }

        resolve({ lines, colorMatrix, cols, rows });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for ASCII conversion (CORS or invalid URL)'));
    };

    img.src = imageSrc;
  });
}

export function generateAsciiArt(
  username: string,
  options: AsciiConvertOptions = {}
): string[] {
  if (options.asciiText && Array.isArray(options.asciiText) && options.asciiText.length > 0) {
    return options.asciiText;
  }

  const charsetName = options.charset || 'blocks';
  const rawCharset = options.customCharset || CHARSETS[charsetName] || CHARSETS.blocks;
  const chars = options.invert ? rawCharset.split('').reverse().join('') : rawCharset;

  const width = options.cols || options.width || 36;
  const height = options.rows || options.height || 18;

  const lines: string[] = [];
  const len = chars.length;

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }

  for (let y = 0; y < height; y++) {
    let line = '';
    const ny = (y / height) * 2 - 1;

    for (let x = 0; x < width; x++) {
      const nx = (x / width) * 2 - 1;

      const dist = Math.sqrt(nx * nx + ny * ny);
      let v = 0;

      if (dist < 0.85) {
        v = (1 - dist) * 0.8 + Math.sin(nx * 4 + ny * 4 + hash) * 0.2;
        if (Math.abs(ny + 0.2) < 0.15 && Math.abs(Math.abs(nx) - 0.3) < 0.12) {
          v = 0.95;
        }
        if (ny > 0.2 && ny < 0.45 && Math.abs(nx) < 0.4 && (ny - 0.2) > (nx * nx * 0.8)) {
          v = 0.9;
        }
      } else {
        v = 0;
      }

      const idx = Math.min(len - 1, Math.max(0, Math.floor(v * len)));
      line += chars[idx];
    }
    lines.push(line);
  }

  return lines;
}

