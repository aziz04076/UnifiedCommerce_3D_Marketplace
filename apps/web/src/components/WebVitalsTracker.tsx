'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    // Log Core Web Vitals in production for telemetry monitoring
    const isExceeded =
      (metric.name === 'LCP' && metric.value > 2500) ||
      (metric.name === 'CLS' && metric.value > 0.1) ||
      (metric.name === 'INP' && metric.value > 200) ||
      (metric.name === 'FCP' && metric.value > 1800);

    if (isExceeded) {
      console.warn(`[WEB_VITALS_EXCEEDED] ${metric.name}: ${metric.value.toFixed(1)} (${metric.rating})`);
    } else {
      console.info(`[WEB_VITALS] ${metric.name}: ${metric.value.toFixed(1)} (${metric.rating})`);
    }
  });

  return null;
}
