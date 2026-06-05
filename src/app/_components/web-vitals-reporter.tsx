"use client";

import { useEffect } from "react";
import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

function reportMetric(metric: Metric) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    rating: metric.rating,
    value: metric.value,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });

  if (process.env.NODE_ENV === "development") {
    console.info("[web-vitals]", body);
  }

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/web-vitals", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/web-vitals", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
  });
}

export function WebVitalsReporter() {
  useEffect(() => {
    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, []);

  return null;
}
