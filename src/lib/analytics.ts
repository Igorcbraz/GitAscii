import { sendGAEvent } from "@next/third-parties/google";


export interface ClickEventParams {
  buttonId: string;
  label: string;
  location: string;
  category?: string;
  [key: string]: any;
}


export interface EditorEventParams {
  action: "change_theme" | "change_ascii" | "download_svg" | "copy_markdown" | "preview_mode" | "language_change";
  value?: string;
  [key: string]: any;
}


export const analytics = {
  event(eventName: string, params?: Record<string, any>) {
    try {
      sendGAEvent({
        event: eventName,
        value: params,
      });
      if (process.env.NODE_ENV === "development") {
        console.log(`[GA Event] ${eventName}:`, params);
      }
    } catch (error) {
      console.error("[GA Event Error]:", error);
    }
  },

  trackClick({ buttonId, label, location, category = "cta", ...extra }: ClickEventParams) {
    this.event("button_click", {
      button_id: buttonId,
      button_label: label,
      location: location,
      event_category: category,
      ...extra,
    });
  },

  trackEditorAction({ action, value, ...extra }: EditorEventParams) {
    this.event("editor_action", {
      editor_action: action,
      editor_value: value,
      ...extra,
    });
  },

  trackConversion(conversionName: string, details?: Record<string, any>) {
    this.event("conversion", {
      conversion_name: conversionName,
      ...details,
    });
  },
};
