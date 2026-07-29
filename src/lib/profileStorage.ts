import fs from 'fs';
import path from 'path';
import type { SavedConfiguration } from '@/engine/types';

const PROFILES_DIR = path.join(process.cwd(), 'src', 'data', 'profiles');
const memoryCache = new Map<string, SavedConfiguration>();

export async function saveProfileConfig(config: SavedConfiguration): Promise<void> {
  const username = config.username.toLowerCase();
  const slug = (config.profileSlug || 'default').toLowerCase();
  const cacheKey = `${username}_${slug}`;

  memoryCache.set(cacheKey, config);

  try {
    if (!fs.existsSync(PROFILES_DIR)) {
      fs.mkdirSync(PROFILES_DIR, { recursive: true });
    }
    const filePath = path.join(PROFILES_DIR, `${username}_${slug}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Failed to save profile config to disk (this is expected in read-only environments like Vercel):', error);
  }
}

export async function loadProfileConfig(username: string, slug: string): Promise<SavedConfiguration | null> {
  const usernameLower = username.toLowerCase();
  const slugLower = slug.toLowerCase();
  const cacheKey = `${usernameLower}_${slugLower}`;

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) || null;
  }

  try {
    const filePath = path.join(PROFILES_DIR, `${usernameLower}_${slugLower}.json`);
    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const config = JSON.parse(content) as SavedConfiguration;
      memoryCache.set(cacheKey, config);
      return config;
    }
  } catch (error) {
    console.warn(`Failed to load profile config from disk for ${username}_${slug}:`, error);
  }
  return null;
}
