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

  // Helper to get any setting by its DB id
  const getSetting = useCallback((id) => allSettings[id] || null, [allSettings]);

  // Named accessors for backward compatibility
  const siteSettings = allSettings['site_settings'] || null;
  const heroSettings = allSettings['hero_settings'] || null;
  const aboutSettings = allSettings['about_settings'] || null;
  const calculatorConfig = allSettings['calculator_config'] || null;
  const sectionOrder = allSettings['section_order'] || null;
  const sectionVisibility = allSettings['section_visibility'] || null;
  const reviews = allSettings['_reviews'] || [];
  const baliaHero = (() => {
    // baliaHero was previously extracted from /api/balia/content
    // Try to get it from balia content settings if available
    const baliaContent = allSettings['balia_hero_settings'];
    return baliaContent || null;
  })();

  // Component-level settings available via getSetting()
  // e.g. getSetting('faq_settings'), getSetting('promo_banner'), etc.

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
      allSettings,
      getSetting,
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
