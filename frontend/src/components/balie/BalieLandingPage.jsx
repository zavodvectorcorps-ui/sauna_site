import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Phone, ArrowLeft } from 'lucide-react';
import { BalieHero } from './BalieHero';
import { BalieProducts } from './BalieProducts';
import { BalieFeatures } from './BalieFeatures';
import { BalieColors } from './BalieColors';
import { BalieOptionsDetail } from './BalieOptionsDetail';
import { BalieAbout } from './BalieAbout';
import { BalieGallery } from './BalieGallery';
import { BalieConfiguratorCTA } from './BalieConfiguratorCTA';
import { BalieTestimonials } from './BalieTestimonials';
import { BalieContact } from './BalieContact';
import { BalieInstallment } from './BalieInstallment';
import { BalieSchematic } from './BalieSchematic';
import { BalieStoveScheme } from './BalieStoveScheme';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieLandingPage = () => {
  const navigate = useNavigate();
  const [promoBlocks, setPromoBlocks] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/balia/content`).then(r => r.json()).then(data => {
      setPromoBlocks(data?.promo_blocks || null);
    }).catch(() => {});
  }, []);

  const isEnabled = (blockId) => promoBlocks?.[blockId]?.enabled !== false;

  return (
    <div className="min-h-screen bg-[#0F1218]" data-testid="balie-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1218]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors" data-testid="balie-back-home">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Droplets size={20} className="text-[#D4AF37]" />
              <span className="text-white font-bold tracking-wider">WM-Balia</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#produkty" className="text-white/60 hover:text-[#D4AF37] transition-colors">Produkty</a>
            <a href="#kolory" className="text-white/60 hover:text-[#D4AF37] transition-colors">Kolory</a>
            <a href="#opcje" className="text-white/60 hover:text-[#D4AF37] transition-colors">Opcje</a>
            <a href="#budowa" className="text-white/60 hover:text-[#D4AF37] transition-colors">Budowa</a>
            <a href="#balie-konfigurator" className="text-white/60 hover:text-[#D4AF37] transition-colors">Konfigurator</a>
            <a href="#opinie" className="text-white/60 hover:text-[#D4AF37] transition-colors">Opinie</a>
            <a href="#kontakt-balie" className="text-white/60 hover:text-[#D4AF37] transition-colors">Kontakt</a>
          </div>
          <a href="tel:+48515995190" className="flex items-center gap-2 text-[#D4AF37] text-sm font-medium">
            <Phone size={16} />
            <span className="hidden sm:inline">+48 515 995 190</span>
          </a>
        </div>
      </nav>

      {/* Sections */}
      <BalieHero />
      {isEnabled('features') && <BalieFeatures />}
      <BalieProducts />
      {isEnabled('installment') && <BalieInstallment />}
      <BalieColors />
      <BalieOptionsDetail />
      {isEnabled('schematic') && <BalieSchematic />}
      {isEnabled('stove') && <BalieStoveScheme />}
      {isEnabled('about') && <BalieAbout />}
      <BalieGallery />
      <BalieConfiguratorCTA />
      <BalieTestimonials />
      <BalieContact />

      {/* Footer */}
      <footer className="bg-[#0A0D12] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Droplets size={20} className="text-[#D4AF37]" />
                <span className="text-white font-bold tracking-wider">WM-Balia</span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed">Ręcznie robione balie i jacuzzi premium z naturalnego drewna. Polski producent z Warszawy.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Kontakt</h4>
              <div className="space-y-2 text-white/40 text-sm">
                <p>ul. Boryny 3, Warszawa</p>
                <p>+48 515 995 190</p>
                <p>kontakt@wm-balia.pl</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Menu</h4>
              <div className="space-y-2 text-sm">
                <a href="#produkty" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Produkty</a>
                <a href="#kolory" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Kolory i materiały</a>
                <a href="#opcje" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Opcje</a>
                <a href="#balie-konfigurator" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Konfigurator</a>
                <a href="#opinie" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Opinie</a>
                <a href="#kontakt-balie" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Kontakt</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">© 2025 WM-Balia. Wszystkie prawa zastrzeżone.</p>
            <button onClick={() => navigate('/')} className="text-[#D4AF37] text-xs hover:underline">Powrót na stronę główną WM Group</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
