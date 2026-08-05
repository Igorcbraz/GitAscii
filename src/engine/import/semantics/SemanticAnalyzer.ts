import type { SectionCategory } from '../types'

interface KeywordMapping {
  category: SectionCategory
  keywords: string[]
}

const MULTILINGUAL_DICTIONARY: KeywordMapping[] = [
  {
    category: 'about',
    keywords: [
      'about me',
      'about',
      'sobre mim',
      'sobre',
      'quién soy',
      'quien soy',
      'à propos',
      'a propos',
      'über mich',
      'uber mich',
      'who i am',
      'introduction',
      'introdução',
      'biography',
      'biografia',
      'background',
      'bio',
    ],
  },
  {
    category: 'tech-stack',
    keywords: [
      'tech stack',
      'technologies',
      'tecnologias',
      'skills',
      'habilidades',
      'linguagens',
      'languages',
      'ferramentas',
      'tools',
      'stack',
      'competências',
      'competencias',
      'herramientas',
      'technologies & tools',
      'languages and tools',
      'linguagens e ferramentas',
      'frameworks',
      'devops',
    ],
  },
  {
    category: 'stats',
    keywords: [
      'stats',
      'statistics',
      'estatísticas',
      'estatisticas',
      'estadísticas',
      'estadisticas',
      'statistiques',
      'metrics',
      'métricas',
      'analytics',
      'contributions',
      'contribuições',
      'activity',
      'atividade',
      'streak',
      'github stats',
    ],
  },
  {
    category: 'projects',
    keywords: [
      'projects',
      'projetos',
      'proyectos',
      'projets',
      'portfolio',
      'portfólio',
      'work',
      'trabalhos',
      'featured projects',
      'repositories',
      'repositórios',
    ],
  },
  {
    category: 'contact',
    keywords: [
      'contact',
      'contato',
      'contacto',
      'connect',
      'social',
      'redes sociais',
      'redes',
      'find me',
      'onde me encontrar',
      'reach me',
      'follow me',
      'get in touch',
      'fale comigo',
      'social media',
    ],
  },
  {
    category: 'support',
    keywords: [
      'support',
      'sponsorship',
      'apoie',
      'donations',
      'doações',
      'buy me a coffee',
      'contribua',
      'patrocínio',
      'patrocinio',
      'sponsor',
    ],
  },
  {
    category: 'footer',
    keywords: [
      'footer',
      'rodapé',
      'rodape',
      'credits',
      'créditos',
      'license',
      'licença',
      'licencia',
    ],
  },
  {
    category: 'hero',
    keywords: [
      'hi',
      'hello',
      'welcome',
      'olá',
      'bem-vindo',
      'bienvenido',
      'bienvenue',
      'hey there',
      'i am',
      "i'm",
      'eu sou',
      'soy',
      'je suis',
      'greetings',
      'saudações',
    ],
  },
]

export function detectSectionCategory(text: string): SectionCategory {
  if (!text || typeof text !== 'string') return 'custom'

  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents for fuzzy matching
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()

  for (const item of MULTILINGUAL_DICTIONARY) {
    for (const kw of item.keywords) {
      const normalizedKw = kw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      const regex = new RegExp(
        `(?:^|\\s)${normalizedKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:$|\\s)`,
        'i'
      )
      if (normalized === normalizedKw || regex.test(normalized)) {
        return item.category
      }
    }
  }

  return 'custom'
}

export function getSemanticStandardTitle(
  category: SectionCategory,
  originalTitle?: string
): string {
  switch (category) {
    case 'hero':
      return '[ HERO ]'
    case 'about':
      return '[ ABOUT ME ]'
    case 'tech-stack':
      return '[ SKILLS & TOOLS ]'
    case 'stats':
      return '[ STATS & METRICS ]'
    case 'projects':
      return '[ PROJECTS ]'
    case 'contact':
      return '[ CONNECT ]'
    case 'support':
      return '[ SUPPORT ]'
    case 'footer':
      return '[ FOOTER ]'
    default:
      if (originalTitle) {
        const clean = originalTitle
          .replace(/^#+\s*/, '')
          .trim()
          .toUpperCase()
        return `[ ${clean.substring(0, 30)} ]`
      }
      return '[ SECTION ]'
  }
}
