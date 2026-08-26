export const API_ENDPOINTS = {
  AUTH: {
    SESSION: '/api/auth/session',
    LOGOUT: '/api/auth/logout',
    LOGIN: (redirectTo?: string) =>
      redirectTo
        ? `/api/auth/login?redirect_to=${encodeURIComponent(redirectTo)}`
        : '/api/auth/login',
    CALLBACK: '/api/auth/callback',
  },
  GITHUB: {
    API_BASE: 'https://api.github.com',
    GRAPHQL: 'https://api.github.com/graphql',
    CURRENT_USER: 'https://api.github.com/user',
    USER_REPOS: 'https://api.github.com/user/repos',
    PROFILE: (username: string) => `/api/github/${encodeURIComponent(username)}`,
    COMMIT: '/api/github/commit',
    REPO_INFO: (owner: string, repo: string) =>
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    USER_INFO: (username: string) => `https://api.github.com/users/${encodeURIComponent(username)}`,
    USER_SOCIAL_ACCOUNTS: (username: string) =>
      `https://api.github.com/users/${encodeURIComponent(username)}/social_accounts`,
    REPO_README: (owner: string, repo: string) =>
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
    USER_PROFILE: (username: string) => `https://github.com/${encodeURIComponent(username)}`,
    REPO_CONTENTS: (owner: string, repo: string, path: string) =>
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`,
    RAW_USER_CONTENT: (owner: string, repo: string, branch: string, path: string) =>
      `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${path}`,
    RAW_PROFILE_README: (username: string, branch: 'main' | 'master' = 'main') =>
      `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}/${branch}/README.md`,
    RAW_PROFILE_FILE: (username: string, branch: string, path: string) =>
      `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}/${encodeURIComponent(branch)}/${path}`,
    APP_INFO: 'https://api.github.com/app',
    APP_INSTALLATIONS: 'https://api.github.com/app/installations?per_page=100',
    USER_INSTALLATION: (username: string) =>
      `https://api.github.com/users/${encodeURIComponent(username)}/installation`,
    INSTALLATION_DETAILS: (installationId: string | number) =>
      `https://api.github.com/app/installations/${encodeURIComponent(installationId)}`,
    INSTALLATION_ACCESS_TOKENS: (installationId: string | number) =>
      `https://api.github.com/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
    APP_INSTALL: 'https://github.com/apps/gitascii/installations/new',
    APP_DEV_INSTALL: 'https://github.com/apps/gitascii-dev/installations/new',
    OAUTH_AUTHORIZE: (clientId: string, state = '/') =>
      `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=read:user&state=${encodeURIComponent(state)}`,
    OAUTH_ACCESS_TOKEN: 'https://github.com/login/oauth/access_token',
    AVATAR: (username: string, size = 150) =>
      `https://github.com/${encodeURIComponent(username)}.png?size=${size}`,
    SPECIAL_REPO_UPLOAD: (username: string) =>
      `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}/upload/main`,
    SPECIAL_REPO_EDIT_README: (username: string) =>
      `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}/edit/main/README.md`,
    GITASCII_REPO: 'https://api.github.com/repos/Igorcbraz/GitAscii',
    GITASCII_STAR_STATUS: 'https://api.github.com/user/starred/Igorcbraz/GitAscii',
    USER_STARRED_REPO: (owner: string, repo: string) =>
      `https://api.github.com/user/starred/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    STAR: '/api/github/star',
  },
  CONFIG: {
    GET: (username: string, profileSlug: string) =>
      `/api/config/${encodeURIComponent(username)}/${encodeURIComponent(profileSlug)}`,
  },
  INDEXNOW: {
    SUBMIT: 'https://api.indexnow.org/indexnow',
  },
  CLARITY: {
    TAG: (id: string) => `https://www.clarity.ms/tag/${encodeURIComponent(id)}`,
  },
  TCGDEX: {
    CARDS_BY_NAME: (name: string) =>
      `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(name)}`,
  },
  POKEMON_TCG: {
    SETS: 'https://cdn.jsdelivr.net/gh/PokemonTCG/pokemon-tcg-data@master/sets/en.json',
    SET_CARDS: (setId: string) =>
      `https://cdn.jsdelivr.net/gh/PokemonTCG/pokemon-tcg-data@master/cards/en/${encodeURIComponent(setId)}.json`,
  },
  GITFUT: {
    CARD_IMAGE: (username: string, country?: string) =>
      `https://gitfut.com/${encodeURIComponent(username)}.png${country ? `?country=${encodeURIComponent(country)}` : ''}`,
    SCOUT_REPORT: (username: string, country?: string) =>
      `https://gitfut.com/${encodeURIComponent(username)}${country ? `?country=${encodeURIComponent(country)}` : ''}`,
  },
  SKILL_ICONS: {
    GET: (icons: string, theme?: string, perline?: number) =>
      `https://skillicons.dev/icons?i=${encodeURIComponent(icons)}${theme ? `&theme=${encodeURIComponent(theme)}` : ''}${perline ? `&perline=${perline}` : ''}`,
  },
  SHIELDS_IO: {
    BADGE: (label: string, message: string, color: string, style = 'flat-square', logo?: string) =>
      `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=${style}${logo ? `&logo=${encodeURIComponent(logo)}&logoColor=white` : ''}`,
    CUSTOM_BADGE: (label: string, color: string, style = 'for-the-badge', logo?: string) =>
      `https://img.shields.io/badge/${encodeURIComponent(label)}-${color}?style=${style}${logo ? `&logo=${logo}&logoColor=white` : ''}`,
  },
  EXTERNAL_WIDGETS: {
    README_STATS: (username: string, queryParams: string) =>
      `https://github-readme-stats-fast.vercel.app/api?username=${encodeURIComponent(username)}${queryParams}`,
    TOP_LANGS: (username: string, queryParams: string) =>
      `https://github-readme-stats-fast.vercel.app/api/top-langs/?username=${encodeURIComponent(username)}${queryParams}`,
    PIN_REPO: (username: string, repo: string, queryParams: string) =>
      `https://github-readme-stats-fast.vercel.app/api/pin/?username=${encodeURIComponent(username)}&repo=${encodeURIComponent(repo)}${queryParams}`,
    GH_STATS: (embedType: string, username: string, theme: string) =>
      `https://ghstats.dev/api/${encodeURIComponent(embedType)}?username=${encodeURIComponent(username)}&theme=${encodeURIComponent(theme)}`,
    STREAK_STATS: (username: string, queryParams: string) =>
      `https://streak-stats.demolab.com/?user=${encodeURIComponent(username)}${queryParams}`,
    PROFILE_TROPHY: (username: string, queryParams: string) =>
      `https://github-profile-trophy-fast.vercel.app/?username=${encodeURIComponent(username)}${queryParams}`,
    ACTIVITY_GRAPH: (username: string, queryParams: string) =>
      `https://github-readme-activity-graph.vercel.app/graph?username=${encodeURIComponent(username)}${queryParams}`,
    JSDELIVR_GH: (username: string, repo: string, branch: string, file: string) =>
      `https://cdn.jsdelivr.net/gh/${encodeURIComponent(username)}/${encodeURIComponent(repo)}@${encodeURIComponent(branch)}/${file}`,
    LECOQ_METRICS: (username: string, template: string, base: string) =>
      `https://metrics.lecoq.io/${encodeURIComponent(username)}?template=${encodeURIComponent(template)}&base=${encodeURIComponent(base)}`,
    KOMAREV_VIEWS: (username: string, queryParams: string) =>
      `https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}${queryParams}`,
    QUOTES: (type: string, theme: string) =>
      `https://quotes-github-readme.vercel.app/api?type=${encodeURIComponent(type)}&theme=${encodeURIComponent(theme)}`,
  },
  EXTERNAL_RESOURCES: {
    PLATANE_SNAKE_WORKFLOW:
      'https://raw.githubusercontent.com/Platane/Platane/master/.github/workflows/main.yml',
    PLATANE_FALLBACK_SNAKE: (snakeFileName: string) =>
      `https://cdn.jsdelivr.net/gh/platane/platane@output/${snakeFileName}`,
  },
  SVG: {
    CARD: (username: string, profileSlug?: string) =>
      profileSlug && profileSlug !== 'default'
        ? `/api/${encodeURIComponent(username)}/${encodeURIComponent(profileSlug)}`
        : `/api/${encodeURIComponent(username)}`,
    CARD_WITH_TEMPLATE: (username: string, templateId: string) =>
      `/api/${encodeURIComponent(username)}?template=${encodeURIComponent(templateId)}`,
    CARD_WITH_QUERY: (username: string, queryString: string) =>
      `/api/${encodeURIComponent(username)}?${queryString}`,
  },
} as const
