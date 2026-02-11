import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Calculator } from "./components/Calculator";
import { Gallery } from "./components/Gallery";
import { StockSaunas } from "./components/StockSaunas";
import { Reviews } from "./components/Reviews";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import AdminPanel from "./pages/AdminPanel";

const sectionComponents = {
  hero: Hero,
  calculator: Calculator,
  gallery: Gallery,
  stock: StockSaunas,
  reviews: Reviews,
  about: About,
  contact: Contact,
};

const MainContent = () => {
  const { sectionOrder, loading } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections = sectionOrder?.sections || ['hero', 'calculator', 'gallery', 'stock', 'reviews', 'about', 'contact'];

  return (
    <>
      {sections.map((sectionKey) => {
        const Component = sectionComponents[sectionKey];
        return Component ? <Component key={sectionKey} /> : null;
      })}
    </>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Header />
      <main>
        <MainContent />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </LanguageProvider>
  );
}

export default App;
