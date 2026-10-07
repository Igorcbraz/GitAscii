import { API_ENDPOINTS } from './endpoints'

interface LoginNavigationEvent {
  preventDefault: () => void
}

export function navigateToGithubLogin(event: LoginNavigationEvent, redirectTo?: string) {
  event.preventDefault()
  // OAuth redirects cross origins and require a document request rather than an RSC fetch.
  window.location.assign(new URL(API_ENDPOINTS.AUTH.LOGIN(redirectTo), window.location.origin).href)
}
