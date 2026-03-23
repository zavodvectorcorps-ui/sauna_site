import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const FAQ = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/settings/faq`)
      .then(r => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  if (!settings) return null;

  const lang = language.toLowerCase();
  const items = (settings.items || []).filter(i => i.active).sort((a, b) => a.sort_order - b.sort_order);
  if (items.length === 0) return null;

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item[`question_${lang}`] || item.question_pl,
      acceptedAnswer: {
        "@type": "Answer",
        text: item[`answer_${lang}`] || item.answer_pl,
      },
    })),
  });

  return (
    <section id="faq" data-testid="faq-section" className="section-spacing bg-white">
      <Helmet
        script={[{ type: 'application/ld+json', innerHTML: faqSchema }]}
      />
      <div className="container-main">
        <div className="text-center mb-12">
          <div className="gold-line mx-auto mb-6" />
          <h2 className="section-title" data-testid="faq-title">
            {settings[`title_${lang}`] || settings.title_pl}
          </h2>
          <p className="section-subtitle mx-auto">
            {settings[`subtitle_${lang}`] || settings.subtitle_pl}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {items.map((item) => {
            const isOpen = openId === item.id;
            const question = item[`question_${lang}`] || item.question_pl;
            const answer = item[`answer_${lang}`] || item.answer_pl;

            return (
              <div
                key={item.id}
                className={`border transition-colors ${isOpen ? 'border-[#C6A87C]/40 bg-[#F9F9F7]' : 'border-black/5 bg-white hover:border-[#C6A87C]/20'}`}
                data-testid={`faq-item-${item.id}`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <span className="font-medium text-[#1A1A1A] pr-4">{question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={20} className="text-[#C6A87C]" />
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
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-[#595959] leading-relaxed">
                        {answer}
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
