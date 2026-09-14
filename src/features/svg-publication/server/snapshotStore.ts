import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { API_ENDPOINTS } from '@/services/endpoints'

import { PUBLICATION } from '../constants'
import type { PublicationStore } from '../types'

interface SnapshotEntry {
  key: string
  bytes: number
  sha256: string
  content?: string
}
export interface SnapshotIndex {
  schemaVersion: 1
  files: SnapshotEntry[]
}

export class SnapshotStore implements PublicationStore {
  private files = new Map<string, SnapshotEntry>()
  private totalBytes = 0

  constructor(readonly directory: string) {}

  async resumeLocal() {
    const walk = async (directory: string, prefix = ''): Promise<void> => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isSymbolicLink())
          throw new Error('Symlinks are not permitted in publication snapshots')
        const key = prefix + entry.name
        if (entry.isDirectory()) await walk(path.join(directory, entry.name), key + '/')
        else if (key !== '_headers' && key !== '__publication/index.json') {
          await this.write(key, await readFile(this.filename(key)))
        }
      }
    }
    await walk(this.directory)
  }

  private filename(key: string) {
    if (!/^(profiles|__publication)\/[a-zA-Z0-9_./-]+$/.test(key) || key.includes('..')) {
      throw new Error('Invalid publication object key')
    }
    const root = path.resolve(this.directory)
    const filename = path.resolve(root, key)
    if (!filename.startsWith(root + path.sep))
      throw new Error('Publication path escaped output directory')
    return filename
  }

  async write(key: string, body: Uint8Array) {
    const filename = this.filename(key)
    const old = this.files.get(key)
    const nextBytes = this.totalBytes - (old?.bytes || 0) + body.byteLength
    if (
      body.byteLength > PUBLICATION.maxSvgBytes ||
      nextBytes > PUBLICATION.maxSnapshotBytes ||
      (!old && this.files.size >= PUBLICATION.maxSnapshotFiles)
    ) {
      throw new Error('Free publication capacity reached; keeping the deployed snapshot')
    }
    await mkdir(path.dirname(filename), { recursive: true })
    await writeFile(filename, body)
    this.totalBytes = nextBytes
    this.files.set(key, {
      key,
      bytes: body.byteLength,
      sha256: createHash('sha256').update(body).digest('hex'),
    })
  }

  async readJson<T>(key: string): Promise<T | null> {
    if (!this.files.has(key)) return null
    return JSON.parse(await readFile(this.filename(key), 'utf8')) as T
  }

  async writeJson(key: string, value: unknown) {
    await this.write(key, Buffer.from(JSON.stringify(value)))
  }

  async writeSvg(key: string, svg: string) {
    await this.write(key, Buffer.from(svg))
  }

  async remove(key: string) {
    const entry = this.files.get(key)
    if (!entry) return
    await unlink(this.filename(key))
    this.totalBytes -= entry.bytes
    this.files.delete(key)
  }

  async restore(origin: string, token: string) {
    const request = async (url: string) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(30_000),
        redirect: 'error',
      })
      if (!response.ok) throw new Error(`Cannot restore deployed snapshot: HTTP ${response.status}`)
      return response
    }
    const indexResponse = await request(
      API_ENDPOINTS.PUBLICATION.ASSET(origin, API_ENDPOINTS.PUBLICATION.SNAPSHOT_INDEX)
    )
    const index = (await indexResponse.json()) as SnapshotIndex
    if (
      index.schemaVersion !== 1 ||
      !Array.isArray(index.files) ||
      index.files.length > PUBLICATION.maxSnapshotFiles
    ) {
      throw new Error('Invalid deployed snapshot index')
    }
    const keys = new Set<string>()
    let bytes = 0
    for (const entry of index.files) {
      this.filename(entry.key)
      if (
        keys.has(entry.key) ||
        !Number.isSafeInteger(entry.bytes) ||
        entry.bytes < 0 ||
        entry.bytes > PUBLICATION.maxSvgBytes
      ) {
        throw new Error('Invalid deployed snapshot entry')
      }
      keys.add(entry.key)
      bytes += entry.bytes
    }
    if (bytes > PUBLICATION.maxSnapshotBytes)
      throw new Error('Deployed snapshot exceeds free safety budget')
    for (const entry of index.files) {
      // Public SVG downloads bypass Worker invocations; metadata travels in the protected index.
      const body =
        typeof entry.content === 'string'
          ? Buffer.from(entry.content)
          : new Uint8Array(
              await (
                await (entry.key.startsWith('profiles/')
                  ? fetch(API_ENDPOINTS.PUBLICATION.ASSET(origin, entry.key), {
                      signal: AbortSignal.timeout(30_000),
                      redirect: 'error',
                    }).then((response) => {
                      if (!response.ok)
                        throw new Error(`Cannot restore deployed SVG: HTTP ${response.status}`)
                      return response
                    })
                  : request(API_ENDPOINTS.PUBLICATION.SNAPSHOT_FILE(origin, entry.key)))
              ).arrayBuffer()
            )
      if (
        body.byteLength !== entry.bytes ||
        createHash('sha256').update(body).digest('hex') !== entry.sha256
      ) {
        throw new Error(`Snapshot integrity mismatch: ${entry.key}`)
      }
      await this.write(entry.key, body)
    }
  }

  async finalize() {
    if (![...this.files.keys()].some((key) => key.startsWith('profiles/'))) {
      throw new Error('Refusing to deploy an empty image snapshot')
    }
    const index: SnapshotIndex = {
      schemaVersion: 1,
      files: await Promise.all(
        [...this.files.values()]
          .filter((entry) => entry.key !== '__publication/index.json')
          .sort((a, b) => a.key.localeCompare(b.key))
          .map(async (entry) =>
            entry.key.startsWith('__publication/')
              ? { ...entry, content: await readFile(this.filename(entry.key), 'utf8') }
              : entry
          )
      ),
    }
    await this.writeJson('__publication/index.json', index)
    await writeFile(
      path.join(this.directory, '_headers'),
      `/profiles/*\n  Content-Type: image/svg+xml; charset=utf-8\n  Cache-Control: public, max-age=300\n  X-Content-Type-Options: nosniff\n  Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:;\n/__publication/*\n  Cache-Control: no-store\n`
    )
    return { files: this.files.size + 1, bytes: this.totalBytes }
  }
}
