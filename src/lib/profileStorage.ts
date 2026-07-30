import type { SavedConfiguration } from '@/engine/types';
import { profileRepository } from './profileRepository';

const memoryCache = new Map<string, SavedConfiguration>();

export async function saveProfileConfig(config: SavedConfiguration): Promise<void> {
  const username = config.username.toLowerCase();
  const slug = (config.profileSlug || 'default').toLowerCase();
  const cacheKey = `${username}_${slug}`;

  await profileRepository.save(config);

  memoryCache.set(cacheKey, config);
}

async function fetchConfigFromGitHub(username: string, slug: string): Promise<SavedConfiguration | null> {
  const filename = slug === 'default' ? 'gitascii.json' : `gitascii_${slug.toLowerCase()}.json`;
  const urls = [
    `https://raw.githubusercontent.com/${username}/${username}/main/${filename}`,
    `https://raw.githubusercontent.com/${username}/${username}/main/.github/${filename}`,
    `https://raw.githubusercontent.com/${username}/${username}/master/${filename}`,
    `https://raw.githubusercontent.com/${username}/${username}/master/.github/${filename}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        next: { revalidate: 60 }
      });
      if (res.ok) {
        const config = await res.json();
        if (config && typeof config === 'object' && config.username) {
          return config as SavedConfiguration;
        }
      }
    } catch {
      // Continue to next URL
    }
  }
  return null;
}

export async function loadProfileConfig(username: string, slug: string): Promise<SavedConfiguration | null> {
  const usernameLower = username.toLowerCase();
  const slugLower = slug.toLowerCase();
  const cacheKey = `${usernameLower}_${slugLower}`;

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) || null;
  }

  let config = await profileRepository.get(usernameLower, slugLower);

  if (!config) {
    config = await fetchConfigFromGitHub(username, slugLower);
  }

  if (config) {
    memoryCache.set(cacheKey, config);
  }
  return config;
}

