import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import { AutoTranslateProvider } from "./context/AutoTranslateContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import { SeoHead } from "./components/SeoHead";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SocialProof } from "./components/SocialProof";
import { Models } from "./components/Models";
import { Calculator } from "./components/Calculator";
import { Gallery } from "./components/Gallery";
import { StockSaunas } from "./components/StockSaunas";
import { Reviews } from "./components/Reviews";
import { FAQ } from "./components/FAQ";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { StickyCTA } from "./components/StickyCTA";
import { FloatingContact } from "./components/FloatingContact";
import { PromoFeatures } from "./components/PromoFeatures";
import { PromoBanner } from "./components/PromoBanner";
import { SpecialOffer } from "./components/SpecialOffer";
import { SaunaInstallment } from "./components/SaunaInstallment";
import { SaunaAdvantages } from "./components/SaunaAdvantages";
import { SaunaVideoReviews } from "./components/SaunaVideoReviews";
import { OrderProcess } from "./components/OrderProcess";
import { WhatsAppButton } from "./components/WhatsAppButton";
import AdminPanel from "./pages/AdminPanel";
import PipelineView from "./pages/PipelineView";
import MainLanding from "./pages/MainLanding";
import B2BPage from "./pages/B2BPage";
import { BalieLandingPage } from "./components/balie/BalieLandingPage";
import { BalieConfigurator } from "./components/balie/BalieConfigurator";
import { TrackingScripts, useAnalytics } from "./lib/analytics";
import { useLocation } from "react-router-dom";
import { CookieConsentBanner } from "./components/CookieConsentBanner";

const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const CookiePolicyPage = React.lazy(() => import("./pages/CookiePolicyPage"));

const OrderProcessSauna = () => <OrderProcess type="sauna" />;

// Auto page view tracker
const PageTracker = () => {
  const location = useLocation();
  const { trackEvent: track } = useAnalytics();
  useEffect(() => {
    track('page_view', { path: location.pathname });
  }, [location.pathname]);
  return null;
};

const sectionComponents = {
  hero: Hero,
  models: Models,
  calculator: Calculator,
  gallery: Gallery,
  stock: StockSaunas,
  reviews: Reviews,
  faq: FAQ,
  orderprocess: OrderProcessSauna,
  about: About,
  contact: Contact,
};

const MainContent = () => {
  const { sectionOrder, sectionVisibility, loading } = useSettings();
  const [layoutSettings, setLayoutSettings] = React.useState(null);

  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/layout`)
      .then(res => res.json())
      .then(data => {
        setLayoutSettings(data);
        const paddingMap = {
          small: { top: 40, bottom: 40 },
          medium: { top: 60, bottom: 60 },
          large: { top: 80, bottom: 80 },
        };
        const padding = paddingMap[data.section_spacing] || { top: data.section_padding_top || 80, bottom: data.section_padding_bottom || 80 };
        document.documentElement.style.setProperty('--section-padding-top', `${padding.top}px`);
        document.documentElement.style.setProperty('--section-padding-bottom', `${padding.bottom}px`);
      })
      .catch(err => console.error('Error loading layout settings:', err));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        const Component = sectionComponents[sectionKey];
        if (!Component) return null;
        const visClass = getVisClass(sectionKey);
        return (
          <React.Fragment key={sectionKey}>
            <div className={visClass}>
              <Component />
            </div>
            {sectionKey === 'hero' && <>
              <div className={getVisClass('specialoffer')}><SpecialOffer /></div>
              <div className={getVisClass('socialproof')}><SocialProof /></div>
            </>}
            {sectionKey === 'models' && <>
              <div className={getVisClass('promofeatures')}><PromoFeatures /></div>
              <div className={getVisClass('advantages')}><SaunaAdvantages /></div>
              <div className={getVisClass('videoreviews')}><SaunaVideoReviews /></div>
              <div className={getVisClass('promobanner')}><PromoBanner /></div>
              <div className={getVisClass('installment')}><SaunaInstallment /></div>
            </>}
          </React.Fragment>
        );
      })}
    </>
  );
};

const SaunaHomePage = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <SeoHead />
      <Header />
      <main>
        <MainContent />
      </main>
      <Footer />
      <StickyCTA />
      <FloatingContact />
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AutoTranslateProvider>
        <SettingsProvider>
          <BrowserRouter>
            <PageTracker />
            <TrackingScripts />
            <Routes>
              {/* Main landing - choose Sauny or Balie */}
              <Route path="/" element={<MainLanding />} />

              {/* Sauna pages */}
              <Route path="/sauny" element={<SaunaHomePage />} />

              {/* Balie pages */}
              <Route path="/balie" element={<BalieLandingPage />} />
              <Route path="/balie/konfigurator" element={<BalieConfigurator />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogArticlePage />} />
              <Route path="/b2b" element={<B2BPage />} />

              {/* Legal pages */}
              <Route path="/privacy" element={
                <React.Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
                  <PrivacyPolicyPage />
                </React.Suspense>
              } />
              <Route path="/cookies" element={
                <React.Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
                  <CookiePolicyPage />
                </React.Suspense>
              } />

              {/* Admin */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/pipeline" element={<PipelineView />} />
            </Routes>
            <WhatsAppButton />
            <CookieConsentBanner />
          </BrowserRouter>
        </SettingsProvider>
        </AutoTranslateProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
