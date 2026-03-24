import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CatalogFormGate } from './CatalogFormGate';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const StickyCTA = () => {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasCatalog, setHasCatalog] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/catalog/info`).then(r => r.json()).then(d => setHasCatalog(d.available)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;
      const heroEl = document.getElementById('hero') || document.querySelector('[data-testid="hero-section"]');
      const calcEl = document.getElementById('calculator');
      const contactEl = document.getElementById('contact');

      const scrollY = window.scrollY + window.innerHeight;
      const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 600;
      const calcTop = calcEl ? calcEl.offsetTop : Infinity;
      const contactTop = contactEl ? contactEl.offsetTop : Infinity;
      const currentScroll = window.scrollY;

      // Show after scrolling past hero, hide near calculator and contact
      const nearCalcOrContact = (currentScroll + window.innerHeight / 2 > calcTop && currentScroll < calcTop + (calcEl?.offsetHeight || 0))
        || (currentScroll + window.innerHeight / 2 > contactTop);

      setVisible(currentScroll > heroBottom * 0.7 && !nearCalcOrContact);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const labels = {
    pl: { cta: 'Oblicz cenę sauny', subtitle: 'Konfiguracja online w 2 minuty', catalog: 'Pobierz katalog' },
    en: { cta: 'Calculate sauna price', subtitle: 'Online configuration in 2 minutes', catalog: 'Download catalog' },
  };
  const lang = language.toLowerCase();
  const l = labels[lang] || labels.pl;

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg border-t border-[#C6A87C]/20 py-3 px-4 md:py-4"
          data-testid="sticky-cta"
        >
          <div className="container-main flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-white font-semibold text-sm md:text-base">{l.cta}</p>
              <p className="text-white/50 text-xs">{l.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={scrollToCalculator}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#C6A87C] text-white px-6 py-3 font-semibold hover:bg-[#B09060] transition-colors text-sm md:text-base"
                data-testid="sticky-cta-btn"
              >
                {l.cta}
                <ArrowRight size={18} />
              </button>
              {hasCatalog && (
                <CatalogFormGate
                  testId="sticky-catalog-btn"
                  className="hidden sm:flex items-center gap-2 border border-white/20 text-white px-4 py-3 font-medium hover:bg-white/10 transition-colors text-sm"
                >
                  <Download size={16} />
                  {l.catalog}
                </CatalogFormGate>
              )}
              <button
                onClick={() => setDismissed(true)}
                className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
