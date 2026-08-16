import { generateProfileSvgResponse } from '@/services/profileSvgService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string; profileSlug: string }> }
) {
  const { username, profileSlug } = await params

  return generateProfileSvgResponse(request, {
    username,
    profileSlug: profileSlug || 'default',
  })
}
