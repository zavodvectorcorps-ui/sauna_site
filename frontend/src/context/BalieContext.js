import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;
const BalieContext = createContext(null);

const resolveUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API}${src}`;
};

// Preload all balie images in background for instant tab switching
const preloadImages = (data) => {
  if (!data) return;
  const urls = new Set();
  (data.colors || []).forEach(c => { if (c.image) urls.add(resolveUrl(c.image)); });
  (data.products || []).forEach(p => { if (p.image) urls.add(resolveUrl(p.image)); });
  (data.gallery || []).forEach(g => { if (g.url) urls.add(resolveUrl(g.url)); });
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
