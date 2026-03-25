import { ShieldCheck, Hammer, Leaf, Truck, Wrench, Award, Flag, Waves, Wind, Lightbulb, ThermometerSun } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: '2 Lata Gwarancji', desc: 'Pełne bezpieczeństwo i wsparcie serwisowe na wszystkie nasze produkty.' },
  { icon: Hammer, title: 'Ręczna Produkcja', desc: 'Każdy detal dopracowany przez polskich rzemieślników z wieloletnim doświadczeniem.' },
  { icon: Leaf, title: 'Eko Materiały', desc: 'Modrzew syberyjski i świerk skandynawski z certyfikowanych, zrównoważonych źródeł.' },
];

const options = [
  { icon: Waves, title: 'Hydromasaż', desc: 'System dysz masujących dla głębokiego relaksu' },
  { icon: Wind, title: 'Aeromasaż', desc: 'Delikatne bąbelki powietrza dla odprężenia' },
  { icon: Lightbulb, title: 'Oświetlenie LED', desc: 'Nastrojowe światła w różnych kolorach' },
  { icon: ThermometerSun, title: 'Pokrywa termiczna', desc: 'Utrzymuje temperaturę i chroni przed zanieczyszczeniami' },
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {features.map((f, i) => (
          <div key={i} className="bg-[#1A1E27] border border-white/5 p-6 hover:border-[#D4AF37]/30 transition-colors">
            <f.icon size={28} className="text-[#D4AF37] mb-4" />
            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Additional options */}
      <div className="mb-10">
        <h3 className="text-center text-white/60 text-sm font-medium tracking-wider uppercase mb-6">Dostępne opcje dodatkowe</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {options.map((o, i) => (
            <div key={i} className="bg-[#1A1E27]/50 border border-white/5 p-4 text-center hover:border-[#D4AF37]/20 transition-colors">
              <o.icon size={24} className="text-[#D4AF37] mx-auto mb-2" />
              <h4 className="text-white font-medium text-sm mb-1">{o.title}</h4>
              <p className="text-white/30 text-xs">{o.desc}</p>
            </div>
          ))}
        </div>
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
