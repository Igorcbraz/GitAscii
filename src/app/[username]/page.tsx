import { EditorLayout } from '@/features/editor/components/EditorLayout'

export const dynamic = 'force-dynamic'

export default async function DefaultEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ generate?: string }>
}) {
  const { username } = await params
  const { generate } = await searchParams

  const autoGenerate = generate === 'true'

  return <EditorLayout username={username} profileSlug="default" autoGenerate={autoGenerate} />
}
