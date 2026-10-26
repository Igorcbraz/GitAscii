import { appOrigin, requireAutomation, SCOPES } from '@/features/automation/config'
import { errorResponse, privateHeaders } from '@/features/automation/http'

export async function GET() {
  try {
    requireAutomation()
    const origin = appOrigin()
    return Response.json(
      {
        issuer: origin,
        authorization_endpoint: `${origin}/oauth/authorize`,
        token_endpoint: `${origin}/oauth/token`,
        registration_endpoint: `${origin}/oauth/register`,
        revocation_endpoint: `${origin}/oauth/revoke`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        token_endpoint_auth_methods_supported: ['none'],
        revocation_endpoint_auth_methods_supported: ['none'],
        code_challenge_methods_supported: ['S256'],
        scopes_supported: SCOPES,
        authorization_response_iss_parameter_supported: true,
      },
      { headers: privateHeaders }
    )
  } catch (error) {
    return errorResponse(error, true)
  }
}
