import React, { Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import { AutoTranslateProvider } from "./context/AutoTranslateContext";
import { SettingsProvider } from "./context/SettingsContext";

// ALL pages lazy — nothing heavy in the main bundle
const MainLanding = React.lazy(() => import("./pages/MainLanding"));
const SaunaHomePage = React.lazy(() => import("./pages/SaunaHomePage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = React.lazy(() => import("./pages/BlogArticlePage"));
const B2BPage = React.lazy(() => import("./pages/B2BPage"));
const BalieLandingPage = React.lazy(() => import("./components/balie/BalieLandingPage").then(m => ({ default: m.BalieLandingPage })));
const BalieConfigurator = React.lazy(() => import("./components/balie/BalieConfigurator").then(m => ({ default: m.BalieConfigurator })));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const PipelineView = React.lazy(() => import("./pages/PipelineView"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const CookiePolicyPage = React.lazy(() => import("./pages/CookiePolicyPage"));

// Non-critical: analytics, overlays — deferred
const TrackingScripts = React.lazy(() => import("./lib/analytics").then(m => ({ default: m.TrackingScripts })));
const FloatingContact = React.lazy(() => import("./components/FloatingContact").then(m => ({ default: m.FloatingContact })));
const CookieConsentBanner = React.lazy(() => import("./components/CookieConsentBanner").then(m => ({ default: m.CookieConsentBanner })));

// Minimal skeleton — matches MainLanding dark bg
const PageSkel = () => <div style={{ minHeight: '100vh', background: '#0C0C0C' }} />;
const LightSkel = () => <div style={{ minHeight: '100vh', background: '#F9F9F7' }} />;

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AutoTranslateProvider>
          <SettingsProvider>
            <BrowserRouter>
              {/* Analytics deferred — not in critical path */}
              <Suspense fallback={null}><TrackingScripts /></Suspense>
              <Routes>
                <Route path="/" element={<Suspense fallback={<PageSkel />}><MainLanding /></Suspense>} />
                <Route path="/sauny" element={<Suspense fallback={<LightSkel />}><SaunaHomePage /></Suspense>} />
                <Route path="/balie" element={<Suspense fallback={<LightSkel />}><BalieLandingPage /></Suspense>} />
                <Route path="/balie/konfigurator" element={<Suspense fallback={<LightSkel />}><BalieConfigurator /></Suspense>} />
                <Route path="/blog" element={<Suspense fallback={<LightSkel />}><BlogPage /></Suspense>} />
                <Route path="/blog/:slug" element={<Suspense fallback={<LightSkel />}><BlogArticlePage /></Suspense>} />
                <Route path="/b2b" element={<Suspense fallback={<LightSkel />}><B2BPage /></Suspense>} />
                <Route path="/privacy" element={<Suspense fallback={<LightSkel />}><PrivacyPolicyPage /></Suspense>} />
                <Route path="/cookies" element={<Suspense fallback={<LightSkel />}><CookiePolicyPage /></Suspense>} />
                <Route path="/admin" element={<Suspense fallback={<LightSkel />}><AdminPanel /></Suspense>} />
                <Route path="/admin/pipeline" element={<Suspense fallback={<LightSkel />}><PipelineView /></Suspense>} />
              </Routes>
              <Suspense fallback={null}><FloatingContact /></Suspense>
              <Suspense fallback={null}><CookieConsentBanner /></Suspense>
            </BrowserRouter>
          </SettingsProvider>
        </AutoTranslateProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
