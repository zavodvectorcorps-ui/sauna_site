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
      {children}
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
