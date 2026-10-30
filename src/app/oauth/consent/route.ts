import { readBody, requireAutomation, requireSameOrigin } from '@/features/automation/config'
import { AutomationError } from '@/features/automation/errors'
import { errorResponse } from '@/features/automation/http'
import { authorize } from '@/features/automation/oauth'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    requireAutomation()
    requireSameOrigin(request)
    const session = await getSession()
    if (!session) throw new AutomationError('UNAUTHORIZED', 'Sign in again.', 401)
    const form = new URLSearchParams(await readBody(request, 16384))
    const location = await authorize(
      form.get('ticket') || '',
      session,
      form.get('decision') === 'allow'
    )
    if (request.headers.get('accept')?.includes('application/json')) {
      return Response.json(
        { redirectTo: location.toString() },
        { headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } }
      )
    }
    return new Response(null, {
      status: 303,
      headers: {
        Location: location.toString(),
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
      },
    })
  } catch (error) {
    return errorResponse(error, true)
  }
}
