import { readBody, requireAutomation } from '@/features/automation/config'
import { errorResponse, privateHeaders } from '@/features/automation/http'
import { revokeToken } from '@/features/automation/oauth'

export async function POST(request: Request) {
  try {
    requireAutomation()
    await revokeToken(new URLSearchParams(await readBody(request, 16384)))
    return new Response(null, { status: 200, headers: privateHeaders })
  } catch (error) {
    return errorResponse(error, true)
  }
}
