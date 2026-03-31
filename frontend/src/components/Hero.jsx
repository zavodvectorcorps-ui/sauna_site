import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAutoTranslate } from '../context/AutoTranslateContext';
import { useSettings } from '../context/SettingsContext';
import { CatalogFormGate } from './CatalogFormGate';
import { resolveMediaUrl } from '../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Hero = () => {
  const { language, t } = useLanguage();
  const { tr } = useAutoTranslate();
  const { heroSettings, getSetting } = useSettings();
  const buttonConfig = getSetting('button_config');
  const [hasCatalog, setHasCatalog] = useState(false);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/catalog/info`).then(r => r.json()).then(d => setHasCatalog(d.available)).catch(() => {});
  }, []);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleButtonAction = (buttonId, fallbackAnchor) => {
    const btn = buttonConfig?.buttons?.[buttonId];
    const action = btn?.action || 'anchor';
    const target = btn?.target || fallbackAnchor;

    if (action === 'link' && target) {
      window.open(target, '_blank');
    } else if (action === 'form') {
      const el = document.getElementById(target === 'inquiry' ? 'calculator' : 'contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      scrollToSection(target);
    }
  };

  const getButtonText = (buttonId, fallbackKey) => {
    const btn = buttonConfig?.buttons?.[buttonId];
    if (btn) {
      const lang = language.toLowerCase();
      if (lang === 'en' && btn.text_en) return btn.text_en;
      if (btn.text_pl) return btn.text_pl;
    }
    return t(fallbackKey);
  };

  const defaultFeatures = ['Polska produkcja', 'Gotowe w 5-10 dni', 'Gwarancja 24 miesiące'];
  const features = (heroSettings?.features || defaultFeatures).map(f => tr(f));

  const getTitle = () => {
    if (!heroSettings) return t('hero.title');
    const key = `title_${language}`;
    // Use language-specific title from settings, or fall back to translation
    return heroSettings[key] || t('hero.title');
  };

  const getSubtitle = () => {
    if (!heroSettings) return t('hero.subtitle');
    const key = `subtitle_${language}`;
    // Use language-specific subtitle from settings, or fall back to translation
    return heroSettings[key] || t('hero.subtitle');
  };

  const backgroundImage = resolveMediaUrl(heroSettings?.background_image) || 
    'https://images.unsplash.com/photo-1759302353458-3c617bfd428b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjB3b29kZW4lMjBzYXVuYSUyMGludGVyaW9yJTIwcGFub3JhbWljJTIwd2luZG93JTIwbmF0dXJlJTIwdmlld3xlbnwwfHx8fDE3NzA4NDMyODh8MA&ixlib=rb-4.1.0&q=85';

  const overlayOpacity = heroSettings?.overlay_opacity ?? 80;
  const opFrom = Math.min(overlayOpacity + 10, 100) / 100;
  const opVia = overlayOpacity / 100;
  const opTo = Math.max(overlayOpacity - 40, 0) / 100;
  const bgPosition = heroSettings?.bg_position || 'center';
  const textColor = heroSettings?.text_color || '#1A1A1A';

  const bgMode = heroSettings?.bg_mode || 'photo';
  const backgroundVideo = resolveMediaUrl(heroSettings?.background_video);
  const useVideo = bgMode === 'video' && backgroundVideo;

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* Photo (always rendered as fallback) */}
        <img
          src={backgroundImage}
          alt="Luxury wooden sauna"
          className={`w-full h-full object-cover transition-opacity duration-1000 ${useVideo && videoReady ? 'opacity-0 absolute inset-0' : ''}`}
          style={{ objectPosition: bgPosition }}
        />
        {/* Video overlay */}
        {useVideo && (
          <video
            ref={videoRef}
            src={backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ objectPosition: bgPosition }}
            data-testid="hero-bg-video"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,${opFrom}), rgba(255,255,255,${opVia}), rgba(255,255,255,${opTo}))`,
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-main relative z-10">
        <div className="max-w-2xl">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: textColor }}
            data-testid="hero-title"
          >
            {getTitle()}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg mb-8 leading-relaxed"
            style={{ color: textColor, opacity: 0.75 }}
            data-testid="hero-subtitle"
          >
            {getSubtitle()}
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#C6A87C] flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-sm font-medium" style={{ color: textColor }}>
                  {feature}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <button
              data-testid="hero-cta-primary"
              onClick={() => handleButtonAction('hero_primary', '#calculator')}
              className="btn-primary flex items-center gap-2 group"
            >
              {getButtonText('hero_primary', 'hero.cta_primary')}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
            <button
              data-testid="hero-cta-secondary"
              onClick={() => handleButtonAction('hero_secondary', '#stock')}
              className="bg-[#1A1A1A] text-white px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors"
            >
              {getButtonText('hero_secondary', 'hero.cta_secondary')}
            </button>
            {hasCatalog && (
              <CatalogFormGate
                testId="hero-catalog-btn"
                className="flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                <Download size={16} />
                {language === 'EN' ? 'Download catalog' : 'Pobierz katalog'}
              </CatalogFormGate>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-wider" style={{ color: textColor, opacity: 0.5 }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-[#C6A87C] rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-[#C6A87C] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};
