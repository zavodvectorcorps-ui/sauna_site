import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

export const Hero = () => {
  const { language, t } = useLanguage();
  const { heroSettings } = useSettings();

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    'Polska produkcja',
    'Gotowe w 5-10 dni',
    'Gwarancja 12 miesięcy',
  ];

  // Get translated title and subtitle from settings
  const getTitle = () => {
    if (!heroSettings) return t('hero.title');
    const key = `title_${language}`;
    return heroSettings[key] || heroSettings.title_pl || t('hero.title');
  };

  const getSubtitle = () => {
    if (!heroSettings) return t('hero.subtitle');
    const key = `subtitle_${language}`;
    return heroSettings[key] || heroSettings.subtitle_pl || t('hero.subtitle');
  };

  const backgroundImage = heroSettings?.background_image || 
    'https://images.unsplash.com/photo-1759302353458-3c617bfd428b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjB3b29kZW4lMjBzYXVuYSUyMGludGVyaW9yJTIwcGFub3JhbWljJTIwd2luZG93JTIwbmF0dXJlJTIwdmlld3xlbnwwfHx8fDE3NzA4NDMyODh8MA&ixlib=rb-4.1.0&q=85';

  // Overlay opacity: 0-100, default 80
  const overlayOpacity = heroSettings?.overlay_opacity ?? 80;
  const opFrom = Math.min(overlayOpacity + 10, 100) / 100;
  const opVia = overlayOpacity / 100;
  const opTo = Math.max(overlayOpacity - 40, 0) / 100;

  const bgPosition = heroSettings?.bg_position || 'center';

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Luxury wooden sauna"
          className="w-full h-full object-cover"
          style={{ objectPosition: bgPosition }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,${opFrom}), rgba(255,255,255,${opVia}), rgba(255,255,255,${opTo}))`,
          }}
        />
        {/* Top gradient for header readability */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-main relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#C6A87C]/30 px-4 py-2 mb-8 shadow-sm"
          >
            <span className="w-2 h-2 bg-[#C6A87C] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#C6A87C]">
              Premium Quality Since 2015
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight mb-6"
            data-testid="hero-title"
          >
            {getTitle()}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#595959] mb-8 leading-relaxed"
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
                <div className="w-5 h-5 bg-[#4A6741] flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-sm text-[#1A1A1A] font-medium">
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
              onClick={() => scrollToSection('#calculator')}
              className="btn-primary flex items-center gap-2 group"
            >
              {t('hero.cta_primary')}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
            <button
              data-testid="hero-cta-secondary"
              onClick={() => scrollToSection('#stock')}
              className="btn-secondary"
            >
              {t('hero.cta_secondary')}
            </button>
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
        <span className="text-xs text-[#8C8C8C] uppercase tracking-wider">
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
