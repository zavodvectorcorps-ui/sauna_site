import { CreditCard, Calendar, Percent, Truck } from 'lucide-react';

const items = [
  { icon: Calendar, title: 'Okres od 4 do 20 miesiecy', desc: 'Elastyczny czas splaty' },
  { icon: Percent, title: '0% nadplaty', desc: 'Bez ukrytych kosztow' },
  { icon: CreditCard, title: 'Rata od 300 zl/mc', desc: 'Przystepna rata' },
  { icon: Truck, title: 'Darmowa dostawa', desc: 'Na terenie calej Polski' },
];

export const BalieInstallment = ({ variant = 'full' }) => {
  if (variant === 'compact') {
    return (
      <div className="bg-[#1A1E27] border border-[#D4AF37]/20 p-4" data-testid="balie-installment-compact">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={16} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-sm font-semibold">Raty od 300 zl/mc</span>
        </div>
        <p className="text-white/40 text-xs">Okres od 4 do 20 miesiecy, 0% nadplaty, darmowa dostawa</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#0A0D12]" data-testid="balie-installment">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Komfort dostepny <span className="text-[#D4AF37]">od razu!</span>
          </h2>
          <p className="text-white/40 text-sm">Kupuj na raty — wygodnie i bez dodatkowych kosztow</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {items.map((item, i) => (
            <div key={i} className="bg-[#1A1E27] border border-[#D4AF37]/20 p-4 text-center hover:border-[#D4AF37]/50 transition-colors">
              <item.icon size={24} className="text-[#D4AF37] mx-auto mb-2" />
              <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-white/30 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href="#kontakt-balie" className="inline-block px-8 py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors" data-testid="balie-installment-cta">
            Zapytaj o raty
          </a>
        </div>
      </div>
    </section>
  );
};
