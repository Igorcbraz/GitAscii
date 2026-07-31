export type PlanType = 'free' | 'pro' | 'enterprise'

export interface UserProperties {
  language?: string
  country?: string
  theme?: 'light' | 'dark' | 'system'
  plan?: PlanType
  templates_created?: number
  widgets_used?: number
  userId?: string
}

export interface ConsentState {
  analytics_storage: 'granted' | 'denied'
  ad_storage: 'granted' | 'denied'
  ad_user_data: 'granted' | 'denied'
  ad_personalization: 'granted' | 'denied'
}

export interface ErrorPayload {
  message: string
  stack?: string
  endpoint?: string
  statusCode?: number
  widget?: string
  template?: string
  context?: string
}

export interface GenerateReadmeParams {
  template: string
  theme: string
  widgets_count: number
  generation_time_ms?: number
}

export interface PreviewTemplateParams {
  template: string
  category?: string
}

export interface TemplateSelectedParams {
  template: string
  category?: string
}

export interface WidgetParams {
  widget_id: string
  category?: string
  total_widgets_used?: number
}

export interface CopyParams {
  format: 'markdown' | 'svg'
  template: string
  widgets_count?: number
}

export interface DownloadParams {
  format: 'svg' | 'png'
  template: string
  theme?: string
}

export interface PublishProfileParams {
  username: string
  theme: string
  widgetsCount: number
}

export interface ShareProfileParams {
  platform: 'twitter' | 'linkedin' | 'whatsapp' | 'copy_link'
  username: string
}

export interface OpenEditorParams {
  entryPoint: 'hero' | 'header' | 'templates_gallery' | 'direct'
}

export interface UsernameCheckedParams {
  username: string
  exists: boolean
  responseTimeMs: number
}

export interface ApiRequestParams {
  endpoint: string
  method: string
}

export interface ApiSuccessParams {
  endpoint: string
  method: string
  responseTimeMs: number
}

export interface ApiErrorParams {
  endpoint: string
  method: string
  statusCode: number
  errorMessage: string
}

export interface AuthParams {
  method: 'github' | 'google' | 'email'
  userId?: string
}

export interface AutomaticEventParams {
  durationSeconds?: number
  interactionType?: string
  reason?: string
}

export interface AnalyticsEvents {
  generate_readme: GenerateReadmeParams
  preview_template: PreviewTemplateParams
  template_selected: TemplateSelectedParams
  widget_added: WidgetParams
  widget_removed: WidgetParams
  copy_markdown: CopyParams
  copy_svg: CopyParams
  download_svg: DownloadParams
  download_png: DownloadParams
  publish_profile: PublishProfileParams
  share_profile: ShareProfileParams
  open_editor: OpenEditorParams
  username_checked: UsernameCheckedParams
  api_request: ApiRequestParams
  api_success: ApiSuccessParams
  api_error: ApiErrorParams
  login: AuthParams
  signup: AuthParams

  generate_failed: ErrorPayload
  widget_error: ErrorPayload
  markdown_error: ErrorPayload
  render_error: ErrorPayload

  first_visit: undefined
  first_interaction: { action: string }
  session_start: undefined
  editor_time: { durationSeconds: number }
  preview_time: { durationSeconds: number }
  abandoned_generation: { stepReached: string; reason?: string }

  web_vitals: {
    id: string
    name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP'
    value: number
    delta: number
    rating: 'good' | 'needs-improvement' | 'poor'
  }
}
