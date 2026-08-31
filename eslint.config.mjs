import nextConfig from 'eslint-config-next'
import prettierConfig from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import storybook from 'eslint-plugin-storybook'
import unusedImports from 'eslint-plugin-unused-imports'

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'storybook-static/**',
      'playwright-report/**',
      'test-results/**',
      '.agents/**',
      'scratch/**',
      'next-env.d.ts',
    ],
  },
  ...nextConfig,
  prettierConfig,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
]

export default eslintConfig
