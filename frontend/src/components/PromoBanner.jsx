import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Percent } from 'lucide-react';
import { useAutoTranslate } from '../context/AutoTranslateContext';

const API = process.env.REACT_APP_BACKEND_URL;

export const PromoBanner = () => {
  const [data, setData] = useState(null);
  const { tr } = useAutoTranslate();

  useEffect(() => {
    fetch(`${API}/api/settings/promo-banner`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  const scrollToCalc = () => {
    const el = document.getElementById('calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!data) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2A2520] to-[#1A1A1A] py-10 sm:py-12" data-testid="promo-banner">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#C6A87C]/15 border border-[#C6A87C]/30 px-4 py-1.5 mb-6">
            <Percent size={14} className="text-[#C6A87C]" />
            <span className="text-[#C6A87C] text-xs font-semibold tracking-wider uppercase">{tr(data.badge)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            {tr(data.title_line1)}<br />
            <span className="text-[#C6A87C]">{tr(data.title_line2)}</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm sm:text-base">
            {tr(data.description)}
          </p>
          <button
            onClick={scrollToCalc}
            className="inline-flex items-center gap-3 bg-[#C6A87C] text-white px-8 py-4 font-semibold hover:bg-[#B09060] transition-colors text-sm sm:text-base"
            data-testid="promo-banner-cta"
          >
            <Calculator size={20} />
            {tr(data.button_text)}
          </button>
        </motion.div>
      </div>
    </section>
  );
};
