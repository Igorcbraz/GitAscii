import { readBody, requireAutomation } from '@/features/automation/config'
import { errorResponse, privateHeaders } from '@/features/automation/http'
import { exchangeToken } from '@/features/automation/oauth'

export async function POST(request: Request) {
  try {
    requireAutomation()
    return Response.json(await exchangeToken(new URLSearchParams(await readBody(request, 16384))), {
      headers: privateHeaders,
    })
  } catch (error) {
    return errorResponse(error, true)
  }
}
