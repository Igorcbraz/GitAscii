import { fork } from 'node:child_process'
import path from 'node:path'

import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'

import { PUBLICATION } from '../constants'
import type { RenderedPublication, SvgVariant } from '../types'

export function renderInProcess(
  config: SavedConfiguration | null,
  data: NormalizedGitHubData,
  variant: SvgVariant
): Promise<RenderedPublication> {
  return new Promise((resolve, reject) => {
    const child = fork(path.resolve('scripts/render-profile-svg.ts'), [], {
      execArgv: ['--import', 'tsx'],
      stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
      timeout: PUBLICATION.profileTimeoutMs,
    })
    let received = false
    child.once('message', (message: { result?: RenderedPublication; error?: string }) => {
      received = true
      if (typeof message.result?.svg === 'string') resolve(message.result)
      else reject(new Error(message.error || 'SVG render failed'))
      child.disconnect()
      child.kill()
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (!received)
        reject(new Error(`SVG renderer stopped (${signal || code}); previous image retained`))
    })
    child.send({ config, data, variant })
  })
}
