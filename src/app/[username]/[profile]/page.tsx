import { EditorLayout } from '@/features/editor/components/EditorLayout';

export default async function NamedProfileEditorPage({
  params,
}: {
  params: Promise<{ username: string; profile: string }>;
}) {
  const { username, profile } = await params;

  return <EditorLayout username={username} profileSlug={profile} />;
}
