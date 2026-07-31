import { del, list, put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

import type { SavedConfiguration } from '@/engine/types'

export interface ProfileRepository {
  get(username: string, slug: string): Promise<SavedConfiguration | null>
  save(config: SavedConfiguration): Promise<void>
  delete(username: string, slug: string): Promise<void>
}

const PROFILES_DIR = path.join(process.cwd(), 'src', 'data', 'profiles')

export class LocalProfileRepository implements ProfileRepository {
  async get(username: string, slug: string): Promise<SavedConfiguration | null> {
    const usernameLower = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const slugLower = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const filePath = path.join(PROFILES_DIR, `${usernameLower}_${slugLower}.json`)
    try {
      if (fs.existsSync(filePath)) {
        const content = await fs.promises.readFile(filePath, 'utf-8')
        return JSON.parse(content) as SavedConfiguration
      }
    } catch (error) {
      console.warn(
        `LocalProfileRepository: Failed to load profile config for ${username}_${slug}:`,
        error
      )
    }
    return null
  }

  async save(config: SavedConfiguration): Promise<void> {
    const username = config.username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const slug = (config.profileSlug || 'default').toLowerCase().replace(/[^a-z0-9_-]/g, '')
    try {
      if (!fs.existsSync(PROFILES_DIR)) {
        fs.mkdirSync(PROFILES_DIR, { recursive: true })
      }
      const filePath = path.join(PROFILES_DIR, `${username}_${slug}.json`)
      await fs.promises.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8')
    } catch (error) {
      console.error(
        `LocalProfileRepository: Failed to save profile config for ${username}_${slug}:`,
        error
      )
      throw error
    }
  }

  async delete(username: string, slug: string): Promise<void> {
    const usernameLower = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const slugLower = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const filePath = path.join(PROFILES_DIR, `${usernameLower}_${slugLower}.json`)
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
      }
    } catch (error) {
      console.error(
        `LocalProfileRepository: Failed to delete profile config for ${username}_${slug}:`,
        error
      )
      throw error
    }
  }
}

export class BlobProfileRepository implements ProfileRepository {
  private getPath(username: string, slug: string): string {
    return `profiles/${username.toLowerCase()}_${slug.toLowerCase()}.json.gz`
  }

  async get(username: string, slug: string): Promise<SavedConfiguration | null> {
    const pathName = this.getPath(username, slug)
    const legacyPathName = `profiles/${username.toLowerCase()}_${slug.toLowerCase()}.json`
    try {
      const { blobs } = await list({
        prefix: `profiles/${username.toLowerCase()}_${slug.toLowerCase()}.json`,
      })

      let blob = blobs.find((b) => b.pathname === pathName || b.pathname.startsWith(pathName))
      let isCompressed = true

      if (!blob) {
        blob = blobs.find(
          (b) => b.pathname === legacyPathName || b.pathname.startsWith(legacyPathName)
        )
        isCompressed = false
      }

      if (blob) {
        const response = await fetch(blob.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch blob contents from Vercel Blob: ${response.statusText}`)
        }

        if (isCompressed) {
          const arrayBuffer = await response.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const decompressed = zlib.gunzipSync(buffer).toString('utf-8')
          return JSON.parse(decompressed) as SavedConfiguration
        } else {
          return (await response.json()) as SavedConfiguration
        }
      }
    } catch (error) {
      console.warn(
        `BlobProfileRepository: Failed to load profile config for ${username}_${slug}:`,
        error
      )
    }
    return null
  }

  async save(config: SavedConfiguration): Promise<void> {
    const username = config.username.toLowerCase()
    const slug = (config.profileSlug || 'default').toLowerCase()
    const pathName = this.getPath(username, slug)
    try {
      const minifiedJson = JSON.stringify(config)
      const compressedBuffer = zlib.gzipSync(minifiedJson)

      await put(pathName, compressedBuffer, {
        contentType: 'application/gzip',
        addRandomSuffix: false,
        access: 'public',
        allowOverwrite: true,
      })

      try {
        const legacyPathName = `profiles/${username}_${slug}.json`
        const { blobs } = await list({ prefix: legacyPathName })
        const legacyBlob = blobs.find(
          (b) => b.pathname === legacyPathName || b.pathname.startsWith(legacyPathName)
        )
        if (legacyBlob) {
          await del(legacyBlob.url)
        }
      } catch (cleanupError) {
        console.warn(
          `BlobProfileRepository: Failed to cleanup legacy uncompressed file for ${username}_${slug}:`,
          cleanupError
        )
      }
    } catch (error) {
      console.error(
        `BlobProfileRepository: Failed to save profile config for ${username}_${slug}:`,
        error
      )
      throw error
    }
  }

  async delete(username: string, slug: string): Promise<void> {
    const pathName = this.getPath(username, slug)
    const legacyPathName = `profiles/${username.toLowerCase()}_${slug.toLowerCase()}.json`
    try {
      const { blobs } = await list({
        prefix: `profiles/${username.toLowerCase()}_${slug.toLowerCase()}.json`,
      })

      const compressedBlob = blobs.find(
        (b) => b.pathname === pathName || b.pathname.startsWith(pathName)
      )
      if (compressedBlob) {
        await del(compressedBlob.url)
      }

      const legacyBlob = blobs.find(
        (b) => b.pathname === legacyPathName || b.pathname.startsWith(legacyPathName)
      )
      if (legacyBlob) {
        await del(legacyBlob.url)
      }
    } catch (error) {
      console.error(
        `BlobProfileRepository: Failed to delete profile config for ${username}_${slug}:`,
        error
      )
      throw error
    }
  }
}

export const profileRepository: ProfileRepository =
  process.env.NODE_ENV === 'production' ? new BlobProfileRepository() : new LocalProfileRepository()
