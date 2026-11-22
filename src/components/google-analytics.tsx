'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA4 stays dormant until the site's consent UI sets xucuz_analytics=granted. */
export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return;
    const startIfConsented = () => {
      if (!document.cookie.split(';').some((part) => part.trim() === 'xucuz_analytics=granted')) return;
      if (document.querySelector('script[data-xucuz-google-analytics]')) return;
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));
      window.gtag('js', new Date());
      window.gtag('config', measurementId, { anonymize_ip: true });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.xucuzGoogleAnalytics = 'true';
      document.head.appendChild(script);
    };
    startIfConsented();
    window.addEventListener('xucuz:analytics-consent', startIfConsented);
    return () => window.removeEventListener('xucuz:analytics-consent', startIfConsented);
  }, [measurementId]);

  return null;
}
