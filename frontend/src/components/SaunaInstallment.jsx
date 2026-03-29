import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Percent, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const defaultItems = [
  { icon: Calendar, title: 'Od 4 do 20 miesięcy', desc: 'Elastyczny okres spłaty' },
  { icon: Percent, title: '0% nadpłaty', desc: 'Bez ukrytych kosztów' },
  { icon: CreditCard, title: 'Rata od 500 zl/mc', desc: 'Przystepna miesieczna rata' },
  { icon: Truck, title: 'Darmowa dostawa', desc: 'Na terenie całej Polski' },
];

export const SaunaInstallment = ({ variant = 'full' }) => {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/settings/installment`)
      .then(r => r.json())
      .then(d => { if (d.sauna_logo_url) setLogoUrl(d.sauna_logo_url); })
      .catch(() => {});
  }, []);

  if (variant === 'compact') {
    return (
      <div className="bg-[#F5F0EB] border border-[#C6A87C]/20 p-4" data-testid="sauna-installment-compact">
        <div className="flex items-center gap-3">
          {logoUrl && <img src={logoUrl} alt="Partner" className="h-6 object-contain" data-testid="sauna-installment-compact-logo" />}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CreditCard size={14} className="text-[#C6A87C]" />
              <span className="text-[#C6A87C] text-sm font-semibold">Raty od 500 zl/mc</span>
            </div>
            <p className="text-gray-500 text-xs">Od 4 do 20 miesięcy, 0% nadpłaty, darmowa dostawa</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#F9F9F7]" data-testid="sauna-installment">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          {logoUrl && (
            <div className="mb-4" data-testid="sauna-installment-logo">
              <img src={logoUrl} alt="Partner finansowy" className="h-12 mx-auto object-contain" />
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-2">
            Komfort dostępny <span className="text-[#C6A87C]">od razu!</span>
          </h2>
          <p className="text-gray-500 text-sm">Kupuj na raty — wygodnie i bez dodatkowych kosztow</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {defaultItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-[#C6A87C]/15 p-4 text-center hover:border-[#C6A87C]/40 transition-colors shadow-sm"
            >
              <item.icon size={24} className="text-[#C6A87C] mx-auto mb-2" />
              <h3 className="text-[#2C2C2C] font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <a href="#contact" className="inline-block px-8 py-3 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors" data-testid="sauna-installment-cta">
            Zapytaj o raty
          </a>
        </div>
      </div>
    </section>
  );
};
