import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const CONSENT_KEY = 'wm_cookie_consent';

export const getConsent = () => {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY));
  } catch { return null; }
};

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      // Defer banner to avoid it becoming the LCP element
      const timer = setTimeout(() => setVisible(true), 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (analytics) => {
    const consent = { necessary: true, analytics, timestamp: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
    if (analytics) window.location.reload(); // Reload to activate GA
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4"
          data-testid="cookie-consent-banner"
        >
          <div className="max-w-3xl mx-auto bg-[#1A1A1A] border border-white/10 p-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <Cookie size={20} className="text-[#C6A87C] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white text-sm leading-relaxed mb-1">
                  Korzystamy z plików cookies niezbędnych do działania strony oraz — za Twoją zgodą — cookies analitycznych (Google Analytics), które pomagają nam ulepszać serwis.
                </p>
                <p className="text-white/50 text-xs">
                  Szczegóły znajdziesz w <a href="/cookies" className="text-[#C6A87C] hover:underline">Polityce cookies</a> i <a href="/privacy" className="text-[#C6A87C] hover:underline">Polityce prywatności</a>.
                </p>
              </div>
              <button onClick={() => accept(false)} className="text-white/40 hover:text-white" aria-label="Zamknij">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4 ml-9">
              <button
                onClick={() => accept(true)}
                className="bg-[#C6A87C] text-[#1A1A1A] px-5 py-2 text-sm font-semibold hover:bg-[#B09060] transition-colors"
                data-testid="cookie-accept-all"
              >
                Akceptuję wszystkie
              </button>
              <button
                onClick={() => accept(false)}
                className="border border-white/20 text-white px-5 py-2 text-sm hover:bg-white/5 transition-colors"
                data-testid="cookie-accept-necessary"
              >
                Tylko niezbędne
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
