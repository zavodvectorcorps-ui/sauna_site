import { CreditCard, Calendar, Percent, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { icon: Calendar, title: 'Od 4 do 20 miesiecy', desc: 'Elastyczny okres splaty' },
  { icon: Percent, title: '0% nadplaty', desc: 'Bez ukrytych kosztow' },
  { icon: CreditCard, title: 'Rata od 500 zl/mc', desc: 'Przystepna miesieczna rata' },
  { icon: Truck, title: 'Darmowa dostawa', desc: 'Na terenie calej Polski' },
];

export const SaunaInstallment = ({ variant = 'full' }) => {
  if (variant === 'compact') {
    return (
      <div className="bg-[#F5F0EB] border border-[#C6A87C]/20 p-4" data-testid="sauna-installment-compact">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={16} className="text-[#C6A87C]" />
          <span className="text-[#C6A87C] text-sm font-semibold">Raty od 500 zl/mc</span>
        </div>
        <p className="text-gray-500 text-xs">Od 4 do 20 miesiecy, 0% nadplaty, darmowa dostawa</p>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-2">
            Komfort dostepny <span className="text-[#C6A87C]">od razu!</span>
          </h2>
          <p className="text-gray-500 text-sm">Kupuj na raty — wygodnie i bez dodatkowych kosztow</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {items.map((item, i) => (
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
