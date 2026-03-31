import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;
const BalieContext = createContext(null);

const resolveUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API}${src}`;
};

// Build optimized image URL for preloading (server-side resize + WebP)
const optUrl = (src, w, q) => {
  const resolved = resolveUrl(src);
  if (!resolved || !resolved.includes('/api/images/')) return resolved;
  return `${resolved}?w=${w}&q=${q}`;
};

// Preload all balie images in background for instant tab switching
const preloadImages = (data) => {
  if (!data) return;
  const urls = new Set();
  (data.colors || []).forEach(c => { if (c.image) urls.add(optUrl(c.image, 200, 70)); });
  (data.products || []).forEach(p => { if (p.image) urls.add(optUrl(p.image, 500, 75)); });
  (data.gallery || []).forEach(g => { if (g.url) urls.add(optUrl(g.url, 600, 75)); });
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

export const BalieProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const preloadedRef = useRef(false);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/balia/bulk`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
        if (!preloadedRef.current) {
          preloadedRef.current = true;
          preloadImages(d);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <BalieContext.Provider value={{ data, loading, refresh }}>
      {children}
    </BalieContext.Provider>
  );
};

export const useBalieData = () => {
  const ctx = useContext(BalieContext);
  if (!ctx) return { data: null, loading: true, refresh: () => {} };
  return ctx;
};
