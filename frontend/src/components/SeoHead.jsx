import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const SeoHead = () => {
  const { language } = useLanguage();
  const { siteSettings } = useSettings();
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/settings/seo`)
      .then(res => res.json())
      .then(data => setSeo(data))
      .catch(err => console.error('Error loading SEO settings:', err));
  }, []);

  if (!seo) return null;

  const lang = language.toLowerCase();
  const title = seo[`title_${lang}`] || seo.title_pl || 'WM-Sauna';
  const description = seo[`description_${lang}`] || seo.description_pl || '';
  const keywords = seo[`keywords_${lang}`] || seo.keywords_pl || '';
  const ogImage = seo.og_image || '';
  const canonical = seo.canonical_url || '';

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "WM-Sauna",
    description,
    url: canonical || (typeof window !== 'undefined' ? window.location.origin : ''),
    image: ogImage,
    telephone: siteSettings?.phone || "+48 732 099 201",
    email: siteSettings?.email || "wmsauna@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ul. Boryny 3",
      addressLocality: "Warszawa",
      postalCode: "02-257",
      addressCountry: "PL"
    },
    priceRange: "$$",
    openingHours: "Mo-Fr 09:00-17:45"
  });

  return (
    <Helmet
      title={title}
      htmlAttributes={{ lang: lang === 'en' ? 'en' : 'pl' }}
      meta={[
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:site_name', content: 'WM-Sauna' },
        { property: 'og:locale', content: lang === 'en' ? 'en_US' : 'pl_PL' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        ...(ogImage ? [
          { property: 'og:image', content: ogImage },
          { name: 'twitter:image', content: ogImage },
        ] : []),
      ]}
      link={canonical ? [{ rel: 'canonical', href: canonical }] : []}
      script={[{ type: 'application/ld+json', innerHTML: structuredData }]}
    />
  );
};
