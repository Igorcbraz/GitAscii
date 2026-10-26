import { appOrigin, requireAutomation } from '@/features/automation/config'
import { errorResponse, privateHeaders } from '@/features/automation/http'

export async function GET() {
  try {
    requireAutomation()
    return Response.json(
      {
        resource: `${appOrigin()}/mcp`,
        authorization_servers: [appOrigin()],
        bearer_methods_supported: ['header'],
        scopes_supported: ['account:read', 'profiles:read'],
      },
      { headers: privateHeaders }
    )
  } catch (error) {
    return errorResponse(error, true)
  }
}
