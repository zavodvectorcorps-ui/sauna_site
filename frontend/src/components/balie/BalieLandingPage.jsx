import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Phone, ChevronDown } from 'lucide-react';
import { BalieHero } from './BalieHero';
import { BalieProducts } from './BalieProducts';
import { BalieFeatures } from './BalieFeatures';
import { BalieTestimonials } from './BalieTestimonials';
import { BalieContact } from './BalieContact';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieLandingPage = () => {
  const navigate = useNavigate();

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
            <a href="#balie-konfigurator" className="text-white/60 hover:text-[#D4AF37] transition-colors">Konfigurator</a>
            <a href="#opinie" className="text-white/60 hover:text-[#D4AF37] transition-colors">Opinie</a>
            <a href="#kontakt-balie" className="text-white/60 hover:text-[#D4AF37] transition-colors">Kontakt</a>
          </div>
          <a href="tel:+48123456789" className="flex items-center gap-2 text-[#D4AF37] text-sm font-medium">
            <Phone size={16} />
            <span className="hidden sm:inline">+48 123 456 789</span>
          </a>
        </div>
      </nav>

      {/* Content */}
      <BalieHero />
      <BalieFeatures />
      <BalieProducts />
      <BalieTestimonials />
      <BalieContact />

      {/* Footer */}
      <footer className="bg-[#0A0D12] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplets size={20} className="text-[#D4AF37]" />
            <span className="text-white font-bold tracking-wider">WM-Balia</span>
          </div>
          <p className="text-white/30 text-sm">© 2025 WM-Balia. Ręcznie robione balie i jacuzzi premium.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-[#D4AF37] text-sm hover:underline">
            Powrót na stronę główną
          </button>
        </div>
      </footer>
    </div>
  );
};
