import { useState } from 'react';
import { Palette, ChevronDown } from 'lucide-react';

const fiberglassColors = [
  { name: 'Black+Red', gradient: 'linear-gradient(135deg, #1a1a1a 50%, #8B0000 50%)' },
  { name: 'Multi', gradient: 'linear-gradient(135deg, #2d1b4e, #1a3a5c, #1a4a3a)' },
  { name: 'Galaxy', gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #2d1b4e 100%)' },
  { name: 'Grey Pearl', gradient: 'linear-gradient(135deg, #8a8a8a, #b0b0b0, #9a9a9a)' },
  { name: 'White Pearl', gradient: 'linear-gradient(135deg, #e8e8e8, #f5f5f5, #dcdcdc)' },
  { name: 'Blue Pearl', gradient: 'linear-gradient(135deg, #1a3a6c, #2a5a9c, #1a4a8c)' },
  { name: 'Dark Sky', gradient: 'linear-gradient(135deg, #0d1b2a, #1b2838, #0a1520)' },
  { name: 'Cream+Silver', gradient: 'linear-gradient(135deg, #d4c5a0 50%, #c0c0c0 50%)' },
  { name: 'Emerald', gradient: 'linear-gradient(135deg, #004d40, #00695c, #00796b)' },
  { name: 'Black+Gold', gradient: 'linear-gradient(135deg, #1a1a1a 50%, #D4AF37 50%)' },
  { name: 'Black+Pink', gradient: 'linear-gradient(135deg, #1a1a1a 50%, #c2185b 50%)' },
  { name: 'Black+Silver', gradient: 'linear-gradient(135deg, #1a1a1a 50%, #b0b0b0 50%)' },
  { name: 'Black+Gold+Pink', gradient: 'linear-gradient(135deg, #1a1a1a 33%, #D4AF37 33%, #D4AF37 66%, #c2185b 66%)' },
  { name: 'Snowflake', gradient: 'linear-gradient(135deg, #e8e8e8, #f0f0f0, #dde4e8)' },
];

const acrylicColors = [
  { name: 'Green marble', color: '#2d5a3a', pattern: true },
  { name: 'Brown marble', color: '#5a3a2d', pattern: true },
  { name: 'Gray', color: '#6a6a6a', pattern: false },
  { name: 'Blue marble', color: '#2d3a5a', pattern: true },
  { name: 'Coffee marble', color: '#3d2a1a', pattern: true },
  { name: 'Black marble', color: '#1a1a2a', pattern: true },
  { name: 'White marble', color: '#d0d0d0', pattern: true },
  { name: 'White', color: '#e8e8e8', pattern: false },
];

const spruceColors = [
  { code: 'E0013', color: '#d4b896' },
  { code: 'E0021', color: '#c8a882' },
  { code: 'E1000', color: '#f0e6d0' },
  { code: 'E2000', color: '#e8d8b8' },
  { code: 'E5000', color: '#c0a878' },
  { code: 'E6015', color: '#8a7050' },
  { code: 'E6710', color: '#6a5030' },
  { code: 'E6720', color: '#5a4020' },
  { code: 'E6730', color: '#4a3018' },
  { code: 'E7000', color: '#3a2810' },
  { code: 'E7712', color: '#2a1808' },
  { code: 'E BLACK', color: '#1a1a1a' },
  { code: 'EDS', color: '#8a8a7a' },
];

const thermoColors = [
  { code: 'TERMO0012', color: '#b89878' },
  { code: 'TERMO0013', color: '#a88868' },
  { code: 'TERMO0021', color: '#987858' },
  { code: 'TERMO1000', color: '#d8c8a8' },
  { code: 'TERMO2000', color: '#c8b898' },
  { code: 'TERMO5000', color: '#a89070' },
  { code: 'TERMO6015', color: '#786040' },
  { code: 'TERMO6710', color: '#685030' },
  { code: 'TERMO6720', color: '#584020' },
  { code: 'TERMO6730', color: '#483018' },
  { code: 'TERMO7000', color: '#382810' },
  { code: 'TERMO7712', color: '#281808' },
  { code: 'TERMO ANTRACIT', color: '#3a3a3a' },
  { code: 'TERMO BLACK', color: '#1a1a1a' },
  { code: 'TERMO DS', color: '#6a6a5a' },
];

const categories = [
  {
    id: 'fiberglass',
    title: 'Kolory Fiberglass',
    subtitle: 'Wanna z tworzywa szklano-poliestrowego: trwała, ekologiczna, gładka powierzchnia łatwa w czyszczeniu',
  },
  {
    id: 'acrylic',
    title: 'Kolory Akrylowe',
    subtitle: 'Najwyższej jakości tworzywo z Włoch i Austrii, wzmocnione włóknem szklanym, odporne na UV',
  },
  {
    id: 'spruce',
    title: 'Drewno Świerkowe',
    subtitle: 'Naturalne drewno świerkowe z szeroką gamą kolorów bejcy i olejów ochronnych',
  },
  {
    id: 'thermo',
    title: 'Drewno Termiczne',
    subtitle: 'Modyfikowane termicznie drewno o zwiększonej trwałości i odporności na warunki atmosferyczne',
  },
  {
    id: 'wpc',
    title: 'Kompozyt WPC',
    subtitle: 'Kompozyt drewno-plastik: nowoczesny wygląd, nie wymaga konserwacji, odporny na wilgoć',
  },
];

export const BalieColors = () => {
  const [activeCategory, setActiveCategory] = useState('fiberglass');

  const renderSwatches = () => {
    switch (activeCategory) {
      case 'fiberglass':
        return (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {fiberglassColors.map((c) => (
              <div key={c.name} className="group text-center">
                <div className="aspect-square border-2 border-white/10 group-hover:border-[#D4AF37]/50 transition-colors overflow-hidden" style={{ background: c.gradient }} />
                <p className="text-white/50 text-[10px] mt-1.5 group-hover:text-white/80 transition-colors">{c.name}</p>
              </div>
            ))}
          </div>
        );
      case 'acrylic':
        return (
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {acrylicColors.map((c) => (
              <div key={c.name} className="group text-center">
                <div className="aspect-square border-2 border-white/10 group-hover:border-[#D4AF37]/50 transition-colors" style={{ background: c.pattern ? `radial-gradient(circle at 30% 40%, ${c.color}aa, ${c.color})` : c.color }} />
                <p className="text-white/50 text-[10px] mt-1.5 group-hover:text-white/80 transition-colors">{c.name}</p>
              </div>
            ))}
          </div>
        );
      case 'spruce':
        return (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
            {spruceColors.map((c) => (
              <div key={c.code} className="group text-center">
                <div className="aspect-square border-2 border-white/10 group-hover:border-[#D4AF37]/50 transition-colors" style={{ background: c.color }} />
                <p className="text-white/50 text-[10px] mt-1.5 group-hover:text-white/80 transition-colors">{c.code}</p>
              </div>
            ))}
          </div>
        );
      case 'thermo':
        return (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
            {thermoColors.map((c) => (
              <div key={c.code} className="group text-center">
                <div className="aspect-square border-2 border-white/10 group-hover:border-[#D4AF37]/50 transition-colors" style={{ background: c.color }} />
                <p className="text-white/50 text-[10px] mt-1.5 group-hover:text-white/80 transition-colors">{c.code}</p>
              </div>
            ))}
          </div>
        );
      case 'wpc':
        return (
          <div className="flex gap-4">
            <div className="group text-center">
              <div className="w-20 h-20 border-2 border-white/10 group-hover:border-[#D4AF37]/50 transition-colors" style={{ background: '#1a1a1a' }} />
              <p className="text-white/50 text-[10px] mt-1.5">WPC Black</p>
            </div>
            <div className="flex-1 p-4 bg-[#1A1E27]/50 border border-white/5">
              <p className="text-white/50 text-sm leading-relaxed">
                Panele WPC (Wood-Plastic Composite) to nowoczesna alternatywa dla drewna naturalnego. Nie wymagają malowania ani olejowania, są odporne na wilgoć, pleśń i promieniowanie UV. Idealny wybór dla osób ceniących bezobsługowość.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <section id="kolory" className="py-20 bg-[#0A0D12]" data-testid="balie-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-3">
            <Palette size={16} />
            Personalizacja
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Kolory i <span className="text-[#D4AF37]">Materiały</span>
          </h2>
          <p className="text-white/40 text-sm max-w-2xl mx-auto">
            Każda balia jest wykonywana na zamówienie. Wybierz kolor wanny, rodzaj drewna zewnętrznego i wykończenie, które idealnie pasuje do Twojego ogrodu.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              data-testid={`balie-color-tab-${cat.id}`}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#D4AF37] text-[#0F1218]'
                  : 'bg-[#1A1E27] text-white/50 hover:text-white border border-white/5 hover:border-[#D4AF37]/30'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Description */}
        {currentCategory && (
          <p className="text-center text-white/40 text-sm mb-6 max-w-xl mx-auto">{currentCategory.subtitle}</p>
        )}

        {/* Swatches */}
        <div className="bg-[#1A1E27]/50 border border-white/5 p-6 sm:p-8">
          {renderSwatches()}
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          * Kolory na monitorze mogą różnić się od rzeczywistych. Skontaktuj się z nami, aby otrzymać próbki materiałów.
        </p>
      </div>
    </section>
  );
};
