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
  const [layoutSettings, setLayoutSettings] = React.useState(null);

  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/layout`)
      .then(res => res.json())
      .then(data => {
        setLayoutSettings(data);
        // Apply CSS variables for section spacing
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
