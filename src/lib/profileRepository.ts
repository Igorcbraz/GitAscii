import fs from 'fs';
import path from 'path';
import { put, list, del } from '@vercel/blob';
import type { SavedConfiguration } from '@/engine/types';

export interface ProfileRepository {
  get(username: string, slug: string): Promise<SavedConfiguration | null>;
  save(config: SavedConfiguration): Promise<void>;
  delete(username: string, slug: string): Promise<void>;
}

const PROFILES_DIR = path.join(process.cwd(), 'src', 'data', 'profiles');

export class LocalProfileRepository implements ProfileRepository {
  async get(username: string, slug: string): Promise<SavedConfiguration | null> {
    const usernameLower = username.toLowerCase();
    const slugLower = slug.toLowerCase();
    const filePath = path.join(PROFILES_DIR, `${usernameLower}_${slugLower}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(content) as SavedConfiguration;
      }
    } catch (error) {
      console.warn(`LocalProfileRepository: Failed to load profile config for ${username}_${slug}:`, error);
    }
    return null;
  }

  async save(config: SavedConfiguration): Promise<void> {
    const username = config.username.toLowerCase();
    const slug = (config.profileSlug || 'default').toLowerCase();
    try {
      if (!fs.existsSync(PROFILES_DIR)) {
        fs.mkdirSync(PROFILES_DIR, { recursive: true });
      }
      const filePath = path.join(PROFILES_DIR, `${username}_${slug}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error(`LocalProfileRepository: Failed to save profile config for ${username}_${slug}:`, error);
      throw error;
    }
  }

  async delete(username: string, slug: string): Promise<void> {
    const usernameLower = username.toLowerCase();
    const slugLower = slug.toLowerCase();
    const filePath = path.join(PROFILES_DIR, `${usernameLower}_${slugLower}.json`);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`LocalProfileRepository: Failed to delete profile config for ${username}_${slug}:`, error);
      throw error;
    }
  }
}

export class BlobProfileRepository implements ProfileRepository {
  private getPath(username: string, slug: string): string {
    return `profiles/${username.toLowerCase()}_${slug.toLowerCase()}.json`;
  }

  async get(username: string, slug: string): Promise<SavedConfiguration | null> {
    const pathName = this.getPath(username, slug);
    try {
      const { blobs } = await list({ prefix: pathName });
      const blob = blobs.find((b) => b.pathname === pathName);
      if (blob) {
        const response = await fetch(blob.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch blob contents from Vercel Blob: ${response.statusText}`);
        }
        return (await response.json()) as SavedConfiguration;
      }
    } catch (error) {
      console.warn(`BlobProfileRepository: Failed to load profile config for ${username}_${slug}:`, error);
    }
    return null;
  }

  async save(config: SavedConfiguration): Promise<void> {
    const username = config.username.toLowerCase();
    const slug = (config.profileSlug || 'default').toLowerCase();
    const pathName = this.getPath(username, slug);
    try {
      await put(pathName, JSON.stringify(config, null, 2), {
        contentType: 'application/json',
        addRandomSuffix: false,
        access: 'public',
      });
    } catch (error) {
      console.error(`BlobProfileRepository: Failed to save profile config for ${username}_${slug}:`, error);
      throw error;
    }
  }

  async delete(username: string, slug: string): Promise<void> {
    const pathName = this.getPath(username, slug);
    try {
      const { blobs } = await list({ prefix: pathName });
      const blob = blobs.find((b) => b.pathname === pathName);
      if (blob) {
        await del(blob.url);
      }
    } catch (error) {
      console.error(`BlobProfileRepository: Failed to delete profile config for ${username}_${slug}:`, error);
      throw error;
    }
  }
}

export const profileRepository: ProfileRepository =
  process.env.NODE_ENV === 'production'
    ? new BlobProfileRepository()
    : new LocalProfileRepository();
