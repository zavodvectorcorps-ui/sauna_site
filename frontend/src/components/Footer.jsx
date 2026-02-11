import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

export const Footer = () => {
  const { t } = useLanguage();
  const { siteSettings } = useSettings();

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { href: '#calculator', label: t('nav.calculator') },
    { href: '#gallery', label: t('nav.gallery') },
    { href: '#stock', label: t('nav.stock') },
    { href: '#reviews', label: t('nav.reviews') },
    { href: '#about', label: t('nav.about') },
    { href: '#contact', label: t('nav.contact') },
  ];

  const legalLinks = [
    { href: '/privacy', label: t('footer.privacy') },
    { href: '/cookies', label: t('footer.cookies') },
    { href: '/terms', label: t('footer.terms') },
  ];

  return (
    <footer
      data-testid="footer"
      className="bg-[#1A1A1A] text-white pt-16 pb-8"
    >
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block mb-6"
            >
              <span className="font-['Montserrat'] text-2xl font-bold text-white tracking-tight">
                WM<span className="text-[#C6A87C]">-</span>SAUNA
              </span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href={siteSettings?.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-[#C6A87C] transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={siteSettings?.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-[#C6A87C] transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={siteSettings?.youtube_url || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-[#C6A87C] transition-colors duration-200"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-6">{t('footer.links')}</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-white/60 text-sm hover:text-[#C6A87C] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-6">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/60 text-sm hover:text-[#C6A87C] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-6">{t('contact.title')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#C6A87C] flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">
                  {siteSettings?.address || 'ul. Boryny 3, 02-257 Warszawa'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#C6A87C] flex-shrink-0" />
                <a
                  href={`tel:${(siteSettings?.phone || '+48 732 099 201').replace(/\s/g, '')}`}
                  className="text-white/60 text-sm hover:text-[#C6A87C] transition-colors duration-200"
                >
                  {siteSettings?.phone || '+48 732 099 201'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#C6A87C] flex-shrink-0" />
                <a
                  href={`mailto:${siteSettings?.email || 'wmsauna@gmail.com'}`}
                  className="text-white/60 text-sm hover:text-[#C6A87C] transition-colors duration-200"
                >
                  {siteSettings?.email || 'wmsauna@gmail.com'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              {t('footer.copyright')}
            </p>
            <p className="text-white/40 text-sm">
              Made with passion in Poland
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
