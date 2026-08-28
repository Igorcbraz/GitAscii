import packageJson from '../../package.json'

export const APP_URL = 'https://gitascii.com'
export const APP_DOMAIN = 'gitascii.com'
export const APP_VERSION = packageJson.version

export * from './comparisons'
export * from './editor'
export * from './explore'
export * from './landing'
export * from './languages'
export * from './legal'
export * from './links'
export * from './metrics'
export * from './pricing'
export * from './widgetIds'
export * from './widgets'
export { PRO_PLAN_TIERS } from '@/features/pro/types/subscription'
