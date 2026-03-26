import { useState, useEffect } from 'react';
import { ChevronDown, FileDown } from 'lucide-react';
import { BalieCatalogGate } from './BalieCatalogGate';

const API = process.env.REACT_APP_BACKEND_URL;
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1668461363398-1fd41bf2ca79?auto=format&fit=crop&w=1920&q=80";

export const BalieHero = () => {
  const [content, setContent] = useState({
    badge: 'Recznie robione w Polsce',
    headline: 'Luksus w Twoim Ogrodzie',
    subheadline: 'Odkryj recznie robione balie i jacuzzi, ktore zmienia Twoj ogrod w prywatne SPA. Naturalne drewno, najwyzsza jakosc.',
    ctaPrimary: 'Zaprojektuj swoja balie',
    ctaSecondary: 'Zobacz produkty',
    stats: [
      { value: '500+', label: 'Zadowolonych klientow' },
      { value: '2', label: 'Lata gwarancji' },
      { value: '100%', label: 'Eko materialy' }
    ]
  });
  const [catalogAvailable, setCatalogAvailable] = useState(false);
  const [showCatalogGate, setShowCatalogGate] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/balia/content`).then(r => r.json()).then(data => {
      if (data?.hero) {
        setContent(prev => ({
          badge: data.hero.badge || prev.badge,
          headline: data.hero.headline || prev.headline,
          subheadline: data.hero.subheadline || prev.subheadline,
          ctaPrimary: data.hero.cta_primary || prev.ctaPrimary,
          ctaSecondary: data.hero.cta_secondary || prev.ctaSecondary,
          stats: data.hero.stats?.length > 0 ? data.hero.stats : prev.stats,
        }));
      }
    }).catch(() => {});
    fetch(`${API}/api/balia-catalog/info`).then(r => r.json()).then(d => setCatalogAvailable(d?.available)).catch(() => {});
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const words = content.headline.split(' ');
  const mainWords = words.slice(0, -1).join(' ');
  const goldWord = words[words.length - 1];

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center pt-16" data-testid="balie-hero">
        <div className="absolute inset-0">
          <img src={DEFAULT_IMAGE} alt="Balia" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1218]/70 via-[#0F1218]/50 to-[#0F1218]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-20">
          <div className="inline-block bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-1.5 mb-6">
            <span className="text-[#D4AF37] text-xs font-semibold tracking-[0.2em] uppercase">{content.badge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {mainWords}{' '}<span className="text-[#D4AF37]">{goldWord}</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-10">{content.subheadline}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button onClick={() => scrollTo('produkty')} className="px-8 py-4 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors" data-testid="balie-hero-cta">
              {content.ctaPrimary}
            </button>
            <button onClick={() => scrollTo('produkty')} className="px-8 py-4 border border-white/20 text-white font-medium hover:bg-white/5 transition-colors">
              {content.ctaSecondary}
            </button>
          </div>

          {catalogAvailable && (
            <button
              onClick={() => setShowCatalogGate(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors mb-16"
              data-testid="balie-hero-catalog-btn"
            >
              <FileDown size={16} /> Pobierz katalog PDF
            </button>
          )}

          {!catalogAvailable && <div className="mb-16" />}

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {content.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#D4AF37]">{stat.value}</div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => scrollTo('produkty')} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30 hover:text-[#D4AF37] animate-bounce transition-colors">
          <ChevronDown size={32} />
        </button>
      </section>

      {showCatalogGate && <BalieCatalogGate onClose={() => setShowCatalogGate(false)} />}
    </>
  );
};
