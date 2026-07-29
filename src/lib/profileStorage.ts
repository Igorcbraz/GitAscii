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

export async function loadProfileConfig(username: string, slug: string): Promise<SavedConfiguration | null> {
  const usernameLower = username.toLowerCase();
  const slugLower = slug.toLowerCase();
  const cacheKey = `${usernameLower}_${slugLower}`;

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) || null;
  }

  const config = await profileRepository.get(usernameLower, slugLower);
  if (config) {
    memoryCache.set(cacheKey, config);
  }
  return config;
}
