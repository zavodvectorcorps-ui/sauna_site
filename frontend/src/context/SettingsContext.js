import React, { useState, useEffect, createContext, useContext } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [heroSettings, setHeroSettings] = useState(null);
  const [aboutSettings, setAboutSettings] = useState(null);
  const [calculatorConfig, setCalculatorConfig] = useState(null);
  const [sectionOrder, setSectionOrder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      const [siteRes, heroRes, aboutRes, calcRes, sectionsRes, reviewsRes] = await Promise.all([
        fetch(`${API_URL}/api/settings/site`),
        fetch(`${API_URL}/api/settings/hero`),
        fetch(`${API_URL}/api/settings/about`),
        fetch(`${API_URL}/api/settings/calculator`),
        fetch(`${API_URL}/api/settings/sections`),
        fetch(`${API_URL}/api/reviews`),
      ]);

      setSiteSettings(await siteRes.json());
      setHeroSettings(await heroRes.json());
      setAboutSettings(await aboutRes.json());
      setCalculatorConfig(await calcRes.json());
      setSectionOrder(await sectionsRes.json());
      setReviews(await reviewsRes.json());
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
      reviews,
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
