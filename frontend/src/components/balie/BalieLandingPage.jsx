import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Phone, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { BalieHero } from './BalieHero';
import { BalieProducts } from './BalieProducts';
import { BalieFeatures } from './BalieFeatures';
import { BalieColors } from './BalieColors';
import { BalieOptionsDetail } from './BalieOptionsDetail';
import { BalieAbout } from './BalieAbout';
import { BalieGallery } from './BalieGallery';
import { BalieTestimonials } from './BalieTestimonials';
import { BalieContact } from './BalieContact';
import { BalieInstallment } from './BalieInstallment';
import { BalieSchematic } from './BalieSchematic';
import { BalieStoveScheme } from './BalieStoveScheme';

import { BalieFaq } from './BalieFaq';
import { OrderProcess } from '../OrderProcess';
import { useSettings } from '../../context/SettingsContext';
import { BalieProvider, useBalieData } from '../../context/BalieContext';

import { useAutoTranslate } from '../../context/AutoTranslateContext';

const DEFAULT_ORDER = ['hero','features','products','installment','colors','options','schematic','stove','about','gallery','faq','orderprocess','testimonials','contact'];

const sectionComponents = {
  hero: () => <BalieHero />,
  features: ({ enabled }) => enabled ? <BalieFeatures /> : null,
  products: () => <BalieProducts />,
  installment: ({ enabled }) => enabled ? <BalieInstallment /> : null,
  colors: () => <BalieColors />,
  options: () => <BalieOptionsDetail />,
  schematic: ({ enabled }) => enabled ? <BalieSchematic /> : null,
  stove: ({ enabled }) => enabled ? <BalieStoveScheme /> : null,
  about: ({ enabled }) => enabled ? <BalieAbout /> : null,
  gallery: () => <BalieGallery />,
  faq: () => <BalieFaq />,
  orderprocess: () => <OrderProcess type="balia" />,
  testimonials: () => <BalieTestimonials />,
  contact: () => <BalieContact />,
};

export const BalieLandingPage = () => {
  return (
    <BalieProvider>
      <BalieLandingPageInner />
    </BalieProvider>
  );
};

const BalieLandingPageInner = () => {
  const navigate = useNavigate();
  const { sectionVisibility } = useSettings();
  const { tr } = useAutoTranslate();
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_ORDER);
  const { getSetting } = useSettings();
  const contactData = getSetting('balie_contact');
  const baliePhone = contactData?.phone || '+48 515 995 190';
  const { data: balieData } = useBalieData();

  const content = balieData?.content || {};
  const promoBlocks = content?.promo_blocks || null;

  useEffect(() => {
    if (content?.section_order?.length) {
      const order = [...content.section_order];
      if (!order.includes('orderprocess')) {
        const faqIdx = order.indexOf('faq');
        if (faqIdx !== -1) order.splice(faqIdx + 1, 0, 'orderprocess');
        else order.push('orderprocess');
      }
      setSectionOrder(order);
    }
  }, [content]);

  const isEnabled = (blockId) => promoBlocks?.[blockId]?.enabled !== false;

  const vis = sectionVisibility?.balia || {};
  const getVisClass = (key) => {
    const v = vis[key];
    if (!v) return '';
    const desktop = v.desktop !== false;
    const mobile = v.mobile !== false;
    if (!desktop && !mobile) return 'hidden';
    if (!desktop && mobile) return 'block md:hidden';
    if (desktop && !mobile) return 'hidden md:block';
    return '';
  };

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
            <a href="#produkty" className="text-white/60 hover:text-[#D4AF37] transition-colors">{tr('Produkty')}</a>
            <a href="#kolory" className="text-white/60 hover:text-[#D4AF37] transition-colors">{tr('Kolory')}</a>
            <a href="#opcje" className="text-white/60 hover:text-[#D4AF37] transition-colors">{tr('Opcje')}</a>
            <a href="#budowa" className="text-white/60 hover:text-[#D4AF37] transition-colors">{tr('Budowa')}</a>
            <a href="#opinie" className="text-white/60 hover:text-[#D4AF37] transition-colors">{tr('Opinie')}</a>
            <a href="#balie-faq" className="text-white/60 hover:text-[#D4AF37] transition-colors">FAQ</a>
            <a href="#kontakt-balie" className="text-white/60 hover:text-[#D4AF37] transition-colors">{tr('Kontakt')}</a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="dark" />
            <a href={`tel:${baliePhone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-[#D4AF37] text-sm font-medium">
              <Phone size={16} />
              <span className="hidden sm:inline">{baliePhone}</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Dynamic sections */}
      {sectionOrder.map(sectionId => {
        const Render = sectionComponents[sectionId];
        if (!Render) return null;
        const visClass = getVisClass(sectionId);
        return (
          <div key={sectionId} className={visClass}>
            <Render enabled={isEnabled(sectionId)} />
          </div>
        );
      })}

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
              <h4 className="text-white font-semibold text-sm mb-3">{tr('Kontakt')}</h4>
              <div className="space-y-2 text-white/40 text-sm">
                <p>{tr('ul. Boryny 3, Warszawa')}</p>
                <p>{baliePhone}</p>
                <p>kontakt@wm-balia.pl</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Menu</h4>
              <div className="space-y-2 text-sm">
                <a href="#produkty" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Produkty</a>
                <a href="#kolory" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Kolory i materiały</a>
                <a href="#opcje" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Opcje</a>
                <a href="#opinie" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Opinie</a>
                <a href="#kontakt-balie" className="block text-white/40 hover:text-[#D4AF37] transition-colors">Kontakt</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">&copy; 2025 WM-Balia. Wszystkie prawa zastrzeżone.</p>
            <button onClick={() => navigate('/')} className="text-[#D4AF37] text-xs hover:underline">{tr('Powrót na stronę główną WM Group')}</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
