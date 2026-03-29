import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAutoTranslate } from '../../context/AutoTranslateContext';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieFaq = () => {
  const [settings, setSettings] = useState(null);
  const [openId, setOpenId] = useState(null);
  const { tr } = useAutoTranslate();

  useEffect(() => {
    fetch(`${API}/api/settings/balia-faq`)
      .then(r => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  if (!settings) return null;

  const items = (settings.items || []).filter(i => i.active).sort((a, b) => a.sort_order - b.sort_order);
  if (items.length === 0) return null;

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question_pl,
      acceptedAnswer: { "@type": "Answer", text: item.answer_pl },
    })),
  });

  return (
    <section id="balie-faq" data-testid="balie-faq-section" className="py-16 sm:py-20 bg-white">
      <Helmet script={[{ type: 'application/ld+json', innerHTML: faqSchema }]} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3" data-testid="balie-faq-title">
            {tr(settings.title_pl)}
          </h2>
          <p className="text-sm sm:text-base text-[#8C8C8C] max-w-xl mx-auto">
            {tr(settings.subtitle_pl)}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`border transition-colors ${isOpen ? 'border-[#D4AF37]/40 bg-[#FAFAF8]' : 'border-black/5 bg-white hover:border-[#D4AF37]/20'}`}
                data-testid={`balie-faq-item-${item.id}`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <span className="font-medium text-[#1A1A1A] pr-4">{tr(item.question_pl)}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                    <ChevronDown size={20} className="text-[#D4AF37]" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-[#595959] leading-relaxed text-sm">
                        {tr(item.answer_pl)}
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="mt-4 max-w-md w-full h-auto object-cover border border-black/5" loading="lazy" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
