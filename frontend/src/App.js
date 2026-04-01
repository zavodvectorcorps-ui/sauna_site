import React, { useEffect, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import { AutoTranslateProvider } from "./context/AutoTranslateContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { SeoHead } from "./components/SeoHead";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Footer } from "./components/Footer";
import { TrackingScripts, useAnalytics } from "./lib/analytics";
import { ABTestProvider } from "./context/ABTestContext";
import { useLocation } from "react-router-dom";

// Critical above-fold components loaded sync: Header, Hero, Footer (shell)
// Everything else is lazy — below-fold sections, full pages, admin

// Below-fold sauna sections
const SocialProof = React.lazy(() => import("./components/SocialProof").then(m => ({ default: m.SocialProof })));
const Models = React.lazy(() => import("./components/Models").then(m => ({ default: m.Models })));
const Calculator = React.lazy(() => import("./components/Calculator").then(m => ({ default: m.Calculator })));
const Gallery = React.lazy(() => import("./components/Gallery").then(m => ({ default: m.Gallery })));
const StockSaunas = React.lazy(() => import("./components/StockSaunas").then(m => ({ default: m.StockSaunas })));
const Reviews = React.lazy(() => import("./components/Reviews").then(m => ({ default: m.Reviews })));
const FAQ = React.lazy(() => import("./components/FAQ").then(m => ({ default: m.FAQ })));
const About = React.lazy(() => import("./components/About").then(m => ({ default: m.About })));
const Contact = React.lazy(() => import("./components/Contact").then(m => ({ default: m.Contact })));
const StickyCTA = React.lazy(() => import("./components/StickyCTA").then(m => ({ default: m.StickyCTA })));
const FloatingContact = React.lazy(() => import("./components/FloatingContact").then(m => ({ default: m.FloatingContact })));
const PromoFeatures = React.lazy(() => import("./components/PromoFeatures").then(m => ({ default: m.PromoFeatures })));
const PromoBanner = React.lazy(() => import("./components/PromoBanner").then(m => ({ default: m.PromoBanner })));
const SpecialOffer = React.lazy(() => import("./components/SpecialOffer").then(m => ({ default: m.SpecialOffer })));
const SaunaInstallment = React.lazy(() => import("./components/SaunaInstallment").then(m => ({ default: m.SaunaInstallment })));
const SaunaAdvantages = React.lazy(() => import("./components/SaunaAdvantages").then(m => ({ default: m.SaunaAdvantages })));
const SaunaVideoReviews = React.lazy(() => import("./components/SaunaVideoReviews").then(m => ({ default: m.SaunaVideoReviews })));
const OrderProcess = React.lazy(() => import("./components/OrderProcess").then(m => ({ default: m.OrderProcess })));
const WhatsAppButton = React.lazy(() => import("./components/WhatsAppButton").then(m => ({ default: m.WhatsAppButton })));
const CookieConsentBanner = React.lazy(() => import("./components/CookieConsentBanner").then(m => ({ default: m.CookieConsentBanner })));

// Full page routes — lazy
const MainLanding = React.lazy(() => import("./pages/MainLanding"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = React.lazy(() => import("./pages/BlogArticlePage"));
const B2BPage = React.lazy(() => import("./pages/B2BPage"));
const BalieLandingPage = React.lazy(() => import("./components/balie/BalieLandingPage").then(m => ({ default: m.BalieLandingPage })));
const BalieConfigurator = React.lazy(() => import("./components/balie/BalieConfigurator").then(m => ({ default: m.BalieConfigurator })));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const PipelineView = React.lazy(() => import("./pages/PipelineView"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const CookiePolicyPage = React.lazy(() => import("./pages/CookiePolicyPage"));

// Minimal skeleton fallback with fixed height to prevent CLS
const SectionSkeleton = ({ height = '400px' }) => (
  <div style={{ minHeight: height, background: '#F9F9F7' }} />
);

const PageSkeleton = () => (
  <div style={{ minHeight: '100vh', background: '#F9F9F7' }} />
);

// Wrap lazy section with Suspense + fixed-height skeleton
const LazySection = ({ children, height = '400px' }) => (
  <Suspense fallback={<SectionSkeleton height={height} />}>
    {children}
  </Suspense>
);

// Auto page view tracker
const PageTracker = () => {
  const location = useLocation();
  const { trackEvent: track } = useAnalytics();
  useEffect(() => {
    track('page_view', { path: location.pathname });
  }, [location.pathname]);
  return null;
};

// Map section keys to lazy components
const sectionComponentMap = {
  hero: null, // Hero is rendered sync, not via lazy map
  models: Models,
  calculator: Calculator,
  gallery: Gallery,
  stock: StockSaunas,
  reviews: Reviews,
  faq: FAQ,
  orderprocess: null, // handled specially
  about: About,
  contact: Contact,
};

const sectionHeights = {
  models: '800px',
  calculator: '600px',
  gallery: '500px',
  stock: '400px',
  reviews: '400px',
  faq: '400px',
  orderprocess: '300px',
  about: '400px',
  contact: '500px',
};

const MainContent = () => {
  const { sectionOrder, sectionVisibility, loading } = useSettings();

  // Apply layout settings AFTER first paint — non-blocking
  useEffect(() => {
    // Use requestIdleCallback to avoid blocking main thread
    const applyLayout = () => {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/layout`)
        .then(res => res.json())
        .then(data => {
          const paddingMap = {
            small: { top: 40, bottom: 40 },
            medium: { top: 60, bottom: 60 },
            large: { top: 80, bottom: 80 },
          };
          const padding = paddingMap[data.section_spacing] || { top: data.section_padding_top || 80, bottom: data.section_padding_bottom || 80 };
          document.documentElement.style.setProperty('--section-padding-top', `${padding.top}px`);
          document.documentElement.style.setProperty('--section-padding-bottom', `${padding.bottom}px`);
        })
        .catch(() => {});
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(applyLayout);
    } else {
      setTimeout(applyLayout, 2000);
    }
  }, []);

  const sections = sectionOrder?.sections || ['hero', 'models', 'calculator', 'gallery', 'stock', 'reviews', 'faq', 'orderprocess', 'about', 'contact'];
  const vis = sectionVisibility?.sauna || {};

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
    <>
      {sections.map((sectionKey) => {
        const visClass = getVisClass(sectionKey);

        // Hero is rendered synchronously (above-fold critical path)
        if (sectionKey === 'hero') {
          return (
            <React.Fragment key="hero">
              <div className={visClass}>
                <Hero />
              </div>
              <LazySection height="200px">
                <div className={getVisClass('specialoffer')}><SpecialOffer /></div>
              </LazySection>
              <LazySection height="100px">
                <div className={getVisClass('socialproof')}><SocialProof /></div>
              </LazySection>
            </React.Fragment>
          );
        }

        // OrderProcess special case
        if (sectionKey === 'orderprocess') {
          return (
            <LazySection key="orderprocess" height="300px">
              <div className={visClass}><OrderProcess type="sauna" /></div>
            </LazySection>
          );
        }

        const Component = sectionComponentMap[sectionKey];
        if (!Component) return null;

        return (
          <React.Fragment key={sectionKey}>
            <LazySection height={sectionHeights[sectionKey] || '400px'}>
              <div className={visClass}><Component /></div>
            </LazySection>
            {sectionKey === 'models' && (
              <LazySection height="800px">
                <div className={getVisClass('promofeatures')}><PromoFeatures /></div>
                <div className={getVisClass('advantages')}><SaunaAdvantages /></div>
                <div className={getVisClass('videoreviews')}><SaunaVideoReviews /></div>
                <div className={getVisClass('promobanner')}><PromoBanner /></div>
                <div className={getVisClass('installment')}><SaunaInstallment /></div>
              </LazySection>
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
    <main>
      <MainContent />
    </main>
    <Footer />
    <Suspense fallback={null}><StickyCTA /></Suspense>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AutoTranslateProvider>
        <SettingsProvider>
          <ABTestProvider>
          <BrowserRouter>
            <PageTracker />
            <TrackingScripts />
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<PageSkeleton />}><MainLanding /></Suspense>
              } />
              <Route path="/sauny" element={<SaunaHomePage />} />
              <Route path="/balie" element={
                <Suspense fallback={<PageSkeleton />}><BalieLandingPage /></Suspense>
              } />
              <Route path="/balie/konfigurator" element={
                <Suspense fallback={<PageSkeleton />}><BalieConfigurator /></Suspense>
              } />
              <Route path="/blog" element={
                <Suspense fallback={<PageSkeleton />}><BlogPage /></Suspense>
              } />
              <Route path="/blog/:slug" element={
                <Suspense fallback={<PageSkeleton />}><BlogArticlePage /></Suspense>
              } />
              <Route path="/b2b" element={
                <Suspense fallback={<PageSkeleton />}><B2BPage /></Suspense>
              } />
              <Route path="/privacy" element={
                <Suspense fallback={<PageSkeleton />}><PrivacyPolicyPage /></Suspense>
              } />
              <Route path="/cookies" element={
                <Suspense fallback={<PageSkeleton />}><CookiePolicyPage /></Suspense>
              } />
              <Route path="/admin" element={
                <Suspense fallback={<PageSkeleton />}><AdminPanel /></Suspense>
              } />
              <Route path="/admin/pipeline" element={
                <Suspense fallback={<PageSkeleton />}><PipelineView /></Suspense>
              } />
            </Routes>
            <Suspense fallback={null}><FloatingContact /></Suspense>
            <Suspense fallback={null}><CookieConsentBanner /></Suspense>
          </BrowserRouter>
          </ABTestProvider>
        </SettingsProvider>
        </AutoTranslateProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
