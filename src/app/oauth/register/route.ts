import { readBody, requireAutomation } from '@/features/automation/config'
import { errorResponse, privateHeaders } from '@/features/automation/http'
import { registerClient } from '@/features/automation/oauth'

export async function POST(request: Request) {
  try {
    requireAutomation()
    return Response.json(await registerClient(JSON.parse(await readBody(request, 16384))), {
      status: 201,
      headers: privateHeaders,
    })
  } catch (error) {
    return errorResponse(error, true)
  }
}
