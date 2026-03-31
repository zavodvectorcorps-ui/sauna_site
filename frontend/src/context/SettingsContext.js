import React, { useState, useEffect, createContext, useContext } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [heroSettings, setHeroSettings] = useState(null);
  const [aboutSettings, setAboutSettings] = useState(null);
  const [calculatorConfig, setCalculatorConfig] = useState(null);
  const [sectionOrder, setSectionOrder] = useState(null);
  const [sectionVisibility, setSectionVisibility] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [baliaHero, setBaliaHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      const [siteRes, heroRes, aboutRes, calcRes, sectionsRes, visRes, reviewsRes, baliaRes] = await Promise.all([
        fetch(`${API_URL}/api/settings/site`),
        fetch(`${API_URL}/api/settings/hero`),
        fetch(`${API_URL}/api/settings/about`),
        fetch(`${API_URL}/api/settings/calculator`),
        fetch(`${API_URL}/api/settings/sections`),
        fetch(`${API_URL}/api/settings/visibility`),
        fetch(`${API_URL}/api/reviews`),
        fetch(`${API_URL}/api/balia/content`),
      ]);

      setSiteSettings(await siteRes.json());
      setHeroSettings(await heroRes.json());
      setAboutSettings(await aboutRes.json());
      setCalculatorConfig(await calcRes.json());
      setSectionOrder(await sectionsRes.json());
      setSectionVisibility(await visRes.json());
      setReviews(await reviewsRes.json());
      const baliaData = await baliaRes.json();
      setBaliaHero(baliaData?.hero || null);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
    setLoading(false);
  };

  return (
    <SettingsContext.Provider value={{
      siteSettings,
      heroSettings,
      aboutSettings,
      calculatorConfig,
      sectionOrder,
      sectionVisibility,
      reviews,
      baliaHero,
      loading,
      refreshSettings: fetchAllSettings,
    }}>
      {loading ? (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#0C0C0C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '16px',
        }}>
          <div style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '22px', fontWeight: 700,
            letterSpacing: '0.2em', color: '#fff',
            textTransform: 'uppercase',
          }}>
            WM<span style={{ color: '#C6A87C' }}> Group</span>
          </div>
          <div style={{
            width: '48px', height: '2px', background: '#C6A87C',
            animation: 'wmPulse 1.2s ease-in-out infinite',
          }} />
          <style>{`@keyframes wmPulse { 0%,100% { opacity:.3; transform:scaleX(.5) } 50% { opacity:1; transform:scaleX(1) } }`}</style>
        </div>
      ) : children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
