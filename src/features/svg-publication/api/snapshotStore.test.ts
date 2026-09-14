import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { API_ENDPOINTS } from '@/services/endpoints'

import { PUBLICATION } from '../constants'
import { SnapshotStore } from '../server/snapshotStore'

const directories: string[] = []
async function createStore() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gitascii-publication-test-'))
  directories.push(directory)
  return new SnapshotStore(directory)
}
afterEach(async () => {
  vi.unstubAllGlobals()
  for (const directory of directories.splice(0)) {
    if (
      path.dirname(directory) !== path.resolve(os.tmpdir()) ||
      !path.basename(directory).startsWith('gitascii-publication-test-')
    )
      throw new Error('Unsafe test cleanup')
    await rm(directory, { recursive: true, force: true })
  }
})

describe('free static snapshot storage', () => {
  it('keeps private snapshot requests on the configured origin', () => {
    expect(
      API_ENDPOINTS.PUBLICATION.ASSET('https://images.example.com', '/__publication/index.json')
    ).toBe('https://images.example.com/__publication/index.json')
  })
  it('rejects an oversized SVG without replacing the existing file', async () => {
    const store = await createStore()
    const key = 'profiles/octocat/default/dark.svg'
    await store.writeSvg(key, '<svg>last good</svg>')
    await expect(store.writeSvg(key, 'x'.repeat(PUBLICATION.maxSvgBytes + 1))).rejects.toThrow(
      'capacity'
    )
    expect(await readFile(path.join(store.directory, key), 'utf8')).toBe('<svg>last good</svg>')
  })

  it('refuses empty snapshots and paths outside the output directory', async () => {
    const store = await createStore()
    await expect(store.finalize()).rejects.toThrow('empty')
    await expect(store.writeSvg('profiles/../../secret', 'bad')).rejects.toThrow('key')
  })

  it('restores metadata from the protected index without per-file Worker requests', async () => {
    const previous = await createStore()
    await previous.writeSvg('profiles/octocat/default/dark.svg', '<svg/>')
    await previous.writeJson('__publication/manifests/octocat.json', { username: 'octocat' })
    await previous.finalize()
    const index = JSON.parse(
      await readFile(path.join(previous.directory, '__publication/index.json'), 'utf8')
    )
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json(index))
      .mockResolvedValueOnce(new Response('<svg/>'))
    vi.stubGlobal('fetch', fetch)
    const restored = await createStore()
    await restored.restore('https://images.example.com', 'secret')
    expect(await restored.readJson('__publication/manifests/octocat.json')).toEqual({
      username: 'octocat',
    })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][0]).toBe(
      'https://images.example.com/profiles/octocat/default/dark.svg'
    )
    expect(fetch.mock.calls[1][1]).not.toHaveProperty('headers.Authorization')
  })

  it('restores the previous image when no regeneration is possible', async () => {
    const store = await createStore()
    const svg = '<svg>existing custom image</svg>'
    const key = 'profiles/octocat/default/dark.svg'
    const index = {
      schemaVersion: 1,
      files: [
        {
          key,
          bytes: Buffer.byteLength(svg),
          sha256: createHash('sha256').update(svg).digest('hex'),
        },
      ],
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(Response.json(index)).mockResolvedValueOnce(new Response(svg))
    )
    await store.restore('https://images.example.com', 'secret')
    await store.finalize()
    expect(await readFile(path.join(store.directory, key), 'utf8')).toBe(svg)
    const written = JSON.parse(
      await readFile(path.join(store.directory, '__publication/index.json'), 'utf8')
    )
    expect(written.files).toEqual(index.files)
  })

  it('aborts restoration when the deployment changed during download', async () => {
    const store = await createStore()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({
            schemaVersion: 1,
            files: [
              {
                key: 'profiles/octocat/default/dark.svg',
                bytes: 6,
                sha256: 'wrong',
              },
            ],
          })
        )
        .mockResolvedValueOnce(new Response('<svg/>'))
    )
    await expect(store.restore('https://images.example.com', 'secret')).rejects.toThrow('integrity')
  })

  it('does not start downloads for a snapshot exceeding the free file budget', async () => {
    const store = await createStore()
    const fetch = vi
      .fn()
      .mockResolvedValue(
        Response.json({ schemaVersion: 1, files: Array(PUBLICATION.maxSnapshotFiles + 1).fill({}) })
      )
    vi.stubGlobal('fetch', fetch)
    await expect(store.restore('https://images.example.com', 'secret')).rejects.toThrow('index')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
