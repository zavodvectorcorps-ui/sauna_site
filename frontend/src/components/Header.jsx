import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, changeLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#calculator', label: t('nav.calculator') },
    { href: '#gallery', label: t('nav.gallery') },
    { href: '#stock', label: t('nav.stock') },
    { href: '#reviews', label: t('nav.reviews') },
    { href: '#about', label: t('nav.about') },
    { href: '#contact', label: t('nav.contact') },
  ];

  const languages = ['PL', 'EN', 'RU'];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        data-testid="main-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass border-b border-black/5 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a
              href="#"
              data-testid="logo-link"
              className="flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="font-['Montserrat'] text-2xl font-bold text-[#1A1A1A] tracking-tight">
                WM<span className="text-[#C6A87C]">-</span>SAUNA
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-testid={`nav-link-${link.href.slice(1)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-sm font-medium text-[#595959] hover:text-[#C6A87C] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 border border-black/10 px-2 py-1">
                {languages.map((lang, index) => (
                  <React.Fragment key={lang}>
                    <button
                      data-testid={`lang-btn-${lang.toLowerCase()}`}
                      onClick={() => changeLanguage(lang.toLowerCase())}
                      className={`px-2 py-1 text-xs font-medium transition-colors duration-200 ${
                        language === lang.toLowerCase()
                          ? 'text-[#C6A87C]'
                          : 'text-[#595959] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {lang}
                    </button>
                    {index < languages.length - 1 && (
                      <span className="text-[#E5E5E5]">|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Phone */}
              <a
                href="tel:+48732099201"
                data-testid="phone-link"
                className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A] hover:text-[#C6A87C] transition-colors duration-200"
              >
                <Phone size={16} className="text-[#C6A87C]" />
                +48 732 099 201
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              data-testid="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#1A1A1A]"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden"
              data-testid="mobile-menu"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-black/5">
                  <span className="font-['Montserrat'] text-xl font-bold text-[#1A1A1A]">
                    WM<span className="text-[#C6A87C]">-</span>SAUNA
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-[#1A1A1A]"
                  >
                    <X size={24} />
                  </button>
                </div>

                <nav className="flex-1 p-6">
                  <div className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(link.href);
                        }}
                        className="text-lg font-medium text-[#1A1A1A] hover:text-[#C6A87C] transition-colors duration-200 py-2"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </nav>

                <div className="p-6 border-t border-black/5">
                  {/* Language Switcher Mobile */}
                  <div className="flex items-center gap-2 mb-6">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang.toLowerCase())}
                        className={`px-4 py-2 text-sm font-medium border transition-colors duration-200 ${
                          language === lang.toLowerCase()
                            ? 'border-[#C6A87C] text-[#C6A87C]'
                            : 'border-black/10 text-[#595959]'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  {/* Phone Mobile */}
                  <a
                    href="tel:+48732099201"
                    className="flex items-center justify-center gap-2 btn-primary w-full"
                  >
                    <Phone size={18} />
                    +48 732 099 201
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
