import { ShieldCheck, Hammer, Leaf, Truck, Wrench, Award, Flag } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: '2 Lata Gwarancji', desc: 'Pełne bezpieczeństwo i wsparcie serwisowe na wszystkie nasze produkty.' },
  { icon: Hammer, title: 'Ręczna Produkcja', desc: 'Każdy detal dopracowany przez polskich rzemieślników z wieloletnim doświadczeniem.' },
  { icon: Leaf, title: 'Eko Certyfikat', desc: 'Drewno pozyskiwane wyłącznie z odpowiedzialnych, certyfikowanych źródeł.' },
];

const badges = [
  { icon: Truck, title: 'Dostawa w całej Polsce' },
  { icon: Wrench, title: 'Montaż w cenie' },
  { icon: Award, title: 'Certyfikat FSC' },
  { icon: Flag, title: 'Made in Poland' },
];

export const BalieFeatures = () => (
  <section className="relative py-20 bg-[#0F1218]" data-testid="balie-features">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Dlaczego <span className="text-[#D4AF37]">WM-Balia?</span>
        </h2>
        <p className="text-white/50 text-sm max-w-xl mx-auto">
          Łączymy tradycyjne rzemiosło z nowoczesnym designem, tworząc produkty najwyższej jakości.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {features.map((f, i) => (
          <div key={i} className="bg-[#1A1E27] border border-white/5 p-6 hover:border-[#D4AF37]/30 transition-colors">
            <f.icon size={28} className="text-[#D4AF37] mb-4" />
            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#1A1E27]/50 border border-white/5 px-4 py-3">
            <b.icon size={18} className="text-[#D4AF37] flex-shrink-0" />
            <span className="text-white/70 text-sm">{b.title}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
