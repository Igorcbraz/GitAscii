import { cloudflare } from '@cloudflare/vite-plugin'
import { cdnAdapter } from '@vinext/cloudflare/cache/cdn-adapter'
import vinext from 'vinext'
import { defineConfig, type Plugin } from 'vite'

function guardVinextProcessFeatureCheck(): Plugin {
  return {
    name: 'guard-vinext-process-feature-check',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/vinext/dist/shims/constants.js')) return

      return code.replace(
        'process?.features?.typescript',
        '(typeof process !== "undefined" && process.features?.typescript)'
      )
    },
  }
}

export default defineConfig({
  plugins: [
    guardVinextProcessFeatureCheck(),
    vinext({
      cache: {
        cdn: cdnAdapter(),
      },
    }),
    cloudflare({
      viteEnvironment: {
        name: 'rsc',
        childEnvironments: ['ssr'],
      },
    }),
  ],
})
