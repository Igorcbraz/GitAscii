import { afterEach, expect, it, vi } from 'vitest'

import { fetchCardAsDataUri } from './PokemonCardControls'

afterEach(() => vi.unstubAllGlobals())

it('keeps the external image URL when fetching fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
  await expect(fetchCardAsDataUri('https://assets.tcgdex.net/card.png')).resolves.toBe(
    'https://assets.tcgdex.net/card.webp'
  )
})

it('catches asynchronous FileReader rejection instead of leaking an unhandled rejection', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['image']) })
  )
  vi.stubGlobal(
    'FileReader',
    class {
      onerror?: () => void
      readAsDataURL() {
        queueMicrotask(() => this.onerror?.())
      }
    }
  )
  await expect(fetchCardAsDataUri('https://assets.tcgdex.net/card.png')).resolves.toBe(
    'https://assets.tcgdex.net/card.webp'
  )
})
