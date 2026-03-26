import { useState, useEffect } from 'react';
import { ShieldCheck, Hammer, Leaf, Truck, Wrench, Award, Flag, Waves, Wind, Lightbulb, ThermometerSun } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const iconMap = { ShieldCheck, Hammer, Leaf, Truck, Wrench, Award, Flag, Waves, Wind, Lightbulb, ThermometerSun };

const defaultFeatures = [
  { icon: 'ShieldCheck', title: '2 Lata Gwarancji', desc: 'Pelne bezpieczenstwo i wsparcie serwisowe na wszystkie nasze produkty.', active: true },
  { icon: 'Hammer', title: 'Reczna Produkcja', desc: 'Kazdy detal dopracowany przez polskich rzemieslnikow z wieloletnim doswiadczeniem.', active: true },
  { icon: 'Leaf', title: 'Eko Materialy', desc: 'Modrzew syberyjski i swierk skandynawski z certyfikowanych, zrownowazonych zrodel.', active: true },
];

const defaultOptions = [
  { icon: 'Waves', title: 'Hydromasaz', desc: 'System dysz masujacych dla glebokiego relaksu', active: true },
  { icon: 'Wind', title: 'Aeromasaz', desc: 'Delikatne babelki powietrza dla odprezenia', active: true },
  { icon: 'Lightbulb', title: 'Oswietlenie LED', desc: 'Nastrojowe swiatla w roznych kolorach', active: true },
  { icon: 'ThermometerSun', title: 'Pokrywa termiczna', desc: 'Utrzymuje temperature i chroni przed zanieczyszczeniami', active: true },
];

const defaultBadges = [
  { icon: 'Truck', title: 'Dostawa w calej Polsce', active: true },
  { icon: 'Wrench', title: 'Montaz w cenie', active: true },
  { icon: 'Award', title: 'Certyfikat FSC', active: true },
  { icon: 'Flag', title: 'Made in Poland', active: true },
];

export const BalieFeatures = () => {
  const [features, setFeatures] = useState(defaultFeatures);
  const [options, setOptions] = useState(defaultOptions);
  const [badges, setBadges] = useState(defaultBadges);

  useEffect(() => {
    fetch(`${API}/api/balia/content`).then(r => r.json()).then(data => {
      if (data?.promo_features?.length) setFeatures(data.promo_features);
      if (data?.promo_options?.length) setOptions(data.promo_options);
      if (data?.promo_badges?.length) setBadges(data.promo_badges);
    }).catch(() => {});
  }, []);

  const activeFeatures = features.filter(f => f.active !== false);
  const activeOptions = options.filter(o => o.active !== false);
  const activeBadges = badges.filter(b => b.active !== false);

  if (activeFeatures.length === 0 && activeOptions.length === 0 && activeBadges.length === 0) return null;

  return (
    <section className="relative py-20 bg-[#0F1218]" data-testid="balie-features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Dlaczego <span className="text-[#D4AF37]">WM-Balia?</span>
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            Laczymy tradycyjne rzemioslo z nowoczesnym designem, tworzac produkty najwyzszej jakosci.
          </p>
        </div>

        {activeFeatures.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {activeFeatures.map((f, i) => {
              const Icon = iconMap[f.icon] || ShieldCheck;
              return (
                <div key={i} className="bg-[#1A1E27] border border-white/5 p-6 hover:border-[#D4AF37]/30 transition-colors">
                  <Icon size={28} className="text-[#D4AF37] mb-4" />
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeOptions.length > 0 && (
          <div className="mb-10">
            <h3 className="text-center text-white/60 text-sm font-medium tracking-wider uppercase mb-6">Dostepne opcje dodatkowe</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeOptions.map((o, i) => {
                const Icon = iconMap[o.icon] || Waves;
                return (
                  <div key={i} className="bg-[#1A1E27]/50 border border-white/5 p-4 text-center hover:border-[#D4AF37]/20 transition-colors">
                    <Icon size={24} className="text-[#D4AF37] mx-auto mb-2" />
                    <h4 className="text-white font-medium text-sm mb-1">{o.title}</h4>
                    <p className="text-white/30 text-xs">{o.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeBadges.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activeBadges.map((b, i) => {
              const Icon = iconMap[b.icon] || Flag;
              return (
                <div key={i} className="flex items-center gap-3 bg-[#1A1E27]/50 border border-white/5 px-4 py-3">
                  <Icon size={18} className="text-[#D4AF37] flex-shrink-0" />
                  <span className="text-white/70 text-sm">{b.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
