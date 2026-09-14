import { createHash, createHmac } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { API_ENDPOINTS } from '@/services/endpoints'

import { PUBLICATION } from '../constants'
import { SnapshotStore } from '../server/snapshotStore'

const directories: string[] = []
const signingToken = 'test-publication-signing-token'

function signedIndex(
  files: Array<{ key: string; bytes: number; sha256: string; content?: string }>
) {
  return {
    schemaVersion: 1,
    files,
    signature: createHmac('sha256', signingToken).update(JSON.stringify(files)).digest('hex'),
  }
}
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
    await expect(store.finalize(signingToken)).rejects.toThrow('empty')
    await expect(store.writeSvg('profiles/../../secret', 'bad')).rejects.toThrow('key')
  })

  it('restores metadata from the protected index without per-file Worker requests', async () => {
    const previous = await createStore()
    await previous.writeSvg('profiles/octocat/default/dark.svg', '<svg/>')
    await previous.writeJson('__publication/manifests/octocat.json', { username: 'octocat' })
    await previous.finalize(signingToken)
    const index = JSON.parse(
      await readFile(path.join(previous.directory, '__publication/index.json'), 'utf8')
    )
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json(index))
      .mockResolvedValueOnce(new Response('<svg/>'))
    vi.stubGlobal('fetch', fetch)
    const restored = await createStore()
    await restored.restore('https://images.example.com', signingToken)
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
    const index = signedIndex([
      {
        key,
        bytes: Buffer.byteLength(svg),
        sha256: createHash('sha256').update(svg).digest('hex'),
      },
    ])
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(Response.json(index)).mockResolvedValueOnce(new Response(svg))
    )
    await store.restore('https://images.example.com', signingToken)
    await store.finalize(signingToken)
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
          Response.json(
            signedIndex([
              {
                key: 'profiles/octocat/default/dark.svg',
                bytes: 6,
                sha256: 'wrong',
              },
            ])
          )
        )
        .mockResolvedValueOnce(new Response('<svg/>'))
    )
    await expect(store.restore('https://images.example.com', signingToken)).rejects.toThrow(
      'integrity'
    )
  })

  it('rejects a forged snapshot index before downloading or writing its files', async () => {
    const store = await createStore()
    const fetch = vi.fn().mockResolvedValue(
      Response.json({
        ...signedIndex([
          {
            key: 'profiles/octocat/default/dark.svg',
            bytes: 6,
            sha256: createHash('sha256').update('<svg/>').digest('hex'),
          },
        ]),
        signature: '0'.repeat(64),
      })
    )
    vi.stubGlobal('fetch', fetch)
    await expect(store.restore('https://images.example.com', signingToken)).rejects.toThrow('index')
    expect(fetch).toHaveBeenCalledTimes(1)
    await expect(
      readFile(path.join(store.directory, 'profiles/octocat/default/dark.svg'))
    ).rejects.toThrow()
  })

  it('does not start downloads for a snapshot exceeding the free file budget', async () => {
    const store = await createStore()
    const fetch = vi.fn().mockResolvedValue(
      Response.json({
        schemaVersion: 1,
        files: Array(PUBLICATION.maxSnapshotFiles + 1).fill({}),
        signature: '0'.repeat(64),
      })
    )
    vi.stubGlobal('fetch', fetch)
    await expect(store.restore('https://images.example.com', 'secret')).rejects.toThrow('index')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
