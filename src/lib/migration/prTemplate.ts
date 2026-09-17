import { MIGRATION_TEMPLATES } from '@/constants'

export function generateMigrationPrContent(username: string): {
  title: string
  body: string
} {
  return {
    title: MIGRATION_TEMPLATES.PR.TITLE,
    body: MIGRATION_TEMPLATES.PR.BODY(username),
  }
}
