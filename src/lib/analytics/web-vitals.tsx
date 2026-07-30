"use client";

import { useReportWebVitals } from "next/web-vitals";
import { analytics } from "./index";

export function WebVitalsReporter() {
  useReportWebVitals((metric: any) => {
    let rating: "good" | "needs-improvement" | "poor" = "good";

    switch (metric.name) {
      case "CLS":
        if (metric.value > 0.25) rating = "poor";
        else if (metric.value > 0.1) rating = "needs-improvement";
        break;
      case "FCP":
        if (metric.value > 3000) rating = "poor";
        else if (metric.value > 1800) rating = "needs-improvement";
        break;
      case "LCP":
        if (metric.value > 4000) rating = "poor";
        else if (metric.value > 2500) rating = "needs-improvement";
        break;
      case "TTFB":
        if (metric.value > 1800) rating = "poor";
        else if (metric.value > 800) rating = "needs-improvement";
        break;
      case "INP":
        if (metric.value > 500) rating = "poor";
        else if (metric.value > 200) rating = "needs-improvement";
        break;
    }

    analytics.track("web_vitals", {
      id: metric.id,
      name: metric.name as any,
      value: metric.value,
      delta: metric.delta,
      rating: rating,
    });
  });

  return null;
}
export default WebVitalsReporter;
