import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles } from '@/engine/types'

export interface QuoteItem {
  quote: string
  author: string
}

export const DEVELOPER_QUOTES: readonly QuoteItem[] = [
  {
    quote: 'Talk is cheap. Show me the code.',
    author: 'Linus Torvalds',
  },
  {
    quote:
      'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
  },
  {
    quote:
      'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
  },
  {
    quote: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    quote: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
  },
  {
    quote:
      'There are only two hard things in Computer Science: cache invalidation and naming things.',
    author: 'Phil Karlton',
  },
  {
    quote: "The most dangerous phrase in the language is, 'We've always done it this way.'",
    author: 'Grace Hopper',
  },
  {
    quote: "It's not a bug – it's an undocumented feature.",
    author: 'Anonymous',
  },
  {
    quote: 'Make it work, make it right, make it fast.',
    author: 'Kent Beck',
  },
  {
    quote: 'Deleted code is debugged code.',
    author: 'Jeff Sickel',
  },
  {
    quote: 'Truth can only be found in one place: the code.',
    author: 'Robert C. Martin',
  },
  {
    quote:
      'Walking on water and developing software from a specification are easy if both are frozen.',
    author: 'Edward V. Berard',
  },
  {
    quote: 'The only way to go fast, is to go well.',
    author: 'Robert C. Martin',
  },
  {
    quote: 'Before software can be reusable it first has to be usable.',
    author: 'Ralph Johnson',
  },
  {
    quote: 'Computers are good at following instructions, but not at reading your mind.',
    author: 'Donald Knuth',
  },
  {
    quote:
      'Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.',
    author: 'John Woods',
  },
  {
    quote:
      'Measuring programming progress by lines of code is like measuring aircraft building progress by weight.',
    author: 'Bill Gates',
  },
  {
    quote: "Nine people can't make a baby in a month.",
    author: 'Fred Brooks',
  },
  {
    quote:
      'If debugging is the process of removing bugs, then programming must be the process of putting them in.',
    author: 'Edsger W. Dijkstra',
  },
  {
    quote: 'The best error message is the one that never shows up.',
    author: 'Thomas Fuchs',
  },
  {
    quote: 'Testing leads to failure, and failure leads to understanding.',
    author: 'Burt Rutan',
  },
  {
    quote:
      'Without requirements or design, programming is the art of adding bugs to an empty text file.',
    author: 'Louis Srygley',
  },
  {
    quote: 'Code is like humor. When you have to explain it, it’s bad.',
    author: 'Cory House',
  },
  {
    quote: 'Fix the cause, not the symptom.',
    author: 'Steve Maguire',
  },
  {
    quote: 'Optimism is an occupational hazard of programming: feedback is the treatment.',
    author: 'Kent Beck',
  },
  {
    quote: 'Simplicity is about subtracting the obvious and adding the meaningful.',
    author: 'John Maeda',
  },
  {
    quote: 'The function of good software is to make the complex appear to be simple.',
    author: 'Grady Booch',
  },
  {
    quote: 'Code never lies, comments sometimes do.',
    author: 'Ron Jeffries',
  },
  {
    quote:
      'Give someone a program, you frustrate them for a day; teach them how to program, you frustrate them for a lifetime.',
    author: 'David Leinweber',
  },
  {
    quote:
      'Software undergoes beta testing shortly before it’s released. Beta is Latin for “still doesn’t work”.',
    author: 'Anonymous',
  },
] as const

interface ThemeColors {
  bg: string
  cardBg: string
  border: string
  text: string
  quote: string
  author: string
  tag: string
}

