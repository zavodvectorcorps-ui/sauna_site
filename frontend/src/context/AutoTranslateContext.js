import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const API = process.env.REACT_APP_BACKEND_URL;
const CACHE_KEY = 'wm-translations-cache';

const AutoTranslateContext = createContext();

// Load cache from localStorage
const loadCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch { return {}; }
};

// Save cache to localStorage
const saveCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

export const AutoTranslateProvider = ({ children }) => {
  const { language } = useLanguage();
  const [cache, setCache] = useState(loadCache);
  const pendingRef = useRef(new Set());
  const timerRef = useRef(null);
  const [, forceUpdate] = useState(0);

  // Flush pending translations in batch
  const flushPending = useCallback(async (lang) => {
    if (pendingRef.current.size === 0) return;
    const texts = [...pendingRef.current];
    pendingRef.current.clear();

    try {
      const res = await fetch(`${API}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, target_lang: lang }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const translations = data.translations || {};

      setCache(prev => {
        const updated = { ...prev };
        for (const [original, translated] of Object.entries(translations)) {
          if (!updated[lang]) updated[lang] = {};
          updated[lang][original] = translated;
        }
        saveCache(updated);
        return updated;
      });
      forceUpdate(n => n + 1);
    } catch (err) {
      console.error('Translation fetch error:', err);
    }
  }, []);

  // Schedule batch flush with debounce
  const scheduleBatch = useCallback((lang) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flushPending(lang), 150);
  }, [flushPending]);

  // Main translation function
  const tr = useCallback((text) => {
    if (!text || typeof text !== 'string') return text || '';
    if (language === 'pl') return text;

    // Check cache
    const langCache = cache[language];
    if (langCache && langCache[text]) return langCache[text];

    // Queue for translation
    if (!pendingRef.current.has(text)) {
      pendingRef.current.add(text);
      scheduleBatch(language);
    }

    return text; // Return original while loading
  }, [language, cache, scheduleBatch]);

  // When language changes, trigger pending translations
  useEffect(() => {
    if (language !== 'pl') {
      forceUpdate(n => n + 1);
    }
  }, [language]);

  return (
    <AutoTranslateContext.Provider value={{ tr, language }}>
      {children}
    </AutoTranslateContext.Provider>
  );
};

export const useAutoTranslate = () => {
  const ctx = useContext(AutoTranslateContext);
  if (!ctx) throw new Error('useAutoTranslate must be used within AutoTranslateProvider');
  return ctx;
};
