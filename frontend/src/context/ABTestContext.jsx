import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ABTestContext = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL;

// Persistent visitor ID via cookie
const getVisitorId = () => {
  const key = 'wm_ab_vid';
  let vid = null;
  try {
    vid = document.cookie.split('; ').find(c => c.startsWith(key + '='))?.split('=')[1];
  } catch {}
  if (!vid) {
    vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    document.cookie = `${key}=${vid};path=/;max-age=${365 * 86400};SameSite=Lax`;
  }
  return vid;
};

// Deterministic variant assignment: hash visitor_id + test_id → variant index
const assignVariant = (visitorId, testId, variantCount) => {
  let hash = 0;
  const str = visitorId + testId;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % variantCount;
};

export const ABTestProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const visitorId = useRef(getVisitorId());
  const trackedImpressions = useRef(new Set());

  useEffect(() => {
    fetch(`${API}/api/ab/active`)
      .then(r => r.json())
      .then(setTests)
      .catch(() => {});
  }, []);

  const trackEvent = useCallback((testId, variantId, event) => {
    const dedupeKey = `${testId}_${variantId}_${event}`;
    if (event === 'impression' && trackedImpressions.current.has(dedupeKey)) return;
    if (event === 'impression') trackedImpressions.current.add(dedupeKey);

    fetch(`${API}/api/ab/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test_id: testId,
        variant_id: variantId,
        event,
        visitor_id: visitorId.current,
        page: window.location.pathname,
      }),
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {});
  }, []);

  const getVariant = useCallback((buttonId) => {
    const test = tests.find(t => t.button_id === buttonId && t.status === 'active');
    if (!test || !test.variants?.length) return null;
    const idx = assignVariant(visitorId.current, test.id, test.variants.length);
    const variant = test.variants[idx];
    return { testId: test.id, variant, variantIndex: idx };
  }, [tests]);

  return (
    <ABTestContext.Provider value={{ tests, getVariant, trackEvent }}>
      {children}
    </ABTestContext.Provider>
  );
};

export const useABTest = (buttonId) => {
  const ctx = useContext(ABTestContext);
  const result = ctx ? ctx.getVariant(buttonId) : null;
  const hasTracked = useRef(false);

  useEffect(() => {
    if (result && !hasTracked.current && ctx) {
      hasTracked.current = true;
      ctx.trackEvent(result.testId, result.variant.id, 'impression');
    }
  }, [result, ctx]);

  if (!result || !ctx) {
    return { variant: null, trackClick: () => {} };
  }

  const trackClick = () => {
    ctx.trackEvent(result.testId, result.variant.id, 'click');
  };

  return { variant: result.variant, trackClick };
};