const THEMES: Record<string, ThemeColors> = {
  dark: {
    bg: '#0d1117',
    cardBg: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    quote: '#c5ff4a',
    author: '#8b949e',
    tag: '#c5ff4a',
  },
  dracula: {
    bg: '#282a36',
    cardBg: '#21222c',
    border: '#6272a4',
    text: '#f8f8f2',
    quote: '#ff79c6',
    author: '#bd93f9',
    tag: '#50fa7b',
  },
  radical: {
    bg: '#141321',
    cardBg: '#1a1829',
    border: '#fe428e',
    text: '#a9fef7',
    quote: '#fe428e',
    author: '#f8d847',
    tag: '#fe428e',
  },
  tokyonight: {
    bg: '#1a1b26',
    cardBg: '#24283b',
    border: '#7aa2f7',
    text: '#a9b1d6',
    quote: '#7aa2f7',
    author: '#bb9af7',
    tag: '#7dcfff',
  },
  gruvbox: {
    bg: '#282828',
    cardBg: '#32302f',
    border: '#d79921',
    text: '#ebdbb2',
    quote: '#fabd2f',
    author: '#fe8019',
    tag: '#b8bb26',
  },
  onedark: {
    bg: '#282c34',
    cardBg: '#21252b',
    border: '#61afef',
    text: '#abb2bf',
    quote: '#61afef',
    author: '#98c379',
    tag: '#e5c07b',
  },
  catppuccin: {
    bg: '#1e1e2e',
    cardBg: '#181825',
    border: '#cba6f7',
    text: '#cdd6f4',
    quote: '#cba6f7',
    author: '#f38ba8',
    tag: '#a6e3a1',
  },
  synthwave: {
    bg: '#2b213a',
    cardBg: '#241b31',
    border: '#e2e2e2',
    text: '#f92aad',
    quote: '#00fff2',
    author: '#f3ea5f',
    tag: '#ff7edb',
  },
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + ' ' + word : word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  return lines
}

export function renderDeveloperQuoteSvg(
  cfg: Record<string, unknown>,
  width: number,
  height: number,
  globalStyles: GlobalStyles,
  _accent: string,
  username?: string
): string {
  const quoteType = (cfg.quoteType as string) || 'random'
  const themeKey = ((cfg.theme as string) || 'dark').toLowerCase()
  const theme = THEMES[themeKey] || THEMES.dark
  const showTitle = cfg.showTitle !== false
  const customTitle = (cfg.customTitle as string) || '[ DEVELOPER QUOTE ]'

  let selectedQuote: QuoteItem
  if (quoteType === 'quote-day') {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - startOfYear.getTime()
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    const index = Math.abs(dayOfYear) % DEVELOPER_QUOTES.length
    selectedQuote = DEVELOPER_QUOTES[index]
  } else {
    let hash = 0
    const seedStr = `${username || 'coder'}_${quoteType}`
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i)
      hash |= 0
    }
    const index = Math.abs(hash) % DEVELOPER_QUOTES.length
    selectedQuote = DEVELOPER_QUOTES[index]
  }

  const fontFamily = globalStyles.fontFamily || 'Inter, -apple-system, sans-serif'
  const titleY = showTitle ? 32 : 16
  const cardY = showTitle ? 44 : 12
  const cardHeight = Math.max(120, height - cardY - 12)
  const cardWidth = width - 24
  const cardX = 12

  const maxChars = Math.max(28, Math.floor((cardWidth - 80) / 8.5))
  const lines = wrapText(`“${selectedQuote.quote}”`, maxChars)

  const lineHeight = 20
  const totalTextHeight = lines.length * lineHeight
  const textStartY = cardY + 36 + Math.max(0, (cardHeight - 76 - totalTextHeight) / 2)

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${cardX + 46}" y="${textStartY + i * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const authorY = Math.min(cardY + cardHeight - 20, textStartY + lines.length * lineHeight + 18)

  return `
    ${showTitle ? `<text x="24" y="${titleY}" font-family="${fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(customTitle)}</text>` : ''}
    <g class="developer-quote-card">
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="6" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="1" />
      
      <g transform="translate(${cardX + 16}, ${textStartY - 14})">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3c-.5 4-2 6-4 6zM17 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3c-.5 4-2 6-4 6z" fill="${theme.quote}" transform="scale(0.7)" opacity="0.85" />
      </g>

      <text font-family="${fontFamily}" font-size="13" font-weight="500" fill="${theme.text}" font-style="italic">
        ${tspans}
      </text>

      <text x="${cardX + cardWidth - 20}" y="${authorY}" text-anchor="end" font-family="${fontFamily}" font-size="11" font-weight="600" fill="${theme.author}" letter-spacing="0.5">
        — ${escapeXml(selectedQuote.author)}
      </text>

      <circle cx="${cardX + cardWidth - 18}" cy="${cardY + 18}" r="3" fill="${theme.tag}" opacity="0.9" />
    </g>
  `
}
