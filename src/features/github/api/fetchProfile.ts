import type { GitHubUser, GitHubRepo, NormalizedGitHubData } from '../types/github';
import { APP_URL } from '../../../constants';
import { getSession } from '../../../lib/auth';

const GITHUB_API_BASE = 'https://api.github.com';

interface CacheEntry {
  data: NormalizedGitHubData;
  timestamp: number;
}

const profileCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export async function fetchGitHubProfile(username: string): Promise<NormalizedGitHubData> {
  const cacheKey = username.toLowerCase();
  const cached = profileCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const session = await getSession().catch(() => null);
    const token = session?.accessToken || process.env.GITHUB_TOKEN;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitAscii-App',
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const userRes = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!userRes.ok) {
      if (userRes.status === 404) {
        throw new Error(`GitHub user '${username}' not found.`);
      }
      return getMockGitHubData(username);
    }

    const user: GitHubUser = await userRes.json();

    const reposRes = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=30`,
      { 
        headers, 
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    );

    const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

    const languages: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    repos.forEach((repo) => {
      if (!repo.fork) {
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      }
    });

    const result: NormalizedGitHubData = {
      user,
      repos: repos.filter((r) => !r.fork).slice(0, 6),
      languages,
      totalStars,
      totalForks,
    };

    profileCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.warn(`Falling back to mock data for user '${username}':`, error);
    return getMockGitHubData(username);
  }
}

export function getMockGitHubData(username: string): NormalizedGitHubData {
  return {
    user: {
      id: 40432351,
      login: username || 'Igorcbraz',
      name: 'Igor Braz',
      avatar_url: 'https://avatars.githubusercontent.com/u/40432351?v=4',
      bio: 'Full Stack Software Engineer & Open Source Creator. Building high performance tools.',
      company: '@GitAscii',
      location: 'Brazil',
      blog: APP_URL,
      twitter_username: 'igorcbraz',
      public_repos: 38,
      public_gists: 12,
      followers: 420,
      following: 180,
      created_at: '2018-06-15T00:00:00Z',
      updated_at: new Date().toISOString(),
    },
    repos: [
      {
        id: 101,
        name: 'GitAscii',
        full_name: `${username}/GitAscii`,
        description: 'Platform for creating GitHub profile READMEs through SVG and ASCII art.',
        html_url: `https://github.com/${username}/GitAscii`,
        stargazers_count: 340,
        forks_count: 45,
        language: 'TypeScript',
        fork: false,
        updated_at: new Date().toISOString(),
      },
      {
        id: 102,
        name: 'antigravity-ui',
        full_name: `${username}/antigravity-ui`,
        description: 'Design system tokens and components for high aesthetic dark web applications.',
        html_url: `https://github.com/${username}/antigravity-ui`,
        stargazers_count: 128,
        forks_count: 18,
        language: 'TypeScript',
        fork: false,
        updated_at: new Date().toISOString(),
      },
      {
        id: 103,
        name: 'ascii-engine',
        full_name: `${username}/ascii-engine`,
        description: 'High performance image to ASCII art converter for Web and Node.',
        html_url: `https://github.com/${username}/ascii-engine`,
        stargazers_count: 95,
        forks_count: 12,
        language: 'Rust',
        fork: false,
        updated_at: new Date().toISOString(),
      },
    ],
    languages: {
      TypeScript: 14,
      JavaScript: 8,
      Rust: 4,
      CSS: 3,
      Python: 2,
    },
    totalStars: 563,
    totalForks: 75,
  };
}
