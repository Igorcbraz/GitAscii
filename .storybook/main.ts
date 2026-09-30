import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      // Storybook needs Next's component mocks, not the app's vinext/Cloudflare Vite plugins.
      builder: { viteConfigPath: '.storybook/vite.config.ts' },
    },
  },
  staticDirs: ['../public'],
  async viteFinal(config) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    }
    config.plugins = [
      {
        name: 'storybook-landing-metrics-preview',
        enforce: 'pre',
        resolveId(source, importer) {
          const fromConstantsIndex =
            source === './metrics' &&
            importer?.replaceAll('\\', '/').endsWith('/src/constants/index.ts')
          if (source === '@/constants/metrics' || fromConstantsIndex) {
            return fileURLToPath(new URL('./landingMetrics.ts', import.meta.url))
          }
          return null
        },
      },
      {
        name: 'storybook-email-token-preview',
        enforce: 'pre',
        resolveId(source, importer) {
          if (
            importer?.replaceAll('\\', '/').includes('/src/lib/email/') &&
            /^(?:\.\.\/)+tokens$/.test(source)
          ) {
            return fileURLToPath(new URL('./emailTokens.ts', import.meta.url))
          }
          return null
        },
      },
      ...(config.plugins ?? []),
    ]
    return config
  },
}
export default config
