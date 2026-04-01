import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [allSettings, setAllSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAllSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/bulk`);
      const data = await res.json();
      setAllSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  const getSetting = useCallback((id) => allSettings[id] || null, [allSettings]);

  const siteSettings = allSettings['site_settings'] || null;
  const heroSettings = allSettings['hero_settings'] || null;
  const aboutSettings = allSettings['about_settings'] || null;
  const calculatorConfig = allSettings['calculator_config'] || null;
  const sectionOrder = allSettings['section_order'] || null;
  const sectionVisibility = allSettings['section_visibility'] || null;
  const reviews = allSettings['_reviews'] || [];
  const stockSaunas = allSettings['_stock_saunas'] || [];
  const catalogAvailable = allSettings['_catalog_available'] || false;
  const baliaHero = allSettings['balia_hero_settings'] || null;

  return (
    <SettingsContext.Provider value={{
      siteSettings,
      heroSettings,
      aboutSettings,
      calculatorConfig,
      sectionOrder,
      sectionVisibility,
      reviews,
      stockSaunas,
      catalogAvailable,
      baliaHero,
      loading,
      allSettings,
      getSetting,
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
