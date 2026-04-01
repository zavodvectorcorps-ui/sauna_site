import React, { useEffect, Suspense } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';
import { useSettings } from '../context/SettingsContext';

// Below-fold sauna sections — all lazy
const SocialProof = React.lazy(() => import('../components/SocialProof').then(m => ({ default: m.SocialProof })));
const Models = React.lazy(() => import('../components/Models').then(m => ({ default: m.Models })));
const Calculator = React.lazy(() => import('../components/Calculator').then(m => ({ default: m.Calculator })));
const Gallery = React.lazy(() => import('../components/Gallery').then(m => ({ default: m.Gallery })));
const StockSaunas = React.lazy(() => import('../components/StockSaunas').then(m => ({ default: m.StockSaunas })));
const Reviews = React.lazy(() => import('../components/Reviews').then(m => ({ default: m.Reviews })));
const FAQ = React.lazy(() => import('../components/FAQ').then(m => ({ default: m.FAQ })));
const About = React.lazy(() => import('../components/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('../components/Contact').then(m => ({ default: m.Contact })));
const StickyCTA = React.lazy(() => import('../components/StickyCTA').then(m => ({ default: m.StickyCTA })));
const PromoFeatures = React.lazy(() => import('../components/PromoFeatures').then(m => ({ default: m.PromoFeatures })));
const PromoBanner = React.lazy(() => import('../components/PromoBanner').then(m => ({ default: m.PromoBanner })));
const SpecialOffer = React.lazy(() => import('../components/SpecialOffer').then(m => ({ default: m.SpecialOffer })));
const SaunaInstallment = React.lazy(() => import('../components/SaunaInstallment').then(m => ({ default: m.SaunaInstallment })));
const SaunaAdvantages = React.lazy(() => import('../components/SaunaAdvantages').then(m => ({ default: m.SaunaAdvantages })));
const SaunaVideoReviews = React.lazy(() => import('../components/SaunaVideoReviews').then(m => ({ default: m.SaunaVideoReviews })));
const OrderProcess = React.lazy(() => import('../components/OrderProcess').then(m => ({ default: m.OrderProcess })));
const WhatsAppButton = React.lazy(() => import('../components/WhatsAppButton').then(m => ({ default: m.WhatsAppButton })));

// Fixed-height skeleton to prevent CLS during lazy load
const Skel = ({ h = '400px' }) => <div style={{ minHeight: h, background: '#F9F9F7' }} />;
const Lazy = ({ children, h = '400px' }) => <Suspense fallback={<Skel h={h} />}>{children}</Suspense>;

// Section map + skeleton heights
const sectionMap = { models: Models, calculator: Calculator, gallery: Gallery, stock: StockSaunas, reviews: Reviews, faq: FAQ, about: About, contact: Contact };
const sectionH = { models: '800px', calculator: '600px', gallery: '500px', stock: '400px', reviews: '400px', faq: '400px', orderprocess: '300px', about: '400px', contact: '500px' };

const MainContent = () => {
  const { sectionOrder, sectionVisibility } = useSettings();

  // Layout settings: apply only to NON-first-screen sections via requestIdleCallback
  // NEVER changes first-screen height. Only applies if values differ from CSS defaults (80px).
  useEffect(() => {
    const apply = () => {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/layout`)
        .then(r => r.json())
        .then(data => {
          const pm = { small: 40, medium: 60, large: 80 };
          const t = pm[data.section_spacing] || data.section_padding_top || 80;
          const b = pm[data.section_spacing] || data.section_padding_bottom || 80;
          // Only mutate DOM if values actually differ from defaults to avoid CLS
          if (t !== 80) document.documentElement.style.setProperty('--section-padding-top', `${t}px`);
          if (b !== 80) document.documentElement.style.setProperty('--section-padding-bottom', `${b}px`);
        })
        .catch(() => {});
    };
    if ('requestIdleCallback' in window) requestIdleCallback(apply);
    else setTimeout(apply, 3000);
  }, []);

  const sections = sectionOrder?.sections || ['hero', 'models', 'calculator', 'gallery', 'stock', 'reviews', 'faq', 'orderprocess', 'about', 'contact'];
  const vis = sectionVisibility?.sauna || {};
  const vc = (key) => {
    const v = vis[key];
    if (!v) return '';
    const d = v.desktop !== false, m = v.mobile !== false;
    if (!d && !m) return 'hidden';
    if (!d && m) return 'block md:hidden';
    if (d && !m) return 'hidden md:block';
    return '';
  };

  return (
    <>
      {sections.map((k) => {
        if (k === 'hero') return (
          <React.Fragment key="hero">
            <div className={vc('hero')}><Hero /></div>
            <Lazy h="200px"><div className={vc('specialoffer')}><SpecialOffer /></div></Lazy>
            <Lazy h="100px"><div className={vc('socialproof')}><SocialProof /></div></Lazy>
          </React.Fragment>
        );
        if (k === 'orderprocess') return <Lazy key="op" h="300px"><div className={vc(k)}><OrderProcess type="sauna" /></div></Lazy>;
        const C = sectionMap[k];
        if (!C) return null;
        return (
          <React.Fragment key={k}>
            <Lazy h={sectionH[k] || '400px'}><div className={vc(k)}><C /></div></Lazy>
            {k === 'models' && (
              <Lazy h="800px">
                <div className={vc('promofeatures')}><PromoFeatures /></div>
                <div className={vc('advantages')}><SaunaAdvantages /></div>
                <div className={vc('videoreviews')}><SaunaVideoReviews /></div>
                <div className={vc('promobanner')}><PromoBanner /></div>
                <div className={vc('installment')}><SaunaInstallment /></div>
              </Lazy>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const SaunaHomePage = () => (
  <div className="min-h-screen bg-[#F9F9F7]">
    <SeoHead />
    <Header />
    <main><MainContent /></main>
    <Footer />
    <Suspense fallback={null}><StickyCTA /></Suspense>
  </div>
);

export default SaunaHomePage;
