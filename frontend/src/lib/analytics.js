import { useEffect, useCallback, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Parse UTM from URL on first load
const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || '',
  };
  // Persist UTMs in session so they survive navigation
  if (utm.utm_source) {
    sessionStorage.setItem('wm_utm', JSON.stringify(utm));
  }
  const stored = sessionStorage.getItem('wm_utm');
  return stored ? JSON.parse(stored) : utm;
};

const sendEvent = (event, meta = {}) => {
  const utm = getUtmParams();
  const payload = {
    event,
    page: window.location.pathname,
    referrer: document.referrer,
    ...utm,
    meta,
  };
  // Use sendBeacon for reliability (survives page unload)
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(`${API_URL}/api/analytics/event`, blob);
  } else {
    fetch(`${API_URL}/api/analytics/event`, { method: 'POST', body: blob, keepalive: true }).catch(() => {});
  }
};

// Fire GA4 and Facebook events
const fireExternalEvents = (eventName, params = {}) => {
  // Google Analytics 4 / gtag
  if (window.gtag) {
    window.gtag('event', eventName, params);
    // Google Ads conversion on lead events
    if ((eventName === 'generate_lead' || eventName === 'catalog_download') && window.__wm_ads_id && window.__wm_ads_label) {
      window.gtag('event', 'conversion', {
        send_to: `${window.__wm_ads_id}/${window.__wm_ads_label}`,
      });
    }
  }
  // Facebook Pixel
  if (window.fbq) {
    const fbEventMap = {
      generate_lead: 'Lead',
      catalog_download: 'Lead',
      page_view: 'PageView',
      click_cta: 'ViewContent',
    };
    const fbEvent = fbEventMap[eventName];
    if (fbEvent) window.fbq('track', fbEvent, params);
  }
};

// Public API
export const trackEvent = (event, meta = {}) => {
  sendEvent(event, meta);
  fireExternalEvents(event, meta);
};

// Hook for automatic page view tracking (requires react-router)
export const useAnalytics = () => {
  const lastPath = useRef('');

  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    if (path !== lastPath.current) {
      lastPath.current = path;
      trackEvent('page_view', { path: window.location.pathname });
    }
  });

  return { trackEvent };
};

// Component to inject GTM/GA4/FB Pixel scripts
// Respects GDPR cookie consent — analytics scripts load ONLY with consent
export const TrackingScripts = () => {
  const { getSetting } = useSettings();
  const tracking = getSetting('tracking_settings');
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !tracking) return;
    injected.current = true;

    // Check cookie consent
    let consent = null;
    try { consent = JSON.parse(localStorage.getItem('wm_cookie_consent')); } catch {}
    const analyticsAllowed = consent?.analytics === true;

    // Google Tag Manager — only with analytics consent
    if (tracking.gtm_id && analyticsAllowed) {
      const script = document.createElement('script');
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tracking.gtm_id}');`;
      document.head.appendChild(script);
      // noscript iframe
      const noscript = document.createElement('noscript');
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${tracking.gtm_id}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      document.body.prepend(noscript);
    }

    // Google Analytics 4 (standalone, if no GTM) — only with analytics consent
    if (tracking.ga4_id && !tracking.gtm_id && analyticsAllowed) {
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.ga4_id}`;
      document.head.appendChild(gtagScript);
      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${tracking.ga4_id}');`;
      if (tracking.google_ads_id) {
        inlineScript.innerHTML += `gtag('config','${tracking.google_ads_id}');`;
      }
      document.head.appendChild(inlineScript);
    }

    // Google Ads (if GTM is used) — only with analytics consent
    if (tracking.google_ads_id && tracking.gtm_id && analyticsAllowed) {
      const adsScript = document.createElement('script');
      adsScript.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('config','${tracking.google_ads_id}');`;
      document.head.appendChild(adsScript);
    }
    // Store Ads config globally for conversion tracking
    if (tracking.google_ads_id) {
      window.__wm_ads_id = tracking.google_ads_id;
      window.__wm_ads_label = tracking.google_ads_conversion_label || '';
    }

    // Facebook Pixel — only with analytics consent
    if (tracking.facebook_pixel_id && analyticsAllowed) {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${tracking.facebook_pixel_id}');fbq('track','PageView');`;
      document.head.appendChild(fbScript);
    }

    // Custom head code
    if (tracking.custom_head_code) {
      const div = document.createElement('div');
      div.innerHTML = tracking.custom_head_code;
      Array.from(div.children).forEach(child => document.head.appendChild(child.cloneNode(true)));
    }
  }, [tracking, getSetting]);

  return null;
};
