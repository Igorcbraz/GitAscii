import { AnalyticsEvents, UserProperties, ConsentState } from "./types";

export interface AnalyticsProvider {
  init(): void;
  identify(userId: string, properties?: UserProperties): void;
  setUserProperties(properties: UserProperties): void;
  track<E extends keyof AnalyticsEvents>(
    event: E,
    params?: AnalyticsEvents[E]
  ): void;
  trackPageView(url: string, title?: string): void;
  trackError(type: "api_error" | "generate_failed" | "widget_error" | "markdown_error" | "render_error", error: any, context?: Record<string, any>): void;
  updateConsent(consent: ConsentState): void;
}
