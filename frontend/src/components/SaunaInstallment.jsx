import { useState } from 'react';
import { CreditCard, Calendar, Percent, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { resolveMediaUrl } from '../lib/utils';
import { useAutoTranslate } from '../context/AutoTranslateContext';
import { useSettings } from '../context/SettingsContext';

export const SaunaInstallment = ({ variant = 'full' }) => {
  const { tr } = useAutoTranslate();
  const { getSetting } = useSettings();
  const installData = getSetting('installment_settings');
  const logoUrl = installData?.sauna_logo_url ? resolveMediaUrl(installData.sauna_logo_url) : '';

  const defaultItems = [
    { icon: Calendar, title: tr('Od 4 do 20 miesięcy'), desc: tr('Elastyczny okres spłaty') },
    { icon: Percent, title: tr('0% nadpłaty'), desc: tr('Bez ukrytych kosztów') },
    { icon: CreditCard, title: tr('Rata od 500 zl/mc'), desc: tr('Przystępna miesięczna rata') },
    { icon: Truck, title: tr('Darmowa dostawa'), desc: tr('Na terenie całej Polski') },
  ];

  if (variant === 'compact') {
    return (
      <div className="bg-[#F5F0EB] border border-[#C6A87C]/20 p-4" data-testid="sauna-installment-compact">
        <div className="flex items-center gap-3">
          {logoUrl && <img src={logoUrl} alt="Partner" className="h-6 object-contain" data-testid="sauna-installment-compact-logo" />}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CreditCard size={14} className="text-[#C6A87C]" />
              <span className="text-[#C6A87C] text-sm font-semibold">{tr('Raty od 500 zl/mc')}</span>
            </div>
            <p className="text-gray-500 text-xs">{tr('Od 4 do 20 miesięcy, 0% nadpłaty, darmowa dostawa')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-10 sm:py-12 bg-[#F9F9F7]" data-testid="sauna-installment">
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
            {tr('Komfort dostępny')} <span className="text-[#C6A87C]">{tr('od razu!')}</span>
          </h2>
          <p className="text-gray-500 text-sm">{tr('Kupuj na raty — wygodnie i bez dodatkowych kosztów')}</p>
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
            {tr('Zapytaj o raty')}
          </a>
        </div>
      </div>
    </section>
  );
};
