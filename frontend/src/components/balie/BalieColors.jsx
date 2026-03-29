import { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

// Fallback color data (CSS gradients) used when no photos uploaded
const fallbackSwatches = {
  fiberglass: [
    { name: 'Black+Red', gradient: 'linear-gradient(135deg, #1a1a1a 50%, #8B0000 50%)' },
    { name: 'Galaxy', gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #2d1b4e 100%)' },
    { name: 'Grey Pearl', gradient: 'linear-gradient(135deg, #8a8a8a, #b0b0b0, #9a9a9a)' },
    { name: 'White Pearl', gradient: 'linear-gradient(135deg, #e8e8e8, #f5f5f5, #dcdcdc)' },
    { name: 'Blue Pearl', gradient: 'linear-gradient(135deg, #1a3a6c, #2a5a9c, #1a4a8c)' },
    { name: 'Emerald', gradient: 'linear-gradient(135deg, #004d40, #00695c, #00796b)' },
    { name: 'Black+Gold', gradient: 'linear-gradient(135deg, #1a1a1a 50%, #D4AF37 50%)' },
    { name: 'Black+Silver', gradient: 'linear-gradient(135deg, #1a1a1a 50%, #b0b0b0 50%)' },
  ],
  acrylic: [
    { name: 'Green marble', gradient: 'radial-gradient(circle at 30% 40%, #2d5a3aaa, #2d5a3a)' },
    { name: 'Brown marble', gradient: 'radial-gradient(circle at 30% 40%, #5a3a2daa, #5a3a2d)' },
    { name: 'Blue marble', gradient: 'radial-gradient(circle at 30% 40%, #2d3a5aaa, #2d3a5a)' },
    { name: 'Coffee marble', gradient: 'radial-gradient(circle at 30% 40%, #3d2a1aaa, #3d2a1a)' },
    { name: 'Black marble', gradient: 'radial-gradient(circle at 30% 40%, #1a1a2aaa, #1a1a2a)' },
    { name: 'White marble', gradient: 'radial-gradient(circle at 30% 40%, #d0d0d0aa, #d0d0d0)' },
    { name: 'White', gradient: '#e8e8e8' },
  ],
  spruce: [
    { name: 'E0013', gradient: '#d4b896' }, { name: 'E0021', gradient: '#c8a882' },
    { name: 'E1000', gradient: '#f0e6d0' }, { name: 'E5000', gradient: '#c0a878' },
    { name: 'E6015', gradient: '#8a7050' }, { name: 'E6710', gradient: '#6a5030' },
    { name: 'E6730', gradient: '#4a3018' }, { name: 'E7000', gradient: '#3a2810' },
    { name: 'E BLACK', gradient: '#1a1a1a' },
  ],
  thermo: [
    { name: 'TERMO0012', gradient: '#b89878' }, { name: 'TERMO0013', gradient: '#a88868' },
    { name: 'TERMO1000', gradient: '#d8c8a8' }, { name: 'TERMO5000', gradient: '#a89070' },
    { name: 'TERMO6015', gradient: '#786040' }, { name: 'TERMO6710', gradient: '#685030' },
    { name: 'TERMO6730', gradient: '#483018' }, { name: 'TERMO7000', gradient: '#382810' },
    { name: 'TERMO BLACK', gradient: '#1a1a1a' }, { name: 'TERMO DS', gradient: '#6a6a5a' },
  ],
  wpc: [
    { name: 'WPC Black', gradient: '#1a1a1a' },
  ],
};

const categories = [
  { id: 'fiberglass', title: 'Kolory Fiberglass', subtitle: 'Wanna z tworzywa szklano-poliestrowego: trwala, ekologiczna, gladka powierzchnia latwa w czyszczeniu' },
  { id: 'acrylic', title: 'Kolory Akrylowe', subtitle: 'Najwyższej jakości tworzywo z Włoch i Austrii, wzmocnione włóknem szklanym, odporne na UV' },
  { id: 'spruce', title: 'Drewno Swierkowe', subtitle: 'Naturalne drewno swierkowe z szeroka gama kolorow bejcy i olejow ochronnych' },
  { id: 'thermo', title: 'Drewno Termiczne', subtitle: 'Modyfikowane termicznie drewno o zwiekszonej trwalosci i odpornosci na warunki atmosferyczne' },
  { id: 'wpc', title: 'Kompozyt WPC', subtitle: 'Kompozyt drewno-plastik: nowoczesny wygląd, nie wymaga konserwacji, odporny na wilgoć' },
];

export const BalieColors = () => {
  const [activeCategory, setActiveCategory] = useState('fiberglass');
  const [apiColors, setApiColors] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/balia/colors`).then(r => r.json()).then(setApiColors).catch(() => {});
  }, []);

  const getSwatches = (catId) => {
    const fromApi = apiColors.filter(c => c.category === catId && c.image);
    if (fromApi.length > 0) return { type: 'api', items: fromApi };
    return { type: 'fallback', items: fallbackSwatches[catId] || [] };
  };

  const currentCategory = categories.find(c => c.id === activeCategory);
  const swatches = getSwatches(activeCategory);

  return (
    <section id="kolory" className="py-20 bg-[#0A0D12]" data-testid="balie-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-3">
            <Palette size={16} />
            Personalizacja
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Kolory i <span className="text-[#D4AF37]">Materialy</span>
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

        {currentCategory && (
          <p className="text-center text-white/40 text-sm mb-6 max-w-xl mx-auto">{currentCategory.subtitle}</p>
        )}

        {/* Swatches */}
        <div className="bg-[#1A1E27]/50 border border-white/5 p-6 sm:p-8">
          {swatches.type === 'api' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {swatches.items.map((c) => (
                <div key={c.id} className="group text-center">
                  <div className="aspect-square border-2 border-white/10 group-hover:border-[#D4AF37]/50 transition-colors overflow-hidden">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="text-white/50 text-[10px] mt-1.5 group-hover:text-white/80 transition-colors">{c.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {swatches.items.map((c) => (
                <div key={c.name} className="group text-center">
                  <div className="aspect-square border-2 border-white/10 group-hover:border-[#D4AF37]/50 transition-colors" style={{ background: c.gradient }} />
                  <p className="text-white/50 text-[10px] mt-1.5 group-hover:text-white/80 transition-colors">{c.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          * Kolory na monitorze mogą różnić się od rzeczywistych. Skontaktuj się z nami, aby otrzymać próbki materiałów.
        </p>
      </div>
    </section>
  );
};
