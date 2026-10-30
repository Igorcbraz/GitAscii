import { expect, it } from 'vitest'

import { reserveChunkReload } from './chunkRecovery'

it('recovers a stale chunk once and prevents a reload loop', () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
  const error = new Error(
    'Failed to fetch dynamically imported module: /_next/static/chunks/Editor.js'
  )
  expect(reserveChunkReload(error, storage, 1000)).toBe(true)
  expect(reserveChunkReload(error, storage, 1001)).toBe(false)
  expect(reserveChunkReload(new Error('Invalid data'), storage, 400000)).toBe(false)
})

it('does not reload when browser storage is unavailable', () => {
  expect(
    reserveChunkReload(new Error('ChunkLoadError'), {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {},
    })
  ).toBe(false)
})
